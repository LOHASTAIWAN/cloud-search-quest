
// =========================================================================
// 主題風格切換器 (四種國中生超愛風格：電競霓虹 / 動漫星穹 / 方塊冒險 / 韓系奶茶)
// =========================================================================
window.changeTheme = function(themeName) {
  const normalized = (themeName === 'arcade') ? 'voxel' : themeName;
  document.body.setAttribute('data-theme', normalized);
  localStorage.setItem('cybercloud_theme', normalized);
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = normalized;
  document.querySelectorAll('.theme-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === normalized);
  });
};

// 40 秒限時作答計時器引擎
function startQuestionTimer(durationSec = 40) {
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
      if (left <= 6) {
        timerText.className = 'timer-countdown danger';
      } else if (left <= 12) {
        timerText.className = 'timer-countdown warning';
      } else {
        timerText.className = 'timer-countdown';
      }
    }

    if (timerBar) {
      timerBar.style.width = `${pct}%`;
      if (left <= 6) {
        timerBar.className = 'timer-progress-fill danger';
      } else if (left <= 12) {
        timerBar.className = 'timer-progress-fill warning';
      } else {
        timerBar.className = 'timer-progress-fill';
      }
    }

    if (left <= 0) {
      stopQuestionTimer();
      const unit = QUEST_DATA.units[appState.activeUnitIdx];
      const q = (appState.activeQuestions && appState.activeQuestions[appState.activeQuestionIdx]) || unit.questions[appState.activeQuestionIdx];
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
      <span class="badge-error">⏰ 作答時間到（超過 40 秒）！本題 0 分</span>
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

const APP_VERSION = "6.3.0";
const DEFAULT_CF_WORKER_URL = "https://cybercloud-backend.fruit-a1-english.workers.dev";

function getValidCloudUrl() {
  const saved = localStorage.getItem('CYBERCLOUD_CF_URL') || '';
  if (!saved || saved.includes('meadow-xenon.workers.dev')) {
    localStorage.setItem('CYBERCLOUD_CF_URL', DEFAULT_CF_WORKER_URL);
    return DEFAULT_CF_WORKER_URL;
  }
  return saved;
}

// 系統核心狀態
const appState = {
  roster: [],
  currentStudent: null, // { class, seat, studentId, name, loginTime }
  
  // 測驗關卡中狀態
  activeUnitIdx: 0,
  activeQuestionIdx: 0,
  activeQuestions: [], // 該次測驗隨機洗牌後的題目與選項序列
  hp: 100,
  xp: 0,
  liveScore: 0,
  combo: 0,
  maxCombo: 0,
  soundEnabled: true,
  isAnswered: false,
  unitStartTime: null,
  currentUnitResults: [], // [{ qId, correct: true/false, score: number, usedHint: boolean, timeout: boolean }]

  // 40 秒倒數計時與提示扣分狀態
  questionTimer: null,
  autoSkipTimer: null,
  timerSecondsLeft: 40,
  usedHintForCurrentQ: false,
  
  // 學習單 Modal 當前單元
  activeWorksheetUnitIdx: 0,

  // 後台成績與每題通過率快取 (LocalStorage 快取)
  studentScores: {}, // key: studentId -> { name, class, seat, studentId, unitScores: { [unitId]: score }, lastUpdated }
  questionStats: {}, // key: qId -> { attempts: 0, correct: 0, passRate: '0%' }
  loginLogs: [],     // [{ class, seat, studentId, name, loginTime, timestamp }]

  // 遠端資料庫 API 設定 (主：Cloudflare Worker；備援雙寫：Google Apps Script)
  cfWorkerUrl: getValidCloudUrl(),
  backupDbUrl: localStorage.getItem('CYBERCLOUD_BACKUP_URL') || ''
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

  let canonicalStudent = { class: cls, seat: seat, name: name, studentId: studentId };

  // 若有名條進行嚴格核對並使用名條標準化欄位 (防學號大小寫不一致)
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
    canonicalStudent = {
      class: match.class,
      seat: match.seat,
      name: match.name,
      studentId: String(match.studentId).trim()
    };
  }

  const now = new Date();
  const loginTime = now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });

  appState.currentStudent = {
    ...canonicalStudent,
    loginTime: loginTime
  };

  // 記錄登入日誌
  appState.loginLogs.unshift({
    ...canonicalStudent,
    loginTime: loginTime,
    timestamp: Date.now()
  });
  persistRecords();

  // 非同步即時記錄至後台資料庫，並靜默拉取雲端以同步更新該生大廳歷史最佳分數
  syncToCloudflare('log_login', appState.currentStudent).then(() => {
    silentPullCloudData().then(ok => { if (ok) initUnitLobby(); });
  });

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
    
    // 檢查該學生在該單元的歷史最佳成績與闖關次數
    let bestScore = '--';
    let attemptsCount = 0;
    if (appState.currentStudent) {
      const sId = appState.currentStudent.studentId;
      const st = appState.studentScores[sId];
      if (st && st.unitScores && st.unitScores[unit.unitId] !== undefined) {
        bestScore = st.unitScores[unit.unitId] + ' 分';
      }
      if (st && st.unitAttempts && st.unitAttempts[unit.unitId]) {
        attemptsCount = st.unitAttempts[unit.unitId];
      }
    }

    const wsObj = (typeof WORKSHEET_DATA !== 'undefined' && WORKSHEET_DATA[idx]) ? WORKSHEET_DATA[idx] : null;
    const appsBadgeText = wsObj && wsObj.appsUsed ? wsObj.appsUsed.join(' · ') : '📋 實作任務包';

    card.innerHTML = `
      <div class="unit-header">
        <span class="unit-badge">單元 0${idx + 1}</span>
        <span class="unit-category">${unit.category}</span>
      </div>
      <h3 class="unit-title">${unit.unitTitle}</h3>
      <p class="unit-desc">${unit.description}</p>
      <div class="unit-meta">
        <span>🎯 測驗：${unit.questions.length} 題多元互動 (前10題60分 + 後5題40分)</span>
        <span class="unit-score-badge">最佳成績：<strong>${bestScore}</strong>${attemptsCount > 0 ? ` <small>(已闖關 ${attemptsCount} 次)</small>` : ''}</span>
      </div>
      <div class="unit-card-actions">
        <button class="start-unit-btn" onclick="startQuestUnit(${idx})">
          <i class="fa-solid fa-play"></i> 進入闖關挑戰
        </button>
        <button class="unit-worksheet-btn" onclick="openWorksheetModal(${idx})" title="檢視與複製本單元實務作業任務包">
          <i class="fa-solid fa-layer-group"></i> 實作作業 (${escapeHtml(appsBadgeText)})
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 開始進行特定單元測驗（防作弊機制：每次進入/重考均對題目順序、選項順序、排序卡片進行雙重隨機洗牌）
window.startQuestUnit = function(unitIdx) {
  sound.init();
  const unit = QUEST_DATA.units[unitIdx];
  const rawQuestions = unit ? unit.questions : [];

  // 分層洗牌：前 10 題基礎題(60分) 亂序洗牌 + 後 5 題挑戰題(40分) 亂序洗牌
  const basePool = shuffleArray(rawQuestions.slice(0, 10));
  const challengePool = shuffleArray(rawQuestions.slice(10));
  appState.activeQuestions = [...basePool, ...challengePool].map(q => {
    const cloned = { ...q };
    if (q.type === 'true_false') {
      cloned.options = q.options ? [...q.options] : ['⭕ 正確 (TRUE)', '❌ 錯誤 (FALSE)'];
    } else if (q.options) {
      cloned.options = shuffleArray(q.options);
    }
    if (q.type === 'order' && q.steps) {
      cloned.shuffledSteps = shuffleArray(q.steps);
    }
    return cloned;
  });

  appState.activeUnitIdx = unitIdx;
  appState.activeQuestionIdx = 0;
  appState.hp = 100;
  appState.xp = 0;
  appState.liveScore = 0;
  appState.combo = 0;
  appState.maxCombo = 0;
  appState.isAnswered = false;
  appState.unitStartTime = Date.now();
  appState.currentUnitResults = [];

  showScreen('quizScreen');
  renderCurrentQuestion();
};

function getQuestionTypeLabel(type) {
  switch (type) {
    case 'true_false': return '⚡ 快閃是非判斷';
    case 'multi_select': return '☑️ 特工偵探複選';
    case 'order': return '🧩 步驟排序大挑戰';
    case 'binary_switch': return '💡 二進位位元開關';
    case 'cloze': return '🎯 情境填空實戰';
    default: return '🎯 選擇實戰題';
  }
}

// 渲染當前題目
function renderCurrentQuestion() {
  stopQuestionTimer();
  appState.isAnswered = false;
  appState.usedHintForCurrentQ = false;

  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const questionsList = (appState.activeQuestions && appState.activeQuestions.length > 0) ? appState.activeQuestions : unit.questions;
  const q = questionsList[appState.activeQuestionIdx];
  const totalQ = questionsList.length;
  const isChallenge = appState.activeQuestionIdx >= 10;
  const maxPts = isChallenge ? 8 : 6;
  const halfPts = isChallenge ? 4 : 3;

  document.getElementById('currentUnitName').textContent = unit.unitTitle;
  document.getElementById('questionProgressText').textContent = `第 ${appState.activeQuestionIdx + 1} / ${totalQ} 題 ${isChallenge ? '【進階時事挑戰題 (每題8分)】' : '【基礎生活核心題 (每題6分)】'}`;
  
  const progPct = ((appState.activeQuestionIdx + 1) / totalQ) * 100;
  document.getElementById('progressBarFill').style.width = `${progPct}%`;
  
  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  const liveEl = document.getElementById('liveScoreDisplay');
  if (liveEl) liveEl.textContent = appState.liveScore;
  document.getElementById('comboDisplay').textContent = appState.combo;

  const qContainer = document.getElementById('questionContainer');
  qContainer.innerHTML = `
    <div class="question-tag-row">
      <span class="q-type-badge">${getQuestionTypeLabel(q.type)}</span>
      <span class="q-points-badge">${isChallenge ? '+8 分 (挑戰題・全單元滿分40)' : '+6 分 (基礎題・全單元滿分60)'}</span>
      <span class="q-level-badge">難度：${q.level}</span>
      <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">(限時 40 秒・看提示得 ${halfPts} 分・題序隨機)</span>
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
  startQuestionTimer(40);
}

function formatPromptContent(q) {
  if (q.type === 'cloze') {
    return escapeHtml(q.prompt).replace(/\[\s*BLANK\s*\]/g, '<span class="cloze-blank">【 ？ 填空位置 】</span>');
  }
  return escapeHtml(q.prompt);
}

function appendHintBar(area, q) {
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

function renderInteractiveInput(q) {
  const area = document.getElementById('answerArea');
  area.innerHTML = '';

  // 1. 快閃是非判斷題 (true_false)
  if (q.type === 'true_false') {
    const tfGrid = document.createElement('div');
    tfGrid.className = 'tf-battle-grid';
    const opts = q.options || ['⭕ 正確 (TRUE)', '❌ 錯誤 (FALSE)'];
    opts.forEach(opt => {
      const isTrueOpt = opt.includes('正確');
      const btn = document.createElement('button');
      btn.className = `tf-choice-btn ${isTrueOpt ? 'tf-true' : 'tf-false'}`;
      btn.innerHTML = `<span class="tf-icon">${isTrueOpt ? '⭕' : '❌'}</span><span class="tf-label">${isTrueOpt ? '正確 (TRUE)' : '錯誤 (FALSE)'}</span>`;
      btn.addEventListener('click', () => checkOptionAnswer(q, opt, btn));
      tfGrid.appendChild(btn);
    });
    area.appendChild(tfGrid);
    appendHintBar(area, q);
    return;
  }

  // 2. 特工偵探複選題 (multi_select)
  if (q.type === 'multi_select' && q.options) {
    const infoTip = document.createElement('div');
    infoTip.className = 'multi-hint-banner';
    infoTip.innerHTML = `<i class="fa-solid fa-list-check"></i> 請點選 <strong>全部正確項目</strong>（共 ${q.correctOptions ? q.correctOptions.length : '多'} 項），選完點擊下方「鎖定複選答案」：`;
    area.appendChild(infoTip);

    const grid = document.createElement('div');
    grid.className = 'options-grid multi-grid';
    const selectedSet = new Set();
    const shuffledOptions = shuffleArray(q.options);

    shuffledOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-choice-btn multi-choice-btn';
      btn.innerHTML = `<span class="opt-check-box">☐</span> <span class="opt-badge">${String.fromCharCode(65 + idx)}</span> <span class="opt-text">${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => {
        if (appState.isAnswered) return;
        if (selectedSet.has(opt)) {
          selectedSet.delete(opt);
          btn.classList.remove('selected');
          btn.querySelector('.opt-check-box').textContent = '☐';
        } else {
          selectedSet.add(opt);
          btn.classList.add('selected');
          btn.querySelector('.opt-check-box').textContent = '☑';
        }
      });
      grid.appendChild(btn);
    });
    area.appendChild(grid);

    const submitRow = document.createElement('div');
    submitRow.className = 'interactive-submit-row';
    submitRow.innerHTML = `<button class="primary-btn submit-multi-btn"><i class="fa-solid fa-lock"></i> 鎖定並送出複選答案</button>`;
    submitRow.querySelector('button').addEventListener('click', () => {
      if (appState.isAnswered) return;
      if (selectedSet.size === 0) {
        alert('請至少勾選一個選項喔！');
        return;
      }
      const correctArr = q.correctOptions || [];
      const isCorrect = selectedSet.size === correctArr.length && correctArr.every(c => selectedSet.has(c));
      handleAnswerResult(isCorrect, q, Array.from(selectedSet).join('、'));
    });
    area.appendChild(submitRow);
    appendHintBar(area, q);
    return;
  }

  // 3. 步驟排序大挑戰 (order)
  if (q.type === 'order' && q.steps) {
    const chosenOrder = [];
    const poolSteps = q.shuffledSteps || shuffleArray(q.steps);

    const orderWrap = document.createElement('div');
    orderWrap.className = 'order-quest-container';
    orderWrap.innerHTML = `
      <div class="order-slots-header">
        <span>🧩 <strong>已排好順序（點擊可退回重選）：</strong></span>
        <button type="button" class="order-reset-btn">🔄 清空重排</button>
      </div>
      <div id="orderChosenZone" class="order-chosen-zone">
        <div class="order-empty-hint">請依正確順序點擊下方步驟卡片...</div>
      </div>
      <div class="order-pool-header">📦 <strong>待選步驟卡片（隨機打亂）：</strong></div>
      <div id="orderPoolZone" class="order-pool-zone"></div>
      <div class="interactive-submit-row">
        <button id="btnSubmitOrder" class="primary-btn"><i class="fa-solid fa-check-double"></i> 確認送出順序解答</button>
      </div>
    `;
    area.appendChild(orderWrap);

    const chosenZone = document.getElementById('orderChosenZone');
    const poolZone = document.getElementById('orderPoolZone');

    function renderOrderZones() {
      // 渲染已選區域
      if (chosenOrder.length === 0) {
        chosenZone.innerHTML = '<div class="order-empty-hint">請依正確順序點擊下方步驟卡片...</div>';
      } else {
        chosenZone.innerHTML = '';
        chosenOrder.forEach((stepText, idx) => {
          const item = document.createElement('button');
          item.className = 'order-card chosen';
          item.innerHTML = `<span class="order-num-badge">${idx + 1}</span> <span class="order-text">${escapeHtml(stepText)}</span> <span class="order-remove-tag">✕</span>`;
          item.addEventListener('click', () => {
            if (appState.isAnswered) return;
            chosenOrder.splice(idx, 1);
            renderOrderZones();
          });
          chosenZone.appendChild(item);
        });
      }

      // 渲染待選區域
      poolZone.innerHTML = '';
      poolSteps.forEach((stepText) => {
        const isUsed = chosenOrder.includes(stepText);
        const btn = document.createElement('button');
        btn.className = `order-card pool ${isUsed ? 'used' : ''}`;
        btn.disabled = isUsed;
        btn.innerHTML = `<span class="order-text">${escapeHtml(stepText)}</span>`;
        btn.addEventListener('click', () => {
          if (appState.isAnswered || isUsed) return;
          chosenOrder.push(stepText);
          renderOrderZones();
        });
        poolZone.appendChild(btn);
      });
    }

    renderOrderZones();

    orderWrap.querySelector('.order-reset-btn').addEventListener('click', () => {
      if (appState.isAnswered) return;
      chosenOrder.length = 0;
      renderOrderZones();
    });

    document.getElementById('btnSubmitOrder').addEventListener('click', () => {
      if (appState.isAnswered) return;
      if (chosenOrder.length !== q.steps.length) {
        alert(`請排滿全部 ${q.steps.length} 個步驟後再送出喔！（目前選了 ${chosenOrder.length} 個）`);
        return;
      }
      const isCorrect = q.steps.every((s, idx) => chosenOrder[idx] === s);
      handleAnswerResult(isCorrect, q, chosenOrder.map((s, i) => `${i + 1}. ${s}`).join(' ➔ '));
    });

    appendHintBar(area, q);
    return;
  }

  // 4. 二進位位元開關實驗室 (binary_switch)
  if (q.type === 'binary_switch') {
    const weights = q.weights || [8, 4, 2, 1];
    const bits = new Array(weights.length).fill(0);

    const binBox = document.createElement('div');
    binBox.className = 'binary-switch-panel';
    binBox.innerHTML = `
      <div class="binary-instruction">💡 點擊下方發光開關切換 <strong>0 (關)</strong> / <strong>1 (開)</strong>，讓組合數值等於題目目標：</div>
      <div id="binarySwitchesRow" class="binary-switches-row"></div>
      <div class="binary-readout">
        <span>目前二進位：<code id="binaryCodeStr">${bits.join('')}</code></span>
        <span>目前十進位總和：<strong id="binaryDecimalSum" style="color:var(--cyan-glow);font-size:1.3rem;">0</strong></span>
      </div>
      <div class="interactive-submit-row">
        <button id="btnSubmitBinary" class="primary-btn"><i class="fa-solid fa-bolt"></i> 鎖定二進位開關送出驗證</button>
      </div>
    `;
    area.appendChild(binBox);

    const rowEl = document.getElementById('binarySwitchesRow');
    const codeEl = document.getElementById('binaryCodeStr');
    const sumEl = document.getElementById('binaryDecimalSum');

    function updateBinaryView() {
      rowEl.innerHTML = '';
      let sum = 0;
      weights.forEach((w, idx) => {
        if (bits[idx] === 1) sum += w;
        const sw = document.createElement('button');
        sw.className = `bit-switch-card ${bits[idx] === 1 ? 'bit-on' : 'bit-off'}`;
        sw.innerHTML = `
          <div class="bit-weight">位權 ${w}</div>
          <div class="bit-bulb">${bits[idx] === 1 ? '💡' : '⚫'}</div>
          <div class="bit-val">${bits[idx]}</div>
        `;
        sw.addEventListener('click', () => {
          if (appState.isAnswered) return;
          bits[idx] = bits[idx] === 1 ? 0 : 1;
          updateBinaryView();
        });
        rowEl.appendChild(sw);
      });
      codeEl.textContent = bits.join('');
      sumEl.textContent = sum;
    }

    updateBinaryView();

    document.getElementById('btnSubmitBinary').addEventListener('click', () => {
      if (appState.isAnswered) return;
      let sum = 0;
      weights.forEach((w, idx) => { if (bits[idx] === 1) sum += w; });
      const isCorrect = sum === q.targetValue;
      handleAnswerResult(isCorrect, q, `二進位 ${bits.join('')} (十進位 ${sum})`);
    });

    appendHintBar(area, q);
    return;
  }

  // 5. 傳統填空 fallback 或一般 4 選 1 選擇題 (choice / cloze with options)
  if (!q.options || q.options.length === 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cloze-input-wrapper';
    wrapper.innerHTML = `
      <div class="input-action-bar">
        <input type="text" id="clozeInput" class="game-input" placeholder="請在此輸入答案" autocomplete="off" autofocus />
        <button id="btnSubmitCloze" class="primary-btn">確認送出</button>
      </div>
    `;
    area.appendChild(wrapper);

    const input = document.getElementById('clozeInput');
    document.getElementById('btnSubmitCloze').addEventListener('click', () => checkClozeAnswer(q, input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkClozeAnswer(q, input.value);
      }
    });
    appendHintBar(area, q);
  } else {
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    // 再次隨機洗牌選項，確保正確答案隨機落在 A/B/C/D
    const shuffledOptions = shuffleArray(q.options);

    shuffledOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-choice-btn';
      btn.innerHTML = `<span class="opt-badge">${String.fromCharCode(65 + idx)}</span> <span class="opt-text">${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => checkOptionAnswer(q, opt, btn));
      optionsGrid.appendChild(btn);
    });

    area.appendChild(optionsGrid);
    appendHintBar(area, q);
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
    appState.liveScore += earnedPts;

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
  const liveEl = document.getElementById('liveScoreDisplay');
  if (liveEl) liveEl.textContent = appState.liveScore;
  document.getElementById('comboDisplay').textContent = appState.combo;

  feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.giveUpCurrentQuestion = function() {
  if (appState.isAnswered) return;
  stopQuestionTimer();
  appState.isAnswered = true;
  
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const questionsList = (appState.activeQuestions && appState.activeQuestions.length > 0) ? appState.activeQuestions : unit.questions;
  const q = questionsList[appState.activeQuestionIdx];

  recordQuestionAttempt(q.qId, false);
  appState.combo = 0;
  appState.currentUnitResults.push({ qId: q.qId, correct: false, score: 0, usedHint: appState.usedHintForCurrentQ, timeout: false });

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
  const totalQ = (appState.activeQuestions && appState.activeQuestions.length > 0) ? appState.activeQuestions.length : unit.questions.length;
  if (appState.activeQuestionIdx + 1 < totalQ) {
    appState.activeQuestionIdx++;
    renderCurrentQuestion();
  } else {
    concludeUnitQuest();
  }
};

// 結算單元成績並自動寫入資料庫（包含闖關次數、每次得分與作答時間）
function concludeUnitQuest() {
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const totalQuestions = (appState.activeQuestions && appState.activeQuestions.length > 0) ? appState.activeQuestions.length : unit.questions.length;
  
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
  const completedTimeStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
  let attemptNumber = 1;

  if (appState.currentStudent) {
    const s = appState.currentStudent;
    if (!appState.studentScores[s.studentId]) {
      appState.studentScores[s.studentId] = {
        name: s.name,
        class: s.class,
        seat: s.seat,
        studentId: s.studentId,
        unitScores: {},
        unitAttempts: {},
        unitLastTime: {},
        unitHistory: {},
        lastUpdated: Date.now()
      };
    }
    const rec = appState.studentScores[s.studentId];
    if (!rec.unitScores) rec.unitScores = {};
    if (!rec.unitAttempts) rec.unitAttempts = {};
    if (!rec.unitLastTime) rec.unitLastTime = {};
    if (!rec.unitHistory) rec.unitHistory = {};

    attemptNumber = (rec.unitAttempts[unit.unitId] || 0) + 1;
    rec.unitAttempts[unit.unitId] = attemptNumber;
    rec.unitLastTime[unit.unitId] = completedTimeStr;
    if (!Array.isArray(rec.unitHistory[unit.unitId])) rec.unitHistory[unit.unitId] = [];
    rec.unitHistory[unit.unitId].push({
      attempt: attemptNumber,
      score: finalTotalScore,
      time: completedTimeStr,
      timestamp: Date.now()
    });

    const prevScore = rec.unitScores[unit.unitId] || 0;
    if (finalTotalScore >= prevScore || rec.unitScores[unit.unitId] === undefined) {
      rec.unitScores[unit.unitId] = finalTotalScore;
    }
    rec.lastUpdated = Date.now();
    persistRecords();

    // 即時推播更新至後台資料庫（含次數、得分與作答時間，支援自動重試與狀態回饋）
    const submitPayload = {
      student: s,
      unitId: unit.unitId,
      unitTitle: unit.unitTitle,
      baseScore: baseScore,
      challengeScore: challengeScore,
      finalScore: finalTotalScore,
      attemptNumber: attemptNumber,
      completedTime: completedTimeStr,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      timeSpentSec: timeSpentSec,
      results: appState.currentUnitResults
    };
    appState.lastSubmitPayload = submitPayload;

    syncToCloudflare('submit_score', submitPayload).then(ok => {
      updateResultCloudBadge(ok);
    });
  }

  let bestSavedScore = finalTotalScore;
  if (appState.currentStudent) {
    const recCheck = appState.studentScores[appState.currentStudent.studentId];
    if (recCheck && recCheck.unitScores && recCheck.unitScores[unit.unitId] !== undefined) {
      bestSavedScore = recCheck.unitScores[unit.unitId];
    }
  }

  const resultMeta = {
    unitTitle: unit.unitTitle,
    unitId: unit.unitId,
    baseScore: baseScore,
    challengeScore: challengeScore,
    finalTotalScore: finalTotalScore,
    bestSavedScore: bestSavedScore,
    correctCount: correctCount,
    totalQuestions: totalQuestions,
    maxCombo: appState.maxCombo,
    timeSpentSec: timeSpentSec,
    attemptNumber: attemptNumber,
    completedTimeStr: completedTimeStr
  };
  appState.lastResultSummary = resultMeta;

  showScreen('resultScreen');
  renderResultScreen(resultMeta);
}

window.copyScoreReceipt = function() {
  const r = appState.lastResultSummary;
  const s = appState.currentStudent || { class: '訪客', seat: '-', name: '未登入', studentId: '-' };
  if (!r) return;
  const details = appState.currentUnitResults.map((q, i) => `Q${i + 1}:${q.score}分(${q.correct ? (q.usedHint ? '提示對' : '全對') : (q.timeout ? '逾時' : '錯')})`).join(' | ');
  const receipt = [
    '【115資訊科技・測驗電子成績憑證】',
    `學生：${s.class} ${s.seat}號 ${s.name} (學號：${s.studentId})`,
    `單元：${r.unitTitle}`,
    `本次實得分數：${r.finalTotalScore} 分 (基礎${r.baseScore}/60 + 挑戰${r.challengeScore}/40)`,
    `系統保留最高分：${r.bestSavedScore} 分 (累計第 ${r.attemptNumber} 次闖關)`,
    `完成時間：${r.completedTimeStr} (耗時 ${r.timeSpentSec} 秒)`,
    `逐題明細：${details}`
  ].join('\n');
  navigator.clipboard.writeText(receipt).then(() => {
    alert('✅ 已複製「電子成績憑證」至剪貼簿！可傳送給老師存證查核，絕不怕遺失重測！');
  }).catch(() => {
    prompt('請複製以下電子成績憑證：', receipt);
  });
};

function updateResultCloudBadge(isSuccess) {
  const el = document.getElementById('resultCloudSyncBadge');
  if (!el) return;
  if (isSuccess) {
    el.innerHTML = '<span style="color:#34d399;font-weight:700;"><i class="fa-solid fa-cloud-arrow-up"></i> ✅ 成績已安全寫入雲端資料庫，老師後台即時可查！</span>';
  } else {
    el.innerHTML = '<span style="color:#fb7185;font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> ⚠️ 雲端寫入連線異常（已暫存本機）</span> <button type="button" class="secondary-btn" style="padding:3px 10px;font-size:0.78rem;margin-left:8px;" onclick="retryLastSubmitScore()">🔄 點此立即補傳雲端</button>';
  }
}

window.retryLastSubmitScore = async function() {
  if (!appState.lastSubmitPayload) return;
  const el = document.getElementById('resultCloudSyncBadge');
  if (el) el.innerHTML = '<span style="color:#38bdf8;"><i class="fa-solid fa-spinner fa-spin"></i> 正在補傳成績至雲端...</span>';
  const ok = await syncToCloudflare('submit_score', appState.lastSubmitPayload);
  updateResultCloudBadge(ok);
};

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
      <div style="margin-top:8px;font-size:0.88rem;color:var(--text-muted);">
        📊 這是您本單元的 <strong>第 ${res.attemptNumber || 1} 次</strong> 闖關（歷史最高保留：<strong>${res.bestSavedScore !== undefined ? res.bestSavedScore : res.finalTotalScore} 分</strong>） ｜ 🕒 完成時間：${escapeHtml(res.completedTimeStr || '')}
      </div>
      <div id="resultCloudSyncBadge" style="margin-top:8px;font-size:0.86rem;">
        <span style="color:#38bdf8;"><i class="fa-solid fa-spinner fa-spin"></i> 正在將成績安全同步至雲端資料庫...</span>
      </div>
      <div style="margin-top:10px;">
        <button type="button" class="secondary-btn" style="padding:6px 14px;font-size:0.85rem;" onclick="copyScoreReceipt()"><i class="fa-solid fa-receipt"></i> 📋 複製本場電子成績憑證 (防漏存證)</button>
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
      <button class="secondary-btn" onclick="openWorksheetModal(appState.activeUnitIdx)">📑 檢視本單元多元實作作業任務</button>
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
// 若網址帶有 ?cloud_api=... 或 ?backup_api=... 參數，自動儲存並綁定資料庫網址 (方便全班在任何電腦打開即自動連線)
(function checkUrlCloudApiParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const apiParam = params.get('cloud_api');
    if (apiParam && (apiParam.startsWith('http://') || apiParam.startsWith('https://'))) {
      appState.cfWorkerUrl = apiParam.trim();
      localStorage.setItem('CYBERCLOUD_CF_URL', appState.cfWorkerUrl);
    }
    const backupParam = params.get('backup_api');
    if (backupParam && (backupParam.startsWith('http://') || backupParam.startsWith('https://'))) {
      appState.backupDbUrl = backupParam.trim();
      localStorage.setItem('CYBERCLOUD_BACKUP_URL', appState.backupDbUrl);
    }
  } catch (e) {}
})();

async function syncToCloudflare(action, payload, maxRetries = 3) {
  const url = appState.cfWorkerUrl;
  const bodyStr = JSON.stringify({ action: action, data: payload, timestamp: Date.now() });

  // 若教師有設定第二備援資料庫 (如 Google 試算表 Apps Script)，同步觸發雙寫備份
  if (appState.backupDbUrl && appState.backupDbUrl !== url && ['log_login', 'submit_score', 'update_score', 'sync_recovery'].includes(action)) {
    fetch(appState.backupDbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyStr,
      cache: 'no-store'
    }).catch(e => console.warn('備援雙寫異常 (不影響主庫寫入):', e));
  }

  if (!url) {
    updateCloudStatusBadge(false);
    return false;
  }
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 使用 text/plain;charset=utf-8 避免觸發 Google Apps Script CORS OPTIONS 預檢阻擋，且 Cloudflare Worker 同樣可完整解析 JSON
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyStr,
        cache: 'no-store'
      });
      if (res.ok) {
        const resData = await res.json().catch(() => ({ success: true }));
        if (resData.success !== false) {
          updateCloudStatusBadge(true);
          return true;
        }
      }
    } catch (err) {
      console.warn(`同步至雲端資料庫第 ${attempt} 次失敗:`, err);
    }
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, attempt * 450));
    }
  }
  updateCloudStatusBadge(false);
  return false;
}

// 自動偵測本機快取是否有遺失未寫入雲端的成績，若發現則自動救援補傳回雲端
async function recoverUnsyncedLocalScores(cloudScores) {
  if (!appState.cfWorkerUrl || !cloudScores) return 0;
  let recoveredCount = 0;
  const localIds = Object.keys(appState.studentScores);
  for (const sId of localIds) {
    const lSt = appState.studentScores[sId];
    if (!lSt || !lSt.unitScores) continue;
    const cSt = cloudScores[sId] || {};
    const cUnitScores = cSt.unitScores || {};

    for (const uId of Object.keys(lSt.unitScores)) {
      const lScore = lSt.unitScores[uId];
      const cScore = cUnitScores[uId];
      if (lScore !== undefined && lScore !== null && (cScore === undefined || Number(lScore) > Number(cScore))) {
        const ok = await syncToCloudflare('sync_recovery', {
          student: {
            class: lSt.class,
            seat: lSt.seat,
            name: lSt.name,
            studentId: sId
          },
          unitId: uId,
          finalScore: Number(lScore),
          attemptNumber: (lSt.unitAttempts && lSt.unitAttempts[uId]) || 1,
          completedTime: (lSt.unitLastTime && lSt.unitLastTime[uId]) || new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }),
          unitHistory: (lSt.unitHistory && lSt.unitHistory[uId]) || []
        }, 2);
        if (ok) recoveredCount++;
      }
    }
  }
  if (recoveredCount > 0) {
    console.log(`🔄 已自動將本機保存的 ${recoveredCount} 筆漏傳單元成績成功補傳至雲端資料庫！`);
  }
  return recoveredCount;
}

// 靜默拉取雲端資料（拉取前先比對本機未同步分數並自動救援補傳）
async function silentPullCloudData() {
  const url = appState.cfWorkerUrl;
  if (!url) {
    updateCloudStatusBadge(false);
    return false;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'get_all_data' }),
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.studentScores) {
        await recoverUnsyncedLocalScores(data.studentScores);
        mergeStudentScores(data.studentScores);
      }
      if (data.questionStats) {
        Object.assign(appState.questionStats, data.questionStats);
      }
      if (data.loginLogs && Array.isArray(data.loginLogs)) {
        appState.loginLogs = data.loginLogs;
      }
      updateCloudStatusBadge(true);
      return true;
    }
    updateCloudStatusBadge(false);
    return false;
  } catch (e) {
    updateCloudStatusBadge(false);
    return false;
  }
}

// 合併雲端學生成績（包含最高分、闖關次數、時間與歷次紀錄）
function mergeStudentScores(cloudScores) {
  Object.keys(cloudScores).forEach(sId => {
    const cStudent = cloudScores[sId];
    if (!appState.studentScores[sId]) {
      appState.studentScores[sId] = cStudent;
    } else {
      const lStudent = appState.studentScores[sId];
      // 1. 合併各單元最高成績
      const localUnitScores = lStudent.unitScores || {};
      const cloudUnitScores = cStudent.unitScores || {};
      const allUnits = new Set([...Object.keys(localUnitScores), ...Object.keys(cloudUnitScores)]);
      allUnits.forEach(uId => {
        localUnitScores[uId] = Math.max(localUnitScores[uId] || 0, cloudUnitScores[uId] || 0);
      });
      lStudent.unitScores = localUnitScores;

      // 2. 合併闖關次數
      const localAttempts = lStudent.unitAttempts || {};
      const cloudAttempts = cStudent.unitAttempts || {};
      const allAttUnits = new Set([...Object.keys(localAttempts), ...Object.keys(cloudAttempts)]);
      allAttUnits.forEach(uId => {
        localAttempts[uId] = Math.max(localAttempts[uId] || 0, cloudAttempts[uId] || 0);
      });
      lStudent.unitAttempts = localAttempts;

      // 3. 合併最後作答時間與歷次紀錄
      const localLast = lStudent.unitLastTime || {};
      const cloudLast = cStudent.unitLastTime || {};
      lStudent.unitLastTime = { ...localLast, ...cloudLast };

      const localHist = lStudent.unitHistory || {};
      const cloudHist = cStudent.unitHistory || {};
      const allHistUnits = new Set([...Object.keys(localHist), ...Object.keys(cloudHist)]);
      allHistUnits.forEach(uId => {
        const lArr = Array.isArray(localHist[uId]) ? localHist[uId] : [];
        const cArr = Array.isArray(cloudHist[uId]) ? cloudHist[uId] : [];
        // 合併並以 timestamp 去重
        const mergedMap = new Map();
        [...lArr, ...cArr].forEach(item => {
          const key = `${item.attempt}_${item.timestamp || item.time}`;
          mergedMap.set(key, item);
        });
        localHist[uId] = Array.from(mergedMap.values()).sort((a, b) => (a.attempt || 0) - (b.attempt || 0));
      });
      lStudent.unitHistory = localHist;
    }
  });
  persistRecords();
}

// 教師手動點擊「立即從雲端資料庫同步」
window.pullFromCloudDatabase = async function(btnEl) {
  const url = appState.cfWorkerUrl;
  if (!url) {
    alert('尚未設定有效雲端資料庫網址！請先在下方「遠端雲端資料庫串接設定」填入真實的 Cloudflare Worker 或 Google Apps Script 網頁應用程式網址。');
    return;
  }

  const btn = btnEl || (typeof event !== 'undefined' ? event.target.closest('button') : null);
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 同步中...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'get_all_data' }),
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success === false) {
        throw new Error(data.error || '後端回傳錯誤');
      }
      let recovered = 0;
      if (data.studentScores) {
        recovered = await recoverUnsyncedLocalScores(data.studentScores);
        mergeStudentScores(data.studentScores);
      }
      if (data.questionStats) {
        Object.assign(appState.questionStats, data.questionStats);
      }
      if (data.loginLogs && Array.isArray(data.loginLogs)) {
        appState.loginLogs = data.loginLogs;
      }
      persistRecords();
      renderTeacherDashboard(true);
      updateCloudStatusBadge(true);
      const countNow = Object.keys(appState.studentScores).length;
      alert(`🎉 雲端資料庫同步完成！目前全校共有 ${countNow} 位學生紀錄${recovered > 0 ? `（並自動救援補傳了 ${recovered} 筆本機漏傳成績）` : ''}！`);
    } else {
      throw new Error('伺服器回應狀態碼：' + res.status);
    }
  } catch (err) {
    updateCloudStatusBadge(false);
    alert('❌ 連線至雲端資料庫失敗：' + err.message + '\n請確認網址是否已正確部署並開放所有人 (Anyone) 存取。');
  } finally {
    if (btn) {
      btn.innerHTML = origHtml || '<i class="fa-solid fa-rotate"></i> 雲端同步';
      btn.disabled = false;
    }
  }
};

// 測試雲端資料庫連線
window.testCloudConnection = async function() {
  const url = document.getElementById('cfWorkerInput').value.trim();
  if (!url) {
    updateCloudStatusBadge(false);
    alert('請先輸入資料庫網址！');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'get_all_data' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        updateCloudStatusBadge(true);
        alert('✅ 恭喜！雲端資料庫連線成功！可以正常進行記錄、更新與查詢！');
      } else {
        updateCloudStatusBadge(false);
        alert('⚠️ 連線成功但後端回傳異常：' + (data.error || '未知錯誤'));
      }
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
    badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> 未連線 / 未設定';
  }
}

// 儲存遠端資料庫網址設定
window.saveCfWorkerConfig = function() {
  const val = document.getElementById('cfWorkerInput').value.trim();
  appState.cfWorkerUrl = val;
  localStorage.setItem('CYBERCLOUD_CF_URL', val);
  testCloudConnection();
};

// 儲存備援雙寫資料庫網址 (如 Google Apps Script)
window.saveBackupDbConfig = function() {
  const val = document.getElementById('backupDbInput') ? document.getElementById('backupDbInput').value.trim() : '';
  appState.backupDbUrl = val;
  if (val) {
    localStorage.setItem('CYBERCLOUD_BACKUP_URL', val);
    alert('✅ 已啟用「雙重備援寫入模式」！未來學生每次交卷將同時寫入 Cloudflare Worker 與您的備援資料庫。');
  } else {
    localStorage.removeItem('CYBERCLOUD_BACKUP_URL');
    alert('已清除第二備援資料庫網址，目前僅使用主資料庫。');
  }
};

// 產生帶有 ?cloud_api=... 的全班專用連結，貼到 Classroom 讓學生在任何電腦都能自動寫入雲端
window.copyShareableClassUrl = function() {
  const url = (document.getElementById('cfWorkerInput') ? document.getElementById('cfWorkerInput').value.trim() : '') || appState.cfWorkerUrl;
  if (!url) {
    alert('請先設定並儲存有效的雲端資料庫網址！');
    return;
  }
  const baseUrl = window.location.origin + window.location.pathname;
  let shareUrl = `${baseUrl}?cloud_api=${encodeURIComponent(url)}`;
  if (appState.backupDbUrl) {
    shareUrl += `&backup_api=${encodeURIComponent(appState.backupDbUrl)}`;
  }
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert(`✅ 已複製全班專用測驗連結！\n學生在任何電腦點擊此連結開啟測驗，成績都會自動同步至您的雲端資料庫：\n\n${shareUrl}`);
  }).catch(() => {
    prompt('請複製以下全班專用連結貼至 Google Classroom：', shareUrl);
  });
};

// =========================================================================
// 教師後台管理 (查詢、篩選、手動更新、匯出匯入)
// =========================================================================
async function openTeacherAuthModal() {
  const pwd = prompt('請輸入教師管理後台密碼：');
  if (pwd === null) return;
  const trimmed = pwd.trim();
  if (!trimmed) {
    alert('請輸入密碼！');
    return;
  }
  if (appState.cfWorkerUrl) {
    try {
      const res = await fetch(appState.cfWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'verify_admin', password: trimmed })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showScreen('adminScreen');
        renderTeacherDashboard();
        return;
      }
      if (res.status === 401) {
        alert('密碼錯誤！');
        return;
      }
    } catch (e) {
      console.warn('雲端密碼驗證連線失敗，採用離線驗證:', e);
    }
  }
  // 本機備援驗證 (確保無網路時仍可管理)
  if (trimmed === 'teacher115' || trimmed === 'admin') {
    showScreen('adminScreen');
    renderTeacherDashboard();
    return;
  }
  alert('密碼錯誤！');
}

function renderTeacherDashboard(skipPing = false) {
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
  const backupInput = document.getElementById('backupDbInput');
  if (backupInput) {
    backupInput.value = appState.backupDbUrl || '';
  }
  if (!appState.cfWorkerUrl) {
    updateCloudStatusBadge(false);
  } else if (!skipPing) {
    silentPullCloudData().then(ok => {
      if (ok) {
        document.getElementById('statTotalTested').textContent = `${Object.keys(appState.studentScores).length} / ${totalStudents} 人`;
        document.getElementById('statTotalLogins').textContent = `${appState.loginLogs.length} 人次`;
        filterAdminTable();
        renderQuestionPassRateTable();
        renderRecentLoginLogs();
      }
    });
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
    tbody.innerHTML = '<tr><td colspan="14" class="text-center text-muted">無符合搜尋條件之學生紀錄</td></tr>';
    return;
  }

  const unitIds = ['unit-1-1', 'unit-1-2', 'unit-1-3', 'unit-2-1', 'unit-2-2', 'unit-2-3', 'unit-2-4', 'unit-2-5'];

  students.forEach(st => {
    const tr = document.createElement('tr');
    const uScores = st.unitScores || {};
    const uAttempts = st.unitAttempts || {};
    const uLastTime = st.unitLastTime || {};
    const avg = calculateAverage(uScores);
    
    const unitCells = unitIds.map(uId => `<td>${formatScore(uScores[uId], uAttempts[uId], uLastTime[uId])}</td>`).join('');

    tr.innerHTML = `
      <td>${escapeHtml(st.class)}</td>
      <td><strong>${st.seat}</strong></td>
      <td><strong>${escapeHtml(st.name)}</strong></td>
      <td><code>${escapeHtml(st.studentId)}</code></td>
      ${unitCells}
      <td><span class="badge-score">${avg} 分</span></td>
      <td>
        <button class="edit-btn-sm" onclick="openEditScoreModal('${escapeHtml(st.studentId)}')">
          <i class="fa-solid fa-pen-to-square"></i> 詳情/修改
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

function formatScore(score, attempts, lastTime) {
  if (score === undefined || score === null) return '<span class="text-muted">--</span>';
  let cls = 'score-low';
  if (score >= 90) cls = 'score-high';
  else if (score >= 60) cls = 'score-pass';
  const attBadge = attempts ? `<br><small style="color:#94a3b8;font-size:0.72rem;" title="最後完成時間：${escapeHtml(lastTime || '無')}">(${attempts}次${lastTime ? ' · ' + escapeHtml(lastTime.split(' ')[1] || lastTime) : ''})</small>` : '';
  return `<span class="${cls}"><strong>${score}分</strong></span>${attBadge}`;
}

function calculateAverage(unitScores) {
  const vals = Object.values(unitScores).filter(v => v !== undefined && v !== null);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round(sum / vals.length);
}

// -------------------------------------------------------------------------
// 教師手動修改與檢視歷次闖關明細 (UPDATE / DETAILS)
// -------------------------------------------------------------------------
window.openEditScoreModal = async function(studentId) {
  let student = appState.studentScores[studentId];
  if (!student) {
    alert('查無該學生紀錄！');
    return;
  }

  // 若連線上雲端，向後端拉取該生最完整的 unitHistory 明細
  if (appState.cfWorkerUrl) {
    try {
      const res = await fetch(appState.cfWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_student_detail', studentId: studentId }),
        cache: 'no-store'
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.student) {
          mergeStudentScores({ [studentId]: d.student });
          student = appState.studentScores[studentId];
        }
      }
    } catch (e) {}
  }

  document.getElementById('editModalStudentId').value = studentId;
  document.getElementById('editModalStudentTitle').textContent = `成績與歷次闖關記錄：${student.class} ${student.seat}號 ${student.name} (${student.studentId})`;

  const grid = document.getElementById('editModalScoresGrid');
  grid.innerHTML = '';

  const units = QUEST_DATA.units;
  units.forEach(u => {
    const curVal = student.unitScores && student.unitScores[u.unitId] !== undefined ? student.unitScores[u.unitId] : '';
    const attempts = (student.unitAttempts && student.unitAttempts[u.unitId]) || 0;
    const lastTime = (student.unitLastTime && student.unitLastTime[u.unitId]) || '尚未完成';
    const histList = (student.unitHistory && Array.isArray(student.unitHistory[u.unitId])) ? student.unitHistory[u.unitId] : [];
    const histHtml = histList.length > 0
      ? `<div style="margin-top:6px;padding:6px 8px;background:rgba(15,23,42,0.5);border-radius:4px;font-size:0.78rem;color:#cbd5e1;max-height:90px;overflow-y:auto;">
          ${histList.map(h => `<div>• 第 ${h.attempt} 次：<strong>${h.score} 分</strong> <span style="color:#94a3b8;">(${escapeHtml(h.time)})</span></div>`).join('')}
         </div>`
      : '';

    const item = document.createElement('div');
    item.className = 'edit-unit-field';
    item.innerHTML = `
      <label>${escapeHtml(u.unitTitle)} <small style="color:#38bdf8;">(已闖關 ${attempts} 次｜最後：${escapeHtml(lastTime)})</small></label>
      <input type="number" id="edit_score_${u.unitId}" min="0" max="125" class="form-control" value="${curVal}" placeholder="未作答">
      ${histHtml}
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

// 匯出 CSV 報表（含分數、闖關次數與最後時間）
window.exportScoresCSV = function() {
  const students = Object.values(appState.studentScores);
  if (students.length === 0) {
    alert('目前尚無成績可供匯出！');
    return;
  }

  const unitIds = ['unit-1-1', 'unit-1-2', 'unit-1-3', 'unit-2-1', 'unit-2-2', 'unit-2-3', 'unit-2-4', 'unit-2-5'];
  const unitHeaders = unitIds.map(id => {
    const label = id.replace('unit-', '單元');
    return `${label}分數,${label}次數,${label}時間`;
  }).join(',');

  let csvContent = `\uFEFF班級,座號,姓名,學號,${unitHeaders},平均成績\n`;
  students.forEach(s => {
    const u = s.unitScores || {};
    const a = s.unitAttempts || {};
    const t = s.unitLastTime || {};
    const avg = calculateAverage(u);
    const cols = unitIds.map(id => `${u[id] !== undefined ? u[id] : 0},${a[id] || 0},"${t[id] || ''}"`).join(',');
    csvContent += `"${s.class}",${s.seat},"${s.name}","${s.studentId}",${cols},${avg}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `115資訊科技_學生測驗成績報表_${Date.now()}.csv`;
  a.click();
};

// =========================================================================
// 多元雲端應用程式實務作業 Modal 控制 (Docs / Sheets / Slides / Forms / Gemini / 心智圖)
// =========================================================================
window.openWorksheetModal = function(unitIdx) {
  if (typeof WORKSHEET_DATA === 'undefined') {
    alert('實作作業任務包正在載入中，請稍候！');
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

window.copySheetsPracticeTable = function(unitIdx, taskIdx) {
  const ws = WORKSHEET_DATA[unitIdx];
  if (!ws || !ws.tasks || !ws.tasks[taskIdx] || !ws.tasks[taskIdx].sheetsSampleCsv) return;
  const csvStr = ws.tasks[taskIdx].sheetsSampleCsv;
  // 將逗號分隔轉換為 Tab (\t) 分隔，直接貼進 Google 試算表時會自動完美對齊展開成各儲存格！
  const tsvStr = csvStr.split('\n').map(line => line.split(',').join('\t')).join('\n');
  navigator.clipboard.writeText(tsvStr).then(() => {
    alert('✅ 已將試算表原始練習數據複製到剪貼簿！\n請打開 Google 試算表點選 A1 儲存格並按 Ctrl+V，表格就會自動整齊對齊展開！\n存成範本後即可在 Classroom 勾選「為每位學生建立副本」派發！');
  }).catch(() => {
    prompt('請手動複製以下表格資料貼進 Google Sheets：', tsvStr);
  });
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

  const appsBadges = (ws.appsUsed || []).map(a => `<span style="background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid #0284c7;padding:3px 10px;border-radius:14px;font-size:0.82rem;font-weight:700;">${escapeHtml(a)}</span>`).join(' ');

  let html = `
    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.4);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px;">
        <strong style="color:#34d399;">🛠️ 本單元實務採用軟體：</strong> ${appsBadges}
      </div>
      <div style="font-size:0.9rem;margin-bottom:4px;color:var(--text-main);">
        <strong>🎓 Classroom 派發模式：</strong> ${escapeHtml(ws.classroomMode || '')}
      </div>
      <div style="font-size:0.9rem;color:#fbbf24;">
        <strong>📤 學生繳交成果形式：</strong> ${escapeHtml(ws.submissionFormat || '')}
      </div>
    </div>
  `;

  const items = ws.tasks || ws.questions || [];
  items.forEach((t, tIdx) => {
    const num = t.tNum || t.qNum || (tIdx + 1);
    const appLabel = t.app || t.tool || '雲端實作';
    const stepsText = t.steps || t.taskSteps || '';
    const rubricText = t.rubric || t.gradingChecklist || '';
    const csvBlock = t.sheetsSampleCsv ? `
      <div style="margin-top:12px;background:rgba(15,23,42,0.75);border:1px solid #38bdf8;border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <strong style="color:#38bdf8;"><i class="fa-solid fa-table"></i> 試算表範本原始練習數據（點擊一鍵複製貼至 Google Sheets A1）</strong>
          <button class="primary-btn" style="padding:5px 12px;font-size:0.82rem;" onclick="copySheetsPracticeTable(${unitIdx}, ${tIdx})">
            📊 一鍵複製試算表練習資料
          </button>
        </div>
        <pre style="margin:0;font-size:0.8rem;color:#cbd5e1;overflow-x:auto;white-space:pre-wrap;background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">${escapeHtml(t.sheetsSampleCsv)}</pre>
      </div>
    ` : '';

    html += `
      <div class="ws-question-card">
        <div class="ws-q-header" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <span class="ws-q-badge" style="background:#2563eb;color:#fff;font-weight:700;padding:3px 10px;border-radius:6px;">任務 ${num}</span>
          <span class="ws-score-tag" style="background:rgba(234, 179, 8, 0.2);color:#facc15;border:1px solid #eab308;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:700;">⭐ 配分：${escapeHtml(t.score || '滿分100分')}</span>
          <span class="ws-bloom-tag" style="background:rgba(16, 185, 129, 0.2);color:#34d399;border:1px solid #10b981;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:600;"><i class="fa-solid fa-book-open"></i> ${escapeHtml(t.bookPage || '')}</span>
          <span class="ws-tool-tag" style="background:rgba(168, 85, 247, 0.2);color:#c084fc;border:1px solid #a855f7;font-size:0.8rem;padding:3px 10px;border-radius:12px;font-weight:700;">${escapeHtml(appLabel)}</span>
        </div>
        <div style="font-size:1.12rem;font-weight:700;color:var(--text-bright);margin-bottom:8px;">${escapeHtml(t.title)}</div>

        <div class="ws-scenario-box" style="margin-top:6px;background:rgba(56, 189, 248, 0.08);padding:10px 14px;border-left:4px solid var(--cyan-glow);border-radius:4px;font-size:0.92rem;line-height:1.6;">
          <strong>📌 生活實務情境：</strong> ${escapeHtml(t.scenario)}
        </div>

        <div class="ws-prompt-box" style="margin-top:10px;background:rgba(245, 158, 11, 0.08);padding:12px 14px;border-left:4px solid var(--amber-glow);border-radius:4px;font-size:0.92rem;line-height:1.7;">
          <strong>🛠️ 具體操作步驟與繳交要求：</strong><br>
          ${escapeHtml(stepsText).replace(/\n/g, '<br>')}
        </div>

        ${csvBlock}

        <div class="ws-answer-box" style="margin-top:12px;">
          <details open>
            <summary style="cursor:pointer;font-weight:600;color:var(--cyan-glow);padding:4px 0;"><i class="fa-solid fa-graduation-cap"></i> 教師批改檢核規準（${escapeHtml(t.score || '')}）</summary>
            <div class="ws-sample-answer-text" style="margin-top:6px;padding:10px 12px;background:rgba(15, 23, 42, 0.6);border-radius:6px;font-size:0.88rem;line-height:1.7;color:var(--text-main);">
              ${escapeHtml(rubricText).replace(/\n/g, '<br>')}
            </div>
          </details>
        </div>
      </div>
    `;
  });

  contentArea.innerHTML = html;
}

window.copyCurrentWorksheet = function() {
  const ws = WORKSHEET_DATA[appState.activeWorksheetUnitIdx];
  if (!ws) return;

  let text = `【115資訊科技】${ws.unitTitle} — 生活實務作業任務\n`;
  text += `📖 課本對應範圍：${ws.textbookRef || ''}\n`;
  text += `🛠️ 本單元使用軟體：${(ws.appsUsed || []).join(' / ')}\n`;
  text += `🎓 Classroom 派發建議：${ws.classroomMode || ''}\n`;
  text += `📤 學生繳交方式：${ws.submissionFormat || ''}\n`;
  text += `============================================================\n\n`;

  const items = ws.tasks || ws.questions || [];
  items.forEach((t, idx) => {
    const num = t.tNum || t.qNum || (idx + 1);
    text += `【任務 ${num}】${t.title}（配分：${t.score}）\n`;
    text += `- 使用應用程式：${t.app || t.tool}\n`;
    text += `- 課本依據：${t.bookPage}\n`;
    text += `- 生活情境：${t.scenario}\n`;
    text += `\n🛠️ 具體實作步驟：\n${t.steps || t.taskSteps}\n`;
    if (t.sheetsSampleCsv) {
      text += `\n📊 試算表範本練習資料 (CSV)：\n${t.sheetsSampleCsv}\n`;
    }
    text += `\n✅ 評分檢核標準：\n${t.rubric || t.gradingChecklist}\n`;
    text += `\n------------------------------------------------------------\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ 已成功複製《${ws.unitTitle}》多元應用程式實作作業說明！\n您可以直接貼入 Google Classroom「建立作業」說明欄，搭配對應的 Docs / Sheets / Slides 範本勾選「為每位學生建立副本」派發！`);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert(`✅ 已複製作業說明至剪貼簿！`);
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
