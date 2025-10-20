/* Hamzah Quiz – Web
 * يعمل مع index.html الذي يحتوي عناصر IDs:
 * startBtn, nextBtn, restartBtn, homeBtn, prompt, choices, feedback, score, timerLabel
 * ويحمّل بنك الكلمات من bank-200.js في متغيّر عالمي اسمه BANK (مصوفة أسئلة)
 */

(() => {
  "use strict";

  // ===== ضبط الجولة =====
  const ROUND_SECONDS = 90;            // ⬅️ مؤقّت الجولة 90 ثانية
  const FEEDBACK_OK_MS = 2000;         // زمن إظهار “ممتاز” قبل الانتقال التلقائي (2 ثانية)
  const SHUFFLE_CHOICES = true;        // خلط ترتيب الخيارات كل مرة

  // ===== حالة التشغيل =====
  const state = {
    started: false,
    timeLeft: ROUND_SECONDS,
    score: 0,
    qIndex: 0,
    lockChoices: false,
    lastWasCorrect: null,
    timerId: null,
    questions: []
  };

  // ===== مراجع DOM (تُملأ في init) =====
  const el = {
    startBtn: null,
    nextBtn: null,
    restartBtn: null,
    homeBtn: null,
    prompt: null,
    choices: null,
    feedback: null,
    score: null,
    timerLabel: null
  };

  // ===== أدوات عامّة =====
  const logWarn = (msg) => console.warn(`[HamzahQuiz] ${msg}`);
  const byId = (id) => document.getElementById(id);

  const stripDia = (s) =>
    s.normalize("NFD").replace(/[\u064B-\u065F\u0670\u0640]/g, "");

  const randInt = (n) => Math.floor(Math.random() * n);

  const shuffled = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // يصنع 3 خيارات عشوائية دون تكرار نفس الرسم
  function buildChoices(question, bank) {
    const correct = question.correct;       // النص الصحيح (قد يكون منقوط/مشكول)
    const stem = stripDia(correct);         // الرسم بلا حركات
    const set = new Set();
    set.add(correct);
    set.add(stem);

    // نختار مُلهيات من بنك آخر لا يساوي الرسم الصحيح بلا حركات
    const pool = shuffled(bank)
      .map(q => q.correct)
      .filter(w => stripDia(w) !== stem);

    for (const w of pool) {
      set.add(w);
      if (set.size >= 3) break;
    }

    // لو ما كفّى، نضع بدائل آمنة
    while (set.size < 3) set.add(correct);

    let options = Array.from(set).slice(0, 3);

    // ضمان وجود إجابة صحيحة مطابقة: إمّا الشكل المشكول أو المجرد
    // ونعتبر كلاهما صحيحين عند التصحيح (نقارن بدون حركات).
    if (SHUFFLE_CHOICES) options = shuffled(options);
    return options;
  }

  function formatTimer(sec) {
    return `${sec} ث`;
  }

  // ===== عرض الواجهة =====
  function renderHeader() {
    if (el.score) el.score.textContent = `${state.score}`;
    if (el.timerLabel) el.timerLabel.textContent = formatTimer(state.timeLeft);
  }

  function currentQuestion() {
    if (state.qIndex >= state.questions.length) {
      // إعادة خلط إذا انتهت الأسئلة
      state.questions = shuffled(state.questions);
      state.qIndex = 0;
    }
    return state.questions[state.qIndex];
  }

  function renderQuestion() {
    const q = currentQuestion();
    if (!q) return;

    // نص السؤال
    if (el.prompt) {
      el.prompt.textContent = q.prompt;
      el.prompt.setAttribute(
        "style",
        "font-size:clamp(28px,4vw,40px); font-weight:800; text-align:center; margin:8px 0 12px;"
      );
    }

    // خيارات
    if (el.choices) {
      el.choices.innerHTML = "";
      const opts = buildChoices(q, state.questions);

      opts.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn choice";
        btn.setAttribute(
          "style",
          "width:100%; text-align:right; font-size:clamp(20px,2.8vw,26px); padding:14px 16px; border-radius:14px; margin:8px 0; background:var(--card,#eef1f5); border:1px solid #d7dde6;"
        );
        btn.textContent = opt;
        btn.addEventListener("click", () => onAnswer(opt));
        el.choices.appendChild(btn);
      });
    }

    // إخفاء التغذية الراجعة
    if (el.feedback) {
      el.feedback.className = "card hidden";
      el.feedback.textContent = "";
    }

    // زر التالي يُفعّل عند الخطأ فقط
    if (el.nextBtn) {
      el.nextBtn.classList.add("disabled");
      el.nextBtn.disabled = true;
    }

    state.lockChoices = false;
  }

  function setFeedback(ok, msg) {
    if (!el.feedback) return;
    el.feedback.className = `card ${ok ? "ok" : "bad"}`;
    el.feedback.textContent = msg || (ok ? "أحسنت!" : "إجابة غير صحيحة");
  }

  // ===== منطق الإجابة =====
  function onAnswer(chosenText) {
    if (state.lockChoices) return;
    state.lockChoices = true;

    const q = currentQuestion();
    const chosenBare = stripDia(chosenText);
    const correctBare = stripDia(q.correct);

    const isCorrect = chosenBare === correctBare;
    state.lastWasCorrect = isCorrect;

    if (isCorrect) {
      state.score += 1;
      renderHeader();
      setFeedback(true, `ممتاز! «${q.correct}» هي الكتابة الصحيحة. ${q.note || ""}`.trim());
      // انتقال تلقائي بعد ثانيتين
      setTimeout(() => {
        gotoNext();
      }, FEEDBACK_OK_MS);
    } else {
      setFeedback(false, `إجابة غير صحيحة — ❌ الصحيح: «${q.correct}». ${q.note || ""}`.trim());
      // السماح بالنقر على “التالي”
      if (el.nextBtn) {
        el.nextBtn.classList.remove("disabled");
        el.nextBtn.disabled = false;
      }
    }
  }

  function gotoNext() {
    state.qIndex += 1;
    renderQuestion();
  }

  // ===== تشغيل/إيقاف الجولة =====
  function startRound() {
    state.started = true;
    state.timeLeft = ROUND_SECONDS;
    state.score = 0;
    state.qIndex = 0;
    state.lockChoices = false;
    renderHeader();
    renderQuestion();

    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      if (el.timerLabel) el.timerLabel.textContent = formatTimer(state.timeLeft);
      if (state.timeLeft <= 0) {
        clearInterval(state.timerId);
        finishRound();
      }
    }, 1000);
  }

  function finishRound() {
    state.started = false;
    // يمكن هنا إظهار شاشة النتيجة إن وُجدت عناصرها
    setFeedback(false, `انتهت الجولة! نتيجتك: ${state.score}`);
    if (el.nextBtn) {
      el.nextBtn.classList.add("disabled");
      el.nextBtn.disabled = true;
    }
  }

  function resetToHome() {
    clearInterval(state.timerId);
    state.started = false;
    state.timeLeft = ROUND_SECONDS;
    state.score = 0;
    state.qIndex = 0;
    state.lockChoices = false;
    renderHeader();
    if (el.prompt) el.prompt.textContent = "";
    if (el.choices) el.choices.innerHTML = "";
    if (el.feedback) {
      el.feedback.className = "card hidden";
      el.feedback.textContent = "";
    }
  }

  // ===== التهيئة =====
  function initElements() {
    el.startBtn    = byId("startBtn");
    el.nextBtn     = byId("nextBtn");
    el.restartBtn  = byId("restartBtn");
    el.homeBtn     = byId("homeBtn");
    el.prompt      = byId("prompt");
    el.choices     = byId("choices");
    el.feedback    = byId("feedback");
    el.score       = byId("score");
    el.timerLabel  = byId("timerLabel");

    // تحذيرات مفيدة لو كان عنصر ناقص
    Object.entries(el).forEach(([k, v]) => {
      if (!v) logWarn(`العنصر المفقود في الصفحة: #${k}`);
    });
  }

  function wireEvents() {
    if (el.startBtn)   el.startBtn.addEventListener("click", startRound);
    if (el.nextBtn)    el.nextBtn.addEventListener("click", gotoNext);
    if (el.restartBtn) el.restartBtn.addEventListener("click", () => { resetToHome(); startRound(); });
    if (el.homeBtn)    el.homeBtn.addEventListener("click", resetToHome);
  }

  function loadBank() {
    // نتوقع BANK = [{ prompt, correct, note, type }, ...]
    if (!Array.isArray(window.BANK) || window.BANK.length === 0) {
      logWarn("BANK غير موجود أو فارغ. تأكد من bank-200.js.");
      state.questions = [];
      return;
    }
    state.questions = shuffled(window.BANK);
  }

  function init() {
    initElements();
    loadBank();
    wireEvents();
    // تأكيد الوقت في الواجهة
    renderHeader();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
