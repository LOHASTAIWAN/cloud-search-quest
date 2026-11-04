// CyberCloud 雲端神搜特工隊 - 全域引擎 app.js (v2.0)
// 支援 115 級學生名條檢核、80 題 8 大單元闖關、每題通過率與成績後台紀錄、Cloudflare Worker 整合

// 全域狀態機
const appState = {
  // 學生名條與當前登入資訊
  roster: [],
  currentStudent: null, // { class, seat, studentId, name, loginTime }
  
  // 測驗進行中狀態
  activeUnitIdx: 0,
  activeQuestionIdx: 0,
  hp: 100,
  xp: 0,
  combo: 0,
  maxCombo: 0,
  soundEnabled: true,
  isAnswered: false,
  unitStartTime: null,
  currentUnitResults: [], // [{ qId, correct: true/false }]
  
  // 後台成績與每題通過率快取 (LocalStorage 持久化)
  studentScores: {}, // key: studentId -> { unitScores: { [unitId]: score } }
  questionStats: {}, // key: qId -> { attempts: 0, correct: 0, passRate: "0%" }
  loginLogs: [],     // [{ class, seat, studentId, name, loginTime }]

  // Cloudflare Worker API 設定 (可自訂)
  cfWorkerUrl: localStorage.getItem('CYBERCLOUD_CF_URL') || ""
};

// Web Audio API 原生音效合成器
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playCorrect() {
    if (!appState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }
  playWrong() {
    if (!appState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  playClick() {
    if (!appState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
  playVictory() {
    if (!appState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.5);
    });
  }
}
const audio = new SoundSynthesizer();

// DOM 元素快取
const dom = {
  loginView: document.getElementById('loginView'),
  hubView: document.getElementById('hubView'),
  gameView: document.getElementById('gameView'),
  levelClearModal: document.getElementById('levelClearModal'),
  certView: document.getElementById('certView'),
  adminModal: document.getElementById('adminModal'),

  studentBadge: document.getElementById('studentBadge'),
  agentNameDisplay: document.getElementById('agentNameDisplay'),
  hpBadge: document.getElementById('hpBadge'),
  hpDisplay: document.getElementById('hpDisplay'),
  xpBadge: document.getElementById('xpBadge'),
  xpDisplay: document.getElementById('xpDisplay'),
  comboBadge: document.getElementById('comboBadge'),
  comboDisplay: document.getElementById('comboDisplay'),
  audioToggleBtn: document.getElementById('audioToggleBtn'),

  loginClassSelect: document.getElementById('loginClassSelect'),
  loginSeatInput: document.getElementById('loginSeatInput'),
  loginNameInput: document.getElementById('loginNameInput'),
  loginStudentIdInput: document.getElementById('loginStudentIdInput'),
  loginFeedback: document.getElementById('loginFeedback'),

  welcomeStudentTitle: document.getElementById('welcomeStudentTitle'),
  loginTimestampText: document.getElementById('loginTimestampText'),
  completedUnitsCount: document.getElementById('completedUnitsCount'),
  chapter1Grid: document.getElementById('chapter1Grid'),
  chapter2Grid: document.getElementById('chapter2Grid'),

  levelBadge: document.getElementById('levelBadge'),
  questionCounter: document.getElementById('questionCounter'),
  progressBarFill: document.getElementById('progressBarFill'),
  storyTitle: document.getElementById('storyTitle'),
  storyText: document.getElementById('storyText'),
  instructionText: document.getElementById('instructionText'),
  questionBodyContainer: document.getElementById('questionBodyContainer'),

  hintBtn: document.getElementById('hintBtn'),
  submitBtn: document.getElementById('submitBtn'),
  nextBtn: document.getElementById('nextBtn'),
  hintBox: document.getElementById('hintBox'),
  explanationBox: document.getElementById('explanationBox'),
  explanationContent: document.getElementById('explanationContent')
};

// 應用導航與事件命名空間
window.appNav = {
  async init() {
    loadLocalStore();
    await loadStudentRoster();
    setupEventListeners();
    checkSavedSession();
  },

  handleStudentLogin() {
    const className = dom.loginClassSelect.value.trim();
    const seat = parseInt(dom.loginSeatInput.value, 10);
    const name = dom.loginNameInput.value.trim();
    const studentId = dom.loginStudentIdInput.value.trim();

    if (!className || isNaN(seat) || !name || !studentId) {
      this.showLoginError("請完整填寫班級、座號、姓名與 7 碼學號！");
      return;
    }

    const matched = appState.roster.find(s => 
      s.class === className &&
      s.seat === seat &&
      s.name === name &&
      s.studentId === studentId
    );

    if (!matched) {
      this.showLoginError("❌ 身分查驗失敗！查無此學生資料或班級座號姓名學號不符，請確認名條重新輸入！");
      audio.playWrong();
      return;
    }

    audio.playCorrect();
    const nowIso = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    appState.currentStudent = {
      class: matched.class,
      seat: matched.seat,
      studentId: matched.studentId,
      name: matched.name,
      gender: matched.gender,
      loginTime: nowIso
    };

    appState.loginLogs.push({ ...appState.currentStudent });
    saveLocalStore();

    syncLoginToCloudflare(appState.currentStudent);
    sessionStorage.setItem('CYBERCLOUD_STUDENT', JSON.stringify(appState.currentStudent));

    this.showLoginSuccess(`驗證通過！歡迎 ${matched.class} ${matched.seat}號 ${matched.name} 特工！`);
    setTimeout(() => {
      this.goToHub();
    }, 600);
  },

  showLoginError(msg) {
    dom.loginFeedback.style.display = 'block';
    dom.loginFeedback.style.background = 'rgba(244, 63, 94, 0.15)';
    dom.loginFeedback.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    dom.loginFeedback.style.color = '#fda4af';
    dom.loginFeedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
  },

  showLoginSuccess(msg) {
    dom.loginFeedback.style.display = 'block';
    dom.loginFeedback.style.background = 'rgba(16, 185, 129, 0.15)';
    dom.loginFeedback.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    dom.loginFeedback.style.color = '#34d399';
    dom.loginFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
  },

  logout() {
    if (confirm("確定要登出當前特工身分嗎？")) {
      sessionStorage.removeItem('CYBERCLOUD_STUDENT');
      appState.currentStudent = null;
      dom.loginView.style.display = 'block';
      dom.hubView.style.display = 'none';
      dom.gameView.style.display = 'none';
      dom.certView.style.display = 'none';
      dom.studentBadge.style.display = 'none';
      dom.hpBadge.style.display = 'none';
      dom.xpBadge.style.display = 'none';
      dom.comboBadge.style.display = 'none';
      dom.loginFeedback.style.display = 'none';
      audio.playClick();
    }
  },

  goToHub() {
    if (!appState.currentStudent) {
      dom.loginView.style.display = 'block';
      return;
    }
    dom.loginView.style.display = 'none';
    dom.gameView.style.display = 'none';
    dom.levelClearModal.style.display = 'none';
    dom.certView.style.display = 'none';
    dom.hubView.style.display = 'block';

    dom.studentBadge.style.display = 'inline-flex';
    dom.agentNameDisplay.textContent = `${appState.currentStudent.class} ${appState.currentStudent.seat}號 ${appState.currentStudent.name}`;
    dom.welcomeStudentTitle.textContent = `${appState.currentStudent.name} 特工，請選擇任務單元`;
    dom.loginTimestampText.textContent = `身分認證登入時間：${appState.currentStudent.loginTime}`;

    renderHubUnits();
  },

  startUnit(unitIdx) {
    audio.playClick();
    appState.activeUnitIdx = unitIdx;
    appState.activeQuestionIdx = 0;
    appState.hp = 100;
    appState.combo = 0;
    appState.unitStartTime = Date.now();
    appState.currentUnitResults = [];

    dom.hubView.style.display = 'none';
    dom.gameView.style.display = 'block';
    dom.hpBadge.style.display = 'inline-flex';
    dom.xpBadge.style.display = 'inline-flex';
    dom.comboBadge.style.display = 'inline-flex';

    updateStatusDisplays();
    loadCurrentQuestion();
  },

  openAdminModal() {
    audio.playClick();
    dom.adminModal.style.display = 'flex';
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminLockMsg').style.display = 'none';
    document.getElementById('adminAuthLock').style.display = 'block';
    document.getElementById('adminDashboardContent').style.display = 'none';
  },

  closeAdminModal() {
    dom.adminModal.style.display = 'none';
  },

  verifyAdminPassword() {
    const pwd = document.getElementById('adminPasswordInput').value.trim();
    if (pwd === 'teacher115' || pwd === 'admin115') {
      audio.playCorrect();
      document.getElementById('adminAuthLock').style.display = 'none';
      document.getElementById('adminDashboardContent').style.display = 'block';
      this.initAdminDashboard();
    } else {
      audio.playWrong();
      const msg = document.getElementById('adminLockMsg');
      msg.textContent = '❌ 安全密碼錯誤，請確認教師授權碼！';
      msg.style.display = 'block';
    }
  },

  switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  },

  initAdminDashboard() {
    this.renderAdminStats();
    populateAdminClassFilter();
    this.renderAdminStudentList();
    document.getElementById('cfWorkerUrlInput').value = appState.cfWorkerUrl;
  },

  renderAdminStats() {
    const tbody = document.getElementById('questionStatsTableBody');
    tbody.innerHTML = '';

    QUEST_LEVELS.forEach(unit => {
      unit.questions.forEach((q) => {
        const stat = appState.questionStats[q.id] || { attempts: 0, correct: 0 };
        const rateNum = stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0;
        const rateStr = stat.attempts > 0 ? rateNum.toFixed(1) + '%' : '-';

        let badgeClass = 'medium';
        let diagText = '待作答累積';
        if (stat.attempts > 0) {
          if (rateNum >= 80) {
            badgeClass = 'high';
            diagText = '掌握良好';
          } else if (rateNum >= 50) {
            badgeClass = 'medium';
            diagText = '普遍理解';
          } else {
            badgeClass = 'low';
            diagText = '⚠️ 迷思概念 / 易錯難題';
          }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${q.id}</strong></td>
          <td><span style="font-size:0.75rem; color:#94a3b8;">${unit.title.split('：')[0]}</span></td>
          <td>${q.title}</td>
          <td>${stat.attempts} 次</td>
          <td>${stat.correct} 次</td>
          <td><span class="rate-badge ${badgeClass}">${rateStr}</span></td>
          <td><span style="font-size:0.8rem; color:${badgeClass === 'low' ? '#fda4af' : '#cbd5e1'}">${diagText}</span></td>
        `;
        tbody.appendChild(tr);
      });
    });
  },

  renderAdminStudentList() {
    const tbody = document.getElementById('studentScoresTableBody');
    tbody.innerHTML = '';
    const filterClass = document.getElementById('filterClassSelect').value;

    const list = filterClass === 'ALL' 
      ? appState.roster 
      : appState.roster.filter(s => s.class === filterClass);

    list.forEach(stu => {
      const stuData = appState.studentScores[stu.studentId] || { unitScores: {} };
      const completedCount = Object.keys(stuData.unitScores).length;
      
      let avgScore = 0;
      if (completedCount > 0) {
        const sum = Object.values(stuData.unitScores).reduce((a, b) => a + b, 0);
        avgScore = Math.round(sum / completedCount);
      }

      const log = appState.loginLogs.slice().reverse().find(l => l.studentId === stu.studentId);
      const loginTimeStr = log ? log.loginTime : '<span style="color:#64748b;">未曾登入</span>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${stu.class}</td>
        <td>${stu.seat}</td>
        <td><code>${stu.studentId}</code></td>
        <td><strong>${stu.name}</strong></td>
        <td><small>${loginTimeStr}</small></td>
        <td>${completedCount} / 8 單元</td>
        <td><strong style="color:${avgScore >= 80 ? '#34d399' : (avgScore >= 60 ? '#fbbf24' : '#f87171')}">${completedCount > 0 ? avgScore + ' 分' : '-'}</strong></td>
        <td>${completedCount === 8 ? '<span class="rate-badge high">大滿貫全通</span>' : (completedCount > 0 ? '<span class="rate-badge medium">闖關中</span>' : '<span style="color:#64748b; font-size:0.75rem;">未啟動</span>')}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  exportStudentScoresCSV() {
    let csv = "\uFEFF班級,座號,學號,性別,姓名,最近登入時間,單元1,單元2,單元3,單元4,單元5,單元6,單元7,單元8,完成單元數,平均得分\n";
    
    appState.roster.forEach(stu => {
      const stuData = appState.studentScores[stu.studentId] || { unitScores: {} };
      const log = appState.loginLogs.slice().reverse().find(l => l.studentId === stu.studentId);
      const loginTime = log ? log.loginTime : "未登入";

      const scores = [];
      let sum = 0;
      let count = 0;
      for (let u = 1; u <= 8; u++) {
        const sc = stuData.unitScores[u] !== undefined ? stuData.unitScores[u] : "";
        scores.push(sc);
        if (sc !== "") {
          sum += sc;
          count++;
        }
      }
      const avg = count > 0 ? Math.round(sum / count) : "";

      csv += `"${stu.class}",${stu.seat},"${stu.studentId}","${stu.gender}","${stu.name}","${loginTime}",` +
             scores.map(s => `"${s}"`).join(",") +
             `,${count},"${avg}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `中一全體資訊科技專題成績冊_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    audio.playClick();
  },

  async saveCloudflareConfig() {
    const url = document.getElementById('cfWorkerUrlInput').value.trim();
    appState.cfWorkerUrl = url;
    localStorage.setItem('CYBERCLOUD_CF_URL', url);
    audio.playClick();

    const resDiv = document.getElementById('cfTestResult');
    resDiv.innerHTML = '<span style="color:#38bdf8;">連線測試中...</span>';

    if (!url) {
      resDiv.innerHTML = '<span style="color:#94a3b8;">已清除 Cloudflare 綁定，系統將採用本機儲存雙軌模式。</span>';
      return;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      resDiv.innerHTML = `<span style="color:#34d399;">✅ 連線成功！後台服務運作中：${data.service || 'Cloudflare Worker'}</span>`;
    } catch (e) {
      resDiv.innerHTML = `<span style="color:#f43f5e;">❌ 連線失敗：${e.message}（請確認網址正確且允許 CORS）</span>`;
    }
  }
};

async function loadStudentRoster() {
  try {
    const res = await fetch('students.json');
    appState.roster = await res.json();
    populateClassSelect();
  } catch (e) {
    console.error("載入 students.json 失敗:", e);
  }
}

function populateClassSelect() {
  const classes = Array.from(new Set(appState.roster.map(s => s.class))).sort();
  dom.loginClassSelect.innerHTML = '<option value="">-- 請選擇班級 --</option>';
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    dom.loginClassSelect.appendChild(opt);
  });
}

function populateAdminClassFilter() {
  const classes = Array.from(new Set(appState.roster.map(s => s.class))).sort();
  const select = document.getElementById('filterClassSelect');
  select.innerHTML = '<option value="ALL">全部 11 個班級</option>';
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function checkSavedSession() {
  const saved = sessionStorage.getItem('CYBERCLOUD_STUDENT');
  if (saved) {
    try {
      appState.currentStudent = JSON.parse(saved);
      appNav.goToHub();
    } catch (e) {}
  }
}

function renderHubUnits() {
  dom.chapter1Grid.innerHTML = '';
  dom.chapter2Grid.innerHTML = '';

  const stuScores = (appState.currentStudent && appState.studentScores[appState.currentStudent.studentId]) 
    ? appState.studentScores[appState.currentStudent.studentId].unitScores 
    : {};

  let completedCount = 0;

  QUEST_LEVELS.forEach((unit, idx) => {
    const score = stuScores[unit.id];
    const isCompleted = score !== undefined;
    if (isCompleted) completedCount++;

    const card = document.createElement('div');
    card.className = `unit-card ${isCompleted ? 'completed' : ''}`;
    card.style.borderTop = `3px solid ${unit.themeColor}`;
    card.onclick = () => appNav.startUnit(idx);

    card.innerHTML = `
      <div>
        <span class="unit-badge-status ${isCompleted ? 'done' : 'todo'}">
          ${isCompleted ? `已通關 ${score}分` : '未作答'}
        </span>
        <div class="card-step-tag" style="color:${unit.themeColor}">${unit.unitCode || `第 ${unit.id} 單元`} // 10 題</div>
        <div class="unit-card-title"><i class="${unit.icon}" style="color:${unit.themeColor}"></i> ${unit.title.split('：')[1] || unit.title}</div>
        <div class="unit-card-desc">${unit.subtitle}</div>
      </div>
      <div class="unit-card-footer">
        <span style="color:#94a3b8;"><i class="fa-solid fa-award"></i> ${unit.badge}</span>
        <button class="unit-start-btn" style="background:${unit.themeColor}; color:#000;">${isCompleted ? '重新挑戰' : '開始挑戰'}</button>
      </div>
    `;

    if (unit.id <= 3) {
      dom.chapter1Grid.appendChild(card);
    } else {
      dom.chapter2Grid.appendChild(card);
    }
  });

  dom.completedUnitsCount.textContent = completedCount;
}

function loadCurrentQuestion() {
  appState.isAnswered = false;
  const currentUnit = QUEST_LEVELS[appState.activeUnitIdx];
  const qData = currentUnit.questions[appState.activeQuestionIdx];

  dom.hintBox.style.display = 'none';
  dom.explanationBox.style.display = 'none';
  dom.submitBtn.style.display = 'inline-flex';
  dom.nextBtn.style.display = 'none';

  dom.levelBadge.innerHTML = `<i class="${currentUnit.icon}"></i> ${currentUnit.title}`;
  dom.questionCounter.textContent = `第 ${appState.activeQuestionIdx + 1} / 10 題`;
  const progressPercent = ((appState.activeQuestionIdx + 1) / 10) * 100;
  dom.progressBarFill.style.width = `${progressPercent}%`;

  dom.storyTitle.innerHTML = `<i class="fa-solid fa-crosshairs" style="color:var(--cyan-glow)"></i> [任務 ${qData.id}] ${qData.title}`;
  dom.storyText.textContent = qData.story;
  dom.instructionText.innerHTML = `<i class="fa-solid fa-circle-question"></i> ${qData.instruction}`;

  dom.questionBodyContainer.innerHTML = '';
  if (qData.type === 'cloze') {
    renderClozeQuestion(qData);
  } else if (qData.type === 'simulation_search') {
    renderSearchSimulationQuestion(qData);
  }

  renderKeyboardAssist(qData);
}

function renderClozeQuestion(qData) {
  const box = document.createElement('div');
  box.className = 'cloze-interactive-box';

  let html = qData.textTemplate;
  qData.inputs.forEach((inputDef) => {
    const inputHtml = `<input type="text" 
      class="cloze-input" 
      id="cloze_${inputDef.key}" 
      data-key="${inputDef.key}" 
      placeholder="${inputDef.placeholder}" 
      autocomplete="off" 
      autocorrect="off" 
      spellcheck="false">`;
    html = html.replace(`{${inputDef.key}}`, inputHtml);
  });

  box.innerHTML = html.replace(/\n/g, '<br>');
  dom.questionBodyContainer.appendChild(box);

  const inputs = box.querySelectorAll('.cloze-input');
  inputs.forEach((inp, idx) => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        } else {
          handleAnswerSubmit();
        }
      }
    });
  });

  if (inputs.length > 0) {
    setTimeout(() => inputs[0].focus(), 150);
  }
}

function renderSearchSimulationQuestion(qData) {
  const simWrapper = document.createElement('div');
  simWrapper.className = 'search-simulator-box';

  simWrapper.innerHTML = `
    <div class="google-bar-header">
      <div class="google-logo-text">
        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
      </div>
      <span class="simulator-tag"><i class="fa-solid fa-terminal"></i> 特工極速搜尋模擬器</span>
    </div>
    <div class="fake-search-input-wrapper">
      <i class="fa-solid fa-magnifying-glass" style="color:#9aa0a6"></i>
      <input type="text" 
        class="fake-search-input" 
        id="simSearchInput" 
        value="${qData.defaultQuery || ''}" 
        placeholder="${qData.placeholder || '輸入精確關鍵字或進階語法...'}"
        autocomplete="off">
      <button class="fake-search-btn" id="simExecuteBtn">
        <i class="fa-solid fa-arrow-right"></i> 執行特工搜尋
      </button>
    </div>
    <div class="simulated-results-box" id="simResultBox" style="display:none;"></div>
  `;

  dom.questionBodyContainer.appendChild(simWrapper);

  const searchInp = simWrapper.querySelector('#simSearchInput');
  const execBtn = simWrapper.querySelector('#simExecuteBtn');

  searchInp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAnswerSubmit();
  });
  execBtn.addEventListener('click', handleAnswerSubmit);

  setTimeout(() => {
    searchInp.focus();
    searchInp.select();
  }, 150);
}

function renderKeyboardAssist(qData) {
  if (appState.activeUnitIdx === 0 && ['Q1-01', 'Q1-02', 'Q1-03', 'Q1-04'].includes(qData.id)) {
    const kbBox = document.createElement('div');
    kbBox.className = 'keyboard-hint-box';
    let keyList = ['Ctrl', 'Shift', 'Alt', 'T', 'D', 'N', '/'];
    let keysHtml = keyList.map(k => `<span class="kb-key" id="kb_key_${k}">${k}</span>`).join(' ');
    kbBox.innerHTML = `<span style="font-size:0.85rem; color:#94a3b8;"><i class="fa-regular fa-keyboard"></i> 鍵盤熱鍵速查板：</span> ${keysHtml}`;
    dom.questionBodyContainer.appendChild(kbBox);
  }
}

function showQuestionHint() {
  const currentUnit = QUEST_LEVELS[appState.activeUnitIdx];
  const qData = currentUnit.questions[appState.activeQuestionIdx];
  let hintText = "";
  if (qData.type === 'cloze') {
    hintText = qData.inputs.map(i => `【${i.placeholder}】${i.hint}`).join('<br>');
  } else if (qData.type === 'simulation_search') {
    hintText = qData.placeholder || "善用空格分隔關鍵字、減號排除、或指定前綴如 filetype: 或 site:";
  }
  dom.hintBox.innerHTML = `<i class="fa-solid fa-lightbulb" style="color:#f59e0b"></i> <div><strong>特工錦囊密技：</strong><br>${hintText}</div>`;
  dom.hintBox.style.display = 'flex';
}

function normalizeString(str) {
  if (!str) return "";
  return str
    .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function handleAnswerSubmit() {
  if (appState.isAnswered) return;
  const currentUnit = QUEST_LEVELS[appState.activeUnitIdx];
  const qData = currentUnit.questions[appState.activeQuestionIdx];

  let isCorrect = true;
  let feedbackMessage = "";

  if (qData.type === 'cloze') {
    qData.inputs.forEach(inputDef => {
      const inputEl = document.getElementById(`cloze_${inputDef.key}`);
      const val = normalizeString(inputEl.value);
      const matched = inputDef.accepted.some(acc => normalizeString(acc).toLowerCase() === val.toLowerCase());
      if (matched) {
        inputEl.classList.remove('wrong');
        inputEl.classList.add('correct');
      } else {
        inputEl.classList.remove('correct');
        inputEl.classList.add('wrong');
        isCorrect = false;
      }
    });
  } else if (qData.type === 'simulation_search') {
    const inputEl = document.getElementById('simSearchInput');
    const query = normalizeString(inputEl.value);
    const crit = qData.targetCriteria;

    if (crit.mustInclude) {
      for (let term of crit.mustInclude) {
        if (!query.toLowerCase().includes(term.toLowerCase())) {
          isCorrect = false;
          feedbackMessage = `缺少核心關鍵字或語法：【${term}】`;
          break;
        }
      }
    }
    if (isCorrect && crit.mustExcludeWithMinus) {
      const expectedExclude = `-${crit.mustExcludeWithMinus}`.toLowerCase();
      if (!query.toLowerCase().includes(expectedExclude)) {
        isCorrect = false;
        feedbackMessage = `必須使用減號緊連排除【-${crit.mustExcludeWithMinus}】喔！`;
      }
    }
    if (isCorrect && crit.mustNotInclude) {
      for (let bad of crit.mustNotInclude) {
        if (query.includes(bad)) {
          isCorrect = false;
          feedbackMessage = `請將多餘冗詞贅字【${bad}】去除，只留下簡潔關鍵字！`;
          break;
        }
      }
    }

    renderSimulatedSearchResult(query, isCorrect);
  }

  if (!appState.questionStats[qData.id]) {
    appState.questionStats[qData.id] = { attempts: 0, correct: 0, passRate: "0%" };
  }
  const qStat = appState.questionStats[qData.id];
  qStat.attempts += 1;
  if (isCorrect) qStat.correct += 1;
  qStat.passRate = ((qStat.correct / qStat.attempts) * 100).toFixed(1) + "%";
  saveLocalStore();

  appState.currentUnitResults.push({ qId: qData.id, correct: isCorrect });

  if (isCorrect) {
    appState.isAnswered = true;
    appState.xp += 100 + appState.combo * 15;
    appState.combo += 1;
    if (appState.combo > appState.maxCombo) appState.maxCombo = appState.combo;
    audio.playCorrect();
    updateStatusDisplays();

    dom.explanationContent.textContent = qData.explanation;
    dom.explanationBox.style.display = 'block';
    dom.submitBtn.style.display = 'none';
    dom.nextBtn.style.display = 'inline-flex';
    dom.nextBtn.focus();
  } else {
    appState.hp = Math.max(0, appState.hp - 10);
    appState.combo = 0;
    audio.playWrong();
    updateStatusDisplays();

    if (feedbackMessage) {
      dom.hintBox.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:#f43f5e"></i> <div><strong>特工回饋指引：</strong> ${feedbackMessage}</div>`;
      dom.hintBox.style.display = 'flex';
    }

    if (appState.hp <= 0) {
      appState.hp = 30;
      updateStatusDisplays();
      alert("⚠️ 特工警報：護盾過低！雲端總部已為您緊急充能 30% 生命值，請繼續勇敢挑戰！");
    }
  }
}

function renderSimulatedSearchResult(query, isCorrect) {
  const resultBox = document.getElementById('simResultBox');
  if (!resultBox) return;
  resultBox.style.display = 'block';
  if (isCorrect) {
    resultBox.innerHTML = `
      <div style="color:var(--emerald-glow); font-size:0.85rem; margin-bottom:0.6rem;">
        <i class="fa-solid fa-circle-check"></i> 特工精準鎖定：找到約 4 筆高度相關之權威資源（已精準過濾雜訊）
      </div>
      <div class="sim-result-item">
        <div class="sim-result-url"><i class="fa-solid fa-globe"></i> https://www.gov.tw / edu.tw / official-data</div>
        <div class="sim-result-title">【官方權威第一手報告】符合指令 "${query}" 之最佳查詢成果</div>
        <div class="sim-result-snippet">根據特工輸入的精確指令與篩選條件，系統已自動剔除農場文與無關資訊...</div>
      </div>
    `;
  } else {
    resultBox.innerHTML = `
      <div style="color:var(--rose-glow); font-size:0.85rem; margin-bottom:0.6rem;">
        <i class="fa-solid fa-triangle-exclamation"></i> 搜尋引擎雜訊警報：搜尋條件仍不夠精準，請檢視上方指引修正！
      </div>
    `;
  }
}

function goToNextQuestion() {
  appState.activeQuestionIdx += 1;
  if (appState.activeQuestionIdx >= 10) {
    finishCurrentUnit();
  } else {
    loadCurrentQuestion();
  }
}

function finishCurrentUnit() {
  audio.playVictory();
  const currentUnit = QUEST_LEVELS[appState.activeUnitIdx];
  const correctCount = appState.currentUnitResults.filter(r => r.correct).length;
  const unitScore = correctCount * 10;
  const timeSpentSeconds = Math.round((Date.now() - appState.unitStartTime) / 1000);

  if (appState.currentStudent) {
    const sid = appState.currentStudent.studentId;
    if (!appState.studentScores[sid]) {
      appState.studentScores[sid] = { unitScores: {} };
    }
    const prevScore = appState.studentScores[sid].unitScores[currentUnit.id] || 0;
    appState.studentScores[sid].unitScores[currentUnit.id] = Math.max(prevScore, unitScore);
    saveLocalStore();

    syncScoreToCloudflare({
      studentId: sid,
      name: appState.currentStudent.name,
      className: appState.currentStudent.class,
      seat: appState.currentStudent.seat,
      unitId: currentUnit.id,
      score: unitScore,
      timeSpent: timeSpentSeconds,
      questionResults: appState.currentUnitResults
    });
  }

  const totalCompleted = Object.keys(appState.studentScores[appState.currentStudent.studentId].unitScores).length;

  dom.gameView.style.display = 'none';
  if (totalCompleted === 8) {
    dom.certView.style.display = 'block';
    renderFinalCertificate();
  } else {
    dom.levelClearModal.style.display = 'block';
    document.getElementById('clearedLevelTitle').textContent = `突破成功！${currentUnit.title.split('：')[1] || currentUnit.title}`;
    document.getElementById('clearedBadgeName').textContent = `🎖️ 獲得單元勳章：【${currentUnit.badge}】・得分：${unitScore} 分`;
    document.getElementById('clearedLevelSummary').textContent = 
      `作答耗時：${timeSpentSeconds} 秒，答對 ${correctCount} / 10 題。作答數據已同步存入後台資料庫，累積經驗值：${appState.xp} XP！`;

    const nextBtn = document.getElementById('nextLevelProceedBtn');
    if (appState.activeUnitIdx < QUEST_LEVELS.length - 1) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.onclick = () => {
        dom.levelClearModal.style.display = 'none';
        appNav.startUnit(appState.activeUnitIdx + 1);
      };
    } else {
      nextBtn.style.display = 'none';
    }
  }
}

function renderFinalCertificate() {
  const canvas = document.getElementById('certCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 800;

  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
  bgGrad.addColorStop(0, '#060a12');
  bgGrad.addColorStop(0.5, '#0b1329');
  bgGrad.addColorStop(1, '#060a12');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 800);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1120, 720);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(55, 55, 1090, 690);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText('CYBER-SECURITY & CLOUD COMPUTING VERIFICATION AUTHORITY // 108 CURRICULUM', 80, 85);
  ctx.textAlign = 'right';
  ctx.fillText(`SERIAL NO: AGY-2026-${Math.floor(100000 + Math.random() * 900000)}`, 1120, 85);

  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Microsoft JhengHei", "PingFang TC", sans-serif';
  const titleGrad = ctx.createLinearGradient(300, 140, 900, 140);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#38bdf8');
  titleGrad.addColorStop(1, '#c084fc');
  ctx.fillStyle = titleGrad;
  ctx.fillText('國中資訊科技 雲端運算與專題神搜特工', 600, 150);

  ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('【 8 大 單 元 全 域 通 關 合 格 證 書 】', 600, 195);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, 215);
  ctx.lineTo(850, 215);
  ctx.stroke();

  ctx.font = '18px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('茲 證 明 雲 端 特 工', 600, 260);

  ctx.font = 'bold 42px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#ffffff';
  const stu = appState.currentStudent || { class: "七年一班", seat: 1, name: "特工" };
  ctx.fillText(`${stu.class} ${stu.seat}號  ${stu.name} (${stu.studentId || ''})`, 600, 315);

  ctx.font = '18px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const lines = [
    '參與本年度國中資訊科技【雲端運算服務與 SDGs 資料與資訊應用專題】實戰闖關，',
    '已完整攻破「雲端架構、精確搜尋、進階語法、心智圖、試算表函數、簡報美學、表單問卷、',
    '資料分析與去識別化」等八大單元共八十道生活情境試煉，成績卓越，具備高度資訊素養！'
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, 600, 380 + i * 36);
  });

  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(200, 525, 800, 95, [12]);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('累積經驗值', 300, 555);
  ctx.fillText('最高連擊數', 500, 555);
  ctx.fillText('單元通關率', 700, 555);
  ctx.fillText('授予特工頭銜', 900, 555);

  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`${appState.xp} XP`, 300, 595);
  ctx.fillText(`${appState.maxCombo} Combo`, 500, 595);
  ctx.fillText('100% (8/8)', 700, 595);

  ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('SS級・專題神搜大宗師', 900, 595);

  drawOfficialSeal(ctx, 980, 680);

  ctx.textAlign = 'left';
  ctx.font = '15px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const today = new Date();
  ctx.fillText(`發證日期：${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`, 100, 715);
  ctx.fillText('核發單位：教育部 108 課綱資訊科技互動教學研發基地', 100, 735);
}

function drawOfficialSeal(ctx, cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText('國中資訊科技', 0, -20);
  ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
  ctx.fillText('檢驗合格', 0, 5);
  ctx.font = '10px monospace';
  ctx.fillText('OFFICIAL SEAL', 0, 26);
  ctx.restore();
}

function updateStatusDisplays() {
  dom.hpDisplay.textContent = `${appState.hp}%`;
  dom.xpDisplay.textContent = `${appState.xp} XP`;
  dom.comboDisplay.textContent = `${appState.combo} Combo`;
}

function loadLocalStore() {
  try {
    const savedScores = localStorage.getItem('CYBERCLOUD_SCORES');
    if (savedScores) appState.studentScores = JSON.parse(savedScores);

    const savedStats = localStorage.getItem('CYBERCLOUD_QSTATS');
    if (savedStats) appState.questionStats = JSON.parse(savedStats);

    const savedLogs = localStorage.getItem('CYBERCLOUD_LOGS');
    if (savedLogs) appState.loginLogs = JSON.parse(savedLogs);
  } catch (e) {}
}

function saveLocalStore() {
  try {
    localStorage.setItem('CYBERCLOUD_SCORES', JSON.stringify(appState.studentScores));
    localStorage.setItem('CYBERCLOUD_QSTATS', JSON.stringify(appState.questionStats));
    localStorage.setItem('CYBERCLOUD_LOGS', JSON.stringify(appState.loginLogs));
  } catch (e) {}
}

async function syncLoginToCloudflare(student) {
  if (!appState.cfWorkerUrl) return;
  try {
    await fetch(`${appState.cfWorkerUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: student.class,
        seat: student.seat,
        name: student.name,
        studentId: student.studentId
      })
    });
  } catch (e) {
    console.warn("Cloudflare login sync skipped:", e.message);
  }
}

async function syncScoreToCloudflare(payload) {
  if (!appState.cfWorkerUrl) return;
  try {
    await fetch(`${appState.cfWorkerUrl}/api/scores/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn("Cloudflare score sync skipped:", e.message);
  }
}

function setupEventListeners() {
  dom.audioToggleBtn.addEventListener('click', () => {
    appState.soundEnabled = !appState.soundEnabled;
    dom.audioToggleBtn.innerHTML = appState.soundEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark"></i>';
    if (appState.soundEnabled) audio.playClick();
  });

  dom.hintBtn.addEventListener('click', () => {
    audio.playClick();
    showQuestionHint();
  });

  dom.submitBtn.addEventListener('click', handleAnswerSubmit);

  dom.nextBtn.addEventListener('click', () => {
    audio.playClick();
    goToNextQuestion();
  });

  document.getElementById('downloadCertBtn').addEventListener('click', () => {
    const canvas = document.getElementById('certCanvas');
    const link = document.createElement('a');
    link.download = `雲端專題神搜特工證書_${appState.currentStudent ? appState.currentStudent.name : '特工'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('printCertBtn').addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', () => {
  appNav.init();
});
