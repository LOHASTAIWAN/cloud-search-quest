/**
 * CyberCloud 雲端神偷特工隊 - Google 試算表 (Google Apps Script) 免費後台資料庫
 * 
 * 💡 使用方式 (零成本、3分鐘搞定)：
 * 1. 打開 Google 雲端硬碟，建立一個新的「Google 試算表」命名為「115資訊科技學生測驗成績庫」。
 * 2. 點選頂部選單「擴充功能」➜「Apps Script」。
 * 3. 把本檔案全部程式碼複製貼上，覆蓋 Code.gs 的內容並按儲存。
 * 4. 點選右上角「部署」➜「新部署」。
 * 5. 類型選擇「網頁應用程式」，「誰可以存取」選擇「所有人 (Anyone)」，點選部署。
 * 6. 複製產生的「網頁應用程式網址」貼到本測驗系統右上角「教師後台」的資料庫設定中即大功告成！
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var json = JSON.parse(rawData);
    var action = json.action || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. 記錄學生登入
    if (action === "log_login") {
      var s = json.data || {};
      var sheet = getOrCreateSheet(ss, "登入日誌", ["登入時間", "班級", "座號", "姓名", "學號", "時間戳記"]);
      sheet.appendRow([
        s.loginTime || new Date().toLocaleString(),
        s.class || "",
        s.seat || "",
        s.name || "",
        s.studentId || "",
        new Date().getTime()
      ]);
      return responseJSON({ success: true, message: "登入已記錄至 Google 試算表" });
    }

    // 2. 記錄與更新單元成績
    if (action === "submit_score" || action === "update_score") {
      var d = json.data || {};
      var student = d.student || {};
      var sId = student.studentId || d.studentId || "";
      var unitId = d.unitId || "";
      var score = d.finalScore !== undefined ? d.finalScore : d.newScore;

      var sheet = getOrCreateSheet(ss, "學生成績總表", [
        "學號", "班級", "座號", "姓名", "單元1-1", "單元1-2", "單元1-3", "單元2-1", "單元2-2", "單元2-3", "單元2-4", "單元2-5", "平均成績", "最後更新"
      ]);

      // 檢查是否已存在該學生列
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).toLowerCase() === String(sId).toLowerCase()) {
          rowIndex = i + 1;
          break;
        }
      }

      // 欄位對應
      var unitCols = {
        "unit-1-1": 5, "unit-1-2": 6, "unit-1-3": 7,
        "unit-2-1": 8, "unit-2-2": 9, "unit-2-3": 10, "unit-2-4": 11, "unit-2-5": 12
      };

      if (rowIndex > 0) {
        // 更新現有學生
        if (unitCols[unitId]) {
          sheet.getRange(rowIndex, unitCols[unitId]).setValue(score);
        }
        sheet.getRange(rowIndex, 14).setValue(new Date().toLocaleString());
      } else {
        // 新增學生列
        var newRow = [
          sId, student.class || d.class || "", student.seat || d.seat || "", student.name || d.name || "",
          "", "", "", "", "", "", "", "", "", new Date().toLocaleString()
        ];
        if (unitCols[unitId]) {
          newRow[unitCols[unitId] - 1] = score;
        }
        sheet.appendRow(newRow);
      }

      return responseJSON({ success: true, message: "成績已儲存至 Google 試算表" });
    }

    // 3. 拉取全部資料庫
    if (action === "get_all_data") {
      var sheet = ss.getSheetByName("學生成績總表");
      var scoresObj = {};
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var r = 1; r < rows.length; r++) {
          var id = String(rows[r][0]);
          if (!id) continue;
          scoresObj[id] = {
            studentId: id,
            class: rows[r][1],
            seat: rows[r][2],
            name: rows[r][3],
            unitScores: {
              "unit-1-1": Number(rows[r][4]) || 0,
              "unit-1-2": Number(rows[r][5]) || 0,
              "unit-1-3": Number(rows[r][6]) || 0,
              "unit-2-1": Number(rows[r][7]) || 0,
              "unit-2-2": Number(rows[r][8]) || 0,
              "unit-2-3": Number(rows[r][9]) || 0,
              "unit-2-4": Number(rows[r][10]) || 0,
              "unit-2-5": Number(rows[r][11]) || 0
            }
          };
        }
      }
      return responseJSON({ success: true, studentScores: scoresObj });
    }

    return responseJSON({ success: false, error: "未知的請求動作" });

  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  return doPost(e);
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
