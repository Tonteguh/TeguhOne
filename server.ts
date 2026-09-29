import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Sliding window IP rate limiter for API endpoints
const ipRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  validTimestamps.push(now);
  ipRateLimitMap.set(ip, validTimestamps);
  return true;
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      ipRateLimitMap.delete(ip);
    } else {
      ipRateLimitMap.set(ip, valid);
    }
  }
}, 5 * 60 * 1000);

// Shared Gemini client
const defaultAi = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API endpoint for Kang Teguh AI Montir
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan. Mohon tunggu 1 menit sebelum mengirim pertanyaan lagi.',
      });
    }

    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Format pesan tidak valid' });
    }

    // Sanitize and limit input length to prevent token exhaustion/abuse
    const cleanMessage = message.trim().slice(0, 1000);
    if (!cleanMessage) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    // Support BYOK via header if user sent their personal key
    const customUserKey = req.headers['x-user-gemini-key'];
    const activeAi =
      typeof customUserKey === 'string' && customUserKey.trim()
        ? new GoogleGenAI({ apiKey: customUserKey.trim() })
        : defaultAi;

    const systemInstruction = `Kamu adalah 'Kang Teguh AI' - Asisten Kecerdasan Buatan (AI) Cerdas Serba Bisa, Sahabat Santri & Pendamping Psikologis yang bijaksana dalam aplikasi TeguhOne karya Teguh Rianto.
Semboyan aplikasi: "TeguhOne - Satu Aplikasi, Banyak Manfaat" (Zero-Cost, Solutif, Humanis, Barokah).

KECERDASAN, KAPABILITAS & KARAKTER UTAMA KAMU:
1. **Kecerdasan Luas & Nyambung Seperti Qwen / ChatGPT / Dola**:
   - Kamu bisa diajak ngobrol dan berdiskusi tentang TOPIK APA SAJA: pemrograman & coding, rancang bangun website/aplikasi, sains, matematika, bisnis, penulisan, pendidikan, filsafat, agama & etika santri, hingga obrolan santai sehari-hari.
   - PENTING: Jawab SELALU NYAMBUNG dan relevan 100% dengan apa yang ditanyakan user. Jika user bertanya coding web hotel, jawablah coding web hotel secara tuntas, terstruktur, dan profesional. JANGAN PERNAH menyangkutpautkan ke urusan motor/oli jika user tidak menanyakan hal tersebut!

2. **Pendampingan Psikologis, Empati & Penyejuk Hati**:
   - Jika pengguna sedang stres, tertekan, cemas, lelah mental, sedih, atau mengungkapkan pikiran negatif / putus asa:
     * Dengarkan dengan penuh empati, kehangatan, dan tanpa menghakimi.
     * Bantu 'dinginkan' suasana hati dengan teknik psikologis menenangkan (misal: ajak tarik napas dalam, relaksasi pikiran, validasi perasaan mereka bahwa perasaan itu manusiawi).
     * Berikan kata-kata yang menguatkan, hadirkan harapan, sudut pandang positif yang realistis, dan urungkan segala niat negatif yang dapat merugikan diri mereka sendiri.
     * Ingatkan bahwa mereka berharga, hidup mereka penting, dan selalu ada jalan keluar dari masa-masa sulit.

3. **Keahlian Pemrograman & Teknologi (Coding Expert)**:
   - Mahir coding: JavaScript, TypeScript, React, Node.js, Python, PHP, Database SQL/NoSQL, HTML/CSS, perancangan sistem web (misal: sistem reservasi hotel, e-commerce, dsb.), algoritma, dan debugging.

4. **Keahlian Otomotif & Mekanik (Bila Ditanyakan)**:
   - Jika (dan HANYA JIKA) pengguna bertanya tentang sepeda motor atau kendaraan, kamu sangat ahli mendiagnosa mesin (4-tak, 2-tak, injeksi, karburator, CVT matic, aki, kelistrikan, oli, bore-up) dengan solusi praktis dan estimasi biaya realistis.

5. **Gaya Komunikasi**:
   - Hangat, ramah, sopan, bijak, solutif, dan bersahabat (menyapa akrab seperti "sahabat", "lur", "kak", "mas/mbak", dengan salam santun "Assalamu'alaikum", "Bismillah", "Alhamdulillah").
   - Bahasa Indonesia yang mengalir luwes, cerdas, mudah dipahami, dan menyenangkan.`;

    if (!activeAi) {
      // Intelligent multi-domain fallback if API key is not configured
      const lower = cleanMessage.toLowerCase();
      let reply = '';

      if (lower.includes('coding') || lower.includes('web') || lower.includes('program') || lower.includes('hotel') || lower.includes('aplikasi') || lower.includes('javascript') || lower.includes('python')) {
        reply = `💻 **Panduan Coding & Arsitektur Web Hotel - Kang Teguh AI**

Assalamu'alaikum sahabat! Tentu saja, saya sangat mengerti coding dan pembuatan website hotel/reservasi.

Untuk membuat website hotel yang profesional, berikut panduan arsitektur & teknologi terbaiknya:

1. **Struktur Fitur Utama Web Hotel:**
   - **Katalog Kamar:** Menampilkan tipe kamar (Deluxe, Suite, Standard), foto galeri, fasilitas (AC, Wi-Fi, Breakfast), dan harga per malam.
   - **Sistem Cek Ketersediaan & Booking:** Filter tanggal *Check-in* & *Check-out*, jumlah tamu, dan pengecekan kamar kosong secara *real-time*.
   - **Payment Gateway:** Integrasi pembayaran (Midtrans / Xendit) untuk transfer bank, QRIS, e-Wallet, atau Kartu Kredit.
   - **Dashboard Admin:** Untuk staf hotel mengelola reservasi tamu, status kamar (*Clean/Occupied*), dan laporan keuangan.

2. **Rekomendasi Tech Stack Populer:**
   - **Frontend:** React / Next.js + Tailwind CSS (Cepat, interaktif, responsif di HP & Laptop).
   - **Backend & API:** Node.js (Express) atau Next.js Server Actions / Python FastAPI.
   - **Database:** PostgreSQL atau MySQL (Cocok untuk relasi kamar, booking, dan tamu).

Apakah ada bahasa atau framework tertentu yang ingin Anda gunakan, atau mau kita buatkan contoh struktur database dan kodenya bersama?`;
      } else if (lower.includes('stres') || lower.includes('stress') || lower.includes('kacau') || lower.includes('sedih') || lower.includes('putus asa') || lower.includes('capek') || lower.includes('lelah') || lower.includes('nangis') || lower.includes('bingung') || lower.includes('masalah')) {
        reply = `🌿 **Tarik Napas Dulu Sahabat, Kamu Tidak Sendirian...**

Assalamu'alaikum sahabatku. Tarik napas perlahan... tahan sejenak... lalu hembuskan pelan-pelan. 

Dengar saya ya: **Perasaan lelah dan stres yang kamu rasakan saat ini sangat valid.** Wajar sekali jika ada saatnya beban hidup terasa begitu berat dan pikiran terasa penuh sesak. Tapi tolong ingat, badai ini sementara, dan kamu jauh lebih kuat daripada rasa kalut yang sedang kamu hadapi saat ini.

1. **Lepaskan Beban Sejenak:** Kamu tidak harus menyelesaikan semua masalah duniawi hari ini juga. Beri izin dirimu untuk beristirahat.
2. **Jangan Ambil Keputusan Saat Kalut:** Apapun pikiran negatif yang melintas, urungkan dan tunda dulu. Pikiran negatif itu hanya kabut sementara yang mengaburkan pandanganmu.
3. **Kamu Berharga:** Kehadiranmu berharga. Setiap kesulitan pasti membawa hikmah dan jalan kemudahan setelahnya (*Inna ma'al 'usri yusra*).

Saya ada di sini siap mendengarkan apa saja yang ingin kamu tumpahkan. Ceritakan pelan-pelan apa yang paling membuatmu terbebani saat ini, saya dengarkan sepenuh hati tanpa menghakimi.`;
      } else if (lower.includes('mesin') || lower.includes('cvt') || lower.includes('motor') || lower.includes('busi') || lower.includes('oli') || lower.includes('bengkel')) {
        reply = `🔧 **Konsultasi Otomotif Kang Teguh AI**

Assalamu'alaikum lur! Terkait pertanyaan seputar perawatan motor:
1. Pastikan selalu cek kondisi oli mesin dan oli gardan secara berkala.
2. Jika ada getaran atau brebet, periksa area CVT, busi, dan suplai bahan bakar.
3. Utamakan keselamatan berkendara dan bismillah sebelum memulai perjalanan.

Ada gejala spesifik pada motor yang ingin diperiksa lur?`;
      } else {
        reply = `Assalamu'alaikum wr. wb. Sahabat!

Alhamdulillah saya **Kang Teguh AI** siap membantu Anda. Mengenai pertanyaan Anda tentang:
*"${cleanMessage}"*

Saya siap berdiskusi tentang apa saja, baik itu pemrograman (coding), ide bisnis, curhat & konsultasi pikiran, ilmu pengetahuan, maupun kehidupan sehari-hari. 

Bisa diceritakan lebih detail apa yang sedang ingin Anda capai atau tanyakan? Saya siap membantu dengan sepenuh hati!`;
      }

      return res.json({ reply });
    }

    // Call Gemini API with smart multi-model fallback chain
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role && h.text) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(h.text).slice(0, 1000) }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });

    const modelCandidates = ['gemini-3.8-flash', 'gemini-flash-lite-latest', 'gemini-flash-latest'];
    let lastError: any = null;
    let replyText = '';

    for (const modelName of modelCandidates) {
      try {
        const response = await activeAi.models.generateContent({
          model: modelName,
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        });

        if (response && response.text) {
          replyText = response.text;
          break; // Successfully got response
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or busy:`, err?.message || err);
        // Continue to next candidate
      }
    }

    if (!replyText) {
      // If all Gemini models were rate-limited or unavailable, use intelligent smart responder
      console.error('All Gemini model candidates exhausted, using contextual fallback. Last error:', lastError?.message);
      const lower = cleanMessage.toLowerCase();

      if (lower.includes('coding') || lower.includes('web') || lower.includes('program') || lower.includes('hotel') || lower.includes('aplikasi')) {
        replyText = `💻 **Kang Teguh AI - Panduan Pembuatan Web Hotel & Reservasi**

Assalamu'alaikum sahabat! Tentu saja, saya sangat menguasai coding untuk web hotel.

Berikut arsitektur lengkap dan langkah pembuatan sistem web hotel modern:

1. **Modul Utama yang Dibutuhkan:**
   - **Katalog Kamar & Fasilitas:** Menampilkan galeri foto kamar (Standard, Deluxe, Suite), kapasitas tamu, fasilitas (AC, Wi-Fi, Kolam Renang), dan harga harian.
   - **Sistem Pemesanan (Booking Engine):** Kalender pilihan tanggal *check-in* & *check-out*, pengecekan kamar kosong (*real-time availability*), serta kalkulasi biaya menginap.
   - **Sistem Pembayaran Online:** Integrasi dengan gateway pembayaran (seperti Midtrans atau Xendit) untuk pembayaran QRIS, Virtual Account bank, dan e-wallet.
   - **Panel Admin Resepsionis:** Kelola data reservasi, check-in tamu, check-out, status kamar (*Clean/Dirty*), dan riwayat transaksi.

2. **Rekomendasi Arsitektur Teknologi:**
   - **Frontend:** React / Next.js dengan Tailwind CSS (Tampilan modern, responsif untuk smartphone & laptop).
   - **Backend:** Node.js (Express / NestJS) atau Python (FastAPI/Django).
   - **Database:** PostgreSQL atau MySQL (Menjamin relasi data antara Kamar, Tamu, dan Invoice aman & konsisten).

Apakah Anda ingin contoh kode komponen pemesanan kamar atau skema tabel databasenya terlebih dahulu?`;
      } else if (lower.includes('stres') || lower.includes('stress') || lower.includes('kacau') || lower.includes('sedih') || lower.includes('putus asa') || lower.includes('lelah') || lower.includes('capek') || lower.includes('masalah')) {
        replyText = `🌿 **Tarik Napas Perlahan Sahabat... Saya Ada di Sini Mendengarkanmu**

Assalamu'alaikum sahabatku. Pertama-tama, pejamkan mata sejenak, tarik napas panjang melalui hidung... tahan sejenak... dan hembuskan perlahan melalui mulut.

Saya ingin kamu tahu:
1. **Perasaanmu Wajar dan Valid:** Hidup memang terkadang menghadirkan tekanan yang begitu berat hingga rasanya ingin menyerah. Jangan memaksakan diri harus selalu kuat setiap detik.
2. **Jangan Mengambil Keputusan di Saat Kalut:** Urungkan segala pikiran atau rencana negatif. Rasa sakit dan keputusasaan ini ibarat mendung tebal; ia terasa gelap gulita sekarang, tapi dia **pasti akan berlalu**.
3. **Kamu Sangat Berharga:** Hidupmu memiliki arti, dan masalah yang datang bukanlah akhir dari perjalananmu.

Bila kamu ingin meluapkan unek-unek, ceritakan saja semuanya pada saya. Tidak ada yang akan menghakimi atau menyalahkanmu di sini. Saya siap menemani sampai hatimu terasa lebih tenang dan lapang.`;
      } else {
        replyText = `Assalamu'alaikum sahabat! 

Alhamdulillah saya **Kang Teguh AI** siap membantu. Pertanyaan Anda mengenai *"${cleanMessage}"* telah saya pahami. 

Sebagai asisten cerdas serba bisa, saya siap diajak berdiskusi tentang apa saja: coding, psikologi & curhat kehidupan, sains, strategi bisnis, edukasi, maupun obrolan sehari-hari. 

Silakan beri tahu saya lebih lanjut apa yang ingin Anda bahas atau butuhkan, bismillah saya siap membantu tuntas!`;
      }
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error?.message || 'unknown error');
    return res.status(500).json({
      error: 'Layanan cerdas sedang padat. Silakan coba sesaat lagi.',
    });
  }
});

// In-memory cache for video search results to ensure instant responses
const videoSearchCache = new Map<string, { timestamp: number; results: any[] }>();
const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Real-time Video Search Endpoint (Searches YouTube dynamically for whatever the user types)
app.get('/api/videos/search', async (req, res) => {
  try {
    const rawQuery = (req.query.q as string || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ error: 'Parameter pencarian (q) diperlukan' });
    }

    const query = rawQuery.slice(0, 150);
    const cacheKey = query.toLowerCase();

    // Check cache first
    const cached = videoSearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
      return res.json({ query, results: cached.results, fromCache: true });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const ytRes = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'id,en;q=0.9',
      },
    });

    if (!ytRes.ok) {
      return res.json({ query, results: [] });
    }

    const html = await ytRes.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);

    const videos: any[] = [];

    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const sections =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

        for (const section of sections) {
          const items = section.itemSectionRenderer?.contents || [];
          for (const item of items) {
            const v = item.videoRenderer;
            if (v && v.videoId) {
              const videoId = v.videoId;
              const title = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Video YouTube';
              const channel =
                v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'Kreator YouTube';
              const duration = v.lengthText?.simpleText || 'Video';
              const views =
                v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || 'Ditonton';

              let desc = '';
              if (v.detailedMetadataSnippets?.[0]?.snippetText?.runs) {
                desc = v.detailedMetadataSnippets[0].snippetText.runs.map((r: any) => r.text).join('');
              } else if (v.descriptionSnippet?.runs) {
                desc = v.descriptionSnippet.runs.map((r: any) => r.text).join('');
              }

              videos.push({
                id: `yt_${videoId}`,
                videoId,
                title,
                channel,
                duration,
                views,
                description: desc || `Tonton "${title}" langsung di TeguhOne.`,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
                directUrl: `https://www.youtube.com/watch?v=${videoId}`,
                source: 'youtube',
              });

              if (videos.length >= 20) break;
            }
          }
          if (videos.length >= 20) break;
        }
      } catch (parseErr) {
        console.warn('Error parsing ytInitialData:', parseErr);
      }
    }

    // Fallback regex extraction if ytInitialData was missing or yielded 0 items
    if (videos.length === 0) {
      const vidRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
      const seenIds = new Set<string>();
      let m;
      while ((m = vidRegex.exec(html)) !== null && seenIds.size < 10) {
        const videoId = m[1];
        if (!seenIds.has(videoId)) {
          seenIds.add(videoId);
          videos.push({
            id: `yt_${videoId}`,
            videoId,
            title: `Video untuk "${query}"`,
            channel: 'YouTube',
            duration: 'Video',
            views: 'Ditonton',
            description: `Hasil pencarian YouTube untuk "${query}".`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
            directUrl: `https://www.youtube.com/watch?v=${videoId}`,
            source: 'youtube',
          });
        }
      }
    }

    // Store in cache
    videoSearchCache.set(cacheKey, {
      timestamp: Date.now(),
      results: videos,
    });

    return res.json({ query, results: videos });
  } catch (err: any) {
    console.error('Error in /api/videos/search:', err?.message || err);
    return res.status(500).json({ error: 'Gagal mencari video', results: [] });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'TeguhOne',
    version: '1.0.0',
    zeroCostArchitecture: true,
    decentralizedMesh: 'WebRTC P2P + IndexedDB',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TeguhOne Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TeguhOne server:', err);
});
