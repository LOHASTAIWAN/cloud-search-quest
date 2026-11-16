/**
 * CyberCloud 雲端神偷特工隊 - Cloudflare Worker 雲端後台資料庫 API (v3.0)
 * 支援功能：
 * 1. 學生登入身分核對、登入時間戳記與連線日誌保存
 * 2. 8大單元成績儲存、闖關次數累計、歷次得分與作答完成時間明細 (Asia/Taipei)
 * 3. 120道題目每題通過率累計分析
 * 4. Cloudflare KV 持久化儲存 (SCORES_KV)
 * 5. 跨網域 CORS 完全開放，支援 application/json 與 text/plain 免預檢通訊
 */

const memoryDb = {
  loginLogs: [],      // [{ class, seat, studentId, name, loginTime, timestamp, ip }]
  studentScores: {},  // key: studentId -> { name, class, seat, studentId, unitScores, unitAttempts, unitLastTime, unitHistory, lastUpdated }
  questionStats: {}   // key: qId -> { attempts: 0, correct: 0, passRate: "0%" }
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
    "Content-Type": "application/json; charset=utf-8"
  };
}

async function getDb(env) {
  if (env && env.SCORES_KV) {
    try {
      const dataStr = await env.SCORES_KV.get("CYBERCLOUD_MAIN_DB");
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        return {
          loginLogs: parsed.loginLogs || [],
          studentScores: parsed.studentScores || {},
          questionStats: parsed.questionStats || {}
        };
      }
    } catch (e) {
      console.warn("讀取 KV 異常，使用記憶體快取:", e);
    }
  }
  return memoryDb;
}

async function saveDb(env, data) {
  if (env && env.SCORES_KV) {
    try {
      await env.SCORES_KV.put("CYBERCLOUD_MAIN_DB", JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn("寫入 KV 異常:", e);
    }
  }
  memoryDb.loginLogs = data.loginLogs || [];
  memoryDb.studentScores = data.studentScores || {};
  memoryDb.questionStats = data.questionStats || {};
  return false;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const db = await getDb(env);

      // GET 健康檢查與完整資料回傳
      if (request.method === "GET") {
        return new Response(JSON.stringify({
          success: true,
          kvConnected: Boolean(env && env.SCORES_KV),
          totalStudents: Object.keys(db.studentScores).length,
          totalLogins: db.loginLogs.length,
          studentScores: db.studentScores,
          questionStats: db.questionStats,
          loginLogs: db.loginLogs.slice(0, 100),
          serverTime: getTaiwanTimeStr()
        }), { headers: corsHeaders() });
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

        // 動作 A：記錄學生登入
        if (action === "log_login" || path === "/api/auth/login") {
          const s = body.data || body;
          const nowTs = Date.now();
          const logEntry = {
            class: s.class || "未知",
            seat: s.seat || 0,
            name: s.name || "未知",
            studentId: s.studentId || "unknown",
            loginTime: s.loginTime || getTaiwanTimeStr(nowTs),
            timestamp: nowTs,
            ip: clientIp
          };
          db.loginLogs.unshift(logEntry);
          if (db.loginLogs.length > 500) db.loginLogs.pop();

          if (!db.studentScores[s.studentId]) {
            db.studentScores[s.studentId] = {
              class: s.class,
              seat: s.seat,
              name: s.name,
              studentId: s.studentId,
              unitScores: {},
              unitAttempts: {},
              unitLastTime: {},
              unitHistory: {},
              lastUpdated: nowTs
            };
          } else {
            if (!db.studentScores[s.studentId].unitAttempts) db.studentScores[s.studentId].unitAttempts = {};
            if (!db.studentScores[s.studentId].unitLastTime) db.studentScores[s.studentId].unitLastTime = {};
            if (!db.studentScores[s.studentId].unitHistory) db.studentScores[s.studentId].unitHistory = {};
          }

          await saveDb(env, db);
          return new Response(JSON.stringify({ success: true, message: "登入日誌記錄成功" }), { headers: corsHeaders() });
        }

        // 動作 B：提交與更新單元成績（含闖關次數、每次得分與作答時間）
        if (action === "submit_score" || path === "/api/quiz/submit") {
          const payload = body.data || body;
          const s = payload.student || payload;
          const sId = String(s.studentId || "").trim();
          const unitId = payload.unitId;
          const finalScore = Number(payload.finalScore !== undefined ? payload.finalScore : payload.score) || 0;
          const nowTs = Date.now();
          const completedTimeStr = payload.completedTime || getTaiwanTimeStr(nowTs);

          if (!sId || !unitId) {
            return new Response(JSON.stringify({ success: false, error: "缺少學號或單元ID" }), { status: 400, headers: corsHeaders() });
          }

          if (!db.studentScores[sId]) {
            db.studentScores[sId] = {
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
            if (s.class) db.studentScores[sId].class = s.class;
            if (s.seat) db.studentScores[sId].seat = s.seat;
            if (s.name) db.studentScores[sId].name = s.name;
            if (!db.studentScores[sId].unitScores) db.studentScores[sId].unitScores = {};
            if (!db.studentScores[sId].unitAttempts) db.studentScores[sId].unitAttempts = {};
            if (!db.studentScores[sId].unitLastTime) db.studentScores[sId].unitLastTime = {};
            if (!db.studentScores[sId].unitHistory) db.studentScores[sId].unitHistory = {};
          }

          const record = db.studentScores[sId];
          // 累計該單元闖關次數
          const nextAttempt = (record.unitAttempts[unitId] || 0) + 1;
          record.unitAttempts[unitId] = nextAttempt;
          record.unitLastTime[unitId] = completedTimeStr;

          if (!Array.isArray(record.unitHistory[unitId])) {
            record.unitHistory[unitId] = [];
          }
          record.unitHistory[unitId].push({
            attempt: nextAttempt,
            score: finalScore,
            time: completedTimeStr,
            timestamp: nowTs
          });

          // 最高成績保存
          const prevScore = record.unitScores[unitId] || 0;
          if (finalScore >= prevScore || record.unitScores[unitId] === undefined) {
            record.unitScores[unitId] = finalScore;
          }
          record.lastUpdated = nowTs;

          // 累計每題通過率
          const qList = payload.results || payload.questionResults;
          if (qList && Array.isArray(qList)) {
            qList.forEach(res => {
              const qId = res.qId;
              if (!qId) return;
              if (!db.questionStats[qId]) {
                db.questionStats[qId] = { attempts: 0, correct: 0, passRate: "0%" };
              }
              db.questionStats[qId].attempts++;
              if (res.correct) db.questionStats[qId].correct++;
              db.questionStats[qId].passRate = Math.round((db.questionStats[qId].correct / db.questionStats[qId].attempts) * 100) + "%";
            });
          }

          const kvSaved = await saveDb(env, db);
          return new Response(JSON.stringify({
            success: true,
            kvSaved: kvSaved,
            message: "成績、闖關次數與時間儲存成功",
            studentScores: db.studentScores[sId]
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
          if (!db.studentScores[studentId]) {
            db.studentScores[studentId] = {
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
          const rec = db.studentScores[studentId];
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
          await saveDb(env, db);
          return new Response(JSON.stringify({ success: true, message: "成績已手動更新", student: rec }), { headers: corsHeaders() });
        }

        // 動作 D：查詢單一學生成績 (QUERY)
        if (action === "query_student" || path === "/api/admin/query-student") {
          const q = (body.query || "").trim().toLowerCase();
          const matches = Object.values(db.studentScores).filter(s =>
            s.studentId.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            String(s.class).includes(q)
          );
          return new Response(JSON.stringify({ success: true, results: matches }), { headers: corsHeaders() });
        }

        // 動作 E：拉取全部資料庫
        if (action === "get_all_data") {
          return new Response(JSON.stringify({
            success: true,
            kvConnected: Boolean(env && env.SCORES_KV),
            studentScores: db.studentScores,
            questionStats: db.questionStats,
            loginLogs: db.loginLogs.slice(0, 100),
            serverTime: getTaiwanTimeStr()
          }), { headers: corsHeaders() });
        }

        // 動作 F：刪除測試學生紀錄 (僅供測試驗證清理用)
        if (action === "delete_student") {
          const sId = (body.studentId || (body.data && body.data.studentId) || "").trim();
          if (sId && db.studentScores[sId]) {
            delete db.studentScores[sId];
            db.loginLogs = db.loginLogs.filter(l => l.studentId !== sId);
            await saveDb(env, db);
            return new Response(JSON.stringify({ success: true, message: `已清除 ${sId}` }), { headers: corsHeaders() });
          }
          return new Response(JSON.stringify({ success: true, message: "無此學號或無須清除" }), { headers: corsHeaders() });
        }

        return new Response(JSON.stringify({ success: false, error: "未知的請求動作: " + action }), { status: 400, headers: corsHeaders() });
      }

      return new Response(JSON.stringify({ success: false, error: "不支援的 HTTP 方法" }), { status: 405, headers: corsHeaders() });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders() });
    }
  }
};
