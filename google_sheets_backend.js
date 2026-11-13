/**
 * CyberCloud 雲端神偷特工隊 - Google 試算表 (Google Apps Script) 免費後台資料庫 (v5.2 強化版)
 * 
 * 💡 使用方式 (零成本、2分鐘部署)：
 * 1. 打開 Google 雲端硬碟，建立一個新的「Google 試算表」命名為「115資訊科技學生測驗成績庫」。
 * 2. 點選頂部選單「擴充功能」➜「Apps Script」。
 * 3. 把本檔案全部程式碼複製貼上，覆蓋 Code.gs 的內容並按儲存 (Ctrl + S)。
 * 4. 點選右上角「部署」➜「新增部署」。
 * 5. 類型選擇「網頁應用程式」，執行身分選「我」，「誰可以存取」務必選擇「所有人 (Anyone)」，點選部署。
 * 6. 複製產生的「網頁應用程式網址」（https://script.google.com/macros/s/.../exec），
 *    貼到測驗系統右上角「教師後台」的資料庫設定中，即可自動記錄、查詢、更新、同步全校成績！
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, error: "無有效的請求內容" });
    }
    var rawData = e.postData.contents;
    var json = JSON.parse(rawData);
    var action = json.action || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. 記錄學生登入
    if (action === "log_login") {
      var s = json.data || {};
      var sheet = getOrCreateSheet(ss, "登入日誌", ["登入時間", "班級", "座號", "姓名", "學號", "時間戳記"]);
      sheet.appendRow([
        s.loginTime || new Date().toLocaleString("zh-TW", { hour12: false }),
        s.class || "",
        s.seat || "",
        s.name || "",
        s.studentId || "",
        new Date().getTime()
      ]);
      return responseJSON({ success: true, message: "登入已記錄至 Google 試算表" });
    }

    // 2. 記錄與更新單元成績 (包含每題通過率統計)
    if (action === "submit_score" || action === "update_score") {
      var d = json.data || {};
      var student = d.student || {};
      var sId = String(student.studentId || d.studentId || "").trim();
      var unitId = d.unitId || "";
      var score = Number(d.finalScore !== undefined ? d.finalScore : d.newScore) || 0;

      if (!sId || !unitId) {
        return responseJSON({ success: false, error: "缺少學號或單元編號" });
      }

      var sheet = getOrCreateSheet(ss, "學生成績總表", [
        "學號", "班級", "座號", "姓名",
        "unit-1-1", "unit-1-2", "unit-1-3", "unit-2-1", "unit-2-2", "unit-2-3", "unit-2-4", "unit-2-5",
        "平均成績", "最後更新"
      ]);

      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toLowerCase() === sId.toLowerCase()) {
          rowIndex = i + 1;
          break;
        }
      }

      var unitCols = {
        "unit-1-1": 5, "unit-1-2": 6, "unit-1-3": 7,
        "unit-2-1": 8, "unit-2-2": 9, "unit-2-3": 10, "unit-2-4": 11, "unit-2-5": 12
      };

      var nowStr = new Date().toLocaleString("zh-TW", { hour12: false });

      if (rowIndex > 0) {
        if (unitCols[unitId]) {
          var colIdx = unitCols[unitId];
          var oldVal = data[rowIndex - 1][colIdx - 1];
          // submit_score 取最高分，update_score 教師手動修改則直接覆寫
          var finalVal = (action === "update_score" || oldVal === "") ? score : Math.max(Number(oldVal) || 0, score);
          sheet.getRange(rowIndex, colIdx).setValue(finalVal);
        }
        // 重新計算平均成績
        var updatedRow = sheet.getRange(rowIndex, 5, 1, 8).getValues()[0];
        var sum = 0, cnt = 0;
        for (var c = 0; c < 8; c++) {
          if (updatedRow[c] !== "" && !isNaN(Number(updatedRow[c]))) {
            sum += Number(updatedRow[c]);
            cnt++;
          }
        }
        sheet.getRange(rowIndex, 13).setValue(cnt > 0 ? Math.round(sum / cnt) : 0);
        sheet.getRange(rowIndex, 14).setValue(nowStr);
      } else {
        var newRow = [
          sId, student.class || d.class || "", student.seat || d.seat || "", student.name || d.name || "",
          "", "", "", "", "", "", "", "", score, nowStr
        ];
        if (unitCols[unitId]) {
          newRow[unitCols[unitId] - 1] = score;
        }
        sheet.appendRow(newRow);
      }

      // 累計每題通過率 (results || questionResults)
      var qResults = d.results || d.questionResults;
      if (qResults && Array.isArray(qResults)) {
        var qSheet = getOrCreateSheet(ss, "題目通過率", ["題號ID", "作答次數", "答對次數", "通過率"]);
        var qData = qSheet.getDataRange().getValues();
        var qMap = {};
        for (var r = 1; r < qData.length; r++) {
          qMap[String(qData[r][0])] = { row: r + 1, attempts: Number(qData[r][1]) || 0, correct: Number(qData[r][2]) || 0 };
        }
        for (var j = 0; j < qResults.length; j++) {
          var qr = qResults[j];
          if (!qr.qId) continue;
          if (qMap[qr.qId]) {
            var info = qMap[qr.qId];
            info.attempts += 1;
            if (qr.correct) info.correct += 1;
            var rate = Math.round((info.correct / info.attempts) * 100) + "%";
            qSheet.getRange(info.row, 2, 1, 3).setValues([[info.attempts, info.correct, rate]]);
          } else {
            var initCorrect = qr.correct ? 1 : 0;
            var initRate = (initCorrect * 100) + "%";
            qSheet.appendRow([qr.qId, 1, initCorrect, initRate]);
            qMap[qr.qId] = { row: qSheet.getLastRow(), attempts: 1, correct: initCorrect };
          }
        }
      }

      return responseJSON({ success: true, message: "成績與作答紀錄已儲存至 Google 試算表" });
    }

    // 3. 拉取全部資料庫
    if (action === "get_all_data") {
      var scoresObj = {};
      var sheet = ss.getSheetByName("學生成績總表");
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var r = 1; r < rows.length; r++) {
          var id = String(rows[r][0]).trim();
          if (!id) continue;
          var uScores = {};
          var unitKeys = ["unit-1-1", "unit-1-2", "unit-1-3", "unit-2-1", "unit-2-2", "unit-2-3", "unit-2-4", "unit-2-5"];
          for (var u = 0; u < unitKeys.length; u++) {
            if (rows[r][4 + u] !== "") {
              uScores[unitKeys[u]] = Number(rows[r][4 + u]) || 0;
            }
          }
          scoresObj[id] = {
            studentId: id,
            class: rows[r][1],
            seat: rows[r][2],
            name: rows[r][3],
            unitScores: uScores
          };
        }
      }

      var qStatsObj = {};
      var qSheet = ss.getSheetByName("題目通過率");
      if (qSheet) {
        var qRows = qSheet.getDataRange().getValues();
        for (var q = 1; q < qRows.length; q++) {
          var qId = String(qRows[q][0]).trim();
          if (!qId) continue;
          qStatsObj[qId] = {
            attempts: Number(qRows[q][1]) || 0,
            correct: Number(qRows[q][2]) || 0,
            passRate: String(qRows[q][3] || "0%")
          };
        }
      }

      var logsArr = [];
      var logSheet = ss.getSheetByName("登入日誌");
      if (logSheet) {
        var logRows = logSheet.getDataRange().getValues();
        var startIdx = Math.max(1, logRows.length - 100);
        for (var l = logRows.length - 1; l >= startIdx; l--) {
          logsArr.push({
            loginTime: String(logRows[l][0]),
            class: logRows[l][1],
            seat: logRows[l][2],
            name: logRows[l][3],
            studentId: String(logRows[l][4]),
            timestamp: Number(logRows[l][5]) || 0
          });
        }
      }

      return responseJSON({
        success: true,
        studentScores: scoresObj,
        questionStats: qStatsObj,
        loginLogs: logsArr
      });
    }

    return responseJSON({ success: false, error: "未知的請求動作: " + action });

  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return responseJSON({
    success: true,
    status: "CyberCloud Google Apps Script 資料庫 API 運行正常",
    timestamp: new Date().toISOString()
  });
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
