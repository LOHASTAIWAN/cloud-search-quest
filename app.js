
// =========================================================================
// 主題風格切換器 (三種風格：Cyber Dark / Fresh Light / Pixel Arcade)
// =========================================================================
window.changeTheme = function(themeName) {
  document.body.setAttribute('data-theme', themeName);
  localStorage.setItem('cybercloud_theme', themeName);
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = themeName;
};

// 30 秒限時作答計時器引擎
function startQuestionTimer(durationSec = 30) {
  stopQuestionTimer();
  appState.timerSecondsLeft = durationSec;
  
  const timerText = document.getElementById('questionTimerText');
  const timerBar = document.getElementById('questionTimerBar');
  if (timerText) {
    timerText.textContent = `${durationSec}s`;
    timerText.className = 'timer-countdown';
  }
  if (timerBar) {
    timerBar.style.width = '100%';
    timerBar.className = 'timer-progress-fill';
  }

  appState.questionTimer = setInterval(() => {
    if (appState.isAnswered) {
      stopQuestionTimer();
      return;
    }
    appState.timerSecondsLeft--;
    const left = appState.timerSecondsLeft;
    const pct = Math.max(0, (left / durationSec) * 100);

    if (timerText) {
      timerText.textContent = `${left}s`;
      if (left <= 5) {
        timerText.className = 'timer-countdown danger';
      } else if (left <= 10) {
        timerText.className = 'timer-countdown warning';
      } else {
        timerText.className = 'timer-countdown';
      }
    }

    if (timerBar) {
      timerBar.style.width = `${pct}%`;
      if (left <= 5) {
        timerBar.className = 'timer-progress-fill danger';
      } else if (left <= 10) {
        timerBar.className = 'timer-progress-fill warning';
      } else {
        timerBar.className = 'timer-progress-fill';
      }
    }

    if (left <= 0) {
      stopQuestionTimer();
      const unit = QUEST_DATA.units[appState.activeUnitIdx];
      const q = unit.questions[appState.activeQuestionIdx];
      handleQuestionTimeout(q);
    }
  }, 1000);
}

function stopQuestionTimer() {
  if (appState.questionTimer) {
    clearInterval(appState.questionTimer);
    appState.questionTimer = null;
  }
  if (appState.autoSkipTimer) {
    clearInterval(appState.autoSkipTimer);
    appState.autoSkipTimer = null;
  }
}

function handleQuestionTimeout(q) {
  if (appState.isAnswered) return;
  appState.isAnswered = true;
  sound.playWrong();
  appState.combo = 0;
  recordQuestionAttempt(q.qId, false);
  appState.currentUnitResults.push({ qId: q.qId, correct: false, score: 0, usedHint: appState.usedHintForCurrentQ, timeout: true });

  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.classList.remove('hidden');
  feedbackArea.className = 'feedback-box error-feedback';
  feedbackArea.innerHTML = `
    <div class="feedback-header">
      <span class="badge-error">⏰ 作答時間到（超過 30 秒）！本題 0 分</span>
    </div>
    <div class="correct-answer-row">
      <strong>正確解答：</strong> <span class="highlight-ans">${escapeHtml(q.answer)}</span>
    </div>
    <div class="explanation-content">
      <strong>【課本觀念解析】：</strong><br>${escapeHtml(q.explanation)}
    </div>
    <div style="margin-top:10px;padding:8px 12px;background:rgba(239,68,68,0.15);border-radius:6px;font-size:0.9rem;color:#fca5a5;" id="timeoutSkipNotice">
      <i class="fa-solid fa-hourglass-half"></i> <strong>5 秒後將自動前往下一題...</strong>
    </div>
    <button class="next-q-btn" onclick="proceedToNextQuestion()">立即前往下一題 ➔</button>
  `;

  let autoSkipSec = 5;
  const skipNotice = document.getElementById('timeoutSkipNotice');
  appState.autoSkipTimer = setInterval(() => {
    autoSkipSec--;
    if (skipNotice) skipNotice.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> <strong>${autoSkipSec} 秒後將自動前往下一題...</strong>`;
    if (autoSkipSec <= 0) {
      clearInterval(appState.autoSkipTimer);
      appState.autoSkipTimer = null;
      proceedToNextQuestion();
    }
  }, 1000);

  feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// CyberCloud 雲端神偷特工隊 - 核心引擎 app.js (v3.8.0)
// 支援 115 級學生名條檢核、8大單元120題、後台資料庫 (記錄/查詢/更新/同步)、Google Docs 5題簡答學習單

const APP_VERSION = "4.0.0";
const DEFAULT_CF_WORKER_URL = "https://cybercloud-backend.meadow-xenon.workers.dev";

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
  currentUnitResults: [], // [{ qId, correct: true/false, score: number, usedHint: boolean, timeout: boolean }]

  // 30 秒倒數計時與提示扣分狀態
  questionTimer: null,
  autoSkipTimer: null,
  timerSecondsLeft: 30,
  usedHintForCurrentQ: false,
  
  // 學習單 Modal 當前單元
  activeWorksheetUnitIdx: 0,

  // 後台成績與每題通過率快取 (LocalStorage 快取)
  studentScores: {}, // key: studentId -> { name, class, seat, studentId, unitScores: { [unitId]: score }, lastUpdated }
  questionStats: {}, // key: qId -> { attempts: 0, correct: 0, passRate: '0%' }
  loginLogs: [],     // [{ class, seat, studentId, name, loginTime, timestamp }]

  // 遠端資料庫 API 設定 (預設直連已部署之 Cloudflare Worker)
  cfWorkerUrl: localStorage.getItem('CYBERCLOUD_CF_URL') || DEFAULT_CF_WORKER_URL
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

  // 若有設定遠端資料庫，背景靜默同步一次
  if (appState.cfWorkerUrl) {
    silentPullCloudData();
  }

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

  // 強制重置欄位為空白
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
    classSelect.value = '';
  }

  const loginBtn = document.getElementById('btnDoLogin');
  if (loginBtn) {
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

  // 非同步即時記錄至後台資料庫
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
  stopQuestionTimer();
  appState.isAnswered = false;
  appState.usedHintForCurrentQ = false;

  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const q = unit.questions[appState.activeQuestionIdx];
  const totalQ = unit.questions.length;
  const isChallenge = appState.activeQuestionIdx >= 10;
  const maxPts = isChallenge ? 8 : 6;
  const halfPts = isChallenge ? 4 : 3;

  document.getElementById('currentUnitName').textContent = unit.unitTitle;
  document.getElementById('questionProgressText').textContent = `第 ${appState.activeQuestionIdx + 1} / ${totalQ} 題 ${isChallenge ? '【進階時事挑戰題 (每題8分)】' : '【基礎生活核心題 (每題6分)】'}`;
  
  const progPct = ((appState.activeQuestionIdx + 1) / totalQ) * 100;
  document.getElementById('progressBarFill').style.width = `${progPct}%`;
  
  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  document.getElementById('comboDisplay').textContent = appState.combo;

  const qContainer = document.getElementById('questionContainer');
  qContainer.innerHTML = `
    <div class="question-tag-row">
      <span class="q-type-badge">${q.type === 'cloze' ? '克漏字填空題' : '選擇實戰題'}</span>
      <span class="q-points-badge">${isChallenge ? '+8 分 (挑戰題・全單元滿分40)' : '+6 分 (基礎題・全單元滿分60)'}</span>
      <span class="q-level-badge">難度：${q.level}</span>
      <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">(限時 30 秒・看提示得 ${halfPts} 分)</span>
    </div>
    <div class="scenario-box">
      <div class="scenario-title">📌 生活與課本情境：</div>
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
  startQuestionTimer(30);
}

function formatPromptContent(q) {
  if (q.type === 'cloze') {
    return q.prompt.replace(/\[\s*BLANK\s*\]/g, '<span class="cloze-blank">【 ？ 填空位置 】</span>');
  }
  return escapeHtml(q.prompt);
}

function renderInteractiveInput(q) {
  const area = document.getElementById('answerArea');
  area.innerHTML = '';

  if (q.type === 'cloze' || !q.options || q.options.length === 0) {
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
    
    // 安全鍵盤監聽 (僅支援 Enter 快速送出，絕不攔截實體快捷鍵避免瀏覽器衝突)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkClozeAnswer(q, input.value);
      }
    });

    hintBtn.addEventListener('click', () => {
      showQuestionHint(q.hint);
      document.getElementById('btnGiveUp').classList.remove('hidden');
    });

  } else {
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    // 隨機打亂選項順序，保證正確答案隨機落在 A/B/C/D
    const shuffledOptions = shuffleArray(q.options);

    shuffledOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-choice-btn';
      btn.innerHTML = `<span class="opt-badge">${String.fromCharCode(65 + idx)}</span> <span class="opt-text">${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => checkOptionAnswer(q, opt, btn));
      optionsGrid.appendChild(btn);
    });

    area.appendChild(optionsGrid);

    const isChallenge = appState.activeQuestionIdx >= 10;
    const halfPts = isChallenge ? 4 : 3;

    const hintBar = document.createElement('div');
    hintBar.className = 'hint-action-bar mt-3';
    hintBar.innerHTML = `
      <button id="btnUseHint" class="hint-btn">💡 呼叫特工錦囊 (查看提示・本題得分減半得 ${halfPts} 分)</button>
      <button id="btnGiveUp" class="give-up-btn hidden" onclick="giveUpCurrentQuestion()">⏭️ 我還是想不出來（查看正確解答並前進下一題）</button>
    `;
    area.appendChild(hintBar);

    document.getElementById('btnUseHint').addEventListener('click', () => {
      appState.usedHintForCurrentQ = true;
      showQuestionHint(q.hint, halfPts);
      document.getElementById('btnGiveUp').classList.remove('hidden');
    });
  }
}

function showQuestionHint(hintText, halfPts) {
  const hintArea = document.getElementById('hintArea');
  if (!hintArea) return;
  hintArea.innerHTML = `
    <div><strong>💡 特工錦囊提示：</strong> ${escapeHtml(hintText)}</div>
    <div style="margin-top:6px;font-size:0.85rem;color:#f59e0b;font-weight:600;">
      ⚠️ 注意：已開啟錦囊提示，本題若答對將以減半計分（得 ${halfPts || 3} 分）！
    </div>
  `;
  hintArea.classList.remove('hidden');
  hintArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function checkClozeAnswer(q, userInput) {
  if (appState.isAnswered) return;
  const rawInput = (userInput || '').trim();
  if (!rawInput) {
    alert('請先輸入答案喔！');
    return;
  }

  const cleanInput = rawInput.toLowerCase().replace(/\s+/g, '');
  let isCorrect = false;

  if (q.accepted && Array.isArray(q.accepted)) {
    isCorrect = q.accepted.some(acc => {
      const cleanAcc = acc.toLowerCase().replace(/\s+/g, '');
      return cleanInput === cleanAcc || cleanInput === cleanAcc.replace('ctrl+shift+', '');
    });
  }

  if (!isCorrect && q.qId === 'U11-01') {
    if (cleanInput === 't' || cleanInput === 'ctrl+shift+t' || cleanInput === 'ctrl-shift-t') {
      isCorrect = true;
    }
  }

  handleAnswerResult(isCorrect, q, rawInput);
}

function checkOptionAnswer(q, selectedOpt, btnEl) {
  if (appState.isAnswered) return;
  const isCorrect = selectedOpt === q.answer;
  handleAnswerResult(isCorrect, q, selectedOpt, btnEl);
}

function handleAnswerResult(isCorrect, q, studentInput, btnEl) {
  stopQuestionTimer();
  appState.isAnswered = true;
  const isChallenge = appState.activeQuestionIdx >= 10;
  
  // 新配分：前10題基礎題6分(計60分)，後5題挑戰題8分(計40分)；看提示得一半
  const maxPts = isChallenge ? 8 : 6;
  const halfPts = isChallenge ? 4 : 3;
  const earnedPts = isCorrect ? (appState.usedHintForCurrentQ ? halfPts : maxPts) : 0;

  recordQuestionAttempt(q.qId, isCorrect);

  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.classList.remove('hidden');

  if (isCorrect) {
    sound.playCorrect();
    appState.combo++;
    if (appState.combo > appState.maxCombo) appState.maxCombo = appState.combo;
    if (appState.combo >= 3) sound.playCombo();

    const earnedXp = earnedPts + (appState.combo > 1 ? appState.combo * 2 : 0);
    appState.xp += earnedXp;

    feedbackArea.className = 'feedback-box success-feedback';
    feedbackArea.innerHTML = `
      <div class="feedback-header">
        <span class="badge-success">🎉 答對了！+${earnedPts} 分 ${appState.usedHintForCurrentQ ? '<small style="color:#fef08a;">(提示扣半)</small>' : ''}</span>
        ${appState.combo > 1 ? `<span class="combo-badge">🔥 連續答對 x${appState.combo}！</span>` : ''}
      </div>
      <div class="explanation-content">
        <strong>【課本觀念解析】：</strong><br>${escapeHtml(q.explanation)}
      </div>
      <button class="next-q-btn" onclick="proceedToNextQuestion()">下一題 ➔</button>
    `;

    if (btnEl) btnEl.classList.add('btn-correct');
    appState.currentUnitResults.push({ qId: q.qId, correct: true, score: earnedPts, usedHint: appState.usedHintForCurrentQ, timeout: false });

  } else {
    sound.playWrong();
    appState.combo = 0;
    appState.hp = Math.max(0, appState.hp - 10);

    feedbackArea.className = 'feedback-box error-feedback';
    feedbackArea.innerHTML = `
      <div class="feedback-header">
        <span class="badge-error">❌ 哎呀，答錯了！(0 分)</span>
        <span>你的回答：<code>${escapeHtml(studentInput)}</code></span>
      </div>
      <div class="correct-answer-row">
        <strong>正確答案：</strong> <span class="highlight-ans">${escapeHtml(q.answer)}</span>
      </div>
      <div class="explanation-content">
        <strong>【課本觀念解析】：</strong><br>${escapeHtml(q.explanation)}
      </div>
      <button class="next-q-btn" onclick="proceedToNextQuestion()">看懂了，前往下一題 ➔</button>
    `;

    if (btnEl) btnEl.classList.add('btn-wrong');
    appState.currentUnitResults.push({ qId: q.qId, correct: false, score: 0, usedHint: appState.usedHintForCurrentQ, timeout: false });
  }

  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  document.getElementById('comboDisplay').textContent = appState.combo;

  feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.giveUpCurrentQuestion = function() {
  if (appState.isAnswered) return;
  stopQuestionTimer();
  appState.isAnswered = true;
  
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const q = unit.questions[appState.activeQuestionIdx];

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

window.proceedToNextQuestion = function() {
  stopQuestionTimer();
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  if (appState.activeQuestionIdx + 1 < unit.questions.length) {
    appState.activeQuestionIdx++;
    renderCurrentQuestion();
  } else {
    concludeUnitQuest();
  }
};

// 結算單元成績並自動寫入資料庫
function concludeUnitQuest() {
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const totalQuestions = unit.questions.length;
  
  let baseScore = 0;
  let challengeScore = 0;
  let correctCount = 0;
  let hintCount = 0;
  let wrongCount = 0;
  let timeoutCount = 0;

  appState.currentUnitResults.forEach((res, idx) => {
    if (idx < 10) {
      baseScore += res.score;
    } else {
      challengeScore += res.score;
    }

    if (res.correct) {
      correctCount++;
      if (res.usedHint) hintCount++;
    } else {
      if (res.timeout) timeoutCount++;
      else wrongCount++;
    }
  });

  const finalTotalScore = baseScore + challengeScore;
  const timeSpentSec = Math.round((Date.now() - appState.unitStartTime) / 1000);

  if (appState.currentStudent) {
    const s = appState.currentStudent;
    if (!appState.studentScores[s.studentId]) {
      appState.studentScores[s.studentId] = {
        name: s.name,
        class: s.class,
        seat: s.seat,
        studentId: s.studentId,
        unitScores: {},
        lastUpdated: Date.now()
      };
    }
    const prevScore = appState.studentScores[s.studentId].unitScores[unit.unitId] || 0;
    if (finalTotalScore >= prevScore) {
      appState.studentScores[s.studentId].unitScores[unit.unitId] = finalTotalScore;
      appState.studentScores[s.studentId].lastUpdated = Date.now();
    }
    persistRecords();

    // 即時推播更新至後台資料庫
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

function renderResultScreen(res) {
  const container = document.getElementById('resultDetailsContainer');
  if (!container) return;

  let evaluation = '';
  if (res.finalTotalScore >= 90) evaluation = '🏆 特工宗師！課本觀念與挑戰實戰近乎滿分！';
  else if (res.finalTotalScore >= 80) evaluation = '🌟 菁英特工！基礎題扎實，挑戰題表現亮眼！';
  else if (res.finalTotalScore >= 60) evaluation = '✨ 合格特工！基礎觀念及格，可再多複習挑戰題！';
  else if (res.finalTotalScore >= 40) evaluation = '👍 再接再厲！建議多參考課本對應頁面加強！';
  else evaluation = '💪 見習特工，不要氣餒！複習課本後再挑戰一次！';

  // 統計 15 題對錯狀況
  let perfectCount = 0;
  let hintCount = 0;
  let wrongCount = 0;
  let timeoutCount = 0;

  const matrixHtml = appState.currentUnitResults.map((r, idx) => {
    let statusClass = 'status-wrong';
    let statusText = '答錯';
    let pts = r.score;

    if (r.correct) {
      if (r.usedHint) {
        statusClass = 'status-hint';
        statusText = '提示答對';
        hintCount++;
      } else {
        statusClass = 'status-perfect';
        statusText = '完全答對';
        perfectCount++;
      }
    } else {
      if (r.timeout) {
        statusClass = 'status-timeout';
        statusText = '逾時未答';
        timeoutCount++;
      } else {
        wrongCount++;
      }
    }

    const isChall = idx >= 10;
    const maxP = isChall ? 8 : 6;
    return `
      <div class="matrix-q-card ${statusClass}">
        <div class="matrix-q-num">第 ${idx + 1} 題</div>
        <div class="matrix-q-score">${pts} / ${maxP}</div>
        <span class="matrix-q-type">${statusText}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="result-score-card">
      <div class="score-big-num">${res.finalTotalScore} <span class="score-unit">分</span></div>
      <div class="score-breakdown">
        <span>基礎核心成績：<strong>${res.baseScore} / 60 分</strong></span>
        <span>進階挑戰成績：<strong>${res.challengeScore} / 40 分</strong></span>
        <span>總分滿分：<strong>100 分</strong></span>
      </div>
      <div class="result-evaluation-tag">${evaluation}</div>
    </div>

    <!-- 簡易美觀對錯題分析圖表 -->
    <div class="result-analysis-section">
      <div class="analysis-header">
        <h3 class="analysis-title"><i class="fa-solid fa-chart-pie"></i> 15 題對錯與得分診斷分析</h3>
        <div class="analysis-summary-chips">
          <span class="chip-item chip-perfect">🟢 完美答對 ${perfectCount} 題</span>
          <span class="chip-item chip-hint">🟡 提示減半 ${hintCount} 題</span>
          <span class="chip-item chip-wrong">🔴 答錯 0分 ${wrongCount} 題</span>
          <span class="chip-item chip-timeout">⚪ 逾時 0分 ${timeoutCount} 題</span>
        </div>
      </div>

      <div class="question-matrix-grid">
        ${matrixHtml}
      </div>
    </div>

    <div class="result-stats-grid" style="margin-top:20px;">
      <div class="stat-box">
        <div class="stat-lbl">答對率</div>
        <div class="stat-val">${Math.round((res.correctCount / res.totalQuestions) * 100)}% (${res.correctCount} / ${res.totalQuestions})</div>
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

// =========================================================================
// 遠端雲端資料庫 API 通訊模組 (記錄、更新、拉取)
// =========================================================================
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
    console.warn('同步至雲端資料庫異常 (資料仍已完整保存在本機快取):', err);
  }
}

// 靜默拉取雲端資料
async function silentPullCloudData() {
  const url = appState.cfWorkerUrl;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_all_data' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.studentScores) {
        mergeStudentScores(data.studentScores);
      }
    }
  } catch(e) {}
}

// 合併雲端學生成績
function mergeStudentScores(cloudScores) {
  Object.keys(cloudScores).forEach(sId => {
    const cStudent = cloudScores[sId];
    if (!appState.studentScores[sId]) {
      appState.studentScores[sId] = cStudent;
    } else {
      // 合併各單元成績 (取較高分)
      const localUnitScores = appState.studentScores[sId].unitScores || {};
      const cloudUnitScores = cStudent.unitScores || {};
      const allUnits = new Set([...Object.keys(localUnitScores), ...Object.keys(cloudUnitScores)]);
      allUnits.forEach(uId => {
        localUnitScores[uId] = Math.max(localUnitScores[uId] || 0, cloudUnitScores[uId] || 0);
      });
      appState.studentScores[sId].unitScores = localUnitScores;
    }
  });
  persistRecords();
}

// 教師手動點擊「立即從雲端資料庫同步」
window.pullFromCloudDatabase = async function() {
  const url = appState.cfWorkerUrl;
  if (!url) {
    alert('尚未設定雲端資料庫網址！請先在下方「遠端雲端資料庫串接設定」中填入 Worker 或 Google Apps Script 網址。');
    return;
  }

  try {
    const btn = event.target;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 同步中...';
    btn.disabled = true;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_all_data' })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.studentScores) {
        mergeStudentScores(data.studentScores);
      }
      if (data.questionStats) {
        Object.assign(appState.questionStats, data.questionStats);
      }
      if (data.loginLogs && Array.isArray(data.loginLogs)) {
        appState.loginLogs = data.loginLogs;
      }
      persistRecords();
      renderTeacherDashboard();
      updateCloudStatusBadge(true);
      alert('🎉 雲端資料庫同步完成！已成功抓取並合併最新全校學生成績與作答紀錄！');
    } else {
      throw new Error('伺服器回應狀態碼：' + res.status);
    }
  } catch (err) {
    updateCloudStatusBadge(false);
    alert('❌ 連線至雲端資料庫失敗：' + err.message + '\n請確認網址是否正確並已開放 CORS 跨域存取。');
  } finally {
    renderTeacherDashboard();
  }
};

// 測試雲端資料庫連線
window.testCloudConnection = async function() {
  const url = document.getElementById('cfWorkerInput').value.trim();
  if (!url) {
    alert('請先輸入資料庫網址！');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_all_data' })
    });
    if (res.ok) {
      updateCloudStatusBadge(true);
      alert('✅ 恭喜！雲端資料庫連線成功！可以正常進行記錄、更新與查詢！');
    } else {
      updateCloudStatusBadge(false);
      alert('⚠️ 伺服器已回應但狀態異常：' + res.status);
    }
  } catch (err) {
    updateCloudStatusBadge(false);
    alert('❌ 無法連線至該網址：' + err.message);
  }
};

function updateCloudStatusBadge(isOnline) {
  const badge = document.getElementById('cloudStatusBadge');
  if (!badge) return;
  if (isOnline) {
    badge.className = 'cloud-status-badge online';
    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> 已連線';
  } else {
    badge.className = 'cloud-status-badge offline';
    badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> 未連線 / 異常';
  }
}

// 儲存遠端資料庫網址設定
window.saveCfWorkerConfig = function() {
  const val = document.getElementById('cfWorkerInput').value.trim();
  appState.cfWorkerUrl = val;
  localStorage.setItem('CYBERCLOUD_CF_URL', val);
  alert('雲端資料庫網址設定已儲存！');
  testCloudConnection();
};

// =========================================================================
// 教師後台管理 (查詢、篩選、手動更新、匯出匯入)
// =========================================================================
function openTeacherAuthModal() {
  const pwd = prompt('請輸入教師管理後台密碼：');
  if (pwd === 'teacher115' || pwd === 'admin') {
    showScreen('adminScreen');
    renderTeacherDashboard();
  } else if (pwd !== null) {
    alert('密碼錯誤！');
  }
}

function renderTeacherDashboard() {
  const totalStudents = appState.roster.length || 318;
  const testedStudentIds = Object.keys(appState.studentScores);
  const testedCount = testedStudentIds.length;
  
  document.getElementById('statTotalTested').textContent = `${testedCount} / ${totalStudents} 人`;
  document.getElementById('statTotalLogins').textContent = `${appState.loginLogs.length} 人次`;

  filterAdminTable();
  renderQuestionPassRateTable();
  renderRecentLoginLogs();

  const workerInput = document.getElementById('cfWorkerInput');
  if (workerInput) {
    workerInput.value = appState.cfWorkerUrl;
  }
  if (appState.cfWorkerUrl) {
    updateCloudStatusBadge(true);
  }
}

// 依班級下拉與搜尋框即時過濾學生成績表 (QUERY)
window.filterAdminTable = function() {
  const classFilter = document.getElementById('adminClassFilter') ? document.getElementById('adminClassFilter').value : 'ALL';
  const keyword = document.getElementById('adminSearchInput') ? document.getElementById('adminSearchInput').value.trim().toLowerCase() : '';
  const tbody = document.getElementById('classScoreTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let students = Object.values(appState.studentScores);

  // 1. 班級篩選
  if (classFilter !== 'ALL') {
    students = students.filter(s => s.class === classFilter);
  }

  // 2. 關鍵字搜尋 (姓名、學號、座號)
  if (keyword) {
    students = students.filter(s => 
      s.name.toLowerCase().includes(keyword) ||
      s.studentId.toLowerCase().includes(keyword) ||
      String(s.seat) === keyword ||
      s.class.includes(keyword)
    );
  }

  // 排序：先依班級、再依座號
  students.sort((a, b) => {
    if (a.class !== b.class) return a.class.localeCompare(b.class, 'zh-TW');
    return a.seat - b.seat;
  });

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">無符合搜尋條件之學生紀錄</td></tr>';
    return;
  }

  students.forEach(st => {
    const tr = document.createElement('tr');
    const uScores = st.unitScores || {};
    const avg = calculateAverage(uScores);
    
    tr.innerHTML = `
      <td>${escapeHtml(st.class)}</td>
      <td><strong>${st.seat}</strong></td>
      <td><strong>${escapeHtml(st.name)}</strong></td>
      <td><code>${escapeHtml(st.studentId)}</code></td>
      <td>${formatScore(uScores['unit-1-1'])}</td>
      <td>${formatScore(uScores['unit-1-2'])}</td>
      <td>${formatScore(uScores['unit-1-3'])}</td>
      <td>${formatScore(uScores['unit-2-1'])}</td>
      <td><span class="badge-score">${avg} 分</span></td>
      <td>
        <button class="edit-btn-sm" onclick="openEditScoreModal('${escapeHtml(st.studentId)}')">
          <i class="fa-solid fa-pen-to-square"></i> 修改成績
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

function formatScore(score) {
  if (score === undefined || score === null) return '<span class="text-muted">--</span>';
  if (score >= 100) return `<span class="score-high"><strong>${score}分</strong></span>`;
  if (score >= 60) return `<span class="score-pass">${score}分</span>`;
  return `<span class="score-low">${score}分</span>`;
}

function calculateAverage(unitScores) {
  const vals = Object.values(unitScores).filter(v => v !== undefined && v !== null);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round(sum / vals.length);
}

// -------------------------------------------------------------------------
// 教師手動修改更新學生成績 (UPDATE)
// -------------------------------------------------------------------------
window.openEditScoreModal = function(studentId) {
  const student = appState.studentScores[studentId];
  if (!student) {
    alert('查無該學生紀錄！');
    return;
  }

  document.getElementById('editModalStudentId').value = studentId;
  document.getElementById('editModalStudentTitle').textContent = `修改成績：${student.class} ${student.seat}號 ${student.name} (${student.studentId})`;

  const grid = document.getElementById('editModalScoresGrid');
  grid.innerHTML = '';

  const units = QUEST_DATA.units;
  units.forEach(u => {
    const curVal = student.unitScores && student.unitScores[u.unitId] !== undefined ? student.unitScores[u.unitId] : '';
    const item = document.createElement('div');
    item.className = 'edit-unit-field';
    item.innerHTML = `
      <label>${escapeHtml(u.unitTitle)}</label>
      <input type="number" id="edit_score_${u.unitId}" min="0" max="125" class="form-control" value="${curVal}" placeholder="未作答">
    `;
    grid.appendChild(item);
  });

  document.getElementById('editScoreModal').classList.remove('hidden');
};

window.closeEditScoreModal = function() {
  document.getElementById('editScoreModal').classList.add('hidden');
};

// 儲存修改之成績並同步至雲端資料庫
window.saveEditedScores = async function() {
  const studentId = document.getElementById('editModalStudentId').value;
  const student = appState.studentScores[studentId];
  if (!student) return;

  const units = QUEST_DATA.units;
  units.forEach(u => {
    const input = document.getElementById(`edit_score_${u.unitId}`);
    if (input && input.value !== '') {
      const val = Number(input.value);
      student.unitScores[u.unitId] = Math.max(0, Math.min(125, val));
    }
  });

  student.lastUpdated = Date.now();
  persistRecords();

  // 同步更新至遠端資料庫
  syncToCloudflare('update_score', {
    studentId: studentId,
    student: student,
    unitScores: student.unitScores
  });

  closeEditScoreModal();
  filterAdminTable();
  alert(`✅ 學生【${student.name}】的成績已成功更新，並同步寫入資料庫！`);
};

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

// 匯出完整 JSON 資料庫
window.exportDatabaseJSON = function() {
  const dbDump = {
    version: APP_VERSION,
    exportTime: new Date().toISOString(),
    studentScores: appState.studentScores,
    questionStats: appState.questionStats,
    loginLogs: appState.loginLogs
  };

  const blob = new Blob([JSON.stringify(dbDump, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CyberCloud_學生資料庫完整備份_${Date.now()}.json`;
  a.click();
};

window.triggerImportJSON = function() {
  document.getElementById('importJsonFileInput').click();
};

// 匯入與合併 JSON 資料庫
window.handleImportJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.studentScores) {
        mergeStudentScores(imported.studentScores);
      }
      if (imported.questionStats) {
        Object.assign(appState.questionStats, imported.questionStats);
      }
      if (imported.loginLogs && Array.isArray(imported.loginLogs)) {
        appState.loginLogs = [...imported.loginLogs, ...appState.loginLogs].slice(0, 500);
      }
      persistRecords();
      renderTeacherDashboard();
      alert('🎉 成功匯入並合併學生成績資料庫！');
    } catch (err) {
      alert('❌ 檔案格式錯誤，無法解析 JSON 資料庫：' + err.message);
    }
  };
  reader.readAsText(file);
};

// 匯出 CSV 報表
window.exportScoresCSV = function() {
  const students = Object.values(appState.studentScores);
  if (students.length === 0) {
    alert('目前尚無成績可供匯出！');
    return;
  }

  let csvContent = '\uFEFF班級,座號,姓名,學號,單元1-1,單元1-2,單元1-3,單元2-1,單元2-2,單元2-3,單元2-4,單元2-5,平均成績\n';
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

  const contentArea = document.getElementById('modalWorksheetContent');
  if (!contentArea) return;

  contentArea.innerHTML = '';
  ws.questions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'ws-question-card';
    card.innerHTML = `
      <div class="ws-q-header" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <span class="ws-q-badge" style="background:#2563eb;color:#fff;font-weight:700;padding:3px 10px;border-radius:6px;">第 ${q.qNum} 題</span>
        <span class="ws-score-tag" style="background:rgba(234, 179, 8, 0.2);color:#facc15;border:1px solid #eab308;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:700;">⭐ 配分：${escapeHtml(q.score || '20分 (滿分100分)')}</span>
        <span class="ws-bloom-tag" style="background:rgba(16, 185, 129, 0.2);color:#34d399;border:1px solid #10b981;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:600;"><i class="fa-solid fa-book-open"></i> ${escapeHtml(q.bookPage || '')}</span>
        <span class="ws-tool-tag" style="background:rgba(56, 189, 248, 0.15);color:#38bdf8;border:1px solid #0284c7;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:600;"><i class="fa-solid fa-screwdriver-wrench"></i> ${escapeHtml(q.tool || '')}</span>
      </div>
      <div style="font-size:1.1rem;font-weight:700;color:var(--text-bright);margin-bottom:8px;">${escapeHtml(q.title)}</div>
      
      <div class="ws-scenario-box" style="margin-top:6px;background:rgba(56, 189, 248, 0.08);padding:10px 14px;border-left:4px solid var(--cyan-glow);border-radius:4px;font-size:0.92rem;line-height:1.6;">
        <strong>📌 課堂實作情境：</strong> ${escapeHtml(q.scenario)}
      </div>

      <div class="ws-prompt-box" style="margin-top:10px;background:rgba(245, 158, 11, 0.08);padding:12px 14px;border-left:4px solid var(--amber-glow);border-radius:4px;font-size:0.92rem;line-height:1.7;">
        <strong>🎯 實作操作指引與具體任務：</strong><br>
        ${escapeHtml(q.taskSteps).replace(/\n/g, '<br>')}
      </div>

      <div style="margin-top:10px;background:rgba(168, 85, 247, 0.08);padding:12px 14px;border-left:4px solid #a855f7;border-radius:4px;font-size:0.92rem;line-height:1.6;">
        <strong>🔍 最終截圖要求（老師批改一眼判定標準）：</strong><br>
        <span style="color:#c084fc;">👉 ${escapeHtml(q.screenshotTarget)}</span>
      </div>

      <div class="ws-paste-preview-box" style="margin-top:12px;border:2px dashed rgba(56, 189, 248, 0.4);border-radius:8px;padding:20px;text-align:center;background:rgba(15, 23, 42, 0.4);color:#94a3b8;">
        <i class="fa-solid fa-camera" style="font-size:1.6rem;color:var(--cyan-glow);margin-bottom:6px;display:block;"></i>
        <strong style="color:var(--cyan-glow);">【第 ${q.qNum} 題 學生實作操作截圖貼上區】</strong><br>
        <span style="font-size:0.85rem;">（在 Google 文件中於此框內按下 Ctrl + V 貼上螢幕截圖，佔評分 100%）</span>
      </div>

      <div class="ws-answer-box" style="margin-top:12px;">
        <details>
          <summary style="cursor:pointer;font-weight:600;color:var(--cyan-glow);padding:6px 0;"><i class="fa-solid fa-graduation-cap"></i> 點擊展開 教師評分檢核點（滿分 20 分）</summary>
          <div class="ws-sample-answer-text" style="margin-top:8px;padding:12px;background:rgba(15, 23, 42, 0.6);border-radius:6px;font-size:0.88rem;line-height:1.7;color:var(--text-main);">
            ${escapeHtml(q.gradingChecklist).replace(/\n/g, '<br>')}
          </div>
        </details>
      </div>
    `;
    contentArea.appendChild(card);
  });
}

window.copyCurrentWorksheet = function() {
  const ws = WORKSHEET_DATA[appState.activeWorksheetUnitIdx];
  if (!ws) return;

  let text = `【115資訊科技】課堂探究與課本實踐學習單（Google Docs / Classroom 副本專用）\n`;
  text += `單元名稱：${ws.unitTitle}\n`;
  text += `課程進度：${ws.textbookRef || ''}\n`;
  text += `評分標準：本單元共 5 題，每題 20 分，滿分 100 分\n`;
  text += `學生資料：班級：_______ 班    座號：_______ 號    姓名：_______________    學號：_______________    總分：_______ / 100\n\n`;
  text += `============================================================\n`;
  text += `【學生作答指引】\n`;
  text += `1. 請開啟 Chrome 瀏覽器，依照每題「實作操作步驟」實際操作相應工具。\n`;
  text += `2. 操作完成後，按下螢幕截圖（鍵盤 Win + Shift + S 或 PrtScn）。\n`;
  text += `3. 直接在指定的【📸 截圖貼上區】按下 Ctrl + V 貼上您的最終成果截圖。\n`;
  text += `4. 全部 5 題完成後，直接在 Google Classroom 點擊「繳交」！\n`;
  text += `============================================================\n\n`;
  text += `------------------------------------------------------------\n\n`;

  ws.questions.forEach(q => {
    text += `【第 ${q.qNum} 題】${q.title}（配分：20 分）\n`;
    text += `- 📖 課本依據：${q.bookPage}\n`;
    text += `- 🛠️ 使用工具：${q.tool}\n`;
    text += `- 📌 情境說明：${q.scenario}\n\n`;
    text += `🎯 實作操作指引與具體任務：\n`;
    text += `${q.taskSteps}\n\n`;
    text += `🔍 最終截圖要求（老師批改一眼判定標準）：\n`;
    text += `👉 ${q.screenshotTarget}\n\n`;
    text += `+------------------------------------------------------------------+\n`;
    text += `|               📸 【第 ${q.qNum} 題 學生實作操作截圖貼上區】                |\n`;
    text += `|                                                                  |\n`;
    text += `|       [ 請在此框內按下鍵盤 Ctrl + V 貼上您的最終操作成果截圖 ]    |\n`;
    text += `|                                                                  |\n`;
    text += `+------------------------------------------------------------------+\n\n`;
    text += `✅ 教師評分檢核點（滿分 20 分）：\n`;
    text += `${q.gradingChecklist}\n\n`;
    text += `------------------------------------------------------------\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ 已成功複製《${ws.unitTitle}》Google Docs 學習單！\n每題 20 分（滿分 100 分），已為 Google Classroom「建立副本」格式最佳化。\n您可直接前往 Google 文件貼上 (Ctrl+V) 派發！`);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert(`✅ 已複製至剪貼簿！可直接貼入 Google Docs / Classroom。`);
  });
};

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
      document.getElementById('loginSeat').value = '';
      document.getElementById('loginName').value = '';
      document.getElementById('loginId').value = '';
      document.getElementById('loginClass').value = '';
      showScreen('loginScreen');
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fisher-Yates 洗牌演算法：確保選擇題選項隨機排列，答案不固定出現在 A
function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


// 初始化套用保存的主題風格
const savedAppTheme = localStorage.getItem('cybercloud_theme') || 'cyber';
if (window.changeTheme) window.changeTheme(savedAppTheme);
