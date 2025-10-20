/* =========================
   Hamza Quiz - Web (v2)
   - accepts answers with/without diacritics
   - 3 options, unique by normalized form
   - 90s round
   - auto-advance in 2s on correct with short reason
========================= */

/* -------- إعدادات عامة -------- */
const ROUND_SECONDS = 90;       // مدة الجولة
const AUTO_NEXT_MS  = 2000;     // زمن الرسالة عند الإجابة الصحيحة قبل الانتقال

/* عناصر الواجهة */
const $ = (s) => document.querySelector(s);
const titleEl     = $("#title");
const promptEl    = $("#prompt");
const optionsEl   = $("#options");
const feedbackEl  = $("#feedback");
const nextBtn     = $("#nextBtn");
const timerEl     = $("#timer");
const scoreEl     = $("#score");
const startBtn    = $("#startBtn");
const cardEl      = $("#card");

/* بنك الأسئلة (يُحمَّل من bank-200.js) */
if (!window.BANK || !Array.isArray(window.BANK) || window.BANK.length === 0) {
  console.error("BANK is missing. Make sure bank-200.js is loaded before app.js");
}

/* -------- util: إزالة الحركات/التشكيل من العربية --------
   يزيل التنوين، الفتحة، الضمة، الكسرة، السكون، الشدة … إلخ
----------------------------------------------------------- */
function stripDiacritics(s) {
  if (!s) return s;
  // نُطبع إلى NFKD ثم نحذف المدود والعلامات المركبة
  const withoutCombining = s.normalize("NFKD").replace(/\p{M}/gu, "");
  // نحذف باقي حروف التشكيل العربية الشائعة إن وُجدت
  return withoutCombining.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

/* مقارنة بلا حركات */
function equalNoHarakat(a, b) {
  return stripDiacritics(a) === stripDiacritics(b);
}

/* اختيار عشوائي */
function rand(n) { return Math.floor(Math.random() * n); }

/* خلط مصفوفة */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* حالة اللعبة */
let started      = false;
let secondsLeft  = ROUND_SECONDS;
let score        = 0;
let order        = [];    // ترتيب الأسئلة
let qIndex       = 0;
let lockOptions  = false;
let timerHandle  = null;
let autoNextT    = null;

/* إنشاء 3 خيارات فريدة (بعد إزالة الحركات) */
function makeThreeOptionsFor(item) {
  // item = { prompt, correct, wrongs: [..], reason? }
  const correct = item.correct;
  const bag = new Map(); // key: normalized string => actual string

  const pushIfNew = (opt) => {
    const key = stripDiacritics(opt);
    if (!bag.has(key)) bag.set(key, opt);
  };

  // أضف الصحيح
  pushIfNew(correct);

  // امزج الخاطئة وحاول نأخذ منها ما يكفي
  const wrongsShuffled = shuffle(item.wrongs || []);
  for (const w of wrongsShuffled) {
    if (bag.size >= 3) break;
    pushIfNew(w);
  }

  // إذا ما كفّت الخاطئة (نادرًا)، نضيف متغيرات بدون حركات/بحركات لتعبئة
  while (bag.size < 3) {
    // نحاول توليد شكل مختلف قليلًا بإزالة الحركات أو إضافة حركة خفيفة لنفس الصحيح
    const key = stripDiacritics(correct);
    const variant = bag.has(key) ? correct.replace(/[\u064B-\u065F]/g, "") : correct;
    pushIfNew(variant);
    if (bag.size >= 3) break;
    // كـ fallback: نضيف أي كلمة وهمية لنصل 3 (لن يصل غالبًا)
    pushIfNew(correct + " ");
  }

  // أعد كمصفوفة بعد خلط
  return shuffle([...bag.values()]);
}

/* تحميل واستعداد الجولة */
function resetGame() {
  started     = false;
  secondsLeft = ROUND_SECONDS;
  score       = 0;
  qIndex      = 0;
  lockOptions = false;
  clearInterval(timerHandle);
  clearTimeout(autoNextT);
  order = shuffle([...Array(BANK.length).keys()]);
  updateHeader();
  renderWelcome();
}

function startGame() {
  started     = true;
  secondsLeft = ROUND_SECONDS;
  score       = 0;
  qIndex      = 0;
  lockOptions = false;
  updateHeader();
  renderQuestion();
  timerHandle = setInterval(tick, 1000);
}

function tick() {
  if (!started) return;
  if (secondsLeft > 0) {
    secondsLeft--;
    updateHeader();
  } else {
    // انتهى الوقت
    clearInterval(timerHandle);
    renderResult();
  }
}

function updateHeader() {
  timerEl.textContent = `${secondsLeft} ث`;
  scoreEl.textContent = `النقاط: ${score}`;
}

/* جلب السؤال الحالي */
function currentItem() {
  const idx = order[qIndex] ?? 0;
  return BANK[idx];
}

/* الواجهة: شاشة البداية */
function renderWelcome() {
  titleEl.textContent = "مسابقة الهمزة المتوسطة والمتطرفة";
  promptEl.innerHTML = `
    <div class="lead">اضغط ابدأ لبدء جولة مدتها ${ROUND_SECONDS} ثانية. لكل سؤال ٣ خيارات.</div>
  `;
  optionsEl.innerHTML = "";
  feedbackEl.className = "feedback hidden";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  startBtn.classList.remove("hidden");
}

/* الواجهة: سؤال */
function renderQuestion() {
  const item = currentItem();
  titleEl.textContent = "مسابقة الهمزة المتوسطة والمتطرفة";
  promptEl.innerHTML = `<div class="bigword">${item.prompt}</div>`;

  const opts = makeThreeOptionsFor(item);
  optionsEl.innerHTML = "";
  feedbackEl.className = "feedback hidden";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  startBtn.classList.add("hidden");
  lockOptions = false;

  opts.forEach((optText, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerHTML = `<span class="option-text">${optText}</span>`;
    btn.onclick = () => handleAnswer(optText, item);
    optionsEl.appendChild(btn);
  });
}

/* التعامل مع النقر على خيار */
function handleAnswer(chosenText, item) {
  if (lockOptions) return;
  lockOptions = true;

  const isCorrect = equalNoHarakat(chosenText, item.correct);
  // لو عندك سبب في البنك (item.reason) نعرضه؛ وإلا سبب عام بسيط
  const reason = item.reason || "تُكتب الهمزة حسب حركة الهمزة وما قبلها.";

  // تلوين الأزرار
  [...optionsEl.querySelectorAll(".option")].forEach((btn) => {
    const txt = btn.textContent.trim();
    const ok  = equalNoHarakat(txt, item.correct);
    btn.classList.add(ok ? "right" : "wrong");
  });

  if (isCorrect) {
    score += 1;
    updateHeader();
    feedbackEl.className = "feedback ok";
    feedbackEl.textContent = `ممتاز ✅ — ${reason}`;
    nextBtn.disabled = true;

    // انتقال تلقائي بعد ثانيتين
    clearTimeout(autoNextT);
    autoNextT = setTimeout(() => {
      gotoNext();
    }, AUTO_NEXT_MS);
  } else {
    feedbackEl.className = "feedback bad";
    feedbackEl.textContent = `إجابة غير صحيحة ❌ — الصحيح: «${item.correct}»`;
    // لو خاطئة: الطالب يضغط "التالي"
    nextBtn.disabled = false;
  }
}

/* التالي */
function gotoNext() {
  if (qIndex < order.length - 1) {
    qIndex += 1;
    renderQuestion();
  } else {
    renderResult();
  }
}

/* النتيجة */
function renderResult() {
  started = false;
  clearInterval(timerHandle);
  clearTimeout(autoNextT);
  titleEl.textContent = "انتهت الجولة!";
  promptEl.innerHTML = `<div class="lead">نتيجتك: ${score} من ${order.length}</div>`;
  optionsEl.innerHTML = "";
  nextBtn.disabled = true;
  feedbackEl.className = "feedback hidden";
  startBtn.classList.remove("hidden");
}

/* ربط الأزرار العامة */
nextBtn.addEventListener("click", () => {
  if (!started) return;
  gotoNext();
});
startBtn.addEventListener("click", () => {
  startGame();
});

/* بداية */
resetGame();
