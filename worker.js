/**
 * CyberCloud 雲端神搜特工隊 - Cloudflare Worker 後端服務
 * 功能：
 * 1. 學生班級座號姓名學號身份檢核與登入時間記錄
 * 2. 各單元成績儲存、完成時間統計
 * 3. 80道題目每題作答次數與通過率即時計算
 * 4. 教師後台儀表板 API 與 CSV 成績冊匯出
 */

// 記憶體快取或與 KV / D1 綁定
// 若綁定了 KV NAMESPACE: SCORES_KV，則優先存入 KV，否則回退至邊緣全域狀態
const globalData = {
  loginLogs: [],      // [{ studentId, name, class, seat, loginTime, ip }]
  scores: {},         // key: `${studentId}_${unitId}` -> { studentId, name, class, seat, unitId, score, timeSpent, submittedAt }
  questionStats: {}   // key: qId -> { qId, unitId, attempts: 0, correct: 0, passRate: "0%" }
};

// 處理 CORS 標頭
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };
}

export default {
  async fetch(request, env, ctx) {
    // 預檢請求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. 學生登入檢核與登入時間記錄 API
      if (path === "/api/auth/login" && request.method === "POST") {
        const body = await request.json();
        const { className, seat, name, studentId } = body;

        if (!className || !seat || !name || !studentId) {
          return new Response(JSON.stringify({ success: false, message: "班級、座號、姓名與學號皆為必填！" }), {
            status: 400,
            headers: corsHeaders()
          });
        }

        const loginRecord = {
          studentId: String(studentId).trim(),
          name: String(name).trim(),
          class: String(className).trim(),
          seat: Number(seat),
          loginTime: new Date().toISOString(),
          ip: request.headers.get("cf-connecting-ip") || "unknown"
        };

        // 寫入登入日誌
        globalData.loginLogs.push(loginRecord);

        // 如果綁定了 KV，持久化儲存
        if (env.SCORES_KV) {
          await env.SCORES_KV.put(`login_${loginRecord.studentId}_${Date.now()}`, JSON.stringify(loginRecord));
        }

        return new Response(JSON.stringify({
          success: true,
          message: "身分驗證通過，登入成功！",
          student: loginRecord
        }), { headers: corsHeaders() });
      }

      // 2. 單元成績提交與每題通過率累計 API
      if (path === "/api/scores/submit" && request.method === "POST") {
        const body = await request.json();
        const { studentId, name, className, seat, unitId, score, timeSpent, questionResults } = body;

        const scoreRecord = {
          studentId: String(studentId).trim(),
          name: String(name).trim(),
          class: String(className).trim(),
          seat: Number(seat),
          unitId: Number(unitId),
          score: Number(score),
          timeSpent: Number(timeSpent || 0),
          submittedAt: new Date().toISOString()
        };

        const scoreKey = `${scoreRecord.studentId}_U${scoreRecord.unitId}`;
        globalData.scores[scoreKey] = scoreRecord;

        // 更新每題通過率
        if (Array.isArray(questionResults)) {
          questionResults.forEach(item => {
            const qId = item.qId;
            if (!globalData.questionStats[qId]) {
              globalData.questionStats[qId] = {
                qId: qId,
                unitId: scoreRecord.unitId,
                attempts: 0,
                correct: 0,
                passRate: "0%"
              };
            }
            const st = globalData.questionStats[qId];
            st.attempts += 1;
            if (item.correct) st.correct += 1;
            st.passRate = ((st.correct / st.attempts) * 100).toFixed(1) + "%";
          });
        }

        // 持久化儲存至 KV
        if (env.SCORES_KV) {
          await env.SCORES_KV.put(`score_${scoreKey}`, JSON.stringify(scoreRecord));
          await env.SCORES_KV.put("global_question_stats", JSON.stringify(globalData.questionStats));
        }

        return new Response(JSON.stringify({
          success: true,
          message: "成績與作答數據已成功記錄至後台！",
          scoreRecord
        }), { headers: corsHeaders() });
      }

      // 3. 教師後台數據總覽 API (包含各單元成績與每題通過率)
      if (path === "/api/admin/overview" && request.method === "GET") {
        // 若有 KV，合併 KV 最新資料
        if (env.SCORES_KV) {
          const statsVal = await env.SCORES_KV.get("global_question_stats");
          if (statsVal) {
            globalData.questionStats = JSON.parse(statsVal);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          totalLogins: globalData.loginLogs.length,
          recentLogins: globalData.loginLogs.slice(-50).reverse(),
          scoresList: Object.values(globalData.scores),
          questionStats: globalData.questionStats,
          updatedAt: new Date().toISOString()
        }), { headers: corsHeaders() });
      }

      // 4. 教師後台匯出 CSV 成績單 API
      if (path === "/api/admin/export-csv" && request.method === "GET") {
        let csvContent = "\uFEFF班級,座號,學號,姓名,單元ID,得分,作答耗時(秒),提交時間\n";
        const scores = Object.values(globalData.scores);
        scores.forEach(s => {
          csvContent += `"${s.class}",${s.seat},"${s.studentId}","${s.name}",${s.unitId},${s.score},${s.timeSpent},"${s.submittedAt}"\n`;
        });

        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="cybercloud_student_scores.csv"',
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      // 預設健康檢查
      return new Response(JSON.stringify({
        status: "online",
        service: "CyberCloud Cloudflare Worker Backend",
        version: "2.0.0",
        message: "國中資訊科技 108 課綱互動闖關後台 API 服務運作中"
      }), { headers: corsHeaders() });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};
