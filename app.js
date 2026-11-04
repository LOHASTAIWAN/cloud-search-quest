// 雲端神搜特工隊 - 核心驅動引擎 app.js

// 遊戲全域狀態
const gameState = {
  agentName: "實習特工",
  schoolClass: "國中資訊班",
  currentLevelIdx: 0,
  currentQuestionIdx: 0,
  hp: 100,
  xp: 0,
  combo: 0,
  maxCombo: 0,
  soundEnabled: true,
  isAnswered: false,
  levelStats: [
    { correct: 0, total: 10 },
    { correct: 0, total: 10 },
    { correct: 0, total: 10 }
  ]
};

// Web Audio API 音效合成器
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
    if (!gameState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // 愉悅的和弦音 (C5 -> E5 -> G5)
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
    if (!gameState.soundEnabled) return;
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
    if (!gameState.soundEnabled) return;
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
    if (!gameState.soundEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
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
  heroView: document.getElementById('heroView'),
  gameView: document.getElementById('gameView'),
  levelClearModal: document.getElementById('levelClearModal'),
  certView: document.getElementById('certView'),
  
  agentNameDisplay: document.getElementById('agentNameDisplay'),
  hpDisplay: document.getElementById('hpDisplay'),
  xpDisplay: document.getElementById('xpDisplay'),
  comboDisplay: document.getElementById('comboDisplay'),
  audioToggleBtn: document.getElementById('audioToggleBtn'),

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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateStatusDisplays();
});

function setupEventListeners() {
  // 音效切換
  dom.audioToggleBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    dom.audioToggleBtn.innerHTML = gameState.soundEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark"></i>';
    if (gameState.soundEnabled) audio.playClick();
  });

  // 開始遊戲按鈕
  document.getElementById('startGameBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('inputAgentName').value.trim();
    const classInput = document.getElementById('inputSchoolClass').value.trim();
    
    if (nameInput) gameState.agentName = nameInput;
    if (classInput) gameState.schoolClass = classInput;

    dom.agentNameDisplay.textContent = gameState.agentName;
    audio.playClick();

    // 切換至遊戲視圖
    dom.heroView.style.display = 'none';
    dom.gameView.style.display = 'block';
    loadCurrentQuestion();
  });

  // 提示按鈕
  dom.hintBtn.addEventListener('click', () => {
    audio.playClick();
    showQuestionHint();
  });

  // 提交按鈕
  dom.submitBtn.addEventListener('click', () => {
    handleAnswerSubmit();
  });

  // 下一題按鈕
  dom.nextBtn.addEventListener('click', () => {
    audio.playClick();
    goToNextQuestion();
  });

  // 關卡過場按鈕
  document.getElementById('nextLevelProceedBtn').addEventListener('click', () => {
    audio.playClick();
    dom.levelClearModal.style.display = 'none';
    dom.gameView.style.display = 'block';
    loadCurrentQuestion();
  });

  // 下載證書
  document.getElementById('downloadCertBtn').addEventListener('click', downloadCertificate);
  // 列印證書
  document.getElementById('printCertBtn').addEventListener('click', () => window.print());
  // 重新測驗
  document.getElementById('restartBtn').addEventListener('click', () => location.reload());
}

// 狀態更新
function updateStatusDisplays() {
  dom.hpDisplay.textContent = `${gameState.hp}%`;
  dom.xpDisplay.textContent = `${gameState.xp} XP`;
  dom.comboDisplay.textContent = `${gameState.combo} Combo`;
}

// 載入當前題目
function loadCurrentQuestion() {
  gameState.isAnswered = false;
  const currentLevel = QUEST_LEVELS[gameState.currentLevelIdx];
  const qData = currentLevel.questions[gameState.currentQuestionIdx];

  // 重置控制項
  dom.hintBox.style.display = 'none';
  dom.explanationBox.style.display = 'none';
  dom.submitBtn.style.display = 'inline-flex';
  dom.nextBtn.style.display = 'none';

  // 標題與進度
  dom.levelBadge.innerHTML = `<i class="${currentLevel.icon}"></i> ${currentLevel.title}`;
  dom.questionCounter.textContent = `第 ${gameState.currentQuestionIdx + 1} / 10 題`;
  const progressPercent = ((gameState.currentQuestionIdx + 1) / 10) * 100;
  dom.progressBarFill.style.width = `${progressPercent}%`;

  // 故事卡
  dom.storyTitle.innerHTML = `<i class="fa-solid fa-crosshairs" style="color:var(--cyan-glow)"></i> [任務 ${qData.id}] ${qData.title}`;
  dom.storyText.textContent = qData.story;
  dom.instructionText.innerHTML = `<i class="fa-solid fa-circle-question"></i> ${qData.instruction}`;

  // 渲染題型
  dom.questionBodyContainer.innerHTML = '';
  if (qData.type === 'cloze') {
    renderClozeQuestion(qData);
  } else if (qData.type === 'simulation_search') {
    renderSearchSimulationQuestion(qData);
  }

  // 檢查是否需快捷鍵模擬提示
  renderKeyboardAssist(qData);
}

// 渲染克漏字填空
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

  // 綁定輸入事件與 Enter 觸發
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

// 渲染模擬 Google 搜尋框
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

// 渲染輔助小鍵盤
function renderKeyboardAssist(qData) {
  const currentLevel = QUEST_LEVELS[gameState.currentLevelIdx];
  if (gameState.currentLevelIdx === 0 && (qData.id === 'Q1-01' || qData.id === 'Q1-02' || qData.id === 'Q1-03' || qData.id === 'Q1-04')) {
    const kbBox = document.createElement('div');
    kbBox.className = 'keyboard-hint-box';
    
    let keyList = ['Ctrl', 'Shift', 'Alt', 'T', 'D', 'N', '/'];
    let keysHtml = keyList.map(k => `<span class="kb-key" id="kb_key_${k}">${k}</span>`).join(' ');
    
    kbBox.innerHTML = `
      <span style="font-size:0.85rem; color:#94a3b8;"><i class="fa-regular fa-keyboard"></i> 鍵盤熱鍵速查板：</span>
      ${keysHtml}
    `;
    dom.questionBodyContainer.appendChild(kbBox);
  }
}

// 顯示提示
function showQuestionHint() {
  const currentLevel = QUEST_LEVELS[gameState.currentLevelIdx];
  const qData = currentLevel.questions[gameState.currentQuestionIdx];

  let hintText = "";
  if (qData.type === 'cloze') {
    hintText = qData.inputs.map(i => `【${i.placeholder}】${i.hint}`).join('<br>');
  } else if (qData.type === 'simulation_search') {
    hintText = qData.placeholder || "善用空格分隔關鍵字、減號排除、或特定指定前綴如 filetype: 或 site:";
  }

  dom.hintBox.innerHTML = `<i class="fa-solid fa-lightbulb" style="color:#f59e0b"></i> <div><strong>特工錦囊密技：</strong><br>${hintText}</div>`;
  dom.hintBox.style.display = 'flex';
}

// 統一字串正規化（全形轉半形、移除首尾多餘空白、小寫化）
function normalizeString(str) {
  if (!str) return "";
  return str
    .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全形轉半形
    .replace(/\u3000/g, ' ') // 全形空格轉半形
    .replace(/[“”]/g, '"')   // 雙引號統一
    .replace(/[‘’]/g, "'")   // 單引號統一
    .trim();
}

// 驗證答案
function handleAnswerSubmit() {
  if (gameState.isAnswered) return;

  const currentLevel = QUEST_LEVELS[gameState.currentLevelIdx];
  const qData = currentLevel.questions[gameState.currentQuestionIdx];

  let isCorrect = true;
  let feedbackMessage = "";

  if (qData.type === 'cloze') {
    // 檢查每個輸入框
    qData.inputs.forEach(inputDef => {
      const inputEl = document.getElementById(`cloze_${inputDef.key}`);
      const val = normalizeString(inputEl.value);
      
      const matched = inputDef.accepted.some(acc => {
        return normalizeString(acc).toLowerCase() === val.toLowerCase();
      });

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

    // 檢查必須包含的詞
    if (crit.mustInclude) {
      for (let term of crit.mustInclude) {
        if (!query.toLowerCase().includes(term.toLowerCase())) {
          isCorrect = false;
          feedbackMessage = `缺少核心關鍵字或語法：【${term}】`;
          break;
        }
      }
    }

    // 檢查必須排除的詞（減號）
    if (isCorrect && crit.mustExcludeWithMinus) {
      const expectedExclude = `-${crit.mustExcludeWithMinus}`.toLowerCase();
      if (!query.toLowerCase().includes(expectedExclude)) {
        isCorrect = false;
        feedbackMessage = `必須使用減號緊連排除【-${crit.mustExcludeWithMinus}】喔！`;
      }
    }

    // 檢查不能包含的贅字
    if (isCorrect && crit.mustNotInclude) {
      for (let bad of crit.mustNotInclude) {
        if (query.includes(bad)) {
          isCorrect = false;
          feedbackMessage = `請將多餘冗詞贅字【${bad}】去除，只留下簡潔關鍵字！`;
          break;
        }
      }
    }

    // 模擬搜尋回傳效果
    renderSimulatedSearchResult(query, isCorrect);
  }

  // 處理答題結果
  if (isCorrect) {
    gameState.isAnswered = true;
    gameState.xp += 100 + gameState.combo * 15;
    gameState.combo += 1;
    if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
    gameState.levelStats[gameState.currentLevelIdx].correct += 1;

    audio.playCorrect();
    updateStatusDisplays();

    // 顯示解析與下一題
    dom.explanationContent.textContent = qData.explanation;
    dom.explanationBox.style.display = 'block';
    dom.submitBtn.style.display = 'none';
    dom.nextBtn.style.display = 'inline-flex';
    dom.nextBtn.focus();
  } else {
    gameState.hp = Math.max(0, gameState.hp - 10);
    gameState.combo = 0;
    audio.playWrong();
    updateStatusDisplays();

    if (feedbackMessage) {
      dom.hintBox.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:#f43f5e"></i> <div><strong>特工回饋指引：</strong> ${feedbackMessage}</div>`;
      dom.hintBox.style.display = 'flex';
    }

    // 生命值過低救援機制
    if (gameState.hp <= 0) {
      gameState.hp = 30; // 救援回充
      updateStatusDisplays();
      alert("⚠️ 特工警報：護盾過低！雲端總部已為您緊急充能 30% 生命值，請繼續勇敢挑戰！");
    }
  }
}

// 模擬搜尋結果渲染
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
        <div class="sim-result-snippet">根據特工輸入的精確指令與篩選條件，系統已自動剔除農場文與無關資訊，呈現最吻合主題的核心資料...</div>
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

// 跳到下一題或結算
function goToNextQuestion() {
  gameState.currentQuestionIdx += 1;

  if (gameState.currentQuestionIdx >= 10) {
    // 當前關卡全數完成
    finishCurrentLevel();
  } else {
    loadCurrentQuestion();
  }
}

// 當前關卡完成處理
function finishCurrentLevel() {
  audio.playVictory();
  const clearedLevel = QUEST_LEVELS[gameState.currentLevelIdx];

  if (gameState.currentLevelIdx < 2) {
    // 進入下一關過場
    dom.gameView.style.display = 'none';
    dom.levelClearModal.style.display = 'block';

    document.getElementById('clearedLevelTitle').textContent = `恭喜突破！${clearedLevel.title}`;
    document.getElementById('clearedBadgeName').textContent = `🎖️ 解鎖特工勳章：【${clearedLevel.badge}】`;
    document.getElementById('clearedLevelSummary').textContent = 
      `本關 10 題已全數攻破！累積獲得經驗值：${gameState.xp} XP，連擊最高紀錄：${gameState.maxCombo} Combo。請準備啟動更高階的特工挑戰！`;

    gameState.currentLevelIdx += 1;
    gameState.currentQuestionIdx = 0;
  } else {
    // 30 題完全通關！進入最終結業證書大廳
    dom.gameView.style.display = 'none';
    dom.levelClearModal.style.display = 'none';
    dom.certView.style.display = 'block';
    renderFinalCertificate();
  }
}

// 最終證書繪製 (Canvas)
function renderFinalCertificate() {
  const canvas = document.getElementById('certCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 1200;
  canvas.height = 800;

  // 背景深色漸層
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
  bgGrad.addColorStop(0, '#060a12');
  bgGrad.addColorStop(0.5, '#0b1329');
  bgGrad.addColorStop(1, '#060a12');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 800);

  // 科技幾何邊框
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1120, 720);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(55, 55, 1090, 690);

  // 四個科技角落裝飾
  drawCornerDecor(ctx, 40, 40, 30);
  drawCornerDecor(ctx, 1160, 40, 30);
  drawCornerDecor(ctx, 40, 760, 30);
  drawCornerDecor(ctx, 1160, 760, 30);

  // 頂端機構代碼
  ctx.font = '14px monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText('CYBER-SECURITY & CLOUD COMPUTING VERIFICATION AUTHORITY // 108 CURRICULUM', 80, 85);
  ctx.textAlign = 'right';
  ctx.fillText(`SERIAL NO: AGY-2026-${Math.floor(100000 + Math.random() * 900000)}`, 1120, 85);

  // 大標題
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Microsoft JhengHei", "PingFang TC", sans-serif';
  const titleGrad = ctx.createLinearGradient(300, 140, 900, 140);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#38bdf8');
  titleGrad.addColorStop(1, '#c084fc');
  ctx.fillStyle = titleGrad;
  ctx.fillText('國中資訊科技 雲端運算與網路神搜特工', 600, 150);

  ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('【 全 域 通 關 合 格 證 書 】', 600, 195);

  // 橫線
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, 215);
  ctx.lineTo(850, 215);
  ctx.stroke();

  // 獲獎人姓名班級
  ctx.font = '18px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('茲 證 明 雲 端 特 工', 600, 260);

  ctx.font = 'bold 42px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${gameState.schoolClass}   ${gameState.agentName}`, 600, 315);

  // 評語內文
  ctx.font = '18px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const lines = [
    '參與本年度國中資訊科技【雲端運算服務與網路資料搜尋技巧】全方格實戰闖關，',
    '已完整通過「基本雲端架構與瀏覽器快捷鍵 (10題)」、「網路資料初階精確搜尋 (10題)」、',
    '以及「進階指令 site/filetype 暨雲端協同資安防護 (10題)」共三十道生活情境試煉，',
    '具備優異之數位科技素養、自主問題解決力與資訊安全防護意識，特頒此證以資表揚！'
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, 600, 380 + i * 36);
  });

  // 成績統計卡
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(200, 535, 800, 95, [12]);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('總累積經驗值', 300, 565);
  ctx.fillText('連續不中斷連擊', 500, 565);
  ctx.fillText('闖關完成率', 700, 565);
  ctx.fillText('授予特工頭銜', 900, 565);

  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`${gameState.xp} XP`, 300, 605);
  ctx.fillText(`${gameState.maxCombo} Combo`, 500, 605);
  ctx.fillText('100% (30/30)', 700, 605);

  ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('S級・神搜大師', 900, 605);

  // 印章印記
  drawOfficialSeal(ctx, 980, 680);

  // 底部頒發日期與簽署
  ctx.textAlign = 'left';
  ctx.font = '15px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const today = new Date();
  const dateStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;
  ctx.fillText(`發證日期：${dateStr}`, 100, 715);
  ctx.fillText('核發單位：教育部 108 課綱資訊科技互動教學研發基地', 100, 735);
}

// 輔助角落幾何繪圖
function drawCornerDecor(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.restore();
}

// 繪製金色官方特工印章
function drawOfficialSeal(ctx, cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15); // 微傾斜更有擬真印章感

  // 外雙圈
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  // 內部文字
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

// 下載證書圖片
function downloadCertificate() {
  const canvas = document.getElementById('certCanvas');
  const link = document.createElement('a');
  link.download = `雲端神搜特工合格證書_${gameState.agentName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
