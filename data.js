// 雲端神搜特工隊 - 題庫資料 (契合 108 課綱南一國中資訊科技 1上 Ch2-1 雲端運算服務)
// 共 3 大關卡，每關各 10 題，全 30 題，以國中生生活與學習實例情境為主幹

const QUEST_LEVELS = [
  {
    id: 1,
    title: "第一關：【基底整備】雲端與瀏覽器實戰特訓",
    subtitle: "掌握 Chrome 快捷鍵與雲端運算核心機制",
    badge: "初出茅廬特工",
    icon: "fa-solid fa-cloud-bolt",
    themeColor: "#38bdf8",
    questions: [
      {
        id: "Q1-01",
        title: "分頁手滑誤關的救援術",
        story: "小明正在查自然科『台灣特有種鳥類』分組報告資料，滑鼠一滑不小心把剛找到的超珍貴參考網頁分頁按「✕」關閉了！組員都在等他回傳連結，急得滿頭大汗。",
        instruction: "請輸入 Chrome 瀏覽器最神奇的【還原已關閉分頁】快捷鍵組合（請填入最後一顆關鍵字母）：",
        type: "cloze",
        textTemplate: "小明不需要手忙腳亂去翻瀏覽紀錄，只要在鍵盤上同時按下：Ctrl + Shift + {input1} 鍵，剛被關閉的分頁就會神奇地重新彈回來！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入單一按鍵字母",
            accepted: ["T", "t"],
            hint: "Tab（分頁）的字首英文字母，不區分大小寫！"
          }
        ],
        explanation: "【快捷鍵解析】在 Chrome 瀏覽器中，按下 Ctrl+Shift+T 可以按照關閉順序倒序還原剛被關閉的分頁，是查資料時最實用防手滑的神技！"
      },
      {
        id: "Q1-02",
        title: "寶藏網頁的一秒收藏",
        story: "小華在準備國中會考英文科，偶然發現了一個完全免費的『國中必備 1200 單字發音測驗網』。他希望每天打開瀏覽器都能在頂端書籤列直接點開，不用每次重打網址。",
        instruction: "請完成快速將當前網頁加入書籤的克漏字填空：",
        type: "cloze",
        textTemplate: "小華除了可以點選網址列右側的【{input1}】星號圖示，也可以直接按下鍵盤快捷鍵：Ctrl + {input2} 鍵，將當前分頁儲存為書籤！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入符號或名稱（例如：★ 或 星星）",
            accepted: ["★", "星星", "星號", "*"],
            hint: "網址列右方常見的五角星符號！"
          },
          {
            key: "input2",
            placeholder: "輸入按鍵字母",
            accepted: ["D", "d"],
            hint: "英文「Destination」或「Bookmark」快捷鍵，字母為 D！"
          }
        ],
        explanation: "【課本 P.136】點選網址旁邊的「★」或按下 Ctrl+D，可以將當前網頁加入書籤，方便下次快速訪問。"
      },
      {
        id: "Q1-03",
        title: "借用公用電腦的隱形斗篷",
        story: "第八節放學後，阿翰到學校圖書館的公用電腦登入個人 Google 帳號查詢段考成績。但他非常擔心自己離開後，瀏覽紀錄或 Google 帳號忘記登出被下一位借用的同學盜用。",
        instruction: "請協助阿翰穿上數位防護，填入正確的瀏覽模式與快捷鍵：",
        type: "cloze",
        textTemplate: "阿翰應該開啟【{input1}】模式（Incognito Mode），此模式在關閉後不會在電腦中保留瀏覽紀錄與下載紀錄。在 Chrome 中啟動它的快捷鍵是：Ctrl + {input2} + N。",
        inputs: [
          {
            key: "input1",
            placeholder: "請填入4字模式名稱",
            accepted: ["無痕模式", "無痕", "私密瀏覽", "無痕瀏覽"],
            hint: "課本 P.136，像是戴了墨鏡帽子不留痕跡的模式！"
          },
          {
            key: "input2",
            placeholder: "請填入中間的按鍵名",
            accepted: ["Shift", "shift"],
            hint: "鍵盤兩側通常用來切換大小寫或組合鍵的 Shift 鍵！"
          }
        ],
        explanation: "【課本 P.136】無痕模式（Incognito Mode）是一種私密瀏覽模式，不保留瀏覽與下載紀錄，快捷鍵為 Ctrl + Shift + N。"
      },
      {
        id: "Q1-04",
        title: "滾動長文章時的游標瞬移",
        story: "小萱正在看一篇長達萬字的科技專欄長文，已經滑到網頁最底下。這時她突然想要重新搜尋另一位作者的名字，她不想大費周章用滑鼠滾輪往上滾一分鐘去點搜尋列。",
        instruction: "請填入瀏覽器中一鍵聚焦搜尋列的神奇按鍵：",
        type: "cloze",
        textTemplate: "在 Chrome 瀏覽器中，小萱只要輕按鍵盤上的斜線鍵【{input1}】，游標就會瞬間重新聚焦回到搜尋列，可以直接打字搜尋！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入符號（斜線）",
            accepted: ["/", "／"],
            hint: "鍵盤右下方問號下方的那顆正斜線符號！"
          }
        ],
        explanation: "【課本 P.140】使用按鍵「 / 」是在瀏覽器中快速回到搜尋列的快捷鍵，能夠迅速進行新一輪搜尋。"
      },
      {
        id: "Q1-05",
        title: "天上的那朵雲到底是甚麼？",
        story: "資訊課時老師問大家：『我們天天在說雲端硬碟、雲端運算，那朵「雲（Cloud）」到底是指什麼？它的核心運作原理又是什麼呢？』",
        instruction: "請根據課本第 135 頁內容完成觀念填空：",
        type: "cloze",
        textTemplate: "「雲端」一詞源於工程師過去在網路結構圖上常以一朵雲代表【{input1}】；而雲端運算就是將資料儲存與運算，透過網路交由遠端的【{input2}】處理，使用者只要能透過終端登入即可操作。",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入代表的網路體系",
            accepted: ["網際網路", "網路", "Internet", "internet"],
            hint: "把全世界電腦連結在一起的網路系統！"
          },
          {
            key: "input2",
            placeholder: "輸入處理運算的設備名稱",
            accepted: ["伺服器", "遠端伺服器", "服務供應商", "遠端主機"],
            hint: "提供雲端運算資源與存放資料的強大遠端電腦！"
          }
        ],
        explanation: "【課本 P.135】「雲端」源於以雲朵代表網際網路；雲端運算（Cloud Computing）則是將儲存與運算透過網路交由遠端伺服器處理。"
      },
      {
        id: "Q1-06",
        title: "隨身碟摔壞的悲劇與雲端救贖",
        story: "國二的小凱曾把準備了一整學期的童軍露營影片存在隨身碟中，結果帶去學校途中不小心摔斷了接頭，影片全部遺失。現在他全面改用雲端硬碟。",
        instruction: "請填入雲端儲存打破實體限制的兩大特色優勢：",
        type: "cloze",
        textTemplate: "傳統隨身碟容易因遺失、中毒或損壞而毀損；而雲端硬碟將實體硬體資源進行【{input1}】化，只要手邊有聯網裝置，就能打破時間與地點限制【{input2}】存取檔案！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入實體轉虛擬的詞彙",
            accepted: ["虛擬", "虛擬化", "軟體"],
            hint: "課本 P.135『將實體資源○○化』！"
          },
          {
            key: "input2",
            placeholder: "輸入隨時隨地的四字成語或概念",
            accepted: ["隨時隨地", "隨時", "跨裝置", "自由"],
            hint: "不受時間地點限制，四個字：隨○隨○！"
          }
        ],
        explanation: "【課本 P.135/145】雲端將實體硬碟、主機虛擬化，不受時間地點限制，提供隨時隨地存取與備份的便利性。"
      },
      {
        id: "Q1-07",
        title: "Google 雲端辦公四寶點將錄",
        story: "國中資訊科技課分組專案啟動！每位組員各負責一項任務，請協助他們配對最適合的 Google 雲端應用程式（文件、試算表、簡報、表單）。",
        instruction: "請依情境填入正確的 Google 應用程式名稱：",
        type: "cloze",
        textTemplate: "① 設計問卷調查全校同學對營養午餐菜色的滿意度：Google 【{input1}】\n② 統計園遊會各攤位收支並自動繪製圓餅圖：Google 【{input2}】\n③ 到講台進行 10 分鐘口頭報告投影展示重點：Google 【{input3}】\n④ 4 位組員共同撰寫 3000 字的童軍露營心得報告：Google 【{input4}】",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入應用名稱",
            accepted: ["表單", "Forms", "Google表單"],
            hint: "常用於收集資料與問卷統計的工具！"
          },
          {
            key: "input2",
            placeholder: "輸入應用名稱",
            accepted: ["試算表", "Sheets", "Google試算表"],
            hint: "擅長數字計算、公式統計與圖表的表格工具！"
          },
          {
            key: "input3",
            placeholder: "輸入應用名稱",
            accepted: ["簡報", "Slides", "Google簡報"],
            hint: "投影演說播放幻燈片的專用工具！"
          },
          {
            key: "input4",
            placeholder: "輸入應用名稱",
            accepted: ["文件", "Docs", "Google文件"],
            hint: "像 Word 一樣用來打文章編排文字的工具！"
          }
        ],
        explanation: "【課本 P.151】Google 雲端應用程式四寶：表單（問卷調查）、試算表（數據統計）、簡報（投影報告）、文件（圖文排版編輯）。"
      },
      {
        id: "Q1-08",
        title: "防範未然的資料備份操作",
        story: "資訊老師警告大家：『手機摔碎或電腦硬碟損壞隨時會發生，平常一定要落實資料備份！』小智準備將電腦裡累積三年的吉他社練習影音做好備份雙保險。",
        instruction: "請填入雲端雙向傳輸的操作術語：",
        type: "cloze",
        textTemplate: "將電腦本機的檔案傳送並存放在遠端 Google 雲端硬碟建立副本，這個動作稱為【{input1}】（Upload）；若日後電腦壞了，從雲端硬碟抓回新電腦則稱為【{input2}】（Download）。",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入2字操作動作",
            accepted: ["上傳", "上傳資料", "上載"],
            hint: "將資料從下方本機推往天上的雲端！"
          },
          {
            key: "input2",
            placeholder: "輸入2字操作動作",
            accepted: ["下載", "下載資料", "下載檔案"],
            hint: "將天上的檔案抓回到下方自己的電腦中！"
          }
        ],
        explanation: "【課本 P.149-150】上傳（Upload）是從本機送上雲端備份，下載（Download）則是從雲端取回本地裝置。"
      },
      {
        id: "Q1-09",
        title: "雲端服務的免安裝瘦身魔法",
        story: "小敏借用阿公的老舊小筆電，硬碟容量只剩下 1GB，根本不可能安裝好幾 GB 的 Office 軟體。但小敏卻依然能順暢地完成老師派發的線上作業。",
        instruction: "請根據課本第 151 頁敘述完成克漏字：",
        type: "cloze",
        textTemplate: "Google 的雲端應用程式透過雲端運算技術，使用者只要透過【{input1}】就能直接開啟編輯，完全【{input2}】另外安裝龐大軟體，大幅節省時間與硬碟空間！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入用來上網的軟體種類",
            accepted: ["瀏覽器", "網頁瀏覽器", "Chrome", "chrome"],
            hint: "我們平常瀏覽網頁使用的程式（例如 Chrome）！"
          },
          {
            key: "input2",
            placeholder: "輸入2字否定詞",
            accepted: ["不用", "不需要", "免", "免於"],
            hint: "課本 P.151：『可以直接使用 ○○ 另外安裝軟體』！"
          }
        ],
        explanation: "【課本 P.151】雲端應用程式最大優勢之一：直接在瀏覽器執行，免安裝軟體、減少維護更新時間與電腦負擔。"
      },
      {
        id: "Q1-10",
        title: "雲端資源的自動化管理魔力",
        story: "每到學期末，全校上千名學生同時湧入雲端平台繳交資訊作業，但系統卻不會當機或塞車崩潰。這背後仰賴的是雲端運算強大的管理特性。",
        instruction: "請填入雲端伺服器後台具備的管理特性：",
        type: "cloze",
        textTemplate: "根據課本第 135 頁，雲端具有高度【{input1}】的管理功能，可以根據線上使用量動態進行資源【{input2}】與擴充，讓運算效率保持最佳化！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入3字特性（自...）",
            accepted: ["自動化", "自動"],
            hint: "不需要工程師人工守在螢幕前手動切換的特性！"
          },
          {
            key: "input2",
            placeholder: "輸入2字名詞（分...或配...）",
            accepted: ["配置", "分配", "調配"],
            hint: "課本 P.135：『資源○○、擴充、監控』！"
          }
        ],
        explanation: "【課本 P.135】雲端伺服器具備高度自動化管理功能（資源配置、擴充、負載監控），能彈性且有效率地分配運算資源。"
      }
    ]
  },
  {
    id: 2,
    title: "第二關：【雷達開展】搜尋初階偵探挑戰",
    subtitle: "學會關鍵字精煉、範圍限定與多媒體圖像搜尋",
    badge: "網路雷達偵探",
    icon: "fa-solid fa-magnifying-glass-location",
    themeColor: "#10b981",
    questions: [
      {
        id: "Q2-01",
        title: "拒絕廢話！關鍵字去蕪存菁術",
        story: "國一新生小偉在 Google 搜尋列打了一整串：『請問一下老師有沒有人知道今年台南市舉辦國中大隊接力比賽的確定日期是哪一天啊麻煩告訴我謝謝』，結果跳出一堆無關的論壇閒聊。",
        instruction: "搜尋時應避免冗長敘述，提取最精簡的核心關鍵字。請幫小偉把關鍵字簡化為【地區】與【賽事核心】兩個簡潔詞彙（中間空一格）：",
        type: "simulation_search",
        targetCriteria: {
          mustInclude: ["台南", "大隊接力"],
          mustNotInclude: ["請問", "謝謝", "有沒有人", "麻煩", "啊"],
          maxKeywords: 4
        },
        defaultQuery: "請問一下老師有沒有人知道今年台南市舉辦國中大隊接力比賽的確定日期是哪一天啊麻煩告訴我謝謝",
        placeholder: "例如：台南 大隊接力 日期",
        explanation: "【課本 P.138】想搜尋特定資料時，應使用簡潔詞彙描述重點，避免句子過於複雜或冗長，才能確保搜尋引擎精準抓取！"
      },
      {
        id: "Q2-02",
        title: "交集搜尋的空格（AND）魔法",
        story: "班級聯絡簿上寫著：『明天童軍課請自備童軍繩與指北針』。小英想上網查童軍繩打結教學，但只打『繩子』搜尋結果太廣泛（跳出一堆跳繩、拔河繩、手鍊繩）。",
        instruction: "請填入在搜尋列中同時鎖定兩個關鍵字的運算方式：",
        type: "cloze",
        textTemplate: "小英在搜尋列輸入『童軍繩』之後，按下鍵盤上的【{input1}】鍵再輸入『打結教學』，搜尋引擎就會自動尋找【同時包含】這兩個詞彙的網頁（交集 AND 概念）。",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入鍵盤按鍵或符號名稱",
            accepted: ["空白", "空格", "空白鍵", "空格鍵", "Space", "space"],
            hint: "鍵盤最長的那顆橫條按鍵！"
          }
        ],
        explanation: "【課本 P.138】在 Google 搜尋中，關鍵字之間的『空格』即代表邏輯交集（AND），網頁必須同時涵蓋輸入的所有詞語。"
      },
      {
        id: "Q2-03",
        title: "減號（-）排除討厭的干擾項",
        story: "週末阿明全家要去台南旅遊吃美食，但因為阿明對『海鮮』嚴重過敏，他想找台南知名小吃，但希望所有搜尋結果徹底剔除『海鮮』相關的蚵仔煎、蝦捲、海產粥。",
        instruction: "請在模擬搜尋列輸入含有【排除指令】的精準搜尋關鍵字：",
        type: "simulation_search",
        targetCriteria: {
          mustInclude: ["台南", "美食"],
          mustExcludeWithMinus: "海鮮" // 必須包含 -海鮮
        },
        defaultQuery: "台南 美食",
        placeholder: "請在美食後方加上減號排除海鮮（例如：台南 美食 -海鮮）",
        explanation: "【課本搜尋技巧】在不要出現的關鍵字前面加上減號『-』（注意減號前方需有空格，減號後方與要排除的字詞緊緊相連無空格），即可強制濾除該內容！"
      },
      {
        id: "Q2-04",
        title: "穿越時空！連續數值範圍『..』",
        story: "社會科老師要求大家整理：『2018年 到 2023年 之間，台灣發生的重大颱風事件與降雨量統計』。小美不想一筆一筆年分慢慢查。",
        instruction: "請根據課本第 137 頁，填入鎖定數值範圍的連續特殊符號：",
        type: "cloze",
        textTemplate: "限定搜尋特定數值或年代區間時，只要在兩個數字中間加上【{input1}】連續符號（例如輸入：台灣颱風 2018{input1}2023），就能迅速鎖定該範圍內的結果！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入特殊符號（例如兩顆點）",
            accepted: ["..", "兩個點", "二個點", "兩點"],
            hint: "鍵盤上的小數點連續打兩次！"
          }
        ],
        explanation: "【課本 P.137】在兩個數值中間加上『..』（兩點），能快速鎖定搜尋範圍，只呈現符合特定數值或年份區間的精準資訊。"
      },
      {
        id: "Q2-05",
        title: "揪出五年前舊聞的『搜尋工具』",
        story: "小強在查『最新青少年手機使用時間調查報告』，結果搜尋結果第一頁跳出來的文章居然是 2012 年寫的舊資料（那時候連 5G 都還沒有）！",
        instruction: "請填入 Google 搜尋頁面上快速篩選最新發布日期的功能名稱：",
        type: "cloze",
        textTemplate: "小強應在搜尋結果頁面的搜尋列下方，點選【{input1}】按鈕，打開篩選選單將『不限時間』調整為『過去一年』或『過去一個月』，就能立即取得最新資訊！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入2字功能名稱",
            accepted: ["工具", "搜尋工具", "Tools", "tools"],
            hint: "課本 P.142：點選『○○』進行篩選，可以節省時間提高效率！"
          }
        ],
        explanation: "【課本 P.142】點選搜尋列下方的「工具」（Tools），可以依據時間（過去一小時、過去24小時、過去一年）或特定國家語言進行精確時間過濾。"
      },
      {
        id: "Q2-06",
        title: "路邊叫不出名字的奇花異草",
        story: "生物課戶外踏青時，小玉在校園圍牆邊看到一株長相非常奇特、開滿紫色斑點小花的植物，但查遍課本索引也想不出它的名字，根本不知道從何打字搜尋起。",
        instruction: "請填入 Google 可以直接利用照片尋找答案的強大功能：",
        type: "cloze",
        textTemplate: "在不知道確切名稱或名詞的情況下，小玉可以拿出手機拍下照片，使用 Google 提供的【{input1}】功能（或 Google Lens 智慧鏡頭），上傳照片比對圖樣找出物種名稱！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入4字搜尋功能",
            accepted: ["以圖搜圖", "以圖尋圖", "Google Lens", "智慧鏡頭", "圖片搜尋"],
            hint: "課本 P.142：除了文字外，Google 提供『以○搜○』功能！"
          }
        ],
        explanation: "【課本 P.142】以圖搜圖（Google Lens）能夠透過圖像辨識尋找相關內容，在不知道事物名稱、地標或動植物時格外管用。"
      },
      {
        id: "Q2-07",
        title: "火眼金睛識破行銷廣告陷阱",
        story: "小志想買一雙實戰籃球鞋，在 Google 搜尋『推薦籃球鞋評測』。結果前兩名出現的店家商品看起來超誘人，但仔細一看標題上方有特殊的標註字樣。",
        instruction: "請填入 Google 搜尋結果中標記廠商付費行銷的字眼：",
        type: "cloze",
        textTemplate: "搜尋結果排在最前面的項目旁若標示有【{input1}】或『Ad』字樣，代表這是廠商付費推播的商業行銷資訊，並非客觀權威的演算法自然排名結果，學生閱讀時應提高警覺！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入3字或2字標籤詞彙",
            accepted: ["贊助商", "廣告", "贊助"],
            hint: "目前 Google 搜尋在付費廣告前會標註的繁體中文名稱（贊○○ 或 廣○）！"
          }
        ],
        explanation: "【數位素養】辨識「贊助商（Sponsored）」或廣告標籤是資訊科技的重要素養，避免將廠商商業宣傳誤認為客觀教學或評測文獻。"
      },
      {
        id: "Q2-08",
        title: "迷思破除！燙傷正確急救五字訣",
        story: "課本第 141 頁牛刀小試案例：小偉不小心被剛煮沸的泡麵熱湯燙到手臂，鄰居阿姨跑來說：『趕快抹醬油跟牙膏在傷口上！』小偉覺得有危險，立刻上網搜尋衛福部官網求證。",
        instruction: "請填出經搜尋驗證後，正確醫學燙傷急救五字口訣的前兩字：",
        type: "cloze",
        textTemplate: "絕對不能塗抹醬油、牙膏或牙粉！正確的急救五步驟依序為：【{input1}】（流動冷水15-30分鐘）、【{input2}】（水中小心脫去衣物）、泡、蓋、送！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入第1步（單一動詞）",
            accepted: ["沖"],
            hint: "用乾淨冷水沖洗降溫！"
          },
          {
            key: "input2",
            placeholder: "輸入第2步（單一動詞）",
            accepted: ["脫"],
            hint: "在水中輕輕脫去覆蓋的衣物！"
          }
        ],
        explanation: "【課本 P.141 牛刀小試】燙傷急救標準口訣是『沖、脫、泡、蓋、送』，網路偏方塗醬油或牙膏會導致傷口感染甚至二次傷害！"
      },
      {
        id: "Q2-09",
        title: "打字未完，先知已至的貼心輔助",
        story: "小琳在鍵盤上剛敲下『國中生 自主』五個字，搜尋框底下就自動飄出一列候選清單：『國中生自主學習計畫範例』、『國中生自主學習心得』。",
        instruction: "請填入這項能預判搜尋意圖、加速輸入的功能名稱：",
        type: "cloze",
        textTemplate: "這種在打字時搜尋引擎根據熱門趨勢與關聯性預測輸入內容的功能，稱為搜尋【{input1}】（Autocomplete）或搜尋建議，能幫我們省下打字時間。",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入4字名詞",
            accepted: ["自動完成", "搜尋建議", "自動建議", "建議字詞"],
            hint: "四個字：自○完○ 或 搜○建○！"
          }
        ],
        explanation: "【搜尋實務】Google 自動完成（Autocomplete）能根據全球大數據與地理位置推薦熱門關聯詞，也是快速掌握大眾關注點的好幫手。"
      },
      {
        id: "Q2-10",
        title: "查韓團英文簡稱的智慧搜尋",
        story: "課本第 143 頁牛刀小試：防彈少年團席捲歐美登上葛萊美舞台。同學想查他們在聯合國發表演說的完整英文稿，如果打全名太冗長容易出錯。",
        instruction: "請在模擬搜尋列輸入最精準的簡稱與主題關鍵字（包含該團體的 3 個大寫英文字母簡稱）：",
        type: "simulation_search",
        targetCriteria: {
          mustInclude: ["BTS", "聯合國"],
          maxKeywords: 4
        },
        defaultQuery: "防彈少年團在聯合國演講說了什麼內容英文演講稿",
        placeholder: "例如：BTS 聯合國 演講",
        explanation: "【課本 P.143 牛刀小試】善用知名專有名詞縮寫（如 BTS）搭配關鍵主題（聯合國），能迅速過濾雜訊，直接鎖定官方新聞稿！"
      }
    ]
  },
  {
    id: 3,
    title: "第三關：【神搜奧義】進階指令與雲端共創密碼",
    subtitle: "掌握 site、filetype、引號精確比對與 Google 權限安全",
    badge: "雲端神搜大師",
    icon: "fa-solid fa-user-shield",
    themeColor: "#a855f7",
    questions: [
      {
        id: "Q3-01",
        title: "一字不差！雙引號的完全吻合封印",
        story: "小宣在歷史課本看到一句名言：『生活不只有眼前的苟且，還有詩和遠方的田野』。他想知道這句話最初的確切出處是哪一本書或哪一首歌。但直接打上去，搜尋引擎會把『生活』、『眼前的苟且』拆散出現在各個無關網頁中。",
        instruction: "請填入強制搜尋引擎進行【完全吻合精確搜尋】所使用的符號：",
        type: "cloze",
        textTemplate: "為了強制搜尋結果必須一字不差地連續出現整句名言，小宣必須在名言關鍵字的前後加上一組半形【{input1}】（例如：\"生活不只有眼前的苟且\"）！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入符號或名稱（如：\"\" 或 雙引號）",
            accepted: ["\"\"", "雙引號", "\"", "引號", "半形雙引號"],
            hint: "課本 P.139：在關鍵字前後加上『○○○』精準搜尋！"
          }
        ],
        explanation: "【課本 P.139】使用雙引號「\" \"」進行精確搜尋，搜尋引擎只會回傳與引號內關鍵字完全吻合且順序相同的結果，有效過濾拼湊出來的無關內容。"
      },
      {
        id: "Q3-02",
        title: "只要簡報檔！filetype 指定格式術",
        story: "下週地理課要輪到小組上台報告『台灣板塊構造與地震帶分布』。組長小華想找現成的簡報範本或學長姐留下的演報檔案來參考排版結構，但他不要一般網頁文章，只要 PowerPoint 簡報檔案！",
        instruction: "請在模擬搜尋列輸入包含檔案格式篩選指令的精準關鍵字：",
        type: "simulation_search",
        targetCriteria: {
          mustInclude: ["台灣板塊", "filetype:pptx"],
          acceptAlternativeTerms: [["filetype:ppt", "filetype:pptx"]]
        },
        defaultQuery: "台灣板塊 地震",
        placeholder: "例如：台灣板塊 filetype:pptx",
        explanation: "【課本 P.140】使用「filetype:副檔名」（如 filetype:pptx、filetype:pdf、filetype:docx），能夠鎖定特定文件類型，一秒抓出專業簡報或研究報告！"
      },
      {
        id: "Q3-03",
        title: "拒絕詐騙假網站！site 限定教育部與學校",
        story: "國三會考前夕，小美想下載歷屆教育會考的『數學科正式考題與非選計分規準』。網路上有很多補習班的釣魚連結跟假下載點。她希望只在全台灣的『教育學術機關（國高中與教育部）』網站中搜尋。",
        instruction: "請完成鎖定台灣教育學術網域的進階指令填空：",
        type: "cloze",
        textTemplate: "台灣學校與教育部的官方專屬網域名稱縮寫為 edu.tw。小美只要在關鍵字後方加上指令【{input1}】:edu.tw，搜尋結果就會全部來自合法學校或教育部網站！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入4字英文指令",
            accepted: ["site", "SITE", "Site"],
            hint: "英文代表「網站」的四個字母指令！"
          }
        ],
        explanation: "【進階搜尋技巧】「site:網域名稱」能將搜尋範圍完全限定在特定網站或網域架構下，例如 site:edu.tw 僅限教育單位、site:gov.tw 僅限政府機關。"
      },
      {
        id: "Q3-04",
        title: "疾病管制署正宗公文！鎖定台灣政府機關",
        story: "最近班上好幾位同學請流感病假，班代想要印製一份由衛生福利部疾病管制署發布的最新『校園腸病毒與流感防疫指引』貼在公佈欄，以確保內容百分之百具備法律與醫學權威性。",
        instruction: "請填入台灣政府專屬網域的英文縮寫代碼：",
        type: "cloze",
        textTemplate: "所有台灣政府公家機關網站的網址結尾都是 .gov.tw。班代可以在搜尋列輸入：流感防疫指引 site:【{input1}】.tw，瞬間排除所有民間未經證實的農場文章！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入3字政府縮寫代碼",
            accepted: ["gov", "GOV", "Gov"],
            hint: "Government（政府）前三個英文字母！"
          }
        ],
        explanation: "【資安辨識素養】政府機關專用頂級網域為 gov.tw（如衛福部 mohw.gov.tw），使用 site:gov.tw 搜尋能確保取得最官方權威且真實的第一手公文與衛教政策。"
      },
      {
        id: "Q3-05",
        title: "神搜大師的終極複合指令考驗",
        story: "資訊老師出了一道終極考題：『請組裝出一條同時包含【108課綱資訊科技】、限定在【台灣教育體系網站（edu.tw）】且指定下載【PDF 格式文件】的高階複合搜尋指令！』",
        instruction: "請在下方的 Google 模擬搜尋框內鍵入這道複合指令（順序不拘，各元素以空格隔開）：",
        type: "simulation_search",
        targetCriteria: {
          mustInclude: ["108課綱", "site:edu.tw", "filetype:pdf"],
          flexibleKeywords: ["資訊科技", "資訊"]
        },
        defaultQuery: "108課綱資訊科技",
        placeholder: "例如：108課綱資訊科技 site:edu.tw filetype:pdf",
        explanation: "【神搜奧義】在搜尋列中可以同時並用多個進階運算子！例如『關鍵字 site:edu.tw filetype:pdf』，就能一次完成【主題指定 + 網域限定 + 檔案類型限定】！"
      },
      {
        id: "Q3-06",
        title: "雲端硬碟三大權限的守護法則",
        story: "國中分組報告共用 Google 文件時，老師特別提醒：『不要把每個人都設為最高權限，避免心血被亂改！』請協助組長配置適當的三級權限。",
        instruction: "請依功能填入 Google 雲端的三種身分權限名稱（檢視者 / 加註者 / 編輯者）：",
        type: "cloze",
        textTemplate: "① 只能看檔案內容，無法更改文字或留言：【{input1}】\n② 不能直接更改原文，但可以在右側空白處留下便利貼建議評論：【{input2}】\n③ 擁有全部修改權力，能直接新增、修改或刪除投影片內容：【{input3}】",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入3字身分",
            accepted: ["檢視者", "檢視", "Viewer"],
            hint: "課本 P.147：三種層級之一，只能用眼睛看！"
          },
          {
            key: "input2",
            placeholder: "輸入3字身分",
            accepted: ["加註者", "評論者", "加註", "Commenter"],
            hint: "課本 P.147：可以加上註解與建議的身分！"
          },
          {
            key: "input3",
            placeholder: "輸入3字身分",
            accepted: ["編輯者", "編輯", "Editor"],
            hint: "課本 P.147：擁有直接改動內文權限的身分！"
          }
        ],
        explanation: "【課本 P.147 智慧王】Google 雲端共用三大層級：檢視者（僅可查看）、加註者（可新增建議註解但不可修改本體）、編輯者（具完整修改與刪除權力）。"
      },
      {
        id: "Q3-07",
        title: "不可不知的資料夾權限繼承陷阱",
        story: "小強建立了一個 Google 雲端資料夾叫『班級活動照片』，並把權限設成『知道連結的人皆為編輯者』發到外校群組。結果隔天他發現自己放在這個資料夾子目錄裡的『個人段考作弊小抄筆記』也被外校全部看光了！",
        instruction: "請根據課本第 147 頁智慧王，完成資料夾連鎖效應的克漏字：",
        type: "cloze",
        textTemplate: "在雲端硬碟中，當你在一個母資料夾設定共享權限後，資料夾裡面的所有子文件與照片將會【{input1}】該資料夾的共享設定（自動套用相同的權限），除非針對單一檔案手動特別調整！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入2字概念（沿...或繼...）",
            accepted: ["沿用", "繼承", "依照"],
            hint: "課本 P.147：『所有內容將根據你的共享設定○○權限』！"
          }
        ],
        explanation: "【課本 P.147 智慧王】資料夾共享時，其內部所有文件與子資料夾都會預設「沿用（繼承）」該資料夾的權限設定。分享整個資料夾前務必檢查內容物！"
      },
      {
        id: "Q3-08",
        title: "手滑滅世！五頁投影片被刪光的終極救星",
        story: "凌晨十二點，四位同學正在線上共編明天要交的英文簡報，調皮的組員阿毛打瞌睡手壓住鍵盤的 Backspace，居然把大家辛辛苦苦做好的 5 頁核心圖文全部刪光光，而且他還關閉了分頁無法按 Ctrl+Z！",
        instruction: "請填出 Google 文件/簡報中能時光倒流、恢復舊存檔的內建功能名稱：",
        type: "cloze",
        textTemplate: "大家不用崩潰大哭！組長只要點選上方選單『檔案』➜『【{input1}】』➜『查看版本歷史』，就能調出幾分鐘前自動儲存的備份版本，一秒按鈕還原！",
        inputs: [
          {
            key: "input1",
            placeholder: "輸入4字功能名稱（版...）",
            accepted: ["版本紀錄", "版本歷程", "版本歷程記錄", "版本記錄", "版本歷史"],
            hint: "記錄每次編修時間點的時光機功能！"
          }
        ],
        explanation: "【協同編輯神技】Google 雲端所有應用皆具備雲端「版本紀錄（Version History）」，每分每秒的變動都有雲端快照，隨時可回溯到任何歷史時間點！"
      },
      {
        id: "Q3-09",
        title: "協作大拜拜！雲端人數上限知多少？",
        story: "全校舉辦 500 人大型線上論壇，各班幹部想要在同一個 Google 文件上即時簽到與發表感言。但大家發現當連線人數一多，有些人就無法進入編輯了。",
        instruction: "請根據課本第 147 頁智慧王提供的官方限制數據完成填空：",
        type: "cloze",
        textTemplate: "一個 Google 雲端檔案最多能透過個別電子郵件與【{input1}】個地址共用；而在線上同時開啟並供使用者編輯的上限最多為【{input2}】個分頁或裝置，超過的話其他人只能暫時排隊檢視。",
        inputs: [
          {
            key: "input1",
            placeholder: "填入共用Email人數上限數字",
            accepted: ["600"],
            hint: "課本 P.147：六百？還是五百？"
          },
          {
            key: "input2",
            placeholder: "填入同時線上編輯上限數字",
            accepted: ["100"],
            hint: "課本 P.147：一次最多在幾台裝置中開啟供編輯？"
          }
        ],
        explanation: "【課本 P.147 智慧王】Google 官方規範：一個檔案最多能與 600 個個別電子郵件共用；線上同時供編輯上限為 100 個裝置分頁。"
      },
      {
        id: "Q3-10",
        title: "公佈作業的資安護盾！連結權限安全防線",
        story: "班長要把大家做好的校慶園遊會成果宣傳海報雲端連結發到學校公開的 IG 限時動態上讓大家瀏覽。但如果他把權限設定不當，可能會被陌生酸民惡意塗鴉破壞。",
        instruction: "請完成對外公開連結的最安全防護設定克漏字：",
        type: "cloze",
        textTemplate: "當我們把雲端連結公開貼在公開網路社群時，『一般存取權』設為『知道連結的任何人』後，旁邊的角色身分【絕對不能】設為編輯者，而必須嚴格維持在預設的【{input1}】，才能防止心血遭到惡意竄改與刪除！",
        inputs: [
          {
            key: "input1",
            placeholder: "填入3字最安全預設身分",
            accepted: ["檢視者", "檢視", "Viewer"],
            hint: "只能瀏覽、不能改動任何東西的最低安全權限！"
          }
        ],
        explanation: "【雲端資安素養】對外公開分享時，務必遵循「最小權限原則（Principle of Least Privilege）」，公開連結一律給予「檢視者」，只有核心小組成員才以指定 Email 給予編輯者！"
      }
    ]
  }
];
