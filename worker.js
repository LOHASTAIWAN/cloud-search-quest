/**
 * CyberCloud 雲端神偷特工隊 - Cloudflare Worker 雲端後台資料庫 API (v2.0)
 * 支援功能：
 * 1. 學生登入身分核對、登入時間戳記與連線日誌保存
 * 2. 8大單元成績儲存、查詢、修改更新 (CRUD)
 * 3. 120道題目每題通過率累計分析
 * 4. 支援 Cloudflare KV 持久化儲存 (SCORES_KV)
 * 5. 跨網域 CORS 完全開放，支援前端 GitHub Pages 即時通訊
 */

// 記憶體備用資料庫 (若未綁定 KV 時自動使用記憶體快取)
const memoryDb = {
  loginLogs: [],      // [{ class, seat, studentId, name, loginTime, timestamp, ip }]
  studentScores: {},  // key: studentId -> { name, class, seat, studentId, unitScores: { [unitId]: score }, lastUpdated }
  questionStats: {}   // key: qId -> { attempts: 0, correct: 0, passRate: "0%" }
};

// 輔助：CORS 標頭
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Content-Type": "application/json; charset=utf-8"
  };
}

// 輔助：從 KV 或記憶體讀取資料
async function getDb(env) {
  if (env && env.SCORES_KV) {
    try {
      const dataStr = await env.SCORES_KV.get("CYBERCLOUD_MAIN_DB");
      if (dataStr) {
        return JSON.parse(dataStr);
      }
    } catch (e) {
      console.warn("讀取 KV 異常，使用記憶體快取:", e);
    }
  }
  return memoryDb;
}

// 輔助：儲存資料回 KV 或記憶體
async function saveDb(env, data) {
  if (env && env.SCORES_KV) {
    try {
      await env.SCORES_KV.put("CYBERCLOUD_MAIN_DB", JSON.stringify(data));
      return;
    } catch (e) {
      console.warn("寫入 KV 異常:", e);
    }
  }
  // 更新記憶體快取
  memoryDb.loginLogs = data.loginLogs || [];
  memoryDb.studentScores = data.studentScores || {};
  memoryDb.questionStats = data.questionStats || {};
}

export default {
  async fetch(request, env, ctx) {
    // 預檢請求 OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const db = await getDb(env);

      // -------------------------------------------------------------
      // API 路由 1：取得後台全部資料 (GET 或 POST action: get_all_data)
      // -------------------------------------------------------------
      if (request.method === "GET" && (path === "/api/data" || path === "/api/admin/dashboard" || path === "/")) {
        return new Response(JSON.stringify({
          success: true,
          totalStudents: Object.keys(db.studentScores).length,
          totalLogins: db.loginLogs.length,
          studentScores: db.studentScores,
          questionStats: db.questionStats,
          loginLogs: db.loginLogs.slice(0, 100), // 最新 100 筆
          serverTime: new Date().toISOString()
        }), { headers: corsHeaders() });
      }

      // -------------------------------------------------------------
      // API 路由 2：POST 請求 (支援 action 格式或 REST 格式)
      // -------------------------------------------------------------
      if (request.method === "POST") {
        let body = {};
        try {
          body = await request.json();
        } catch (e) {
          body = {};
        }

        const action = body.action || "";
        const clientIp = request.headers.get("CF-Connecting-IP") || "127.0.0.1";

        // 動作 A：記錄學生登入
        if (action === "log_login" || path === "/api/auth/login") {
          const s = body.data || body;
          const logEntry = {
            class: s.class || "未知",
            seat: s.seat || 0,
            name: s.name || "未知",
            studentId: s.studentId || "unknown",
            loginTime: s.loginTime || new Date().toLocaleString("zh-TW", { hour12: false }),
            timestamp: Date.now(),
            ip: clientIp
          };
          db.loginLogs.unshift(logEntry);
          if (db.loginLogs.length > 500) db.loginLogs.pop(); // 保留最新 500 筆

          // 若該學生尚無成績紀錄，建立基本資料
          if (!db.studentScores[s.studentId]) {
            db.studentScores[s.studentId] = {
              class: s.class,
              seat: s.seat,
              name: s.name,
              studentId: s.studentId,
              unitScores: {},
              lastUpdated: Date.now()
            };
          }

          await saveDb(env, db);
          return new Response(JSON.stringify({ success: true, message: "登入日誌記錄成功" }), { headers: corsHeaders() });
        }

        // 動作 B：提交與更新單元成績
        if (action === "submit_score" || path === "/api/quiz/submit") {
          const payload = body.data || body;
          const s = payload.student || payload;
          const sId = s.studentId;
          const unitId = payload.unitId;
          const finalScore = payload.finalScore !== undefined ? payload.finalScore : payload.score;

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
              lastUpdated: Date.now()
            };
          } else {
            if (s.class) db.studentScores[sId].class = s.class;
            if (s.seat) db.studentScores[sId].seat = s.seat;
            if (s.name) db.studentScores[sId].name = s.name;
          }

          // 取最高分或最新成績
          const prevScore = db.studentScores[sId].unitScores[unitId] || 0;
          if (finalScore >= prevScore) {
            db.studentScores[sId].unitScores[unitId] = finalScore;
          }
          db.studentScores[sId].lastUpdated = Date.now();

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

          await saveDb(env, db);
          return new Response(JSON.stringify({ success: true, message: "成績儲存成功", studentScores: db.studentScores[sId] }), { headers: corsHeaders() });
        }

        // 動作 C：教師後台手動修改更新成績 (UPDATE)
        if (action === "update_score" || path === "/api/admin/update-score") {
          const payload = body.data || body;
          const { studentId, unitId, newScore, student } = payload;

          if (!studentId || !unitId || newScore === undefined) {
            return new Response(JSON.stringify({ success: false, error: "缺少必要更新參數" }), { status: 400, headers: corsHeaders() });
          }

          if (!db.studentScores[studentId]) {
            db.studentScores[studentId] = {
              class: (student && student.class) || payload.class || "未知",
              seat: (student && student.seat) || payload.seat || 0,
              name: (student && student.name) || payload.name || "未知",
              studentId: studentId,
              unitScores: {},
              lastUpdated: Date.now()
            };
          }
          db.studentScores[studentId].unitScores[unitId] = Number(newScore);
          db.studentScores[studentId].lastUpdated = Date.now();
          await saveDb(env, db);
          return new Response(JSON.stringify({ success: true, message: "成績已手動更新", student: db.studentScores[studentId] }), { headers: corsHeaders() });
        }

        // 動作 D：查詢單一學生成績 (QUERY)
        if (action === "query_student" || path === "/api/admin/query-student") {
          const q = (body.query || "").trim().toLowerCase();
          const matches = Object.values(db.studentScores).filter(s => 
            s.studentId.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.class.includes(q)
          );
          return new Response(JSON.stringify({ success: true, results: matches }), { headers: corsHeaders() });
        }

        // 動作 E：拉取全部資料庫
        if (action === "get_all_data") {
          return new Response(JSON.stringify({
            success: true,
            studentScores: db.studentScores,
            questionStats: db.questionStats,
            loginLogs: db.loginLogs.slice(0, 100)
          }), { headers: corsHeaders() });
        }

        // 動作 F：清空資料庫 (需密碼保護)
        if (action === "clear_database" || path === "/api/admin/clear") {
          if (body.password === "teacher115") {
            db.studentScores = {};
            db.loginLogs = [];
            db.questionStats = {};
            await saveDb(env, db);
            return new Response(JSON.stringify({ success: true, message: "資料庫已重置清空" }), { headers: corsHeaders() });
          } else {
            return new Response(JSON.stringify({ success: false, error: "密碼錯誤" }), { status: 403, headers: corsHeaders() });
          }
        }
      }

      return new Response(JSON.stringify({ error: "找不到該 API 路由" }), { status: 404, headers: corsHeaders() });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
    }
  }
};
