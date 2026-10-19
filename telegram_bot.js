/**
 * 30-MAKTAB — RASMIY TELEGRAM BOT VA SAYT INTEGRATSIYASI
 * Bot: @Maktab30Xovos_bot
 * Token: 8974507387:AAFfMzfxlaNS15I_zB1mz0qwbL3TSwLKoTs
 * Bot ID: 8974507387
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8974507387:AAFfMzfxlaNS15I_zB1mz0qwbL3TSwLKoTs';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUBSCRIBERS_FILE = path.join(__dirname, 'bot_subscribers.json');

// Obunachilar va adminlar ro'yxatini yuklash
let subscribers = new Set();
try {
  if (fs.existsSync(SUBSCRIBERS_FILE)) {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) subscribers = new Set(arr);
  }
} catch (e) {
  console.warn("Subscribers yuklashda ogohlantirish:", e.message);
}

function saveSubscribers() {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([...subscribers], null, 2), 'utf8');
  } catch (e) {}
}

// Saytdan kelgan baholar va sharhlar bazasi
const REVIEWS_FILE = path.join(__dirname, 'bot_reviews.json');
let reviewsList = [];
try {
  if (fs.existsSync(REVIEWS_FILE)) {
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) reviewsList = arr;
  }
} catch (e) {}

function saveReview(item) {
  reviewsList.unshift(item);
  if (reviewsList.length > 200) reviewsList = reviewsList.slice(0, 200);
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsList, null, 2), 'utf8');
  } catch (e) {}
}


// Maktab o'qituvchilari va ma'lumotlari bazasi
const SCHOOL_DATA = {
  name: "Xovos tumani 30-maktab",
  location: "Sirdaryo viloyati, Xovos tumani, O‘zbekiston",
  motto: "Bilim · Tarbiya · Kelajak",
  hours: "08:00 — 17:55 (2 smena)",
  lessonDuration: "45 daqiqa",
  director: "Fayzullayev To'lqin Abdug'aniyevich (Maktab direktori, matematika fanidan dars beradi, 5 yil staj)",
  zamDirector: "Aliqilov Muzaffar Sherqulovich (Zam direktor, Fizika fani o'qituvchisi, 10 yil staj)",
  mathTeachers: [
    "Fayzullayev To'lqin Abdug'aniyevich — Maktab direktori (matematika fani)",
    "Raimqulov Musulmonqul Alisher o'g'li — Informatika va matematika fani (6 yil staj)",
    "Alimov Davlat Rustam o'g'li — Informatika va matematika fani (4 yil staj)",
    "Erkayeva Lola — Matematika fani o'qituvchisi"
  ],
  historyTeachers: [
    "Karimqulov Otabek Tolibjonovich — Tarix fani o‘qituvchisi (11 yil staj, Xalq ta'limi a'lochisi)"
  ],
  scienceTeachers: [
    "Aliqilov Muzaffar Sherqulovich — Fizika fani (10 yil staj, Zam direktor)",
    "Kimyo va biologiya fani mutaxassislari"
  ],
  languageTeachers: [
    "Qochqorov Sodiq Soyibjonovich — Ona tili va adabiyot fani (20 yil staj)",
    "Mansurova Gulbahor Karimqulovna — Rus tili fani (7 yil staj)",
    "Ingliz tili fani o‘qituvchilari"
  ],
  champions: [
    "Egamberdiyev Sardar (2-sinf) — Kikboks bo‘yicha Jahon kubogi sohibi 🥇",
    "Botirov Iskandar (9-sinf) — Boks bo‘yicha viloyat chempioni 🥇",
    "Ismatullayev Yusufjon (9-sinf) — Boks bo‘yicha 3 karra viloyat chempioni 🥇",
    "Nurullayev Ozodbek (11-sinf) — Voleybol bo‘yicha tuman chempioni 🥇",
    "Nuriddin Behruz (11-sinf) — Voleybol O‘zbekiston chempionati sovrindori 🥇",
    "To‘laganov Muhammadqodir (4-sinf) — Futbol bo‘yicha Tojikiston res chempioni 🥇",
    "Abbosova Diyora (5-sinf) — Gimnastika bo‘yicha Respublika chempionati sovrindori 🏆",
    "Rahmonberdiyeva Laziza (11-sinf) — Baydarka bo‘yicha U-20 chempioni 🥇",
    "Nurullayeva Nurangiz (10-sinf) — IT dasturchi va sayt yaratuvchisi 💻"
  ],
  schedule: `⏰ **30-maktab dars va qo‘ng‘iroq jadvali:**

🔹 **1-smena:**
1-dars: 08:00 — 08:45
2-dars: 08:50 — 09:35
3-dars: 09:40 — 10:25
☕ **Katta tanaffus: 10:25 — 10:35 (10 daqiqa)**
4-dars: 10:35 — 11:20
5-dars: 11:25 — 12:10
6-dars: 12:15 — 13:00

🔹 **2-smena:**
1-dars: 13:00 — 13:45
2-dars: 13:50 — 14:35
3-dars: 14:40 — 15:25
☕ **Katta tanaffus: 15:25 — 15:35 (10 daqiqa)**
4-dars: 15:35 — 16:20
5-dars: 16:25 — 17:10
6-dars: 17:15 — 18:00

🎵 *Har kuni 8:02 da Davlat madhiyasi yangraydi.*`
};

// Telegram API ga xabar yuborish
async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const res = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("Xabar yuborishda xatolik:", err.message);
  }
}

// Barcha obunachilarga e'lon tarqatish (saytdan kelgan xabarlar uchun)
async function broadcastToSubscribers(text) {
  for (const chatId of subscribers) {
    await sendMessage(chatId, text);
  }
}

// Bosh menyu tugmalari
function getMainKeyboard() {
  return {
    keyboard: [
      [{ text: "📐 Matematika ustozlari" }, { text: "📜 Tarix ustozlari" }],
      [{ text: "🎓 Maktab direktori" }, { text: "⏰ Dars jadvali" }],
      [{ text: "🏆 Chempion o‘quvchilar" }, { text: "⭐ Sayt baholari va fikrlar" }],
      [{ text: "🎙 VoiceLab & AI ovozi" }, { text: "📍 Maktab manzili" }],
      [{ text: "🌐 Maktab veb-sayti" }]
    ],
    resize_keyboard: true,
    persistent: true
  };
}

// Inline keyboard (sayt havolasi bilan)
function getInlineSiteKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🌐 30-Maktab Rasmiy Saytini Ochish", url: "https://t.me/Maktab30Xovos_bot" }]
    ]
  };
}

// Savolga aqlli javob qaytarish
function answerQuery(text) {
  const q = text.toLowerCase().replace(/[‘'ʼ`]/g, "'").trim();

  // Baholar va sharhlar
  if (q.includes("baho") || q.includes("fikr") || q.includes("sharh") || q.includes("/reviews") || q.includes("yulduz")) {
    if (!reviewsList || reviewsList.length === 0) {
      return "⭐ *30-Maktab sayti baholari:*\n\nHozircha yangi baholar yo‘q. Saytimizda birinchi bo‘lib o‘z bahoingiz va fikringizni qoldiring!";
    }
    let res = `⭐ *30-Maktab saytida qoldirilgan so‘nggi baholar (${reviewsList.length} ta):*\n\n`;
    reviewsList.slice(0, 8).forEach((r, idx) => {
      res += `${idx + 1}. 👤 *${r.name || 'Mehmon'}*\n   💬 ${r.message || ''}\n   ⏱ ${new Date(r.date || Date.now()).toLocaleString('uz-UZ')}\n\n`;
    });
    return res;
  }

  // 1) Matematika
  if (q.includes("matematik") || q.includes("algebra") || q.includes("geometriy")) {
    return `📐 *30-maktab matematika fani o‘qituvchilari:*\n\n` +
      SCHOOL_DATA.mathTeachers.map((t, i) => `${i + 1}. ${t}`).join("\n\n") +
      `\n\n*Ustozlarimiz har kuni o‘quvchilarga chuqur bilim berib kelmoqda!*`;
  }

  // 2) Tarix
  if (q.includes("tarix")) {
    return `📜 *30-maktab tarix fani o‘qituvchilari:*\n\n` +
      SCHOOL_DATA.historyTeachers.map((t, i) => `${i + 1}. ${t}`).join("\n\n") +
      `\n\n*O‘zbekiston va jahon tarixi bo‘yicha chuqurlashtirilgan saboqlar beriladi.*`;
  }

  // 3) Direktor
  if (q.includes("direktor") || q.includes("rahbar")) {
    return `🎓 *Maktab direktori:*\n\n**${SCHOOL_DATA.director}**\n\nDirektor o‘rinbosari (Zam direktor):\n**${SCHOOL_DATA.zamDirector}**`;
  }

  // 4) Jadval
  if (q.includes("jadval") || q.includes("dars") || q.includes("qo'ng'iroq") || q.includes("soat") || q.includes("tanaffus")) {
    return SCHOOL_DATA.schedule;
  }

  // 5) Chempionlar
  if (q.includes("chempion") || q.includes("sport") || q.includes("yutuq") || q.includes("o'quvchi") || q.includes("boks") || q.includes("voleybol") || q.includes("futbol")) {
    return `🏆 *30-maktabning faxrli chempion va iqtidorli o‘quvchilari:*\n\n` +
      SCHOOL_DATA.champions.join("\n\n");
  }

  // 6) AI ovozi / VoiceLab / ElevenLabs
  if (q.includes("ovoz") || q.includes("voicelab") || q.includes("elevenlabs") || q.includes("sintez")) {
    return `🎙 *Sun’iy Intellekt Ovozi (VoiceLab & ElevenLabs):*\n\nMaktabimiz veb-saytida:\n1. **VoiceLab Speech** — siz taqdim etgan ultra-sifatli tabiiy o‘zbekcha AI nutq (\`voicelab-speech (4).wav\`).\n2. **ElevenLabs Voice-Lab** — neyrotarmoq ovoz generatori (https://elevenlabs.io/app/voice-lab).\n3. Dars qo‘ng‘iroqlari va e'lonlar chiroyli ovozda o‘qiladi!`;
  }

  // 7) Manzil
  if (q.includes("manzil") || q.includes("qayerda") || q.includes("lokatsiya")) {
    return `📍 *30-Maktab manzili:*\n${SCHOOL_DATA.location}\nKoordinata: 40.23295, 68.83591\n\nMaktab 2020-yilda ochilgan bo‘lib, zamonaviy ta’lim standartlariga to‘liq javob beradi.`;
  }

  // 8) Sayt
  if (q.includes("sayt") || q.includes("veb") || q.includes("portal")) {
    return `🌐 *30-Maktab rasmiy veb-sayti:*
Saytimizda jonli qo‘ng‘iroq, VoiceLab ovozli e'lonlari, YouTube pleyer, fanlar bo‘yicha o‘qituvchilar filtri va NURAS AI yordamchisi faoliyat yuritadi!`;
  }

  // 9) Salomlashuv
  if (q.includes("salom") || q.includes("assalom")) {
    return `Assalomu alaykum! 😊\n30-maktabning rasmiy axborot botiga xush kelibsiz. Qanday savolingiz bo‘lsa, quyidagi tugmalardan birini bosing yoki savolingizni yozing!`;
  }

  // 10) Arifmetika
  const mathMatch = q.match(/^(-?\d+(\.\d+)?)\s*([\+\-\*\/xX×÷\^])\s*(-?\d+(\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[3];
    const b = parseFloat(mathMatch[4]);
    let ans = 0;
    if (op === "+") ans = a + b;
    else if (op === "-") ans = a - b;
    else if (op === "*" || op === "x" || op === "X" || op === "×") ans = a * b;
    else if (op === "/" || op === "÷") ans = b !== 0 ? (a / b) : "Nolga bo'lish mumkin emas";
    return `🔢 *Hisoblash natijasi:*\n\`${a} ${op} ${b} = ${ans}\``;
  }

  return `🤖 *30-Maktab Yordamchi Boti:*\n\nSiz yozgan savol: _"${text}"_.\n\nMaktab o‘qituvchilari (matematika, tarix), dars jadvali, chempionlar yoki dars soatlari haqida bilish uchun menyu tugmalaridan foydalanishingiz mumkin!`;
}

// Long Polling orqali yangilanishlarni olish
let offset = 0;
async function pollUpdates() {
  try {
    const res = await fetch(`${API_URL}/getUpdates?offset=${offset}&timeout=25`);
    if (!res.ok) {
      setTimeout(pollUpdates, 3000);
      return;
    }
    const data = await res.json();
    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const userText = update.message.text.trim();
          const userName = update.message.from.first_name || "Foydalanuvchi";

          // Obunachilar bazasiga qo'shish
          if (!subscribers.has(chatId)) {
            subscribers.add(chatId);
            saveSubscribers();
          }

          console.log(`[Telegram] ${userName} (${chatId}): ${userText}`);

          if (userText === '/start') {
            const welcomeText = `Assalomu alaykum, *${userName}*! 👋\n\nMen Xovos tumani **30-maktab**ning rasmiy sun’iy intellekt va axborot botiman (@Maktab30Xovos_bot).\n\nQuyidagi menyu orqali maktabimiz o‘qituvchilari (matematika, tarix), dars jadvali va chempion o‘quvchilar haqida to‘liq ma’lumot olishingiz mumkin.`;
            await sendMessage(chatId, welcomeText, getMainKeyboard());
          } else {
            const reply = answerQuery(userText);
            await sendMessage(chatId, reply, getMainKeyboard());
          }
        }
      }
    }
  } catch (err) {
    console.error("Polling xatoligi:", err.message);
  }
  setTimeout(pollUpdates, 1000);
}

// SAYTDAN BOTGA KELUVCHI MUROJAATLAR UCHUN HTTP BRIDGE SERVER
const server = http.createServer((req, res) => {
  // CORS sarlavhalari
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/send_bot' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const name = data.name || 'Mehmon';
        const msg = data.message || '';
        console.log(`[Saytdan Botga] ${name}: ${msg}`);

        // Bahoni doimiy faylga saqlash
        saveReview({
          name: name,
          message: msg,
          date: new Date().toISOString()
        });

        const notifyText = `📩 **Saytdan yangi xabar / baho keldi (30-Maktab):**\n👤 **Kimdan:** ${name}\n💬 **Xabar:** ${msg}\n⏱ ${new Date().toLocaleString('uz-UZ')}`;
        await broadcastToSubscribers(notifyText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, subscribersCount: subscribers.size, reviewsCount: reviewsList.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/api/reviews' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, reviews: reviewsList }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: "running", bot: "@Maktab30Xovos_bot", subscribers: subscribers.size, reviews: reviewsList.length }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP Bridge Server ishga tushdi: http://localhost:${PORT}`);
});

console.log("=========================================");
console.log("30-Maktab Telegram Boti faol!");
console.log("Bot username: @Maktab30Xovos_bot");
console.log("Bot ID: 8974507387");
console.log("=========================================");

pollUpdates();
