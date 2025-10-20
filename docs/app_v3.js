
/* Hamza Quiz - Final Version (v3)
   ✅ يقبل الإجابات مع أو بدون حركات
   ⏱ الوقت = 90 ثانية
   🔄 انتقال تلقائي بعد 2 ثانية عند الإجابة الصحيحة
   ❌ عند الخطأ ينتظر الضغط على "التالي"
*/
(function() {
  const $ = s => document.querySelector(s);

  const startBtn = $("#startBtn");
  const restartBtn = $("#restartBtn");
  const homeBtn = $("#homeBtn");
  const timeEl = $("#time");
  const scoreEl = $("#score");
  const promptEl = $("#prompt");
  const choicesEl = $("#choices");
  const feedbackEl = $("#feedback");
  const nextBtn = $("#nextBtn");
  const startView = $("#startView");
  const quizView = $("#quizView");
  const doneView = $("#doneView");

  const STATE = { started: false, time: 90, score: 0, order: [], idx: 0, current: null, timer: null, lock: false };

  function strip(s) {
    return s.normalize("NFD").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
  }
  function equalNoHarakat(a, b) { return strip(a) === strip(b); }
  function shuffle(a) { for (let i=a.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

  function makeDistractors(correct) {
    const forms = [
      correct.replace(/[أإآ]/g,"ئ"),
      correct.replace(/[أإآ]/g,"ؤ"),
      correct.replace(/[أإآ]/g,"أ"),
      correct.replace(/ؤ/g,"ئ"),
      correct.replace(/ئ/g,"ؤ"),
      correct.replace(/ء/g,"أ"),
      correct.replace(/[َُِّْ]/g,"")
    ];
    const uniq = [...new Set(forms.filter(f=>!equalNoHarakat(f, correct)))];
    shuffle(uniq);
    while (uniq.length<2) uniq.push(correct + " ");
    return uniq.slice(0,2);
  }

  function buildQuestion(item) {
    const wrongs = makeDistractors(item.correct);
    const all = [item.correct, ...wrongs];
    shuffle(all);
    return { prompt: item.prompt, choices: all, correctIndex: all.findIndex(x => equalNoHarakat(x,item.correct)) };
  }

  function show(v){
    [startView,quizView,doneView].forEach(e=>e.classList.add("hidden"));
    v.classList.remove("hidden");
  }
  function renderHUD(){
    timeEl.textContent = STATE.time + " ث";
    scoreEl.textContent = STATE.score;
  }
  function startGame(){
    STATE.started=true; STATE.time=90; STATE.score=0; STATE.idx=0;
    STATE.order=shuffle([...Array(BANK.length).keys()]);
    nextQuestion(true); renderHUD(); show(quizView);
    clearInterval(STATE.timer);
    STATE.timer=setInterval(()=>{ if(!STATE.started)return; STATE.time--; renderHUD(); if(STATE.time<=0) finishGame(); },1000);
  }
  function finishGame(){
    STATE.started=false; clearInterval(STATE.timer);
    document.getElementById("result").textContent = "نتيجتك: " + STATE.score + " نقطة";
    show(doneView);
  }
  function nextQuestion(first=false){
    if(!first) STATE.idx=(STATE.idx+1)%STATE.order.length;
    const item=BANK[STATE.order[STATE.idx]];
    STATE.current=buildQuestion(item);
    renderQuestion();
  }
  function renderQuestion(){
    const q=STATE.current;
    promptEl.textContent=q.prompt;
    choicesEl.innerHTML="";
    feedbackEl.className="card hidden";
    feedbackEl.textContent="";
    nextBtn.disabled=true; STATE.lock=false;
    q.choices.forEach((txt,i)=>{
      const b=document.createElement("button");
      b.className="choice";
      b.textContent=txt;
      b.onclick=()=>answer(i);
      choicesEl.appendChild(b);
    });
  }
  function answer(i){
    if(STATE.lock) return;
    STATE.lock=true;
    const q=STATE.current;
    const ok = equalNoHarakat(q.choices[i], q.choices[q.correctIndex]);
    if(ok){
      STATE.score++;
      feedbackEl.className="card ok";
      feedbackEl.textContent="ممتاز ✅ — أحسنت الاختيار الصحيح!";
      nextBtn.disabled=true;
      setTimeout(()=>nextQuestion(),2000);
    }else{
      feedbackEl.className="card bad";
      feedbackEl.textContent="إجابة غير صحيحة ❌ — الصحيح: «"+q.choices[q.correctIndex]+"»";
      nextBtn.disabled=false;
    }
    renderHUD();
  }
  startBtn.onclick=startGame;
  nextBtn.onclick=()=>nextQuestion(false);
  restartBtn.onclick=startGame;
  homeBtn.onclick=()=>show(startView);
  console.log("app.js loaded (v3)");
})();
