// نسخة خفيفة وموثوقة: تبدأ الجولة وتعرض سؤالًا وتتعامل مع الأزرار
// ملاحظة: لا اختيار تلقائي لأي عنصر — كل شيء ينتظر تفاعل الطالب

const BANK = [
  { prompt:"يَـأْكُل / يَئْكل", choices:["يَأْكُل","يَئْكل"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"سَأَل / سَئَل", choices:["سَأَل","سَئَل"], correct:0, note:"الفتحة أقوى ⇒ على الألف." },
  { prompt:"مُؤْمِن / مُئْمِن", choices:["مُؤْمِن","مُئْمِن"], correct:0, note:"الضمة ⇒ على الواو." },
  { prompt:"سَئِم / سَأِم", choices:["سَئِم","سَأِم"], correct:0, note:"الكسرة أقوى ⇒ على الياء (ئ)." },
  { prompt:"مِئْذَنة / مِأْذَنة", choices:["مِئْذَنة","مِأْذَنة"], correct:0, note:"قبل الهمزة مكسور ⇒ على الياء (ئ)." },
];

const state = {
  started: false,
  time: 45,
  score: 0,
  idx: 0,
  showFeedback: false,
  lastCorrect: false,
  disabled: false,
  order: shuffle([...BANK.keys()])
};

const $screen = () => document.getElementById("screen");
let timerId = null;

function shuffle(a){
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function render(){
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

  const q = BANK[state.order[state.idx] ?? 0];

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

  const $choices = document.getElementById("choices");
  q.choices.forEach((c, i)=>{
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = c;
    b.disabled = state.disabled;
    b.onclick = ()=> answer(i);
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

function answer(i){
  if(state.disabled) return;
  state.disabled = true;
  const q = BANK[state.order[state.idx] ?? 0];
  state.lastCorrect = (i === q.correct);
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

// ابدأ بالرسم الأولي
document.addEventListener("DOMContentLoaded", render);
