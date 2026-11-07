// Vercel Serverless Function: /api/ai
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: "30-Maktab AI Endpoint Faol" });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const question = (data.question || '').trim();
    const apiKey = (data.apiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!question) {
      return res.status(400).json({ ok: false, error: 'Savol kiritilmadi' });
    }

    // 1. Google Gemini 1.5 Flash (Rasmiy API)
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
            return res.status(200).json({ ok: true, source: 'gemini', answer: ans.trim() });
          }
        }
      } catch (eG) {
        console.warn('[AI] Gemini API xatosi:', eG.message);
      }
    }

    // 2. O'zbekcha Vikipediya Ensiklopediyasi intellektual qidiruv
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
          return res.status(200).json({ ok: true, source: 'wikipedia', answer: wikiAns });
        }
      }
    } catch (eW) {
      console.warn('[AI] Vikipediya qidiruv xatosi:', eW.message);
    }

    return res.status(200).json({ ok: false, message: 'fallback_to_local' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
