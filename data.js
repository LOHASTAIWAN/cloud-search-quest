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
  },
{
    "id": 4,
    "chapter": "第二章 專題",
    "unitCode": "2-1",
    "title": "專題 2-1：【思維藍圖】低碳生活心智圖（Google 文件）",
    "subtitle": "運用 Google 文件與心智圖發想 SDGs 減碳生活",
    "badge": "心智圖架構師",
    "icon": "fa-solid fa-sitemap",
    "themeColor": "#06b6d4",
    "questions": [
      {
        "id": "U21-01",
        "title": "心智圖的發想原點",
        "story": "小組討論『國中生校園減塑大作戰』專題，大家七嘴八舌想法很發散。組長小明打開 Google 文件繪圖工具準備畫心智圖。心智圖的核心畫法是：在畫布的中央寫下【核心關鍵詞】，再以線條向四周發散延伸子任務。",
        "instruction": "請完成心智圖結構特徵的克漏字填空：",
        "type": "cloze",
        "textTemplate": "心智圖（Mind Map）是以一個【{input1}】為起點，向外以線條【{input2}】連接相關的想法、任務或關聯項目，將抽象思考轉化為具體圖像！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入起點位置詞彙",
            "accepted": [
              "中心",
              "中央",
              "核心關鍵詞",
              "主題",
              "關鍵字"
            ],
            "hint": "課本 P.160：中心以一個關鍵詞或想法為主！"
          },
          {
            "key": "input2",
            "placeholder": "輸入擴散方式（如：放射/延伸）",
            "accepted": [
              "放射",
              "延伸",
              "發散",
              "連接",
              "展開"
            ],
            "hint": "像太陽光芒一樣由內向外..."
          }
        ],
        "explanation": "【課本 P.160】心智圖是將抽象與複雜思考過程轉化為具體清晰圖像的工具，中心以關鍵詞為主，向外以線連接關聯項目。"
      },
      {
        "id": "U21-02",
        "title": "電腦教室突然跳電的救星",
        "story": "第七節在電腦教室打報告時突然跳電全校大停電！隔壁阿毛嚇得哇哇大叫以為寫了一千字的草稿沒了，但小美卻老神在在，因為 Google 文件具備雲端即時存檔特性。",
        "instruction": "請填入 Google 文件保障資料不遺失的核心特色：",
        "type": "cloze",
        "textTemplate": "使用 Google 文件編輯時，系統會在連網狀態下【{input1}】保存變更並儲存至雲端，即使瀏覽器意外關閉，檔案內容也【{input2}】遺失！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字動作（自...）",
            "accepted": [
              "自動保存",
              "自動儲存",
              "自動備份"
            ],
            "hint": "不用使用者手動按存檔鍵的功能！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字否定詞",
            "accepted": [
              "不會",
              "無需擔心",
              "不致"
            ],
            "hint": "課本 P.155：無需擔心因忘記儲存而丟失文件！"
          }
        ],
        "explanation": "【課本 P.155】Google 文件會自動保存變更並同步到雲端硬碟，徹底免除傳統單機軟體忘記存檔而遺失心血的惡夢。"
      },
      {
        "id": "U21-03",
        "title": "報告門面：字級與層次對比",
        "story": "國文老師要求繳交專題報告時說：『標題跟內文大小都一樣，整面黑壓壓讓人看不下去！』小華需要在 Google 文件工具列進行格式美化。",
        "instruction": "請填入調整文字大小與視覺層次的專用設定名稱：",
        "type": "cloze",
        "textTemplate": "為了讓主標題在視覺上比內文更為突出，小華應該在工具列將標題選取後調大【{input1}】（Font Size），並可套用【{input2}】（Bold）增加文字份量！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入字體大小術語（字...）",
            "accepted": [
              "字型大小",
              "字級",
              "字體大小",
              "字號"
            ],
            "hint": "文字的尺寸大小！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字加黑效果",
            "accepted": [
              "粗體",
              "加粗",
              "B"
            ],
            "hint": "英文是 Bold，快捷鍵是 Ctrl+B！"
          }
        ],
        "explanation": "【課本 P.155 格式排版】透過調整字型大小與套用粗體，能建立清晰的視覺階層（Visual Hierarchy），讓讀者秒懂重點。"
      },
      {
        "id": "U21-04",
        "title": "讓文章深呼吸的段落行距",
        "story": "小芬寫了兩千字的心得，但所有行與行之間擠得密不通風，評審老師看得眼睛非常酸痛。",
        "instruction": "請填入調整行與行之間上下間隔的格式功能：",
        "type": "cloze",
        "textTemplate": "小芬可以在 Google 文件選單點選「格式」➜「【{input1}】與段落間距」，將原本緊密的單行間距調整為【{input2}】倍行高，增加易讀性！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字間隔名稱",
            "accepted": [
              "行距",
              "行間距"
            ],
            "hint": "行與行之間的垂直距離！"
          },
          {
            "key": "input2",
            "placeholder": "輸入常見舒適行距數值（如 1.5 或 1.15）",
            "accepted": [
              "1.5",
              "1.15",
              "雙倍"
            ],
            "hint": "課本常見建議排版行距（1.5 倍）！"
          }
        ],
        "explanation": "【文書排版美學】適度調整行距（如 1.15 至 1.5 倍）與段落後間距，能避免文字過度擁擠，大幅提升長文閱覽舒適度。"
      },
      {
        "id": "U21-05",
        "title": "文件的天地線：頁首與頁尾",
        "story": "專題競賽規定：『每一頁的頂部必須統一印出「115年資訊科技專題」，底部中央必須自動標註頁碼』。小智不知道該在哪裡設定才能每一頁都自動出現。",
        "instruction": "請填入文件最上方與最下方的專業版面區塊名稱：",
        "type": "cloze",
        "textTemplate": "文件最頂端的共用資訊區塊稱為【{input1}】（Header）；而最底端用來放置頁碼與註腳的區塊則稱為【{input2}】（Footer）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字頂端區域名稱",
            "accepted": [
              "頁首",
              "Header"
            ],
            "hint": "每一頁的「頭部」！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字底端區域名稱",
            "accepted": [
              "頁尾",
              "Footer"
            ],
            "hint": "每一頁的「尾巴」！"
          }
        ],
        "explanation": "【課本 P.158】頁首（Header）出現在每頁頂部，頁尾（Footer）出現在每頁底部，適合用來統一顯示文件標題與自動頁碼。"
      },
      {
        "id": "U21-06",
        "title": "圖片與文字的完美擁抱：文字環繞",
        "story": "小組在報告中插入了一張自己拍的『校園落葉堆肥桶』照片，但圖片直接把段落腰斬成上下兩半，旁邊留了一大片空白很難看。",
        "instruction": "請根據課本第 159 頁，填入最推薦的圖文共處排版模式：",
        "type": "cloze",
        "textTemplate": "點選圖片下方彈出的排版工具列，將預設的置於行內改為【{input1}】（Wrap text），文字就會順暢地包覆在圖片四周，使版面緊湊專業！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字排版模式",
            "accepted": [
              "文字環繞",
              "文繞圖",
              "環繞"
            ],
            "hint": "課本 P.159 四大圖片模式之一：文字○○圖片！"
          }
        ],
        "explanation": "【課本 P.159】Google 文件提供：圖片置於行內、文字環繞圖片、圖片分隔文字、置於文字前方/後方。文字環繞能讓雜誌風格圖文並茂。"
      },
      {
        "id": "U21-07",
        "title": "文件內建的繪圖工坊",
        "story": "想要在 Google 文件中親手畫出心智圖的泡泡節點、箭頭與流程方塊，不需要另外開小畫家或繪圖軟體再截圖貼上。",
        "instruction": "請填入 Google 文件內建的向量繪圖功能選單路徑：",
        "type": "cloze",
        "textTemplate": "點選上方主選單的「插入」➜「【{input1}】」➜「新增」，就能開啟畫布自由拉箭頭、文字方塊與幾何形狀，完成後按「儲存並關閉」自動嵌入文件！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字功能名稱",
            "accepted": [
              "繪圖",
              "繪圖工具",
              "圖形"
            ],
            "hint": "用來畫圖的功能（繪○）！"
          }
        ],
        "explanation": "【課本 P.160】點選「插入」➜「繪圖」，即可在彈出畫布上組裝箭頭、形狀與文字框繪製心智圖與關聯圖。"
      },
      {
        "id": "U21-08",
        "title": "多人連線的神奇彩色游標",
        "story": "期末週四位組員晚上開著視訊連線共編 Google 文件，畫面上突然出現綠色、粉色、藍色不同顏色的垂直小標籤在移動。",
        "instruction": "請填入在 Google 文件協作時代表其他成員位置的視覺符號：",
        "type": "cloze",
        "textTemplate": "在多人同時在線上協作文件時，畫面上不同顏色的【{input1}】代表其他組員目前正在輸入或選取的位置，其上方還會顯示該使用者的【{input2}】！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字輸入指示符",
            "accepted": [
              "游標",
              "輸入游標",
              "游標箭頭"
            ],
            "hint": "打字時一閃一閃的線條！"
          },
          {
            "key": "input2",
            "placeholder": "輸入身分標籤名稱",
            "accepted": [
              "姓名",
              "名稱",
              "名字",
              "帳號"
            ],
            "hint": "能辨識是哪位同學的資訊！"
          }
        ],
        "explanation": "【雲端共編特色】Google 文件會以專屬顏色游標與使用者姓名標籤顯示每位協作成員的即時位置，避免互相打架或改到同一行。"
      },
      {
        "id": "U21-09",
        "title": "長篇大作的瞬間傳送門：標題樣式",
        "story": "社團成果專題長達三十頁，指導老師想看第 25 頁的結論，但不想用滑鼠滾輪滾半天。",
        "instruction": "請填入讓文件自動生成左側導覽目錄的神奇樣式：",
        "type": "cloze",
        "textTemplate": "只要將各章節名稱套用為格式選單中的「【{input1}】」（Heading 1 / Heading 2），文件左側的「文件【{input2}】」欄位就會自動產生可點擊的章節快速跳轉超連結！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字樣式名稱",
            "accepted": [
              "標題",
              "標題樣式",
              "標題1"
            ],
            "hint": "不是「內文」，而是具有層級的「標○」！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字結構名詞",
            "accepted": [
              "大綱",
              "目錄"
            ],
            "hint": "課本 P.155：文件○○導覽欄！"
          }
        ],
        "explanation": "【結構化文件】套用「標題（Heading）」樣式能讓 Google 文件自動生成文件大綱（Document Outline），點擊即可一秒跳頁。"
      },
      {
        "id": "U21-10",
        "title": "低碳生活與 SDGs 目標 12",
        "story": "課本第 153 頁專題任務：『以聯合國 2030 永續發展目標 (SDGs) 目標 12 為主軸發想，為地球盡一份心力』。",
        "instruction": "請填出 SDGs 目標 12 的正式中文核心名稱：",
        "type": "cloze",
        "textTemplate": "SDGs 目標 12 的完整名稱是「責任【{input1}】與【{input2}】」，鼓勵大眾從拒絕過度包裝、珍惜糧食做起！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字（買東西的人的行為）",
            "accepted": [
              "消費"
            ],
            "hint": "消費者花錢買商品的行為！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字（工廠或農夫的行為）",
            "accepted": [
              "生產"
            ],
            "hint": "製造物品的行為！"
          }
        ],
        "explanation": "【課本 P.153/154 專題目標】SDGs 目標 12 為「責任消費與生產（Responsible Consumption and Production）」，本專題以此為主軸展開。"
      }
    ]
  },
  {
    "id": 5,
    "chapter": "第二章 專題",
    "unitCode": "2-2",
    "title": "專題 2-2：【數據魔術】食物碳排放量估算表（Google 試算表）",
    "subtitle": "學會試算表儲存格座標、五大統計函數與自動填滿",
    "badge": "試算表數據師",
    "icon": "fa-solid fa-table-cells",
    "themeColor": "#10b981",
    "questions": [
      {
        "id": "U22-01",
        "title": "儲存格座標的密碼解讀",
        "story": "第一次打開 Google 試算表，畫面上滿滿的矩形方格。資訊老師指著螢幕問大家：『這個放著牛肉漢堡碳排放量數字的格子，它的座標代號是什麼？』",
        "instruction": "請填入試算表中欄、列命名規則與儲存格代號：",
        "type": "cloze",
        "textTemplate": "在試算表中，直向以英文字母命名稱為【{input1}】（Column），橫向以數字命名稱為【{input2}】（Row）；第 3 欄第 5 列所交會的儲存格座標名稱為【{input3}】！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入單一字（欄或列）",
            "accepted": [
              "欄"
            ],
            "hint": "直直站立像柱子的是「欄」！"
          },
          {
            "key": "input2",
            "placeholder": "輸入單一字（欄或列）",
            "accepted": [
              "列"
            ],
            "hint": "橫排排隊的是「列」！"
          },
          {
            "key": "input3",
            "placeholder": "輸入英文加數字代碼（例如 B3）",
            "accepted": [
              "C5",
              "c5"
            ],
            "hint": "第 3 個英文字母是 C，第 5 列是 5！"
          }
        ],
        "explanation": "【課本 P.163】試算表格子稱為「儲存格」，代號由英文字母（欄）在前、數字（列）在後組合而成，如 C5 代表 C 欄第 5 列。"
      },
      {
        "id": "U22-02",
        "title": "喚醒試算表大腦的等號咒語",
        "story": "阿明在儲存格裡面打了 `15 + 25 + 40`，按了 Enter 後螢幕依然只顯示一模一樣的文字 `15 + 25 + 40`，完全沒有算出總和 80！阿明以為電腦壞了。",
        "instruction": "請指出阿明漏掉的公式啟動字元：",
        "type": "cloze",
        "textTemplate": "試算表要執行數學運算或呼叫函數時，儲存格開頭【必須】以半形符號【{input1}】（等號）作為開頭，系統才會啟動運算引擎！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入半形符號",
            "accepted": [
              "=",
              "＝",
              "等號"
            ],
            "hint": "鍵盤 Backspace 左邊的等號鍵！"
          }
        ],
        "explanation": "【試算表核心規則】任何公式與函數皆必須以「=」開頭（例如 =B2+B3 或 =SUM(A1:A5)），否則會被視為純文字。"
      },
      {
        "id": "U22-03",
        "title": "一秒加總的無敵函數 SUM",
        "story": "小美記錄了週一到週五每天中午午餐的食物碳排放量（分別記錄在 B2, B3, B4, B5, B6）。如果一個一個打 + 號太慢又容易漏掉。",
        "instruction": "請填入計算連續範圍數值總和的英文函數：",
        "type": "cloze",
        "textTemplate": "要將 B2 到 B6 的所有數值自動加總，在 B7 輸入的標準函數公式為：=【{input1}】(B2:B6)！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字大寫英文函數名",
            "accepted": [
              "SUM",
              "sum"
            ],
            "hint": "英文總和（Sum）！"
          }
        ],
        "explanation": "【課本 P.165/187】SUM 函數用於計算指定範圍內所有數值的總和，範圍以冒號「:」表示起訖（如 B2:B6）。"
      },
      {
        "id": "U22-04",
        "title": "計算全班平均水準的 AVERAGE",
        "story": "全班 30 位同學都算出了自己一週的總排碳量（存放在 C2 到 C31 儲存格）。導師想知道全班同學平均每人製造多少碳排放。",
        "instruction": "請填入計算平均值的標準函數名稱：",
        "type": "cloze",
        "textTemplate": "計算全班排碳量平均值，應在儲存格輸入公式：=【{input1}】(C2:C31)！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入英文函數名",
            "accepted": [
              "AVERAGE",
              "average"
            ],
            "hint": "英文平均（Average）！"
          }
        ],
        "explanation": "【課本 P.187】AVERAGE 函數用於計算所選範圍內數值的算術平均值。"
      },
      {
        "id": "U22-05",
        "title": "抓出排碳大魔王的 MAX 函數",
        "story": "在 50 種常見食物的清單中，小強想一眼找出排碳量『最高（最大值）』的數值是多少，不用眼睛一筆一筆找得眼花撩亂。",
        "instruction": "請填入取得指定範圍最大值的函數名稱：",
        "type": "cloze",
        "textTemplate": "取得 D2 到 D51 範圍中最大數值的公式為：=【{input1}】(D2:D51)！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字英文函數名",
            "accepted": [
              "MAX",
              "max"
            ],
            "hint": "英文 Maximum 的縮寫！"
          }
        ],
        "explanation": "【課本 P.187】MAX 函數回傳指定範圍內的最高數值（最大值）。"
      },
      {
        "id": "U22-06",
        "title": "尋找環保低碳王的 MIN 函數",
        "story": "相反地，想在綠色食物排行榜中找出排碳量『最低（最小值）』的是哪一項數值。",
        "instruction": "請填入取得指定範圍最小值的函數名稱：",
        "type": "cloze",
        "textTemplate": "取得 D2 到 D51 範圍中最小數值的公式為：=【{input1}】(D2:D51)！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字英文函數名",
            "accepted": [
              "MIN",
              "min"
            ],
            "hint": "英文 Minimum 的縮寫！"
          }
        ],
        "explanation": "【課本 P.187】MIN 函數回傳指定範圍內的最低數值（最小值）。"
      },
      {
        "id": "U22-07",
        "title": "統計繳交人頭數的 COUNT 函數",
        "story": "班代想要清點目前總共有幾位同學已經在 E 欄輸入了數值資料，確認是否全班 30 人都繳交完畢。",
        "instruction": "請填入計算含有數字的儲存格個數的計數函數：",
        "type": "cloze",
        "textTemplate": "用來統計 E2:E35 範圍中有包含數字的儲存格總數量的函數為：=【{input1}】(E2:E35)！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入英文函數名",
            "accepted": [
              "COUNT",
              "count"
            ],
            "hint": "英文數數、計數（Count）！"
          }
        ],
        "explanation": "【課本 P.187】COUNT 函數用於計算指定範圍內包含數字的儲存格個數。"
      },
      {
        "id": "U22-08",
        "title": "複製公式的神奇小藍點：自動填滿",
        "story": "小敏在第二列算好了第 1 位同學的公式 `=B2*C2`。全班還有 30 位同學要算，難道要一個一個手動打 30 次嗎？",
        "instruction": "請填入試算表最省時的公式快速複製技巧：",
        "type": "cloze",
        "textTemplate": "將滑鼠移到已算好的儲存格右下角，游標會變成黑色十字形，這個小方塊稱為【{input1}】控點，按住滑鼠左鍵往下【{input2}】，試算表就會聰明地自動複製並調整公式！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字控點名稱",
            "accepted": [
              "自動填滿",
              "填滿"
            ],
            "hint": "自動把底下空格補滿的控點！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字滑鼠動作（拖...）",
            "accepted": [
              "拖曳",
              "拖拉",
              "拉動",
              "下拉"
            ],
            "hint": "按住滑鼠往下拖動！"
          }
        ],
        "explanation": "【試算表必學效率操作】「自動填滿（Auto-fill）」控點位於儲存格右下角，拖曳即可自動延伸數列或複製相對參照公式。"
      },
      {
        "id": "U22-09",
        "title": "餐桌上的隱形負擔：食物碳足跡",
        "story": "資訊課與生物、地理跨科整合：食物從農場種植、飼料生產、工廠加工，到冷鏈運輸到超市，整個過程都會排放溫室氣體。",
        "instruction": "請填出衡量商品在生命週期中所排放溫室氣體總量的專業術語：",
        "type": "cloze",
        "textTemplate": "在生產與消費過程中，一項產品所直接與間接產生的溫室氣體排放總量，稱為該物品的【{input1}】（Carbon Footprint）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字術語（碳...）",
            "accepted": [
              "碳足跡",
              "碳排放量",
              "碳排放"
            ],
            "hint": "課本 P.162：在生產過程中，食物也會有『碳○○』！"
          }
        ],
        "explanation": "【課本 P.162】「碳足跡（Carbon Footprint）」是指一項活動或產品在其生命週期各階段所產生的溫室氣體排放量。"
      },
      {
        "id": "U22-10",
        "title": "由大到小排隊：資料排序實戰",
        "story": "算出了 50 種食物的排碳數據後，小組希望將資料重新排列，讓『排碳最高的食物排在最上面第一筆』，一眼分出高下。",
        "instruction": "請填入依數值大小重排次序的操作指令：",
        "type": "cloze",
        "textTemplate": "選取該數據欄位後，點選主選單「資料」➜「【{input1}】工作表」，選擇由【{input2}】到 A（遞減排序），即可由高至低依序呈現！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字動作（排...）",
            "accepted": [
              "排序"
            ],
            "hint": "讓資料重新排隊！"
          },
          {
            "key": "input2",
            "placeholder": "輸入單一英文字母（最後一個字母）",
            "accepted": [
              "Z",
              "z"
            ],
            "hint": "A到Z是小到大，由大到小則是 ○ 到 A！"
          }
        ],
        "explanation": "【課本 P.166 資料排序】試算表提供 A->Z（遞增、由小到大）與 Z->A（遞減、由大到小）兩種排序方式。"
      }
    ]
  },
  {
    "id": 6,
    "chapter": "第二章 專題",
    "unitCode": "2-3",
    "title": "專題 2-3：【視覺傳播】友善地球簡報（Google 簡報）",
    "subtitle": "搞懂簡報版面配置、視覺減法原則與上台放映技巧",
    "badge": "簡報演說家",
    "icon": "fa-solid fa-file-powerpoint",
    "themeColor": "#f59e0b",
    "questions": [
      {
        "id": "U23-01",
        "title": "拒絕文字海！簡報視覺精煉法則",
        "story": "很多同學第一次做簡報，把維基百科查到的三千字直接複製貼上整頁投影片，字體縮到 10pt，密密麻麻台下根本看不清。",
        "instruction": "請根據課本第 177 頁，指出優秀簡報的文字呈現原則：",
        "type": "cloze",
        "textTemplate": "簡報是演講的輔助工具，文字應力求精簡，避免大段流水帳，應多善用【{input1}】式重點與大字級關鍵詞，留給觀眾【{input2}】的思考空間！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字呈現方式（條...）",
            "accepted": [
              "條列",
              "條例",
              "清單"
            ],
            "hint": "一行一行的項目符號清單！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字視覺名詞（留...）",
            "accepted": [
              "留白",
              "充足",
              "留空"
            ],
            "hint": "畫面不要塞得太滿，要適度○○！"
          }
        ],
        "explanation": "【課本 P.177 簡報設計要點】投影片應提煉核心概念，採用條列式重點並適度留白，輔以演講者口頭說明，而非照螢幕念課文。"
      },
      {
        "id": "U23-02",
        "title": "黑底白字的強烈對比法則",
        "story": "小強選了一張暗黑色的宇宙星空當投影片背景，然後文字顏色選了深灰色，結果投影機投在布幕上全黑一片完全看不見文字。",
        "instruction": "請填入確保觀眾能輕鬆辨識文字的設計關鍵：",
        "type": "cloze",
        "textTemplate": "在配色設計中，文字顏色與背景顏色之間必須保持良好的【{input1}】（Contrast）；深色背景應搭配【{input2}】色文字（如純白或明黃色）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字名詞（對...）",
            "accepted": [
              "對比度",
              "對比",
              "反差"
            ],
            "hint": "明暗相差強烈的特性！"
          },
          {
            "key": "input2",
            "placeholder": "輸入1字或2字顏色屬性",
            "accepted": [
              "淺",
              "淺色",
              "亮",
              "白"
            ],
            "hint": "深色背景要配○色文字！"
          }
        ],
        "explanation": "【簡報視覺對比】高對比度能保證教室後排同學與光線昏暗環境下文字依然清晰可讀。"
      },
      {
        "id": "U23-03",
        "title": "不要把簡報塗成調色盤：色彩三元則",
        "story": "有些同學為了炫技，標題用紅色彩虹字、第一點用螢光綠、第二點用粉紅、第三點用紫藍色，整張投影片看得人眼花撩亂。",
        "instruction": "請填入專業簡報色彩搭配的黃金數量上限：",
        "type": "cloze",
        "textTemplate": "為了維持風格專業與視覺一致性，整份簡報的主要色系原則上建議不要超過【{input1}】種主色（主色、輔助色與強調色）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入數字",
            "accepted": [
              "3",
              "三"
            ],
            "hint": "不超過幾種主要顏色？（一二三的那個數字）！"
          }
        ],
        "explanation": "【簡報色彩心理學】過多顏色會造成視覺疲勞與干擾，簡報色彩宜控制在 3 種以內（主色 60%、輔助色 30%、強調色 10%）。"
      },
      {
        "id": "U23-04",
        "title": "版面配置快速套用模板",
        "story": "小組要介紹兩種低碳生活方案的優缺點對照，希望投影片左邊放方案 A、右邊放方案 B。",
        "instruction": "請填入 Google 簡報中用來切換投影片結構的工具名稱：",
        "type": "cloze",
        "textTemplate": "在上方工具列點選「【{input1}】」（Layout），可以將空白頁面一鍵套用為「標題和兩個資料欄」格式，自動劃分雙欄對齊！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字功能名稱",
            "accepted": [
              "版面配置",
              "版面",
              "版型"
            ],
            "hint": "課本 P.173：投影片○○○○！"
          }
        ],
        "explanation": "【課本 P.173】善用「版面配置」能快速套用預設的單欄、雙欄、標題卡等規格，避免手動拉文字方塊拉得參差不齊。"
      },
      {
        "id": "U23-05",
        "title": "換頁滑順的轉場效果",
        "story": "從第一頁封面切換到第二頁目錄時，投影片直接硬生生彈跳過去很突兀。小明想讓兩頁之間有滑入或淡入的視覺過渡。",
        "instruction": "請填入頁面與頁面之間切換動態效果的專用名稱：",
        "type": "cloze",
        "textTemplate": "投影片與投影片在換頁時播放的動態效果稱為「投影片【{input1}】」（Transition），但切記不可過度浮誇以免分散聽眾注意力！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字功能名稱（轉...）",
            "accepted": [
              "轉場",
              "轉場效果"
            ],
            "hint": "像電影換場景一樣的○○！"
          }
        ],
        "explanation": "【課本 P.175】投影片轉場（Slide Transition）能讓簡報換頁更自然流暢，建議選用簡單的「淡入」或「滑動」。"
      },
      {
        "id": "U23-06",
        "title": "圖表會說話：嵌入數據圖表",
        "story": "為了證明『吃牛肉的碳排是吃豆腐的十幾倍』，小組想在簡報中展示剛在試算表做好的直條統計圖表。",
        "instruction": "請填入將試算表數據圖表放進簡報的選單指令：",
        "type": "cloze",
        "textTemplate": "點選上方「插入」➜「【{input1}】」➜「來自試算表」，就能直接將試算表裡算好的分析圖連動嵌入簡報中，數據變更時還能一鍵更新！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字名詞",
            "accepted": [
              "圖表",
              "統計圖表"
            ],
            "hint": "圓餅圖、長條圖統稱為○○！"
          }
        ],
        "explanation": "【課本 P.174】透過「插入」➜「圖表」，可直接關聯 Google 試算表，當試算表原始數據修改時，簡報可同步更新最新圖表。"
      },
      {
        "id": "U23-07",
        "title": "照片不變形！等比例縮放的秘密",
        "story": "阿毛把一張可愛的台灣黑熊照片放進簡報，但他為了讓照片變小，只用滑鼠硬拉照片上方的中間控制點，結果黑熊被壓得扁扁平平像是被平底鍋砸過。",
        "instruction": "請指正阿毛縮放圖片時的正確操作部位：",
        "type": "cloze",
        "textTemplate": "縮放圖片時，必須用滑鼠拖曳位於圖片四個【{input1}】（Corner）的控制點，才能維持原圖長寬比例，防止照片變形失真！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字位置名詞（角...）",
            "accepted": [
              "角落",
              "角隅",
              "四角",
              "角落控制點"
            ],
            "hint": "不是四個邊的中點，而是四個○○！"
          }
        ],
        "explanation": "【圖片排版基礎】拖曳四個角隅的控制把手才能「等比例縮放」，拉動邊線中點會強制拉長或壓扁圖片破壞比例。"
      },
      {
        "id": "U23-08",
        "title": "講者防忘詞的隱形小抄：備忘稿",
        "story": "小美上台報告很容易緊張忘詞，她希望電腦螢幕上能看得到講稿重點，但投影在教室大螢幕給台下同學看時卻不會顯示出講稿內容。",
        "instruction": "請填入 Google 簡報每頁底部隱藏的講者專用文字區名稱：",
        "type": "cloze",
        "textTemplate": "小美可以把提示講稿記錄在每頁投影片下方的「【{input1}】」（Speaker Notes），投影放映時只有講者視圖能看見，台下觀眾看不到！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入演講者...或備忘...",
            "accepted": [
              "演講者備忘稿",
              "備忘稿",
              "演講者備忘錄",
              "講者備忘稿",
              "備忘錄"
            ],
            "hint": "課本 P.176：演講者○○○！"
          }
        ],
        "explanation": "【課本 P.176】演講者備忘稿（Speaker Notes）是演說者的強大神器，搭配講者視圖可即時看小抄與計時器。"
      },
      {
        "id": "U23-09",
        "title": "正式演講上台放映快捷鍵",
        "story": "輪到小組上台報告了！資訊老師說：『請將投影片切換為全螢幕放映模式！』",
        "instruction": "請填入啟動全螢幕放映的按鈕名稱或常見快捷鍵：",
        "type": "cloze",
        "textTemplate": "在右上角點擊「【{input1}】」（Slideshow）按鈕，或是按下快速鍵 Ctrl + F5，簡報就會立刻進入全螢幕播放！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字功能名稱",
            "accepted": [
              "放映",
              "播放",
              "幻燈片放映"
            ],
            "hint": "在螢幕上投○出來！"
          }
        ],
        "explanation": "【課本 P.176】點選右上角「放映（幻燈片放映）」即可啟動全螢幕展示，使用空白鍵或方向鍵可輕鬆推進頁面。"
      },
      {
        "id": "U23-10",
        "title": "線上標註指派組員任務",
        "story": "簡報第 7 頁缺少結論數據，組長小明想在該頁線上留言給組員小華，要求小華在明天中午前補上，並讓小華的 Email 收到提醒通知。",
        "instruction": "請填入在雲端文件/簡報中留言指派對象所使用的關鍵符號：",
        "type": "cloze",
        "textTemplate": "在投影片新增「加註（評論）」時，只要輸入【{input1}】符號緊接著小華的電子郵件（例如：+hua@school.edu），系統就會自動指派任務並發送信件通知他！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入半形符號（例如 @ 或 +）",
            "accepted": [
              "@",
              "+",
              "小老鼠"
            ],
            "hint": "常用的標註符號（@ 或 +）！"
          }
        ],
        "explanation": "【雲端協同指派】在加註中使用「@」或「+」帶入協作成員帳號，可將該項修改工作直接「指派」給專人跟進。"
      }
    ]
  },
  {
    "id": 7,
    "chapter": "第二章 專題",
    "unitCode": "2-4",
    "title": "專題 2-4：【民意雷達】低碳意識調查表（Google 表單）",
    "subtitle": "問卷架構規劃、六大必學題型與必填安全機制",
    "badge": "問卷調查官",
    "icon": "fa-solid fa-square-poll-vertical",
    "themeColor": "#8b5cf6",
    "questions": [
      {
        "id": "U24-01",
        "title": "資料收集的實踐科學",
        "story": "小組推測：『大部分國中生都知道吃素能減碳，但因為學校附近素食店太少才無法落實』。為了驗證這個猜想，他們決定做問卷調查。",
        "instruction": "請根據課本第 178 頁，填入資料收集的重要目的：",
        "type": "cloze",
        "textTemplate": "資料收集是指針對特定主題蒐集訊息，以便進行深入分析、研究，或是用客觀數據來【{input1}】我們當初的研究假設！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字動詞（佐...）",
            "accepted": [
              "佐證",
              "驗證",
              "證明"
            ],
            "hint": "課本 P.178：蒐集更多資料○○我們的假設！"
          }
        ],
        "explanation": "【課本 P.178】科學研究需要證據支撐，設計 Google 表單蒐集第一手民意資料，是驗證研究假設與洞察真實需求的核心方法。"
      },
      {
        "id": "U24-02",
        "title": "只能選一個答案的圓形單選題",
        "story": "問卷第一題問：『請問您的生理性別是？（選項：男、女、不願透露）』。一個人只能選其中一個答案，不能同時勾選。",
        "instruction": "請填入這個選項前面顯示為圓形收音按鈕的題型名稱：",
        "type": "cloze",
        "textTemplate": "限制受訪者只能從多個預設選項中挑選「唯一一個答案」的題型是【{input1}】（Multiple Choice）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字題型名稱",
            "accepted": [
              "選擇題",
              "單選題",
              "單選"
            ],
            "hint": "課本常見題型：選○○（或單選題）！"
          }
        ],
        "explanation": "【表單基礎題型】「選擇題（單選）」使用圓形按鈕（Radio Button），限制受訪者僅能單選單一選項。"
      },
      {
        "id": "U24-03",
        "title": "隨你勾選多項的正方形複選題",
        "story": "問卷第二題：『你平常在校園採取的低碳節能行動有哪些？（可複選：自備環保水壺、隨手關電燈、爬樓梯代替電梯、午餐吃光零剩食）』。",
        "instruction": "請填入選項前面為正方形框框、允許複選的題型名稱：",
        "type": "cloze",
        "textTemplate": "允許受訪者同時勾選多個符合答案的題型是【{input1}】（Checkboxes）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字題型名稱",
            "accepted": [
              "核取方塊",
              "多選題",
              "多選",
              "核取方格"
            ],
            "hint": "四個字：核○○○！"
          }
        ],
        "explanation": "【課本 P.179】「核取方塊（Checkboxes）」使用方形複選框，允許受訪者依據自身經驗同時勾選多項符合的內容。"
      },
      {
        "id": "U24-04",
        "title": "滿意度 1 到 5 分的線性刻度",
        "story": "小組想量化調查全校同學對『週一無肉蔬食午餐』的接受滿意度，希望設計成 1分（非常不支持）到 5分（非常支持）的評分條。",
        "instruction": "請填入 Google 表單最適合用來進行評分量測的題型名稱：",
        "type": "cloze",
        "textTemplate": "用來測量態度強弱或程度高低（如 1 到 5 分評分）的專用題型為【{input1}】（Linear Scale）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字題型名稱",
            "accepted": [
              "線性刻度",
              "量表",
              "刻度"
            ],
            "hint": "像尺一樣有一條連續數值的題型：線○○○！"
          }
        ],
        "explanation": "【問卷量度法】「線性刻度（Linear scale）」專門用於滿意度評分、李克特量表（Likert Scale），方便後續計算平均分數。"
      },
      {
        "id": "U24-05",
        "title": "暢所欲言！收集長篇回饋的段落題",
        "story": "在問卷最末頁，小組想給同學們留下抒發心聲的空間：『請寫下你對學校福利社減少塑膠包裝的具體建議（至少 50 字）』。",
        "instruction": "請填入適合輸入多行長篇文字的題型名稱：",
        "type": "cloze",
        "textTemplate": "如果是簡短姓名或學號適合用「簡答」；若是長篇文字、心得抒發，題型應選擇能換行書寫的【{input1}】（Paragraph）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字題型名稱",
            "accepted": [
              "段落",
              "長答",
              "段落題"
            ],
            "hint": "文章由好幾個○○組成！"
          }
        ],
        "explanation": "【文字輸入題型】「簡答（Short answer）」適合單行簡短資料（如姓名）；「段落（Paragraph）」則支援多行輸入，適合質化建議回饋。"
      },
      {
        "id": "U24-06",
        "title": "防止跳過偷懶的必填安全鎖",
        "story": "試填問卷時，調皮的阿毛什麼都沒勾就直接點「提交」，結果收到一份完全空白的廢票回覆，影響研究真實性。",
        "instruction": "請填入強制受訪者必須作答後才能送出的設定功能：",
        "type": "cloze",
        "textTemplate": "設計問題時，只要將該題右下角的開關切換為【{input1}】，題目旁邊就會出現一顆紅色米字星號（*），沒回答就無法送出！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字開關名稱",
            "accepted": [
              "必填",
              "必答"
            ],
            "hint": "必須填寫的規定！"
          }
        ],
        "explanation": "【表單資料完整性】開啟「必填（Required）」功能，能有效防止受訪者意外漏答或惡意交白卷，確保資料回收有效性。"
      },
      {
        "id": "U24-07",
        "title": "問卷分頁閱讀的魔法：區段",
        "story": "整份問卷一共有 25 個問題，如果全部擠在同一頁，受訪者一打開看到長長的網頁就會感到疲勞想關掉。",
        "instruction": "請填入將表單分成多頁推進的結構功能：",
        "type": "cloze",
        "textTemplate": "小組點選右側工具列的「新增【{input1}】」，將問卷切分成第一頁「基本調查」與第二頁「深度意向」，讓受訪者能逐頁點「繼續」輕鬆填寫！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字名稱（區...）",
            "accepted": [
              "區段",
              "分頁"
            ],
            "hint": "將長表單分段的專有名詞！"
          }
        ],
        "explanation": "【問卷分流與分頁】新增「區段（Section）」可以將長問卷進行分頁切割，甚至能根據使用者的不同答案引導跳轉到特定分頁。"
      },
      {
        "id": "U24-08",
        "title": "發布傳送短網址",
        "story": "問卷製作完成後，原始網址又臭又長長達 150 個英文字母，貼在班級群組很醜又容易斷行點不開。",
        "instruction": "請填入在 Google 表單傳送視窗中一秒美化網址的貼心選項：",
        "type": "cloze",
        "textTemplate": "點選右上角「傳送」按鈕切換到連結分頁，勾選「【{input1}】」（Shorten URL），就能將冗長網址縮成如 forms.gle 的精簡好記連結！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字選項名稱",
            "accepted": [
              "縮短網址",
              "縮短 URL",
              "縮短URL",
              "縮短"
            ],
            "hint": "把網址縮得短短的！"
          }
        ],
        "explanation": "【表單分享實務】勾選「縮短網址」能產生簡短精緻的 forms.gle 連結，大幅提升同學在手機通訊軟體點擊填寫的意願。"
      },
      {
        "id": "U24-09",
        "title": "打造綠色意象的色彩主題",
        "story": "這是一份關於低碳環保的問卷，但預設的表單外觀是紫色的。小智想把頂部橫幅換成森林綠色，增加大自然環保氛圍。",
        "instruction": "請填入調整表單主色調與頂部橫幅的工具名稱：",
        "type": "cloze",
        "textTemplate": "點選上方工具列的調色盤圖示，進入「自訂【{input1}】」（Theme），可以自由更改主題色彩、字體樣式並上傳自製的封面橫幅圖片！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字或2字名稱",
            "accepted": [
              "外觀主題",
              "主題",
              "主題色彩"
            ],
            "hint": "調色盤所代表的設定項目！"
          }
        ],
        "explanation": "【視覺包裝】「自訂外觀主題」可以設定字型、色系與頁首橫幅圖片，讓問卷外觀與專題調性一致。"
      },
      {
        "id": "U24-10",
        "title": "民意一目了然：即時回覆統計",
        "story": "問卷發布三天後，陸續回收了 120 份填答。組長完全不需要手動一筆一筆畫記計算。",
        "instruction": "請填入表單後台自動生成視覺統計圖表的分頁標籤名稱：",
        "type": "cloze",
        "textTemplate": "表單編輯者只要切換到頂部的「【{input1}】」（Responses）分頁，系統就會即時將每題答案自動繪製成圓餅圖與長條圖！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字標籤名稱",
            "accepted": [
              "回覆",
              "回覆內容",
              "Responses"
            ],
            "hint": "受訪者填完回傳過來的內容！"
          }
        ],
        "explanation": "【課本 P.182】Google 表單「回覆」分頁具備強大自動化圖表引擎，能即時以圓餅圖、長條圖呈現全體填答分布比例。"
      }
    ]
  },
  {
    "id": 8,
    "chapter": "第二章 專題",
    "unitCode": "2-5",
    "title": "專題 2-5：【洞察未來】資訊小達人（資料分析與資訊素養）",
    "subtitle": "搞懂資料 vs 資訊本質差異、圖表選用、篩選分析與數位倫理",
    "badge": "數據洞察專家",
    "icon": "fa-solid fa-chart-pie",
    "themeColor": "#ec4899",
    "questions": [
      {
        "id": "U25-01",
        "title": "原石與寶石：資料與資訊的本質大解密",
        "story": "期末考常考的世紀大哉問：『資料（Data）和資訊（Information）到底差在哪裡？兩者是一樣的東西嗎？』",
        "instruction": "請根據課本第 153 頁與第 182 頁完成最權威的觀念填空：",
        "type": "cloze",
        "textTemplate": "【{input1}】就像未雕琢的原石，是一堆原始、未經整理的文字、數字；而【{input2}】則是對這些原石經過分類、歸納與分析後，所產生出具有意義且【{input3}】的結果！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字（資...）",
            "accepted": [
              "資料",
              "Data",
              "data"
            ],
            "hint": "原始未加工的叫做「資○」！"
          },
          {
            "key": "input2",
            "placeholder": "輸入2字（資...）",
            "accepted": [
              "資訊",
              "Information",
              "information"
            ],
            "hint": "加工整理過有用的叫做「資○」！"
          },
          {
            "key": "input3",
            "placeholder": "輸入2字形容詞（有...）",
            "accepted": [
              "有用",
              "有價值",
              "具決策價值"
            ],
            "hint": "課本 P.153：變成○○的的資料！"
          }
        ],
        "explanation": "【課本 P.153/182 核心觀念】資料（Data）是未經處理的原始素材；資訊（Information）是經過整理分析、具備脈絡與決策價值的成果。"
      },
      {
        "id": "U25-02",
        "title": "這張紙上的數字到底算哪一種？",
        "story": "全班考完資訊隨堂測驗，老師桌上擺著一張全班 30 位同學的原始座號與分數成績單（如：1號 80分、2號 95分、3號 60分...尚未計算平均與排名）。",
        "instruction": "請根據資料與資訊定義，判斷這張原始分數清單的屬性：",
        "type": "cloze",
        "textTemplate": "這張剛收上來、尚未經過統計分析與排序的原始分數記錄，在科技分類上屬於【{input1}】（資料/資訊）；只有當算出全班平均或及格率後，才轉化為【{input2}】！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "二選一填入：資料 或 資訊",
            "accepted": [
              "資料",
              "原始資料"
            ],
            "hint": "未整理過的原石！"
          },
          {
            "key": "input2",
            "placeholder": "二選一填入：資料 或 資訊",
            "accepted": [
              "資訊"
            ],
            "hint": "加工分析後的有用結論！"
          }
        ],
        "explanation": "【實例辨析】零散的各科分數是「資料」；經由統計分析出的「全班平均 82 分、及格率 95%」具備判斷教學成效的功能，屬於「資訊」。"
      },
      {
        "id": "U25-03",
        "title": "比例專家：圓餅圖的拿手好戲",
        "story": "調查問卷題目：『國中生最常使用的社群軟體是哪一個？（Instagram、TikTok、YouTube、Threads）』。小組想呈現各軟體所佔的「比例（百分比）」。",
        "instruction": "請填入最適合用來呈現各項目占全體 100% 比例分佈的圖表類型：",
        "type": "cloze",
        "textTemplate": "最適合用來展示不同項目在整體總量中所佔【{input1}】（Percentage）的視覺圖表是【{input2}】（Pie Chart）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字或2字比例名詞",
            "accepted": [
              "百分比",
              "比例",
              "份額"
            ],
            "hint": "一百分之幾的○○○！"
          },
          {
            "key": "input2",
            "placeholder": "輸入3字圖表名稱",
            "accepted": [
              "圓餅圖",
              "圓形圖",
              "餅圖"
            ],
            "hint": "切蛋糕圓圓形狀的圖表！"
          }
        ],
        "explanation": "【圖表選用原則】圓餅圖擅長呈現「各部分占整體的百分比關係」；若項目過多（超過 7 種）則較不適宜。"
      },
      {
        "id": "U25-04",
        "title": "高低比拼：長條圖的數量對照",
        "story": "想比較七年一班到七年十一班，這 11 個班級各自收集到了多少公斤的廢電池，要讓人一眼看出哪個班級第一名、哪個班級落後。",
        "instruction": "請填入最擅長比較各獨立類別「數量多寡與高低差距」的圖表類型：",
        "type": "cloze",
        "textTemplate": "用長方形條狀長短來清楚比較各項目【{input1}】多寡與差距的圖表是【{input2}】（Bar Chart / 長條圖）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字名詞（數...）",
            "accepted": [
              "數量",
              "數值",
              "人數"
            ],
            "hint": "多少個、多少公斤的○○！"
          },
          {
            "key": "input2",
            "placeholder": "輸入3字圖表名稱",
            "accepted": [
              "長條圖",
              "柱狀圖",
              "直條圖"
            ],
            "hint": "一根一根長條狀的圖表！"
          }
        ],
        "explanation": "【圖表選用原則】長條圖（或直條圖）擅長並列比較多個獨立項目的「數值大小與數量多寡」，視覺對比最直觀。"
      },
      {
        "id": "U25-05",
        "title": "表單與試算表的無縫串接",
        "story": "在 Google 表單回覆頁面中，雖然有內建基本圖表，但如果小組想自訂複雜公式（如加權計算碳排放值），必須將資料導出。",
        "instruction": "請填入 Google 表單一鍵串聯的試算工具名稱：",
        "type": "cloze",
        "textTemplate": "只要點擊表單回覆右上角綠色的十字圖示，系統就會自動將所有問卷資料匯出並同步至 Google 【{input1}】（Sheets）進行深度資料處理！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入3字軟體名稱",
            "accepted": [
              "試算表",
              "Google試算表",
              "Sheets"
            ],
            "hint": "課本 P.183：將回覆匯出成○○○！"
          }
        ],
        "explanation": "【課本 P.183】Google 表單可與 Google 試算表即時連動，每當有新問卷填答提交，試算表會自動即時新增一列紀錄。"
      },
      {
        "id": "U25-06",
        "title": "大海撈針的漏斗法寶：資料篩選",
        "story": "匯出後的試算表總共有 500 筆資料，小組只想看「性別為女生」且「每天自備環保水壺」的特定同學記錄，不需要用肉眼一筆一筆找得眼瞎。",
        "instruction": "請填入試算表中能根據條件只留下符合資料的神奇功能：",
        "type": "cloze",
        "textTemplate": "選取標題列後，點選工具列上的漏斗圖示「建立【{input1}】」（Filter），就能在欄位下拉設定條件，快速過濾出目標資料！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入2字功能名稱（篩...）",
            "accepted": [
              "篩選",
              "資料篩選",
              "篩選器"
            ],
            "hint": "課本 P.183-185：運用資料○○的技巧！"
          }
        ],
        "explanation": "【課本 P.184-185 資料篩選】「篩選（Filter）」功能如同一道濾網，只顯示符合自訂條件的列，其餘列暫時隱藏，大幅提升分析效率。"
      },
      {
        "id": "U25-07",
        "title": "視覺紅綠燈：條件式格式設定",
        "story": "在飲食碳排放表格中，老師希望『只要碳排放數值大於 10 公斤，儲存格背景就自動亮紅燈（變紅色）；小於 2 公斤的自動亮綠燈』。",
        "instruction": "請填入這項自動根據儲存格數值改變外觀顏色的功能名稱：",
        "type": "cloze",
        "textTemplate": "在試算表格式選單中，點選「【{input1}】設定」，就能設定規則讓高於標準的儲存格自動變色，呈現直觀的警示效果！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入7字或5字功能名稱",
            "accepted": [
              "條件式格式",
              "條件式格式設定",
              "條件格式化",
              "條件格式"
            ],
            "hint": "有條件地自動改變格式的設定！"
          }
        ],
        "explanation": "【試算表進階視覺化】「條件式格式設定（Conditional Formatting）」能根據儲存格數值大小自動套用色階或背景色，讓異常值與優異值無所遁形。"
      },
      {
        "id": "U25-08",
        "title": "保護同學隱私的去識別化護照",
        "story": "小組打算將減碳問卷調查的原始數據放在學校公開展覽上。但問卷原始資料包含填答者的『真實姓名、身分證末四碼、住家地址』。",
        "instruction": "請填入在公開發布資料前保護個人隱私的法定處理步驟：",
        "type": "cloze",
        "textTemplate": "在公開大眾展示或共享資料庫前，必須將能夠直接或間接辨識個人身分的欄位刪除或遮蔽，這個保護個資的步驟稱為【{input1}】（或匿名化處理）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字個資保護術語",
            "accepted": [
              "去識別化",
              "匿名化",
              "去個人化",
              "匿名處理"
            ],
            "hint": "去掉可以辨識身分的特徵！"
          }
        ],
        "explanation": "【資訊倫理與個資法】「去識別化（De-identification）」是資訊科技處理資料的重要倫理防線，確保個人隱私資料不遭外洩與濫用。"
      },
      {
        "id": "U25-09",
        "title": "網路抓圖的合法標章：創用 CC",
        "story": "小明在做減碳簡報時想從網路上抓一張漂亮的海龜照片，但他擔心隨便右鍵另存會侵害攝影師的著作權而被告侵權。",
        "instruction": "請填入全球最知名、清楚標示作者分享授權條件的開放授權架構名稱：",
        "type": "cloze",
        "textTemplate": "小明應搜尋具有【{input1}】（Creative Commons，簡稱 CC）授權的作品，並依其標章要求進行「姓名標示」與「非商業性」使用！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字或2字中文名稱",
            "accepted": [
              "創用CC",
              "創用 CC",
              "知識共享",
              "創用授權"
            ],
            "hint": "有兩個雙 C 標誌的授權規範！"
          }
        ],
        "explanation": "【智慧財產權與資訊倫理】「創用 CC（Creative Commons）」透過四種核心授權要件（姓名標示、非商業性、禁止改作、相同方式分享），讓創作者合法分享數位資產。"
      },
      {
        "id": "U25-10",
        "title": "凡走過必留下痕跡的數位足跡",
        "story": "資訊課下課前老師語重心長地說：『大家在網路上搜尋低碳、在表單填答心得、在社群發表的每則留言，都會被伺服器永久記錄下來。』",
        "instruction": "請填入使用者在網路世界所留下的一切行為歷史紀錄的專有術語：",
        "type": "cloze",
        "textTemplate": "使用者在數位環境中進行操作、瀏覽、點擊與資料交換所留下的一切歷史痕跡，在科技社會學中統稱為【{input1}】（Digital Footprint）！",
        "inputs": [
          {
            "key": "input1",
            "placeholder": "輸入4字科技術語（數...）",
            "accepted": [
              "數位足跡",
              "數位足印",
              "數位軌跡"
            ],
            "hint": "數位世界裡的腳印！"
          }
        ],
        "explanation": "【數位公民素養】「數位足跡（Digital Footprint）」是個人在網路世界裡的永久數位聲譽，每位資訊科技特工都應建立負責任且健康的數位公民習慣。"
      }
    ]
  }
];
