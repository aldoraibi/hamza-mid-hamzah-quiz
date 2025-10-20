/* Hamza Mid Quiz – no auto-select, alternating correct option, no immediate repeats */

/* ملاحظة: أدرجت مجموعة كبيرة من الكلمات (يمكنك زيادتها لاحقًا بسهولة).
   كل عنصر يحوي:
   - prompt: النص المعروض
   - choices: [الصحيح, الخطأ] ← سنبدّل ترتيب العرض آليًا
   - correct: فهرس الصحيح داخل المصفوفة الأصلية (دائمًا 0 هنا)
*/
const BANK = [
  { prompt:"يَأْكُل / يَئْكل", choices:["يَأْكُل","يَئْكل"], correct:0, note:"قبل الهمزة مفتوح ⇒ تُكتب على الألف." },
  { prompt:"سَأَل / سَئَل", choices:["سَأَل","سَئَل"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"رَأْس / رَئْس", choices:["رَأْس","رَئْس"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"مَسْأَلة / مَسْئَلة", choices:["مَسْأَلة","مَسْئَلة"], correct:0, note:"قبلها ساكن والهمزة مفتوحة ⇒ على الألف." },
  { prompt:"يَسْأَل / يَسْئَل", choices:["يَسْأَل","يَسْئَل"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"فَأْر / فَئْر", choices:["فَأْر","فَئْر"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"مَأْكَل / مَئْكَل", choices:["مَأْكَل","مَئْكَل"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"مَأْخَذ / مَئْخَذ", choices:["مَأْخَذ","مَئْخَذ"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"يَأْس / يَئْس", choices:["يَأْس","يَئْس"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },

  { prompt:"مُؤْمِن / مُئْمِن", choices:["مُؤْمِن","مُئْمِن"], correct:0, note:"قبل الهمزة مضموم ⇒ على الواو." },
  { prompt:"مُؤْتَمَر / مُئْتَمَر", choices:["مُؤْتَمَر","مُئْتَمَر"], correct:0, note:"الضمة تناسب الواو." },
  { prompt:"يُؤْثِر / يُئْثِر", choices:["يُؤْثِر","يُئْثِر"], correct:0, note:"الضمة تناسب الواو." },
  { prompt:"يُؤْمِن / يُئْمِن", choices:["يُؤْمِن","يُئْمِن"], correct:0, note:"الضمة تناسب الواو." },
  { prompt:"مُؤْذٍ / مُئْذٍ", choices:["مُؤْذٍ","مُئْذٍ"], correct:0, note:"الضمة تناسب الواو." },
  { prompt:"مُؤَجَّل / مُأَجَّل", choices:["مُؤَجَّل","مُأَجَّل"], correct:0, note:"ما قبلها مضموم ⇒ على الواو." },
  { prompt:"مَسْؤُول / مَسْئُول", choices:["مَسْؤُول","مَسْئُول"], correct:0, note:"الضمة تناسب الواو." },
  { prompt:"سُؤَال / سُئَال", choices:["سُؤَال","سُئَال"], correct:0, note:"ما قبلها مضموم ⇒ على الواو." },
  { prompt:"تَفاؤُل / تَفائِل", choices:["تَفاؤُل","تَفائِل"], correct:0, note:"الضمة أقوى ⇒ على الواو." },

  { prompt:"مِئْذَنة / مِأْذَنة", choices:["مِئْذَنة","مِأْذَنة"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"سَئِم / سَأِم", choices:["سَئِم","سَأِم"], correct:0, note:"الكسرة أقوى ⇒ على الياء (ئ)." },
  { prompt:"فِئَة / فِيَة", choices:["فِئَة","فِيَة"], correct:0, note:"الكسرة أقوى ⇒ على الياء (ئ)." },
  { prompt:"بَائِس / بَأِس", choices:["بَائِس","بَأِس"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"سَائِل / سَأِل", choices:["سَائِل","سَأِل"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"سَائِح / سَأِح", choices:["سَائِح","سَأِح"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"مَرْئِيّ / مَرْأِيّ", choices:["مَرْئِيّ","مَرْأِيّ"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"تَنْشِئَة / تَنْشِأَة", choices:["تَنْشِئَة","تَنْشِأَة"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"بِيئة / بِيأة", choices:["بِيئَة","بِيأَة"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },

  // مزيد من الأمثلة (نستهدف ~60 إدخالًا هنا)
  { prompt:"مُؤْلِم / مُئْلِم", choices:["مُؤْلِم","مُئْلِم"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"مُؤْذي / مُئْذي", choices:["مُؤْذي","مُئْذي"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"يَتَفَأَّل / يَتَفَئَّل", choices:["يَتَفَأَّل","يَتَفَئَّل"], correct:0, note:"الفتحة ⇒ على الألف." },
  { prompt:"مَأْسَاة / مَئْسَاة", choices:["مَأْسَاة","مَئْسَاة"], correct:0, note:"الفتحة ⇒ على الألف." },
  { prompt:"تَفَاؤُل / تَفَائُل", choices:["تَفَاؤُل","تَفَائُل"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"مُؤْتَمَن / مُئْتَمَن", choices:["مُؤْتَمَن","مُئْتَمَن"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"يُؤْمِنون / يُئْمِنون", choices:["يُؤْمِنون","يُئْمِنون"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"رِئَة / رِأَة", choices:["رِئَة","رِأَة"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"هِيئَة / هِيأَة", choices:["هِئَة","هِأَة"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },

  { prompt:"شُؤُون / شُئُون", choices:["شُؤُون","شُئُون"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"مُؤْسَسة / مُأْسَسة", choices:["مُؤْسَسة","مُأْسَسة"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"مَلجَأ / مَلجِئ", choices:["مَلْجَأ","مَلْجِئ"], correct:0, note:"الفتحة ⇒ على الألف." },
  { prompt:"مَأْوى / مَئْوى", choices:["مَأْوَى","مَئْوَى"], correct:0, note:"الفتحة ⇒ على الألف." },
  { prompt:"مَأْمون / مَئْمون", choices:["مَأْمُون","مَئْمُون"], correct:0, note:"الفتحة ⇒ على الألف." },
  { prompt:"قِرَاءة / قِرائَة", choices:["قِرَاءة","قِرائَة"], correct:0, note:"همزة متوسطة بعد فتحة ⇒ على الألف." },
  { prompt:"مَسَاءَلة / مَسَائِلة", choices:["مَسَاءَلة","مَسَائِلة"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"مُتَفَائِل / مُتَفَأِل", choices:["مُتَفَائِل","مُتَفَأِل"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"بَرِيئ / بَرِيأ", choices:["بَرِيء","بَرِيأ"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },
  { prompt:"مُتَبَرِّئ / مُتَبَرِّأ", choices:["مُتَبَرِّئ","مُتَبَرِّأ"], correct:0, note:"قبلها مكسور ⇒ على الياء (ئ)." },

  // يمكنك مواصلة الإضافة متى أردت
];

/* حالة التطبيق */
const state = {
  started: false,
  time: 45,
  score: 0,
  idx: 0,
  showFeedback: false,
  lastCorrect: false,
  disabled: false,
  order: shuffle([...BANK.keys()]) // ترتيب عشوائي بدون تكرار
};

let timerId = null;
const $screen = () => document.getElementById("screen");

/* أدوات مساعدة */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* واجهة */
function render(){
  if(!$screen()) return;

  if(!state.started){
    $screen().innerHTML = `
      <div class="muted" style="margin-bottom:10px;">
        اضغط ابدأ لبدء جولة مدتها 45 ثانية. الإجابة الصحيحة تُكسبك نقطة.
      </div>
      <button id="startBtn" class="btn">ابدأ الجولة</button>
    `;
    document.getElementById("startBtn").onclick = start;
    return;
  }

  if(state.time<=0){
    $screen().innerHTML = `
      <div class="row"><h2 style="margin:0">انتهت الجولة!</h2></div>
      <div class="muted" style="margin:8px 0 14px">نتيجتك: ${state.score} نقطة</div>
      <div class="row" style="gap:8px">
        <button id="restart" class="btn">إعادة الجولة</button>
        <button id="back" class="btn">الرجوع للشاشة الرئيسية</button>
      </div>
    `;
    document.getElementById("restart").onclick = ()=>{ reset(); start(); };
    document.getElementById("back").onclick = ()=>{ reset(); render(); };
    return;
  }

  // إذا انتهينا من كل الأسئلة، نعيد الخلط لتفادي التكرار المتتالي
  if(state.idx >= state.order.length){
    state.order = shuffle([...BANK.keys()]);
    state.idx = 0;
  }

  const q = BANK[state.order[state.idx]];

  // تبديل موضع الإجابة الصحيحة: مرّة في الأول، مرّة في الثاني (حسب رقم السؤال)
  const flip = (state.idx % 2 === 1);
  const shownChoices = flip ? [q.choices[1], q.choices[0]] : [q.choices[0], q.choices[1]];
  const correctShownIndex = flip ? 1 : 0; // الصحيح كما يظهر للمستخدم

  // رسم الشاشة
  $screen().innerHTML = `
    <div class="row">
      <div class="muted">⏱ ${state.time} ث</div>
      <div class="muted">النقاط: ${state.score}</div>
    </div>

    <div style="margin:12px 0 6px" class="muted">اختر الإملاء الصحيح:</div>
    <div style="font-size:26px;font-weight:700; margin-bottom:10px">${q.prompt}</div>

    <div class="choices" id="choices"></div>

    <div id="fb" class="feedback ${state.showFeedback ? (state.lastCorrect?'ok':'bad') : 'muted'}" style="${state.showFeedback?'':'display:none'}">
      ${state.showFeedback ? (state.lastCorrect ? "أحسنت! ✅" : "إجابة غير صحيحة ❌") : ""}
      <div class="muted">${state.showFeedback ? q.note : ""}</div>
    </div>

    <div class="row" style="margin-top:10px">
      <button id="nextBtn" class="btn" ${state.showFeedback?'':'disabled'}>التالي</button>
    </div>
  `;

  // أزرار الخيارات
  const $choices = document.getElementById("choices");
  shownChoices.forEach((text, i)=>{
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = text;
    b.disabled = state.disabled;
    b.onclick = ()=> answer(i === correctShownIndex);
    $choices.appendChild(b);
  });

  document.getElementById("nextBtn").onclick = next;
}

function start(){
  if(state.started) return;
  state.started = true;
  state.time = 45;
  state.score = 0;
  state.idx = 0;
  state.showFeedback = false;
  state.lastCorrect = false;
  state.disabled = false;
  state.order = shuffle([...BANK.keys()]);
  if(timerId) clearInterval(timerId);
  timerId = setInterval(()=>{
    state.time--;
    if(state.time<=0){ clearInterval(timerId); }
    render();
  },1000);
  render();
}

function reset(){
  state.started = false;
  state.time = 45;
  state.score = 0;
  state.idx = 0;
  state.showFeedback = false;
  state.lastCorrect = false;
  state.disabled = false;
  if(timerId) clearInterval(timerId);
  timerId = null;
}

function answer(isCorrect){
  if(state.disabled) return;
  state.disabled = true;

  state.lastCorrect = !!isCorrect;
  if(state.lastCorrect) state.score++;
  state.showFeedback = true;
  render();

  // انتقال تلقائي بعد 1.2 ثانية
  setTimeout(()=> next(), 1200);
}

function next(){
  if(!state.showFeedback) return;
  state.idx++;
  state.showFeedback = false;
  state.disabled = false;
  render();
}

document.addEventListener("DOMContentLoaded", render);
