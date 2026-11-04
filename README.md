# CyberCloud 雲端神偷特工隊 - 國中資訊科技 108 課綱互動闖關與雲端資料庫系統

> **國中資訊科技 108 課綱互動式評量闖關系統（8 大單元・120 道生活時事題 + 40 題 Google Docs 簡答學習單）**  
> 涵蓋國中資訊科技課本：  
> - **第一章 Ch2-1 雲端運算服務（單元 1-1 ~ 1-3，共 45 題）**  
> - **第二章 Ch2-2 資料與資訊應用專題（單元 2-1 ~ 2-5，共 75 題）**  
> - **配套資源：全 8 單元 Google Docs 專屬課堂探究簡答學習單（共 40 題，支援一鍵複製派發）**

🌐 **正式線上版公開網址**：[https://lohastaiwan.github.io/cloud-search-quest/](https://lohastaiwan.github.io/cloud-search-quest/)  
☁️ **正式雲端資料庫 API**：[https://cybercloud-backend.coral-desk.workers.dev](https://cybercloud-backend.coral-desk.workers.dev)  
📦 **GitHub 開源儲存庫**：[https://github.com/LOHASTAIWAN/cloud-search-quest](https://github.com/LOHASTAIWAN/cloud-search-quest)  
📑 **全域系統架構與維運指南**：詳見 [`ARCHITECTURE_AND_OPERATIONS.md`](./ARCHITECTURE_AND_OPERATIONS.md)

---

## 🌟 核心特色與功能模組

### 1. 學生身分檢核登入（預設空白，無預設假資料）
- 匯入學校 115 級中一 11 個班級、共 318 位學生正式名條（`students.json`）。
- 開啟網頁時，**班級、座號、姓名、學號 4 個欄位強制預設為空白**。
- 四欄位完全匹配學校名條後方可放行進入大廳，並即時將登入時間與日誌推播至雲端資料庫。

### 2. 8 大特訓單元題庫（共 120 題生活與時事題）
- 每單元 15 題（前 10 題為基礎核心題，每題 10 分，滿分 100 分；後 5 題為時事挑戰加分題，每題 5 分加分）。
- **防卡關機制**：
  - 第一題（U11-01）支援輸入單字 `T`、`Ctrl+Shift+T` 或在焦點框**直接按下實體組合鍵**自動通過。
  - 提示後若學生想不出答案，下方自動解鎖 **「⏭️ 我還是想不出來（查看正確解答並前進下一題）」** 按鈕，記 0 分不卡關。

### 3. 全套 Google Docs 5 題生活簡答學習單（共 40 題）
- 針對 8 大單元各設計 5 題深度思考簡答題（附情境引導、字數建議、評分規準 Rubrics 與參考解答）。
- 網頁右上角與單元卡片均設有快捷按鈕，支援 **「📋 一鍵複製成 Google Docs 格式」**，老師點擊後可一秒在 Google 文件貼上派發給學生！
- 完整學習單離線手冊見 [`Google_Docs_Worksheets.md`](./Google_Docs_Worksheets.md)。

### 4. 遠端雲端資料庫中心（記錄、查詢、更新、同步、備份）
- **後台入口**：點擊網頁右上角 **「教師後台」** 按鈕（密碼：`teacher115`）。
- **即時記錄 (Record)**：每次學生登入與完成單元挑戰，自動非同步寫入遠端資料庫。
- **智慧查詢 (Query)**：支援「班級下拉篩選」與「姓名/學號/座號即時搜尋框」，一秒調閱學生紀錄。
- **手動修改更新 (Update)**：每位學生右側均有「✏️ 修改成績」按鈕，老師可手動調整單元分數並同步寫回雲端。
- **雙向同步 (Sync)**：點擊「🔄 雲端同步最新數據」按鈕，立即匯聚全校各機最新成績。
- **斷網萬能備份 (Import/Export)**：
  - 「📤 備份資料庫 (JSON)」與「📥 匯入合併 (JSON)」：支援多台電腦離線隨身碟無損合併。
  - 「📊 匯出報表 (CSV)」：一鍵匯出 UTF-8 繁體中文全校總成績報表。

---

## 🏗️ 系統運作與架構簡介

本系統採用現代化 **Jamstack 前後端分離（Decoupled Microservices）** 架構：
- **前端展示層（GitHub Pages）**：提供極速靜態資源分發（HTML/CSS/JS）。
- **遠端運算與資料庫層（Cloudflare Worker）**：提供全球 Serverless API（端點：`https://cybercloud-backend.coral-desk.workers.dev`），負責資料持久化儲存與跨域 CORS 通訊。
- **資料庫詳細運作流程與全域維護 SOP**：請參閱 [`ARCHITECTURE_AND_OPERATIONS.md`](./ARCHITECTURE_AND_OPERATIONS.md)。
