# -*- coding: utf-8 -*-
import sys

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. 在 appState 增加倒數計時器與提示減半欄位
old_appstate = '''  // 測驗關卡中狀態
  activeUnitIdx: 0,
  activeQuestionIdx: 0,
  hp: 100,
  xp: 0,
  combo: 0,
  maxCombo: 0,
  soundEnabled: true,
  isAnswered: false,
  unitStartTime: null,
  currentUnitResults: [], // [{ qId, correct: true/false, score: number }]'''

new_appstate = '''  // 測驗關卡中狀態
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
  usedHintForCurrentQ: false,'''

assert old_appstate in code, "old_appstate not found"
code = code.replace(old_appstate, new_appstate, 1)

# 2. 加入主題切換函式與計時器管理函式
theme_and_timer_code = '''
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
'''

# 插入在 sound class 之前
code = theme_and_timer_code + "\n" + code

# 3. 更新 renderCurrentQuestion：重設提示標記、啟動 30 秒倒數計時、更新分數徽章
old_render_q = '''function renderCurrentQuestion() {
  appState.isAnswered = false;
  const unit = QUEST_DATA.units[appState.activeUnitIdx];
  const q = unit.questions[appState.activeQuestionIdx];
  const totalQ = unit.questions.length;
  const isChallenge = appState.activeQuestionIdx >= 10;

  document.getElementById('currentUnitName').textContent = unit.unitTitle;
  document.getElementById('questionProgressText').textContent = `第 ${appState.activeQuestionIdx + 1} / ${totalQ} 題 ${isChallenge ? '【進階時事挑戰題】' : '【基礎生活核心題】'}`;
  
  const progPct = ((appState.activeQuestionIdx + 1) / totalQ) * 100;
  document.getElementById('progressBarFill').style.width = `${progPct}%`;
  
  document.getElementById('hpDisplay').textContent = appState.hp;
  document.getElementById('xpDisplay').textContent = appState.xp;
  document.getElementById('comboDisplay').textContent = appState.combo;

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
}'''

new_render_q = '''function renderCurrentQuestion() {
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
}'''

assert old_render_q in code, "old_render_q not found"
code = code.replace(old_render_q, new_render_q, 1)

# 4. 更新 renderInteractiveInput 提示按鈕提示得分減半
old_hint_area = '''    const hintBar = document.createElement('div');
    hintBar.className = 'hint-action-bar mt-3';
    hintBar.innerHTML = `
      <button id="btnUseHint" class="hint-btn">💡 呼叫特工錦囊 (查看提示)</button>
      <button id="btnGiveUp" class="give-up-btn hidden" onclick="giveUpCurrentQuestion()">⏭️ 我還是想不出來（查看正確解答並前進下一題）</button>
    `;
    area.appendChild(hintBar);

    document.getElementById('btnUseHint').addEventListener('click', () => {
      showQuestionHint(q.hint);
      document.getElementById('btnGiveUp').classList.remove('hidden');
    });'''

new_hint_area = '''    const isChallenge = appState.activeQuestionIdx >= 10;
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
    });'''

assert old_hint_area in code, "old_hint_area not found"
code = code.replace(old_hint_area, new_hint_area, 1)

# 5. 更新 showQuestionHint
old_show_hint = '''function showQuestionHint(hintText) {
  const hintArea = document.getElementById('hintArea');
  if (!hintArea) return;
  hintArea.innerHTML = `<strong>💡 特工錦囊提示：</strong> ${escapeHtml(hintText)}`;
  hintArea.classList.remove('hidden');
  hintArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}'''

new_show_hint = '''function showQuestionHint(hintText, halfPts) {
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
}'''

assert old_show_hint in code, "old_show_hint not found"
code = code.replace(old_show_hint, new_show_hint, 1)

# 6. 更新 handleAnswerResult
old_handle_res = '''function handleAnswerResult(isCorrect, q, studentInput, btnEl) {
  appState.isAnswered = true;
  const isChallenge = appState.activeQuestionIdx >= 10;
  const points = isChallenge ? 5 : 10;

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
  }'''

new_handle_res = '''function handleAnswerResult(isCorrect, q, studentInput, btnEl) {
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
  }'''

assert old_handle_res in code, "old_handle_res not found"
code = code.replace(old_handle_res, new_handle_res, 1)

# 7. 更新 giveUpCurrentQuestion 停止計時
old_give_up = '''window.giveUpCurrentQuestion = function() {
  if (appState.isAnswered) return;
  appState.isAnswered = true;'''

new_give_up = '''window.giveUpCurrentQuestion = function() {
  if (appState.isAnswered) return;
  stopQuestionTimer();
  appState.isAnswered = true;'''

assert old_give_up in code, "old_give_up not found"
code = code.replace(old_give_up, new_give_up, 1)

# 8. 更新 proceedToNextQuestion 停止計時
old_proceed = '''window.proceedToNextQuestion = function() {
  const unit = QUEST_DATA.units[appState.activeUnitIdx];'''

new_proceed = '''window.proceedToNextQuestion = function() {
  stopQuestionTimer();
  const unit = QUEST_DATA.units[appState.activeUnitIdx];'''

assert old_proceed in code, "old_proceed not found"
code = code.replace(old_proceed, new_proceed, 1)

# 9. 更新 concludeUnitQuest 和 renderResultScreen：60/40 分數與美觀對錯分析圖表
old_conclude = '''  let baseScore = 0;
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
  });'''

new_conclude = '''  let baseScore = 0;
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
  });'''

assert old_conclude in code, "old_conclude not found"
code = code.replace(old_conclude, new_conclude, 1)

old_render_result = '''function renderResultScreen(res) {
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
}'''

new_render_result = '''function renderResultScreen(res) {
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
}'''

assert old_render_result in code, "old_render_result not found"
code = code.replace(old_render_result, new_render_result, 1)

# 初始化載入主題
init_theme_code = '''
// 初始化套用保存的主題風格
const savedAppTheme = localStorage.getItem('cybercloud_theme') || 'cyber';
if (window.changeTheme) window.changeTheme(savedAppTheme);
'''
code = code + "\n" + init_theme_code

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: app.js updated successfully with 30s timer, 60/40 scoring, hint half-points, theme switcher, and result analysis matrix chart!")
