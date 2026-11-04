# -*- coding: utf-8 -*-
"""
完整建置 8 大單元、120 道生活與時事題庫 (UTF-8 編碼)
符合國中資訊科技 108 課綱與教材 PPTX 內容
"""
import json

def get_all_units():
    # 載入前面 part1 的單元 1-1 與 1-2
    import make_dataset_part1
    units = list(make_dataset_part1.units)

    # ==========================================
    # 單元 1-3：【多媒體應用】雲端辦公三寶與影音線上協作
    # ==========================================
    u13 = {
        "unitId": "unit-1-3",
        "category": "第一章 雲端運算服務",
        "unitTitle": "單元 1-3：【多媒體應用】雲端辦公三寶與影音線上協作",
        "description": "熟悉 Google 文件、試算表、簡報與雲端多媒體工具生活應用。",
        "questions": [
            {
                "qId": "U13-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明要統計班上園遊會各攤位飲料訂單的「總金額」，他在儲存格中該使用哪一個標準加總函數？",
                "prompt": "在試算表軟體（如 Google Sheets 或 Excel）中，用來計算數值總和的英文函數名稱是？",
                "options": ["=SUM()", "=AVERAGE()", "=COUNT()", "=MAX()"],
                "answer": "=SUM()",
                "accepted": ["=SUM()", "SUM", "=sum()", "sum"],
                "hint": "英文 Summary（總和）的縮寫。",
                "explanation": "【函數公式】=SUM(A1:A10) 能快速將選取範圍內的數字全部相加求和。"
            },
            {
                "qId": "U13-02",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小華在輸入試算表公式時，直接輸入「SUM(B1:B5)」，結果儲存格只顯示這串文字，沒有計算出結果。",
                "prompt": "在試算表儲存格中，所有的公式或函數開頭都必須先輸入哪一個等號符號 [BLANK] 系統才會啟動運算？",
                "options": ["=", "+", "#", "@"],
                "answer": "=",
                "accepted": ["=", "等號", "等於"],
                "hint": "鍵盤右上方的等於符號。",
                "explanation": "【公式前綴】等號（=）告訴試算表「接下來是公式運算，不是純文字」。"
            },
            {
                "qId": "U13-03",
                "type": "choice",
                "level": "基礎",
                "scenario": "製作英文話劇簡報時，小美希望投影片能直接插入一段 YouTube 上的發音教學影片。",
                "prompt": "在 Google 簡報中插入線上 YouTube 影片的最佳途徑是？",
                "options": [
                    "點選「插入」➜「影片」，直接貼上 YouTube 連結或關鍵字搜尋並嵌入",
                    "用手機拍螢幕錄影後再把手機用膠帶黏在螢幕上",
                    "必須把整部影片全部下載為磁碟檔案才能放進去",
                    "在文字框裡默寫出整部影片的字幕"
                ],
                "answer": "點選「插入」➜「影片」，直接貼上 YouTube 連結或關鍵字搜尋並嵌入",
                "accepted": ["點選「插入」➜「影片」，直接貼上 YouTube 連結或關鍵字搜尋並嵌入"],
                "hint": "雲端簡報原生支援 YouTube 串流內嵌播放。",
                "explanation": "【雲端多媒體】Google 簡報能無縫內嵌 YouTube，播放順暢且不增加簡報檔案大小。"
            },
            {
                "qId": "U13-04",
                "type": "choice",
                "level": "基礎",
                "scenario": "導師想要快速蒐集全班 30 位同學在寒假想要參觀的博物館志願序。",
                "prompt": "使用哪一種雲端工具最適合設計線上問卷，並能自動將同學的回覆匯整到試算表？",
                "options": ["Google 表單（Google Forms）", "小畫家", "記事本", "計算機"],
                "answer": "Google 表單（Google Forms）",
                "accepted": ["Google 表單", "表單", "Google Forms", "Google 表單（Google Forms）"],
                "hint": "專門用來設計問卷調查、測驗券的線上工具。",
                "explanation": "【表單自動化】Google 表單能一鍵建立問卷，並將填答資料即時匯入試算表統計分析。"
            },
            {
                "qId": "U13-05",
                "type": "choice",
                "level": "基礎",
                "scenario": "志工隊在設計宣傳海報，需要透明背景的人物去背圖檔。",
                "prompt": "下列哪一種常見的影像格式支援「透明背景（Alpha 通道）」特性？",
                "options": ["PNG (.png)", "JPEG (.jpg)", "BMP (.bmp)", "MP3 (.mp3)"],
                "answer": "PNG (.png)",
                "accepted": ["PNG", ".png", "PNG (.png)"],
                "hint": "網頁去背圖片最常用的副檔名。",
                "explanation": "【圖檔特性】PNG 格式支援透明通道與非破壞性壓縮，適合網頁去背標誌與圖示。"
            },
            {
                "qId": "U13-06",
                "type": "cloze",
                "level": "基礎",
                "scenario": "在試算表中要計算全班段考成績的「平均分數」，應該使用哪一個函數？",
                "prompt": "試算表中用來計算數值平均值的英文函數為 =[BLANK]()？",
                "options": ["AVERAGE", "SUM", "COUNT", "MEDIAN"],
                "answer": "AVERAGE",
                "accepted": ["AVERAGE", "average", "=AVERAGE()", "=average()"],
                "hint": "英文單字「平均」。",
                "explanation": "【平均函數】=AVERAGE(範圍) 會將指定區間的總和除以項數得出平均值。"
            },
            {
                "qId": "U13-07",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明在編輯 Google 簡報時，想讓整份投影片所有頁面的「字體大小、標題顏色」一次統一調整。",
                "prompt": "小明應該善用 Google 簡報中的哪一項進階設計功能？",
                "options": ["母片（佈景主題版面配置）", "逐頁手動修改 50 次", "連續按鍵盤 Enter 鍵", "將電腦重新開機"],
                "answer": "母片（佈景主題版面配置）",
                "accepted": ["母片", "母片（佈景主題版面配置）", "佈景主題版面配置"],
                "hint": "就像大模具一樣，一處修改、全份投影片版面同步套用。",
                "explanation": "【母片觀念】修改「編輯主題母片」可以瞬間將統一設計樣式套用到全部投影片。"
            },
            {
                "qId": "U13-08",
                "type": "choice",
                "level": "基礎",
                "scenario": "國中生在網路上找免費音樂背景素材來剪輯生活日常 Vlog，必須遵守智慧財產權。",
                "prompt": "使用標註哪種授權條款的素材，可以在符合作者指定條件（如姓名標示）下合法免費使用？",
                "options": ["創用 CC（Creative Commons）", "完全不受任何法律管轄的暗網素材", "隨意下載任何最新付費流行歌曲", "版權所有翻印必究（All Rights Reserved）"],
                "answer": "創用 CC（Creative Commons）",
                "accepted": ["創用 CC", "Creative Commons", "創用 CC（Creative Commons）", "CC授權"],
                "hint": "四種常見標章：姓名標示、非商業性、禁止改作、相同方式分享。",
                "explanation": "【創用 CC】Creative Commons 提供彈性著作權授權標準，是創作者的合法素材寶庫。"
            },
            {
                "qId": "U13-09",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小芬想要在線上跟同學開視訊會議討論週末的童軍露營分工。",
                "prompt": "Google 提供免安裝軟體、只要用瀏覽器即可開啟多人視訊會議的雲端工具名稱是 Google [BLANK]？",
                "options": ["Meet", "Maps", "Earth", "Play"],
                "answer": "Meet",
                "accepted": ["Meet", "meet", "Google Meet"],
                "hint": "英文單字「遇見、碰面」。",
                "explanation": "【遠距會議】Google Meet 支援螢幕畫面分享、分組討論室與即時視訊對談。"
            },
            {
                "qId": "U13-10",
                "type": "choice",
                "level": "基礎",
                "scenario": "小張在 Google 文件中要插入課本中的化學分子式「H₂O」，需要把數字「2」縮小放在右下角。",
                "prompt": "在文書編輯中，這項功能稱為？",
                "options": ["下標（Subscript）", "上標（Superscript）", "刪除線", "螢光筆劃線"],
                "answer": "下標（Subscript）",
                "accepted": ["下標", "下標（Subscript）", "Subscript"],
                "hint": "數字位置在基準線的下方。",
                "explanation": "【文字排版】下標（如化學式 H₂O）與上標（如數學次方 x²）是科學報告必備技巧。"
            },
            # 5 題進階挑戰題
            {
                "qId": "U13-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技時事題】現代許多線上剪輯平台（如 CapCut、Canva）導入了「AI 語音生成自動字幕（Auto Captions）」功能。",
                "prompt": "這項技術背後主要是透過哪一種人工智慧模型將說話語音轉成逐字文字檔？",
                "options": ["ASR（自動語音辨識模型，如 Whisper）", "GPS 衛星導航定位模型", "3D 印表機驅動程式", "藍芽耳機通訊協定"],
                "answer": "ASR（自動語音辨識模型，如 Whisper）",
                "accepted": ["ASR（自動語音辨識模型，如 Whisper）", "ASR", "語音辨識"],
                "hint": "Automatic Speech Recognition（自動語音辨識）。",
                "explanation": "【AI影音技術】ASR 自動語音辨識讓影片字幕生成從耗時的手動聽打躍升為秒級自動產出。"
            },
            {
                "qId": "U13-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【新世代協作時事】在 Figma、Canva 等雲端視覺設計平台中，多人游標可以在同一個畫布上同步移動並即時標註。",
                "prompt": "相較於傳統單機繪圖軟體，這類「雲端原生的多人即時畫布」最大的變革是什麼？",
                "options": [
                    "徹底打破檔案版本混亂（如 final_v2_真的最終版.psd），實現全員在單一真實數據來源（Single Source of Truth）上協作",
                    "能讓每位參與者的滑鼠自動變成金屬質感",
                    "必須透過印表機把畫布印出來才能看到別人的游標",
                    "只允許使用者使用黑白兩種顏色繪圖"
                ],
                "answer": "徹底打破檔案版本混亂（如 final_v2_真的最終版.psd），實現全員在單一真實數據來源（Single Source of Truth）上協作",
                "accepted": ["徹底打破檔案版本混亂（如 final_v2_真的最終版.psd），實現全員在單一真實數據來源（Single Source of Truth）上協作"],
                "hint": "告別版本檔案滿天飛的痛苦歷程。",
                "explanation": "【現代工作流革命】Single Source of Truth 確保所有成員看到的永遠是最新、唯一的版本。"
            },
            {
                "qId": "U13-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【國際時事標準】現代網頁影音串流（如 YouTube、Netflix）為了能在手機低頻寬下傳輸 4K 超高畫質，逐步普及由開放媒體聯盟研發且免專利費的新一代視訊編碼格式。",
                "prompt": "這個被廣泛應用於新世代瀏覽器與串流媒體的高壓縮比格式名稱是 [BLANK]1？",
                "options": ["AV", "MP", "FL", "RM"],
                "answer": "AV",
                "accepted": ["AV", "AV1", "av1", "av"],
                "hint": "AOMedia Video 1 的縮寫。",
                "explanation": "【新世代串流標準】AV1 編碼能在相同畫質下大幅節省 30% 以上的頻寬消耗。"
            },
            {
                "qId": "U13-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【資安時事題】班聯會利用 Google 表單發起校慶歌唱大賽報名，並開啟「檔案上傳」讓參賽者繳交伴唱 MP3 音樂檔。",
                "prompt": "當表單包含「上傳檔案」題型時，填答者在開啟表單時會受到何種系統限制？",
                "options": [
                    "填答者必須強制登入 Google 帳號，且上傳檔案會佔用表單擁有者的 Google 雲端硬碟容量",
                    "填答者必須親自搭飛機前往加州 Google 總部蓋章",
                    "表單會自動刪除填答者手機裡的所有聯絡人電話",
                    "完全不需要任何驗證，任何網路機器人均可無限上傳 100TB 檔案"
                ],
                "answer": "填答者必須強制登入 Google 帳號，且上傳檔案會佔用表單擁有者的 Google 雲端硬碟容量",
                "accepted": ["填答者必須強制登入 Google 帳號，且上傳檔案會佔用表單擁有者的 Google 雲端硬碟容量"],
                "hint": "為了防止匿名灌入惡意木馬，上傳檔案題型強制需要身分驗證。",
                "explanation": "【表單機制特性】檔案上傳題型基於防毒與儲存責任，一律要求填答者登入身分。"
            },
            {
                "qId": "U13-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【生活多媒體進階】小明錄製了一段英文演講音檔，背景有嚴重的電風扇嗡嗡雜音，他想用雲端音訊工具濾除低頻雜訊。",
                "prompt": "在音訊訊號處理中，用來過濾特定頻率範圍雜音的工具稱為？",
                "options": ["等化器（Equalizer / EQ）與降噪濾波器", "螢幕截圖工具", "磁碟重組工具", "字型替換器"],
                "answer": "等化器（Equalizer / EQ）與降噪濾波器",
                "accepted": ["等化器（Equalizer / EQ）與降噪濾波器", "EQ", "等化器"],
                "hint": "調整低音、中音、高音頻率響應的聲音修整器。",
                "explanation": "【數位音訊處理】EQ 等化器能調校頻段，有效壓制固定頻率的環境雜音。"
            }
        ]
    }
    units.append(u13)

    # ==========================================
    # 單元 2-1：【概念釐清】從原始資料到有價值的資訊
    # ==========================================
    u21 = {
        "unitId": "unit-2-1",
        "category": "第二章 資料與資訊應用專題",
        "unitTitle": "單元 2-1：【概念釐清】從原始資料到有價值的資訊",
        "description": "理解資料（Data）、資訊（Information）、知識（Knowledge）與 DIKW 金字塔架構。",
        "questions": [
            {
                "qId": "U21-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "體育老師拿著全班體適能測驗單，上面記滿了密密麻麻的數字：「45, 12, 180, 25, 30...」，沒有任何文字標籤。",
                "prompt": "這些尚未經過整理、分析或賦予脈絡意涵的原始數據，在資訊科學中稱為？",
                "options": ["資料（Data）", "資訊（Information）", "智慧（Wisdom）", "結論（Conclusion）"],
                "answer": "資料（Data）",
                "accepted": ["資料", "Data", "資料（Data）", "data"],
                "hint": "最底層未加工的事實或數值紀錄。",
                "explanation": "【資料與資訊區別】資料是未經處理的原始數字或事實；經過整理具備意義後才成為資訊。"
            },
            {
                "qId": "U21-02",
                "type": "cloze",
                "level": "基礎",
                "scenario": "將上述體育測驗數據整理成：「七年一班男生立定跳遠平均 185 公分，高於全校平均 10 公分」，讓老師能看出班級體能優勢。",
                "prompt": "將原始資料經過分類、計算與脈絡化處理後，具備特定意義與價值的產物稱為 [BLANK]？",
                "options": ["資訊", "亂碼", "硬體", "訊號"],
                "answer": "資訊",
                "accepted": ["資訊", "Information", "information"],
                "hint": "課本 Ch2-2 核心名詞：資〇。",
                "explanation": "【資料變資訊】資訊（Information）是帶有脈絡與意義的資料，能輔助人類做出判斷。"
            },
            {
                "qId": "U21-03",
                "type": "choice",
                "level": "基礎",
                "scenario": "氣象局在全台灣佈設成千上萬個氣象感測站，每秒鐘記錄溫度、氣壓、濕度數值。",
                "prompt": "這些感測站每秒蒐集的數值，屬於資訊架構金字塔中的哪一個階層？",
                "options": ["原始資料層（Data）", "決策智慧層（Wisdom）", "哲學理念層", "法規政策層"],
                "answer": "原始資料層（Data）",
                "accepted": ["原始資料層（Data）", "Data", "原始資料層"],
                "hint": "最源頭機器直接感測到的數據。",
                "explanation": "【DIKW模型】感測器讀數為 Data，經過氣象模型分析後發布的「降雨機率預報」才是 Information。"
            },
            {
                "qId": "U21-04",
                "type": "choice",
                "level": "基礎",
                "scenario": "小芬每天記錄自己喝了幾毫升的水，連續記錄了一個月，發現只要每天喝水超過 2000ml，皮膚與專注度明顯改善。",
                "prompt": "小芬從長期的資訊累積中歸納出生活規律與有效法則，這在層次上屬於？",
                "options": ["知識（Knowledge）", "未加工資料", "單純雜訊", "電腦病毒"],
                "answer": "知識（Knowledge）",
                "accepted": ["知識", "Knowledge", "知識（Knowledge）"],
                "hint": "資料 ➜ 資訊 ➜ 〇識 ➜ 智慧。",
                "explanation": "【知識的形成】知識是將多方資訊融會貫通、歸納出的原理與認知架構。"
            },
            {
                "qId": "U21-05",
                "type": "cloze",
                "level": "基礎",
                "scenario": "在資訊科學中，著名的層級架構模型稱為「DIKW 金字塔」。",
                "prompt": "DIKW 分別代表：Data（資料）、Information（資訊）、[BLANK]（知識）與 Wisdom（智慧）？",
                "options": ["Knowledge", "Keyboard", "Kernel", "Key"],
                "answer": "Knowledge",
                "accepted": ["Knowledge", "knowledge", "知識"],
                "hint": "以英文字母 K 開頭的單字。",
                "explanation": "【DIKW 金字塔】資料 (D) ➜ 資訊 (I) ➜ 知識 (K) ➜ 智慧 (W)。"
            },
            {
                "qId": "U21-06",
                "type": "choice",
                "level": "基礎",
                "scenario": "便利商店結帳時，店員刷條碼的瞬間，系統記錄了「2026-11-04 10:15 / 茶葉蛋 1 顆 / 14元 / 學生證悠遊卡付款」。",
                "prompt": "這筆在交易瞬間產生的紀錄，在資料庫領域稱為？",
                "options": ["交易資料（Transaction Data）", "神經網路大模型", "演算法源碼", "超文字標記"],
                "answer": "交易資料（Transaction Data）",
                "accepted": ["交易資料（Transaction Data）", "交易資料"],
                "hint": "記錄每一筆具體買賣行為發生的數據。",
                "explanation": "【生活大數據】POS 機產生的交易資料是便利商店進銷存與顧客偏好分析的基石。"
            },
            {
                "qId": "U21-07",
                "type": "choice",
                "level": "基礎",
                "scenario": "超商總部透過全台分店數百萬筆交易資料分析，發現每當寒流來襲氣溫低於 12 度時，關東煮銷量會成長 300%，因此提前通知各門市備料。",
                "prompt": "超商總部的這項決策行為體現了？",
                "options": [
                    "將海量資料轉化為高價值商業決策資訊與預測行動",
                    "店長憑個人直覺胡亂猜測",
                    "為了把店裡空間塞滿不管能不能賣掉",
                    "純粹浪費伺服器電力的無效運算"
                ],
                "answer": "將海量資料轉化為高價值商業決策資訊與預測行動",
                "accepted": ["將海量資料轉化為高價值商業決策資訊與預測行動"],
                "hint": "大數據分析的核心目的就是為決策提供科學依據。",
                "explanation": "【資料價值化】數據透過統計模型分析，能精準洞察趨勢並轉化為實質行動智慧。"
            },
            {
                "qId": "U21-08",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明在網路上看到有人發布貼文說：「明天全台灣放颱風假！」但他去中央氣象署官網查詢卻沒有任何颱風警報。",
                "prompt": "這說明了在接收數位世界訊息時，我們必須注意未經查證的錯誤內容屬於？",
                "options": ["偽資訊（Misinformation / 雜訊）", "精準氣象科學", "最高級智慧", "法定公文"],
                "answer": "偽資訊（Misinformation / 雜訊）",
                "accepted": ["偽資訊（Misinformation / 雜訊）", "偽資訊", "假訊息"],
                "hint": "不真實、具誤導性或缺乏佐證的雜訊。",
                "explanation": "【數位素養】資料品質至關重要，若輸入 Garbage in，產出的必然是 Garbage out。"
            },
            {
                "qId": "U21-09",
                "type": "cloze",
                "level": "基礎",
                "scenario": "學校保健室想了解學生視力惡化的關鍵原因，設計問卷搜集同學們每天使用手機與平板的「時數」。",
                "prompt": "在統計學中，「每日螢幕使用時數（例如：1.5小時、3小時）」屬於可量化數值的 [BLANK] 量資料？",
                "options": ["數", "質", "色", "音"],
                "answer": "數",
                "accepted": ["數", "數量", "定量", "數值"],
                "hint": "可以用數字衡量大小的資料（數量資料）。",
                "explanation": "【資料屬性】數量資料（Quantitative）可做加減平均運算；質性資料（Qualitative）則側重文字特徵描述。"
            },
            {
                "qId": "U21-10",
                "type": "choice",
                "level": "基礎",
                "scenario": "小華說：「把資料存進電腦後，電腦就會自己變成天才幫我們做所有決定。」老師請大家指正他的觀念盲點。",
                "prompt": "下列哪一項敘述最正確反映「人與資料的關係」？",
                "options": [
                    "資料本身不會主動產生價值，需仰賴人類運用批判思考與科學方法進行分析詮釋",
                    "電腦儲存的資料越多，人類就越不需要學習任何知識",
                    "所有資料只要存入電腦就永遠保證 100% 正確無誤",
                    "資料只對電腦工程師有用，國中生日常生活中完全接觸不到資料"
                ],
                "answer": "資料本身不會主動產生價值，需仰賴人類運用批判思考與科學方法進行分析詮釋",
                "accepted": ["資料本身不會主動產生價值，需仰賴人類運用批判思考與科學方法進行分析詮釋"],
                "hint": "人的思維、洞察與倫理才是發揮數據價值的核心主宰。",
                "explanation": "【人本數位素養】科技是工具，人對問題的定義、洞察與倫理把關才是決定資訊價值的關鍵。"
            },
            # 5 題進階時事挑戰題
            {
                "qId": "U21-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【台灣智慧城市時事】台北捷運與高雄捷運透過閘門刷卡大數據，能在上下班尖峰時刻自動動態加開列車班次並調配車廂冷氣溫度。",
                "prompt": "這項智慧運輸的實踐，展示了物聯網（IoT）時代何種「資料驅動（Data-Driven）」的核心理念？",
                "options": [
                    "即時人流數據感知 ➜ 雲端邊緣運算分析 ➜ 自動化資源彈性調度決策",
                    "靠站長肉眼觀察月台人數後打電話請司機開快一點",
                    "只要把閘門拆除，捷運班次就會自動變多",
                    "讓每位乘客搭車時都要做一套廣播體操"
                ],
                "answer": "即時人流數據感知 ➜ 雲端邊緣運算分析 ➜ 自動化資源彈性調度決策",
                "accepted": ["即時人流數據感知 ➜ 雲端邊緣運算分析 ➜ 自動化資源彈性調度決策"],
                "hint": "閉環系統：感測感知 ➜ 運算分析 ➜ 自動決策執行。",
                "explanation": "【智慧生活鏈結】即時數據流結合邊緣運算與雲端調度，是現代智慧城市與交通工程的核心範例。"
            },
            {
                "qId": "U21-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【國際永續時事】聯合國環境署推動 ESG 數據透明化，各大跨國企業必須揭露完整的「範疇一至範疇三」溫室氣體盤查數據。",
                "prompt": "為什麼全球大廠（如 Apple、台積電）對供應鏈廠商的「碳足跡資料」要求如此精確？",
                "options": [
                    "精確的碳排數據是計算碳關稅（CBAM）、達成淨零碳排（Net Zero）目標與國際接單的必要法遵依據",
                    "只是為了印成厚厚一本書擺在接待室展示好看",
                    "因為只要計算出碳數據，工廠煙囪就不會再冒煙",
                    "國際法規定算不出碳數據的公司每位員工都要罰抄課本十次"
                ],
                "answer": "精確的碳排數據是計算碳關稅（CBAM）、達成淨零碳排（Net Zero）目標與國際接單的必要法遵依據",
                "accepted": ["精確的碳排數據是計算碳關稅（CBAM）、達成淨零碳排（Net Zero）目標與國際接單的必要法遵依據"],
                "hint": "無測量即無管理，碳數據已是全球經濟與永續貿易的硬指標。",
                "explanation": "【數據與全球永續】歐盟碳邊境調整機制（CBAM）已上路，數據治理已是國際貿易競爭力關鍵。"
            },
            {
                "qId": "U21-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【AI大模型時事】訓練 ChatGPT、Gemini 等生成式 AI 大模型需要數兆字元的網際網路文本資料，然而如果訓練資料充斥著偏見、仇恨言論或虛假謠言，AI 就會產出偏差歧視的回答。",
                "prompt": "電腦科學界著名的金句：「[BLANK] in, Garbage out（垃圾進，垃圾出）」，強調了訓練資料品質的決定性影響？",
                "options": ["Garbage", "Gold", "Data", "Good"],
                "answer": "Garbage",
                "accepted": ["Garbage", "garbage", "垃圾"],
                "hint": "英文單字「垃圾」。",
                "explanation": "【資料治理與倫理】Garbage in, Garbage out！高品質乾淨資料是培育負責任 AI 的先決條件。"
            },
            {
                "qId": "U21-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【公衛大數據時事】回顧台灣在對抗登革熱與流行病傳播時，疾管署結合病媒蚊誘卵桶監測數據與氣象雨量數據，繪製成「疫情熱點風險地圖」。",
                "prompt": "這種跨領域資料整合分析（Epidemiological Big Data）為公共衛生帶來的最大效益是？",
                "options": [
                    "超前部署在病媒蚊羽化高峰前精準投藥噴消，從被動治療轉為主動預防",
                    "讓每隻蚊子身上都貼上條碼進行個別追蹤",
                    "要求全體市民連續一個月不出門吹風",
                    "把所有積水容器全部漆成粉紅色"
                ],
                "answer": "超前部署在病媒蚊羽化高峰前精準投藥噴消，從被動治療轉為主動預防",
                "accepted": ["超前部署在病媒蚊羽化高峰前精準投藥噴消，從被動治療轉為主動預防"],
                "hint": "以數據洞察指導科學預防，防患於未然。",
                "explanation": "【公衛數據力量】數據結合地理空間分析，大幅提升防疫決策的精準度與資源利用效率。"
            },
            {
                "qId": "U21-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技法律時事】歐盟《通用資料保護規則》（GDPR）賦予全球公民「資料被遺忘權（Right to be forgotten）」與「資料可攜權（Data Portability）」。",
                "prompt": "這些法規的核心立法精神是什麼？",
                "options": [
                    "確立個人的數位資料主權，民眾有權要求網路科技巨頭刪除個人過時隱私或匯出個人資料",
                    "強制全世界每位網友在每年底必須將手機所有照片格式化清空",
                    "禁止所有學校使用電腦進行遠距教學",
                    "規定所有軟體工程師寫程式時不能戴眼鏡"
                ],
                "answer": "確立個人的數位資料主權，民眾有權要求網路科技巨頭刪除個人過時隱私或匯出個人資料",
                "accepted": ["確立個人的數位資料主權，民眾有權要求網路科技巨頭刪除個人過時隱私或匯出個人資料"],
                "hint": "我的資料我做主，捍衛個人數位人權與自主控制權。",
                "explanation": "【數位人權觀】GDPR 樹立了全球隱私保護標竿，將資料所有權回歸個體而非科技巨頭。"
            }
        ]
    }
    units.append(u21)

    print(f"Loaded {len(units)} units so far")
    return units

if __name__ == '__main__':
    get_all_units()
