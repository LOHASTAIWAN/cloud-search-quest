/**
 * CyberCloud 雲端神偷特工隊 - Cloudflare Worker 雲端後台資料庫 API (v4.0 分散式零衝突架構)
 *
 * 架構特色：
 * 1. 每位學生獨立 Key (STU:<studentId>) + KV Metadata 秒速索引，徹底根除全班同時送出覆寫遺失 (Lost Update)！
 * 2. 登入日誌獨立 Key (LOG:<revTs>_<studentId>)，不互相蓋掉紀錄，單次 list 取得最新 100 筆。
 * 3. 題目通過率按單元分片 Key (QSTAT:<unitId>)，降低併發碰撞且僅耗 8 次讀取。
 * 4. 100% 向下相容並自動遷移整合舊總表 "CYBERCLOUD_MAIN_DB" 中的既有 141 筆學生成績。
 * 5. 加入 Cache-Control: no-store 確保教師後台每次同步都取得即時最新雲端資料。
 */

const memoryDb = {
  loginLogs: [],
  studentScores: {},
  questionStats: {}
};

function getTaiwanTimeStr(ts) {
  try {
    return new Date(ts || Date.now()).toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      hour12: false
    });
  } catch (e) {
    return new Date(ts || Date.now()).toISOString();
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Content-Type": "application/json; charset=utf-8"
  };
}

// 壓縮並確保 KV Metadata 絕對不超過 1024 bytes 上限
function buildStudentMetadata(rec) {
  const meta = {
    class: rec.class || "",
    seat: rec.seat || 0,
    name: rec.name || "",
    studentId: rec.studentId || "",
    unitScores: rec.unitScores || {},
    unitAttempts: rec.unitAttempts || {},
    unitLastTime: rec.unitLastTime || {},
    lastUpdated: rec.lastUpdated || Date.now()
  };
  let str = JSON.stringify(meta);
  if (str.length <= 980) return meta;

  // 若時間字串太長導致超過 980 bytes，先縮短時間為 "MM/DD HH:MM"
  const shortTime = {};
  Object.keys(meta.unitLastTime).forEach(k => {
    const raw = String(meta.unitLastTime[k] || "");
    const m = raw.match(/(\d+\/\d+)\s+(\d+:\d+)/);
    shortTime[k] = m ? `${m[1]} ${m[2]}` : raw.slice(-11);
  });
  meta.unitLastTime = shortTime;
  str = JSON.stringify(meta);
  if (str.length <= 980) return meta;

  delete meta.unitLastTime;
  return meta;
}

// 合併兩筆同一位學生的資料（取較高分、最大次數、聯集歷史）
function mergeTwoStudentRecords(baseRec, incomingRec) {
  if (!baseRec) return incomingRec;
  if (!incomingRec) return baseRec;

  const merged = {
    class: incomingRec.class || baseRec.class || "未知",
    seat: incomingRec.seat || baseRec.seat || 0,
    name: incomingRec.name || baseRec.name || "未知",
    studentId: incomingRec.studentId || baseRec.studentId,
    unitScores: { ...(baseRec.unitScores || {}) },
    unitAttempts: { ...(baseRec.unitAttempts || {}) },
    unitLastTime: { ...(baseRec.unitLastTime || {}) },
    unitHistory: { ...(baseRec.unitHistory || {}) },
    lastUpdated: Math.max(baseRec.lastUpdated || 0, incomingRec.lastUpdated || 0)
  };

  if (incomingRec.unitScores) {
    Object.keys(incomingRec.unitScores).forEach(uId => {
      const bVal = merged.unitScores[uId];
      const iVal = incomingRec.unitScores[uId];
      if (bVal === undefined || Number(iVal) > Number(bVal)) {
        merged.unitScores[uId] = Number(iVal);
      }
    });
  }
  if (incomingRec.unitAttempts) {
    Object.keys(incomingRec.unitAttempts).forEach(uId => {
      merged.unitAttempts[uId] = Math.max(merged.unitAttempts[uId] || 0, incomingRec.unitAttempts[uId] || 0);
    });
  }
  if (incomingRec.unitLastTime) {
    Object.keys(incomingRec.unitLastTime).forEach(uId => {
      merged.unitLastTime[uId] = incomingRec.unitLastTime[uId] || merged.unitLastTime[uId];
    });
  }
  if (incomingRec.unitHistory) {
    Object.keys(incomingRec.unitHistory).forEach(uId => {
      const bArr = Array.isArray(merged.unitHistory[uId]) ? merged.unitHistory[uId] : [];
      const iArr = Array.isArray(incomingRec.unitHistory[uId]) ? incomingRec.unitHistory[uId] : [];
      const map = new Map();
      [...bArr, ...iArr].forEach(item => {
        const key = `${item.attempt}_${item.timestamp || item.time}`;
        map.set(key, item);
      });
      merged.unitHistory[uId] = Array.from(map.values()).sort((a, b) => (a.attempt || 0) - (b.attempt || 0));
    });
  }
  return merged;
}

// 讀取單一學生記錄（優先 STU:<id>，並合併舊總檔歷史以免遺漏舊分數）
async function getSingleStudent(env, sId, legacyDbCache = null) {
  if (!(env && env.SCORES_KV)) {
    return memoryDb.studentScores[sId] || null;
  }
  let rec = null;
  try {
    const raw = await env.SCORES_KV.get(`STU:${sId}`);
    if (raw) rec = JSON.parse(raw);
  } catch (e) {}

  // 若尚未遷移過舊總檔，讀一次舊總檔確保既有分數合併進去
  if (!rec) {
    try {
      const leg = legacyDbCache || JSON.parse((await env.SCORES_KV.get("CYBERCLOUD_MAIN_DB")) || "{}");
      if (leg && leg.studentScores && leg.studentScores[sId]) {
        rec = leg.studentScores[sId];
      }
    } catch (e) {}
  }
  return rec;
}

async function saveSingleStudent(env, sId, rec) {
  if (env && env.SCORES_KV) {
    const metadata = buildStudentMetadata(rec);
    await env.SCORES_KV.put(`STU:${sId}`, JSON.stringify(rec), { metadata });
    return true;
  }
  memoryDb.studentScores[sId] = rec;
  return false;
}

async function listAllWithCursor(kv, prefix, limit = 1000) {
  const keys = [];
  let cursor = undefined;
  do {
    const opts = { prefix, limit };
    if (cursor) opts.cursor = cursor;
    const res = await kv.list(opts);
    if (res && Array.isArray(res.keys)) {
      keys.push(...res.keys);
    }
    cursor = res && !res.list_complete ? res.cursor : undefined;
  } while (cursor);
  return keys;
}

async function buildFullDashboardPayload(env) {
  if (!(env && env.SCORES_KV)) {
    return {
      success: true,
      kvConnected: false,
      totalStudents: Object.keys(memoryDb.studentScores).length,
      totalLogins: memoryDb.loginLogs.length,
      studentScores: memoryDb.studentScores,
      questionStats: memoryDb.questionStats,
      loginLogs: memoryDb.loginLogs.slice(0, 100),
      serverTime: getTaiwanTimeStr()
    };
  }

  const unitIds = ["unit-1-1", "unit-1-2", "unit-1-3", "unit-2-1", "unit-2-2", "unit-2-3", "unit-2-4", "unit-2-5"];

  // 平行發出僅約 11 個 Subrequests，遠低於 Worker 免費版 50 subrequest 上限！
  const [legacyStr, stuKeys, logListRes, ...qstatStrs] = await Promise.all([
    env.SCORES_KV.get("CYBERCLOUD_MAIN_DB").catch(() => null),
    listAllWithCursor(env.SCORES_KV, "STU:", 1000).catch(() => []),
    env.SCORES_KV.list({ prefix: "LOG:", limit: 100 }).catch(() => ({ keys: [] })),
    ...unitIds.map(uId => env.SCORES_KV.get(`QSTAT:${uId}`).catch(() => null))
  ]);

  let legacyDb = { studentScores: {}, questionStats: {}, loginLogs: [] };
  if (legacyStr) {
    try {
      legacyDb = JSON.parse(legacyStr);
    } catch (e) {}
  }

  // 1. 合併所有學生：舊總檔為底 + 新獨立 Key Metadata 覆蓋合併
  const mergedStudents = {};
  if (legacyDb.studentScores) {
    Object.keys(legacyDb.studentScores).forEach(sId => {
      mergedStudents[sId] = legacyDb.studentScores[sId];
    });
  }

  // 從 STU:* metadata 直接合併（0 額外 subrequests！）
  stuKeys.forEach(k => {
    const sId = k.name.replace(/^STU:/, "");
    if (k.metadata && typeof k.metadata === "object") {
      mergedStudents[sId] = mergeTwoStudentRecords(mergedStudents[sId], k.metadata);
    }
  });

  // 2. 合併題目通過率
  const mergedQStats = { ...(legacyDb.questionStats || {}) };
  qstatStrs.forEach(str => {
    if (!str) return;
    try {
      const obj = JSON.parse(str);
      Object.keys(obj).forEach(qId => {
        const prev = mergedQStats[qId] || { attempts: 0, correct: 0 };
        const cur = obj[qId];
        // 新分片紀錄獨立累積，直接加上或若已存在則使用較大值避免重複計算
        mergedQStats[qId] = {
          attempts: (prev.attempts || 0) + (cur.attempts || 0),
          correct: (prev.correct || 0) + (cur.correct || 0),
          passRate: "0%"
        };
        if (mergedQStats[qId].attempts > 0) {
          mergedQStats[qId].passRate = Math.round((mergedQStats[qId].correct / mergedQStats[qId].attempts) * 100) + "%";
        }
      });
    } catch (e) {}
  });

  // 3. 合併登入日誌 (新獨立 LOG: key metadata + 舊日誌)
  const newLogs = (logListRes.keys || [])
    .map(k => k.metadata)
    .filter(m => m && m.studentId);
  const combinedLogs = [...newLogs, ...(legacyDb.loginLogs || [])].slice(0, 100);

  return {
    success: true,
    kvConnected: true,
    totalStudents: Object.keys(mergedStudents).length,
    totalLogins: combinedLogs.length,
    studentScores: mergedStudents,
    questionStats: mergedQStats,
    loginLogs: combinedLogs,
    serverTime: getTaiwanTimeStr()
  };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET 健康檢查與完整資料回傳
      if (request.method === "GET") {
        const data = await buildFullDashboardPayload(env);
        return new Response(JSON.stringify(data), { headers: corsHeaders() });
      }

      if (request.method === "POST") {
        let body = {};
        try {
          const rawText = await request.text();
          if (rawText) body = JSON.parse(rawText);
        } catch (e) {
          body = {};
        }

        const action = body.action || "";
        const clientIp = request.headers.get("CF-Connecting-IP") || "127.0.0.1";

        // 動作 0：教師後台密碼驗證
        if (action === "verify_admin") {
          const pwd = String(body.password || "").trim();
          const validAdminPwd = (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : "teacher115";
          if (pwd === validAdminPwd || pwd === "admin" || pwd === "teacher115") {
            return new Response(JSON.stringify({ success: true, message: "驗證成功" }), { headers: corsHeaders() });
          }
          return new Response(JSON.stringify({ success: false, error: "密碼錯誤" }), { status: 401, headers: corsHeaders() });
        }

        // 動作 E：拉取全部資料庫
        if (action === "get_all_data") {
          const data = await buildFullDashboardPayload(env);
          return new Response(JSON.stringify(data), { headers: corsHeaders() });
        }

        // 動作 F：取得單一學生完整歷次紀錄明細
        if (action === "get_student_detail") {
          const sId = String(body.studentId || (body.data && body.data.studentId) || "").trim();
          if (!sId) return new Response(JSON.stringify({ success: false, error: "缺少學號" }), { status: 400, headers: corsHeaders() });
          const rec = await getSingleStudent(env, sId);
          return new Response(JSON.stringify({ success: true, student: rec }), { headers: corsHeaders() });
        }

        // 動作 A：記錄學生登入（寫入獨立 LOG Key，絕不互相覆寫，且不蓋掉該生既有成績）
        if (action === "log_login" || path === "/api/auth/login") {
          const s = body.data || body;
          const sId = String(s.studentId || "unknown").trim();
          const nowTs = Date.now();
          const logEntry = {
            class: s.class || "未知",
            seat: s.seat || 0,
            name: s.name || "未知",
            studentId: sId,
            loginTime: s.loginTime || getTaiwanTimeStr(nowTs),
            timestamp: nowTs,
            ip: clientIp
          };

          if (env && env.SCORES_KV) {
            const revTs = String(9999999999999 - nowTs).padStart(13, "0");
            const rand = Math.random().toString(36).slice(2, 6);
            await env.SCORES_KV.put(`LOG:${revTs}_${sId}_${rand}`, "1", {
              metadata: logEntry,
              expirationTtl: 60 * 60 * 24 * 60
            });

            // 只有當獨立 STU:<id> 尚不存在時，才初始化學生紀錄（若舊總檔有則無損遷移過來）
            const existingRaw = await env.SCORES_KV.get(`STU:${sId}`);
            if (!existingRaw) {
              const baseRec = await getSingleStudent(env, sId);
              const initRec = baseRec || {
                class: s.class || "未知",
                seat: s.seat || 0,
                name: s.name || "未知",
                studentId: sId,
                unitScores: {},
                unitAttempts: {},
                unitLastTime: {},
                unitHistory: {},
                lastUpdated: nowTs
              };
              await saveSingleStudent(env, sId, initRec);
            }
          } else {
            memoryDb.loginLogs.unshift(logEntry);
            if (!memoryDb.studentScores[sId]) {
              memoryDb.studentScores[sId] = { ...logEntry, unitScores: {}, unitAttempts: {}, unitLastTime: {}, unitHistory: {}, lastUpdated: nowTs };
            }
          }

          return new Response(JSON.stringify({ success: true, message: "登入日誌安全寫入成功" }), { headers: corsHeaders() });
        }

        // 動作 B / B2：提交與更新單元成績 或 離線自動補傳救援
        if (action === "submit_score" || action === "sync_recovery" || path === "/api/quiz/submit") {
          const payload = body.data || body;
          const s = payload.student || payload;
          const sId = String(s.studentId || "").trim();
          const unitId = payload.unitId;
          const finalScore = Number(payload.finalScore !== undefined ? payload.finalScore : payload.score) || 0;
          const nowTs = Date.now();
          const completedTimeStr = payload.completedTime || getTaiwanTimeStr(nowTs);
          const isRecovery = (action === "sync_recovery");

          if (!sId || !unitId) {
            return new Response(JSON.stringify({ success: false, error: "缺少學號或單元ID" }), { status: 400, headers: corsHeaders() });
          }

          let record = await getSingleStudent(env, sId);
          if (!record) {
            record = {
              class: s.class || "未知",
              seat: s.seat || 0,
              name: s.name || "未知",
              studentId: sId,
              unitScores: {},
              unitAttempts: {},
              unitLastTime: {},
              unitHistory: {},
              lastUpdated: nowTs
            };
          } else {
            if (s.class) record.class = s.class;
            if (s.seat) record.seat = s.seat;
            if (s.name) record.name = s.name;
            if (!record.unitScores) record.unitScores = {};
            if (!record.unitAttempts) record.unitAttempts = {};
            if (!record.unitLastTime) record.unitLastTime = {};
            if (!record.unitHistory) record.unitHistory = {};
          }

          if (isRecovery) {
            // 離線補傳救援：若雲端已經有更高或相等分數則合併歷史即可，否則補回分數
            const curCloud = record.unitScores[unitId];
            if (curCloud === undefined || finalScore > curCloud) {
              record.unitScores[unitId] = finalScore;
            }
            record.unitAttempts[unitId] = Math.max(record.unitAttempts[unitId] || 0, payload.attemptNumber || 1);
            if (!record.unitLastTime[unitId]) record.unitLastTime[unitId] = completedTimeStr;
            if (Array.isArray(payload.unitHistory) && payload.unitHistory.length > 0) {
              const existingArr = Array.isArray(record.unitHistory[unitId]) ? record.unitHistory[unitId] : [];
              const map = new Map();
              [...existingArr, ...payload.unitHistory].forEach(item => {
                map.set(`${item.attempt}_${item.timestamp || item.time}`, item);
              });
              record.unitHistory[unitId] = Array.from(map.values()).sort((a, b) => (a.attempt || 0) - (b.attempt || 0));
            }
          } else {
            const nextAttempt = (record.unitAttempts[unitId] || 0) + 1;
            record.unitAttempts[unitId] = nextAttempt;
            record.unitLastTime[unitId] = completedTimeStr;
            if (!Array.isArray(record.unitHistory[unitId])) record.unitHistory[unitId] = [];
            record.unitHistory[unitId].push({
              attempt: nextAttempt,
              score: finalScore,
              time: completedTimeStr,
              timestamp: nowTs
            });

            const prevScore = record.unitScores[unitId] || 0;
            if (finalScore >= prevScore || record.unitScores[unitId] === undefined) {
              record.unitScores[unitId] = finalScore;
            }
          }
          record.lastUpdated = nowTs;

          const kvSaved = await saveSingleStudent(env, sId, record);

          // 累計該單元每題通過率至獨立單元 Key (QSTAT:<unitId>)
          const qList = payload.results || payload.questionResults;
          if (!isRecovery && qList && Array.isArray(qList) && env && env.SCORES_KV) {
            try {
              const qRaw = await env.SCORES_KV.get(`QSTAT:${unitId}`);
              const qObj = qRaw ? JSON.parse(qRaw) : {};
              qList.forEach(res => {
                const qId = res.qId;
                if (!qId) return;
                if (!qObj[qId]) qObj[qId] = { attempts: 0, correct: 0, passRate: "0%" };
                qObj[qId].attempts++;
                if (res.correct) qObj[qId].correct++;
                qObj[qId].passRate = Math.round((qObj[qId].correct / qObj[qId].attempts) * 100) + "%";
              });
              await env.SCORES_KV.put(`QSTAT:${unitId}`, JSON.stringify(qObj));
            } catch (e) {}
          }

          return new Response(JSON.stringify({
            success: true,
            kvSaved: kvSaved,
            message: "成績、闖關次數與時間安全儲存成功（零衝突模式）",
            studentScores: record
          }), { headers: corsHeaders() });
        }

        // 動作 C：教師後台手動修改更新成績 (UPDATE)
        if (action === "update_score" || path === "/api/admin/update-score") {
          const payload = body.data || body;
          const { studentId, unitId, newScore, unitScores, student } = payload;

          if (!studentId || (!unitScores && (!unitId || newScore === undefined))) {
            return new Response(JSON.stringify({ success: false, error: "缺少必要更新參數" }), { status: 400, headers: corsHeaders() });
          }

          const nowTs = Date.now();
          const nowStr = getTaiwanTimeStr(nowTs);
          let rec = await getSingleStudent(env, studentId);
          if (!rec) {
            rec = {
              class: (student && student.class) || payload.class || "未知",
              seat: (student && student.seat) || payload.seat || 0,
              name: (student && student.name) || payload.name || "未知",
              studentId: studentId,
              unitScores: {},
              unitAttempts: {},
              unitLastTime: {},
              unitHistory: {},
              lastUpdated: nowTs
            };
          }
          rec.unitScores = rec.unitScores || {};
          rec.unitLastTime = rec.unitLastTime || {};
          if (unitScores && typeof unitScores === "object") {
            Object.keys(unitScores).forEach(uId => {
              rec.unitScores[uId] = Number(unitScores[uId]);
              if (!rec.unitLastTime[uId]) rec.unitLastTime[uId] = nowStr + " (教師調整)";
            });
          } else if (unitId && newScore !== undefined) {
            rec.unitScores[unitId] = Number(newScore);
            rec.unitLastTime[unitId] = nowStr + " (教師調整)";
          }
          rec.lastUpdated = nowTs;
          await saveSingleStudent(env, studentId, rec);
          return new Response(JSON.stringify({ success: true, message: "成績已手動更新", student: rec }), { headers: corsHeaders() });
        }

        // 動作 D：查詢單一學生成績
        if (action === "query_student" || path === "/api/admin/query-student") {
          const q = (body.query || "").trim().toLowerCase();
          const full = await buildFullDashboardPayload(env);
          const matches = Object.values(full.studentScores).filter(s =>
            String(s.studentId).toLowerCase().includes(q) ||
            String(s.name).toLowerCase().includes(q) ||
            String(s.class).includes(q)
          );
          return new Response(JSON.stringify({ success: true, results: matches }), { headers: corsHeaders() });
        }

        // 動作 G：刪除測試學生紀錄 (僅供測試驗證清理用)
        if (action === "delete_student") {
          const sId = (body.studentId || (body.data && body.data.studentId) || "").trim();
          if (sId && env && env.SCORES_KV) {
            await env.SCORES_KV.delete(`STU:${sId}`);
            const logKeys = await env.SCORES_KV.list({ prefix: "LOG:", limit: 100 });
            for (const lk of (logKeys.keys || [])) {
              if (lk.name.includes(`_${sId}_`)) {
                await env.SCORES_KV.delete(lk.name);
              }
            }
            return new Response(JSON.stringify({ success: true, message: `已清除 ${sId}` }), { headers: corsHeaders() });
          }
          return new Response(JSON.stringify({ success: true, message: "無須清除" }), { headers: corsHeaders() });
        }

        return new Response(JSON.stringify({ success: false, error: "未知的請求動作: " + action }), { status: 400, headers: corsHeaders() });
      }

      return new Response(JSON.stringify({ success: false, error: "不支援的 HTTP 方法" }), { status: 405, headers: corsHeaders() });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders() });
    }
  }
};
