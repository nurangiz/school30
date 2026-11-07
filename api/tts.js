// Vercel Serverless Function: /api/tts
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: "30-Maktab TTS Endpoint Faol" });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = (data.text || '').trim();
    const voice = data.voice || 'uz-UZ-MadinaNeural';
    const apiKey = (data.apiKey || process.env.ELEVENLABS_API_KEY || '').trim();
    const elevenVoiceId = data.elevenVoiceId || '21m00Tcm4TlvDq8ikWAM';

    if (!text) {
      return res.status(400).json({ error: 'Matn kiritilmadi' });
    }

    // 1) Foydalanuvchi ElevenLabs kalitini kiritgan bo'lsa yoki serverda sozlangan bo'lsa
    if (apiKey) {
      try {
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
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', arrayBuf.byteLength);
          return res.status(200).send(Buffer.from(arrayBuf));
        }
      } catch (e11) {
        console.warn('[TTS] ElevenLabs ulanish xatosi:', e11.message);
      }
    }

    // 2) O'zbek tili uchun 100% tabiiy, xatosiz neyrotarmoq ovozi (Madina yoki Sardor)
    try {
      const tts = new MsEdgeTTS();
      const vLower = voice.toLowerCase();
      const selectedVoice = (vLower.includes('sardor') || vLower.includes('adam') || vLower.includes('george') || vLower.includes('erkak'))
        ? 'uz-UZ-SardorNeural'
        : 'uz-UZ-MadinaNeural';

      await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text);

      const chunks = [];
      await new Promise((resolve, reject) => {
        audioStream.on('data', chunk => chunks.push(chunk));
        audioStream.on('end', resolve);
        audioStream.on('error', reject);
      });

      const audioBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      return res.status(200).send(audioBuffer);
    } catch (eEdge) {
      console.warn('[TTS] Edge TTS xatosi:', eEdge.message);
    }

    // 3) Brauzer nutq sinteziga fallback
    return res.status(200).json({ ok: false, fallback: 'browser', message: "Brauzer nutq sinteziga yo'naltirildi" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
