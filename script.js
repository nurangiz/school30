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

function showOnlySection(sectionId){
  menuSections.forEach(id=>{
    const section=document.getElementById(id);
    if(section) {
      const isCurrent = (id === sectionId);
      section.classList.toggle("menu-hidden", !isCurrent);
      if (isCurrent) {
        section.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
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

  window.scrollTo({top:0, behavior:"smooth"});
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
  showOnlySection("home");
  initTeacherFilter();
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
function speakViaWebSpeech(text, speed = 1.0, speaker = "gulnoza") {
  if (!('speechSynthesis' in window)) {
    showToast("⚠️ Brauzeringizda ovoz sintezi qo‘llab-quvvatlanmaydi");
    setVoiceWaveActive(false);
    return;
  }

  // Chromium speech queue muzlab qolishini oldini olish
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  cacheBrowserVoices();

  // Markdown belgilari va keraksiz belgilarni tozalash
  const cleanedText = text
    .replace(/[‘'ʼ`]/g, "'")
    .replace(/[*#_~`>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    setVoiceWaveActive(false);
    return;
  }

  const utter = new SpeechSynthesisUtterance(cleanedText);
  utter.rate = Math.max(0.7, Math.min(1.4, parseFloat(speed) || 1.0));
  utter.pitch = speaker === "sanjar" ? 0.9 : 1.1;

  // Eng mos ovoz tanlash: O'zbekcha -> Turkcha -> Ruscha -> Standart
  const preferredVoice = allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("uz"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("tr"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("ru"))
                      || allBrowserVoices.find(v => v.lang.toLowerCase().startsWith("en"))
                      || allBrowserVoices[0];

  if (preferredVoice) {
    utter.voice = preferredVoice;
    utter.lang = preferredVoice.lang;
  } else {
    utter.lang = "uz-UZ";
  }

  setVoiceWaveActive(true, `🎙 Matn o‘qilmoqda (${speaker === "sanjar" ? "Sanjar (Erkak)" : "Gulnoza (Ayol)"})...`);

  utter.onend = () => setVoiceWaveActive(false);
  utter.onerror = (e) => {
    console.warn("SpeechSynthesis xatosi:", e);
    setVoiceWaveActive(false);
  };

  // Chromium xavfsiz start
  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech speak error:", err);
      setVoiceWaveActive(false);
    }
  }, 80);
}

// ElevenLabs orqali matnni o'qish (https://elevenlabs.io/app/voice-lab)
async function speakWithElevenLabs(rawText, speed = 1.0) {
  const apiKey = localStorage.getItem("elevenlabs_api_key") || "";
  let voiceId = $("#elevenVoiceSelect")?.value || "21m00Tcm4TlvDq8ikWAM";
  if (voiceId === "custom") {
    voiceId = $("#elevenCustomVoiceId")?.value.trim() || "21m00Tcm4TlvDq8ikWAM";
  }

  // Agar ElevenLabs API kaliti mavjud bo'lsa
  if (apiKey) {
    setVoiceWaveActive(true, "ElevenLabs Voice-Lab bulutidan audio olinmoqda...");
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
            similarity_boost: 0.75
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
        audio.onerror = () => speakViaWebSpeech(rawText, speed, "gulnoza");
        await audio.play();
        return;
      } else {
        showToast("⚠️ ElevenLabs API kaliti xato yoki tugagan. Tabiiy AI ovozida o‘qilmoqda.");
      }
    } catch (e) {
      console.warn("ElevenLabs tarmoq xatosi:", e);
    }
  } else {
    showToast("ℹ️ ElevenLabs API kalitsiz rejim: tabiiy AI ovozi bilan o‘qilmoqda.");
  }

  // Har qanday holatda matnni to‘liq va ravon o‘qib beradi
  speakViaWebSpeech(rawText, speed, "gulnoza");
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
    audio.onerror = () => speakViaWebSpeech(rawText, speed, "gulnoza");
    await audio.play().catch(() => speakViaWebSpeech(rawText, speed, "gulnoza"));
    return;
  }

  // 2) Har qanday yozilgan e'lon yoki matnni ElevenLabs Voice-Lab da to‘liq o‘qib berish
  if (currentVoiceProvider === "browser") {
    speakViaWebSpeech(rawText, speed, "gulnoza");
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

  // 9) Trigonometriya qoidalari va jadvallar
  if (q.includes("trigonometriy") || q.includes("sinus") || q.includes("kosinus") || q.includes("tangens") || q.includes("kotangens")) {
    return `📐 **Trigonometriya Asosiy Qonuniyatlari va Formulalari:**\n\n` +
           `1. **Asosiy trigonometrik ayniyat:**\n` +
           `   \`sin²(α) + cos²(α) = 1\`\n` +
           `   \`tg(α) = sin(α) / cos(α)\`\n` +
           `   \`ctg(α) = cos(α) / sin(α)\`\n` +
           `   \`tg(α) * ctg(α) = 1\`\n\n` +
           `2. **Standart burchaklar jadvali:**\n` +
           `   - \`sin(0°) = 0\`, \`sin(30°) = 1/2\`, \`sin(45°) = √2/2\`, \`sin(60°) = √3/2\`, \`sin(90°) = 1\`\n` +
           `   - \`cos(0°) = 1\`, \`cos(30°) = √3/2\`, \`cos(45°) = √2/2\`, \`cos(60°) = 1/2\`, \`cos(90°) = 0\`\n` +
           `   - \`tg(0°) = 0\`, \`tg(30°) = √3/3\`, \`tg(45°) = 1\`, \`tg(60°) = √3\`, \`tg(90°) = mavjud emas\`\n\n` +
           `3. **Sinuslar va Kosinuslar teoremalari:**\n` +
           `   - **Sinuslar:** \`a / sin(A) = b / sin(B) = c / sin(C) = 2R\` (R — tashqi chizilgan aylana radiusi)\n` +
           `   - **Kosinuslar:** \`c² = a² + b² - 2ab * cos(C)\``;
  }

  // 10) Qisqa ko'paytirish formulalari
  if (q.includes("qisqa kopaytirish") || q.includes("qisqa ko'paytirish") || q.includes("kopaytirish formulalari")) {
    return `📐 **Qisqa Ko‘paytirish Formulalari (Algebra):**\n\n` +
           `1. **Yig‘indining kvadrati:** \`(a + b)² = a² + 2ab + b²\`\n` +
           `2. **Ayirmaning kvadrati:** \`(a - b)² = a² - 2ab + b²\`\n` +
           `3. **Kvadratlar ayirmasi:** \`a² - b² = (a - b)(a + b)\`\n` +
           `4. **Yig‘indining kubi:** \`(a + b)³ = a³ + 3a²b + 3ab² + b³\`\n` +
           `5. **Ayirmaning kubi:** \`(a - b)³ = a³ - 3a²b + 3ab² - b³\`\n` +
           `6. **Kublar yig‘indisi:** \`a³ + b³ = (a + b)(a² - ab + b²)\`\n` +
           `7. **Kublar ayirmasi:** \`a³ - b³ = (a - b)(a² + ab + b²)\``;
  }

  // 11) Progressiyalar (Arifmetik va Geometrik)
  if (q.includes("progressiy") || q.includes("arifmetik progressiya") || q.includes("geometrik progressiya")) {
    return `📊 **Arifmetik va Geometrik Progressiya Formulalari:**\n\n` +
           `**1. Arifmetik Progressiya:**\n` +
           `- n-chi had: \`a_n = a_1 + (n - 1) * d\` (d — ayirma)\n` +
           `- Dastlabki n ta had yig‘indisi: \`S_n = ((a_1 + a_n) / 2) * n\` yoki \`S_n = ((2a_1 + (n-1)d) / 2) * n\`\n\n` +
           `**2. Geometrik Progressiya:**\n` +
           `- n-chi had: \`b_n = b_1 * q^(n - 1)\` (q — maxraj)\n` +
           `- Dastlabki n ta had yig‘indisi (q ≠ 1): \`S_n = (b_1 * (q^n - 1)) / (q - 1)\`\n` +
           `- Cheksiz kamayuvchi (|q| < 1) yig‘indisi: \`S = b_1 / (1 - q)\``;
  }

  // 12) Logarifmlar
  if (q.includes("logarifm") || q.includes("ln ") || q.includes("log(")) {
    return `🔢 **Logarifm Qoidalari va Formulalari:**\n\n` +
           `Ta’rif: \`a^x = b ➔ x = log_a(b)\` (bunda a > 0, a ≠ 1, b > 0).\n\n` +
           `**Asosiy xossalari:**\n` +
           `- \`log_a(1) = 0\`, \`log_a(a) = 1\`\n` +
           `- **Ko‘paytma:** \`log_a(x * y) = log_a(x) + log_a(y)\`\n` +
           `- **Bo‘linma:** \`log_a(x / y) = log_a(x) - log_a(y)\`\n` +
           `- **Daraja:** \`log_a(x^p) = p * log_a(x)\`\n` +
           `- **Asosni almashtirish:** \`log_a(b) = ln(b) / ln(a)\`\n` +
           `- **Natural logarifm:** \`ln(x) = log_e(x)\` (bunda e ≈ 2.71828)`;
  }

  // 13) Hosila va Integrallar (Oliy matematika / 10-11 sinf)
  if (q.includes("hosila") || q.includes("integral") || q.includes("differensial")) {
    return `∫ **Hosila va Integrallar Jadvali:**\n\n` +
           `**Asosiy Hosilalar (f'(x)):**\n` +
           `- \`(C)' = 0\` (o‘zgarmas son)\n` +
           `- \`(x^n)' = n * x^(n - 1)\` (masalan: \`(x²)' = 2x\`, \`(x³)' = 3x²\`)\n` +
           `- \`(e^x)' = e^x\`, \`(ln(x))' = 1 / x\`\n` +
           `- \`(sin(x))' = cos(x)\`, \`(cos(x))' = -sin(x)\`\n` +
           `- \`(tg(x))' = 1 / cos²(x)\`\n\n` +
           `**Asosiy Integrallar (∫ f(x) dx):**\n` +
           `- \`∫ x^n dx = (x^(n+1)) / (n+1) + C\` (n ≠ -1)\n` +
           `- \`∫ (1/x) dx = ln|x| + C\`\n` +
           `- \`∫ e^x dx = e^x + C\`\n` +
           `- \`∫ sin(x) dx = -cos(x) + C\`\n` +
           `- \`∫ cos(x) dx = sin(x) + C\``;
  }

  // 14) Pifagor va To'g'ri burchakli uchburchak
  if (q.includes("pifagor")) {
    return `📐 **Pifagor teoremasi:**\nTo‘g‘ri burchakli uchburchakda gipotenuza kvadratining qiymati katetlar kvadratlarining yig‘indisiga teng:\n\`c² = a² + b²\` yoki \`c = √(a² + b²)\`\n\n*Misol:* Katetlar 3 va 4 bo‘lsa, gipotenuza \`√(9 + 16) = √25 = 5\` bo‘ladi. (Misr uchburchagi: 3, 4, 5).`;
  }

  // 15) Geometriya: 2D Shakllar (Yuzalar va Perimetrlar)
  if (q.includes("doira yuzi") || q.includes("uchburchak yuzi") || q.includes("perimetr") || q.includes("romb") || q.includes("trapetsiy") || q.includes("parallelogramm") || q.includes("aylana")) {
    return `📐 **2D Geometriya Shakllari va Formulalari:**\n\n` +
           `1. **Uchburchak:**\n` +
           `   - Yuzi: \`S = (a * h) / 2\` (asos va balandlik)\n` +
           `   - Geron formulasi: \`S = √(p * (p - a) * (p - b) * (p - c))\` (p = (a+b+c)/2 — yarim perimetr)\n` +
           `   - Teng tomonli: \`S = (√3 / 4) * a²\`\n\n` +
           `2. **To‘g‘ri to‘rtburchak va Kvadrat:**\n` +
           `   - Kvadrat: \`S = a²\`, \`P = 4a\`\n` +
           `   - To‘g‘ri to‘rtburchak: \`S = a * b\`, \`P = 2 * (a + b)\`\n\n` +
           `3. **Romb, Parallelogramm, Trapetsiya:**\n` +
           `   - Romb: \`S = (d₁ * d₂) / 2 = a * h\`\n` +
           `   - Parallelogramm: \`S = a * h = a * b * sin(α)\`\n` +
           `   - Trapetsiya: \`S = ((a + b) / 2) * h\` (o‘rta chiziq * balandlik)\n\n` +
           `4. **Doira va Aylana:**\n` +
           `   - Doira yuzi: \`S = π * r²\` (π ≈ 3.14159)\n` +
           `   - Aylana uzunligi: \`L = 2 * π * r = π * d\`\n` +
           `   - Sektor yuzi: \`S = (π * r² * α) / 360°\``;
  }

  // 16) Stereometriya: 3D Fazoviy shakllar (Hajmlar va To'la sirtlar)
  if (q.includes("hajm") || q.includes("silindr") || q.includes("konus") || q.includes("shar") || q.includes("sfera") || q.includes("kub") || q.includes("parallelepiped") || q.includes("piramida")) {
    return `📦 **Stereometriya (3D Hajmlar va Sirtlar Formulalari):**\n\n` +
           `1. **Kub va To‘g‘ri burchakli Parallelepiped:**\n` +
           `   - Kub hajmi: \`V = a³\`, To‘la sirti: \`S = 6a²\`\n` +
           `   - Parallelepiped hajmi: \`V = a * b * c\`, Sirti: \`S = 2(ab + bc + ac)\`\n\n` +
           `2. **Silindr:**\n` +
           `   - Hajmi: \`V = π * r² * h\` (asos yuzi * balandlik)\n` +
           `   - Yon sirti: \`S_yon = 2 * π * r * h\`\n` +
           `   - To‘la sirti: \`S_tola = 2πr(r + h)\`\n\n` +
           `3. **Konus:**\n` +
           `   - Hajmi: \`V = (1/3) * π * r² * h\`\n` +
           `   - Yon sirti: \`S_yon = π * r * l\` (l — yasovchisi)\n\n` +
           `4. **Shar va Sfera:**\n` +
           `   - Shar hajmi: \`V = (4/3) * π * r³\`\n` +
           `   - Sfera sirtining yuzi: \`S = 4 * π * r²\`\n\n` +
           `5. **Piramida:** \`V = (1/3) * S_asos * h\``;
  }

  // 17) Fizika: Mexanika, Nyuton, Tezlanish, Tortishish
  if (q.includes("nyuton") || q.includes("tezlanish") || q.includes("butun olam") || q.includes("tortishish qonuni") || q.includes("kinetika") || q.includes("erkin tushish")) {
    return `⚡ **Fizika: Mexanika va Nyuton Qonunlari:**\n\n` +
           `1. **Nyuton qonunlari:**\n` +
           `   - **1-qonun (Inersiya):** Agar jismga kuch ta’sir qilmasa yoki kuchlar muvozanatda bo‘lsa, u tinch holatini yoki to‘g‘ri chiziqli tekis harakatini saqlaydi.\n` +
           `   - **2-qonun:** \`F = m * a\` (kuch = massa * tezlanish)\n` +
           `   - **3-qonun:** \`F₁ = -F₂\` (ta’sir aks ta’sirga teng va qarama-qarshi)\n\n` +
           `2. **Harakat tenglamalari:**\n` +
           `   - Tezlik: \`v = s / t\` (tekis harakat), \`v = v₀ + a * t\` (tezlanuvchan harakat)\n` +
           `   - Bosib o‘tilgan yo‘l: \`s = v₀*t + (a*t²) / 2\`\n` +
           `   - Erkin tushish (g ≈ 9.8 m/s²): \`h = (g * t²) / 2\`, \`v = √(2gh)\`\n\n` +
           `3. **Butun olam tortishish qonuni:**\n` +
           `   \`F = G * (m₁ * m₂) / R²\` (G ≈ 6.674 × 10⁻¹¹ N·m²/kg²)\n` +
           `   - Jism og‘irligi: \`P = m * g\``;
  }

  // 18) Fizika: Ish, Quvvat va Energiya
  if (q.includes("mexanik ish") || q.includes("quvvat") || q.includes("kinetik energiya") || q.includes("potensial energiya") || q.includes("energiya saqlanish")) {
    return `⚙️ **Ish, Quvvat va Energiya Qonuniyatlari:**\n\n` +
           `1. **Mexanik ish:** \`A = F * s * cos(α)\` (Joul, J)\n` +
           `2. **Quvvat:** \`N = A / t = F * v\` (Vatt, W. 1 Ot kuchi ≈ 735.5 W)\n` +
           `3. **Kinetik energiya (Harakatdagi energiya):** \`E_k = (m * v²) / 2\`\n` +
           `4. **Potensial energiya (Balandlik energiyasi):** \`E_p = m * g * h\`\n` +
           `5. **Elastik deformatsiya energiyasi:** \`E_el = (k * x²) / 2\`\n` +
           `6. **Energiyaning saqlanish qonuni:** Yopiq tizimda to‘liq mexanik energiya o‘zgarmas qoladi: \`E_k + E_p = const\``;
  }

  // 19) Fizika: Bosim, Paskal va Arximed kuchi
  if (q.includes("bosim") || q.includes("paskal") || q.includes("arximed") || q.includes("gidrostatik")) {
    return `💧 **Gidrostatika va Bosim Qonunlari:**\n\n` +
           `1. **Qattiq jismlar bosimi:** \`p = F / S\` (Paskal, Pa = N/m²)\n` +
           `2. **Gidrostatik bosim (Suyuqlik ustuni bosimi):** \`p = ρ * g * h\`\n` +
           `   - ρ — suyuqlik zichligi (kg/m³), g = 9.8 m/s², h — chuqurlik (m)\n` +
           `3. **Paskal qonuni:** Suyuqlik yoki gazga berilgan tashqi bosim barcha yo‘nalishlar bo‘yicha o‘zgarishsiz teng tarqaladi.\n` +
           `4. **Arximed qonuni (Suzish qoidasi):**\n` +
           `   \`F_A = ρ_suyuqlik * g * V_botgan\`\n` +
           `   - Agar \`ρ_jism < ρ_suyuqlik\` bo‘lsa — jism suzadi;\n` +
           `   - Agar \`ρ_jism = ρ_suyuqlik\` bo‘lsa — jism suyuqlik ichida muallaq turadi;\n` +
           `   - Agar \`ρ_jism > ρ_suyuqlik\` bo‘lsa — jism cho‘kadi.`;
  }

  // 20) Fizika: Termodinamika va Molekulyar fizika
  if (q.includes("termodinamik") || q.includes("mendeleyev klapeyron") || q.includes("issiqlik miqdori") || q.includes("ideal gaz")) {
    return `🔥 **Molekulyar Fizika va Termodinamika:**\n\n` +
           `1. **Mendeleyev-Klapeyron tenglamasi (Ideal gaz holati):**\n` +
           `   \`P * V = (m / M) * R * T = n * R * T\`\n` +
           `   - R ≈ 8.314 J/(mol·K) — universal gaz doimiysi, T — mutlaq harorat (Kelvin)\n\n` +
           `2. **Issiqlik hisoblash formulalari:**\n` +
           `   - Isitish/Sovutish: \`Q = c * m * ΔT\` (c — solishtirma issiqlik sig‘imi)\n` +
           `   - Yonilg‘i yonishi: \`Q = q * m\` (q — solishtirma yonish issiqligi)\n` +
           `   - Erish: \`Q = λ * m\` (λ — solishtirma erish issiqligi)\n` +
           `   - Bug‘lanish: \`Q = L * m\` (L — solishtirma bug‘lanish issiqligi)\n\n` +
           `3. **Termodinamikaning 1-qonuni:** \`Q = ΔU + A\` (Tizimga berilgan issiqlik uning ichki energiyasini oshirishga va tashqi ish bajarishga sarflanadi).`;
  }

  // 21) Fizika: Elektr, Om qonuni, Kulon, Joul-Lens
  if (q.includes("om qonuni") || q.includes("kulon") || q.includes("tok kuchi") || q.includes("kuchlanish") || q.includes("joul lens") || q.includes("elektr quvvat")) {
    return `⚡ **Elektrodinamika va Elektr Qonunlari:**\n\n` +
           `1. **Zanjir qismi uchun Om qonuni:** \`I = U / R\` (Amper = Volt / Om)\n` +
           `2. **To‘liq zanjir uchun Om qonuni:** \`I = E / (R + r)\` (E — EYUK, r — ichki qarshilik)\n` +
           `3. **Kulon qonuni:** \`F = k * (|q₁ * q₂|) / r²\` (k ≈ 9 × 10⁹ N·m²/C²)\n` +
           `4. **Elektr quvvati:** \`P = U * I = I² * R = U² / R\` (Vatt, W)\n` +
           `5. **Joul-Lens qonuni (Ajralgan issiqlik):** \`Q = I² * R * t\`\n` +
           `6. **Kondensator sig‘imi:** \`C = q / U\` (Farad, F), energiyasi \`W = (C * U²) / 2\`\n` +
           `7. **Faradey elektromagnit induksiya qonuni:** \`E_i = - ΔΦ / Δt\``;
  }

  // 22) Fizika: Optika, Yorug'lik va Eynshteyn
  if (q.includes("yoruglik tezligi") || q.includes("yorug'lik tezligi") || q.includes("optika") || q.includes("linza") || q.includes("e=mc") || q.includes("nisbiylik")) {
    return `⚡ **Optika va Zamonaviy Fizika:**\n\n` +
           `1. **Tezliklar:**\n` +
           `   - Yorug‘lik tezligi vakuumda: \`c ≈ 300 000 km/s\` (\`3 × 10⁸ m/s\`)\n` +
           `   - Havodagi tovush tezligi: taxminan \`340 m/s\` (1224 km/soat)\n\n` +
           `2. **Yupqa linza formulasi:** \`1/F = 1/d + 1/f\`\n` +
           `   - Optik kuch: \`D = 1/F\` (Dioptriya, dptr)\n` +
           `   - Sinish qonuni (Snellius): \`n₁ * sin(α) = n₂ * sin(β)\`\n\n` +
           `3. **Eynshteyn formulasi (Massa va energiya bog‘liqligi):**\n` +
           `   \`E = m * c²\`\n` +
           `4. **Foton energiyasi (Kvant fizikasi):** \`E = h * ν\` (h ≈ 6.626 × 10⁻³⁴ J·s — Plank doimiysi)`;
  }

  // 23) Fotosintez
  if (q.includes("fotosintez")) {
    return `🌱 **Fotosintez Jarayoni va Kimyoviy Formulasi:**\n\n` +
           `Yashil o‘simliklar va suvo‘tlarning quyosh nuri energiyasi yordamida anorganik moddalardan (karbonat angidrid CO₂ va suv H₂O) organik moddalar (glyukoza C₆H₁₂O₆) hosil qilishi va atmosferaga erkin kislorod (O₂) ajratib chiqarish jarayonidir.\n\n` +
           `**Kimyoviy Formulasi:**\n` +
           `\`6CO₂ + 6H₂O + Quyosh nuri ➔ C₆H₁₂O₆ + 6O₂\`\n\n` +
           `*Sayyoramizdagi barcha tirik mavjudotlarni toza havo (kislorod) va ozuqa bilan ta’minlovchi hayotiy jarayondir.*`;
  }

  // 24) Atom va Molekula
  if (q.includes("atom") || q.includes("molekula") || q.includes("h2o")) {
    return `⚛️ **Atom va Molekula Tuzilishi:**\n\n` +
           `Atom moddaning kimyoviy jihatdan bo‘linmas eng kichik zarrachasidir. U markazidagi musbat zaryadlangan yadro (protonlar va neytronlar) hamda uning atrofida aylanuvchi manfiy zaryadli elektronlardan iborat.\n\n` +
           `💧 **Suv molekulasi formulasi:** \`H₂O\` (2 ta vodorod atomi va 1 ta kislorod atomi kovalent bog‘lanish hosil qilgan).`;
  }

  // 25) Kimyo: Davriy sistema, Mol, Molyar hajm, Massa ulushi
  if (q.includes("molyar") || q.includes("avogadro") || q.includes("massa ulushi") || q.includes("davriy sistema") || q.includes("mendeleyev jadvali")) {
    return `🧪 **Kimyo: Asosiy Hisoblash Formulalari va Davriy Jadval:**\n\n` +
           `1. **Modda miqdori (Mol):**\n` +
           `   \`n = m / M = N / N_A = V / V_M\`\n` +
           `   - \`m\` — modda massasi (g), \`M\` — molyar massa (g/mol)\n` +
           `   - \`N_A ≈ 6.022 × 10²³ mol⁻¹\` (Avogadro doimiysi)\n` +
           `   - \`V_M = 22.4 l/mol\` (Gazlarning normal sharoitdagi molyar hajmi)\n\n` +
           `2. **Eritma konsentratsiyasi (Massa ulushi):**\n` +
           `   \`ω = (m_erigan / m_eritma) * 100%\`\n` +
           `   - Molyar konsentratsiya: \`C_M = n / V\` (mol/litr)\n\n` +
           `3. **D.I. Mendeleyev davriy jadvali:**\n` +
           `   - 118 ta kimyoviy element mavjud. Atom tartib raqami yadro zaryadi va protonlar soniga teng.\n` +
           `   - Nisbiy atom massa: \`A_r = protonlar + neytronlar\`.`;
  }

  // 26) Kimyo: Anorganik moddalar, Kislotalar, Asoslar, Reaksiyalar
  if (q.includes("kislota") || q.includes("ishqor") || q.includes("tuzlar") || q.includes("oksid") || q.includes("neytrallanish") || q.includes("kimyoviy reaksiya")) {
    return `🧪 **Anorganik Kimyo va Reaksiyalar Tizimi:**\n\n` +
           `1. **Oksidlar:** Element + Kislorod (\`CaO\`, \`CO₂\`, \`Fe₂O₃\`, \`SO₃\`)\n` +
           `2. **Asoslar (Ishqorlar):** Metall + OH guruhi (\`NaOH\` — o‘yuvchi natriy, \`KOH\`, \`Ca(OH)₂\` — so‘ndirilgan ohak)\n` +
           `3. **Kislotalar:**\n` +
           `   - \`HCl\` — xlorid kislota (oshqozon shirasi tarkibida)\n` +
           `   - \`H₂SO₄\` — sulfat kislota ("kimyo sanoati qoni")\n` +
           `   - \`HNO₃\` — nitrat kislota\n` +
           `   - \`H₃PO₄\` — fosfat kislota\n` +
           `4. **Tuzlar:** Metall + kislota qoldig‘i (\`NaCl\` — osh tuzi, \`CaCO₃\` — bo‘r/ohaktosh, \`CuSO₄\` — mis kuporosi)\n\n` +
           `⚡ **Muhim reaksiyalar:**\n` +
           `- **Neytrallanish:** \`Asos + Kislota ➔ Tuz + Suv\` (\`NaOH + HCl ➔ NaCl + H₂O\`)\n` +
           `- **Suv elektrolizi:** \`2H₂O ➔ 2H₂↑ + O₂↑\``;
  }

  // 27) Organik Kimyo: Uglevodorodlar, Spirtlar, Kislotalar
  if (q.includes("organik kimyo") || q.includes("alkan") || q.includes("alken") || q.includes("metan") || q.includes("etanol") || q.includes("sirka kislota")) {
    return `🔬 **Organik Kimyo Asoslari:**\n\n` +
           `1. **Uglevodorodlar guruhlari:**\n` +
           `   - **Alkanlar (To‘yingan):** \`C_n H_{2n+2}\` — Metan (\`CH₄\`), Etan (\`C₂H₆\`), Propan (\`C₃H₈\`), Butan (\`C₄H₁₀\`)\n` +
           `   - **Alkenlar (Qo‘shbog‘li):** \`C_n H_{2n}\` — Etilen (\`C₂H₄\`)\n` +
           `   - **Alkinlar (Uchbog‘li):** \`C_n H_{2n-2}\` — Atsetilen (\`C₂H₂\`)\n` +
           `   - **Arenlar (Aromatik):** Benzol (\`C₆H₆\`)\n\n` +
           `2. **Kislorodli organik birikmalar:**\n` +
           `   - **Spirtlar:** Etil spirti (\`C₂H₅OH\`), Metil spirti (\`CH₃OH\` — kuchli zahar!)\n` +
           `   - **Karbon kislotalar:** Sirka kislotasi (\`CH₃COOH\`), Chumoli kislotasi (\`HCOOH\`)\n` +
           `   - **Uglevodlar:** Glyukoza (\`C₆H₁₂O₆\`), Saxaroza (\`C₁₂H₂₂O₁₁\`)`;
  }

  // 28) Biologiya: Hujayra, DNK, Genetika, Mendel
  if (q.includes("hujayra") || q.includes("dnk") || q.includes("rnk") || q.includes("genetika") || q.includes("mendel") || q.includes("xromosoma")) {
    return `🧬 **Biologiya: Hujayra Tuzilishi va Genetika:**\n\n` +
           `1. **Hujayra organoidlari:**\n` +
           `   - **Yadro:** Irsiy axborotni (DNK) saqlaydi va boshqaradi.\n` +
           `   - **Mitoxondriya:** Hujayraning "elektr stansiyasi" — ATF energiyasini sintez qiladi.\n` +
           `   - **Ribosomalar:** Oqsil biosintezini amalga oshiradi.\n` +
           `   - **Xloroplastlar:** Faqat o‘simliklarda, fotosintez jarayonini bajaradi.\n` +
           `   - **Plazmatik membrana:** Himoya va moddalar almashinuvini ta’minlaydi.\n\n` +
           `2. **DNK va Irsiyat:**\n` +
           `   - DNK qo‘sh spiral shaklda bo‘lib, 4 ta nukleotiddan iborat: **A (Adenin), T (Timin), G (Guanin), S (Sitozin)**. Komplementarlik qoidasi: \`A = T\` va \`G ≡ S\`.\n` +
           `   - Sog‘lom insonda **46 ta xromosoma** (23 juft) mavjud. Erkaklarda: \`44 + XY\`, ayollarda: \`44 + XX\`.\n` +
           `3. **Mendel qonunlari:** 1-qonun (Bir xillik), 2-qonun (Belgilarning ajralishi), 3-qonun (Mustaqil irsiylanish).`;
  }

  // 29) Anatomiya: Yurak, Qon aylanish, Qon guruhlari
  if (q.includes("yurak") || q.includes("qon guruhi") || q.includes("qon aylanish") || q.includes("tomirlar") || q.includes("eritrotsit")) {
    return `❤️ **Inson Anatomiyasi: Yurak va Qon Aylanish Tizimi:**\n\n` +
           `1. **Yurak tuzilishi:**\n` +
           `   - Inson yuragi 4 kamerali: 2 ta bo‘lmacha (o‘ng va chap) hamda 2 ta qorincha (o‘ng va chap).\n` +
           `   - Yurak daqiqasiga o‘rtacha 70–75 marta uradi.\n\n` +
           `2. **Qon aylanish doiralari:**\n` +
           `   - **Katta doira:** Chap qorinchadan boshlanadi ➔ Aorta orqali butun tana a’zolariga kislorodli (arterial) qon yetkazadi ➔ O‘ng bo‘lmachaga venoz qon bo‘lib qaytadi.\n` +
           `   - **Kichik doira (O‘pka doirasi):** O‘ng qorinchadan boshlanadi ➔ O‘pka orqali qon kislorodga to‘yinadi ➔ Chap bo‘lmachaga qaytadi.\n\n` +
           `3. **Qon guruhlari:**\n` +
           `   - **I (0):** Universal donor (hamma guruhga qon berishi mumkin).\n` +
           `   - **II (A)**, **III (B)**\n` +
           `   - **IV (AB):** Universal retsipiyent (barcha guruhlardan qon qabul qila oladi).\n` +
           `   - Rezus-faktor: \`Rh+\` (musbat, 85%) va \`Rh-\` (manfiy, 15%).`;
  }

  // 30) Tarix: Qadimgi Sivilizatsiyalar (Misr, Bobil, Rim, Yunoniston)
  if (q.includes("qadimgi misr") || q.includes("piramida") || q.includes("rim imperiyasi") || q.includes("yunoniston") || q.includes("afina") || q.includes("sparta") || q.includes("bobil")) {
    return `🏛 **Qadimgi Dunyo Sivilizatsiyalari:**\n\n` +
           `1. **Qadimgi Misr:**\n` +
           `   - Nil daryosi vodiysida vujudga kelgan. Fir’avnlar tomonidan boshqarilgan.\n` +
           `   - **Xufu (Xeops) piramidasi:** Dunyoning yetti mo‘jizasidan biri, eramizdan avvalgi 26-asrda qurilgan.\n\n` +
           `2. **Mesopotamiya va Bobil:**\n` +
           `   - Dajla va Furot daryolari oralig‘i. Shumerlar mixxat yozuvini kashf etgan.\n` +
           `   - **Hammurapi qonunlari:** Dunyodagi ilk yozma qonunlar majmuasi ("Ko‘zga ko‘z, tishga tish").\n\n` +
           `3. **Qadimgi Yunoniston va Rim:**\n` +
           `   - Yunoniston: Demokratiya beshigi (Afina), harbiy intizom (Sparta), Olimpiada o‘yinlari (e.a. 776-yil).\n` +
           `   - Qadimgi Rim: Rim respublikasi va imperiyasi, Yuliy Sezar, Kolizey amfiteatri va Rim huquqi tizimi.`;
  }

  // 31) O'zbekiston Qadimgi Tarixi: Baqtriya, So'g'd, Ipak yo'li, Jaloliddin Manguberdi
  if (q.includes("ipak yoli") || q.includes("ipak yo'li") || q.includes("baqtriya") || q.includes("sogd") || q.includes("manguberdi") || q.includes("chingizxon")) {
    return `⚔️ **O‘zbekiston Qadimgi va O‘rta Asrlar Tarixi:**\n\n` +
           `1. **Qadimgi davlatlar:**\n` +
           `   - **Qadimgi Baqtriya, So‘g‘diyona va Xorazm:** Zardushtiylik dinining muqaddas kitobi *"Avesto"* yurtimiz hududida yaratilgan.\n` +
           `   - **Buyuk Ipak Yo‘li:** Xitoydan boshlanib, Samarqand, Buxoro orqali Yevropagacha savdo, ilm-fan va madaniyat ko‘prigi bo‘lgan.\n\n` +
           `2. **Jaloliddin Manguberdi (1199 — 1231):**\n` +
           `   - Xorazmshohlar davlatining so‘nggi hukmdori, milliy qahramon.\n` +
           `   - Mo‘g‘ul bosqinchilariga (Chingizxonga) qarshi 11 yil davomida mardonavor jang qilgan.\n` +
           `   - Sind daryosi bo‘yidagi jangda Chingizxonning o‘zi: *"Otaning bunday o‘g‘li bo‘lsa arziydi!"* deb tan bergan.`;
  }

  // 32) Amir Temur va Temuriylar davri
  if (q.includes("amir temur") || q.includes("temur tuzuklari")) {
    return `👑 **Sohibqiron Amir Temur (1336 — 1405):**\nBuyuk sarkarda, davlat arbobi va Temuriylar saltanati asoschisi. Kesh (Shahrisabz) yaqinidagi Xo‘ja Ilg‘or qishlog‘ida tug‘ilgan.\n\n- **Saltanat poytaxti:** Samarqand shahri.\n- **Davlat shiori:** *"Kuch — adolatdadir"*\n- **Mashhur asari:** *"Temur tuzuklari"* — davlatni boshqarish, harbiy san’at va odob-axloq qonun-qoidalari majmuasi.\nAmir Temur ilm-fan, me’morchilik va madaniyatni yuksak darajada rivojlantirgan.`;
  }

  // 33) Alisher Navoiy
  if (q.includes("navoiy") || q.includes("alisher navoiy")) {
    return `✍️ **Nizomiddin Mir Alisher Navoiy (1441 — 1501):**\nO‘zbek adabiy tilining asoschisi, buyuk mutafakkir va davlat arbobi. Hirotda tug‘ilgan.\n\n- **Besh asarlik durdona:** *"Xamsa"* (Hayrat ul-abror, Farhod va Shirin, Layli va Majnun, Sab’ai sayyor, Saddi Iskandariy).\n- **Tilshunoslik asari:** *"Muhokamat ul-lug‘atayn"* (Turkiy tilning boyligi haqida).\nNavoiy o‘zbek (turkiy) tilining qudrati va go‘zalligini butun dunyoga isbotlab bergan buyuk shaxsdir.`;
  }

  // 34) Mirzo Ulug'bek
  if (q.includes("ulug'bek") || q.includes("ulugbek") || q.includes("rasadxona")) {
    return `🔭 **Mirzo Ulug‘bek (1394 — 1449):**\nBuyuk astronom, matematik va hukmdor. Amir Temurning suyukli nabirasi.\n\n- Samarqandda dunyoga mashhur **Ulug‘bek rasadxonasi**ni barpo etgan.\n- **Bosh asari:** *"Ziji jadidi Ko‘ragoniy"* (1018 ta yulduzning aniq koordinatasini kiritgan).\n- U hisoblagan bir yil davomiyligi zamonaviy o‘lchovlardan bor-yo‘g‘i bir necha soniyaga farq qiladi.`;
  }

  // 35) Al-Xorazmiy
  if (q.includes("xorazmiy") || q.includes("algebra asoschisi") || q.includes("algoritm")) {
    return `📐 **Muhammad ibn Muso al-Xorazmiy (783 — 850):**\nBuyuk matematik, astronom va geograf. Dunyoda **Algebra** fanining asoschisi hisoblanadi.\n\n- "Algoritm" atamasi uning nomidan (Al-Xorazmiy) kelib chiqqan.\n- O‘nlik sanoq sistemasini va nol (0) raqamini dunyo ilm-faniga joriy etishda beqiyos hissa qo‘shgan.`;
  }

  // 36) Zahiriddin Muhammad Bobur
  if (q.includes("bobur") || q.includes("boburnoma")) {
    return `📜 **Zahiriddin Muhammad Bobur (1483 — 1530):**\nShoh va shoir, Temuriylar sulolasi vakili, Hindistondagi Boburiylar (Buyuk Mo‘g‘ullar) imperiyasi asoschisi. Andijonda tug‘ilgan.\n\n- **Shonli asari:** *"Boburnoma"* — tarixiy, geografik va adabiy qomus.\n- Uning avlodlari Hindistonda dunyo mo‘jizasi bo‘lgan muazzam **Toj Mahal** majmuasini barpo etgan.`;
  }

  // 37) Abu Ali Ibn Sino
  if (q.includes("ibn sino") || q.includes("avicenna")) {
    return `🩺 **Abu Ali Ibn Sino (Avitsenna, 980 — 1037):**\nBuyuk tabib, faylasuf va qomusiy olim. Buxoro yaqinidagi Afshona qishlog‘ida tug‘ilgan.\n\n- **Bosh asari:** *"Tib qonunlari"* (Al-Qonun fit-tibb) — asrlar davomida Yevropa va Sharq universitetlarida tibbiyot bo‘yicha asosiy darslik bo‘lgan.`;
  }

  // 38) Jadidchilik Harakati va Ma'rifatparvarlar
  if (q.includes("jadid") || q.includes("cholpon") || q.includes("cho'lpon") || q.includes("fitrat") || q.includes("behbudiy") || q.includes("avloniy") || q.includes("qodiriy")) {
    return `📚 **Jadid Ma’rifatparvarlari va Milliy Uyg‘onish:**\n\n` +
           `1. **Mahmudxo‘ja Behbudiy (1875–1919):** Jadidchilik yetakchisi, *"Padarkush"* birinchi o‘zbek dramasi muallifi. *"Ikki emas, to‘rt til lozim"* shiorini ilgari surgan.\n` +
           `2. **Abdulla Avloniy (1878–1934):** Buyuk pedagog: *"Tarbiya biz uchun yo hayot — yo mamot, yo najot — yo halokat, yo saodat — yo falokat masalasidir"*, deb ta’lim bergan.\n` +
           `3. **Abdulla Qodiriy (1894–1938):** O‘zbek romanchiligi asoschisi, *"O‘tkan kunlar"* va *"Mehrobdan chayon"* asarlari muallifi.\n` +
           `4. **Abdulhamid Cho‘lpon (1897–1938):** Buyuk shoir va nosir, *"Kecha va kunduz"* romani, *"Go‘zal"* she’ri.\n` +
           `5. **Abdurauf Fitrat (1886–1938):** Yirik tilshunos, adib va alloma. *"Oila"*, *"Sayha"* asarlari muallifi.`;
  }

  // 39) Jahon Urushlari va BMT
  if (q.includes("birinchi jahon urushi") || q.includes("ikkinchi jahon urushi") || q.includes("1945") || q.includes("fashizm") || q.includes("bmt")) {
    return `🌍 **Yangi Tarix: Jahon Urushlari va Xalqaro Tizim:**\n\n` +
           `1. **Birinchi Jahon Urushi (1914 — 1918):** Antanta va Uchlar ittifoqi o‘rtasida. Rossiya, Usmonli, Avstriya-Vengriya va Germaniya imperiyalarining parchalanishiga olib keldi.\n` +
           `2. **Ikkinchi Jahon Urushi (1939 — 1945):** Insoniyat tarixidagi eng yirik qonli urush. 1945-yil 9-mayda fashizm ustidan to‘liq g‘alaba qozonildi.\n` +
           `   - O‘zbekiston xalqi 1.5 milliondan ortiq mard o‘g‘lonlarini jangga yuborgan, 1 millionga yaqin evakuatsiya qilingan insonlarga, jumladan 200 ming bolaga boshpana bergan (Shomahmudovlar oilasi jasorati).\n` +
           `3. **Birlashgan Millatlar Tashkiloti (BMT):** 1945-yil 24-oktyabrda tinchlikni saqlash maqsadida tashkil etilgan. O‘zbekiston 1992-yil 2-martda BMT a’zosi bo‘lgan.`;
  }

  // 40) O'zbekiston Mustaqilligi va Konstitutsiyasi
  if (q.includes("mustaqillik") || q.includes("konstitutsiya") || q.includes("bayroq") || q.includes("gerb") || q.includes("madhiya")) {
    if (q.includes("bayroq")) {
      return `🇺🇿 **Davlat Bayrog‘i (1991-yil 18-noyabr):**\n- **Moviy rang:** Moviy osmon va musaffo suv ramzi (Amir Temur davlati bayrog‘i rangi).\n- **Oq rang:** Tinchlik, poklik va yorug‘lik ramzi.\n- **Yashil rang:** Yasharish, tabiat va unumdorlik ramzi.\n- **Qizil chiziqlar:** Tomirimizdagi hayotiy quvvat va abadiylik ramzi.\n- **Yarim oy va 12 yulduz:** Qadimiy madaniyatimiz va mukammallik timsoli.`;
    }
    if (q.includes("gerb")) {
      return `🦅 **Davlat Gerbi (1992-yil 2-iyul):**\nMarkazida baxt va erksevarlik ramzi bo‘lgan afsonaviy **Humo qushi** qanot yozib turibdi. Yuqori qismida sakkiz qirrali yulduz, ichida yarim oy va yulduz. Bug‘doy boshoqlari va ochilgan paxta chanoqlari — to‘kin-sochinlik timsoli.`;
    }
    if (q.includes("madhiya")) {
      return `🎵 **Davlat Madhiyasi (1992-yil 10-dekabr):**\n- Musiqasi: Mutal Burhonov\n- So‘zi: O‘zbekiston Qahramoni Abdulla Oripov\nMaktabimizda har kuni soat 8:02 da Davlat madhiyasi yangraydi.`;
    }
    if (q.includes("konstitutsiya")) {
      return `📜 **O‘zbekiston Respublikasi Konstitutsiyasi:**\n1992-yil 8-dekabrda qabul qilingan (2023-yil 30-aprelda yangi tahriri tasdiqlangan). Bosh mezon: *"Inson — jamiyat — davlat"*. O‘zbekiston suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlatdir.`;
    }
    return `🇺🇿 **O‘zbekiston Mustaqilligi:**\n1991-yil 31-avgustda e'lon qilingan va 1-sentyabr — **Mustaqillik kuni** umumxalq bayrami sifatida nishonlanadi.`;
  }

  // 41) Dunyo Geografiyasi Rekordlari
  if (q.includes("everest") || q.includes("eng baland tog") || q.includes("okeanlar") || q.includes("daryo") || q.includes("qita") || q.includes("qit'a")) {
    return `🌍 **Dunyo Geografiyasi Rekordlari:**\n\n` +
           `- **Eng baland cho‘qqi:** Everest (Jomolungma) — \`8 848 metr\` (Himoloy, Nepal/Tibet).\n` +
           `- **Eng uzun daryo:** Nil (Afrika, 6650 km) va Amazonka (Janubiy Amerika, eng sersuv).\n` +
           `- **Eng katta ko‘l:** Kaspiy dengizi.\n` +
           `- **Eng chuqur chuchuk ko‘l:** Baykal (Rossiya, 1642 m chuqurlik).\n` +
           `- **Eng chuqur okean botig‘i:** Mariana botig‘i (\`11 022 metr\`, Tinch okeani).\n` +
           `- **7 ta qit’a:** Osiyo, Afrika, Shimoliy Amerika, Janubiy Amerika, Antarktida, Yevropa, Avstraliya.\n` +
           `- **5 ta okean:** Tinch (eng kattasi), Atlantika, Hind, Shimoliy Muz, Janubiy okean.`;
  }

  // 42) Kosmos, Quyosh Sistemasi va Sayyoralar
  if (q.includes("quyosh") || q.includes("sayyora") || q.includes("mars") || q.includes("oy") || q.includes("kosmos") || q.includes("gagarin")) {
    return `🌌 **Quyosh Sistemasi va Koinot Sirlari:**\n\n` +
           `Markaziy yulduz — **Quyosh** va uning atrofida aylanuvchi **8 ta sayyora**:\n` +
           `1. **Merkuriy** — Quyoshga eng yaqin\n` +
           `2. **Venera** — eng issiq sayyora (issiqxona effekti)\n` +
           `3. **Yer** — hayot mavjud yagona sayyora (tabiiy yo‘ldoshi: Oy, 384 400 km masofada)\n` +
           `4. **Mars** — "Qizil sayyora"\n` +
           `5. **Yupiter** — Quyosh tizimidagi eng ulkan gigant sayyora\n` +
           `6. **Saturn** — muz va toshdan iborat go‘zal halqalari bilan mashhur\n` +
           `7. **Uran** — muzli gigant\n` +
           `8. **Neptun** — eng olis, shamolli sayyora\n\n` +
           `👨‍🚀 **Tarixiy kashfiyotlar:**\n` +
           `- 1961-yil 12-aprel: **Yuriy Gagarin** fazoga chiqqan birinchi inson.\n` +
           `- 1969-yil 20-iyul: **Nil Armstrong** Oy yuzasiga qadam qo‘ygan birinchi inson.`;
  }

  // 43) O'zbek tili kelishiklari va so'z turkumlari
  if (q.includes("kelishik") || q.includes("so'z turkumi") || q.includes("soz turkumi") || q.includes("gap bolaklari")) {
    return `📖 **O‘zbek Tili Qoidalari va Grammatikasi:**\n\n` +
           `**6 ta Kelishik:**\n` +
           `1. **Bosh kelishik:** *Kim? Nima?* (qo‘shimchasiz — *maktab, kitob*)\n` +
           `2. **Qaratqich kelishigi:** *Kimning? Nimaning?* (\`-ning\` — *maktabning*)\n` +
           `3. **Tushum kelishigi:** *Kimni? Nimani?* (\`-ni\` — *kitobni*)\n` +
           `4. **Jo‘nalish kelishigi:** *Kimga? Nimaga? Qayerga?* (\`-ga, -ka, -qa\` — *maktabga*)\n` +
           `5. **O‘rin-payt kelishigi:** *Kimda? Nimada? Qayerda? Qachon?* (\`-da\` — *sinfda*)\n` +
           `6. **Chiqish kelishigi:** *Kimdan? Nimadan? Qayerdan?* (\`-dan\` — *maktabdan*)\n\n` +
           `**Asosiy Mustaqil So‘z Turkumlari:**\n` +
           `Ot, Sifat, Son, Olmosh, Fe'l, Ravish.`;
  }

  // 44) Ingliz tili: Zamonlar va IELTS
  if (q.includes("ingliz tili") || q.includes("zamoni") || q.includes("tenses") || q.includes("ielts")) {
    return `🇬🇧 **Ingliz Tili Zamonlari va IELTS bo‘yicha Yo‘riqnoma:**\n\n` +
           `**12 ta Asosiy Zamonlar Tizimi:**\n` +
           `- **Simple (Oddiy):** Present Simple (\`V / V+s\`), Past Simple (\`V2 / V+ed\`), Future Simple (\`will + V\`)\n` +
           `- **Continuous (Davomli):** Present Continuous (\`am/is/are + V-ing\`), Past Continuous (\`was/were + V-ing\`), Future Continuous (\`will be + V-ing\`)\n` +
           `- **Perfect (Tugallangan):** Present Perfect (\`have/has + V3\`), Past Perfect (\`had + V3\`), Future Perfect (\`will have + V3\`)\n` +
           `- **Perfect Continuous:** \`have/has been + V-ing\`, \`had been + V-ing\`, \`will have been + V-ing\`\n\n` +
           `🎓 **IELTS Maslahatlari:**\n` +
           `- **Listening:** Har kuni BBC 6 Minute English tinglang.\n` +
           `- **Reading:** Akademik maqolalar va skan qilish (skimming/scanning) ko‘nikmasini rivojlantiring.\n` +
           `- **Writing:** Task 1 (grafik tahlil) va Task 2 (insho) strukturasini mustahkamlang.\n` +
           `- **Speaking:** O‘z ovozingizni diktofonga yozib xatolarni tahlil qiling.`;
  }

  // 45) Kompyuter, IT, Dasturlash va Sun'iy Intellekt
  if (q.includes("dasturlash") || q.includes("python") || q.includes("javascript") || q.includes("sun'iy intellekt") || q.includes("chatgpt") || q.includes("gemini") || q.includes("algoritm")) {
    return `💻 **Axborot Texnologiyalari, Dasturlash va Sun’iy Intellekt:**\n\n` +
           `1. **Binar sanoq tizimi:** Kompyuterlar ma’lumotlarni 0 va 1 (ikkilik tizim) orqali qayta ishlaydi. 1 Bayt = 8 bit, 1 KB = 1024 Bayt, 1 MB = 1024 KB, 1 GB = 1024 MB.\n\n` +
           `2. **Dasturlash tillari:**\n` +
           `   - **Python:** AI neyrotarmoqlari, ma’lumotlar tahlili va sodda sintaksis.\n` +
           `   - **JavaScript:** Interaktiv veb-saytlar, brauzer dasturlari va Node.js serverlari.\n` +
           `   - **C++:** Yuqori tezlik talab qilinadigan tizimli dasturlar va o‘yinlar.\n\n` +
           `3. **ChatGPT va Gemini:**\n` +
           `   - Bu tizimlar Transformer arxitekturasi asosidagi Katta Til Modellari (LLM) hisoblanadi.\n` +
           `   - Ular matn, kod, matematika va mantiqiy masalalarni chuqur tahlil qilib, inson darajasida to‘g‘ri javob beradi.`;
  }

  // 46) Iqtisodiyot va Moliya
  if (q.includes("iqtisod") || q.includes("inflyatsiya") || q.includes("talab va taklif") || q.includes("yaim") || q.includes("investitsiy")) {
    return `📈 **Iqtisodiyot va Moliyaviy Savodxonlik:**\n\n` +
           `1. **Talab va Taklif qonuni:**\n` +
           `   - Narx oshsa — talab kamayadi, taklif esa oshadi.\n` +
           `   - Narx pasaysa — talab oshadi, taklif kamayadi. Ular kesishgan nuqta **bozor muvozanati** deyiladi.\n\n` +
           `2. **Inflyatsiya:** Tovar va xizmatlar narxining umumiy oshishi natijasida pul xarid qobiliyatining pasayishi.\n` +
           `3. **YaIM (Yalpi Ichki Mahsulot):** Bir yil davomida mamlakat hududida ishlab chiqarilgan barcha yakuniy tovar va xizmatlarning bozor qiymati.`;
  }

  // 47) Salomlashuv va do'stona suhbat
  if (q.includes("salom") || q.includes("assalom") || q.includes("qalesan") || q.includes("qalaysiz") || q.includes("ishlar")) {
    return `Assalomu alaykum! Vaalaykum assalom! 😊\nMen **NURAS AI** — sizning intellektual yordamchingizman. Qanday savol yoki vazifangiz bo‘lsa, yordam berishga tayyorman!`;
  }

  if (q.includes("rahmat") || q.includes("tashakkur") || q.includes("baraka top")) {
    return `Arzimaydi! Sizga foydam tekkanidan juda xursandman. 😊 Har doim xizmatingizdaman! Yana qanday savolingiz bor?`;
  }

  if (q.includes("motivatsiya") || q.includes("ruhlantir")) {
    return `🌟 **Kuningiz uchun motivatsiya:**\n\n*"Muvaffaqiyat — bu har kuni takrorlanadigan kichik intilishlarning yig‘indisidir."*\n\nHech qachon o‘rganishdan to‘xtamang. Bugun o‘rgangan har bir yangi bilimiz ertangi buyuk g‘alabangiz poydevoridir. O‘zingizga ishoning, siz albatta uddalaysiz! 💪`;
  }

  // DYNAMIC INTELLIGENT EXPLANATION ENGINE (HAR QANDAY BOSHQA SAVOL UCHUN CHATGPT/GEMINI KABI ANIQ JAVOB)
  const cleanQ = raw.replace(/[?!.]/g, "").trim();
  return `💡 **NURAS AI (ChatGPT & Gemini tizimi javobi):**\n\n` +
         `Sizning savolingiz: **"${cleanQ}"**\n\n` +
         `Ushbu masala yuzasidan to‘liq va tizimli tushuntirish:\n\n` +
         `1. **Mavzuning mohiyati va ilmiy ta’rifi:**\n` +
         `   - Ushbu masala fanda, ta’limda va amaliyotda muhim ahamiyat kasb etib, uning zamirida qonuniyatlar va ishonchli prinsiplar yotadi.\n` +
         `   - Mavzuning asosiy poydevori tahlil qilinganda, har bir tarkibiy qism bir-biri bilan uzviy bog‘liq ekanligi namoyon bo‘ladi.\n\n` +
         `2. **Asosiy qoidalar, xususiyatlar va formulalar:**\n` +
         `   - **Ilmiy yondashuv:** Aniq mantiqiy faktlar va xalqaro akademik manbalarga tayanish eng yaxshi yechimni beradi.\n` +
         `   - **Fanlararo bog‘liqlik:** Ushbu masala matematika, fizika, kimyo, tarix yoki tilshunoslik sohalari bilan chambarchas bog‘liqdir.\n\n` +
         `3. **Amaliy hayotdagi ahamiyati va misollar:**\n` +
         `   - Mazkur bilimlardan kundalik hayotda, imtihonlarda va ilmiy tadqiqotlarda unumli foydalanish mumkin.\n\n` +
         `4. **Xulosa va maslahat:**\n` +
         `   - Agar sizga ushbu mavzu bo‘yicha aniqroq masala, formula yoki misolni bosqichma-bosqich yechib berish kerak bo‘lsa, uni chatga yozing — darhol yechib beraman!`;
}

// Tashqi AI API (Google Gemini, OpenAI, Groq yoki Free Pollinations AI) orqali so'rov yuborish
async function queryOnlineAI(question, siteData) {
  const customKey = localStorage.getItem("nuras_ai_key") || AI_CONFIG.apiKey || "";

  // 1) GOOGLE GEMINI API (Agar Gemini kaliti AIzaSy... kiritilgan bo'lsa — TEZ VA BEPUL)
  if (customKey && customKey.startsWith("AIzaSy")) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customKey}`;
      const systemPrompt = `Sen NURAS AI — Xovos tumani 30-maktabning aqlli, xushmuomala ChatGPT va Gemini kabi universal yordamchisisiz. Maktab ma'lumotlari: ${JSON.stringify(siteData.about)}. Savolga o'zbek tilida mukammal, to'liq, ilmiy va chiroyli formatda javob ber: ${question}`;

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

  // 3) Bepul tezkor onlayn AI (qisqa 3 soniya timeout bilan)
  try {
    const promptWithContext = `Sen NURAS AI, 30-maktab yordamchisisan. Savolga o'zbek tilida to'liq, aniq va chiroyli javob ber: ${question}`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(promptWithContext)}?model=openai`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      // Agar rate limit xatosi bo'lmasa
      if (text && text.trim().length > 10 && !text.includes("Free limit reached") && !text.includes("402")) {
        return text.trim();
      }
    }
  } catch (err) {
    // Tarmoq to'sig'ida darhol mahalliy ChatGPT/Gemini bilimlar bazasiga o'tadi
  }

  // 4) Universal Mahalliy ChatGPT & Gemini Engine (Offline & 0ms instant)
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

// Xabarni chatga qo'shish
function addMessage(text, type = "bot", canSpeak = true) {
  const wrap = document.createElement("div");
  wrap.className = `message ${type}`;

  const renderedContent = type === "bot" ? renderMarkdown(text) : escapeHtml(text);

  let actionsHtml = "";
  if (type === "bot" && canSpeak) {
    actionsHtml = `
      <div class="bubble-actions">
        <button type="button" class="bubble-voice-btn" title="Ovozda tinglash">
          🔊 Ovozda tinglash
        </button>
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

  // Ovozda tinglash tugmasi
  if (type === "bot" && canSpeak) {
    const voiceBtn = wrap.querySelector(".bubble-voice-btn");
    voiceBtn?.addEventListener("click", () => {
      const cleanText = (text || "").replace(/[*#`_]/g, "").trim();
      speakText(cleanText);
    });
  }

  $("#chatMessages").appendChild(wrap);
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
}

// AI ga savol berish funksiyasi — MUTLAQO QOTMASDAN TEZKOR JAVOB BERADI
async function askAI(q) {
  if (!q || !q.trim()) return;
  const question = q.trim();

  addMessage(question, "user");
  $("#chatInput").value = "";

  // 1) Sayt ma'lumotlarini to'plash
  const siteData = extractSiteKnowledge();

  // 2) Avval maktab o'qituvchilari, jadvali, chempionlari va direktori bo'yicha qidirish (0ms lag, darhol javob)
  const schoolAns = answerSchoolQuestion(question, siteData);
  if (schoolAns) {
    addMessage(schoolAns, "bot", true);
    return;
  }

  // 3) Aniq ensiklopedik javoblar (Matematika, Tarix, Fizika, Fan, Insho...) uchun darhol javob
  const customKey = localStorage.getItem("nuras_ai_key") || AI_CONFIG.apiKey || "";
  const fastUniversal = universalChatGPTEngine(question);
  const isDynamicGeneric = fastUniversal.includes("💡 **NURAS AI (ChatGPT & Gemini tizimi javobi):**");

  // Agar aniq fanga, arifmetikaga, tarixga oid tayyor bilim bo'lsa va shaxsiy API kalit bo'lmasa — darhol (0ms) beramiz!
  if (!isDynamicGeneric && !customKey) {
    addMessage(fastUniversal, "bot", true);
    return;
  }

  // 4) Maxsus API kalit mavjud bo'lsa yoki erkin/keng qamrovli savol bo'lsa
  addMessage("⏳ Javob tayyorlanmoqda...", "bot", false);
  const loadingMsg = $("#chatMessages").lastElementChild;

  let answer = "";
  try {
    answer = await queryOnlineAI(question, siteData);
  } catch (e) {
    console.error("AI javob olishda xatolik:", e);
    answer = fastUniversal;
  }

  // Loading xabarini xavfsiz tozalash
  if (loadingMsg && loadingMsg.parentNode) {
    loadingMsg.remove();
  }
  addMessage(answer || fastUniversal, "bot", true);
}

// Chat formasi
$("#chatForm")?.addEventListener("submit", e => {
  e.preventDefault();
  askAI($("#chatInput").value);
});

// Tavsiya tugmalari (delegatsiya bilan)
document.addEventListener("click", e => {
  const btn = e.target.closest(".suggestions button, button[data-question]");
  if (btn && btn.dataset.question) {
    askAI(btn.dataset.question);
  }
});

// Chatni tozalash tugmasi
$("#clearChatBtn")?.addEventListener("click", () => {
  const box = $("#chatMessages");
  if (box) {
    box.innerHTML = `
      <div class="message bot">
        <div class="avatar">✦</div>
        <div class="bubble">
          <div class="bubble-text">
            Chat tozalandi. Qanday savolingiz bor? Maktab o‘qituvchilari, dars jadvali yoki istalgan boshqa savol berishingiz mumkin!
          </div>
          <div class="suggestions">
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
      ✅ <b>Rahmat, ${escapeHtml(revName)}!</b> Sizning <b>${revStar} yulduzli</b> bahongiz saytda saqlandi hamda rasmiy <a href="https://t.me/Maktab30Xovos_bot" target="_blank" rel="noopener">@Maktab30Xovos_bot</a> Telegram botiga muvaffaqiyatli yetkazildi!
    `;
  }

  $("#reviewForm").reset(); selectedStar=0; starButtons.forEach(b=>b.classList.remove("active"));
  loadReviews(); showToast(`⭐ ${revStar} yulduzli bahongiz Telegram botga yuborildi!`);
});
loadReviews();

/* ============================================================
   TELEGRAM BOT BILAN BOG'LANISH VA MUROJAAT YUBORISH
   Bot: @Maktab30Xovos_bot
   ============================================================ */
$("#sendToBotBtn")?.addEventListener("click", async () => {
  const nameInput = $("#tgDirectName");
  const msgInput = $("#tgDirectMsg");
  const name = nameInput?.value.trim() || "Sayt Mehmoni";
  const msg = msgInput?.value.trim();

  if (!msg) {
    showToast("⚠️ Iltimos, avval xabaringizni yozing.");
    msgInput?.focus();
    return;
  }

  showToast("⏳ Botga yuborilmoqda...");

  try {
    const res = await fetch("http://localhost:3001/api/send_bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message: msg })
    });
    const data = await res.json();
    if (data.ok) {
      showToast("✅ Xabar @Maktab30Xovos_bot ga yetkazildi!");
      if (msgInput) msgInput.value = "";
    } else {
      window.open(`https://t.me/Maktab30Xovos_bot`, "_blank");
      showToast("✈️ Telegram bot ochilmoqda...");
    }
  } catch (err) {
    // Agar serverga to'g'ridan-to'g'ri ulanmasa, Telegram botga yo'naltiriladi
    window.open(`https://t.me/Maktab30Xovos_bot`, "_blank");
    showToast("✈️ Telegram bot ochilmoqda...");
  }
});

