/* Kanwa – Hamzah Quiz (90s, 3 choices, diacritics-insensitive, auto-next on correct) */

/* ===== Utilities ===== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// إزالة الحركات من النص (تطابق دون/مع التشكيل)
function stripDiacritics(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "") // تطويل
    .normalize("NFC");
}

// مقارنة نصين مع/بدون تشكيل
function sameWord(a, b) {
  return stripDiacritics(a) === stripDiacritics(b);
}

// إزالة التكرارات بين الخيارات بناءً على النص بعد إزالة الحركات
function uniqueByNoTashkeel(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = stripDiacritics(x);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(x);
    }
  }
  return out;
}

// خلط مصفوفة
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===== DOM refs (تأكد أن IDs موجودة في index.html) =====
  #startBtn      زر ابدأ الجولة
  #questionTxt   كلمة/جملة السؤال الكبيرة
  #choices       حاوية الأزرار (3 خيارات)
  #nextBtn       زر التالي
  #feedback      صندوق التغذية الراجعة
  #scoreLabel    عرض النقاط
  #timerLabel    عرض الوقت
*/
const startBtn   = $("#startBtn");
const qEl        = $("#questionTxt");
const choicesBox = $("#choices");
const nextBtn    = $("#nextBtn");
const feedbackEl = $("#feedback");
const scoreEl    = $("#scoreLabel");
const timerEl    = $("#timerLabel");

/* ===== Game State ===== */
const ROUND_SECONDS = 90;          // 1.5 دقيقة
const AUTO_NEXT_DELAY_MS = 2000;   // ثانيتان بعد إجابة صحيحة

let questions = [];      // مصفوفة بعد التحويل للبنية الموحدة
let current = 0;         // مؤشر السؤال
let score = 0;
let started = false;
let timerId = null;
let remaining = ROUND_SECONDS;
let locked = false;      // لمنع نقرات إضافية بعد اختيار

/* ===== Adapt incoming BANK into unified shape =====
Unified shape:
{ prompt: string, correct: string, distractors: string[], note?: string }
Supports legacy:
{ q, options[3], answer, note }
*/
function normalizeBank(BANK) {
  const out = [];
  for (const item of BANK) {
    if (item && typeof item === "object") {
      if (item.prompt && item.correct && Array.isArray(item.distractors)) {
        out.push({
          prompt: item.prompt,
          correct: item.correct,
          distractors: item.distractors.slice(0, 10),
          note: item.note || ""
        });
      } else if (item.q && Array.isArray(item.options) && item.options.length >= 2) {
        out.push({
          prompt: item.q,
          correct: item.answer,
          distractors: item.options.filter(o => !sameWord(o, item.answer)),
          note: item.note || ""
        });
      }
    }
  }
  return out;
}

/* ===== Build a 3-choice set with dedup by no-tashkeel ===== */
function buildChoices(entry) {
  // اختَر مشتتين مختلفين عن الصحيح (بعد إزالة الحركات)
  const pool = entry.distractors.slice();
  shuffle(pool);

  // التقط حتى 5 بدائل ثم صفّها لإزالة المتشابه دون تشكيل
  const candidates = uniqueByNoTashkeel([entry.correct, ...pool]).slice(0, 3);

  // لو أقل من 3 (بسبب تطابق بدون تشكيل)، اكمل من بنك آخر:
  if (candidates.length < 3) {
    const others = shuffle(questions
      .filter(q => !sameWord(q.correct, entry.correct))
      .flatMap(q => q.distractors)
    );
    for (const w of others) {
      candidates.push(w);
      if (uniqueByNoTashkeel(candidates).length >= 3) break;
    }
  }

  const final3 = uniqueByNoTashkeel(candidates).slice(0, 3);
  // إن حصل نقص لأي سبب، ضاعِف الصحيح مع أشكال بحركة/بدونها (لضمان 3 أزرار)
  while (final3.length < 3) final3.push(entry.correct);

  // ضع الصحيح في موقع عشوائي
  shuffle(final3);
  return final3;
}

/* ===== Rendering ===== */
function renderHUD() {
  scoreEl && (scoreEl.textContent = String(score));
  timerEl && (timerEl.textContent = `${remaining} ث`);
}

function renderQuestion() {
  const q = questions[current];
  qEl.textContent = q.prompt;

  // خيارات
  const opts = buildChoices(q);
  choicesBox.innerHTML = "";
  opts.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn"; // تأكد أن الـ CSS يكبر الخط
    btn.textContent = opt;
    btn.dataset.correct = sameWord(opt, q.correct) ? "1" : "0";
    btn.onclick = () => onPick(btn);
    choicesBox.appendChild(btn);
  });

  // تغذية راجعة/أزرار
  feedbackEl.className = "feedback hidden";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  locked = false;
}

function onPick(btn) {
  if (locked) return;
  locked = true;

  const isCorrect = btn.dataset.correct === "1";
  const q = questions[current];

  // تلوين الأزرار
  $$(".choice-btn").forEach(b => b.disabled = true);
  if (isCorrect) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    // أظهر الصحيح
    const ok = $$(".choice-btn").find(b => b.dataset.correct === "1");
    ok && ok.classList.add("correct");
  }

  // التغذية الراجعة
  if (isCorrect) {
    score += 1;
    feedbackEl.className = "feedback ok";
    feedbackEl.textContent = q.note ? `ممتاز! ✅ — ${q.note}` : "ممتاز! ✅";
    renderHUD();
    // انتقال تلقائي بعد ثانيتين
    setTimeout(nextQuestion, AUTO_NEXT_DELAY_MS);
  } else {
    feedbackEl.className = "feedback bad";
    feedbackEl.textContent = q.note ? `إجابة غير صحيحة ❌ — الصحيح: «${q.correct}». ${q.note}` : `إجابة غير صحيحة ❌ — الصحيح: «${q.correct}».`;
    nextBtn.disabled = false; // ينتظر “التالي”
  }
}

function nextQuestion() {
  if (!started) return;
  current += 1;
  if (current >= questions.length) {
    // إعادة خلط وجولة جديدة
    current = 0;
    shuffle(questions);
  }
  renderQuestion();
}

function startRound() {
  started = true;
  score = 0;
  current = 0;
  remaining = ROUND_SECONDS;
  renderHUD();
  shuffle(questions);
  renderQuestion();

  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (!started) return;
    remaining -= 1;
    renderHUD();
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      endRound();
    }
  }, 1000);
}

function endRound() {
  started = false;
  // قفل الأزرار وعرض نتيجة بسيطة
  $$(".choice-btn").forEach(b => b.disabled = true);
  feedbackEl.className = "feedback info";
  feedbackEl.textContent = `انتهى الوقت ⏱ — نتيجتك: ${score}`;
  nextBtn.disabled = true;
}

/* ===== Wiring ===== */
startBtn && (startBtn.onclick = () => {
  startBtn.disabled = true;
  startRound();
});

nextBtn && (nextBtn.onclick = () => {
  nextBtn.disabled = true;
  nextQuestion();
});

/* ===== Boot ===== */
(function boot() {
  if (!window.BANK || !Array.isArray(window.BANK) || window.BANK.length === 0) {
    console.error("BANK (bank-200.js) مفقود أو فارغ. تأكد أن bank-200.js مُضمّن قبل app.js");
    return;
  }
  questions = normalizeBank(window.BANK);
  if (questions.length < 3) {
    console.warn("عدد الأسئلة قليل؛ أضف المزيد في bank-200.js");
  }
  renderHUD();
  // واجهة البداية تبقى حتى يضغط “ابدأ الجولة”
})();
