# -*- coding: utf-8 -*-
"""
生成單元 2-2、2-3、2-4、2-5 的題庫資料 (符合 108 課綱與時事題)
"""

def get_remaining_units():
    units = []

    # ==========================================
    # 單元 2-2：【解碼特工】二進位、ASCII 與 RGB 數位表示
    # ==========================================
    u22 = {
        "unitId": "unit-2-2",
        "category": "第二章 資料與資訊應用專題",
        "unitTitle": "單元 2-2：【解碼特工】二進位、ASCII 與 RGB 數位表示",
        "description": "理解電腦底層 0 與 1 二進位運作、文字編碼（ASCII/Unicode）與像素色彩 RGB。",
        "questions": [
            {
                "qId": "U22-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "現代電子計算機內部主要由數十億顆微型電晶體的開關狀態構成。",
                "prompt": "電腦硬體底層運算時，主要使用哪一種進位制來表示所有數據與指令？",
                "options": ["二進位（Binary，只有 0 與 1）", "十進位（Decimal，0 到 9）", "六十進位（如時鐘）", "千進位"],
                "answer": "二進位（Binary，只有 0 與 1）",
                "accepted": ["二進位", "二進位（Binary，只有 0 與 1）", "二進制"],
                "hint": "電路的通電（高電位 1）與斷電（低電位 0）。",
                "explanation": "【電腦運算基石】電晶體開關狀態天然對應 0 與 1，因此二進位是現代電腦運算基礎。"
            },
            {
                "qId": "U22-02",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小明在課堂練習二進位換算，要將十進位數字 5 轉換成二進位。",
                "prompt": "十進位的數值 5，轉換為二進位表示法應該是 [BLANK]（因為 4+0+1）？",
                "options": ["101", "110", "111", "100"],
                "answer": "101",
                "accepted": ["101", "(101)2", "101(2)"],
                "hint": "二進位權重：4 + 0 + 1 = 5。",
                "explanation": "【二進位轉換】十進位 5 = 1×2² + 0×2¹ + 1×2⁰ = 二進位 101。"
            },
            {
                "qId": "U22-03",
                "type": "choice",
                "level": "基礎",
                "scenario": "我們買隨身碟或手機時常看到容量標註 128GB、256GB。",
                "prompt": "在資料儲存單位中，1 個 Byte（位元組）由幾個 bit（位元）所組成？",
                "options": ["8 個 bit", "2 個 bit", "10 個 bit", "1024 個 bit"],
                "answer": "8 個 bit",
                "accepted": ["8", "8個", "8 個 bit"],
                "hint": "1 Byte = 8 bits。",
                "explanation": "【儲存單位】1 Byte = 8 bits，剛好足夠編碼一個英文字母或標點符號。"
            },
            {
                "qId": "U22-04",
                "type": "cloze",
                "level": "基礎",
                "scenario": "電腦為了記錄英文字母與數字符號，制定了早期的美國標準資訊交換碼。",
                "prompt": "這個廣泛應用的 7 位元編碼標準縮寫是 [BLANK] 碼？",
                "options": ["ASCII", "ANSI", "ARM", "API"],
                "answer": "ASCII",
                "accepted": ["ASCII", "ascii", "Ascii"],
                "hint": "American Standard Code for Information Interchange。",
                "explanation": "【文字編碼起源】ASCII 碼用 7 位元定義了 128 個字元，奠定了英文字元編碼標準。"
            },
            {
                "qId": "U22-05",
                "type": "choice",
                "level": "基礎",
                "scenario": "ASCII 碼只能編碼英文字母，無法容納繁體中文、日文、韓文或 Emoji 表情符號。",
                "prompt": "為了讓全世界所有語言符號都能在電腦中正確顯示而不出現亂碼，國際組織推動了哪一種萬國通用的統一碼標準？",
                "options": ["Unicode（如 UTF-8）", " Morse 摩斯密碼", "古埃及象形文字碼", "黑膠唱片刻紋碼"],
                "answer": "Unicode（如 UTF-8）",
                "accepted": ["Unicode", "Unicode（如 UTF-8）", "UTF-8", "統一碼"],
                "hint": "萬國碼、統一碼，支援上百萬個字符與可愛 Emoji。",
                "explanation": "【萬國統一碼】Unicode 解決了各國自訂編碼互不相容導致亂碼的歷史難題。"
            },
            {
                "qId": "U22-06",
                "type": "choice",
                "level": "基礎",
                "scenario": "手機螢幕能呈現上千萬種鮮豔色彩，放大觀察是由無數細小的光點像素（Pixel）構成。",
                "prompt": "電腦螢幕與數位影像的「色光三原色（RGB）」是指哪三種光色？",
                "options": ["紅（Red）、綠（Green）、藍（Blue）", "紅（Red）、黃（Yellow）、藍（Blue）", "青（Cyan）、洋紅（Magenta）、黃（Yellow）", "黑、白、灰"],
                "answer": "紅（Red）、綠（Green）、藍（Blue）",
                "accepted": ["紅（Red）、綠（Green）、藍（Blue）", "RGB", "紅綠藍"],
                "hint": "色光三原色是紅、綠、藍；色料三原色才是紅、黃、藍喔！",
                "explanation": "【色光三原色】RGB 為色光加法混色，三種光等比例最強混合時會呈現白色純光。"
            },
            {
                "qId": "U22-07",
                "type": "cloze",
                "level": "基礎",
                "scenario": "在 24 位元真彩色（True Color）中，RGB 各用 8 個位元表示，數值範圍從 0 到 255。",
                "prompt": "若設定色彩數值為 RGB(255, 0, 0)，螢幕會呈現純粹的 [BLANK] 色？",
                "options": ["紅", "綠", "藍", "黑"],
                "answer": "紅",
                "accepted": ["紅", "紅色", "Red", "red"],
                "hint": "第一項 R（Red）開到最大 255，其餘兩項為 0。",
                "explanation": "【色彩通道數值】RGB(255, 0, 0) 代表紅色亮度全開，其餘無光，呈現純紅色。"
            },
            {
                "qId": "U22-08",
                "type": "choice",
                "level": "基礎",
                "scenario": "在 RGB 色光加法混合中，當三種色光全部關閉，數值為 RGB(0, 0, 0) 時，呈現什麼顏色？",
                "prompt": "RGB(0, 0, 0) 在螢幕上呈現？",
                "options": ["黑色（無光）", "純白色", "亮黃色", "透明色"],
                "answer": "黑色（無光）",
                "accepted": ["黑色", "黑色（無光）", "黑"],
                "hint": "沒有任何光源照射時是一片漆黑。",
                "explanation": "【色光混色】三色光皆為 0 代表無發光，呈現黑色；皆為 255 則為白色。"
            },
            {
                "qId": "U22-09",
                "type": "choice",
                "level": "基礎",
                "scenario": "小芬去買新手機，看到規格寫著相機拍照解析度為 1200 萬像素（12 Megapixels）。",
                "prompt": "一張影像的「像素（Pixel）」數量越多，通常代表什麼含義？",
                "options": [
                    "影像解析度越細緻，放大觀看時細節越清晰",
                    "拍出來的照片一定會自動變成黑白兩色",
                    "照片容量會變得比純文字檔還要小",
                    "鏡頭會變得越來越重拿不動"
                ],
                "answer": "影像解析度越細緻，放大觀看時細節越清晰",
                "accepted": ["影像解析度越細緻，放大觀看時細節越清晰"],
                "hint": "像素是組成數位影像的最小基本單位。",
                "explanation": "【解析度概念】像素數量越多，影像採樣點越密集，畫面細膩度與放大容忍度越高。"
            },
            {
                "qId": "U22-10",
                "type": "cloze",
                "level": "基礎",
                "scenario": "在電腦記憶體單位換算中，通常以 2 的 10 次方作為進位級距。",
                "prompt": "1 KB（Kilobyte）等於 [BLANK] 個 Bytes？",
                "options": ["1024", "1000", "100", "512"],
                "answer": "1024",
                "accepted": ["1024", "1024個", "1024 Bytes"],
                "hint": "2 的 10 次方（2¹⁰）計算結果。",
                "explanation": "【二進位單位】2¹⁰ = 1024，因此電腦作業系統中 1 KB = 1024 Bytes。"
            },
            # 5 題進階時事挑戰題
            {
                "qId": "U22-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技前沿時事】IBM、Google 與台灣中研院正在積極研發「量子電腦（Quantum Computer）」。",
                "prompt": "量子電腦使用的「量子位元（Qubit）」與傳統電腦的二進位位元（Bit）最大不同在於？",
                "options": [
                    "傳統位元非 0 即 1；量子位元利用量子疊加態（Superposition），可同時兼具 0 與 1 的機率狀態，實現指數級平行運算",
                    "量子位元是直接用外星人水晶做成的，不需要任何電線",
                    "量子位元只能用來玩俄羅斯方塊，不能做任何數學運算",
                    "量子電腦的大小跟一粒沙子一樣完全不需要冷卻"
                ],
                "answer": "傳統位元非 0 即 1；量子位元利用量子疊加態（Superposition），可同時兼具 0 與 1 的機率狀態，實現指數級平行運算",
                "accepted": ["傳統位元非 0 即 1；量子位元利用量子疊加態（Superposition），可同時兼具 0 與 1 的機率狀態，實現指數級平行運算"],
                "hint": "量子疊加與量子糾纏特性賦予其超越經典計算的龐大算力潛能。",
                "explanation": "【下世代運算】量子疊加態打破了傳統二進位狀態限制，是全球密碼學與超算的研發焦點。"
            },
            {
                "qId": "U22-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【國際顯示技術時事】蘋果 iPad Pro 與高端智慧電視導入新一代「OLED / Micro LED」自發光螢幕面板。",
                "prompt": "相較於傳統需要背光燈條的 LCD 螢幕，OLED 螢幕在顯示 RGB(0, 0, 0) 純黑色時具有何種物理優勢？",
                "options": [
                    "該像素的發光二極體直接完全斷電關閉，實現極致純黑對比度並大幅節省電量",
                    "螢幕會噴出微量冷氣幫使用者降溫",
                    "會把黑色畫面強制轉化為粉紅色以保護眼睛",
                    "OLED 在黑色時必須消耗十倍的電力產生黑光"
                ],
                "answer": "該像素的發光二極體直接完全斷電關閉，實現極致純黑對比度並大幅節省電量",
                "accepted": ["該像素的發光二極體直接完全斷電關閉，實現極致純黑對比度並大幅節省電量"],
                "hint": "自發光像素在純黑時直接關閉不亮，因此黑得深邃又省電。",
                "explanation": "【顯示科技鏈結】自發光特性讓 OLED 呈現真黑與高動態對比（HDR），深色模式更可延長續航力。"
            },
            {
                "qId": "U22-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【網路文化時事】全世界每天在 Instagram、LINE 上傳送數十億個 Emoji 表情圖案（例如：珍珠奶茶🧋、笑哭😂）。",
                "prompt": "這些 Emoji 每年都是由非營利跨國組織 [BLANK] Consortium 嚴格審核編碼並納入國際統一字符標準？",
                "options": ["Unicode", "NASA", "FIFA", "UNESCO"],
                "answer": "Unicode",
                "accepted": ["Unicode", "unicode", "Unicode Consortium"],
                "hint": "統一碼聯盟的英文名稱。",
                "explanation": "【全球文化與標準】Unicode Consortium 負責審核全球文字與 Emoji 編碼，確保跨系統正常顯示。"
            },
            {
                "qId": "U22-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【數位訊號取樣時事】高解析無損音樂串流（如 Hi-Res Lossless）常標榜「24-bit / 192kHz」取樣規格。",
                "prompt": "在聲音數位化（類比轉數位 ADC）的過程中，「取樣頻率（Sampling Rate，如 192kHz）」代表的意思是？",
                "options": [
                    "每秒鐘對連續的類比聲波訊號進行測量記錄的次數（次/秒）",
                    "耳機線的長度是 192 公尺",
                    "聽這首歌必須同時按住 192 個鍵盤按鍵",
                    "音樂會以每秒 192 萬公里的光速前進"
                ],
                "answer": "每秒鐘對連續的類比聲波訊號進行測量記錄的次數（次/秒）",
                "accepted": ["每秒鐘對連續的類比聲波訊號進行測量記錄的次數（次/秒）"],
                "hint": "取樣定理（Nyquist）：取樣頻率越高，還原的高頻聲音細節越豐富。",
                "explanation": "【音訊數位化工程】取樣率越高能捕獲越精細的聲波形狀，使數位音樂聽起來更逼真溫潤。"
            },
            {
                "qId": "U22-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【網頁前端工程時事】工程師在編寫 CSS 網頁樣式時，常用十六進位色碼表示顏色，例如「#FFFFFF」與「#000000」。",
                "prompt": "十六進位色彩碼「#00FF00」對應到 RGB 數值是多少？",
                "options": ["RGB(0, 255, 0) 純綠色", "RGB(255, 0, 0) 純紅色", "RGB(0, 0, 255) 純藍色", "RGB(128, 128, 128) 灰色"],
                "answer": "RGB(0, 255, 0) 純綠色",
                "accepted": ["RGB(0, 255, 0) 純綠色", "RGB(0, 255, 0)", "純綠色"],
                "hint": "前兩碼代表 R(00)，中間兩碼代表 G(FF=255)，後兩碼代表 B(00)。",
                "explanation": "【十六進位色碼】FF 轉換為十進位即是 255，#00FF00 即代表 G 通道亮度全開之純綠色。"
            }
        ]
    }
    units.append(u22)

    # ==========================================
    # 單元 2-3：【神搜出擊】進階搜尋語法與世界接軌情報搜集
    # ==========================================
    u23 = {
        "unitId": "unit-2-3",
        "category": "第二章 資料與資訊應用專題",
        "unitTitle": "單元 2-3：【神搜出擊】進階搜尋語法與世界接軌情報搜集",
        "description": "精通 site:、filetype:、減號排除、雙引號完全比對與 Google 學術搜尋技巧。",
        "questions": [
            {
                "qId": "U23-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明要找教育部頒布的國中教育會考正式官方簡章，但搜尋結果前幾頁全都是補習班的招生廣告。",
                "prompt": "小明可以在搜尋框加入哪一個進階語法，限制只搜尋台灣教育與學校機關網站？",
                "options": ["site:edu.tw", "filetype:mp3", "buy:free", "school:yes"],
                "answer": "site:edu.tw",
                "accepted": ["site:edu.tw", "site: edu.tw"],
                "hint": "site: 語法能指定限定特定網域，edu 代表教育機構，tw 代表台灣。",
                "explanation": "【指定網域語法】`site:edu.tw` 能強制搜尋引擎只回傳教育單位的權威網頁，杜絕商業廣告干擾。"
            },
            {
                "qId": "U23-02",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小華要下載中央氣象署的台灣百年氣候變遷專題研究「PDF」簡報檔。",
                "prompt": "若想要直接過濾只尋找特定副檔名格式的文件，可以使用語法：[BLANK]:pdf？",
                "options": ["filetype", "format", "download", "extension"],
                "answer": "filetype",
                "accepted": ["filetype", "filetype:", "Filetype"],
                "hint": "檔案類型的英文 File Type 合併字。",
                "explanation": "【指定檔案格式】`filetype:pdf` 或 `filetype:pptx` 能直接撈出可下載的現成專案研究報告。"
            },
            {
                "qId": "U23-03",
                "type": "choice",
                "level": "基礎",
                "scenario": "小強想研究「蘋果（Apple）」這間跨國科技公司與庫克（Tim Cook），但搜尋結果老是跳出一堆蘋果水果食譜與蘋果派做法。",
                "prompt": "小強應該如何善用「減號（-）」排除語法精確搜尋？",
                "options": ["蘋果 -食譜 -派", "蘋果 +食譜", "蘋果 * 派", "蘋果 / 食譜"],
                "answer": "蘋果 -食譜 -派",
                "accepted": ["蘋果 -食譜 -派", "減號", "-"],
                "hint": "在不想要的關鍵字前面緊貼一個半形減號（-）。",
                "explanation": "【負向排除語法】`蘋果 -食譜` 會強制剔除含有食譜字樣的網頁，精準聚焦於科技領域。"
            },
            {
                "qId": "U23-04",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小美在背唐詩時忘記作者，只記得一句「唯見長江天際流」，她想要一字不差地完全比對整句話。",
                "prompt": "若要進行精確完全比對、不允許字詞被拆散，應該在詞句前後加上半形的哪種標點符號 [BLANK]？",
                "options": ["雙引號 \" \"", "括號 ( )", "問號 ?", "錢字號 $"],
                "answer": "雙引號 \" \"",
                "accepted": ["雙引號", "雙引號 \" \"", "\"", "雙引號\"\"", "引號"],
                "hint": "鍵盤 Enter 鍵左邊的雙引號鍵。",
                "explanation": "【完全比對語法】使用 `\"唯見長江天際流\"` 能強制搜尋引擎精確鎖定整段相連文字。"
            },
            {
                "qId": "U23-05",
                "type": "choice",
                "level": "基礎",
                "scenario": "小智在公園拍到一隻長相奇特的鳥類，但不知道牠的名字，無法用文字打進搜尋引擎。",
                "prompt": "小智可以利用現代搜尋引擎的何種功能，直接上傳照片以圖找圖？",
                "options": ["Google 智慧鏡頭（Google Lens / 圖片以圖搜圖）", "鍵盤盲打訓練機", "磁碟掃描修復程式", "計時碼表計時"],
                "answer": "Google 智慧鏡頭（Google Lens / 圖片以圖搜圖）",
                "accepted": ["Google 智慧鏡頭", "智慧鏡頭", "以圖搜圖", "Google 智慧鏡頭（Google Lens / 圖片以圖搜圖）", "Google Lens"],
                "hint": "用鏡頭拍下物體，讓 AI 辨識生物或物品外貌。",
                "explanation": "【多模態圖像搜尋】Google Lens 能透過神經網絡視覺辨識特徵，秒速查出動植物物種與歷史古蹟。"
            },
            {
                "qId": "U23-06",
                "type": "choice",
                "level": "基礎",
                "scenario": "要做國中組科展報告，需要引用嚴謹、經過同行評審的正式學術論文與專題期刊。",
                "prompt": "搜尋學術文獻與權威期刊論文最推薦使用的專用搜尋平台是？",
                "options": ["Google 學術搜尋（Google Scholar）", "短影音社群平台", "網路交友拍賣網", "手遊討論區聊天室"],
                "answer": "Google 學術搜尋（Google Scholar）",
                "accepted": ["Google 學術搜尋（Google Scholar）", "Google 學術搜尋", "Google Scholar"],
                "hint": "專門索引各國大專院校、學會論文與研究報告的官方搜尋門戶。",
                "explanation": "【學術情報利器】Google Scholar 匯集全球權威研究，是中學生撰寫深度科展報告的必備工具。"
            },
            {
                "qId": "U23-07",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小麗想查詢中央政府行政院發布的最新青年政策或節能家電補助要點。",
                "prompt": "限制只搜尋台灣政府官方機關網站的網域指令是 site:[BLANK].tw？",
                "options": ["gov", "com", "net", "org"],
                "answer": "gov",
                "accepted": ["gov", "gov.tw", "GOV"],
                "hint": "Government（政府）的縮寫。",
                "explanation": "【政府公信來源】`site:gov.tw` 能保證搜尋到的均為政府一級行政或主管部會官方資訊。"
            },
            {
                "qId": "U23-08",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明要買二手相機，預算在 3000 元到 8000 元之間，想直接在 Google 搜尋該價位區間的評價。",
                "prompt": "在 Google 搜尋中表示「數值區間範圍」的進階特殊符號是？",
                "options": ["兩個連續句點 ..（例如：3000..8000 元）", "波浪號 ~~", "井字號 ##", "問號 ?? "],
                "answer": "兩個連續句點 ..（例如：3000..8000 元）",
                "accepted": ["兩個連續句點 ..（例如：3000..8000 元）", "..", "兩個句點"],
                "hint": "數字與數字中間放兩顆點點：2020..2024。",
                "explanation": "【數字區間語法】利用 `3000..8000` 或 `2020..2026` 可快速篩選特定價格或年份區間的資訊。"
            },
            {
                "qId": "U23-09",
                "type": "choice",
                "level": "基礎",
                "scenario": "小芬想在維基百科（Wikipedia）內部深入搜尋「人工智慧」的歷史發展。",
                "prompt": "使用哪一個語法可以限定只搜尋維基百科中文站點內的內容？",
                "options": ["人工智慧 site:zh.wikipedia.org", "人工智慧 download:all", "人工智慧 print:paper", "人工智慧 delete:cache"],
                "answer": "人工智慧 site:zh.wikipedia.org",
                "accepted": ["人工智慧 site:zh.wikipedia.org"],
                "hint": "site: 加上指定網站的完整網址。",
                "explanation": "【站內深搜】善用 `site:指定網域` 可以將 Google 強大的索引能力直接當成該網站的搜尋引擎。"
            },
            {
                "qId": "U23-10",
                "type": "cloze",
                "level": "基礎",
                "scenario": "搜尋時如果希望結果「包含關鍵字 A 或關鍵字 B 其中之一即可」，應該使用布林邏輯運算子。",
                "prompt": "在搜尋引擎中代表「或者（Or）」關係、必須全部大寫的英文單字是 [BLANK]？",
                "options": ["OR", "AND", "NOT", "BUT"],
                "answer": "OR",
                "accepted": ["OR", "or", "Or"],
                "hint": "英文單字「或者」，兩個英文字母。",
                "explanation": "【布林邏輯聯集】`地震 OR 海嘯` 會找出包含兩者任一主題的網頁，擴大搜尋涵蓋面。"
            },
            # 5 題進階時事挑戰題
            {
                "qId": "U23-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【新世代 AI 搜尋時事】微軟 Bing Copilot、Google Gemini 與 Perplexity 推出「對話式 AI 搜尋引擎（AI Overview）」。",
                "prompt": "相較於傳統「給出一整頁十個藍色超連結列表」，AI 搜尋引擎帶給使用者的最大變革是什麼？",
                "options": [
                    "即時閱讀全網多個權威來源，自動統整濃縮出結構化摘要與對比表格，並附上原始引用註腳",
                    "搜尋結果一律用隱形墨水書寫必須拿火烤螢幕才看得到",
                    "會把使用者的電腦螢幕自動旋轉 180 度以訓練頸部肌肉",
                    "強制禁止使用者點擊任何外部網站"
                ],
                "answer": "即時閱讀全網多個權威來源，自動統整濃縮出結構化摘要與對比表格，並附上原始引用註腳",
                "accepted": ["即時閱讀全網多個權威來源，自動統整濃縮出結構化摘要與對比表格，並附上原始引用註腳"],
                "hint": "從「搜尋資訊（Search）」躍升為「直接解答與合成知識（Answer Engine）」。",
                "explanation": "【搜尋引擎範式轉移】AI 搜尋能理解複雜提問，秒速整合多源資料並列出客觀佐證出處。"
            },
            {
                "qId": "U23-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技開源時事】許多資安特工與調查記者在做「公開來源情報分析（OSINT）」時，會使用「Google Dorking（進階搜尋漏洞偵測）」技巧。",
                "prompt": "下列哪一個搜尋語法常被用來檢視特定網站是否因疏失把管理後台資料夾或密碼設定檔公開在網路上？",
                "options": ["site:example.com intitle:\"index of/\"", "site:example.com color:blue", "site:example.com play:music", "site:example.com text:hello"],
                "answer": "site:example.com intitle:\"index of/\"",
                "accepted": ["site:example.com intitle:\"index of/\""],
                "hint": "intitle:\"index of/\" 會檢索伺服器目錄列表暴露的頁面。",
                "explanation": "【白帽資安思維】intitle:\"index of/\" 能幫網管及時抓出伺服器目錄未上鎖外洩的漏洞。"
            },
            {
                "qId": "U23-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【全球數位文獻時事】某位特工想查閱 15 年前某個已經倒閉關站的台灣無名小站部落格歷史文章，但在現代網路上已經打不開。",
                "prompt": "他可以利用非營利數位圖書館「網路時光機（Wayback Machine / Internet [BLANK]）」查詢全球網頁保存的歷史網頁快照？",
                "options": ["Archive", "Airport", "Apartment", "Action"],
                "answer": "Archive",
                "accepted": ["Archive", "archive", "Internet Archive"],
                "hint": "英文單字「檔案庫、數位典藏」。",
                "explanation": "【數位遺產典藏】Internet Archive 典藏了數千億個歷史網頁快照，是考證歷史資料的神器。"
            },
            {
                "qId": "U23-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【氣候國際情報搜尋】聯合國跨政府氣候變遷專門委員會（IPCC）發表了數百頁的評估報告，小明只想快速鎖定「報告標題」中精確包含「Sea Level Rise（海平面上升）」的文獻。",
                "prompt": "哪一個進階語法可以強制搜尋結果的「網頁或文章標題」必須包含該特定詞彙？",
                "options": ["allintitle:\"Sea Level Rise\"", "inurl:google", "inanchor:play", "cache:nasa.gov"],
                "answer": "allintitle:\"Sea Level Rise\"",
                "accepted": ["allintitle:\"Sea Level Rise\"", "allintitle", "intitle"],
                "hint": "intitle 或 allintitle 語法鎖定 HTML 的 <title> 標籤內容。",
                "explanation": "【精準標題過濾】`allintitle:` 能大幅排除內文僅僅隨意提及的次要網頁，鎖定以該主題為核心的專題文獻。"
            },
            {
                "qId": "U23-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技倫理時事】許多網頁為了防止自家原創新聞或會員文章被搜尋引擎 AI 爬蟲任意抓取拿去訓練大語言模型，會在網站根目錄放置一個約定俗成的純文字控制設定檔。",
                "prompt": "這個用來告訴網路爬蟲「哪些目錄允許存取、哪些目錄禁止抓取」的標準檔案名稱是？",
                "options": ["robots.txt", "passwords.doc", "welcome.png", "index.exe"],
                "answer": "robots.txt",
                "accepted": ["robots.txt", "Robots.txt"],
                "hint": "機器人（Robots）協議文字檔。",
                "explanation": "【爬蟲協議標準】robots.txt 遵循爬蟲排除協議（REP），規範搜尋引擎蜘蛛與 AI 爬蟲的合法拜訪邊界。"
            }
        ]
    }
    units.append(u23)

    # ==========================================
    # 單元 2-4：【真假辨識】數位素養、事實查核與 AI 假訊息防禦
    # ==========================================
    u24 = {
        "unitId": "unit-2-4",
        "category": "第二章 資料與資訊應用專題",
        "unitTitle": "單元 2-4：【真假辨識】數位素養、事實查核與 AI 假訊息防禦",
        "description": "學習辨識認知作戰、釣魚詐騙、AI Deepfake 深偽影音與運用第三方事實查核平台。",
        "questions": [
            {
                "qId": "U24-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "奶奶在家庭 LINE 群組轉傳了一則訊息：「轉發這條好運錦囊給 10 個朋友，否則明天帳戶會被凍結，點此連結領取免費超商 500 元禮券！」",
                "prompt": "身為資訊特工，你應該第一時間如何處理最妥當？",
                "options": [
                    "禮貌提醒長輩切勿點擊不明連結，並透過台灣事實查核平台進行驗證查證",
                    "立刻幫忙轉發給全班 40 位同學",
                    "立刻在連結裡輸入全家人的身分證字號與銀行存摺帳號",
                    "大聲痛罵奶奶並直接退群"
                ],
                "answer": "禮貌提醒長輩切勿點擊不明連結，並透過台灣事實查核平台進行驗證查證",
                "accepted": ["禮貌提醒長輩切勿點擊不明連結，並透過台灣事實查核平台進行驗證查證"],
                "hint": "保持理性懷疑，保護家人資安與隱私不受釣魚詐騙危害。",
                "explanation": "【釣魚詐騙防範】以「轉傳抽獎、帳戶凍結」為誘餌常是竊取個資與 LINE 帳號的典型社交工程手法。"
            },
            {
                "qId": "U24-02",
                "type": "choice",
                "level": "基礎",
                "scenario": "在台灣若想查證網路上瘋傳的重大爭議新聞或謠言，可以查詢獲得國際事實查核聯盟（IFCN）認證的專業民間機構。",
                "prompt": "下列哪一個是台灣知名的專業第三方事實查核機構？",
                "options": ["台灣事實查核中心（Taiwan FactCheck Center）", "網路爆料公社聊天室", "不知名八卦論壇", "黑心拍賣網站"],
                "answer": "台灣事實查核中心（Taiwan FactCheck Center）",
                "accepted": ["台灣事實查核中心（Taiwan FactCheck Center）", "台灣事實查核中心", "TFC"],
                "hint": "具備嚴謹獨立查證準則的非營利專業查核團隊。",
                "explanation": "【事實查核機制】台灣事實查核中心依據客觀證據、訪談學者專家與比對原始公文，公布透明查核報告。"
            },
            {
                "qId": "U24-03",
                "type": "cloze",
                "level": "基礎",
                "scenario": "近年有不肖份子利用生成式 AI 深度偽造技術，合成名人的臉部與聲音進行投資詐騙。",
                "prompt": "這種利用深度學習演算法進行人臉置換、聲音克隆的偽造技術英文稱為 [BLANK]fake？",
                "options": ["Deep", "Fake", "Dark", "Fast"],
                "answer": "Deep",
                "accepted": ["Deep", "deep", "Deepfake", "深偽"],
                "hint": "深度學習（Deep Learning）的字首 Deep。",
                "explanation": "【AI深偽辨識】Deepfake 深度偽造常有嘴型不同步、眨眼頻率異常或邊緣光影扭曲等破綻。"
            },
            {
                "qId": "U24-04",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明在 Threads 上看到一張宣稱是「台北 101 大樓昨晚被外星太空船雷射擊中起火」的震撼照片，但各大主流新聞台都沒報導。",
                "prompt": "小明想要確認這張照片是不是網路舊圖移花接木或 AI 繪圖生成，最有效的數位驗證手法是？",
                "options": [
                    "使用 Google 圖片「以圖搜圖」逆向反搜原始發布時間與來源背景",
                    "直接在底下留言「太可怕了外星人來了」並分享到臉書",
                    "用彩色筆在手機螢幕上把太空船塗黑",
                    "立刻收拾書包躲到防空洞"
                ],
                "answer": "使用 Google 圖片「以圖搜圖」逆向反搜原始發布時間與來源背景",
                "accepted": ["使用 Google 圖片「以圖搜圖」逆向反搜原始發布時間與來源背景"],
                "hint": "逆向圖像搜尋能揪出圖片何時、何地第一次在網際網路出現。",
                "explanation": "【圖像逆向查核】透過以圖搜圖比對圖片元數據與歷史發布紀錄，能迅速戳破造假謠言。"
            },
            {
                "qId": "U24-05",
                "type": "choice",
                "level": "基礎",
                "scenario": "在 LINE 上有一個廣受歡迎的防詐闢謠機器人，只要把可疑文章轉傳給它，它就會自動比對查核資料庫回覆真相。",
                "prompt": "下列哪一個是台灣常見的闢謠 LINE 官方查核工具？",
                "options": ["MyGoPen（麥擱騙）或 Cofacts 真的假的", "歡樂笑話產生器", "星座運勢天天抽", "隨機自動點名機"],
                "answer": "MyGoPen（麥擱騙）或 Cofacts 真的假的",
                "accepted": ["MyGoPen", "MyGoPen（麥擱騙）或 Cofacts 真的假的", "Cofacts", "麥擱騙"],
                "hint": "台語諧音「別再騙了」的 MyGoPen。",
                "explanation": "【全民闢謠防線】MyGoPen 與 Cofacts 真的假的串聯民間志工與專家，為大眾提供即時澄清。"
            },
            {
                "qId": "U24-06",
                "type": "cloze",
                "level": "基礎",
                "scenario": "網路釣魚郵件常會假冒「郵局包裹未領」、「Netflix 會員過期」，誘騙使用者點擊輸入信用卡卡號。",
                "prompt": "這類利用人類貪婪、恐懼或好奇心弱點進行詐騙的手法，在資訊安全中統稱為「[BLANK] 工程（Social Engineering）」？",
                "options": ["社交", "軟體", "土木", "化學"],
                "answer": "社交",
                "accepted": ["社交", "社交工程", "Social"],
                "hint": "人際交往、社會心理學的「社交」。",
                "explanation": "【社交工程手法】駭客不攻擊伺服器防火牆，而是利用人性的疏忽與情緒破口誘騙帳號密碼。"
            },
            {
                "qId": "U24-07",
                "type": "choice",
                "level": "基礎",
                "scenario": "為了保護個人 Instagram、Google 或 Discord 帳號不被輕易盜用，除了密碼之外應該開啟什麼安全機制？",
                "prompt": "在登入時除了輸入密碼，還需要透過手機驗證碼或金鑰確認身分的機制稱為？",
                "options": ["雙重驗證（2FA / 兩步驟驗證）", "把螢幕亮度調到最低", "把鍵盤倒過來打字", "每天將手機重新開機三次"],
                "answer": "雙重驗證（2FA / 兩步驟驗證）",
                "accepted": ["雙重驗證（2FA / 兩步驟驗證）", "雙重驗證", "2FA", "兩步驟驗證"],
                "hint": "Two-Factor Authentication（兩步驟驗證）。",
                "explanation": "【帳號金鐘罩】2FA 雙重驗證即使密碼不慎外洩，駭客沒有實體手機驗證碼依然無法登入。"
            },
            {
                "qId": "U24-08",
                "type": "choice",
                "level": "基礎",
                "scenario": "小芬收到一封自稱是銀行發來的 Email，要求點擊網址「www.bank-taipei-verify-login.xyz」進行密碼重設。",
                "prompt": "仔細觀察該網址，為什麼非常可疑屬於釣魚網站？",
                "options": [
                    "頂級網域名為廉價的 .xyz 且並非該銀行官方公告的正規網域（如 .com.tw）",
                    "因為英文字母是黑色的",
                    "因為這封信是在下午兩點寄達的",
                    "因為網址裡包含了英文單字"
                ],
                "answer": "頂級網域名為廉價的 .xyz 且並非該銀行官方公告的正規網域（如 .com.tw）",
                "accepted": ["頂級網域名為廉價的 .xyz 且並非該銀行官方公告的正規網域（如 .com.tw）"],
                "hint": "正規金融機構絕不會使用非官方的廉價網域（如 .xyz、.top）寄送密碼重設信件。",
                "explanation": "【網址真偽檢核】釣魚網站常註冊相似字（如用 1 代替 l）或可疑後綴，務必確認官方頂級域名。"
            },
            {
                "qId": "U24-09",
                "type": "cloze",
                "level": "基礎",
                "scenario": "評估一則網路健康新聞（例如：天天喝可樂可以治百病）是否可信時，應該查驗這篇文章背後是否有權威名醫具名背書。",
                "prompt": "在批判性資訊評估法則（CRAAP）中，檢驗作者專業資歷與發表機關公信力的準則是「[BLANK]（權威性 / 來源者資歷）」？",
                "options": ["Authority（權威性）", "Apple（蘋果）", "Angry（生氣）", "Audio（音訊）"],
                "answer": "Authority（權威性）",
                "accepted": ["Authority", "Authority（權威性）", "權威性", "權威"],
                "hint": "以英文字母 A 開頭，代表權威、專家認證。",
                "explanation": "【CRAAP 資訊檢驗模型】包含時效性（Currency）、相關性（Relevance）、權威性（Authority）、精確性（Accuracy）與目的（Purpose）。"
            },
            {
                "qId": "U24-10",
                "type": "choice",
                "level": "基礎",
                "scenario": "在社群平台上，演算法會根據使用者的點擊喜好不斷推薦相似立場的影片與貼文，讓人誤以為全世界所有人都跟自己想法一樣。",
                "prompt": "這種資訊被演算法封閉包圍、只聽得見符合自身偏好聲音的現象在傳播學中稱為？",
                "options": ["過濾泡泡（Filter Bubble）與同溫層回音室效應", "高頻聲音共振", "多核心並行運算", "虛擬記憶體分頁"],
                "answer": "過濾泡泡（Filter Bubble）與同溫層回音室效應",
                "accepted": ["過濾泡泡（Filter Bubble）與同溫層回音室效應", "過濾泡泡", "同溫層", "回音室"],
                "hint": "就像把自己關在透明泡泡裡，只看的見同溫層的想法。",
                "explanation": "【演算法偏見反思】過濾泡泡會強化既有偏見，特工必須主動跨出舒適圈閱讀多元立場觀點。"
            },
            # 5 題進階時事挑戰題
            {
                "qId": "U24-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【國際大選與認知作戰時事】近年全球數十個民主國家舉行大選期間，大量由境外伺服器操控的「AI 假帳號水軍兵團（Botnet）」在社群平台上日夜洗版發動認知作戰。",
                "prompt": "這類協同性造假行為（CIB，Coordinated Inauthentic Behavior）主要目的為何？",
                "options": [
                    "製造社會分裂仇恨、削弱大眾對民主體制的信任，並操弄公眾輿論方向",
                    "幫全體市民爭取免費搭乘高鐵的福利",
                    "測試各大社群平台伺服器的極限乘載容量",
                    "教導全世界國中生如何寫好作文"
                ],
                "answer": "製造社會分裂仇恨、削弱大眾對民主體制的信任，並操弄公眾輿論方向",
                "accepted": ["製造社會分裂仇恨、削弱大眾對民主體制的信任，並操弄公眾輿論方向"],
                "hint": "利用演算法與情緒性虛假言論激化社會矛盾，達成地緣政治影響力。",
                "explanation": "【認知戰防禦意識】具備批判思考與多源查證能力，是民主公民抵抗認知操弄的最強心防。"
            },
            {
                "qId": "U24-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【國際技術前沿時事】為了解決生成式 AI 圖片真假難辨的危機，包括 Google、Adobe、微軟在內的科技巨頭聯合發起「C2PA」開源技術標準規範。",
                "prompt": "C2PA 技術主要透過何種創新機制為 AI 或相機拍攝的數位照片建立身分證明？",
                "options": [
                    "在影像檔案中嵌入不可竄改的加密數位憑證（Content Credentials 數位內容憑證），記錄拍攝裝置、創作者與是否有經 AI 修改的完整歷程",
                    "在每一張照片正中央用黑筆手寫「真實」兩個大字",
                    "規定每位攝影師出門拍照都要有一名警察陪同",
                    "強制所有相機拍出來的照片容量都必須大於 1TB"
                ],
                "answer": "在影像檔案中嵌入不可竄改的加密數位憑證（Content Credentials 數位內容憑證），記錄拍攝裝置、創作者與是否有經 AI 修改的完整歷程",
                "accepted": ["在影像檔案中嵌入不可竄改的加密數位憑證（Content Credentials 數位內容憑證），記錄拍攝裝置、創作者與是否有經 AI 修改的完整歷程"],
                "hint": "數位履歷（Content Credentials）：就像食品營養標籤一樣清楚標示來源與修改成分。",
                "explanation": "【數位溯源機制】C2PA 憑證利用密碼學雜湊簽章，讓閱聽人點擊圖示即可透明檢驗產銷履歷。"
            },
            {
                "qId": "U24-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【台灣打詐法治時事】台灣立法院通過「打詐新四法」，要求境外網路廣告巨頭（如 Meta、Google）必須在台灣設立法律代表人並推動實名制。",
                "prompt": "若民眾遇到各類疑似電信或網路詐騙情境，台灣專屬 24 小時免費防詐諮詢檢舉專線是 [BLANK] 專線？",
                "options": ["165", "119", "110", "113"],
                "answer": "165",
                "accepted": ["165", "165專線", "165反詐騙"],
                "hint": "反詐騙專線號碼三個數字。",
                "explanation": "【防詐緊急應變】警政署 165 反詐騙專線提供即時諮詢與報案圈存止血，保護人民財產安全。"
            },
            {
                "qId": "U24-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【AI 幻覺問題時事】國中生使用 ChatGPT 或其他 AI 聊天機器人寫歷史報告時，發現 AI 竟然寫出：「鄭成功在台南開了一家連鎖珍珠奶茶店，還引進了 5G 基地台。」",
                "prompt": "這種生成式 AI 一本正經地捏造不存在事實的現象在電腦科學中稱為？",
                "options": ["AI 幻覺（AI Hallucination）", "量子糾纏當機", "主機板短路爆炸", "散熱風扇灰塵太多"],
                "answer": "AI 幻覺（AI Hallucination）",
                "accepted": ["AI 幻覺（AI Hallucination）", "AI 幻覺", "幻覺", "Hallucination"],
                "hint": "AI 根據機率預測下一個字，容易無中生有胡言亂語（幻覺現象）。",
                "explanation": "【AI 的局限性】大語言模型是文字機率預測器而非真理檢驗機，引用其回答務必嚴格二次查證。"
            },
            {
                "qId": "U24-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【金融資安時事】跨國跨行詐騙集團常利用「偽基站（Fake Base Station）」發送帶有釣魚簡訊的惡意基地台訊號，強迫方圓數百公尺內的手機降頻連線。",
                "prompt": "這類偽基站主要是利用了傳統行動通訊何種協定漏洞來繞過電信公司過濾？",
                "options": [
                    "強迫手機從具備相互認證的 4G/5G 降頻至缺乏伺服器身分認證的舊世代 2G GSM 網路進行廣播推播",
                    "直接透過自來水水管傳導高壓電訊號",
                    "利用使用者戴的有線耳機當作發射天線",
                    "把簡訊壓縮成聲音發給流浪貓狗"
                ],
                "answer": "強迫手機從具備相互認證的 4G/5G 降頻至缺乏伺服器身分認證的舊世代 2G GSM 網路進行廣播推播",
                "accepted": ["強迫手機從具備相互認證的 4G/5G 降頻至缺乏伺服器身分認證的舊世代 2G GSM 網路進行廣播推播"],
                "hint": "利用 2G 單向驗證的陳舊漏洞強制降頻實施簡訊詐騙廣播。",
                "explanation": "【通訊安全新知】現代智慧手機已支援在設定中手動關閉 2G 連線，以阻絕偽基站釣魚詐騙攻擊。"
            }
        ]
    }
    units.append(u24)

    # ==========================================
    # 單元 2-5：【資訊視覺化】專題簡報圖表與生活數據實踐
    # ==========================================
    u25 = {
        "unitId": "unit-2-5",
        "category": "第二章 資料與資訊應用專題",
        "unitTitle": "單元 2-5：【資訊視覺化】專題簡報圖表與生活數據實踐",
        "description": "學習根據數據關係選擇圖表（長條圖/折線圖/圓餅圖/散佈圖）與資訊圖表設計心法。",
        "questions": [
            {
                "qId": "U25-01",
                "type": "choice",
                "level": "基礎",
                "scenario": "小明要呈現台北市過去 12 個月「每月平均氣溫的起伏變化趨勢」，他應該選擇哪一種圖表最合適？",
                "prompt": "用來呈現數據隨「時間推進的連續趨勢與變化」最佳的圖表類型是？",
                "options": ["折線圖（Line Chart）", "圓餅圖（Pie Chart）", "雷達圖（Radar Chart）", "文字雲（Word Cloud）"],
                "answer": "折線圖（Line Chart）",
                "accepted": ["折線圖（Line Chart）", "折線圖", "Line Chart"],
                "hint": "點與點之間用線段相連，高低起伏一目了然。",
                "explanation": "【趨勢表現利器】折線圖橫軸代表時間序列，能最直觀呈現溫度、股價、身高等連續動態趨勢。"
            },
            {
                "qId": "U25-02",
                "type": "choice",
                "level": "基礎",
                "scenario": "班長要向導師報告校慶各組花費佔全班總支出 10,000 元的「百分比比例分布（如食材佔 40%、文具佔 30%）」。",
                "prompt": "用來呈現各項目佔「總體 100% 比例份額」最常見的圖表是？",
                "options": ["圓餅圖（Pie Chart）", "折線圖", "散佈圖", "甘特圖"],
                "answer": "圓餅圖（Pie Chart）",
                "accepted": ["圓餅圖（Pie Chart）", "圓餅圖", "Pie Chart"],
                "hint": "像切披薩或大餅一樣，每一塊扇形代表一個比例。",
                "explanation": "【比例結構展示】圓餅圖將圓形面積切分為不同比例，非常適合展示組成份額。"
            },
            {
                "qId": "U25-03",
                "type": "cloze",
                "level": "基礎",
                "scenario": "體育股長要對比七年級 10 個班級在拔河比賽中各自贏得的「勝場數多少」。",
                "prompt": "用來比較不同獨立類別之間「數量高低大小」最經典的圖表是 [BLANK] 條圖（Bar Chart）？",
                "options": ["長", "圓", "線", "散"],
                "answer": "長",
                "accepted": ["長", "長條圖", "柱狀圖", "長條"],
                "hint": "柱狀或長矩形的形狀。",
                "explanation": "【類別大小比較】長條圖透過長條柱子的高低長度，能最客觀直接對比不同組別的數值差距。"
            },
            {
                "qId": "U25-04",
                "type": "choice",
                "level": "基礎",
                "scenario": "自然老師想探討同學的「每日讀書時數」與「期末考成績」之間是否存在關聯性。",
                "prompt": "在平面座標軸上，以 (X, Y) 座標點呈現兩組連續變數相關趨勢的圖表稱為？",
                "options": ["散佈圖（Scatter Plot）", "圓形圖", "階層樹狀圖", "組織架構圖"],
                "answer": "散佈圖（Scatter Plot）",
                "accepted": ["散佈圖（Scatter Plot）", "散佈圖", "Scatter Plot"],
                "hint": "無數的散點分布在座標平面上觀察相關性（正相關/負相關）。",
                "explanation": "【變數關聯探索】散佈圖是科學研究中檢驗兩變數相關性的核心工具。"
            },
            {
                "qId": "U25-05",
                "type": "cloze",
                "level": "基礎",
                "scenario": "小華在設計簡報圖表時，把每一條長條柱漆成五顏六色，背景還放了刺眼的彩虹圖案，讓人完全看不清文字。",
                "prompt": "在專業資訊視覺化原則中，常常強調「Less is [BLANK]（少即是多）」，去除多餘裝飾才能凸顯數據焦點？",
                "options": ["more", "bad", "zero", "slow"],
                "answer": "more",
                "accepted": ["more", "More", "多"],
                "hint": "英文單字「更多」。",
                "explanation": "【資料圖表簡約美學】過多雜訊會干擾閱讀，高對比、留白與聚焦主色調是專業視覺化之道。"
            },
            {
                "qId": "U25-06",
                "type": "choice",
                "level": "基礎",
                "scenario": "某廠商在電視廣告宣傳新手機電池續航力，圖表從 95 小時開始畫起，刻意讓自己的柱子看起來是對手的三倍長，但實際上兩者只差了 2 小時。",
                "prompt": "這種在視覺化中截斷 Y 軸起點、誇大微小差距的圖表陷阱在資訊素養中稱為？",
                "options": ["誤導性圖表（Misleading Graph）", "超級精確圖表", "量子圖表", "國際標準圖表"],
                "answer": "誤導性圖表（Misleading Graph）",
                "accepted": ["誤導性圖表（Misleading Graph）", "誤導性圖表", "誤導"],
                "hint": "利用視覺比例錯覺刻意誤導觀眾判斷。",
                "explanation": "【識破圖表騙局】柱狀圖基準 Y 軸應從 0 開始，截斷座標軸常是商業廣告誇大效果的詐術。"
            },
            {
                "qId": "U25-07",
                "type": "choice",
                "level": "基礎",
                "scenario": "小智製作了一張「資訊圖表（Infographic）」海報，將複雜的垃圾分類法用可愛圖示、鮮明流程箭頭與關鍵字整合呈現。",
                "prompt": "相較於純粹密密麻麻的五千字文字企劃書，資訊圖表的最大優勢是？",
                "options": [
                    "降低認知負荷，讓讀者在短時間內快速抓住核心概念與邏輯脈絡",
                    "可以完全不需要經過大腦思考",
                    "可以讓檔案容量永遠維持在 0 位元組",
                    "保證看過的人從此不再產生任何垃圾"
                ],
                "answer": "降低認知負荷，讓讀者在短時間內快速抓住核心概念與邏輯脈絡",
                "accepted": ["降低認知負荷，讓讀者在短時間內快速抓住核心概念與邏輯脈絡"],
                "hint": "一張好圖勝過千言萬語，大幅提升大腦吸收效率。",
                "explanation": "【圖像傳播力】大腦處理圖像速度遠快於純文字，資訊圖表能有效提煉核心價值。"
            },
            {
                "qId": "U25-08",
                "type": "cloze",
                "level": "基礎",
                "scenario": "在簡報製作中，一張投影片如果塞了滿滿 20 行文字，聽眾根本看不清也記不住。",
                "prompt": "國際簡報大師常建議遵守「一頁 [BLANK] 觀念（One Slide, One Concept）」原則，保持頁面純粹精準？",
                "options": ["一", "十", "百", "零"],
                "answer": "一",
                "accepted": ["一", "一個", "1"],
                "hint": "數字 1。",
                "explanation": "【簡報核心法則】一頁投影片只傳達一個核心訊息，輔以高衝擊力視覺，說服力最強。"
            },
            {
                "qId": "U25-09",
                "type": "choice",
                "level": "基礎",
                "scenario": "小芬要向全班報告「國中三年各學期自己的社團參與時程表與活動里程碑」。",
                "prompt": "用來管理專案進度、展示不同任務開始與結束時間區間的橫向條狀圖表稱為？",
                "options": ["甘特圖（Gantt Chart）", "雷達圖", "盒鬚圖", "熱點圖"],
                "answer": "甘特圖（Gantt Chart）",
                "accepted": ["甘特圖（Gantt Chart）", "甘特圖", "Gantt Chart"],
                "hint": "以工程大師甘特（Gantt）命名的專案進度管理神器。",
                "explanation": "【專案時程視覺化】甘特圖橫軸為時間軸，長條塊標註任務起訖，是團隊協作掌控進度的必備工具。"
            },
            {
                "qId": "U25-10",
                "type": "choice",
                "level": "基礎",
                "scenario": "小張在報告簡報發表時，右手一直拿著雷射筆在投影片上瘋狂繞圈圈，眼睛只看著螢幕背對全班同學唸稿。",
                "prompt": "下列哪一項是口頭簡報發表的優良台風與溝通禮儀？",
                "options": [
                    "身體面向台下聽眾，保持自然目光接觸（Eye Contact），搭配生動語調與生活實例",
                    "從頭到尾把頭埋在講桌底下唸小抄",
                    "用最大的音量對著麥克風尖叫",
                    "閉上眼睛站在原地一動也不動"
                ],
                "answer": "身體面向台下聽眾，保持自然目光接觸（Eye Contact），搭配生動語調與生活實例",
                "accepted": ["身體面向台下聽眾，保持自然目光接觸（Eye Contact），搭配生動語調與生活實例"],
                "hint": "簡報的主角是講者，投影片只是輔助視覺鷹架。",
                "explanation": "【口語表達素養】眼神接觸與自信互動能建立與觀眾的情感共鳴，是專題成果發表成功的關鍵。"
            },
            # 5 題進階時事挑戰題
            {
                "qId": "U25-11",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【台灣開源資料與災害地圖時事】回顧台灣颱風豪雨或花蓮地震災害時，民間 g0v 零時政府黑客松與災害防救中心結合 Google Maps 繪製「即時土石流警戒與避難所地圖」。",
                "prompt": "將資料庫數值與真實地理空間座標（GIS）疊加呈現的互動式視覺化地圖，其最大的應變救災優勢是？",
                "options": [
                    "直觀掌握災情地理分布邊界與避難逃生路徑，讓救災指揮官能秒級精準調派前線人力物資",
                    "可以讓災區的雨水瞬間逆流回天上",
                    "可以讓手機電量直接變成無限大",
                    "強制禁止任何颱風靠近台灣"
                ],
                "answer": "直觀掌握災情地理分布邊界與避難逃生路徑，讓救災指揮官能秒級精準調派前線人力物資",
                "accepted": ["直觀掌握災情地理分布邊界與避難逃生路徑，讓救災指揮官能秒級精準調派前線人力物資"],
                "hint": "空間地理視覺化將抽象災情轉化為一目了然的逃生與救援動線。",
                "explanation": "【GIS 空間大數據】地理資訊視覺化結合開放資料，是現代智慧防災不可或缺的生命救援中樞。"
            },
            {
                "qId": "U25-12",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【科技大廠商業智慧時事】Netflix、Spotify 與台積電內部大量建置「動態商業智慧儀表板（BI Dashboard，如 Power BI、Tableau）」。",
                "prompt": "相較於傳統每個月底印出厚厚一本「靜態紙本報表」，動態互動式儀表板（Dashboard）的核心價值是？",
                "options": [
                    "資料串接即時資料庫自動更新，使用者可點擊切片器進行多維度下鑽（Drill-down）探索原因",
                    "儀表板會自動把所有營收數字乘以十倍讓老闆開心",
                    "可以完全不必繳電費使用",
                    "紙本報表容易被老鼠咬壞，但電腦永遠不會有任何故障"
                ],
                "answer": "資料串接即時資料庫自動更新，使用者可點擊切片器進行多維度下鑽（Drill-down）探索原因",
                "accepted": ["資料串接即時資料庫自動更新，使用者可點擊切片器進行多維度下鑽（Drill-down）探索原因"],
                "hint": "動態交互探索：從總覽到細部一鍵點擊展開，即時監控營運指標。",
                "explanation": "【商業智慧革命】BI 儀表板實現數據即時流動與靈活探索，大幅縮短企業決策反應鏈。"
            },
            {
                "qId": "U25-13",
                "type": "cloze",
                "level": "挑戰",
                "scenario": "【數據倫理時事】在呈現薪資所得或家庭收入等「極端值極為懸殊（偏態分布）」的社會大數據時，若使用算術平均數往往會被極少數超級富豪拉高，造成「平民薪資被平均」的假象。",
                "prompt": "統計學家通常建議採用排序在最正中間的數值「[BLANK] 位數（Median）」來客觀代表一般大眾真實收入水準？",
                "options": ["中", "高", "低", "零"],
                "answer": "中",
                "accepted": ["中", "中位數", "中位"],
                "hint": "排在隊伍正中央的那個人持有的數值。",
                "explanation": "【統計量選擇智慧】中位數不易受極端極大值干擾，在財富、所得等傾斜分布中比平均數更具代表性。"
            },
            {
                "qId": "U25-14",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【無障礙通用設計時事】全球約有數億人口具有色盲或色弱視覺特徵。在設計資訊圖表時，若單純使用紅綠兩色對比，紅綠色盲讀者會看到一片灰濛濛無法辨別。",
                "prompt": "符合 Web 通用無障礙設計（Accessibility / WCAG）標準的友善圖表設計策略是？",
                "options": [
                    "除了顏色之外，同時加上不同的「幾何形狀、線條虛實或文字標籤」進行雙重編碼辨識",
                    "要求色盲讀者自行購買高價特殊眼鏡否則禁止瀏覽",
                    "把整張圖表刪除全部改回文字描述",
                    "在網頁背景播放超大聲的警報鈴聲"
                ],
                "answer": "除了顏色之外，同時加上不同的「幾何形狀、線條虛實或文字標籤」進行雙重編碼辨識",
                "accepted": ["除了顏色之外，同時加上不同的「幾何形狀、線條虛實或文字標籤」進行雙重編碼辨識"],
                "hint": "雙重編碼（Dual-coding）：不依賴單一顏色維度傳遞資訊。",
                "explanation": "【數位平權通用設計】無障礙設計讓身心障礙者享有平等的資訊獲取權利，是優秀設計師的專業品格。"
            },
            {
                "qId": "U25-15",
                "type": "choice",
                "level": "挑戰",
                "scenario": "【國際跨文化傳播時事】國中生進行全球氣候倡議專題簡報，聽眾來自不同國家與文化背景。",
                "prompt": "在跨國跨文化簡報溝通中，色彩心理學提醒我們必須特別注意何種現象？",
                "options": [
                    "不同文化對顏色的象徵意涵不同（例如：西方股市綠跌紅漲、台灣與東亞股市紅漲綠跌；白色在部分文化代表純潔，在部分文化代表喪葬）",
                    "全世界所有人類對所有顏色的感受完全一模一樣絕對沒有任何差異",
                    "不同國家的人只能看懂用黑筆寫的字",
                    "簡報一律只能在沒有燈光的地下室發表"
                ],
                "answer": "不同文化對顏色的象徵意涵不同（例如：西方股市綠跌紅漲、台灣與東亞股市紅漲綠跌；白色在部分文化代表純潔，在部分文化代表喪葬）",
                "accepted": ["不同文化對顏色的象徵意涵不同（例如：西方股市綠跌紅漲、台灣與東亞股市紅漲綠跌；白色在部分文化代表純潔，在部分文化代表喪葬）"],
                "hint": "顏色帶有強烈的文化符號屬性，跨國溝通需因地制宜。",
                "explanation": "【全球文化素養】理解色彩與符號的文化脈絡，避免溝通誤解，是成為世界級特工的關鍵跨域視野。"
            }
        ]
    }
    units.append(u25)

    return units
