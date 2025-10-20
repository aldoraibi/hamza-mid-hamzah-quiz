// Hamza Quiz — 3 choices, random correct position, 45s round
// Requires global BANK (array of {prompt, correct})
(function(){
  const $ = s => document.querySelector(s);
  const startBtn   = $("#startBtn");
  const restartBtn = $("#restartBtn");
  const homeBtn    = $("#homeBtn");
  const timeEl     = $("#time");
  const scoreEl    = $("#score");
  const promptEl   = $("#prompt");
  const choicesEl  = $("#choices");
  const feedbackEl = $("#feedback");
  const nextBtn    = $("#nextBtn");
  const startView  = $("#startView");
  const quizView   = $("#quizView");
  const doneView   = $("#doneView");

  const STATE = {
    started:false, time:45, score:0, order:[], idx:0, current:null, timer:null
  };

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function uniq(arr){
    const out=[]; const seen=new Set();
    for(const x of arr){ if(!seen.has(x)){ out.push(x); seen.add(x);} }
    return out;
  }

  function makeDistractors(correct){
    // توليد بدائل مبسّطة اعتمادًا على موضع الهمزة
    const pool = new Set();
    const base = correct;
    const repls = [
      [/[أإآ]/g, "ئ"],
      [/[أإآ]/g, "ؤ"],
      [/ؤ/g, "ئ"],
      [/ئ/g, "ؤ"],
      [/ء/g, "أ"],
      /[َُِّْ]/g // remove tashkeel
    ];
    for(const r of repls){
      const v = typeof r === "object" && r.global!==undefined
        ? base.replace(r, (m)=> (r===/[َُِّْ]/g ? "" : "أ"))
        : base.replace(r, "");
    }
    // توليدات أدقّ حسب النوع
    pool.add(base.replace(/[أإآ]/g,"أ"));
    pool.add(base.replace(/[أإآ]/g,"ئ"));
    pool.add(base.replace(/[أإآ]/g,"ؤ"));
    pool.add(base.replace(/ؤ/g,"ئ"));
    pool.add(base.replace(/ئ/g,"ؤ"));
    pool.add(base.replace(/ء/g,"أ"));
    pool.add(base.replace(/[َُِّْ]/g,""));
    // نظّف
    const outs = uniq(Array.from(pool)).filter(x=>x!==base);
    shuffle(outs);
    // ضمن 2 مُلهيين
    while(outs.length<2){ outs.push(base + " "); }
    return outs.slice(0,2);
  }

  function buildQuestion(item){
    const wrongs = makeDistractors(item.correct);
    const choices = [item.correct, ...wrongs];
    shuffle(choices);
    const correctIndex = choices.indexOf(item.correct);
    return { prompt:item.prompt, choices, correctIndex };
  }

  function renderHUD(){
    timeEl.textContent = STATE.time + " ث";
    scoreEl.textContent = STATE.score;
  }

  function show(v){
    startView.classList.add("hidden");
    quizView.classList.add("hidden");
    doneView.classList.add("hidden");
    v.classList.remove("hidden");
  }

  function startGame(){
    STATE.started = true;
    STATE.time = 45;
    STATE.score = 0;
    STATE.order = shuffle([...Array(BANK.length).keys()]);
    STATE.idx = 0;
    nextQuestion(true);
    renderHUD();
    show(quizView);

    clearInterval(STATE.timer);
    STATE.timer = setInterval(()=>{
      if(!STATE.started) return;
      STATE.time--;
      renderHUD();
      if(STATE.time<=0){ finishGame(); }
    },1000);
  }

  function finishGame(){
    STATE.started=false;
    clearInterval(STATE.timer);
    document.getElementById("result").textContent = "نتيجتك: " + STATE.score + " نقطة";
    show(doneView);
  }

  function nextQuestion(first=false){
    if(!first){ STATE.idx = (STATE.idx+1) % STATE.order.length; }
    const item = BANK[STATE.order[STATE.idx]];
    STATE.current = buildQuestion(item);
    renderQuestion();
  }

  function renderQuestion(){
    const q = STATE.current;
    promptEl.textContent = q.prompt;
    choicesEl.innerHTML = "";
    q.choices.forEach((txt,i)=>{
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = txt;
      b.onclick = ()=>onChoice(i);
      choicesEl.appendChild(b);
    });
    feedbackEl.className = "card hidden";
    feedbackEl.textContent = "";
    nextBtn.disabled = true;
  }

  function onChoice(i){
    const ok = (i === STATE.current.correctIndex);
    if(ok){
      STATE.score += 1;
      feedbackEl.className = "card ok";
      feedbackEl.textContent = "أحسنت! ✅";
    }else{
      const corr = STATE.current.choices[STATE.current.correctIndex];
      feedbackEl.className = "card bad";
      feedbackEl.textContent = "إجابة غير صحيحة ❌ — الصحيح: «" + corr + "»";
    }
    renderHUD();
    nextBtn.disabled = false;
  }

  startBtn && (startBtn.onclick = startGame);
  nextBtn && (nextBtn.onclick = ()=>nextQuestion(false));
  restartBtn && (restartBtn.onclick = startGame);
  homeBtn && (homeBtn.onclick = ()=>{ show(startView); });

  console.log("Hamza Quiz web loaded — items:", (typeof BANK!=="undefined")?BANK.length:"NO BANK");
})();