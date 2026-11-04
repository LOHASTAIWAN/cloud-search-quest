// CyberCloud 雲端神偷特工隊 - 核心引擎 app.js (v3.5.0)
// 支援 115 級學生名條檢核、8大單元120題、Google Docs 5題簡答學習單、提示後看解答跳下一題、實體快捷鍵防呆

const APP_VERSION = "3.5.0";

// 系統核心狀態
const appState = {
  roster: [],
  currentStudent: null, // { class, seat, studentId, name, loginTime }
  
  // 測驗關卡中狀態
  activeUnitIdx: 0,
  activeQuestionIdx: 0,
  hp: 100,
  xp: 0,
  combo: 0,
  maxCombo: 0,
  soundEnabled: true,
  isAnswered: false,
  unitStartTime: null,
  currentUnitResults: [], // [{ qId, correct: true/false, score: number }]
  
  // 學習單 Modal 當前單元
  activeWorksheetUnitIdx: 0,

  // 後台成績與每題通過率快取 (LocalStorage 快取)
  studentScores: {}, // key: studentId -> { name, class, seat, unitScores: { [unitId]: score } }
  questionStats: {}, // key: qId -> { attempts: 0, correct: 0, passRate: '0%' }
  loginLogs: [],     // [{ class, seat, studentId, name, loginTime }]

  // Cloudflare Worker API 設定 (可自訂)
  cfWorkerUrl: localStorage.getItem('CYBERCLOUD_CF_URL') || ''
};

// Web Audio API 音效生成器 (無須外連 mp3)
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(164.81, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  playCombo() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}
const sound = new SoundSynthesizer();

// 頁面初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 版本控制清理：若本地版本過舊，自動清除歷史工作階段
  if (localStorage.getItem('CYBERCLOUD_APP_VER') !== APP_VERSION) {
    sessionStorage.clear();
    localStorage.setItem('CYBERCLOUD_APP_VER', APP_VERSION);
  }

  await loadStudentRoster();
  loadCachedRecords();
  initLoginScreen();
  initUnitLobby();
  initControls();

  // 需求 1：預設學生個資是空白，一律停留在登入畫面，不自動跳轉
  showScreen('loginScreen');
});

// 載入學生名條資料
async function loadStudentRoster() {
  try {
    const res = await fetch('students.json?v=' + Date.now());
    if (res.ok) {
      appState.roster = await res.json();
      console.log(`成功載入學生名條，共 ${appState.roster.length} 位學生`);
    } else {
      console.warn('students.json 讀取失敗，啟用本機演示模式');
    }
  } catch (err) {
    console.warn('無法連線載入名條:', err);
  }
}

// 載入本地存儲記錄
function loadCachedRecords() {
  try {
    const cachedScores = localStorage.getItem('CYBERCLOUD_STUDENT_SCORES');
    if (cachedScores) appState.studentScores = JSON.parse(cachedScores);

    const cachedStats = localStorage.getItem('CYBERCLOUD_QUESTION_STATS');
    if (cachedStats) appState.questionStats = JSON.parse(cachedStats);

    const cachedLogs = localStorage.getItem('CYBERCLOUD_LOGIN_LOGS');
    if (cachedLogs) appState.loginLogs = JSON.parse(cachedLogs);
  } catch (e) {
    console.error('快取載入失敗', e);
  }
}

// 儲存記錄至 LocalStorage
function persistRecords() {
  localStorage.setItem('CYBERCLOUD_STUDENT_SCORES', JSON.stringify(appState.studentScores));
  localStorage.setItem('CYBERCLOUD_QUESTION_STATS', JSON.stringify(appState.questionStats));
  localStorage.setItem('CYBERCLOUD_LOGIN_LOGS', JSON.stringify(appState.loginLogs));
}

// 初始化登入介面 (確保預設全部空白)
function initLoginScreen() {
  const classSelect = document.getElementById('loginClass');
  const seatInput = document.getElementById('loginSeat');
  const nameInput = document.getElementById('loginName');
  const idInput = document.getElementById('loginId');
  const errorMsg = document.getElementById('loginErrorMsg');

  // 1. 強制重置欄位為空白
  if (seatInput) seatInput.value = '';
  if (nameInput) nameInput.value = '';
  if (idInput) idInput.value = '';
  if (errorMsg) errorMsg.classList.add('hidden');

  if (classSelect) {
    const classes = [
      '七年一班', '七年二班', '七年三班', '七年四班', '七年五班',
      '七年六班', '七年七班', '七年八班', '七年九班', '七年十班', '七年十一班'
    ];

    classSelect.innerHTML = '<option value="">-- 請選擇班級 --</option>';
    classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      classSelect.appendChild(opt);
    });
    classSelect.value = ''; // 預設空白未選
  }

  const loginBtn = document.getElementById('btnDoLogin');
  if (loginBtn) {
    // 移除舊 listener 避免重複綁定
    loginBtn.onclick = handleStudentLogin;
  }

  // 支援 Enter 快捷登入
  ['loginSeat', 'loginName', 'loginId'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleStudentLogin();
      });
    }
  });

  // 教師後台按鈕
  const teacherBtn = document.getElementById('btnTeacherPortal');
  if (teacherBtn) {
    teacherBtn.onclick = openTeacherAuthModal;
  }
}

// 處理學生登入檢核
function handleStudentLogin() {
  const cls = document.getElementById('loginClass').value.trim();
  const seatStr = document.getElementById('loginSeat').value.trim();
  const seat = parseInt(seatStr, 10);
  const name = document.getElementById('loginName').value.trim();
  const studentId = document.getElementById('loginId').value.trim();

  if (!cls || !seatStr || isNaN(seat) || !name || !studentId) {
    showLoginError('請完整填寫 班級、座號、姓名 與 學號 4 個欄位！');
    return;
  }

  // 若有名條進行嚴格核對
  if (appState.roster && appState.roster.length > 0) {
    const match = appState.roster.find(s => 
      s.class === cls && 
      s.seat === seat && 
      s.name === name && 
      (s.studentId.toLowerCase() === studentId.toLowerCase() || s.studentId === studentId)
    );

    if (!match) {
      showLoginError('查無此學生資料！請確認班級、座號、姓名及學號是否與學校正式名條完全一致。');
      return;
    }
  }

  const now = new Date();
  const loginTime = now.toLocaleString('zh-TW', { hour12: false });

  appState.currentStudent = {
    class: cls,
    seat: seat,
    name: name,
    studentId: studentId,
    loginTime: loginTime
  };

  // 記錄登入日誌
  appState.loginLogs.unshift({
    class: cls,
    seat: seat,
    name: name,
    studentId: studentId,
    loginTime: loginTime,
    timestamp: Date.now()
  });
  persistRecords();

  // 非同步回傳至 Cloudflare Worker
  syncToCloudflare('log_login', appState.currentStudent);

  // 轉移畫面至大廳
  showScreen('unitSelectScreen');
  renderStudentProfileBadge();
  initUnitLobby();
}

function showLoginError(msg) {
  const el = document.getElementById('loginErrorMsg');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    el.style.animation = 'shake 0.4s';
    setTimeout(() => el.style.animation = '', 400);
  } else {
    alert(msg);
  }
}

function renderStudentProfileBadge() {
  const s = appState.currentStudent;
  if (!s) return;
  const badges = document.querySelectorAll('.student-badge-slot');
  badges.forEach(b => {
    b.innerHTML = `<span class="badge-tag">${s.class} ${s.seat}號</span> <span class="badge-name">${s.name} (${s.studentId})</span>`;
  });
}

// 畫面切換
function showScreen(screenId) {
  const screens = ['loginScreen', 'unitSelectScreen', 'quizScreen', 'resultScreen', 'adminScreen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 大廳初始化
function initUnitLobby() {
  const grid = document.getElementById('unitCardsGrid');
  if (!grid || typeof QUEST_DATA === 'undefined') return;

  grid.innerHTML = '';
  QUEST_DATA.units.forEach((unit, idx) => {
    const card = document.createElement('div');
    card.className = 'unit-card';
    
    // 檢查該學生在該單元的歷史最佳成績
    let bestScore = '--';
    if (appState.currentStudent) {
      const sId = appState.currentStudent.studentId;
      if (appState.studentScores[sId] && appState.studentScores[sId].unitScores && appState.studentScores[sId].unitScores[unit.unitId] !== undefined) {
        bestScore = appState.studentScores[sId].unitScores[unit.unitId] + ' 分';
      }
    }

    card.innerHTML = `
      <div class="unit-header">
        <span class="unit-badge">單元 0${idx + 1}</span>
        <span class="unit-category">${unit.category}</span>
      </div>
      <h3 class="unit-title">${unit.unitTitle}</h3>
      <p class="unit-desc">${unit.description}</p>
      <div class="unit-meta">
        <span>🎯 題目：${unit.questions.length} 題 (前10題基礎滿分100 + 後5題加分挑戰)</span>
        <span class="unit-score-badge">最佳成績：<strong>${bestScore}</strong></span>
      </div>
      <div class="unit-card-actions">
        <button class="start-unit-btn" onclick="startQuestUnit(${idx})">
          <i class="fa-solid fa-play"></i> 進入闖關挑戰
        </button>
        <button class="unit-worksheet-btn" onclick="openWorksheetModal(${idx})" title="開啟 Google Docs 5 題生活簡答學習單">
          <i class="fa-solid fa-file-pen"></i> Google Docs 5題簡答學習單
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 開始進行特定單元測驗
window.startQuestUnit = function(unitIdx) {
  sound.init();
  appState.activeUnitIdx = unitIdx;
  appState.activeQuestionIdx = 0;
  appState.hp = 100;
  appState.xp = 0;
  appState.combo = 0;
  appState.maxCombo = 0;
  appState.isAnswered = false;
  appState.unitStartTime = Date.now();
  appState.currentUnitResults = [];

  showScreen('quizScreen');
  renderCurrentQuestion();
};

// 渲染當前題目
function renderCurrentQuestion() {
  appState.isAnswered = false;
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const q = unit.questions[appState.activeQuestionIdx];
  const totalQ = unit.questions.length;
  const isChallenge = appState.activeQuestionIdx >= 10;

  // 更新頂部資訊條
  document.getElementById('currentUnitName').textContent = unit.unitTitle;
  document.getElementById('questionProgressText').textContent = `第 ${appState.activeQuestionIdx + 1} / ${totalQ} 題 ${isChallenge ? '【進階時事挑戰題】' : '【基礎生活核心題】'}`;
  
  const progPct = ((appState.activeQuestionIdx + 1) / totalQ) * 100;
  document.getElementById('progressBarFill').style.width = `${progPct}%`;
  
  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  document.getElementById('comboDisplay').textContent = appState.combo;

  // 題目主體
  const qContainer = document.getElementById('questionContainer');
  qContainer.innerHTML = `
    <div class="question-tag-row">
      <span class="q-type-badge">${q.type === 'cloze' ? '克漏字填空題' : '情境實戰題'}</span>
      <span class="q-points-badge">${isChallenge ? '+5 分 (挑戰加分)' : '+10 分 (核心單元分)'}</span>
      <span class="q-level-badge">難度：${q.level}</span>
    </div>
    <div class="scenario-box">
      <div class="scenario-title">📌 生活與時事實際情境：</div>
      <p class="scenario-text">${escapeHtml(q.scenario)}</p>
    </div>
    <div class="prompt-box">
      <h3 class="prompt-title">🎯 任務挑戰：</h3>
      <div class="prompt-content">${formatPromptContent(q)}</div>
    </div>
    <div id="answerArea" class="answer-interactive-area"></div>
    <div id="feedbackArea" class="feedback-box hidden"></div>
    <div id="hintArea" class="hint-box hidden"></div>
  `;

  renderInteractiveInput(q);
}

// 格式化題目內容 (替換 [BLANK] 標籤為美觀的填空位置，杜絕 HTML 屬性外漏)
function formatPromptContent(q) {
  if (q.type === 'cloze') {
    return q.prompt.replace(/\[\s*BLANK\s*\]/g, '<span class="cloze-blank">【 ？ 填空位置 】</span>');
  }
  return escapeHtml(q.prompt);
}

// 渲染輸入互動元件
function renderInteractiveInput(q) {
  const area = document.getElementById('answerArea');
  area.innerHTML = '';

  if (q.type === 'cloze' || !q.options || q.options.length === 0) {
    // 填空輸入框
    const wrapper = document.createElement('div');
    wrapper.className = 'cloze-input-wrapper';
    wrapper.innerHTML = `
      <div class="input-action-bar">
        <input type="text" id="clozeInput" class="game-input" placeholder="請在此輸入答案（或可直接按下鍵盤快捷鍵）" autocomplete="off" autofocus />
        <button id="btnSubmitCloze" class="primary-btn">確認送出</button>
      </div>
      <div class="hint-action-bar">
        <button id="btnUseHint" class="hint-btn">💡 呼叫特工錦囊 (查看提示)</button>
        <button id="btnGiveUp" class="give-up-btn hidden" onclick="giveUpCurrentQuestion()">⏭️ 我還是想不出來（查看正確解答並前進下一題）</button>
      </div>
    `;
    area.appendChild(wrapper);

    const input = document.getElementById('clozeInput');
    const submitBtn = document.getElementById('btnSubmitCloze');
    const hintBtn = document.getElementById('btnUseHint');

    submitBtn.addEventListener('click', () => checkClozeAnswer(q, input.value));
    
    // 實體鍵盤快捷鍵防呆監聽 (特別針對 Ctrl+Shift+T 或其他組合鍵)
    input.addEventListener('keydown', (e) => {
      // 若按下 Ctrl+Shift+T 實體鍵組合
      if (e.ctrlKey && e.shiftKey && (e.key === 't' || e.key === 'T' || e.code === 'KeyT')) {
        e.preventDefault(); // 避免觸發瀏覽器開關分頁衝突
        input.value = 'Ctrl+Shift+T';
        checkClozeAnswer(q, 'Ctrl+Shift+T');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        checkClozeAnswer(q, input.value);
      }
    });

    hintBtn.addEventListener('click', () => {
      showQuestionHint(q.hint);
      // 提示出現後，同時顯示「查看解答跳下一題」按鈕，徹底不卡關
      document.getElementById('btnGiveUp').classList.remove('hidden');
    });

  } else {
    // 選擇題選項
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-choice-btn';
      btn.innerHTML = `<span class="opt-badge">${String.fromCharCode(65 + idx)}</span> <span class="opt-text">${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => checkOptionAnswer(q, opt, btn));
      optionsGrid.appendChild(btn);
    });

    area.appendChild(optionsGrid);

    const hintBar = document.createElement('div');
    hintBar.className = 'hint-action-bar mt-3';
    hintBar.innerHTML = `
      <button id="btnUseHint" class="hint-btn">💡 呼叫特工錦囊 (查看提示)</button>
      <button id="btnGiveUp" class="give-up-btn hidden" onclick="giveUpCurrentQuestion()">⏭️ 我還是想不出來（查看正確解答並前進下一題）</button>
    `;
    area.appendChild(hintBar);

    document.getElementById('btnUseHint').addEventListener('click', () => {
      showQuestionHint(q.hint);
      document.getElementById('btnGiveUp').classList.remove('hidden');
    });
  }
}

// 顯示提示
function showQuestionHint(hintText) {
  const hintArea = document.getElementById('hintArea');
  if (!hintArea) return;
  hintArea.innerHTML = `<strong>💡 特工錦囊提示：</strong> ${escapeHtml(hintText)}`;
  hintArea.classList.remove('hidden');
  hintArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 檢查填空題答案
function checkClozeAnswer(q, userInput) {
  if (appState.isAnswered) return;
  const rawInput = (userInput || '').trim();
  if (!rawInput) {
    alert('請先輸入答案喔！');
    return;
  }

  const cleanInput = rawInput.toLowerCase().replace(/\s+/g, '');
  let isCorrect = false;

  // 只要符合 accepted 列表中任一即算對
  if (q.accepted && Array.isArray(q.accepted)) {
    isCorrect = q.accepted.some(acc => {
      const cleanAcc = acc.toLowerCase().replace(/\s+/g, '');
      return cleanInput === cleanAcc || cleanInput === cleanAcc.replace('ctrl+shift+', '');
    });
  }

  // 容錯判斷：例如第一題要求按 T，如果輸入 Ctrl+Shift+T 也算對
  if (!isCorrect && q.qId === 'U11-01') {
    if (cleanInput === 't' || cleanInput === 'ctrl+shift+t' || cleanInput === 'ctrl-shift-t') {
      isCorrect = true;
    }
  }

  handleAnswerResult(isCorrect, q, rawInput);
}

// 檢查選擇題答案
function checkOptionAnswer(q, selectedOpt, btnEl) {
  if (appState.isAnswered) return;
  const isCorrect = selectedOpt === q.answer;
  handleAnswerResult(isCorrect, q, selectedOpt, btnEl);
}

// 處理答題結果回饋
function handleAnswerResult(isCorrect, q, studentInput, btnEl) {
  appState.isAnswered = true;
  const isChallenge = appState.activeQuestionIdx >= 10;
  const points = isChallenge ? 5 : 10;

  // 更新統計 (每題通過率)
  recordQuestionAttempt(q.qId, isCorrect);

  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.classList.remove('hidden');

  if (isCorrect) {
    sound.playCorrect();
    appState.combo++;
    if (appState.combo > appState.maxCombo) appState.maxCombo = appState.combo;
    if (appState.combo >= 3) sound.playCombo();

    const earnedXp = points + (appState.combo > 1 ? appState.combo * 2 : 0);
    appState.xp += earnedXp;

    feedbackArea.className = 'feedback-box success-feedback';
    feedbackArea.innerHTML = `
      <div class="feedback-header">
        <span class="badge-success">🎉 答對了！+${points} 分</span>
        ${appState.combo > 1 ? `<span class="combo-badge">🔥 連續答對 x${appState.combo}！</span>` : ''}
      </div>
      <div class="explanation-content">
        <strong>【神偷解密專題知識】：</strong><br>${escapeHtml(q.explanation)}
      </div>
      <button class="next-q-btn" onclick="proceedToNextQuestion()">下一題 ➔</button>
    `;

    if (btnEl) btnEl.classList.add('btn-correct');
    appState.currentUnitResults.push({ qId: q.qId, correct: true, score: points });

  } else {
    sound.playWrong();
    appState.combo = 0;
    appState.hp = Math.max(0, appState.hp - 10);

    feedbackArea.className = 'feedback-box error-feedback';
    feedbackArea.innerHTML = `
      <div class="feedback-header">
        <span class="badge-error">❌ 哎呀，答錯了！</span>
        <span>你的回答：<code>${escapeHtml(studentInput)}</code></span>
      </div>
      <div class="correct-answer-row">
        <strong>正確答案：</strong> <span class="highlight-ans">${escapeHtml(q.answer)}</span>
      </div>
      <div class="explanation-content">
        <strong>【神偷解密專題知識】：</strong><br>${escapeHtml(q.explanation)}
      </div>
      <button class="next-q-btn" onclick="proceedToNextQuestion()">看懂了，前往下一題 ➔</button>
    `;

    if (btnEl) btnEl.classList.add('btn-wrong');
    appState.currentUnitResults.push({ qId: q.qId, correct: false, score: 0 });
  }

  // 更新介面狀態值
  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  document.getElementById('comboDisplay').textContent = appState.combo;

  // 滾動到回饋區
  feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 學生「我還是想不出來」直接查看正確解答並前進下一題
window.giveUpCurrentQuestion = function() {
  if (appState.isAnswered) return;
  appState.isAnswered = true;
  
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const q = unit.questions[appState.activeQuestionIdx];

  // 記為未通過
  recordQuestionAttempt(q.qId, false);
  appState.combo = 0;
  appState.currentUnitResults.push({ qId: q.qId, correct: false, score: 0 });

  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.classList.remove('hidden');
  feedbackArea.className = 'feedback-box info-feedback';
  feedbackArea.innerHTML = `
    <div class="feedback-header">
      <span class="badge-giveup">📖 解密錦囊已開啟 (本題不計分)</span>
    </div>
    <div class="correct-answer-row">
      <strong>正確解答：</strong> <span class="highlight-ans">${escapeHtml(q.answer)}</span>
    </div>
    <div class="explanation-content">
      <strong>【觀念解析】：</strong><br>${escapeHtml(q.explanation)}
    </div>
    <button class="next-q-btn" onclick="proceedToNextQuestion()">了解！前進下一題 ➔</button>
  `;

  document.getElementById('comboDisplay').textContent = appState.combo;
  feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// 前進下一題或結算
window.proceedToNextQuestion = function() {
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  if (appState.activeQuestionIdx + 1 < unit.questions.length) {
    appState.activeQuestionIdx++;
    renderCurrentQuestion();
  } else {
    concludeUnitQuest();
  }
};

// 結算單元成績
function concludeUnitQuest() {
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const totalQuestions = unit.questions.length; // 15
  
  // 10 題為一單元，每題 10 分，滿分 100 分；後 5 題為挑戰加分（每題 5 分）
  let baseScore = 0;
  let challengeScore = 0;
  let correctCount = 0;

  appState.currentUnitResults.forEach((res, idx) => {
    if (res.correct) {
      correctCount++;
      if (idx < 10) {
        baseScore += 10;
      } else {
        challengeScore += 5;
      }
    }
  });

  const finalTotalScore = baseScore + challengeScore;
  const timeSpentSec = Math.round((Date.now() - appState.unitStartTime) / 1000);

  // 儲存至全域學生成績
  if (appState.currentStudent) {
    const s = appState.currentStudent;
    if (!appState.studentScores[s.studentId]) {
      appState.studentScores[s.studentId] = {
        name: s.name,
        class: s.class,
        seat: s.seat,
        studentId: s.studentId,
        unitScores: {}
      };
    }
    // 取最高分
    const prevScore = appState.studentScores[s.studentId].unitScores[unit.unitId] || 0;
    if (finalTotalScore > prevScore) {
      appState.studentScores[s.studentId].unitScores[unit.unitId] = finalTotalScore;
    }
    persistRecords();

    // 回傳至 Cloudflare Worker
    syncToCloudflare('submit_score', {
      student: s,
      unitId: unit.unitId,
      unitTitle: unit.unitTitle,
      baseScore: baseScore,
      challengeScore: challengeScore,
      finalScore: finalTotalScore,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      timeSpentSec: timeSpentSec,
      results: appState.currentUnitResults
    });
  }

  // 顯示結算畫面
  showScreen('resultScreen');
  renderResultScreen({
    unitTitle: unit.unitTitle,
    baseScore: baseScore,
    challengeScore: challengeScore,
    finalTotalScore: finalTotalScore,
    correctCount: correctCount,
    totalQuestions: totalQuestions,
    maxCombo: appState.maxCombo,
    timeSpentSec: timeSpentSec
  });
}

// 渲染結算畫面
function renderResultScreen(res) {
  const container = document.getElementById('resultDetailsContainer');
  if (!container) return;

  let evaluation = '';
  if (res.finalTotalScore >= 115) evaluation = '🏆 神級駭客特工！完美的數位思維與時事實踐力！';
  else if (res.finalTotalScore >= 100) evaluation = '🌟 菁英特工！基礎題滿分，挑戰題表現亮眼！';
  else if (res.finalTotalScore >= 80) evaluation = '✨ 優秀特工！已具備穩健的雲端與資料觀念！';
  else if (res.finalTotalScore >= 60) evaluation = '👍 合格特工！基礎觀念及格，可再多複習挑戰題！';
  else evaluation = '💪 見習特工，再接再厲！複習課本觀念後再挑戰一次！';

  container.innerHTML = `
    <div class="result-score-card">
      <div class="score-big-num">${res.finalTotalScore} <span class="score-unit">分</span></div>
      <div class="score-breakdown">
        <span>基礎核心成績：<strong>${res.baseScore} / 100 分</strong></span>
        <span>時事挑戰加分：<strong>+${res.challengeScore} 分</strong></span>
      </div>
      <div class="result-evaluation-tag">${evaluation}</div>
    </div>

    <div class="result-stats-grid">
      <div class="stat-box">
        <div class="stat-lbl">答對題數</div>
        <div class="stat-val">${res.correctCount} / ${res.totalQuestions}</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">最高連擊</div>
        <div class="stat-val">🔥 ${res.maxCombo}</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">挑戰歷時</div>
        <div class="stat-val">⏱️ ${res.timeSpentSec} 秒</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">獲得特工經驗值</div>
        <div class="stat-val">⭐ +${appState.xp} XP</div>
      </div>
    </div>

    <div class="result-actions-row">
      <button class="primary-btn" onclick="startQuestUnit(appState.activeUnitIdx)">🔄 再挑戰一次</button>
      <button class="secondary-btn" onclick="openWorksheetModal(appState.activeUnitIdx)">📑 檢視本單元 Google Docs 簡答題</button>
      <button class="secondary-btn" onclick="showScreen('unitSelectScreen'); initUnitLobby();">🏠 返回單元大廳</button>
    </div>
  `;
}

// 記錄每題通過率
function recordQuestionAttempt(qId, isCorrect) {
  if (!appState.questionStats[qId]) {
    appState.questionStats[qId] = { attempts: 0, correct: 0, passRate: '0%' };
  }
  const stat = appState.questionStats[qId];
  stat.attempts++;
  if (isCorrect) stat.correct++;
  stat.passRate = Math.round((stat.correct / stat.attempts) * 100) + '%';
  persistRecords();
}

// 與 Cloudflare Worker 同步資料
async function syncToCloudflare(action, payload) {
  const url = appState.cfWorkerUrl;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, data: payload, timestamp: Date.now() })
    });
  } catch (err) {
    console.warn('同步至 Cloudflare Worker 異常 (仍已安全保存在本地端):', err);
  }
}

// 教師後台驗證與開啟
function openTeacherAuthModal() {
  const pwd = prompt('請輸入教師管理後台密碼：');
  if (pwd === 'teacher115' || pwd === 'admin') {
    showScreen('adminScreen');
    renderTeacherDashboard();
  } else if (pwd !== null) {
    alert('密碼錯誤！');
  }
}

// 渲染教師後台儀表板
function renderTeacherDashboard() {
  const totalStudents = appState.roster.length || 318;
  const testedStudentIds = Object.keys(appState.studentScores);
  const testedCount = testedStudentIds.length;
  
  document.getElementById('statTotalTested').textContent = `${testedCount} / ${totalStudents} 人`;
  document.getElementById('statTotalLogins').textContent = `${appState.loginLogs.length} 人次`;

  renderClassScoreTable();
  renderQuestionPassRateTable();
  renderRecentLoginLogs();

  const workerInput = document.getElementById('cfWorkerInput');
  if (workerInput) {
    workerInput.value = appState.cfWorkerUrl;
  }
}

// 渲染班級成績表
function renderClassScoreTable() {
  const tbody = document.getElementById('classScoreTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const students = Object.values(appState.studentScores);
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">目前尚無測驗紀錄</td></tr>';
    return;
  }

  students.forEach(st => {
    const tr = document.createElement('tr');
    const uScores = st.unitScores || {};
    
    tr.innerHTML = `
      <td>${escapeHtml(st.class)}</td>
      <td>${st.seat}</td>
      <td>${escapeHtml(st.name)}</td>
      <td>${escapeHtml(st.studentId)}</td>
      <td>${uScores['unit-1-1'] !== undefined ? uScores['unit-1-1'] + '分' : '--'}</td>
      <td>${uScores['unit-2-1'] !== undefined ? uScores['unit-2-1'] + '分' : '--'}</td>
      <td><span class="badge-score">${calculateAverage(uScores)} 分</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function calculateAverage(unitScores) {
  const vals = Object.values(unitScores);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round(sum / vals.length);
}

// 渲染每題通過率表格
function renderQuestionPassRateTable() {
  const tbody = document.getElementById('passRateTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let allQuestions = [];
  QUEST_DATA.units.forEach(u => {
    u.questions.forEach(q => {
      allQuestions.push({ unitTitle: u.unitTitle, qId: q.qId, prompt: q.prompt, level: q.level });
    });
  });

  allQuestions.forEach(q => {
    const stat = appState.questionStats[q.qId] || { attempts: 0, correct: 0, passRate: '100%' };
    const tr = document.createElement('tr');
    
    let rateClass = 'rate-good';
    const rateNum = parseInt(stat.passRate, 10);
    if (stat.attempts > 0 && rateNum < 50) rateClass = 'rate-danger';
    else if (stat.attempts > 0 && rateNum < 75) rateClass = 'rate-warning';

    tr.innerHTML = `
      <td><code>${q.qId}</code></td>
      <td>${escapeHtml(q.unitTitle)}</td>
      <td class="table-prompt-cell">${escapeHtml(q.prompt.substring(0, 45))}...</td>
      <td>${stat.attempts}</td>
      <td>${stat.correct}</td>
      <td><span class="${rateClass}"><strong>${stat.attempts === 0 ? '無作答' : stat.passRate}</strong></span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 渲染最新登入日誌
function renderRecentLoginLogs() {
  const tbody = document.getElementById('loginLogsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const recent = appState.loginLogs.slice(0, 15);
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">暫無登入紀錄</td></tr>';
    return;
  }

  recent.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${log.loginTime}</td>
      <td>${escapeHtml(log.class)}</td>
      <td>${log.seat}</td>
      <td>${escapeHtml(log.name)}</td>
      <td>${escapeHtml(log.studentId)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 儲存 Cloudflare Worker 設定
window.saveCfWorkerConfig = function() {
  const val = document.getElementById('cfWorkerInput').value.trim();
  appState.cfWorkerUrl = val;
  localStorage.setItem('CYBERCLOUD_CF_URL', val);
  alert('Cloudflare Worker 網址已儲存！');
};

// 匯出全部成績為 CSV
window.exportScoresCSV = function() {
  const students = Object.values(appState.studentScores);
  if (students.length === 0) {
    alert('目前尚無成績可供匯出！');
    return;
  }

  let csvContent = '\uFEFF班級,座號,姓名,學號,單元1,單元2,單元3,單元4,單元5,單元6,單元7,單元8,平均成績\n';
  students.forEach(s => {
    const u = s.unitScores || {};
    const avg = calculateAverage(u);
    csvContent += `"${s.class}",${s.seat},"${s.name}","${s.studentId}",${u['unit-1-1']||0},${u['unit-1-2']||0},${u['unit-1-3']||0},${u['unit-2-1']||0},${u['unit-2-2']||0},${u['unit-2-3']||0},${u['unit-2-4']||0},${u['unit-2-5']||0},${avg}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `115資訊科技_學生測驗成績報表_${Date.now()}.csv`;
  a.click();
};

// =========================================================================
// Google Docs 5 題生活簡答學習單 Modal 控制
// =========================================================================
window.openWorksheetModal = function(unitIdx) {
  if (typeof WORKSHEET_DATA === 'undefined') {
    alert('學習單題庫正在載入中，請稍候！');
    return;
  }
  appState.activeWorksheetUnitIdx = unitIdx || 0;
  
  const modal = document.getElementById('worksheetModal');
  if (modal) modal.classList.remove('hidden');

  renderWorksheetModalContent();
};

window.closeWorksheetModal = function() {
  const modal = document.getElementById('worksheetModal');
  if (modal) modal.classList.add('hidden');
};

function renderWorksheetModalContent() {
  const unitIdx = appState.activeWorksheetUnitIdx;
  const ws = WORKSHEET_DATA[unitIdx];
  if (!ws) return;

  document.getElementById('modalWorksheetTitle').textContent = ws.unitTitle;

  // 渲染單元切換按鈕
  const tabsContainer = document.getElementById('modalUnitTabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = '';
    WORKSHEET_DATA.forEach((item, idx) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = `ws-tab-btn ${idx === unitIdx ? 'active' : ''}`;
      tabBtn.textContent = `單元 0${idx + 1}`;
      tabBtn.onclick = () => {
        appState.activeWorksheetUnitIdx = idx;
        renderWorksheetModalContent();
      };
      tabsContainer.appendChild(tabBtn);
    });
  }

  // 渲染 5 道簡答題內容
  const contentArea = document.getElementById('modalWorksheetContent');
  if (!contentArea) return;

  contentArea.innerHTML = '';
  ws.questions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'ws-question-card';
    card.innerHTML = `
      <div class="ws-q-header">
        <span class="ws-q-badge">第 ${q.qNum} 題</span>
        <span class="ws-q-title">${escapeHtml(q.title)}</span>
        <span class="ws-q-words">${escapeHtml(q.wordCount)}</span>
      </div>
      <div class="ws-scenario-box">
        <strong>📌 生活情境：</strong> ${escapeHtml(q.scenario)}
      </div>
      <div class="ws-prompt-box">
        <strong>🎯 思考任務：</strong> ${escapeHtml(q.prompt)}
      </div>
      <div class="ws-answer-box">
        <details>
          <summary><i class="fa-solid fa-graduation-cap"></i> 點擊展開 教師參考解答與評量指引</summary>
          <div class="ws-sample-answer-text">${escapeHtml(q.sampleAnswer).replace(/\n/g, '<br>')}</div>
        </details>
      </div>
    `;
    contentArea.appendChild(card);
  });
}

// 一鍵複製當前單元學習單成 Google Docs 純文字格式
window.copyCurrentWorksheet = function() {
  const ws = WORKSHEET_DATA[appState.activeWorksheetUnitIdx];
  if (!ws) return;

  let text = `【國中資訊科技 108 課綱】課堂探究與生活實踐簡答學習單\n`;
  text += `${ws.unitTitle}\n`;
  text += `班級：________ 座號：____ 姓名：____________ 學號：__________\n\n`;
  text += `------------------------------------------------------------\n\n`;

  ws.questions.forEach(q => {
    text += `【第 ${q.qNum} 題】${q.title} (${q.wordCount})\n`;
    text += `[生活情境] ${q.scenario}\n`;
    text += `[思考任務] ${q.prompt}\n\n`;
    text += `[學生作答區]：\n\n\n`;
    text += `------------------------------------------------------------\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ 已成功將《${ws.unitTitle}》5 題 Google Docs 簡答學習單複製至剪貼簿！\n您可以直接前往 Google 文件 (Google Docs) 按下 Ctrl+V 貼上派發給學生！`);
  }).catch(() => {
    // 備用方案
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert(`✅ 已複製至剪貼簿！可直接貼至 Google Docs。`);
  });
};

// 控制項初始化
function initControls() {
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      soundBtn.textContent = sound.enabled ? '🔊' : '🔇';
    });
  }

  const exitBtn = document.getElementById('exitQuestBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('確定要中途退出當前單元挑戰嗎？進度將不會被完整記錄喔！')) {
        showScreen('unitSelectScreen');
        initUnitLobby();
      }
    });
  }

  const logoutBtn = document.getElementById('btnLogoutStudent');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('CURRENT_STUDENT');
      appState.currentStudent = null;
      // 登出時清空輸入框
      document.getElementById('loginSeat').value = '';
      document.getElementById('loginName').value = '';
      document.getElementById('loginId').value = '';
      document.getElementById('loginClass').value = '';
      showScreen('loginScreen');
    });
  }
}

// XSS 安全輔助
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
