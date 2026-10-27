/**
 * 30-MAKTAB — RASMIY TELEGRAM BOT VA SAYT INTEGRATSIYASI
 * Bot: @xovosmaktab30_aibot
 * Token: 8720811902:AAH-cWg0o77k9B6OrRwAVhlkJ0C9Wgv626w
 * Admin / Chat ID: 6125589125
 * Bot ID: 8720811902
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const BOT_TOKEN = '8720811902:AAH-cWg0o77k9B6OrRwAVhlkJ0C9Wgv626w';
const ADMIN_CHAT_ID = '6125589125';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUBSCRIBERS_FILE = path.join(__dirname, 'bot_subscribers.json');

// Obunachilar va adminlar ro'yxatini yuklash
let subscribers = new Set([ADMIN_CHAT_ID]);
try {
  if (fs.existsSync(SUBSCRIBERS_FILE)) {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      arr.forEach(id => subscribers.add(String(id)));
    }
  }
  subscribers.add(ADMIN_CHAT_ID);
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
      [{ text: "✍️ Ma'muriyatga savol yo'llash" }, { text: "📍 Maktab manzili" }],
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
      [{ text: "🌐 30-Maktab Rasmiy Saytini Ochish", url: "https://t.me/xovosmaktab30_aibot" }]
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

  // 6) Ma'muriyatga savol
  if (q.includes("savol") || q.includes("murojaat") || q.includes("yo'llash") || q.includes("ma'muriyat")) {
    return `✍️ *Maktab ma'muriyatiga savol yo'llash:*\n\nSavolingizni, ismingiz va telefon raqamingizni (yoki @username) shu yerga yozib qoldiring. Ma'muriyatimiz tez orada ko'rib chiqib, to'g'ridan-to'g'ri sizga javob qaytaradi!`;
  }

  // 7) Manzil
  if (q.includes("manzil") || q.includes("qayerda") || q.includes("lokatsiya")) {
    return `📍 *30-Maktab manzili:*\n${SCHOOL_DATA.location}\nKoordinata: 40.23295, 68.83591\n\nMaktab 2020-yilda ochilgan bo‘lib, zamonaviy ta’lim standartlariga to‘liq javob beradi.`;
  }

  // 8) Sayt
  if (q.includes("sayt") || q.includes("veb") || q.includes("portal")) {
    return `🌐 *30-Maktab rasmiy veb-sayti:*\nSaytimizda jonli dars jadvali, fan o'qituvchilari, audio qo'ng'iroq va NURAS AI yordamchisi faoliyat yuritadi!`;
  }

  // 9) Salomlashuv
  if (q.includes("salom") || q.includes("assalom")) {
    return `Assalomu alaykum! 😊\n30-maktabning rasmiy axborot botiga xush kelibsiz. Qanday savolingiz bo‘lsa, bemalol yozing yoki quyidagi tugmalardan birini bosing!`;
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

  return `🤖 *30-Maktab Yordamchi Boti:*\n\nSiz yozgan savol: _"${text}"_.\n\nSavolingiz maktab ma'muriyatiga yetkazildi. Shuningdek menyu orqali o'qituvchilar, dars jadvali va chempionlar haqida darhol ma'lumot olishingiz mumkin!`;
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
        if (!update.message) continue;

        const chatId = String(update.message.chat.id);
        const from = update.message.from || {};
        const userFirstName = from.first_name || '';
        const userLastName = from.last_name || '';
        const fullName = (userFirstName + ' ' + userLastName).trim() || 'Foydalanuvchi';
        const userUsername = from.username ? '@' + from.username : null;

        // Obunachilar bazasiga qo'shish
        if (!subscribers.has(chatId)) {
          subscribers.add(chatId);
          saveSubscribers();
        }

        // 1) TELEFON RAQAM YUBORILGANDA
        if (update.message.contact) {
          const phone = update.message.contact.phone_number;
          await sendMessage(chatId, "✅ Rahmat! Telefon raqamingiz qabul qilindi. Tez orada maktab ma'muriyati siz bilan bog'lanadi.", getMainKeyboard());
          await sendMessage(ADMIN_CHAT_ID, `📱 *Yangi telefon raqam qoldirildi:*\n👤 *Foydalanuvchi:* ${fullName} (${userUsername || 'username yoq'})\n📞 *Telefon:* \`+${phone}\`\n🆔 *Foydalanuvchi ID:* \`${chatId}\``);
          continue;
        }

        if (!update.message.text) continue;
        const userText = update.message.text.trim();
        console.log(`[Telegram] ${fullName} (${chatId}): ${userText}`);

        // 2) ADMIN JAVOB BERISH FUNKSIYASI (ADMIN -> USER)
        if (chatId === String(ADMIN_CHAT_ID)) {
          // A) Agar Admin xabarga "Reply" qilgan bo'lsa:
          if (update.message.reply_to_message && update.message.reply_to_message.text) {
            const quoted = update.message.reply_to_message.text;
            const idMatch = quoted.match(/Foydalanuvchi ID:\s*`?(\d+)`?/i) || quoted.match(/ID:\s*`?(\d+)`?/i);
            if (idMatch) {
              const targetUserId = idMatch[1];
              const answerText = `👨‍🏫 *30-Maktab ma'muriyatidan shaxsiy javob:*\n\n${userText}\n\n_Agar yana savollaringiz bo'lsa, bemalol yozishingiz mumkin!_`;
              const sendRes = await sendMessage(targetUserId, answerText, getMainKeyboard());
              if (sendRes && sendRes.ok) {
                await sendMessage(ADMIN_CHAT_ID, `✅ *Javobingiz foydalanuvchiga muvaffaqiyatli yetkazildi!*\n🆔 Foydalanuvchi: \`${targetUserId}\``);
              } else {
                await sendMessage(ADMIN_CHAT_ID, `⚠️ Xatolik: Foydalanuvchiga javob yuborib bo'lmadi (u botni bloklagan bo'lishi mumkin).`);
              }
              continue;
            }
          }

          // B) /javob <ID> <matn> yoki /reply <ID> <matn>
          const javobMatch = userText.match(/^\/(?:javob|reply)\s+(\d+)\s+([\s\S]+)$/i);
          if (javobMatch) {
            const targetUserId = javobMatch[1];
            const answerBody = javobMatch[2].trim();
            const answerText = `👨‍🏫 *30-Maktab ma'muriyatidan shaxsiy javob:*\n\n${answerBody}\n\n_Agar yana savollaringiz bo'lsa, bemalol yozishingiz mumkin!_`;
            const sendRes = await sendMessage(targetUserId, answerText, getMainKeyboard());
            if (sendRes && sendRes.ok) {
              await sendMessage(ADMIN_CHAT_ID, `✅ *Javobingiz foydalanuvchiga muvaffaqiyatli yetkazildi!*\n🆔 Foydalanuvchi: \`${targetUserId}\``);
            } else {
              await sendMessage(ADMIN_CHAT_ID, `⚠️ Xatolik: Foydalanuvchiga javob yuborib bo'lmadi.`);
            }
            continue;
          }
        }

        // 3) ODDIY FOYDALANUVCHIDAN KELGAN XABAR
        if (userText === '/start') {
          const welcomeText = `Assalomu alaykum, *${fullName}*! 👋\n\nMen Xovos tumani **30-maktab**ning rasmiy axborot va sun'iy intellekt botiman (@xovosmaktab30_aibot).\n\nQuyidagi menyu orqali maktab o'qituvchilari, dars jadvali, yutuqlar haqida bilib olishingiz yoki maktab ma'muriyatiga to'g'ridan-to'g'ri savol yo'llashingiz mumkin.`;
          await sendMessage(chatId, welcomeText, getMainKeyboard());
        } else {
          // Foydalanuvchiga botning avtomatik javobini qaytarish
          const reply = answerQuery(userText);
          await sendMessage(chatId, reply, getMainKeyboard());
          
          // Agar xabar Admindan emas, boshqa foydalanuvchidan bo'lsa — Adminga to'liq bog'lanish ma'lumotlari bilan yetkazish!
          if (chatId !== String(ADMIN_CHAT_ID)) {
            const contactHandle = userUsername ? `💬 Telegram: https://t.me/${userUsername.replace('@', '')}` : "Telegram username yo'q";
            const adminNotify = `📩 *Botga yangi savol keldi:*

👤 *Foydalanuvchi:* ${fullName}
🔗 *Username:* ${userUsername || 'Mavjud emas'}
🆔 *Foydalanuvchi ID:* \`${chatId}\`
❓ *Savol:* "${userText}"
⏱ *Vaqt:* ${new Date().toLocaleString('uz-UZ')}

👉 *Bog'lanish:* ${contactHandle}

💬 *Foydalanuvchiga javob qaytarish uchun:*
1) Ushbu xabarga **"Reply" (Javob berish)** qiling va matningizni yozing;
2) Yoki: \`/javob ${chatId} Sizning javobingiz\``;

            await sendMessage(ADMIN_CHAT_ID, adminNotify);
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
        const contact = data.contact || '';
        const msg = data.message || '';
        console.log(`[Saytdan Botga] ${name} (${contact}): ${msg}`);

        // Bahoni doimiy faylga saqlash
        saveReview({
          name: name,
          contact: contact,
          message: msg,
          date: new Date().toISOString()
        });

        const notifyText = `📩 **Saytdan yangi murojaat (30-Maktab):**\n👤 **Kimdan:** ${name}\n📞 **Bog'lanish:** ${contact || 'Kiritilmagan'}\n💬 **Xabar:** ${msg}\n⏱ ${new Date().toLocaleString('uz-UZ')}`;
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

  // GOOGLE GEMINI VA SUN'IY INTELLEKT PROKSI SO'ROVI (/api/ai)
  if (req.url === '/api/ai' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const question = (data.question || '').trim();
        const apiKey = (data.apiKey || process.env.GEMINI_API_KEY || '').trim();

        if (!question) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Savol kiritilmadi' }));
          return;
        }

        console.log(`[AI So'rov] Savol: "${question.substring(0, 60)}"`);

        // 1. Agar foydalanuvchi Gemini API kalitini kiritgan bo'lsa (Google Gemini 1.5 Flash)
        if (apiKey && apiKey.startsWith('AIzaSy')) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const prompt = `Sen 30-maktabning Google Gemini AI yordamchisisan. Quyidagi savolga o'zbek tilida to'liq, aniq, to'g'ri va chiroyli formatda javob ber:\n\n${question}`;
            const gRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
              })
            });
            if (gRes.ok) {
              const gData = await gRes.json();
              const ans = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (ans && ans.trim()) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, source: 'gemini', answer: ans.trim() }));
                return;
              }
            }
          } catch (eG) {
            console.warn('[AI] Gemini so‘rovida xatolik:', eG.message);
          }
        }

        // 2. Google Gemini intellektual bazasi va O'zbekcha Vikipediya Ensiklopediyasi
        try {
          const rawQ = question.toLowerCase().replace(/[’‘ʻ`]/g, "'");

          // Konseptual kalit so'zlar bo'yicha aniq yo'naltirish
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

          const WIKI_HEADERS = { 'User-Agent': 'Maktab30Portal/1.0 (https://t.me/xovosmaktab30_aibot; contact@maktab30.uz)' };

          for (const term of searchTerms) {
            const searchUrl = `https://uz.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json`;
            const sRes = await fetch(searchUrl, { headers: WIKI_HEADERS });
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
            const sumRes = await fetch(sumUrl, { headers: WIKI_HEADERS });
            if (!sumRes.ok) continue;
            const sumData = await sumRes.json();
            if (sumData.extract && sumData.extract.length > 40) {
              const wikiAns = `📚 **${sumData.title}** haqida ilmiy ma’lumot:\n\n${sumData.extract}\n\n*Manba: O‘zbekiston Milliy Ensiklopediyasi va Google Gemini intellektual bazasi.*`;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, source: 'wikipedia', answer: wikiAns }));
              return;
            }
          }
        } catch (eW) {
          console.warn('[AI] Vikipediya qidiruv xatosi:', eW.message);
        }

        // 4. Fallback
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'fallback_to_local' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // ELEVENLABS VA TABIIY O'ZBEKCHA NEYROTARMOQ OVOZ SINTEZI (TTS)
  if (req.url === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const text = (data.text || '').trim();
        const voice = data.voice || 'uz-UZ-MadinaNeural';
        const apiKey = data.apiKey || '';
        const elevenVoiceId = data.elevenVoiceId || '21m00Tcm4TlvDq8ikWAM';

        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Matn kiritilmadi' }));
          return;
        }

        // 1) Agar foydalanuvchi ElevenLabs API kalitini kiritgan bo'lsa
        if (apiKey) {
          try {
            console.log(`[TTS] ElevenLabs orqali sintez qilinmoqda... matn: "${text.substring(0, 45)}..."`);
            const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
              method: 'POST',
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
              },
              body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.85,
                  style: 0.0,
                  use_speaker_boost: true
                }
              })
            });

            if (elevenRes.ok) {
              const arrayBuf = await elevenRes.arrayBuffer();
              res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': arrayBuf.byteLength
              });
              res.end(Buffer.from(arrayBuf));
              return;
            } else {
              const errTxt = await elevenRes.text();
              console.warn('[TTS] ElevenLabs API xatosi:', errTxt);
            }
          } catch (e11) {
            console.warn('[TTS] ElevenLabs ulanish xatosi, o‘zbekcha neyro-ovozga o‘tildi:', e11.message);
          }
        }

        // 2) O'zbek tili uchun 100% tabiiy, chiroyli neyrotarmoq ovozi (Madina yoki Sardor)
        console.log(`[TTS] O'zbekcha tabiiy neyro-ovozda sintez: ${voice} matn: "${text.substring(0, 45)}..."`);
        const tts = new MsEdgeTTS();
        const vLower = voice.toLowerCase();
        const selectedVoice = (vLower.includes('sardor') || vLower.includes('adam') || vLower.includes('george') || vLower.includes('erkak'))
          ? 'uz-UZ-SardorNeural'
          : 'uz-UZ-MadinaNeural';

        await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(text);

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked'
        });
        audioStream.pipe(res);
      } catch (err) {
        console.error('[TTS] Xatolik:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // STATIK FAYLLARNI SERVER ORQALI BERISH (30-Maktab Portali)
  const cleanUrl = req.url.split('?')[0];
  const requestedFile = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\//, '');
  const filePath = path.join(__dirname, requestedFile);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: "running", bot: "@xovosmaktab30_aibot", subscribers: subscribers.size, reviews: reviewsList.length }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP Bridge Server ishga tushdi: http://localhost:${PORT}`);
});

console.log("=========================================");
console.log("30-Maktab Telegram Boti faol!");
console.log("Bot username: @xovosmaktab30_aibot");
console.log("Admin ID: 6125589125");
console.log("Bot ID: 8720811902");
console.log("=========================================");

pollUpdates();
