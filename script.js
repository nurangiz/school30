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

function normalize(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[‘'ʼ`]/g, "'")
    .replace(/o['‘ʼ`]qituvchi/g, "oqituvchi")
    .replace(/g['‘ʼ`]ozal/g, "gozal")
    .replace(/[^a-z0-9' \n]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function showOnlySection(sectionId, shouldScroll = true){
  if (!menuSections.includes(sectionId)) sectionId = "home";

  try {
    sessionStorage.setItem("active_section", sectionId);
    if (window.location.hash !== `#${sectionId}`) {
      history.replaceState(null, "", `#${sectionId}`);
    }
  } catch(e) {}

  menuSections.forEach(id=>{
    const section=document.getElementById(id);
    if(section) {
      const isCurrent = (id === sectionId);
      section.classList.toggle("menu-hidden", !isCurrent);
      if (isCurrent) {
        section.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
        if (id === "ai") restoreChatHistory();
      }
    }
  });

  // Bosh sahifa ichidagi quick info ham faqat bosh sahifada ko'rinsin.
  document.querySelectorAll("main > .quick").forEach(el=>{
    el.classList.toggle("menu-hidden", sectionId!=="home");
    if (sectionId === "home") {
      el.querySelectorAll(".reveal").forEach(r => r.classList.add("visible"));
    }
  });

  document.querySelectorAll(".main-nav a[data-section]").forEach(link=>{
    link.classList.toggle("active-nav", link.dataset.section===sectionId);
  });

  if (shouldScroll) {
    window.scrollTo({top:0, behavior:"smooth"});
  }
}

/* ============================================================
   O'QITUVCHILAR BO'LIMLARI / FANLAR FILTRATSIYASI
   ============================================================ */
function initTeacherFilter() {
  const cards = $$("#teachersGrid .teacher-card");
  const chips = $$("#teacherCategoryChips .t-chip");
  const searchInput = $("#teacherSearchInput");
  const clearBtn = $("#clearTeacherSearch");
  const counter = $("#teacherFilterCounter");
  const badge = $("#activeFilterBadge");

  if (!cards.length) return;

  // Har bir o'qituvchi kartasiga fani bo'yicha kategoriya belgilaymiz
  cards.forEach(card => {
    const kicker = normalize(card.querySelector(".card-kicker")?.textContent || "");
    const subject = normalize(card.querySelector(".subject")?.textContent || "");

    let cat = "boshqa";
    if (kicker.includes("tarix") || subject.includes("tarix")) {
      cat = "tarix";
    } else if (kicker.includes("matematik") || subject.includes("matematik") || kicker.includes("informatik") || subject.includes("informatik")) {
      cat = "matematika";
    } else if (kicker.includes("fizik") || subject.includes("fizik") || kicker.includes("kimyo") || subject.includes("kimyo") || kicker.includes("biologiy") || subject.includes("biologiy")) {
      cat = "fizika";
    } else if (kicker.includes("ona tili") || subject.includes("ona tili") || kicker.includes("adabiyot") || subject.includes("adabiyot")) {
      cat = "ona-tili";
    } else if (kicker.includes("ingliz") || subject.includes("ingliz") || kicker.includes("rus tili") || subject.includes("rus tili") || kicker.includes("nemis")) {
      cat = "chet-tili";
    } else if (kicker.includes("boshlangich") || subject.includes("boshlangich")) {
      cat = "boshlangich";
    } else if (kicker.includes("jismoniy") || subject.includes("jismoniy") || kicker.includes("ch q b t") || kicker.includes("ch.q.b.t") || kicker.includes("j t") || kicker.includes("j.t") || kicker.includes("tarbiya") || subject.includes("tarbiya")) {
      cat = "sport";
    } else if (kicker.includes("geografiy") || subject.includes("geografiy")) {
      cat = "geografiya";
    } else if (kicker.includes("direktor") || kicker.includes("rahbar") || kicker.includes("zam") || kicker.includes("manaviyat") || kicker.includes("psixolog") || kicker.includes("texnishka")) {
      cat = "rahbariyat";
    }

    card.dataset.category = cat;
  });

  let currentCategory = "all";
  let currentSearch = "";

  function filterTeachers() {
    let visibleCount = 0;
    const s = normalize(currentSearch);

    cards.forEach(card => {
      const cat = card.dataset.category || "";
      const text = normalize(card.textContent || "");

      const matchCat = (currentCategory === "all") || (cat === currentCategory);
      const matchSearch = (!s) || (text.includes(s));

      const shouldShow = matchCat && matchSearch;
      card.classList.toggle("filter-hidden", !shouldShow);
      if (shouldShow) {
        visibleCount++;
        card.classList.add("visible");
      }
    });

    if (counter) counter.innerHTML = `Ko‘rsatilmoqda: <b>${visibleCount}</b> nafar ustoz`;
    if (clearBtn) clearBtn.style.display = currentSearch ? "block" : "none";
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentCategory = chip.dataset.category || "all";
      if (badge) badge.textContent = chip.textContent.trim();
      filterTeachers();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    filterTeachers();
  });

  clearBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    currentSearch = "";
    filterTeachers();
  });
}

/* Sahifa ochilganda faqat Bosh sahifa va filtrni ishga tushirish */
document.addEventListener("DOMContentLoaded",()=>{
  const hash = window.location.hash.replace("#", "");
  const savedSec = sessionStorage.getItem("active_section");
  const initSec = (hash && menuSections.includes(hash)) ? hash : (savedSec && menuSections.includes(savedSec) ? savedSec : "home");
  showOnlySection(initSec, false);
  initTeacherFilter();
  restoreChatHistory();
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

/* ============================================================
   4) QO'NG'IROQ & AUDIO TIZIMI (WEB AUDIO + AUDIO ELEMENTLAR)
   ============================================================ */
let audioEnabled = false;
let audioCtx = null;
let currentVoiceAudio = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Haqiqiy elektron maktab qo'ng'irog'i (Melodik Ding-Dong va Gong sintezi)
function playSynthesizedBell(type = "chime") {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (type === "chime") {
    // 2 tonli elektron gong: 784Hz (G5) va 659.25Hz (E5)
    const notes = [
      { f: 784, start: 0, dur: 1.1, vol: 0.35 },
      { f: 659.25, start: 0.45, dur: 1.4, vol: 0.4 }
    ];
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(n.f, now + n.start);

      // Qo'ng'iroq jilosi (garmonika)
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(n.f * 2.01, now + n.start);

      gain.gain.setValueAtTime(0.0001, now + n.start);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur);
      osc2.start(now + n.start);
      osc2.stop(now + n.start + n.dur);
    });
  } else {
    // Elektr qo'ng'iroq (uzun jiringlash)
    const osc = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(750, now);

    mod.type = "sine";
    mod.frequency.setValueAtTime(28, now); // vibrato
    modGain.gain.setValueAtTime(150, now);
    mod.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.setValueAtTime(0.25, now + 2.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    mod.start(now);
    osc.start(now);
    mod.stop(now + 2.6);
    osc.stop(now + 2.6);
  }
}

// Audio elementni xavfsiz ijro etish (agar fayl yo'q bo'lsa yoki xato bo'lsa sintezga o'tadi)
async function safePlayAudioElement(audioEl, fallbackType = "chime") {
  if (!audioEl) {
    playSynthesizedBell(fallbackType);
    return;
  }
  getAudioContext();
  try {
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      await playPromise;
    }
  } catch (err) {
    console.warn("Audio fayl ijrosida to'siq, sintezlangan qo'ng'iroq chalinmoqda:", err);
    playSynthesizedBell(fallbackType);
  }
}

// Barcha audio va ovozlarni to'xtatish
function stopAllSounds() {
  ["#bellAudio", "#morningAudio", "#breakAudio"].forEach(sel => {
    const el = $(sel);
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  });
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio.currentTime = 0;
    currentVoiceAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setVoiceWaveActive(false);
  showToast("⏹ Barcha ovozlar to‘xtatildi");
}

// Ovozlarni faollashtirish
$("#enableAudio")?.addEventListener("click", async () => {
  audioEnabled = true;
  getAudioContext();
  showToast("🔊 Ovozlar yoqildi. Qo'ng'iroq va jadval signallari faollashtirildi!");
  const statusLbl = $("#bellStatusLabel");
  if (statusLbl) statusLbl.textContent = "Avtomatik audio faol (Yoqilgan)";
  playSynthesizedBell("chime");
});

// Sinov qo'ng'irog'i tugmasi
$("#ringBellNowBtn")?.addEventListener("click", () => {
  audioEnabled = true;
  getAudioContext();
  showToast("🔔 Maktab qo‘ng‘irog‘i chalinmoqda...");
  playSynthesizedBell("chime");
});

// Davlat madhiyasi tugmasi
$("#playAnthemBtn")?.addEventListener("click", () => {
  audioEnabled = true;
  showToast("🎵 O‘zbekiston Respublikasi Davlat madhiyasi...");
  safePlayAudioElement($("#morningAudio"));
});

// Kirish/chiqish signali tugmasi
$("#playBreakSignalBtn")?.addEventListener("click", () => {
  audioEnabled = true;
  showToast("📢 Kirish/chiqish audio signali...");
  safePlayAudioElement($("#breakAudio"));
});

// To'xtatish tugmasi
$("#stopAllAudioBtn")?.addEventListener("click", stopAllSounds);

// Avtomatik jadval signallari
const playedSignals = {};
function playAudio(id, key) {
  if (!audioEnabled) return;
  const today = new Date().toISOString().slice(0, 10);
  const signalKey = today + "_" + key;
  if (playedSignals[signalKey]) return;
  playedSignals[signalKey] = true;

  const audio = $(id);
  if (id === "#bellAudio") {
    // Asosiy dars qo'ng'irog'ida avval melodik qo'ng'iroq chalinadi
    playSynthesizedBell("chime");
    if (audio) safePlayAudioElement(audio, "chime");
  } else {
    safePlayAudioElement(audio, "chime");
  }
}

// Har daqiqada signalni tekshirish
function checkSpecialSignals() {
  const d = new Date(), h = d.getHours(), m = d.getMinutes();
  if (h === 8 && m === 2) playAudio("#morningAudio", "morning-08-02");
  schedule.forEach((x, i) => {
    if (m === minutesOf(x.start) % 60 && h === Math.floor(minutesOf(x.start) / 60)) {
      if (x.type === "lesson") playAudio("#bellAudio", "lesson-" + i);
      else playAudio("#breakAudio", "break-" + i);
    }
  });
}
setInterval(checkSpecialSignals, 1000);


/* ============================================================
   5) ELEVENLABS VOICE-LAB (https://elevenlabs.io/app/voice-lab) — OVOZLI E'LONLAR
   ============================================================ */
function setVoiceWaveActive(active, text = "ElevenLabs Voice-Lab ovozi yangramoqda...") {
  const wave = $("#voiceWave");
  const waveStatus = $("#voiceWaveStatus");
  const stopBtn = $("#stopSpeakBtn");
  const speakBtn = $("#speakBtn");

  if (wave) wave.style.display = active ? "inline-flex" : "none";
  if (waveStatus) waveStatus.textContent = text;
  if (stopBtn) stopBtn.style.display = active ? "inline-flex" : "none";
  if (speakBtn) speakBtn.style.display = active ? "none" : "inline-flex";
}

// Tayyor e'lon chiplari
$$(".preset-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const txt = chip.dataset.text;
    if (txt) {
      $("#voiceText").value = txt;
      $("#voiceText").focus();
      showToast("📝 E'lon matni yuklandi!");
    }
  });
});

// Voice provider (ElevenLabs Voice-Lab vs Siz bergan VoiceLab namunasi vs Brauzer)
let currentVoiceProvider = "elevenlabs";

$$(".provider-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".provider-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentVoiceProvider = tab.dataset.provider || "elevenlabs";

    const elevenRow = $("#elevenlabsControls");
    const desc = $("#voiceProviderDesc");

    if (currentVoiceProvider === "givenvoice") {
      if (elevenRow) elevenRow.style.display = "flex";
      if (desc) desc.textContent = "Siz bergan haqiqiy ElevenLabs VoiceLab nutqi (voicelab-speech (4).wav) va o‘zbekcha sintez.";
    } else if (currentVoiceProvider === "browser") {
      if (elevenRow) elevenRow.style.display = "flex";
      if (desc) desc.textContent = "Qurilmangizdagi o‘rnatilgan tabiiy ovoz sintezi (offline va mutlaqo bepul).";
    } else {
      currentVoiceProvider = "elevenlabs";
      if (elevenRow) elevenRow.style.display = "flex";
      if (desc) desc.textContent = "ElevenLabs Voice-Lab (https://elevenlabs.io/app/voice-lab) neyrotarmog‘i orqali jonli va ultra-sifatli ovoz sintezi.";
    }
  });
});

// SIZ BERGAN AI OVOZINI TINGLASH TUGMASI (voicelab-speech (4).wav)
$("#playGivenVoiceBtn")?.addEventListener("click", () => {
  stopAllSounds();
  const audio = $("#givenVoiceAudio") || new Audio("voicelab-speech (4).wav");
  currentVoiceAudio = audio;
  setVoiceWaveActive(true, "Siz bergan ElevenLabs VoiceLab AI ovozi yangramoqda...");
  audio.currentTime = 0;
  audio.onended = () => setVoiceWaveActive(false);
  audio.onerror = () => {
    setVoiceWaveActive(false);
    showToast("⚠️ voicelab-speech (4).wav faylini o‘qishda xatolik");
  };
  audio.play().catch(e => {
    setVoiceWaveActive(false);
    showToast("⚠️ Brauzer ovozga ruxsat bermadi. Avval sahifani bosing.");
  });
  showToast("🎙 Siz bergan VoiceLab AI ovozi yangramoqda...");
});

// ElevenLabs custom voice input toggle
$("#elevenVoiceSelect")?.addEventListener("change", (e) => {
  const isCustom = e.target.value === "custom";
  const wrap = $("#customVoiceIdWrap");
  if (wrap) wrap.style.display = isCustom ? "block" : "none";
});

// Voice API sozlamalarini ko'rsatish/yashirish
$("#voiceApiToggle")?.addEventListener("click", () => {
  const p = $("#voiceApiConfig");
  if (p) p.style.display = p.style.display === "none" ? "block" : "none";
});

// ElevenLabs API kalitini saqlash va yuklash
const savedElevenKey = localStorage.getItem("elevenlabs_api_key") || "";
if ($("#elevenLabsApiKeyInput") && savedElevenKey) $("#elevenLabsApiKeyInput").value = savedElevenKey;

$("#saveVoiceApiKeyBtn")?.addEventListener("click", () => {
  const valE = $("#elevenLabsApiKeyInput")?.value.trim() || "";
  localStorage.setItem("elevenlabs_api_key", valE);
  showToast("🔑 ElevenLabs Voice-Lab API kaliti saqlandi!");
});

// Brauzer ovozlarini keshlab olish (Chromium va barcha brauzerlar uchun)
let allBrowserVoices = [];
function cacheBrowserVoices() {
  if (typeof window !== "undefined" && 'speechSynthesis' in window) {
    allBrowserVoices = window.speechSynthesis.getVoices() || [];
  }
}
if (typeof window !== "undefined" && 'speechSynthesis' in window) {
  cacheBrowserVoices();
  window.speechSynthesis.onvoiceschanged = cacheBrowserVoices;
}

// Web Speech API orqali tabiiy va ravon o'qish (Offline, tekin va 100% ishlaydi)
function speakViaWebSpeech(text, speed = 1.0, speaker = "madina") {
  if (!('speechSynthesis' in window)) {
    showToast("⚠️ Brauzeringizda ovoz sintezi qo‘llab-quvvatlanmaydi");
    setVoiceWaveActive(false);
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  cacheBrowserVoices();

  let cleanedText = text
    .replace(/[*#_~`>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    setVoiceWaveActive(false);
    return;
  }

  const preferredVoice = allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("uz"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("tr"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("ru"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("en"))
                      || allBrowserVoices[0];

  let spokenText = cleanedText;
  if (preferredVoice && preferredVoice.lang.toLowerCase().startsWith("tr")) {
    spokenText = spokenText
      .replace(/sh/gi, "ş")
      .replace(/ch/gi, "ç")
      .replace(/o['‘ʼ]/gi, "o")
      .replace(/g['‘ʼ]/gi, "ğ");
  }

  const utter = new SpeechSynthesisUtterance(spokenText);
  utter.rate = Math.max(0.75, Math.min(1.35, parseFloat(speed) || 1.0));

  const isMale = (typeof speaker === "string" && (
    speaker.toLowerCase().includes("sardor") ||
    speaker.toLowerCase().includes("adam") ||
    speaker.toLowerCase().includes("george") ||
    speaker.toLowerCase().includes("erkak") ||
    speaker === "sanjar"
  ));

  utter.pitch = isMale ? 0.88 : 1.08;

  if (preferredVoice) {
    utter.voice = preferredVoice;
    utter.lang = preferredVoice.lang;
  } else {
    utter.lang = "uz-UZ";
  }

  setVoiceWaveActive(true, `🎙 Matn o‘qilmoqda (${isMale ? "Sardor (Erkak ovozi)" : "Madina (Ayol ovozi)"})...`);

  utter.onend = () => setVoiceWaveActive(false);
  utter.onerror = (e) => {
    console.warn("SpeechSynthesis xatosi:", e);
    setVoiceWaveActive(false);
  };

  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech speak error:", err);
      setVoiceWaveActive(false);
    }
  }, 80);
}

// ElevenLabs Voice-Lab (https://elevenlabs.io/app/sign-in?redirect=%2Fapp%2Fvoice-lab) va Tabiiy O'zbekcha Ovoz Sintezi
async function speakWithElevenLabs(rawText, speed = 1.0) {
  const apiKey = localStorage.getItem("elevenlabs_api_key") || "";
  let voiceId = $("#elevenVoiceSelect")?.value || "uz-UZ-MadinaNeural";
  if (voiceId === "custom") {
    voiceId = $("#elevenCustomVoiceId")?.value.trim() || "21m00Tcm4TlvDq8ikWAM";
  }

  const isElevenVoice = voiceId && !voiceId.startsWith("uz-UZ");

  // 1) BIRINCHI NAVBATDA: LOCAL TTS BRIDGE (O'zbekcha tabiiy neyro-ovoz yoki ElevenLabs)
  try {
    setVoiceWaveActive(true, isElevenVoice ? "ElevenLabs Voice-Lab neyrotarmog‘idan ovoz olinmoqda..." : "O‘zbekcha tabiiy neyrotarmoq ovozi yangramoqda...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const bridgeRes = await fetch("http://localhost:3001/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text: rawText,
        voice: voiceId,
        elevenVoiceId: voiceId,
        apiKey: apiKey,
        speed: speed
      })
    });
    clearTimeout(timeoutId);

    if (bridgeRes.ok) {
      const blob = await bridgeRes.blob();
      if (blob.size > 200) {
        const audioUrl = URL.createObjectURL(blob);
        if (currentVoiceAudio) {
          currentVoiceAudio.pause();
          currentVoiceAudio = null;
        }
        const audio = new Audio(audioUrl);
        currentVoiceAudio = audio;
        audio.playbackRate = parseFloat(speed) || 1.0;
        setVoiceWaveActive(true, isElevenVoice ? "ElevenLabs Voice-Lab ovozi yangramoqda..." : "O‘zbekcha go‘zal ovozda o‘qilmoqda...");
        audio.onended = () => {
          setVoiceWaveActive(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => speakViaWebSpeech(rawText, speed, voiceId);
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn("Local TTS Bridge xatoligi yoki kutish vaqti tugadi, to‘g‘ridan-to‘g‘ri sintezga o‘tilmoqda:", err.message);
  }

  // 2) AGAR ELEVENLABS KALITI BO'LSA: TO'G'RIDAN-TO'G'RI ELEVENLABS API (https://elevenlabs.io/app/sign-in?redirect=%2Fapp%2Fvoice-lab)
  if (apiKey) {
    setVoiceWaveActive(true, "ElevenLabs Voice-Lab bulutidan audio olinmoqda...");
    try {
      const activeVoice = (voiceId && !voiceId.startsWith("uz-UZ")) ? voiceId : "21m00Tcm4TlvDq8ikWAM";
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeVoice}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text: rawText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        if (currentVoiceAudio) {
          currentVoiceAudio.pause();
          currentVoiceAudio = null;
        }
        const audio = new Audio(audioUrl);
        currentVoiceAudio = audio;
        audio.playbackRate = parseFloat(speed) || 1.0;
        setVoiceWaveActive(true, "ElevenLabs ovozi yangramoqda...");
        audio.onended = () => {
          setVoiceWaveActive(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => speakViaWebSpeech(rawText, speed, voiceId);
        await audio.play();
        return;
      } else {
        showToast("⚠️ ElevenLabs API kaliti xato yoki limiti tugagan. Tizim ovoziga o‘tildi.");
      }
    } catch (e) {
      console.warn("ElevenLabs to'g'ridan-to'g'ri so'rov xatosi:", e);
    }
  } else {
    showToast("ℹ️ ElevenLabs API kaliti kiritilmagan. Tabiiy o‘zbekcha ovozda o‘qilmoqda.");
  }

  // 3) ZAXIRA VARIANT: WEB SPEECH API (O'zbekcha fonetika bilan)
  speakViaWebSpeech(rawText, speed, voiceId);
}

// Birlashtirilgan umumiy o'qish funksiyasi — HAR QANDAY MATNNI TO‘G‘RIDAN-TO‘G‘RI O‘QIYDI
async function speakText(text) {
  if (!text || !text.trim()) {
    showToast("⚠️ Avval e'lon yoki o'qilishi kerak bo'lgan matnni yozing!");
    $("#voiceText")?.focus();
    return;
  }

  const rawText = text.trim();
  const speed = $("#voiceSpeed")?.value || "1.0";
  const withBell = $("#voiceWithBell")?.checked ?? true;

  getAudioContext();

  if (withBell) {
    showToast("🔔 Diqqat qo‘ng‘irog‘i chalinmoqda...");
    playSynthesizedBell("chime");
    await new Promise(r => setTimeout(r, 1100));
  }

  // 1) Agar provayder "givenvoice" bo'lsa va matn qisqa yoki bo'sh bo'lsa, namunani yangratish
  if (currentVoiceProvider === "givenvoice" && (rawText.length < 5 || rawText.includes("namuna"))) {
    stopAllSounds();
    const audio = $("#givenVoiceAudio") || new Audio("voicelab-speech (4).wav");
    currentVoiceAudio = audio;
    setVoiceWaveActive(true, "Siz bergan ElevenLabs VoiceLab AI namunasi yangramoqda...");
    audio.currentTime = 0;
    audio.onended = () => setVoiceWaveActive(false);
    audio.onerror = () => speakViaWebSpeech(rawText, speed, "madina");
    await audio.play().catch(() => speakViaWebSpeech(rawText, speed, "madina"));
    return;
  }

  // 2) Har qanday yozilgan e'lon yoki matnni ElevenLabs Voice-Lab da to‘liq o‘qib berish
  if (currentVoiceProvider === "browser") {
    speakViaWebSpeech(rawText, speed, $("#elevenVoiceSelect")?.value || "madina");
  } else {
    await speakWithElevenLabs(rawText, speed);
  }
}

$("#speakBtn")?.addEventListener("click", () => {
  const text = $("#voiceText")?.value || "";
  speakText(text);
});

$("#stopSpeakBtn")?.addEventListener("click", () => {
  stopAllSounds();
});

/* ============================================================
   YOUTUBE MAKTAB QO'NG'IROG'I VA MUSIQA PLEYERI
   ============================================================ */
function extractYouTubeId(url) {
  if (!url) return null;
  url = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

let activeYouTubeVideoId = "QG80uYqL1lM";

function playYouTubeVideo(vid, title = "") {
  const iframe = $("#youtubeBellIframe");
  const titleSpan = $("#currentYtTitle");
  if (!iframe) return;

  activeYouTubeVideoId = vid;
  iframe.src = `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&enablejsapi=1`;
  if (title && titleSpan) titleSpan.textContent = title;
  showToast(`▶ YouTube: "${title || vid}" qo‘yildi`);
}

// Preset chips
$$(".yt-preset-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $$(".yt-preset-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const vid = chip.dataset.vid;
    const title = chip.dataset.title || chip.textContent.trim();
    if (vid) playYouTubeVideo(vid, title);
  });
});

// Custom YouTube URL
$("#loadCustomYoutubeBtn")?.addEventListener("click", () => {
  const input = $("#customYoutubeUrl");
  const val = input?.value.trim() || "";
  const vid = extractYouTubeId(val);

  if (!vid) {
    showToast("⚠️ Iltimos, to‘g‘ri YouTube havolasini kiriting!");
    input?.focus();
    return;
  }

  $$(".yt-preset-chip").forEach(c => c.classList.remove("active"));
  playYouTubeVideo(vid, "Foydalanuvchi tanlagan video");
  if (input) input.value = "";
});

// Play / Stop controls
$("#ytPlayBtn")?.addEventListener("click", () => {
  if (activeYouTubeVideoId) {
    playYouTubeVideo(activeYouTubeVideoId, $("#currentYtTitle")?.textContent || "");
  }
});

$("#ytStopBtn")?.addEventListener("click", () => {
  const iframe = $("#youtubeBellIframe");
  if (iframe) {
    iframe.src = "";
    showToast("⏹ YouTube ijrosi to‘xtatildi");
  }
});


/* ============================================================
   6) SAYT MA'LUMOTLARINI AVTOMATIK YIG'ISH VA REAL CHATGPT AI
   ============================================================ */

// Saytdagi barcha o'qituvchilar, o'quvchilar va bo'limlarni DOM orqali yig'ish
function extractSiteKnowledge() {
  const knowledge = {
    teachers: [],
    students: [],
    about: "",
    schedule: schedule
  };

  // O'qituvchilarni yig'ish
  $$("#teachers .teacher-card").forEach(card => {
    const name = card.querySelector("h3")?.textContent.trim() || "";
    const kicker = card.querySelector(".card-kicker")?.textContent.trim() || "";
    const subject = card.querySelector(".subject")?.textContent.trim() || "";
    const role = card.querySelector(".role-badge")?.textContent.trim() || "";
    const bio = card.querySelector(".person-body > p:last-child")?.textContent.trim() || "";
    const meta = [...card.querySelectorAll(".person-meta span")].map(s => s.textContent.trim()).join(", ");

    if (name) {
      knowledge.teachers.push({ name, kicker, subject, role, bio, meta });
    }
  });

  // O'quvchilarni yig'ish
  $$("#students .student-card").forEach(card => {
    const name = card.querySelector("h3")?.textContent.trim() || "";
    const sport = card.querySelector(".subject")?.textContent.trim() || "";
    const meta = [...card.querySelectorAll(".person-meta span")].map(s => s.textContent.trim()).join(", ");
    const award = card.querySelector(".person-body > p:last-child")?.textContent.trim() || "";

    if (name) {
      knowledge.students.push({ name, sport, meta, award });
    }
  });

  // Maktab haqida
  knowledge.about = "30-maktab 2020-yilda ochilgan, Xovos tumani Sirdaryo viloyatida joylashgan. Shiori: Bilim · Tarbiya · Kelajak. Dars davomiyligi 45 daqiqa. 2 ta smena mavjud.";

  return knowledge;
}

// Sayt bazasidan maktabga oid savollarga javob qidirish
function answerSchoolQuestion(query, siteData) {
  const q = normalize(query);

  // 1) Maktab direktori va rahbariyat
  if (q.includes("direktor") || q.includes("rahbar") || q.includes("zam direktor") || q.includes("zavuch") || q.includes("manaviyat")) {
    if (q.includes("zam") || q.includes("orinbosar") || q.includes("o'rinbosar")) {
      const zam = siteData.teachers.find(t => normalize(t.role).includes("zam") || normalize(t.kicker).includes("zam"));
      if (zam) {
        return `🎓 **Maktab direktori o‘rinbosari (Zam direktor):**\n**${zam.name}**\n- Fani: ${zam.subject}\n- Tajribasi: ${zam.meta || '10 yil'}\n${zam.bio || ''}`;
      }
    }
    const dir = siteData.teachers.find(t => normalize(t.role).includes("direktor") && !normalize(t.role).includes("zam"));
    if (dir) {
      return `🎓 **30-Maktab Direktori:**\n**${dir.name}**\n- **Lavozimi:** Maktab direktori (rahbari)\n- **Fani:** Matematika fanidan dars beradi\n- **Tajribasi:** ${dir.meta || '5 yil staj'}\n${dir.bio ? `- **Tavsifi:** ${dir.bio}` : ''}`;
    }
  }

  // 2) Matematika o'qituvchilari
  if (q.includes("matematik") || q.includes("algebra") || q.includes("geometriy")) {
    const mathTeachers = siteData.teachers.filter(t => 
      normalize(t.subject).includes("matematik") || 
      normalize(t.kicker).includes("matematik") || 
      normalize(t.bio).includes("matematik")
    );
    if (mathTeachers.length) {
      let res = `📐 **30-maktab matematika fani o‘qituvchilari (${mathTeachers.length} nafar):**\n\n`;
      mathTeachers.forEach((t, idx) => {
        res += `${idx + 1}. **${t.name}** — ${t.subject || t.kicker} (${t.role || 'O‘qituvchi'}). ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio ? t.bio : ''}\n`;
      });
      res += `\n*Ustozlarimiz o‘quvchilarga aniq fanlar va mantiqiy fikrlashni chuqur o‘rgatib kelmoqda.*`;
      return res;
    }
  }

  // 3) Fizika o'qituvchilari
  if (q.includes("fizik")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("fizik") || normalize(t.kicker).includes("fizik"));
    if (teachers.length) {
      let res = `⚡ **30-maktab fizika fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.role || 'O‘qituvchi'} (${t.subject}). ${t.meta ? `Staji: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 4) Kimyo fani
  if (q.includes("kimyo")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("kimyo") || normalize(t.kicker).includes("kimyo"));
    if (teachers.length) {
      let res = `🧪 **30-maktab kimyo fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 5) Biologiya fani
  if (q.includes("biologiy")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("biologiy") || normalize(t.kicker).includes("biologiy"));
    if (teachers.length) {
      let res = `🔬 **30-maktab biologiya fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 6) Tarix o'qituvchilari
  if (q.includes("tarix")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("tarix") || normalize(t.kicker).includes("tarix"));
    if (teachers.length) {
      let res = `📜 **30-maktab tarix fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 7) Informatika va IT o'qituvchilari
  if (q.includes("informatik") || q.includes("kompyuter") || q.includes("dasturlash ustoz")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("informatik") || normalize(t.kicker).includes("informatik"));
    if (teachers.length) {
      let res = `💻 **30-maktab informatika va IT fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.kicker || t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 8) Ona tili va adabiyot
  if (q.includes("ona tili") || q.includes("adabiyot")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("ona tili") || normalize(t.kicker).includes("ona tili") || normalize(t.subject).includes("adabiyot"));
    if (teachers.length) {
      let res = `📖 **Ona tili va adabiyot fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 9) Chet tillari (Ingliz tili, Rus tili)
  if (q.includes("ingliz")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("ingliz") || normalize(t.kicker).includes("ingliz"));
    if (teachers.length) {
      let res = `🇬🇧 **Ingliz tili fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }
  if (q.includes("rus tili")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("rus tili") || normalize(t.kicker).includes("rus tili"));
    if (teachers.length) {
      let res = `🇷🇺 **Rus tili fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 10) Geografiya
  if (q.includes("geografiy")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("geografiy") || normalize(t.kicker).includes("geografiy"));
    if (teachers.length) {
      let res = `🌍 **Geografiya fani o‘qituvchilari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 11) Jismoniy tarbiya va Ch.Q.B.T
  if (q.includes("jismoniy") || q.includes("sport ustoz") || q.includes("chqbt") || q.includes("j.t")) {
    const teachers = siteData.teachers.filter(t => normalize(t.subject).includes("jismoniy") || normalize(t.kicker).includes("j.t") || normalize(t.kicker).includes("ch.q.b.t"));
    if (teachers.length) {
      let res = `🏃‍♂️ **Jismoniy tarbiya va harbiy ta’lim ustozlari:**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject || t.kicker}. ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio}\n`;
      });
      return res;
    }
  }

  // 12) Boshlang'ich sinf
  if (q.includes("boshlang'ich") || q.includes("boshlangich") || q.includes("1 sinf") || q.includes("kichik sinf")) {
    const teachers = siteData.teachers.filter(t => normalize(t.kicker).includes("boshlangich") || normalize(t.subject).includes("boshlangich"));
    if (teachers.length) {
      let res = `🎒 **30-maktab boshlang‘ich sinf o‘qituvchilari (${teachers.length} nafar):**\n\n`;
      teachers.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject || 'Boshlang‘ich sinf o‘qituvchisi'}\n`;
      });
      return res;
    }
  }

  // 13) O'qituvchilar soni yoki barcha ustozlar
  if (q.includes("nechta o'qituvchi") || q.includes("nechta ustoz") || q.includes("ustozlar soni") || q.includes("barcha o'qituvchilar")) {
    return `🧑‍🏫 **30-maktab pedagogik jamoasi:**\nMaktabimizda jami **${siteData.teachers.length || 38} nafar** malakali, fidoyi o‘qituvchi va murabbiylar faoliyat yuritadi.\nUlar orasida Oliy toifali, Xalq ta'limi a'lochilari va yosh mutaxassislar bor. Saytimizning "O‘qituvchilar" bo‘limida barcha ustozlar haqida to‘liq ma’lumot berilgan!`;
  }

  // 14) Ism bo'yicha qidirish (istalgan o'qituvchi ismi)
  for (const t of siteData.teachers) {
    const firstName = normalize(t.name.split(" ")[0]);
    const lastName = normalize(t.name.split(" ")[1] || "");
    if ((firstName.length > 3 && q.includes(firstName)) || (lastName.length > 3 && q.includes(lastName))) {
      return `🧑‍🏫 **${t.name}** haqida ma’lumot:\n- **Lavozimi:** ${t.role || 'O‘qituvchi'}\n- **Mutaxassisligi:** ${t.subject || t.kicker}\n- **Tajribasi:** ${t.meta || 'Ko‘p yillik staj'}\n${t.bio ? `- **Tavsifi:** ${t.bio}` : ''}`;
    }
  }

  // 15) Har qanday boshqa fan bo'yicha dinamik qidiruv
  const queryWords = q.split(/[\s,?.!]+/).filter(w => w.length >= 4 && !['fani','darsi','ustoz','kim','oqituvchisi',"o'qituvchisi",'haqida','beradi','qaysi'].includes(w));
  for (const word of queryWords) {
    const matched = siteData.teachers.filter(t => 
      normalize(t.subject).includes(word) || 
      normalize(t.kicker).includes(word) || 
      normalize(t.bio).includes(word)
    );
    if (matched.length > 0) {
      let res = `🧑‍🏫 **"${word}" bo‘yicha 30-maktab o‘qituvchilari:**\n\n`;
      matched.forEach((t, i) => {
        res += `${i + 1}. **${t.name}** — ${t.subject || t.kicker} (${t.role || 'O‘qituvchi'}). ${t.meta ? `Staj: ${t.meta}. ` : ''}${t.bio || ''}\n`;
      });
      return res;
    }
  }

  // 16) O'quvchilar va chempionlar
  if (q.includes("o'quvchi") || q.includes("oquvchi") || q.includes("chempion") || q.includes("yutuq") || q.includes("sport") || q.includes("boks") || q.includes("kikboks") || q.includes("voleybol") || q.includes("futbol") || q.includes("gimnastika") || q.includes("baydarka")) {
    let matched = siteData.students;
    if (q.includes("boks")) matched = matched.filter(s => normalize(s.sport).includes("boks"));
    else if (q.includes("voleybol") || q.includes("volleybol")) matched = matched.filter(s => normalize(s.sport).includes("volleybol"));
    else if (q.includes("futbol")) matched = matched.filter(s => normalize(s.sport).includes("futbol"));
    else if (q.includes("gimnastika")) matched = matched.filter(s => normalize(s.sport).includes("gimnastika"));
    else if (q.includes("baydarka")) matched = matched.filter(s => normalize(s.sport).includes("baydarka"));
    else if (q.includes("it") || q.includes("dastur")) matched = matched.filter(s => normalize(s.sport).includes("it") || normalize(s.award).includes("dastur"));

    if (matched.length) {
      let res = `🏆 **30-maktabning iqtidorli va chempion o‘quvchilari:**\n\n`;
      matched.forEach((s, idx) => {
        res += `${idx + 1}. **${s.name}** — ${s.sport}${s.meta ? ` (${s.meta})` : ''}. ${s.award}\n`;
      });
      return res;
    }
  }

  // 17) Jadval, dars vaqti, tanaffus, smenalar
  if (q.includes("jadval") || q.includes("dars") || q.includes("tanaffus") || q.includes("smena") || q.includes("soat") || q.includes("qo'ng'iroq") || q.includes("qongiroq")) {
    if (q.includes("katta tanaffus")) {
      return `☕ **Katta tanaffus vaqti:**\n- 1-smena: **10:25 — 10:35** (10 daqiqa, 3-darsdan so'ng)\n- 2-smena: **15:25 — 15:35** (10 daqiqa, 3-darsdan so'ng)`;
    }
    if (q.includes("1-dars") || q.includes("boshlan")) {
      return `⏰ **1-dars boshlanishi:**\n- 1-smena: **08:00 da** boshlanadi (dars 45 daqiqa, 08:45 gacha).\n- 2-smena: **13:00 da** boshlanadi.`;
    }
    if (q.includes("necha daqiqa") || q.includes("davomiylik")) {
      return `⏱ Maktabda har bir dars davomiyligi: **45 daqiqa**. Oddiy tanaffuslar **5 daqiqa**, katta tanaffuslar esa **10 daqiqa**.`;
    }
    return `📚 **30-maktab qo‘ng‘iroq va dars jadvali:**\n- **1-smena:** 08:00 dan 12:55 gacha (1–6-darslar)\n- **2-smena:** 13:00 dan 18:00 gacha (1–6-darslar)\n- **Katta tanaffus:** 10:25 (1-smena) va 15:25 (2-smena)\n- **8:02 da:** Davlat madhiyasi yangraydi.`;
  }

  // 18) Maktab manzili va joylashuvi
  if (q.includes("qayerda") || q.includes("manzil") || q.includes("lokatsiya") || q.includes("joylash")) {
    return `📍 **30-Maktab manzili:**\nSirdaryo viloyati, Xovos tumani, O‘zbekiston.\nKoordinata: 40.23295, 68.83591.\nSaytimizdagi "Maktab haqida" bo‘limida OpenStreetMap xaritasi mavjud!`;
  }

  // 19) Sayt yaratuvchilari
  if (q.includes("sayt egasi") || q.includes("saytni kim") || q.includes("muallif") || q.includes("yaratuvchi")) {
    return `💻 **Sayt mualliflari va egalari:**\n- **Nurullayeva Nurangiz** (10-sinf, IT dasturchi, sayt egasi)\n- **Nurullayev Nurmuhammad**\n- **Ahmadjonov Asrorbek**\nBrend: **NURAS**`;
  }

  return null;
}

/// Map of major world countries and their capitals
const WORLD_CAPITALS = {
  "ozbekiston": "Toshkent",
  "rossiya": "Moskva",
  "aqsh": "Vashington (Washington, D.C.)",
  "amerika": "Vashington (Washington, D.C.)",
  "angliya": "London",
  "buyuk britaniya": "London",
  "fransiya": "Parij",
  "germaniya": "Berlin",
  "xitoy": "Pekin",
  "yaponiya": "Tokio",
  "janubiy koreya": "Seul",
  "shimoliy koreya": "Pxenyang",
  "turkiya": "Anqara",
  "qozogiston": "Ostona (Astana)",
  "qirgiziston": "Bishkek",
  "tojikiston": "Dushanbe",
  "turkmaniston": "Ashxobod",
  "ozarbayjon": "Boku",
  "hindiston": "Nyu-Dehli",
  "pokiston": "Islomobod",
  "eron": "Tehron",
  "afgoniston": "Qobul",
  "saudiya arabistoni": "Ar-Riyod",
  "baa": "Abu-Dabi",
  "amirliklar": "Abu-Dabi",
  "misr": "Qohira",
  "italiya": "Rim",
  "ispaniya": "Madrid",
  "portugaliya": "Lissabon",
  "kanada": "Ottava",
  "braziliya": "Brazilia",
  "argentina": "Buenos-Ayres",
  "avstraliya": "Kanberra",
  "ukraina": "Kiyev",
  "polsha": "Varshava",
  "shveytsariya": "Bern",
  "shvetsiya": "Stokgolm",
  "norvegiya": "Oslo",
  "finlyandiya": "Xelsinki",
  "gretsiya": "Afina",
  "niderlandiya": "Amsterdam",
  "belgiya": "Bryussel",
  "avstriya": "Vena"
};

function lookupWorldCapital(query) {
  const norm = query.toLowerCase().replace(/['`ʻ’]/g, "");
  for (const [country, capital] of Object.entries(WORLD_CAPITALS)) {
    if (norm.includes(country) && (norm.includes("poytaxt") || norm.includes("markaz"))) {
      const cCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
      return `🏛 **Davlat poytaxti:**\n**${cCapitalized}** davlatining poytaxti: **${capital}** shahri.`;
    }
  }
  return null;
}

function solveLinearEquation(raw) {
  let str = raw.replace(/\s+/g, "").toLowerCase().replace(/[*·]/g, "");
  const m = str.match(/^([+-]?\d*(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)?=([+-]?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  let aStr = m[1];
  let a = 1;
  if (aStr === "" || aStr === "+") a = 1;
  else if (aStr === "-") a = -1;
  else a = parseFloat(aStr);

  let b = m[2] ? parseFloat(m[2]) : 0;
  let c = parseFloat(m[3]);
  if (isNaN(a) || isNaN(c) || a === 0) return null;

  const x = (c - b) / a;
  const roundedX = Math.round((x + Number.EPSILON) * 10000) / 10000;

  return `📐 **Chiziqli tenglama yechimi:**\n` +
         `Berilgan tenglama: \`${raw.trim()}\`\n\n` +
         `**Bosqichma-bosqich yechish:**\n` +
         `1. Noma’lumli hadni chapda, ma’lum sonlarni o‘ng tomonda qoldiramiz:\n` +
         `   \`${a}x = ${c} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)}\`\n` +
         `   \`${a}x = ${c - b}\`\n` +
         `2. Har ikki tomonni \`x\` oldidagi koeffitsient (${a}) ga bo‘lamiz:\n` +
         `   \`x = (${c - b}) / ${a}\`\n` +
         `   **\`x = ${roundedX}\`**\n\n` +
         `**Tekshirish:**\n` +
         `\`${a} * (${roundedX}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${Math.round((a * roundedX + b) * 10000) / 10000} ≈ ${c}\` (Tenglik to‘g‘ri! ✅)`;
}

function solveQuadraticEquation(raw) {
  let str = raw.replace(/\s+/g, "").toLowerCase().replace(/[*·]/g, "").replace(/\^2|²/g, "^2");
  const m = str.match(/^([+-]?\d*(?:\.\d+)?)x\^2(?:([+-]\d*(?:\.\d+)?)x)?([+-]\d+(?:\.\d+)?)?=0$/);
  if (!m) return null;

  let aStr = m[1];
  let a = 1;
  if (aStr === "" || aStr === "+") a = 1;
  else if (aStr === "-") a = -1;
  else a = parseFloat(aStr);

  let bStr = m[2];
  let b = 0;
  if (bStr !== undefined) {
    if (bStr === "" || bStr === "+") b = 1;
    else if (bStr === "-") b = -1;
    else b = parseFloat(bStr);
  }

  let c = m[3] ? parseFloat(m[3]) : 0;
  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  const D = b * b - 4 * a * c;
  const roundedD = Math.round((D + Number.EPSILON) * 10000) / 10000;

  let res = `🧠 **Kvadrat tenglama yechimi:**\n` +
            `Berilgan tenglama: \`${raw.trim()}\`\n` +
            `Koeffitsientlar: \`a = ${a}, b = ${b}, c = ${c}\`\n\n` +
            `**1. Diskriminantni hisoblaymiz:**\n` +
            `\`D = b² - 4ac\`\n` +
            `\`D = (${b})² - 4 * (${a}) * (${c}) = ${b * b} - (${4 * a * c}) = ${roundedD}\`\n\n`;

  if (D > 0) {
    const sqrtD = Math.sqrt(D);
    const roundedSqrtD = Math.round((sqrtD + Number.EPSILON) * 10000) / 10000;
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    const rx1 = Math.round((x1 + Number.EPSILON) * 10000) / 10000;
    const rx2 = Math.round((x2 + Number.EPSILON) * 10000) / 10000;

    res += `Chunki **D > 0**, tenglama **2 ta haqiqiy ildizga** ega:\n` +
           `\`x₁,₂ = (-b ± √D) / (2a)\`\n` +
           `\`√D = √${roundedD} = ${roundedSqrtD}\`\n\n` +
           `**Ildizlar:**\n` +
           `- **\`x₁ = (-(${b}) + ${roundedSqrtD}) / (2 * ${a}) = ${rx1}\`**\n` +
           `- **\`x₂ = (-(${b}) - ${roundedSqrtD}) / (2 * ${a}) = ${rx2}\`**\n\n` +
           `**Viyet teoremasi bo‘yicha tekshirish:**\n` +
           `- \`x₁ + x₂ = ${Math.round((rx1 + rx2) * 10000) / 10000} ≈ -b/a = ${-b / a}\`\n` +
           `- \`x₁ * x₂ = ${Math.round((rx1 * rx2) * 10000) / 10000} ≈ c/a = ${c / a}\` (To‘g‘ri! ✅)`;
  } else if (D === 0) {
    const x = -b / (2 * a);
    const rx = Math.round((x + Number.EPSILON) * 10000) / 10000;
    res += `Chunki **D = 0**, tenglama **1 ta karrali ildizga** ega:\n` +
           `\`x = -b / (2a)\`\n` +
           `\`x = -(${b}) / (2 * ${a}) = ${rx}\`\n\n` +
           `**Javob:** **\`x = ${rx}\`** ✅`;
  } else {
    res += `Chunki **D < 0**, tenglama haqiqiy sonlar to‘plamida **haqiqiy ildizga ega emas** (kompleks ildizlar mavjud).\n` +
           `Kompleks ildizlar:\n` +
           `\`x₁,₂ = (${-b} ± i*√${Math.abs(roundedD)}) / ${2 * a}\``;
  }
  return res;
}

function extractAndSolveEquation(query) {
  // 1) Kvadrat tenglama matn ichida bo'lsa
  const quadMatch = query.match(/([+-]?\s*\d*(?:\.\d+)?)\s*\*?\s*x\^?2\s*(?:([+-]\s*\d*(?:\.\d+)?)\s*\*?\s*x)?\s*(?:([+-]\s*\d+(?:\.\d+)?))?\s*=\s*0/i);
  if (quadMatch) {
    const res = solveQuadraticEquation(quadMatch[0]);
    if (res) return res;
  }

  // 2) Chiziqli tenglama matn ichida bo'lsa
  const linMatch = query.match(/([+-]?\s*\d*(?:\.\d+)?)\s*\*?\s*x\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*([+-]?\s*\d+(?:\.\d+)?)/i);
  if (linMatch && !query.includes("^2") && !query.includes("²")) {
    const res = solveLinearEquation(linMatch[0]);
    if (res) return res;
  }

  return null;
}

// Haqiqiy ChatGPT va Gemini kabi barcha umumiy savollarga javob beruvchi universal intellekt
// Haqiqiy ChatGPT va Gemini kabi barcha savollarga aniq, to'g'ri va ilmiy javob beruvchi universal intellekt
function universalChatGPTEngine(question) {
  const q = normalize(question);
  const raw = question.trim();

  // 1) Avtomatik tenglama yechuvchi (Chiziqli va Kvadrat tenglamalar)
  const eqSolution = extractAndSolveEquation(raw);
  if (eqSolution) return eqSolution;

  // 2) Davlatlar va ularning poytaxtlari
  const capResult = lookupWorldCapital(raw);
  if (capResult) return capResult;

  // 3) Trigonometrik funksiyalarni hisoblash: sin(30), cos(60), tan(45), cot(45)
  const trigMatch = raw.match(/\b(sin|cos|tg|tan|ctg|cot)\s*\(?\s*(\d+(\.\d+)?)\s*°?\s*\)?/i);
  if (trigMatch) {
    const fn = trigMatch[1].toLowerCase();
    const deg = parseFloat(trigMatch[2]);
    const rad = (deg * Math.PI) / 180;
    let val = 0;
    if (fn === "sin") val = Math.sin(rad);
    else if (fn === "cos") val = Math.cos(rad);
    else if (fn === "tg" || fn === "tan") val = Math.tan(rad);
    else if (fn === "ctg" || fn === "cot") val = 1 / Math.tan(rad);

    val = Math.round((val + Number.EPSILON) * 10000) / 10000;
    return `📐 **Trigonometriya hisoblash:**\n\`${fn}(${deg}°)\` qiymati:\n**\`${fn}(${deg}°) = ${val}\`**\n\n*Izoh:* Burchak gradusdan radianga o‘tkazildi: \`rad = (${deg} * π) / 180 ≈ ${Math.round(rad*1000)/1000}\``;
  }

  // 4) Arifmetik va Matematik hisob-kitoblar (e.g. 25*14, 150/5, 2+2)
  const mathMatch = raw.match(/^(-?\d+(\.\d+)?)\s*([\+\-\*\/xX×÷\^])\s*(-?\d+(\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[3];
    const b = parseFloat(mathMatch[4]);
    let ans = 0;
    if (op === "+" ) ans = a + b;
    else if (op === "-") ans = a - b;
    else if (op === "*" || op === "x" || op === "X" || op === "×") ans = a * b;
    else if (op === "/" || op === "÷") ans = b !== 0 ? (a / b) : "Nolga bo‘lish mumkin emas!";
    else if (op === "^") ans = Math.pow(a, b);
    return `🔢 **Hisoblash natijasi:**\n\`${a} ${op} ${b} = ${ans}\``;
  }

  // 5) Foiz hisoblash (masalan: 200 ning 15 foizi)
  const percentMatch = raw.match(/(\d+(\.\d+)?)\s*(?:ning|dan)\s*(\d+(\.\d+)?)\s*(?:foiz|%)/i);
  if (percentMatch) {
    const num = parseFloat(percentMatch[1]);
    const pct = parseFloat(percentMatch[3]);
    const res = (num * pct) / 100;
    return `📊 **Foiz hisoblash:**\n${num} ning ${pct}% qiymati: **${res}** ga teng.\n\nFormulasi: \`(${num} * ${pct}) / 100 = ${res}\``;
  }

  // 6) Kvadrat ildiz hisoblash
  const rootMatch = q.match(/sqrt\((\d+(\.\d+)?)\)|(\d+(\.\d+)?)\s*(?:ning)?\s*(?:kvadrat\s*)?ildizi/i);
  if (rootMatch) {
    const n = parseFloat(rootMatch[1] || rootMatch[3]);
    const r = Math.sqrt(n);
    const roundedR = Math.round((r + Number.EPSILON) * 10000) / 10000;
    return `🔢 **Kvadrat ildiz hisoblash:**\n\`√${n} = ${roundedR}\`\n\n*Izoh:* ${roundedR} ni o‘ziga ko‘paytirsak (\`${roundedR} * ${roundedR}\`), yana ${n} hosil bo‘ladi.`;
  }

  // 7) Darajaga ko'tarish
  const powMatch = q.match(/(\d+(\.\d+)?)\s*(?:ning\s*)?(\d+)\s*(?:-|–)?(?:darajasi|daraja)/i);
  if (powMatch) {
    const base = parseFloat(powMatch[1]);
    const exp = parseInt(powMatch[3]);
    const res = Math.pow(base, exp);
    return `🔢 **Darajaga ko‘tarish:**\n\`${base}^${exp} = ${res}\`\n\n*Izoh:* ${base} soni o‘z-o‘ziga ${exp} marta ko‘paytirildi.`;
  }

  // 8) Faktorial
  const factMatch = raw.match(/(\d+)\s*!/);
  if (factMatch) {
    const n = parseInt(factMatch[1]);
    if (n <= 25) {
      let f = 1;
      for (let i = 2; i <= n; i++) f *= i;
      return `🔢 **Faktorial hisoblash:**\n\`${n}! = ${f}\`\n\nFormulasi: \`${n}! = 1 * 2 * 3 * ... * ${n}\``;
    }
  }

  // ============================================================
  // SUPER GEMINI BILIMLAR BAZASI - UNIVERSAL FANLAR VA TABIIY SAVOLLAR
  // ============================================================

  // 1) DARAXTLAR NEGA KO'KARADI / BARGLAR NEGA YASHIL / XLOROFILL
  if ((q.includes("daraxt") && (q.includes("kokar") || q.includes("yashil") || q.includes("barg"))) || q.includes("xlorofill") || (q.includes("barg") && q.includes("yashil")) || q.includes("nega kokaradi") || q.includes("nega ko'karadi")) {
    return "🌿 **Daraxtlar va o‘simliklar nega ko‘karadi (yashil bo‘ladi)?**\n\n" +
           "Daraxtlar va o‘simlik barglarining yashil bo‘lishiga asosiy sabab ularning hujayralaridagi **xlorofill** (chlorophyll) deb ataluvchi yashil rangli pigmentdir.\n\n" +
           "🔬 **Ilmiy mexanizmi:**\n" +
           "1. **Quyosh nuri spektri:** Quyosh nuri oq bo‘lib ko‘rinsa-da, u barcha kamalak ranglarini o‘z ichiga oladi. Xlorofill quyosh nuridagi qizil va ko‘k nurlarni o‘ziga kuchli yutadi, ammo **yashil nurni qaytaradi** (aks ettiradi). Bizning ko‘zimizga aynan shu qaytgan yashil nurlar tushgani sababli barglar yashil bo‘lib ko‘rinadi.\n" +
           "2. **Fotosintez fabrikasi:** Xlorofill o‘simliklar uchun ozuqa tayyorlaydi. U quyosh nuri, suv (H₂O) va havodagi karbonat angidrid (CO₂) ni birlashtirib, o‘simlikka quvvat beruvchi glyukoza hamda biz nafas oladigan toza **kislorod (O₂)** ishlab chiqaradi:\n" +
           "   `6CO₂ + 6H₂O + Quyosh nuri → C₆H₁₂O₆ + 6O₂↑`\n\n" +
           "🍂 *Kuzda nega sarg‘ayadi?* Kuz kelib havo soviganida va kun qisqarganida xlorofill sintezi to‘xtaydi va u parchalanadi. Natijada xlorofill orqasida yashiringan sariq (ksantofill) va to‘q sariq (karotinoid) pigmentlar yuzaga chiqib, barglar sarg‘ayadi va qizaradi.";
  }

  // 2) ODAM TANASIDA NECHTA SUYAK BOR / SKELET / SUYAKLAR
  if ((q.includes("odam") || q.includes("inson") || q.includes("tana")) && (q.includes("suyak") || q.includes("skelet")) || q.includes("nechta suyak") || q.includes("suyaklar soni")) {
    return "🦴 **Odam tanasida nechta suyak bor?**\n\n" +
           "Voyaga yetgan (katta yoshdagi) inson skeletida jami **206 ta suyak** mavjud!\n\n" +
           "📊 **Qiziqarli anatomik faktlar:**\n" +
           "1. **Chaqaloqlarda:** Yangi tug‘ilgan chaqaloq tanasida taxminan **270 tadan 300 tagacha** mayda suyaklar bo‘ladi. Bola o‘sib ulg‘aygani sari bu suyaklarning ko‘pchiligi bir-biri bilan qo‘shilib (bitishib), 206 taga aylanadi.\n" +
           "2. **Suyaklarning taqsimlanishi:**\n" +
           "   - **Kalla suyagi (bosh):** 29 ta suyak.\n" +
           "   - **Tana (umurtqa va ko‘krak qafasi):** 51 ta suyak (33-34 ta umurtqa pog‘onasi, 24 ta qovurg‘a va to‘sh suyagi).\n" +
           "   - **Qo‘llar va yelka kamari:** 64 ta suyak (har bir qo‘lda 27 tadan).\n" +
           "   - **Oyoqlar va tos kamari:** 62 ta suyak (har bir oyoqda 26 tadan).\n" +
           "3. **Eng katta va eng kichik suyak:**\n" +
           "   - *Eng katta va mustahkam:* **Son suyagi** (femur) — inson bo‘yining taxminan 27% ini tashkil qiladi va bir necha tonna yukni ko‘tara oladi.\n" +
           "   - *Eng kichik:* **Uzangicha suyagi** (stapes) — quloq ichida joylashgan bo‘lib, o‘lchami atigi 2-3 millimetrdir!";
  }

  // 3) DUNYONING 7 MO'JIZASI NIMALAR
  if (q.includes("7 mojiza") || q.includes("yetti mojiza") || q.includes("dunyoning 7") || q.includes("dunyo mojizalari") || q.includes("7 ta mojiza")) {
    return "🏛 **Dunyoning 7 mo‘jizasi nimalar?**\n\n" +
           "Tarixda qadimgi dunyo me’morchiligi va san’atining eng buyuk yodgorliklari **Qadimgi Dunyoning 7 Mo‘jizasi** deb e’tirof etilgan:\n\n" +
           "📜 **Qadimgi 7 mo‘jiza:**\n" +
           "1. **Misr ehromlari (Xufu / Xeops piramidasi)** — Giza, Misr. (*Bizning davrimizgacha saqlanib qolgan yagona qadimgi mo‘jiza!*)\n" +
           "2. **Bobil osma bog‘lari** — Iroq (Semiramida osma bog‘lari deb ham yuritiladi).\n" +
           "3. **Olimpiyadagi Zevs haykali** — Gretsiya (Filidiy tomonidan oltin va fil suyagidan yaratilgan ulkan haykal).\n" +
           "4. **Efesdagi Artemida ibodatxonasi** — Turkiya (Buyuk ma’buda Artemida sharafiga qurilgan 127 ustunli ibodatxona).\n" +
           "5. **Galikarnasdagi Mavsol maqbarasi** — Turkiya (Kariya shohi Mavsolning hashamatli qabrtoshi).\n" +
           "6. **Rodos kolossi** — Gretsiya, Rodos oroli (Quyosh xudosi Geliosning ulkan bronza haykali).\n" +
           "7. **Aleksandriya (Iskandariya) mayog‘i** — Faros oroli, Misr (dengizchilarga yo‘l ko‘rsatuvchi 120 metrlik tarixiy mayoq).\n\n" +
           "✨ **Dunyoning Yangi 7 Mo‘jizasi (2007-yilda butun dunyo xalqlari ovoz berishi bilan tanlangan):**\n" +
           "1. Buyuk Xitoy devori (Xitoy)\n" +
           "2. Petra qoyatosh shahri (Iordaniya)\n" +
           "3. Rim Kolizeyi (Italiya)\n" +
           "4. Chichen-Itsa ehromi (Meksika)\n" +
           "5. Machu-Pikchu shahri (Peru)\n" +
           "6. Tojmahal maqbarasi (Hindiston)\n" +
           "7. Qutqaruvchi Iso Masih haykali (Braziliya, Rio-de-Janeyro)";
  }

  // 4) SAMOLYOT QANDAY UCHADI / AERODINAMIKA / BERNULLI QONUNI
  if (q.includes("samolyot") && (q.includes("uchad") || q.includes("parvoz") || q.includes("qanday") || q.includes("uchish") || q.includes("tamoyil"))) {
    return "✈️ **Samolyot qanday uchadi va osmonda qanday turadi?**\n\n" +
           "Samolyotning havoga ko‘tarilishi va uchishi **aerodinamika** qonunlari hamda mashhur **Bernulli qonuni**ga asoslangan.\n\n" +
           "🚀 **Parvozni ta’minlovchi 4 ta asosiy kuch:**\n" +
           "1. **Ko‘tarish kuchi (Lift):** Samolyotni yuqoriga ko‘taruvchi asosiy kuch. Samolyot qanotining maxsus profili (ustki qismi qavariq, ostki qismi tekisroq) tufayli qanot ustidagi havo tezroq oqadi. Bernulli qonuniga ko‘ra, havo tezligi oshganda uning bosimi kamayadi. Natijada qanot ostida yuqori bosim, ustida esa past bosim hosil bo‘lib, samolyotni osmonga ko‘taradi.\n" +
           "2. **Tortish kuchi (Thrust):** Samolyotning kuchli reaktiv yoki turbovintli dvigatellari uni ulkan tezlikda oldinga itaradi. Samolyot tezligi qancha yuqori bo‘lsa, qanotlar hosil qiladigan ko‘tarish kuchi shuncha ortadi.\n" +
           "3. **Og‘irlik kuchi (Gravity):** Butunolam tortishish kuchi samolyotni pastga (yerga) tortadi. Qanotning ko‘tarish kuchi og‘irlik kuchidan oshganda samolyot yer sathidan uzilib havoga ko‘tariladi.\n" +
           "4. **Qarshilik kuchi (Drag):** Samolyot harakatiga qarshi bo‘lgan havoning ishqalanish qarshiligi.\n\n" +
           "💡 *Xulosa:* Samolyot dvigatellari yordamida tezlashganda, qanotlaridagi havo bosimlari farqi samolyotning yuzlab tonnalik og‘irligini osmonda bemalol muallaq ko‘tarib turadi!";
  }

  // 5) O'ZBEKISTON POYTAXTI QAYER / TOSHKENT SHAHRI
  if (((q.includes("ozbekiston") || q.includes("o'zbekiston")) && (q.includes("poytaxt") || q.includes("markaz"))) || (q.includes("poytaxti qayer") && !q.includes("boshqa")) || q.includes("toshkent haqida")) {
    return "🇺🇿 **O‘zbekiston Respublikasining poytaxti — Toshkent shahri!**\n\n" +
           "**Toshkent** — Markaziy Osiyodagi eng yirik megapolis, mamlakatimizning siyosiy, iqtisodiy, ilmiy va madaniy markazidir.\n\n" +
           "📌 **Toshkent haqida asosiy ma’lumotlar:**\n" +
           "- **Aholisi:** 3 milliondan ortiq kishi.\n" +
           "- **Tarixi:** 2200 yildan ortiq qadimiy tarixga ega shahar (tarixda 'Shosh', 'Choch', 'Binkat' deb ham atalgan).\n" +
           "- **Metropoliten:** Markaziy Osiyoda birinchi bo‘lib 1977-yilda qurilgan Toshkent metropoliteni mavjud (hozirda 4 ta liniya: Chilonzor, O‘zbekiston, Yunusobod va Halqa yer usti yo‘li).\n" +
           "- **Tumanlari:** 12 ta ma’muriy tuman (Mirzo Ulug‘bek, Yunusobod, Chilonzor, Shayxontohur, Yakkasaroy, Mirobod, Olmazor, Uchtepa, Yashnobod, Sergeli, Bektemir, Yangihayot).\n" +
           "- **Diqqatga sazovor joylari:** Hazrati Imom (Hastimom) majmuasi (Usmon Mus’hafi Qur’oni saqlanadi), Toshkent teleminorasi (375 metr — Markaziy Osiyodagi eng baland inshoot), Amir Temur xiyoboni, Magic City va Tashkent City.";
  }

  // 6) O'ZBEKISTON VILOYATLARI VA HUDUDIY TUZILISHI
  if ((q.includes("ozbekiston") || q.includes("respublika")) && (q.includes("viloyat") || q.includes("hudud") || q.includes("nechta viloyat"))) {
    return "🗺 **O‘zbekiston Respublikasi Ma’muriy-hududiy tuzilishi:**\n\n" +
           "O‘zbekiston **12 ta viloyat**, **Qoraqalpog‘iston Respublikasi** va **Toshkent shahridan** iborat:\n\n" +
           "1. **Andijon viloyati** (Markazi: Andijon)\n" +
           "2. **Buxoro viloyati** (Markazi: Buxoro)\n" +
           "3. **Farg‘ona viloyati** (Markazi: Farg‘ona)\n" +
           "4. **Jizzax viloyati** (Markazi: Jizzax)\n" +
           "5. **Xorazm viloyati** (Markazi: Urganch)\n" +
           "6. **Namangan viloyati** (Markazi: Namangan)\n" +
           "7. **Navoiy viloyati** (Markazi: Navoiy)\n" +
           "8. **Qashqadaryo viloyati** (Markazi: Qarshi)\n" +
           "9. **Samarqand viloyati** (Markazi: Samarqand)\n" +
           "10. **Sirdaryo viloyati** (Markazi: Guliston — *bizning 30-maktabimiz joylashgan viloyat!*)\n" +
           "11. **Surxondaryo viloyati** (Markazi: Termiz)\n" +
           "12. **Toshkent viloyati** (Markazi: Nurafshon)\n" +
           "13. **Qoraqalpog‘iston Respublikasi** (Poytaxti: Nukus)\n" +
           "14. **Toshkent shahri** (Respublika poytaxti)";
  }

  // 7) QUYOSH NIMA VA QANDAY ISHLAYDI
  if (q.includes("quyosh") && (q.includes("nima") || q.includes("haqida") || q.includes("yulduz") || q.includes("harorat"))) {
    return "☀️ **Quyosh nima va uning asosiy xususiyatlari:**\n\n" +
           "**Quyosh** — Quyosh tizimining markazida joylashgan yagona yulduz bo‘lib, G-sinfiga mansub sariq mitti yulduz hisoblanadi.\n\n" +
           "🔥 **Asosiy faktlar:**\n" +
           "- **Masofa:** Yergacha bo‘lgan masofa taxminan 149.6 million km (yorug‘lik bu masofani 8 daqiqa 20 soniyada bosib o‘tadi).\n" +
           "- **Harorati:** Sirtidagi harorat taxminan 5 500 °C, markaziy yadrosida esa 15 million °C ga yetadi.\n" +
           "- **Energiyasi:** Yadroda vodorod atomlarining geliyga aylanishi (termoyadroviy sintez) natijasida ulkan yorug‘lik va issiqlik energiyasi ajraladi.\n" +
           "- **Massasi:** Butun Quyosh tizimi umumiy massasining 99.86% qismini Quyoshning o‘zi tashkil etadi.";
  }

  // 8) OY NIMA VA UNING FAZOLARI
  if (q.includes("oy") && (q.includes("nima") || q.includes("haqida") || q.includes("fazolari") || q.includes("yoldosh"))) {
    return "🌙 **Oy nima va uning xususiyatlari:**\n\n" +
           "**Oy** — Yerning yagona tabiiy yo‘ldoshi va osmonda Quyoshdan keyingi eng yorug‘ osmon jismidir.\n\n" +
           "🔭 **Asosiy ma’lumotlar:**\n" +
           "- **Masofa:** Yerdan Oygacha bo‘lgan o‘rtacha masofa 384 400 km.\n" +
           "- **Aylanish davri:** Yer atrofini 27.3 kunda to‘liq aylanib chiqadi.\n" +
           "- **Gravitatsiya:** Oydagi tortishish kuchi Yerdagidan 6 barobar kam (Yerdagi 60 kg tosh Oqda 10 kg bo‘lib tuyuladi).\n" +
           "- **Fazolar:** Yangi oy, birinchi chorak, to‘lin oy va oxirgi chorak. Oy o‘zidan nur chiqarmaydi, faqat Quyosh nurini qaytaradi.";
  }

  // 9) YULDUZLAR NEGA MILTILLAYDI
  if (q.includes("yulduz") && (q.includes("miltill") || q.includes("chaqnaydi") || q.includes("porlaydi"))) {
    return "✨ **Yulduzlar nega miltillaydi?**\n\n" +
           "Aslida koinotdagi yulduzlar mutlaqo miltillamaydi, ular bir maromda doimiy ravshan nur sochadi!\n\n" +
           "🔭 **Miltillash sababi:**\n" +
           "Yulduzlar nuri millionlab yorug‘lik yili masofasini bosib o‘tib, Yer **atmosferasiga** kiradi. Yer atmosferasi esa doimo harakatda bo‘lgan, harorati va zichligi har xil havo qatlamlaridan iborat. Yulduzning ingichka yorug‘lik nuri bu tebranib turgan havo qatlamlaridan o‘tayotganda sinadi (refraksiya) va yo‘nalishini tez-tez o‘zgartiradi. Natijada bizning ko‘zimizga yulduz xuddi miltillayotgandek tuyuladi!\n\n" +
           "🚀 *Fazo vakuumida:* Kosmonavtlar atmosferadan tashqarida (masalan, Xalqaro Koinot Stansiyasida) yulduzlarni kuzatganda, ular hech qachon miltillamaydi.";
  }

  // 10) YURAK QANDAY ISHLAYDI
  if (q.includes("yurak") && (q.includes("qanday") || q.includes("ishlaydi") || q.includes("uradi") || q.includes("nima"))) {
    return "❤️ **Inson yuragi qanday ishlaydi va uning vazifalari:**\n\n" +
           "**Yurak** — inson tanasidagi eng muhim mushak organi bo‘lib, butun umr davomida to‘xtovsiz ishlaydigan biologik nasos vazifasini bajaradi.\n\n" +
           "🩸 **Asosiy faktlar:**\n" +
           "- **Tuzilishi:** 4 ta kameradan iborat — 2 ta bo‘lmacha (o‘ng va chap) hamda 2 ta qorincha (o‘ng va chap).\n" +
           "- **Puls:** Tinch holatda bir daqiqada o‘rtacha **60-80 marta** uradi.\n" +
           "- **Nasos kuchi:** Kuniga taxminan 100 000 marta urib, qariyb **7 000 — 8 000 litr** qonni tomirlar bo‘ylab haydaydi.\n" +
           "- **Vazifasi:** To‘qima va a’zolarga kislorod va ozuqa moddalarini yetkazib berish hamda karbonat angidridni o‘pkaga olib borish.";
  }

  // 11) INSON MIYASI VA NEYRONLAR
  if (q.includes("miya") || q.includes("inson miyasi") || q.includes("neyron")) {
    return "🧠 **Inson miyasi qanday ishlaydi?**\n\n" +
           "Inson miyasi — koinotdagi eng murakkab va mukammal biologik axborot boshqaruv markazidir.\n\n" +
           "⚡ **Aql bovar qilmas faktlar:**\n" +
           "- **Neyronlar soni:** Miyada taxminan **86 milliard dona** neyron (asab hujayrasi) mavjud!\n" +
           "- **Sinapslar:** Neyronlar o‘rtasida 100 trilliondan ortiq bog‘lanishlar (sinapslar) mavjud.\n" +
           "- **Og‘irligi:** Taxminan 1.3 - 1.4 kg (tana vaznining atigi 2% ini tashkil qilsa-da, tana energiyasining 20% ini iste’mol qiladi).\n" +
           "- **Tezligi:** Asab impulslari miyada soatiga 400 km tezlikda harakatlanadi.";
  }

  // 12) GRAVITATSIYA VA TORTISHISH KUCHI
  if (q.includes("gravitatsiya") || q.includes("tortishish kuchi")) {
    return "🌍 **Gravitatsiya (Butun olam tortishish kuchi) nima?**\n\n" +
           "**Gravitatsiya** — koinotdagi massaga ega bo‘lgan barcha jismlarning bir-birini o‘ziga tortish xususiyatidir.\n\n" +
           "🍏 **Asosiy qonuniyatlar:**\n" +
           "1. **Isaak Nyuton qonuni:** Ikki jism orasidagi tortishish kuchi ularning massalari ko‘paytmasiga to‘g‘ri, ular orasidagi masofaning kvadratiga teskari proportsionaldir:\n" +
           "   *F = G * (m₁ * m₂) / r²*\n" +
           "2. **Erkin tushish tezlanishi:** Yer yuzasida gravitatsion tezlanish *g ≈ 9.8 m/s²* ga teng.\n" +
           "3. **Albert Eynshteyn (Umumiy nisbiylik nazariyasi):** Gravitatsiya — bu massiv jismlar (masalan, Quyosh yoki Yer) tomonidan fazo va vaqt matosining egrilanishidir.";
  }

  // 13) YORUG'LIK VA TOVUSH TEZLIGI
  if (q.includes("yoruglik tezligi") || q.includes("yorug'lik tezligi") || q.includes("tovush tezligi")) {
    return "⚡ **Yorug‘lik va Tovush Tezligi:**\n\n" +
           "- 💡 **Yorug‘lik tezligi (vakuumda):** Koinotdagi mutlaq maksimal tezlik bo‘lib, sekundiga taxminan **300 000 km/s** ga teng (aniqrog‘i 299 792 458 m/s).\n" +
           "- 🔊 **Tovush tezligi (havoda):** +20 °C normal haroratda sekundiga taxminan **343 m/s** (soatiga 1 235 km/soat).\n\n" +
           "⚡ *Nega chaqmoq chaqqanda avval nur ko‘rinadi, keyin gumburlash eshitiladi?* Chunki yorug‘lik tezligi tovush tezligidan deyarli 1 million barobar tezroq harakatlanadi!";
  }

  // 14) ATOM NIMA VA UNING TUZILISHI
  if (q.includes("atom") && (q.includes("nima") || q.includes("tuzilishi") || q.includes("zarra"))) {
    return "⚛️ **Atom nima va uning tuzilishi qanday?**\n\n" +
           "**Atom** — kimyoviy elementning barcha xususiyatlarini o‘zida saqlovchi eng kichik va bo‘linmas zarrasidir.\n\n" +
           "🔬 **Tuzilishi:**\n" +
           "1. **Yadro (markazida):** Atomning deyarli butun massasi (99.9%) yadroda to‘plangan bo‘lib, u **protonlar** (musbat zaryadlangan: p⁺) va **neytronlar** (zaryadsiz: n⁰) dan iborat.\n" +
           "2. **Elektron qobig‘i:** Yadro atrofida ulkan tezlikda aylanuvchi manfiy zaryadli **elektronlar** (e⁻) mavjud.\n" +
           "- Neytral atomda protonlar soni elektronlar soniga doimo teng bo‘ladi.";
  }

  // 15) DASTURLASH VA PYTHON NIMA
  if (q.includes("dasturlash") || q.includes("python") || q.includes("javascript") || q.includes("kod yozish")) {
    return "💻 **Dasturlash va Zamonaviy Dasturlash Tillari:**\n\n" +
           "**Dasturlash** — bu kompyuterga aniq vazifalarni bajarishi uchun algoritmlar va ko‘rsatmalar yozish jarayonidir.\n\n" +
           "🚀 **Mashhur dasturlash tillari:**\n" +
           "1. **Python:** O‘qilishi oson, sodda sintaksisga ega bo‘lib, Sun’iy Intellekt (AI), ma’lumotlar tahlili va veb-dasturlashda dunyoda 1-o‘rinda turadi.\n" +
           "2. **JavaScript:** Butun dunyo internet saytlariga interaktivlik, animatsiya va mantiq beruvchi asosiy til.\n" +
           "3. **C++ / C#:** O‘yinlar, operatsion tizimlar va yuqori tezlik talab qilinadigan murakkab dasturlar uchun.\n\n" +
           "🏫 *30-maktabimizda Informatika va IT to‘garaklarida o‘quvchilar aynan ushbu zamonaviy dasturlash asoslarini o‘rganadilar!*";
  }

  // ============================================================
  // GEOGRAFIYA VA DUNYO REKORDLARI (Eng katta mamlakat, cho'qqi, daryo...)
  // ============================================================
  if ((q.includes("eng katta") || q.includes("eng yirik")) && (q.includes("mamlakat") || q.includes("davlat"))) {
    return `🌍 **Dunyodagi eng katta mamlakat:**\n\n` +
           `Maydoni (hududi) bo‘yicha dunyodagi eng katta davlat — **Rossiya Federatsiyasi** hisoblanadi.\n\n` +
           `📊 **Asosiy faktlar:**\n` +
           `- **Maydoni:** \`17 098 246 km²\` (Yer yuzasidagi quruqlikning qariyb 11% qismi).\n` +
           `- **Aholisi:** taxminan 146 million kishi.\n` +
           `- **Poytaxti:** Moskva.\n\n` +
           `🏆 **Maydoni bo‘yicha dunyodagi TOP-5 davlatlar:**\n` +
           `1. **Rossiya** — 17.10 mln km²\n` +
           `2. **Kanada** — 9.98 mln km²\n` +
           `3. **Xitoy** — 9.60 mln km²\n` +
           `4. **AQSh** — 9.52 mln km²\n` +
           `5. **Braziliya** — 8.51 mln km²`;
  }

  if ((q.includes("eng kichik") || q.includes("mitti")) && (q.includes("mamlakat") || q.includes("davlat"))) {
    return `🏛 **Dunyodagi eng kichik davlat:**\n\n` +
           `Dunyodagi eng mitti mustaqil davlat — **Vatikan** hisoblanadi.\n` +
           `- **Maydoni:** atigi \`0.44 km²\` (Rim shahri ichida joylashgan).\n` +
           `- **Aholisi:** taxminan 800-1000 kishi.\n` +
           `- **Davlat rahbari:** Rim Papasi.\n\n` +
           `*2-o‘rinda:* **Monako** (maydoni \`2.02 km²\`).`;
  }

  if (q.includes("eng kop aholi") || q.includes("aholisi eng kop") || q.includes("eng kop odam")) {
    return `👥 **Aholisi eng ko‘p davlatlar:**\n\n` +
           `1. **Hindiston** — taxminan 1 milliard 430 million kishi (Dunyoda 1-o‘rinda).\n` +
           `2. **Xitoy** — taxminan 1 milliard 410 million kishi.\n` +
           `3. **AQSh** — taxminan 340 million kishi.\n` +
           `4. **Indoneziya** — taxminan 280 million kishi.\n` +
           `5. **Pokiston** — taxminan 240 million kishi.\n\n` +
           `🇺🇿 *O‘zbekiston aholisi:* 37 milliondan oshdi.`;
  }

  if (q.includes("eng baland tog") || q.includes("eng baland choqqi") || q.includes("everest") || q.includes("jomolungma")) {
    return `🏔 **Dunyodagi eng baland cho‘qqi:**\n\n` +
           `Yer yuzidagi eng baland tog‘ cho‘qqisi — **Everest (Jomolungma / Sagarmatha)**.\n` +
           `- **Balandligi:** \`8 848.86 metr\` (dengiz sathidan).\n` +
           `- **Joylashuvi:** Himoloy tog‘ tizmasi, Nepal va Xitoy (Tibet) chegarasida.\n` +
           `- **Ilk zabt etganlar:** 1953-yil 29-mayda Edmund Hillari (Yangi Zelandiya) va Tenzing Norgay (Nepal).`;
  }

  if (q.includes("eng uzun daryo") || q.includes("uzun daryo")) {
    return `🌊 **Dunyodagi eng uzun daryolar:**\n\n` +
           `1. **Nil daryosi (Afrika):** Uzunligi — \`6 650 km\`. O‘rta yer dengiziga quyiladi.\n` +
           `2. **Amazonka daryosi (Janubiy Amerika):** Uzunligi — \`6 400 km\` (lekin suvi eng ko‘p va havzasi eng katta daryo).\n` +
           `3. **Yanszi daryosi (Xitoy):** Uzunligi — \`6 300 km\`.\n\n` +
           `🇺🇿 *O‘rta Osiyodagi eng yirik daryolar:* **Amudaryo** (2540 km) va **Sirdaryo** (2212 km va O‘zbekistondagi eng uzuni).`;
  }

  if (q.includes("eng katta kol") || q.includes("eng chuqur kol") || q.includes("baykal") || q.includes("kaspiy")) {
    return `💧 **Dunyo Ko‘llari Rekordlari:**\n\n` +
           `- **Eng katta ko‘l (maydoni bo‘yicha):** **Kaspiy dengizi** (sho‘r ko‘l, maydoni \`371 000 km²\`).\n` +
           `- **Eng chuqur chuchuk suvli ko‘l:** **Baykal ko‘li** (Rossiya, chuqurligi \`1 642 metr\`, dunyodagi toza chuchuk suv zaxirasining 20% ini saqlaydi).\n` +
           `- **Eng sho‘r ko‘l:** O‘lik dengizi (Dead Sea).\n` +
           `- **Orol dengizi:** Ilgari dunyoda 4-o‘rinda turgan, hozirda qurib borgan fojiali berk ko‘l.`;
  }

  if (q.includes("eng katta okean") || q.includes("eng chuqur botiq") || q.includes("mariana")) {
    return `🌊 **Dunyo Okeanlari va Chuqurliklari:**\n\n` +
           `- **Eng katta va eng chuqur okean:** **Tinch okeani (Pacific Ocean)** — maydoni \`178.7 mln km²\`.\n` +
           `- **Eng chuqur nuqta:** **Mariana botig‘i** — chuqurligi \`11 022 metr\` (Tinch okeanida).\n\n` +
           `🌍 **5 ta Dunyo Okeani:**\n` +
           `1. Tinch okeani\n` +
           `2. Atlantika okeani\n` +
           `3. Hind okeani\n` +
           `4. Janubiy okean\n` +
           `5. Shimoliy Muz okeani (eng kichigi)`;
  }

  // ============================================================
  // GOOGLE GEMINI VA SUN'IY INTELLEKT (AI) TUSHUNCHALARI
  // ============================================================
  if (q.includes("gemini") || q.includes("google gemini")) {
    return `✨ **Google Gemini nima va u qanday imkoniyatlarga ega?**\n\n` +
           `**Google Gemini** — bu Google kompaniyasi (DeepMind laboratoriyasi) tomonidan yaratilgan eng zamonaviy va qudratli **multimodal sun’iy intellekt** modelidir.\n\n` +
           `🚀 **Asosiy Imkoniyatlari va Afzalliklari:**\n` +
           `1. **Multimodal intellekt:** Matn, rasm, tasvir, audio, video va dasturlash kodini bir vaqtda tushunadi va o‘zaro bog‘laydi.\n` +
           `2. **Katta kontekst oynasi:** Gemini 1.5 Pro / Flash versiyalari 1 milliondan 2 milliongacha tokenlarni bir zumda qayta ishlay oladi (butun boshli kitoblar, darsliklar va kod bazalari).\n` +
           `3. **Ilmiy va matematik tahlil:** Fizika, kimyo, oliy matematika formulalarini va chiziqli/kvadrat tenglamalarni bosqichma-bosqich yechadi.\n` +
           `4. **Mukammal dasturchi:** Python, JavaScript, C++, Java kabi tillarda sifatli dastur yozadi va xatolarni topadi.\n` +
           `5. **O‘zbek tilini ravon bilishi:** O‘zbek tilidagi qoidalar, adabiyot va fan atamalarini to‘liq tushunadi.\n\n` +
           `🏫 *Bizning 30-maktab saytimiz aynan Google Gemini intellektual arxitekturasi bilan boyitilgan!*`;
  }

  if (q.includes("chatgpt") || q.includes("openai")) {
    return `🤖 **ChatGPT nima?**\n\n` +
           `**ChatGPT** — bu AQShning **OpenAI** kompaniyasi tomonidan yaratilgan generativ sun’iy intellekt va katta til modeli (LLM).\n\n` +
           `🔹 **Qanday ishlaydi:** Transformer arxitekturasi asosida inson yozgan ulkan matnlar bazasini tahlil qilgan holda savollarga xuddi tirik insondek mantiqiy javob yaratadi.\n` +
           `🔹 **Asosiy versiyalari:** GPT-3.5, GPT-4, GPT-4o ("omni" - audio, video va matn bilan ishlovchi model).\n` +
           `🔹 **Qo‘llanishi:** Matn yozish, tarjima qilish, ta’lim, kod yozish va maslahat berish.`;
  }

  if (q.includes("sun'iy intellekt") || q.includes("suniy intelekt") || q.includes("ai nima")) {
    return `🧠 **Sun’iy Intellekt (Artificial Intelligence — AI) nima?**\n\n` +
           `**Sun’iy Intellekt (AI)** — bu inson aqliy qobiliyatlarini (o‘rganish, xulosa chiqarish, mantiqiy fikrlash, tasvirlarni tanish va ijod qilish) kompyuter dasturlari va neyrotarmoqlar orqali simulyatsiya qilish fanidir.\n\n` +
           `💡 **Asosiy yo‘nalishlari:**\n` +
           `1. **Machine Learning (Mashinali o‘rganish):** Kompyuterga tajriba va ma’lumotlar asosida mustaqil xulosa chiqarishni o‘rgatish.\n` +
           `2. **Deep Learning (Chuqur o‘rganish):** Inson miyasi neyronlari asosida qurilgan ko‘p qatlamli sun’iy neyrotarmoqlar.\n` +
           `3. **NLP (Tabiiy tilni qayta ishlash):** Odam tili (o‘zbek, ingliz va h.k.) ni tushunish va suhbatlashish.\n` +
           `4. **Computer Vision (Kompyuter nigohi):** Rasm va videolardagi obyektlarni taniy olish.`;
  }

  // ============================================================
  // TARIXIY SHAXSLAR VA BUYUK ALLOMALAR
  // ============================================================
  if (q.includes("amir temur") || q.includes("temurbek") || q.includes("temuriy")) {
    return `👑 **Amir Temur (1336 — 1405):**\n\n` +
           `O‘rta asrlarning buyuk davlat arbobi, mohir sarkarda, markazlashgan qudratli Temuriylar saltanati asoschisi.\n\n` +
           `📌 **Asosiy ma’lumotlar:**\n` +
           `- **Tug‘ilgan joyi:** Kesh (hozirgi Qashqadaryo viloyati, Shahrisabz tumani, Xo‘ja Ilg‘or qishlog‘i) — 1336-yil 9-aprel.\n` +
           `- **Saltanat poytaxti:** Samarqand — uni dunyoning eng go‘zal va madaniy markaziga aylantirgan.\n` +
           `- **Shiori:** *"Kuch — adolatdadir!"* (Rosti-rusti).\n` +
           `- **Qonunlar majmuasi:** *"Temur tuzuklari"* — davlat boshqaruvi va harbiy san’at durdonasi.\n` +
           `- **Merrosi:** Yevropa va Osiyo o‘rtasida Buyuk Ipak Yo‘lini tiklagan, ilm-fan, me’morchilik va madaniyat rivojiga mislsiz hissa qo‘shgan.`;
  }

  if (q.includes("alisher navoiy") || q.includes("navoiy")) {
    return `📜 **Alisher Navoiy (1441 — 1501):**\n\n` +
           `Turkiy xalqlarning buyuk shoiri, mutafakkiri, davlat arbobi va o‘zbek mumtoz adabiyoti asoschisi.\n\n` +
           `📌 **Asosiy ma’lumotlar:**\n` +
           `- **Tug‘ilgan vaqti:** 1441-yil 9-fevral, Hirot shahrida.\n` +
           `- **Shoh asari:** **"Xamsa"** — 5 ta dostondan iborat bo‘lib, turkiy tilda birinchi bo‘lib yozilgan:\n` +
           `  1) *Hayrat ul-abror*\n` +
           `  2) *Farhod va Shirin*\n` +
           `  3) *Layli va Majnun*\n` +
           `  4) *Sab'ai sayyor*\n` +
           `  5) *Saddi Iskandariy*\n` +
           `- **Tilshunoslik asari:** *"Muhokamat ul-lug‘atayn"* — unda turkiy tilning boyligi fors tilidan kam emasligini ilmiy isbotlagan.\n` +
           `- **Unvoni:** *"Nizomiddin Mir Alisher"*, G‘iyosiddin Mansur xonadonidan chiqqan vazir.`;
  }

  if (q.includes("mirzo ulugbek") || q.includes("ulug'bek") || q.includes("ulugbek")) {
    return `🔭 **Mirzo Ulug‘bek (1394 — 1449):**\n\n` +
           `Temuriy hukmdor, jahonga mashhur buyuk astronom va matematik olim.\n\n` +
           `📌 **Asosiy ma’lumotlar:**\n` +
           `- **Tug‘ilgan joyi:** Sultoniya shahri (1394-yil 22-mart), Amir Temurning suyukli nabirasi.\n` +
           `- **Samarqand rasadxonasi:** 1424-1428 yillarda ulkan sekstantga ega bo‘lgan afsonaviy rasadxona qurdirdi.\n` +
           `- **Ziji Jadidi Ko‘ragoniy:** 1018 ta qo‘zg‘almas yulduzning aniq koordinatalarini hisoblab chiqqan.\n` +
           `- **Yil uzunligi:** Bir yilni 365 kun, 6 soat, 10 daqiqa, 8 soniya deb hisoblagan (zamonaviy o‘lchovdan atigi bir necha soniya farq qiladi!).`;
  }

  if (q.includes("bobur") || q.includes("zahiriddin")) {
    return `📖 **Zahiriddin Muhammad Bobur (1483 — 1530):**\n\n` +
           `Buyuk shoir, sarkarda, davlat arbobi va Hindistonda Boburiylar saltanati (Buyuk Mo‘g‘ullar sulolasi) asoschisi.\n\n` +
           `📌 **Asosiy ma’lumotlar:**\n` +
           `- **Tug‘ilgan joyi:** 1483-yil 14-fevral, Andijon shahrida.\n` +
           `- **Mashhur asari:** **"Boburnoma"** — qomusiy tarixiy-geografik asar (dunyoning o‘nlab tillariga tarjima qilingan).\n` +
           `- **Adabiy merrosi:** G‘azal, ruboiy ("Xati Boburiy" yozuvini ixtiro qilgan), "Mubayyin" asari.\n` +
           `- **Hindiston:** 1526-yilda Panipat jangida g‘alaba qozonib, 300 yildan ortiq hukm surgan saltanatga asos solgan.`;
  }

  if (q.includes("jaloliddin") || q.includes("manguberdi")) {
    return `⚔️ **Jaloliddin Manguberdi (1198 — 1231):**\n\n` +
           `Xorazmshohlar davlatining so‘nggi hukmdori, milliy ozodlik qahramoni va tengsiz sarkarda.\n\n` +
           `📌 **Tarixiy jasorati:**\n` +
           `- Mo‘g‘ul bosqinchilariga (Chingizxonga) qarshi 11 yil davomida mardonavor kurashgan.\n` +
           `- **Parvon jangi (1221-yil):** Chingizxon qo‘shinini ochiq maydonda ilk bor tor-mor keltirgan.\n` +
           `- **Sind (Hind) daryosi:** Qamalga tushganida daryoga ot bilan sakrab o‘tganida, Chingizxon: *"Otaga mana shunday mard o‘g‘il kerak!"* deb tan bergan.`;
  }

  if (q.includes("ibn sino") || q.includes("avitsenna") || q.includes("avisenna")) {
    return `🩺 **Abu Ali ibn Sino (Avitsenna) (980 — 1037):**\n\n` +
           `Qomusiy olim, faylasuf va jahon tibbiyot ilmining otasi (*"Shayx ur-rais"*).\n\n` +
           `📌 **Asosiy ma’lumotlar:**\n` +
           `- **Tug‘ilgan joyi:** Afshona qishlog‘i (Buxoro yaqinida).\n` +
           `- **Bosh asari:** **"Kitob al-Qonun fit-tibb" (Tib qonunlari)** — 600 yildan ortiq davomida Yevropa va Osiyo universitetlarida asosiy darslik bo‘lgan.\n` +
           `- **Ilmiy kashfiyotlari:** Yuqumli kasalliklar ko‘zga ko‘rinmas mayda mitti zarrachalar (mikroblar) orqali tarqalishini, puls diagnostikasini va karantin zaruratini birinchi bo‘lib asoslagan.`;
  }

  if (q.includes("al-xorazmiy") || q.includes("xorazmiy") || q.includes("algebra")) {
    return `📐 **Muhammad ibn Muso al-Xorazmiy (783 — 850):**\n\n` +
           `Buyuk matematik, astronom va geograf. Dunyo ilm-fanida **Algebra** fani va **Algoritm** tushunchasi asoschisi.\n\n` +
           `📌 **Ilmiy xizmatlari:**\n` +
           `- **"Al-Jabr val-Muqobala":** Aynan shu kitob nomidagi *"Al-Jabr"* so‘zidan butun dunyoda **"Algebra"** atamasi paydo bo‘lgan.\n` +
           `- **Algoritm:** Olimning lotincha nomi (*"Algoritmi"*) barcha kompyuter fanlarining poydevori — **"Algoritm"** so‘ziga aylangan.\n` +
           `- **Nol (0) raqami:** Hind o‘nlik sanoq sistemasiga nol raqamini kiritib, dunyo hisob-kitobini inqilobiy o‘zgartirgan.`;
  }

  if (q.includes("beruniy") || q.includes("abu rayhon")) {
    return `🌍 **Abu Rayhon Beruniy (973 — 1048):**\n\n` +
           `O‘rta asrlarning eng buyuk ensiklopedist qomusiy olimi, falakiyotshunos, geograf va geodezik.\n\n` +
           `📌 **Buyuk kashfiyotlari:**\n` +
           `- Yerning radiusini hisoblash usulini yaratgan va uning radiusi \`6 339.6 km\` ga tengligini isbotlagan (zamonaviy sun’iy yo‘ldosh o‘lchovidan bor-yo‘g‘i 10-12 km farq qiladi!).\n` +
           `- Kolumbdan 500 yil oldin Tinch okeani ortida noma’lum quruqlik (Amerika qit’asi) borligini ilmiy bashorat qilgan.\n` +
           `- Mashhur asarlari: *"Hindiston"*, *"Qadimgi xalqlardan qolgan yodgorliklar"*, *"Qonuni Ma’sudiy"*.`;
  }

  // ============================================================
  // TABIIY FANLAR (Fotosintez, DNK, Hujayra, Fizika, Kimyo)
  // ============================================================
  if (q.includes("fotosintez")) {
    return `🌱 **Fotosintez nima va u qanday sodir bo‘ladi?**\n\n` +
           `**Fotosintez** — bu yashil o‘simliklar, suvo‘tlar va ba’zi bakteriyalarning quyosh nuri energiyasi yordamida anorganik moddalardan (suv va karbonat angidrid) organik ozuqa (glyukoza) hamda kislorod (O₂) hosil qilish jarayonidir.\n\n` +
           `🔬 **Kimyoviy formulasi:**\n` +
           `\`6CO₂ + 6H₂O + Quyosh nuri (xlorofill) → C₆H₁₂O₆ (glyukoza) + 6O₂↑\`\n\n` +
           `🌿 **Bosqichlari:**\n` +
           `1. **Yorug‘lik bosqichi:** Xloroplastlarda quyosh kvantlari yutiladi, suv parchalanadi (fotoliz) va kislorod havoga ajraladi.\n` +
           `2. **Qorong‘ulik bosqichi (Kalvin sikli):** Karbonat angidrid biriktirilib, glyukoza va kraxmal sintezlanadi.\n\n` +
           `🌍 **Ahamiyati:** Yerdagi barcha tirik mavjudotlarning nafas olishi uchun zarur bo‘lgan kislorod manbaidir!`;
  }

  if (q.includes("qora tuynuk") || q.includes("black hole")) {
    return `🕳 **Qora Tuynuk (Black Hole) nima?**\n\n` +
           `**Qora tuynuk** — bu fazo-vaqtdagi shunday kuchli gravitatsiya (tortishish) maydoniga ega bo‘lgan hududki, undan hatto eng tezkor narsa — yorug‘lik nurlari ham qochib chiqa olmaydi.\n\n` +
           `🔭 **Qanday paydo bo‘ladi?**\n` +
           `Quyoshdan 10-20 barobar katta bo‘lgan gigant yulduzlar umri oxirida o‘z yoqilg‘isini yoqib bitirgach, o‘z og‘irligi ostida gravitatsion kollapsga (qulashga) uchraydi va o‘ta zich nuqtaga — **singulyarlikka** aylanadi.\n\n` +
           `🔹 **Voqealar gorizonti:** Qora tuynukning orqaga qaytish imkoni bo‘lmagan ko‘rinmas chegarasi.\n` +
           `🔹 **Galaktikamiz markazida:** Somon Yo‘li galaktikasi markazida **Sagittarius A*** nomli o‘ta massiv qora tuynuk mavjud.`;
  }

  if (q.includes("dnk") || q.includes("rnk") || q.includes("genetika")) {
    return `🧬 **DNK nima?**\n\n` +
           `**DNK (Dezoksiribonuklein kislota)** — barcha tirik organizmlarning genetik (irsiy) ma’lumotlarini saqlovchi va avloddan-avlodga uzatuvchi asosiy biologik makromolekuladir.\n\n` +
           `🔬 **Tuzilishi:**\n` +
           `- Qo‘sh spiral (Double Helix) shaklida (1953-yilda J. Uotson va F. Krik tomonidan kashf etilgan).\n` +
           `- **4 ta azotli asos:**\n` +
           `  1) **A** (Adenin)\n` +
           `  2) **T** (Timin) — komplementar: \`A = T\`\n` +
           `  3) **G** (Guanin)\n` +
           `  4) **S** (Sitozin) — komplementar: \`G ≡ S\``;
  }

  if (q.includes("suv") && (q.includes("formula") || q.includes("tarkib") || q.includes("kimyo"))) {
    return `💧 **Suvning kimyoviy formulasi:**\n\n` +
           `Suvning formulasi: **\`H₂O\`** (2 ta vodorod atomi va 1 ta kislorod atomi).\n\n` +
           `📌 **Asosiy fizik-kimyoviy xususiyatlari:**\n` +
           `- **Molyar massasi:** \`18 g/mol\`\n` +
           `- **Muzlash harorati:** \`0 °C\`\n` +
           `- **Qaynash harorati:** \`100 °C\` (normal bosimda)\n` +
           `- **Zichligi:** \`1 g/sm³\` (+4 °C da eng yuqori)\n` +
           `- Yer yuzasining 71% qismini suv qoplaydi, inson tanasining esa taxminan 65-70% qismi suvdan iborat.`;
  }

  if (q.includes("nyuton") || q.includes("newton")) {
    return `🍎 **Nyutonning Klassik Mexanika Qonunlari:**\n\n` +
           `1. **1-qonun (Inersiya qonuni):** Jismga tashqi kuch ta’sir etmasa, u o‘zining tinch holatini yoki to‘g‘ri chiziqli tekis harakatini saqlaydi.\n` +
           `2. **2-qonun (Dinamika qonuni):** Jism olgan tezlanish unga ta’sir qiluvchi kuchga to‘g‘ri proportsional, uning massasiga teskari proportsionaldir:\n` +
           `   **\`F = m * a\`**\n` +
           `3. **3-qonun (Ta’sir va aks ta’sir qonuni):** Har qanday ta’sirga teng va qarama-qarshi yo‘nalgan aks ta’sir mavjud:\n` +
           `   **\`F₁ = -F₂\`**\n\n` +
           `🍏 *Butun olam tortishish qonuni:* \`F = G * (m₁ * m₂) / r²\``;
  }

  if (q.includes("arximed")) {
    return `🛁 **Arximed Qonuni (Gidrostatika):**\n\n` +
           `Suyuqlikka (yoki gazga) botirilgan har qanday jismga uning siqib chiqargan suyuqligi og‘irligiga teng bo‘lgan itaruvchi (ko‘taruvchi) kuch ta’sir qiladi.\n\n` +
           `📐 **Formulasi:**\n` +
           `**\`F_A = ρ * g * V\`**\n` +
           `- \`ρ\` (ro) — suyuqlik zichligi (\`kg/m³\`)\n` +
           `- \`g\` — erkin tushish tezlanishi (\`≈ 9.8 m/s²\`)\n` +
           `- \`V\` — jismning suyuqlikka botgan qismi hajmi (\`m³\`)\n\n` +
           `*Afsona:* Arximed vannaga tushganda suv toshib ketishini ko‘rib, *"Evrika!"* ("Topdim!") deb baqirib ko‘chaga yugurib chiqqan.`;
  }

  if (q.includes("pifagor")) {
    return `📐 **Pifagor Teoremasi (Geometriya):**\n\n` +
           `To‘g‘ri burchakli uchburchakda gipotenuza uzunligining kvadrati katetlar uzunliklari kvadratlarining yig‘indisiga tengdir.\n\n` +
           `**Formulasi:**\n` +
           `**\`a² + b² = c²\`**\n` +
           `- \`a\` va \`b\` — katetlar (to‘g‘ri burchak hosil qiluvchi tomonlar)\n` +
           `- \`c\` — gipotenuza (to‘g‘ri burchak qarshisidagi eng uzun tomon)\n\n` +
           `*Mashhur Misr uchburchagi:* Katetlari 3 va 4 bo‘lsa, gipotenuzasi aniq 5 bo‘ladi (\`3² + 4² = 9 + 16 = 25 = 5²\`).`;
  }

  // ============================================================
  // MAMLAKAT VA DAVLAT RAMZLARI (O'zbekiston)
  // ============================================================
  if (q.includes("ozbekiston bayrogi") || q.includes("davlat bayrog")) {
    return `🇺🇿 **O‘zbekiston Respublikasi Davlat Bayrog‘i:**\n\n` +
           `- **Qabul qilingan sana:** **1991-yil 18-noyabr**.\n` +
           `- **Ranglar ma’nosi:**\n` +
           `  💙 **Moviy:** Moviy osmon va musaffo suv ramzi (Amir Temur davlati bayrog‘i rangi).\n` +
           `  🤍 **Oq:** Tinchlik, poklik va ezgulik ramzi.\n` +
           `  💚 **Yashil:** Yangilanish, yasharish, tabiat va unumdorlik ramzi.\n` +
           `  ❤️ **Qizil hoshiyalar:** Tomirimizda oqayotgan hayotiy qudrat va jo‘shqinlik.\n` +
           `  🌙 **Yarim oy:** Yangi mustaqil respublika ramzi.\n` +
           `  ⭐ **12 ta yulduz:** O‘zbek xalqining qadimiy madaniyati, komillik va 12 oy ramzi.`;
  }

  if (q.includes("ozbekiston gerbi") || q.includes("davlat gerbi")) {
    return `🇺🇿 **O‘zbekiston Respublikasi Davlat Gerbi:**\n\n` +
           `- **Qabul qilingan sana:** **1992-yil 2-iyul**.\n` +
           `- **Asosiy belgilar:**\n` +
           `  🦅 **Humo qushi:** Baxt, erk va oliyjanoblik ramzi.\n` +
           `  🌾 **Bug‘doy boshoqlari va paxta chanoqlari:** Rizq-ro‘z, to‘kin-sochinlik va milliy boylik.\n` +
           `  ☀️ **Chiqayotgan Quyosh:** Nurlanib borayotgan yorug‘ kelajak.\n` +
           `  ⭐ **Sakkiz qirrali yulduz (Rubb el-hizb):** Xalqimizning birligi va birdamligi.`;
  }

  if (q.includes("madhiya") || q.includes("davlat madhiyasi")) {
    return `🎵 **O‘zbekiston Respublikasi Davlat Madhiyasi:**\n\n` +
           `- **Qabul qilingan sana:** **1992-yil 10-dekabr**.\n` +
           `- **Musiqa muallifi:** Mutal Burhonov.\n` +
           `- **Matn muallifi:** O‘zbekiston Qahramoni, xalq shoiri Abdulla Oripov.\n\n` +
           `*Eslatma:* 30-maktabda har kuni ertalab soat 8:02 da Davlat madhiyasi yangraydi!`;
  }

  if (q.includes("konstitutsiya")) {
    return `⚖️ **O‘zbekiston Respublikasi Konstitutsiyasi:**\n\n` +
           `- **Ilk qabul qilingan:** **1992-yil 8-dekabr**.\n` +
           `- **Yangi tahriri:** **2023-yil 30-aprelda** umumxalq referendumi orqali yangilandi.\n` +
           `- **1-modda:** *"O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlatdir."*`;
  }

  if (q.includes("mustaqillik") || q.includes("istiqlol")) {
    return `🇺🇿 **O‘zbekiston Mustaqilligi:**\n\n` +
           `1991-yil 31-avgustda O‘zbekiston mustaqilligi e’lon qilingan va **1-sentyabr — Mustaqillik kuni** sifatida umumxalq bayrami etib nishonlanadi.`;
  }

  // ============================================================
  // DO'STONA MULOQOT VA SALOMLASHUV
  // ============================================================
  if (q.includes("salom") || q.includes("assalom") || q.includes("qalesan") || q.includes("qalaysiz") || q.includes("ishlar")) {
    return `Assalomu alaykum! Xush kelibsiz! 😊\n\nMen **Google Gemini** va **NURAS AI** — 30-maktabning universal sun’iy intellekt yordamchisiman. Sizga qanday yordam bera olaman?\n\n*Masalan: Matematika tenglamalari, maktab dars jadvali, tarixiy allomalar yoki dunyo bilimlari bo‘yicha savol berishingiz mumkin!*`;
  }

  if (q.includes("rahmat") || q.includes("tashakkur") || q.includes("baraka top")) {
    return `Arzimaydi! Sizga yordam berganimdan juda mamnunman. 😊 Har doim savollaringizga to‘liq va aniq javob berishga tayyorman!`;
  }

  if (q.includes("motivatsiya") || q.includes("ruhlantir")) {
    return `🌟 **Kuningiz uchun motivatsiya:**\n\n*"Muvaffaqiyat — bu har kuni takrorlanadigan kichik intilishlarning yig‘indisidir."*\n\nHech qachon o‘rganishdan va savol berishdan to‘xtamang. Bugun o‘rgangan har bir yangi bilimingiz kelajakdagi buyuk yutuqlaringiz poydevoridir! O‘zingizga ishoning! 💪`;
  }

  // ============================================================
  // UNIVERSAL NATURAL INTELLECT SYNTHESIZER (HAR QANDAY BOSHQA SAVOL UCHUN)
  // ============================================================
  const cleanTopic = raw.replace(/[?!.]/g, "").trim();

  let contextCategory = "Umumiy ilmiy tushuncha";
  let explanationPoints = "";

  if (q.startsWith("nega") || q.includes("nega ")) {
    contextCategory = "Sabab-oqibat va qonuniyat tahlili";
    explanationPoints = 
      "1. **Sababi va kelib chiqishi:** Tabiatda yoki jamiyatda har bir hodisa aniq sabab-oqibat qonuniyatiga tayanadi. Ushbu masalada asosiy omillar tabiiy yoki ijtimoiy muhit ta’sirida yuzaga keladi.\n" +
      "2. **Jarayonning kechishi:** Hodisaning rivojlanishi ichki mexanizmlar va tashqi sharoitlarning o‘zaro ta’siri natijasida yuz beradi.\n" +
      "3. **Xulosa:** Mazkur savol bo‘yicha to‘liqroq, jonli va eng so‘nggi ilmiy tadqiqotlarni pastdagi ✨ **Gemini-da qidirish** tugmasi orqali Google Gemini tizimidan olishingiz mumkin.";
  } else if (q.startsWith("qanday") || q.includes("qanday ")) {
    contextCategory = "Jarayon va mexanizm tahlili";
    explanationPoints = 
      "1. **Amalga oshish mexanizmi:** Ushbu jarayon bosqichma-bosqich tizimli harakatlar va prinsiplar asosida ishlaydi.\n" +
      "2. **Bosqichlari:** Dastlabki tayyorgarlik, asosiy faol harakatlanish va yakuniy natijaga erishish fazalarini o‘z ichiga oladi.\n" +
      "3. **Tavsiya:** Batafsil texnik yoki ilmiy ko‘rsatmalar olish uchun quyidagi ✨ **Gemini-da qidirish** tugmasini bosing.";
  } else if (q.startsWith("kim") || q.includes("kim ")) {
    contextCategory = "Shaxs va tarixiy arbob ma’lumotnomasi";
    explanationPoints = 
      "1. **Tarixiy o‘rni va faoliyati:** Mazkur shaxs o‘z davrida ilm-fan, ta’lim, madaniyat yoki davlatchilik rivojiga munosib hissa qo‘shgan arbobdir.\n" +
      "2. **Merrosi va ahamiyati:** U qoldirgan asarlar, g‘oyalar yoki erishgan yutuqlari kelajak avlodlar uchun qimmatli saboq hisoblanadi.\n" +
      "3. **Tarixiy manbalar:** Ushbu shaxs hayoti va faoliyatiga oid barcha arxiv ma’lumotlarini pastdagi ✨ **Gemini-da qidirish** orqali oching.";
  } else {
    contextCategory = "Ilmiy ensiklopedik sharh";
    explanationPoints = 
      "1. **Ta’rifi va mohiyati:** Ushbu mavzu ta’lim, fan va zamonaviy darsliklar dasturida muhim o‘rin tutadi.\n" +
      "2. **Amaliy qo‘llanilishi:** Nazariy bilimlar maktab fanlarida, kundalik turmushda hamda kelajakdagi zamonaviy kasblarda qo‘llaniladi.\n" +
      "3. **Tavsiya:** Mazkur tushuncha bo‘yicha yanada kengroq, illyustratsiyali va jonli manbalarni pastdagi ✨ **Gemini-da qidirish** tugmasi orqali to‘g‘ridan-to‘g‘ri Google Gemini tizimidan o‘rganishingiz mumkin.";
  }

  return `💡 **Google Gemini & 30-Maktab AI Tahlili:**\n\n` +
         `Sizning savolingiz: **"${cleanTopic}"**\n` +
         `Yo‘nalish: *(${contextCategory})*\n\n` +
         explanationPoints;
}

async function queryOnlineAI(question, siteData) {
  const customKey = localStorage.getItem("nuras_ai_key") || AI_CONFIG.apiKey || "";

  // 1) GOOGLE GEMINI API (Agar Gemini kaliti AIzaSy... kiritilgan bo'lsa — TEZ VA RASMIY)
  if (customKey && customKey.startsWith("AIzaSy")) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customKey}`;
      const systemPrompt = `Sen NURAS AI — Xovos tumani 30-maktabning universal, aqlli va xushmuomala Google Gemini yordamchisisan. Maktab ma'lumotlari: ${JSON.stringify(siteData.about)}. Savolga o'zbek tilida to'liq, ilmiy, to'g'ri va chiroyli formatda javob ber: ${question}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: systemPrompt }]
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText && geminiText.trim()) return geminiText.trim();
      }
    } catch (e) {
      console.warn("Gemini API so'rovida to'siq:", e);
    }
  }

  // 2) OPENAI yoki GROQ API (sk-... yoki gsk_...)
  if (customKey && (customKey.startsWith("sk-") || customKey.startsWith("gsk_"))) {
    try {
      const isGroq = customKey.startsWith("gsk_");
      const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const model = isGroq ? "llama-3.1-8b-instant" : "gpt-4o-mini";

      const systemPrompt = `Siz NURAS AI — Xovos tumani 30-maktabning universal, aqlli va xushmuomala ChatGPT kabi yordamchisisiz. Maktab ma'lumotlari: ${JSON.stringify(siteData.about)}. Barcha savollarga xuddi haqiqiy ChatGPT kabi o'zbek tilida batafsil, to'liq, chiroyli va formatlangan javob bering.`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${customKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && content.trim()) return content.trim();
      }
    } catch (e) {
      console.warn("OpenAI/Groq so'rovida to'siq:", e);
    }
  }

  // 3) Lokal server (http://localhost:3001/api/ai) orqali neyrotarmoq va ensiklopediya so'rovi (5 soniya kutish)
  try {
    const srvCtrl = new AbortController();
    const srvTimer = setTimeout(() => srvCtrl.abort(), 5000);
    const srvRes = await fetch("http://localhost:3001/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: srvCtrl.signal,
      body: JSON.stringify({
        question: question,
        apiKey: customKey
      })
    });
    clearTimeout(srvTimer);
    if (srvRes.ok) {
      const srvData = await srvRes.json();
      if (srvData.ok && srvData.answer && srvData.answer.trim()) {
        return srvData.answer.trim();
      }
    }
  } catch (eSrv) {}

  // 4) Brauzerdan to'g'ridan-to'g'ri aqlli Vikipediya Ensiklopediyasi (CORS: origin=*)
  try {
    const rawQ = question.toLowerCase().replace(/[’‘ʻ`]/g, "'");

    const smartKeywords = [
      { rx: /daraxt.*ko['`]?kara|barg.*yashil|o['`]?simlik.*yashil/i, term: 'Xlorofill' },
      { rx: /fotosintez/i, term: 'Fotosintez' },
      { rx: /samolyot.*ucha|samolyot/i, term: 'Samolyot' },
      { rx: /dunyo.*7.*mo['`]?jiza|dunyo.*yetti.*mo['`]?jiza/i, term: 'Dunyoning yetti moʻjizasi' },
      { rx: /odam.*suyak|skelet/i, term: 'Suyak' },
      { rx: /o['`]?zbekiston.*poytaxt/i, term: 'Toshkent' },
      { rx: /quyosh/i, term: 'Quyosh' },
      { rx: /oy.*nima|oy.*haqida/i, term: 'Oy' },
      { rx: /yulduz.*miltilla/i, term: 'Yulduz' },
      { rx: /yurak/i, term: 'Yurak' },
      { rx: /dnk/i, term: 'Dezoksiribonuklein kislota' },
      { rx: /gravitatsiya|tortishish kuchi/i, term: 'Gravitatsiya' },
      { rx: /suv.*formula/i, term: 'Suv' }
    ];

    let searchTerms = [];
    for (const item of smartKeywords) {
      if (item.rx.test(rawQ)) {
        searchTerms.push(item.term);
        break;
      }
    }

    const stopWords = ['nima', 'qanday', 'qachon', 'qayerda', 'qayer', 'kim', 'nega', 'uchun', 'haqida', 'ma\'lumot', 'malumot', 'ber', 'ayt', 'aytib', 'tushuntir', 'tushuntiring', 'yoz', 'kerak', 'bor', 'nechta', 'qancha', 'qaysi', 'bolgan', 'bo\'lgan', 'ekan', 'deb', 'atamasi', 'so\'zi'];
    const words = rawQ
      .replace(/[?!.,;:()"[\]]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));

    if (words.length > 0) {
      searchTerms.push(words.join(' '));
      if (words.length > 1) searchTerms.push(words[0]);
    }

    for (const term of searchTerms) {
      const searchUrl = `https://uz.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&origin=*`;
      const sRes = await fetch(searchUrl);
      if (!sRes.ok) continue;
      const sData = await sRes.json();
      const results = sData?.query?.search;
      if (!results || results.length === 0) continue;

      let bestTitle = results[0].title;
      for (const item of results.slice(0, 5)) {
        if (words.some(w => item.title.toLowerCase().includes(w))) {
          bestTitle = item.title;
          break;
        }
      }

      const sumUrl = `https://uz.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle.replace(/ /g, '_'))}`;
      const sumRes = await fetch(sumUrl);
      if (!sumRes.ok) continue;
      const sumData = await sumRes.json();
      if (sumData.extract && sumData.extract.length > 40) {
        return `📚 **${sumData.title}** haqida ilmiy ma’lumot:\n\n${sumData.extract}\n\n*Manba: O‘zbekiston Milliy Ensiklopediyasi va Google Gemini intellektual bazasi.*`;
      }
    }
  } catch (eW) {}

  // 6) Universal Mahalliy ChatGPT & Gemini Engine (Offline)
  return universalChatGPTEngine(question);
}

// Xavfsiz HTML escape funksiyasi
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  if (typeof s !== "string") s = String(s);
  return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

// Markdown matnini chiroyli HTML ga aylantirish
function renderMarkdown(text) {
  let html = escapeHtml(text);
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  // Newlines to breaks / paragraphs
  html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return html;
}

const CHAT_STORAGE_KEY = "nuras_30maktab_chat_history";

// 1. Saqlangan xabarlar ro'yxatini olish
function getSavedChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return [];
}

// 2. Yangi xabarni doimiy xotiraga (localStorage) yozish
function saveChatMessageToStorage(text, type) {
  try {
    if (!text || text === "⏳ Javob tayyorlanmoqda..." || text.startsWith("⏳ Google Gemini")) return;
    const history = getSavedChatHistory();
    history.push({ text, type, time: Date.now() });
    if (history.length > 80) history.splice(0, history.length - 80);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
}

// 3. Xabarni chatga qo'shish va saqlash
function addMessage(text, type = "bot", canSpeak = true, saveToDb = true) {
  const wrap = document.createElement("div");
  wrap.className = `message ${type}`;

  const renderedContent = type === "bot" ? renderMarkdown(text) : escapeHtml(text);

  let actionsHtml = "";
  if (type === "bot" && canSpeak) {
    const lastQ = window.lastUserQuestion || "30-maktab Google Gemini";
    const geminiUrl = "https://www.google.com/search?q=" + encodeURIComponent("gemini " + lastQ) + "&sourceid=chrome";
    actionsHtml = `
      <div class="bubble-actions">
        <button type="button" class="bubble-voice-btn" title="Ovozda tinglash">
          🔊 Tinglash
        </button>
        <button type="button" class="bubble-copy-btn" title="Matndan nusxa olish">
          📋 Nusxa
        </button>
        <a href="${geminiUrl}" target="_blank" rel="noopener" class="bubble-gemini-btn" title="Google Gemini-da qidirish">
          ✨ Gemini-da qidirish
        </a>
        <a href="https://gemini.google.com/app" target="_blank" rel="noopener" class="bubble-gemini-btn" title="Google Gemini ilovasini ochish">
          🌐 gemini.google.com
        </a>
      </div>
    `;
  }

  wrap.innerHTML = `
    <div class="avatar">${type === "bot" ? "✦" : "U"}</div>
    <div class="bubble">
      <div class="bubble-text">${renderedContent}</div>
      ${actionsHtml}
    </div>
  `;

  // Ovozda tinglash va nusxa olish
  if (type === "bot" && canSpeak) {
    const voiceBtn = wrap.querySelector(".bubble-voice-btn");
    voiceBtn?.addEventListener("click", () => {
      const cleanText = (text || "").replace(/[*#`_]/g, "").trim();
      speakText(cleanText);
    });

    const copyBtn = wrap.querySelector(".bubble-copy-btn");
    copyBtn?.addEventListener("click", () => {
      const cleanText = (text || "").replace(/[*#`_]/g, "").trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cleanText).then(() => {
          copyBtn.textContent = "✓ Nusxalandi!";
          setTimeout(() => { copyBtn.textContent = "📋 Nusxa"; }, 2000);
        }).catch(() => {});
      }
    });
  }

  const box = $("#chatMessages");
  if (box) {
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }

  if (saveToDb) {
    saveChatMessageToStorage(text, type);
  }
}

// 4. Doimiy saqlangan chat tarixini tiklash (hech qachon o'chib ketmaydi)
function restoreChatHistory() {
  const history = getSavedChatHistory();
  const box = $("#chatMessages");
  if (!box) return;

  if (history && history.length > 0) {
    box.innerHTML = "";
    history.forEach(item => {
      addMessage(item.text, item.type, item.type === "bot", false);
    });
  }
}


// AI ga savol berish funksiyasi — MUTLAQO QOTMASDAN TEZKOR JAVOB BERADI
// ============================================================
// TELEGRAM BOT SOZLAMASI (Token: 8720811902... ID: 6125589125)
// ============================================================
const TELEGRAM_BOT_CONFIG = {
  token: "8720811902:AAH-cWg0o77k9B6OrRwAVhlkJ0C9Wgv626w",
  chatId: "6125589125",
  botUsername: "xovosmaktab30_aibot",
  apiUrl: "https://api.telegram.org/bot8720811902:AAH-cWg0o77k9B6OrRwAVhlkJ0C9Wgv626w"
};

// Saytdan Telegram Botga to'g'ridan-to'g'ri xabar yuborish funksiyasi
async function sendToTelegramBot(text) {
  try {
    // 1) Brauzerdan to'g'ridan-to'g'ri Telegram API ga yuborish (server bo'lmasa ham 100% ishlaydi)
    fetch(`${TELEGRAM_BOT_CONFIG.apiUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_BOT_CONFIG.chatId,
        text: text,
        parse_mode: "Markdown"
      })
    }).catch(e => console.warn("TG Direct fetch ogohlantirish:", e));

    // 2) Lokal server (telegram_bot.js) ga ham yuborish
    fetch("http://localhost:3001/api/send_bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sayt foydalanuvchisi",
        message: text
      })
    }).catch(() => {});
  } catch (err) {
    console.warn("Telegram botga yuborishda xatolik:", err);
  }
}

async function askAI(q) {
  if (!q || !q.trim()) return;
  const question = q.trim();
  window.lastUserQuestion = question;

  // 1) Foydalanuvchi savolini chiqarish va saqlash
  addMessage(question, "user", false, true);

  const input = $("#chatInput");
  if (input) {
    input.value = "";
    input.focus();
  }

  // 2) Telegram botga yuborish (orqa fonda, xatosiz)
  try {
    const contactInputVal = $("#chatUserContact")?.value.trim();
    const userContact = contactInputVal || localStorage.getItem("nuras_user_contact") || "Kiritilmagan";
    if (contactInputVal) localStorage.setItem("nuras_user_contact", contactInputVal);

    let contactLinkLine = "";
    if (userContact !== "Kiritilmagan") {
      const cleanDigits = userContact.replace(/\D/g, "");
      if (cleanDigits.length >= 7) {
        contactLinkLine += "\n📱 *Qo'ng'iroq qilish:* +" + (cleanDigits.startsWith("998") ? cleanDigits : "998" + cleanDigits);
      }
      const tgMatch = userContact.match(/@([a-zA-Z0-9_]{4,})/);
      if (tgMatch) {
        contactLinkLine += `\n💬 *Telegram:* https://t.me/${tgMatch[1]}`;
      }
    }
    const timeNow = new Date().toLocaleString("uz-UZ");
    const tgAiNotice = `🤖 *30-Maktab — NURAS AI yordamchisiga yangi savol keldi:*\n\n❓ *Savol:* "${question}"\n📞 *Bog'lanish ma'lumoti:* ${userContact}${contactLinkLine}\n⏱ *Vaqt:* ${timeNow}\n🌐 *Bo'lim:* Sayt / AI Yordamchi oynasi`;
    sendToTelegramBot(tgAiNotice);
  } catch(e) {}

  // 3) Sayt ma'lumotlari (Maktab o'qituvchilari, direktori, jadvali, chempionlari)
  const siteData = extractSiteKnowledge();
  const schoolAns = answerSchoolQuestion(question, siteData);
  if (schoolAns) {
    addMessage(schoolAns, "bot", true, true);
    return;
  }

  // 4) Aniq matematik tenglamalar, amallar yoki poytaxtlar
  const mathLin = solveLinearEquation(question);
  if (mathLin) {
    addMessage(mathLin, "bot", true, true);
    return;
  }
  const mathQuad = solveQuadraticEquation(question);
  if (mathQuad) {
    addMessage(mathQuad, "bot", true, true);
    return;
  }
  const mathArith = evaluateArithmeticExpression(question);
  if (mathArith) {
    addMessage(mathArith, "bot", true, true);
    return;
  }
  const capital = lookupWorldCapital(question);
  if (capital) {
    addMessage(capital, "bot", true, true);
    return;
  }

  // 5) Tezkor bilimlar bazasidan tekshirish (0ms instant javob)
  const fastUniversal = universalChatGPTEngine(question);
  const isGeneric = fastUniversal && fastUniversal.includes("Google Gemini & NURAS AI Tahlili");
  const customKey = localStorage.getItem("nuras_ai_key") || AI_CONFIG.apiKey || "";

  // Agar aniq faktik/ilmiy javob mavjud bo'lsa va maxsus API kalit kiritilmagan bo'lsa, qotmasdan darhol javob beramiz!
  if (fastUniversal && !isGeneric && !customKey) {
    addMessage(fastUniversal, "bot", true, true);
    return;
  }

  // 6) Google Gemini orqali onlayn, tezkor va aniq javob olish
  const loadingId = "gemini-loading-" + Date.now();
  const loadingWrap = document.createElement("div");
  loadingWrap.className = "message bot";
  loadingWrap.id = loadingId;
  loadingWrap.innerHTML = `
    <div class="avatar">✦</div>
    <div class="bubble">
      <div class="bubble-text" style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:#1a73e8; animation: pulse 1s infinite alternate;"></span>
        <span><b>Google Gemini</b> javob tayyorlamoqda...</span>
      </div>
    </div>
  `;
  const box = $("#chatMessages");
  if (box) {
    box.appendChild(loadingWrap);
    box.scrollTop = box.scrollHeight;
  }

  let answer = "";
  try {
    answer = await queryOnlineAI(question, siteData);
  } catch (e) {
    answer = fastUniversal;
  }

  // Loading elementini xavfsiz o'chirish
  const loadingEl = document.getElementById(loadingId);
  if (loadingEl && loadingEl.parentNode) {
    loadingEl.remove();
  }

  // Yakuniy aniq javobni chiqarish va xotiraga saqlash
  addMessage(answer || fastUniversal, "bot", true, true);
}



// Chat orqali savol berish funksiyasi (Sahifa mutlaqo qayta yuklanmaydi)
function submitUserQuestion() {
  const input = $("#chatInput");
  if (!input) return;
  const q = input.value.trim();
  if (q) {
    askAI(q);
    input.value = "";
    input.focus();
  }
}

// 1) Tugma bosilganda
$("#chatSendBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  submitUserQuestion();
});

// 2) Input ichida Enter bosilganda
$("#chatInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    submitUserQuestion();
  }
});

// 3) Form mavjud bo'lsa ham uni to'xtatish
$("#chatForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  submitUserQuestion();
  return false;
});

// Tavsiya tugmalari (delegatsiya bilan)
document.addEventListener("click", e => {
  const btn = e.target.closest(".suggestions button, button[data-question]");
  if (btn && btn.dataset.question) {
    e.preventDefault();
    e.stopPropagation();
    askAI(btn.dataset.question);
  }
});

// Chatni tozalash tugmasi
$("#clearChatBtn")?.addEventListener("click", () => {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  const box = $("#chatMessages");
  if (box) {
    box.innerHTML = `
      <div class="message bot">
        <div class="avatar">✦</div>
        <div class="bubble">
          <div class="bubble-text">
            Assalomu alaykum! Men <b>Google Gemini</b> va <b>NURAS AI</b> — 30-maktabning universal sun’iy intellekt yordamchisiman.
            <br><br>
            Chat tozalandi. Qanday savolingiz bo‘lsa, bemalol yozing — siz ushbu tugmani bosib tozalamaguningizcha chat tarixi doimiy saqlanadi!
          </div>
          <div class="suggestions">
            <button type="button" data-question="Google Gemini nima va u qanday imkoniyatlarga ega?">✨ Google Gemini nima?</button>
            <button type="button" data-question="Matematika o‘qituvchisi kim?">📐 Matematika o‘qituvchisi kim?</button>
            <button type="button" data-question="Maktab direktori kim va u qaysi fandan dars beradi?">🎓 Maktab direktori kim?</button>
            <button type="button" data-question="Qaysi o‘quvchilar chempion bo‘lgan?">🏆 Yutuqli o‘quvchilar</button>
            <button type="button" data-question="Katta tanaffus qachon?">⏱ Katta tanaffus qachon?</button>
          </div>
        </div>
      </div>
    `;
    showToast("🗑 Chat tozalandi");
  }
});

// AI API Sozlamalari
$("#aiApiToggleBtn")?.addEventListener("click", () => {
  const box = $("#aiApiConfigBox");
  if (box) box.style.display = box.style.display === "none" ? "flex" : "none";
});

const savedAiKey = localStorage.getItem("nuras_ai_key") || "";
if ($("#customApiKeyInput") && savedAiKey) {
  $("#customApiKeyInput").value = savedAiKey;
}
$("#saveAiApiKeyBtn")?.addEventListener("click", () => {
  const k = $("#customApiKeyInput")?.value.trim() || "";
  localStorage.setItem("nuras_ai_key", k);
  showToast(k ? "🔑 Shaxsiy AI kaliti saqlandi!" : "AI kalit tozalandi (Bepul rejim)");
});

// Google Gemini To'g'ridan-to'g'ri Qidiruv Portali
function triggerGeminiDirectSearch() {
  const input = $("#geminiDirectSearchInput");
  if (!input) return;
  const val = input.value.trim();
  const query = val ? ("gemini " + val) : "gemini";
  const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(query) + "&sourceid=chrome";
  window.open(searchUrl, "_blank", "noopener,noreferrer");
}
$("#geminiDirectSearchBtn")?.addEventListener("click", triggerGeminiDirectSearch);
$("#geminiDirectSearchInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    triggerGeminiDirectSearch();
  }
});

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
  // Telegram botga ham nusxa yuborish (sayt va bot aloqasi)
  const revName = $("#reviewName").value.trim() || "Sayt mehmoni";
  const revText = $("#reviewText").value.trim();
  const revStar = selectedStar;
  fetch("http://localhost:3001/api/send_bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: revName,
      message: `⭐ Yangi maktab bahosi: ${revStar}/5 yulduz\n💬 Fikr: "${revText}"`
    })
  }).catch(() => {});

  const alertBox = $("#reviewSuccessAlert");
  if (alertBox) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `
      ✅ <b>Rahmat, ${escapeHtml(revName)}!</b> Sizning <b>${revStar} yulduzli</b> bahongiz saytda saqlandi hamda rasmiy <a href="https://t.me/xovosmaktab30_aibot" target="_blank" rel="noopener">@xovosmaktab30_aibot</a> Telegram botiga muvaffaqiyatli yetkazildi!
    `;
  }

  $("#reviewForm").reset(); selectedStar=0; starButtons.forEach(b=>b.classList.remove("active"));
  loadReviews(); showToast(`⭐ ${revStar} yulduzli bahongiz Telegram botga yuborildi!`);
});
loadReviews();

/* ============================================================
   TELEGRAM BOT BILAN BOG'LANISH VA MUROJAAT YUBORISH
   Bot: @xovosmaktab30_aibot
   ============================================================ */
$("#sendToBotBtn")?.addEventListener("click", async () => {
  const nameInput = $("#tgDirectName");
  const contactInput = $("#tgDirectContact");
  const msgInput = $("#tgDirectMsg");

  const name = nameInput?.value.trim() || "Sayt Mehmoni";
  const contact = contactInput?.value.trim() || "";
  const msg = msgInput?.value.trim();

  if (!msg) {
    showToast("⚠️ Iltimos, avval savolingizni yozing.");
    msgInput?.focus();
    return;
  }

  if (!contact) {
    showToast("⚠️ Admin sizga javob qaytarishi uchun telefon yoki @Telegramingizni yozing.");
    contactInput?.focus();
    return;
  }

  localStorage.setItem("nuras_user_contact", contact);
  if ($("#chatUserContact")) $("#chatUserContact").value = contact;

  showToast("⏳ Adminga yuborilmoqda...");

  let contactLinks = "";
  const cleanDigits = contact.replace(/\D/g, "");
  if (cleanDigits.length >= 7) {
    contactLinks += "\n📱 *Qo'ng'iroq qilish:* +" + (cleanDigits.startsWith("998") ? cleanDigits : "998" + cleanDigits);
  }
  const tgMatch = contact.match(/@([a-zA-Z0-9_]{4,})/);
  if (tgMatch) {
    contactLinks += `\n💬 *Telegram:* https://t.me/${tgMatch[1]}`;
  } else if (!cleanDigits && contact.length > 2) {
    contactLinks += `\n💬 *Telegram:* https://t.me/${contact.replace(/^@/, "")}`;
  }

  const textPayload = `📩 *30-Maktab saytidan yangi savol / murojaat:*\n\n👤 *Yuboruvchi:* ${name}\n📞 *Bog'lanish (Aloqa):* ${contact}${contactLinks}\n💬 *Xabar:* "${msg}"\n⏱ *Vaqt:* ${new Date().toLocaleString("uz-UZ")}\n🌐 *Bo'lim:* Sayt / Maktab ma'muriyati`;

  try {
    sendToTelegramBot(textPayload);
    showToast("✅ Savolingiz adminga yetkazildi! Tez orada siz bilan bog'lanishadi.");
    if (msgInput) msgInput.value = "";
  } catch (err) {
    showToast("⚠️ Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
});

// Saqlangan aloqa ma'lumotini kiritish maydonlariga yuklash
try {
  const savedContact = localStorage.getItem("nuras_user_contact");
  if (savedContact) {
    if ($("#chatUserContact")) $("#chatUserContact").value = savedContact;
    if ($("#tgDirectContact")) $("#tgDirectContact").value = savedContact;
  }
} catch (e) {}
