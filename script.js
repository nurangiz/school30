/* ============================================================
   30-MAKTAB — NURAS JS
   Junior dasturchi uchun izohlar bilan yozilgan.
   ============================================================ */

/* ============================================================
   1) MAKTAB MA'LUMOTLARI
   AI shu obyekt ichidagi ma'lumotlarni o'qiydi.
   O'Z MA'LUMOTINGIZNI SHU YERGA QO'SHING.
   ============================================================ */
const SCHOOL_KNOWLEDGE = {
  schoolName: "Xovos tumani 30-maktab",
  region: "Sirdaryo viloyati, Xovos tumani",
  address: "Xovos tumani, Sirdaryo viloyati, O‘zbekiston",
  motto: "Bilim · Tarbiya · Kelajak",
  lessonDuration: "45 daqiqa",
  schoolHours: "08:00 — 17:55",
  shifts: "1-smena va 2-smena",
  about: "Bu bo‘limga 30-maktab tarixi, rahbariyati, yo‘nalishlari, to‘garaklari va boshqa ma’lumotlarni kiriting.",
  contacts: {
    phone: "+998 XX XXX XX XX",
    email: "maktab@example.uz"
  },
  custom: [
    // O'ZINGIZNING SAVOL-JAVOBLARINGIZNI SHU KO'RINISHDA QO'SHING:
    // { q: "Direktor kim?", a: "Direktor: Ism Familiya." },
    // { q: "Maktab qachon tashkil topgan?", a: "..." }
  ]
};

/* ============================================================
   2) AI SOZLAMASI
   DEMO rejimida API kerak emas.
   Haqiqiy AI ulash uchun endpoint va key kiriting.
   Eslatma: frontendga API key yozish xavfsiz emas; haqiqiy
   loyiha uchun backend/proxy ishlating.
   ============================================================ */
const AI_CONFIG = {
  mode: "demo", // "demo" yoki "api"
  endpoint: "", // masalan: https://YOUR-SERVER/v1/chat/completions
  apiKey: "",   // API keyni shu yerga yozish mumkin, lekin productionda tavsiya etilmaydi.
  model: "gpt-4o-mini"
};

/* ============================================================
   3) DARS JADVALI
   Siz bergan vaqtlar asosida tuzildi.
   1-smena: 08:00 dan 12:55 gacha.
   2-smena: 13:00 dan 17:55 gacha.
   3-soatdan keyin 10 daqiqalik katta tanaffus.
   ============================================================ */
const schedule = [
  {type:"lesson", n:1, start:"08:00", end:"08:45", title:"1-dars"},
  {type:"break", start:"08:45", end:"08:50", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:2, start:"08:50", end:"09:35", title:"2-dars"},
  {type:"break", start:"09:35", end:"09:40", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:3, start:"09:40", end:"10:25", title:"3-dars"},
  {type:"break", start:"10:25", end:"10:35", title:"10 daqiqalik katta tanaffus"},
  {type:"lesson", n:4, start:"10:35", end:"11:20", title:"4-dars"},
  {type:"break", start:"11:20", end:"11:25", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:5, start:"11:25", end:"12:10", title:"5-dars"},
  {type:"break", start:"12:10", end:"12:15", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:6, start:"12:15", end:"13:00", title:"6-dars"},

  {type:"break", start:"12:55", end:"13:00", title:"Smenalar oralig‘i"},
  {type:"lesson", n:1, start:"13:00", end:"13:45", title:"2-smena · 1-dars"},
  {type:"break", start:"13:45", end:"13:50", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:2, start:"13:50", end:"14:35", title:"2-smena · 2-dars"},
  {type:"break", start:"14:35", end:"14:40", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:3, start:"14:40", end:"15:25", title:"2-smena · 3-dars"},
  {type:"break", start:"15:25", end:"15:35", title:"10 daqiqalik katta tanaffus"},
  {type:"lesson", n:4, start:"15:35", end:"16:20", title:"2-smena · 4-dars"},
  {type:"break", start:"16:20", end:"16:25", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:5, start:"16:25", end:"17:10", title:"2-smena · 5-dars"},
  {type:"break", start:"17:10", end:"17:15", title:"5 daqiqalik tanaffus"},
  {type:"lesson", n:6, start:"17:15", end:"18:00", title:"2-smena · 6-dars"}
];

/*
  MUHIM:
  Siz bergan "1-smena 12:55 da tugaydi" va "2-smena 13:00–17:55"
  shartlari orasida vaqtlar matematik jihatdan to'liq mos kelmaydi.
  Yuqorida siz aytgan aniq 4-dars va 2-smena 4-dars vaqtlariga
  ustuvorlik berildi. Agar 5/6-dars kerak bo'lmasa, ularni o'chiring.
  Qo'ng'iroq vaqtlarini aynan o'zingiz xohlagandek shu massivdan
  bir daqiqada o'zgartira olasiz.
*/

/* ---------- YORDAMCHI FUNKSIYALAR ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function minutesOf(time) {
  const [h,m] = time.split(":").map(Number);
  return h * 60 + m;
}
function pad(n){ return String(n).padStart(2,"0"); }
function nowMinutes(){
  const d = new Date();
  return d.getHours()*60 + d.getMinutes();
}
function showToast(text){
  const t = $("#toast");
  t.textContent = text;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2600);
}


/* ============================================================
   0) MENU NAVIGATION
   Har bir bo'lim faqat o'z menyusi bosilganda chiqadi.
   Bosh sahifa bosilganda faqat bosh sahifa chiqadi.
   ============================================================ */
const menuSections = ["home","teachers","students","bell","about","ai"];

function showOnlySection(sectionId){
  menuSections.forEach(id=>{
    const section=document.getElementById(id);
    if(section) section.classList.toggle("menu-hidden", id!==sectionId);
  });

  // Bosh sahifa ichidagi quick info ham faqat bosh sahifada ko'rinsin.
  document.querySelectorAll("main > .quick").forEach(el=>{
    el.classList.toggle("menu-hidden", sectionId!=="home");
  });

  document.querySelectorAll(".main-nav a[data-section]").forEach(link=>{
    link.classList.toggle("active-nav", link.dataset.section===sectionId);
  });

  window.scrollTo({top:0, behavior:"smooth"});
}

/* Sahifa ochilganda faqat Bosh sahifa */
document.addEventListener("DOMContentLoaded",()=>{
  showOnlySection("home");
});

$$(".main-nav a[data-section]").forEach(link=>{
  link.addEventListener("click",(e)=>{
    e.preventDefault();
    showOnlySection(link.dataset.section);
    $("#mainNav").classList.remove("open");
  });
});

/* ============================================================
   MODE — Light / Dark
   Tanlangan rejim brauzerda eslab qolinadi.
   ============================================================ */
const savedMode=localStorage.getItem("30maktab_mode");
if(savedMode==="dark") document.body.classList.add("dark-mode");

function updateModeButton(){
  const btn=$("#modeToggle");
  if(!btn) return;
  const dark=document.body.classList.contains("dark-mode");
  btn.textContent=dark?"☀":"☾";
  btn.title=dark?"Kunduzgi rejim":"Tungi rejim";
  btn.setAttribute("aria-label",dark?"Kunduzgi rejimni yoqish":"Tungi rejimni yoqish");
}
updateModeButton();

$("#modeToggle")?.addEventListener("click",()=>{
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "30maktab_mode",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
  updateModeButton();
  showToast(document.body.classList.contains("dark-mode") ? "🌙 Tungi rejim yoqildi" : "☀ Kunduzgi rejim yoqildi");
});

/* ---------- MOBIL MENYU ---------- */
$("#menuToggle")?.addEventListener("click", ()=>{
  $("#mainNav").classList.toggle("open");
});
$$(".main-nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));

/* ---------- SCROLL ANIMATSIYA ---------- */
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add("visible"); });
},{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

window.addEventListener("scroll",()=>{
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#scrollProgress").style.width = `${(scrollY/max)*100}%`;
  $("#toTop").classList.toggle("show", scrollY > 500);
});
$("#toTop").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

/* ---------- JADVALNI CHIZISH ---------- */
function renderSchedule(){
  const box = $("#scheduleList");
  box.innerHTML = schedule.map((item,i)=>`
    <div class="lesson-row ${item.type==="break"?"break":""}" data-index="${i}">
      <span class="num">${item.type==="lesson" ? (item.n || "•") : "☕"}</span>
      <span><b>${item.title}</b><small>${item.type==="break" ? "Tanaffus" : "Dars vaqti"}</small></span>
      <span class="time">${item.start} — ${item.end}</span>
    </div>
  `).join("");
}

/* ---------- REAL-TIME SOAT VA TIMER ---------- */
function updateClock(){
  const d = new Date();
  $("#digitalClock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  $("#dateNow").textContent = d.toLocaleDateString("uz-UZ",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  const now = d.getHours()*60+d.getMinutes()+d.getSeconds()/60;
  let activeIndex = -1;
  let next = null;

  schedule.forEach((x,i)=>{
    const s=minutesOf(x.start), e=minutesOf(x.end);
    if(now>=s && now<e) activeIndex=i;
    if(s>now && !next) next={...x,index:i};
  });

  $$(".lesson-row").forEach((el,i)=>el.classList.toggle("active",i===activeIndex));

  if(activeIndex>=0){
    const a=schedule[activeIndex];
    $("#currentStatus").textContent = a.type==="lesson" ? `📚 ${a.title} davom etmoqda` : `☕ ${a.title}`;
  }else if(next){
    $("#currentStatus").textContent = "⏳ Keyingi mashg‘ulot kutilmoqda";
  }else{
    $("#currentStatus").textContent = "🌙 Bugungi jadval yakunlangan";
  }

  if(next){
    $("#nextBell").textContent = `${next.title} · ${next.start}`;
    const diff=Math.max(0,Math.round((minutesOf(next.start)-now)*60));
    $("#countdown").textContent = `${Math.floor(diff/3600)} soat ${Math.floor(diff%3600/60)} daqiqa ${diff%60} soniya`;
  }else{
    $("#nextBell").textContent="Keyingi kun";
    $("#countdown").textContent="—";
  }
}
renderSchedule();
updateClock();
setInterval(updateClock,1000);

/* ---------- AUDIO ---------- */
let audioEnabled=false;
$("#enableAudio").addEventListener("click",async()=>{
  audioEnabled=true;
  showToast("🔊 Ovozlar yoqildi. Avtomatik signal ishlaydi.");
  const a=$("#bellAudio");
  if(a.src){
    try{ a.currentTime=0; await a.play(); a.pause(); }catch(e){}
  }
});

const playedSignals = {};
function playAudio(id, key){
  if(!audioEnabled) return;
  const audio=$(id);
  if(!audio || !audio.src) return;
  const today=new Date().toISOString().slice(0,10);
  const signalKey=today+"_"+key;
  if(playedSignals[signalKey]) return;
  playedSignals[signalKey]=true;
  audio.currentTime=0;
  audio.play().catch(()=>{});
}

/* Har daqiqada maxsus signal tekshiriladi.
   8:02 uchun morningAudio ishlaydi. */
function checkSpecialSignals(){
  const d=new Date(), h=d.getHours(), m=d.getMinutes();
  if(h===8 && m===2) playAudio("#morningAudio","morning-08-02");
  schedule.forEach((x,i)=>{
    if(m===minutesOf(x.start)%60 && h===Math.floor(minutesOf(x.start)/60)){
      if(x.type==="lesson") playAudio("#bellAudio","lesson-"+i);
      else playAudio("#breakAudio","break-"+i);
    }
  });
}
setInterval(checkSpecialSignals,1000);

/* ---------- AI CHAT ---------- */
$("#aiModeText").textContent = AI_CONFIG.mode==="api" ? "API orqali AI rejimi" : "Mahalliy bilim rejimi";

function normalize(s){
  return s.toLowerCase().replace(/[‘’ʻ`]/g,"'").replace(/[!?.,:;]/g," ").replace(/\s+/g," ").trim();
}

function localAI(question){
  const q=normalize(question);

  // 1) foydalanuvchi qo'shgan custom savol-javoblar
  for(const item of SCHOOL_KNOWLEDGE.custom || []){
    if(normalize(item.q)===q || q.includes(normalize(item.q))) return item.a;
  }

  // 2) maktabga oid asosiy ma'lumotlar
  if(q.includes("maktab") && (q.includes("qayer") || q.includes("manzil") || q.includes("joylash"))){
    return `${SCHOOL_KNOWLEDGE.schoolName} ${SCHOOL_KNOWLEDGE.address}da joylashgan.`;
  }
  if(q.includes("dars") && (q.includes("necha") || q.includes("davom"))){
    return `Dars davomiyligi ${SCHOOL_KNOWLEDGE.lessonDuration}.`;
  }
  if(q.includes("soat") && (q.includes("ish") || q.includes("ta'lim") || q.includes("o'qish"))){
    return `Maktab jadvali: ${SCHOOL_KNOWLEDGE.schoolHours}.`;
  }
  if(q.includes("smena")){
    return `Maktabda ${SCHOOL_KNOWLEDGE.shifts}.`;
  }
  if(q.includes("telefon") || q.includes("aloqa")){
    return `Aloqa telefoni: ${SCHOOL_KNOWLEDGE.contacts.phone}. Email: ${SCHOOL_KNOWLEDGE.contacts.email}.`;
  }
  if(q.includes("o'zbekiston") && q.includes("poytaxt")){
    return "O‘zbekiston poytaxti — Toshkent shahri.";
  }
  if(q.includes("yer") && q.includes("sayyora")){
    return "Yer — Quyosh tizimidagi hayot mavjudligi ma’lum bo‘lgan sayyora.";
  }
  if(q.includes("2+2") || q.includes("2 2")){
    return "2 + 2 = 4.";
  }

  return "Bu savol uchun aniq ma’lumot topilmadi. Maktabga oid javoblarni script.js ichidagi SCHOOL_KNOWLEDGE.custom bo‘limiga qo‘shing. Umumiy savollarga kengroq javob kerak bo‘lsa, AI_CONFIG orqali haqiqiy AI API ulang.";
}

async function apiAI(question){
  const payload={
    model:AI_CONFIG.model,
    messages:[
      {role:"system",content:`Siz NURAS AI, Xovos tumani 30-maktab yordamchisisiz. Maktabga oid savollarda quyidagi ma'lumotlardan foydalaning: ${JSON.stringify(SCHOOL_KNOWLEDGE)}. Umumiy savollarga ham foydali va aniq javob bering. Javobni o'zbek tilida bering.`},
      {role:"user",content:question}
    ]
  };
  const res=await fetch(AI_CONFIG.endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${AI_CONFIG.apiKey}`},
    body:JSON.stringify(payload)
  });
  if(!res.ok) throw new Error("AI API xatosi");
  const data=await res.json();
  return data?.choices?.[0]?.message?.content || "AI javob qaytarmadi.";
}

function addMessage(text,type="bot"){
  const wrap=document.createElement("div");
  wrap.className=`message ${type}`;
  wrap.innerHTML=`<div class="avatar">${type==="bot"?"✦":"U"}</div><div class="bubble"></div>`;
  wrap.querySelector(".bubble").textContent=text;
  $("#chatMessages").appendChild(wrap);
  $("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;
}
async function askAI(q){
  if(!q.trim()) return;
  addMessage(q,"user");
  $("#chatInput").value="";
  addMessage("⏳ Javob tayyorlanmoqda...");
  const last=$("#chatMessages").lastElementChild;
  try{
    const answer=AI_CONFIG.mode==="api" ? await apiAI(q) : localAI(q);
    last.querySelector(".bubble").textContent=answer;
  }catch(e){
    last.querySelector(".bubble").textContent="AI xizmatida xatolik. Hozircha mahalliy rejimdan foydalaning.";
  }
}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();askAI($("#chatInput").value)});
$$(".suggestions button").forEach(b=>b.addEventListener("click",()=>askAI(b.dataset.question)));

/* ---------- 5 YULDUZLI BAHOLASH ---------- */
let selectedStar=0;
const starButtons=$$("#starPicker button");
starButtons.forEach(btn=>{
  btn.addEventListener("mouseenter",()=>{
    const n=+btn.dataset.star;
    starButtons.forEach((b,i)=>b.classList.toggle("active",i<n));
  });
  btn.addEventListener("click",()=>{
    selectedStar=+btn.dataset.star;
    starButtons.forEach((b,i)=>b.classList.toggle("active",i<selectedStar));
  });
});
$("#starPicker").addEventListener("mouseleave",()=>{
  starButtons.forEach((b,i)=>b.classList.toggle("active",i<selectedStar));
});

function loadReviews(){
  const reviews=JSON.parse(localStorage.getItem("30maktab_reviews")||"[]");
  $("#reviewsList").innerHTML=reviews.length ? reviews.map(r=>`
    <article class="review-item">
      <div class="review-top"><b>${escapeHtml(r.name)}</b><span class="review-stars">${"★".repeat(r.star)}${"☆".repeat(5-r.star)}</span></div>
      <p>${escapeHtml(r.text)}</p>
    </article>`).join("") :
    `<div class="review-item"><p>Hozircha fikrlar yo‘q. Birinchi bo‘lib baholang!</p></div>`;
  if(reviews.length){
    const avg=reviews.reduce((s,r)=>s+r.star,0)/reviews.length;
    $("#reviewAverage").textContent=`${avg.toFixed(1)} / 5 · ${reviews.length} ta baho`;
  }else $("#reviewAverage").textContent="Hali baho yo‘q";
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
$("#reviewForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!selectedStar){showToast("⭐ Avval yulduzcha tanlang.");return;}
  const reviews=JSON.parse(localStorage.getItem("30maktab_reviews")||"[]");
  reviews.unshift({
    name:$("#reviewName").value.trim(),
    text:$("#reviewText").value.trim(),
    star:selectedStar,
    date:new Date().toISOString()
  });
  localStorage.setItem("30maktab_reviews",JSON.stringify(reviews.slice(0,100)));
  $("#reviewForm").reset(); selectedStar=0; starButtons.forEach(b=>b.classList.remove("active"));
  loadReviews(); showToast("Fikringiz saqlandi. Rahmat!");
});
loadReviews();

/*
  BAHOLAR HAQIDA:
  Hozircha ular shu brauzerning localStorage'ida saqlanadi.
  Barcha foydalanuvchilarga bir xil ko'rinishi uchun server/Firebase/
  Supabase kabi umumiy baza kerak bo'ladi. Buni keyin ulash mumkin.
*/
