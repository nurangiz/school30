30-MAKTAB — NURAS
===================

Fayllar:
- index.html
- style.css
- script.js
- assets/maktab-old-korinishi.jpg
- assets/maktab-darvoza.jpg

ISHGA TUSHIRISH:
1. Papkani VS Code'da oching.
2. index.html ni Live Server orqali oching.
3. Telefonda ham responsive ishlaydi.

O'QITUVCHI QO'SHISH:
index.html -> #teachers -> .teacher-card blokini to'liq nusxa qiling.
Rasm uchun:
<img src="assets/teacher-1.jpg" alt="O'qituvchi ismi">
Keyin assets papkasiga rasmingizni tashlang.

O'QUVCHI QO'SHISH:
index.html -> #students -> .student-card blokini nusxa qiling.
Rasm uchun:
<img src="assets/oquvchi-1.jpg" alt="O'quvchi ismi">

MAKTAB HAQIDA:
.about-card blokini nusxa qilib yangi ma'lumot qo'shing.

QO'NG'IROQ:
script.js -> schedule massivini o'zgartiring.
Audio:
index.html ichidagi <audio> teglarida comment qilingan <source> qatorini yoqing:
<source src="assets/qongiroq.mp3" type="audio/mpeg">
Faylni assets papkasiga qo'ying.

8:02 MUSIQA:
morningAudio ichiga o'zingizning audio faylingizni qo'ying.
Brauzer autoplayni bloklashi mumkin, shuning uchun sahifada "Ovozlarni yoqish" tugmasini bir marta bosing.

AI:
script.js -> SCHOOL_KNOWLEDGE ga o'zingizning maktab ma'lumotlaringizni qo'shing.
Masalan:
{ q: "Direktor kim?", a: "Direktor: Ism Familiya." }

HAQIQIY AI:
AI_CONFIG.mode = "api"
AI_CONFIG.endpoint = "SIZNING_BACKEND_ENDPOINTINGIZ"
AI_CONFIG.apiKey = "..."
Frontendga API key qo'yish xavfsiz emas. Real sayt uchun backend/proxy ishlating.

XARITA:
OpenStreetMap koordinatasi 40.23295, 68.83591 asosida qo'yilgan.
Bu koordinata internetdagi xarita ma'lumotidan olingan va joylashuvni tekshirib,
zarur bo'lsa iframe va marker koordinatasini almashtiring.

IJTIMOIY TARMOQLAR:
index.html footeridagi 3 ta href:
Telegram, Instagram, YouTube
linklarini o'zingiznikiga almashtiring.

BAHOLASH:
Hozircha localStorage: faqat shu brauzerda ko'rinadi.
Barcha foydalanuvchilarga umumiy ko'rinishi uchun backend/Firebase/Supabase
ulash kerak.

MUHIM:
"Faqat men o'zgartira olaman"ni faqat HTML/CSS/JS bilan haqiqiy xavfsizlik
sifatida ta'minlab bo'lmaydi — kod brauzerga kelgani uchun uni ko'rish mumkin.
Admin tahrirlash funksiyasi qo'shilsa, server tomonida autentifikatsiya kerak.
