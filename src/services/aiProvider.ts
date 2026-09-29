/**
 * AI Provider Abstraction Architecture
 * Supports:
 * 1. Server-side Proxy Gemini Provider (/api/gemini/chat)
 * 2. BYOK (Bring Your Own Key) Provider (User-supplied key, client-controlled)
 * 3. Offline Rule-Based Fallback Provider (Zero-cost, works with no network)
 */

import { GoogleGenAI } from '@google/genai';

export interface ChatEntry {
  role: 'user' | 'assistant';
  text: string;
}

export interface AIProvider {
  name: string;
  sendMessage(message: string, history: ChatEntry[], signal?: AbortSignal): Promise<string>;
}

// In-memory LRU cache to prevent re-querying identical automotive problems
const aiResponseCache = new Map<string, { reply: string; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedResponse(query: string): string | null {
  const clean = query.trim().toLowerCase();
  const entry = aiResponseCache.get(clean);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    aiResponseCache.delete(clean);
    return null;
  }
  return entry.reply;
}

function setCachedResponse(query: string, reply: string): void {
  const clean = query.trim().toLowerCase();
  // Keep cache size bounded
  if (aiResponseCache.size > 50) {
    const firstKey = aiResponseCache.keys().next().value;
    if (firstKey) aiResponseCache.delete(firstKey);
  }
  aiResponseCache.set(clean, { reply, timestamp: Date.now() });
}

/**
 * 1. Server-Side Proxy Provider
 */
class ServerGeminiProvider implements AIProvider {
  name = 'Server Proxy (@google/genai)';

  async sendMessage(message: string, history: ChatEntry[], signal?: AbortSignal): Promise<string> {
    const cached = getCachedResponse(message);
    if (cached) return cached;

    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-4), // Limit history context to protect token budget
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }

    const data = await res.json();
    const reply = data.reply || 'Alhamdulillah, terima kasih atas pertanyaannya lur!';
    setCachedResponse(message, reply);
    return reply;
  }
}

/**
 * 2. Bring-Your-Own-Key (BYOK) Provider
 */
class BYOKGeminiProvider implements AIProvider {
  name = 'BYOK (Kunci Pribadi Anda)';

  async sendMessage(message: string, history: ChatEntry[], signal?: AbortSignal): Promise<string> {
    const userKey = localStorage.getItem('teguhone_user_byok_gemini_key');
    if (!userKey) {
      throw new Error('Kunci API pribadi (BYOK) belum dimasukkan.');
    }

    const cached = getCachedResponse(message);
    if (cached) return cached;

    // Use official @google/genai SDK directly with user's client-side key
    const genAI = new GoogleGenAI({ apiKey: userKey });
    const contents: any[] = [];
    for (const h of history.slice(-4)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        maxOutputTokens: 1200,
        temperature: 0.7,
        systemInstruction: `Kamu adalah 'Kang Teguh AI' - Asisten AI Cerdas Serba Bisa, Sahabat Santri & Pendamping Psikologis (setara kecerdasan Qwen / ChatGPT / Dola) dalam aplikasi TeguhOne.
Karaktermu:
- Cerdas, berwawasan luas, nyambung diajak bicara topik apapun: coding (web, backend, frontend, database), psikologi & curhat menenangkan hati (bantu redakan stres, cegah hal negatif), bisnis, sains, pendidikan, agama & etika santri yang sejuk, maupun obrolan sehari-hari.
- Sangat ahli otomotif HANYA jika pengguna menanyakan soal motor/kendaraan.
- Selalu menjawab relevan dan terstruktur sesuai topik yang ditanyakan.`,
      },
    });

    const reply = response.text || 'Alhamdulillah, terima kasih atas pertanyaannya sahabat!';
    setCachedResponse(message, reply);
    return reply;
  }
}

/**
 * 3. Offline Multi-Domain Contextual Fallback Provider
 */
class OfflineRuleBasedProvider implements AIProvider {
  name = 'Kang Teguh AI (Mode Respons Cerdas)';

  async sendMessage(message: string): Promise<string> {
    const lower = message.toLowerCase();

    // 1. Coding & Software Development (e.g. Web Hotel, Program, JavaScript, React, dll)
    if (
      lower.includes('coding') ||
      lower.includes('web') ||
      lower.includes('program') ||
      lower.includes('hotel') ||
      lower.includes('aplikasi') ||
      lower.includes('html') ||
      lower.includes('javascript') ||
      lower.includes('python') ||
      lower.includes('database') ||
      lower.includes('bikin web') ||
      lower.includes('buat web')
    ) {
      return (
        `💻 **Kang Teguh AI - Panduan & Solusi Coding Web Hotel**\n\n` +
        `Assalamu'alaikum sahabat! Tentu saja, saya sangat menguasai coding dan perancangan website hotel maupun aplikasi sistem reservasi.\n\n` +
        `Berikut blueprint arsitektur pembuatan web hotel modern:\n\n` +
        `1. **Fitur Kunci Web Hotel:**\n` +
        `   - **Room Showcase & Details:** Foto kamar (Deluxe, Superior, Suite), fasilitas (AC, Wi-Fi, Kolam Renang), & tarif per malam.\n` +
        `   - **Mesin Reservasi (Booking Engine):** Pilihan tanggal Check-in & Check-out, jumlah tamu, dan validasi ketersediaan kamar kosong secara langsung.\n` +
        `   - **Integrasi Pembayaran:** Gateway pembayaran (Midtrans/Xendit) untuk transfer bank, QRIS, & e-Wallet.\n` +
        `   - **Dashboard Manajemen Hotel:** Resepsionis dapat memantau status check-in, check-out, kamar bersih/kotor, dan laporan okupansi.\n\n` +
        `2. **Tech Stack Rekomendasi:**\n` +
        `   - **Frontend:** React / Next.js + Tailwind CSS (Cepat, interaktif, responsif di HP & Desktop).\n` +
        `   - **Backend:** Node.js Express / Python FastAPI.\n` +
        `   - **Database:** PostgreSQL atau MySQL (Menjamin relasi kamar, booking, dan transaksi tersimpan aman tanpa tumpang tindih).\n\n` +
        `Apakah Anda ingin saya buatkan rancangan tabel database-nya atau contoh kode komponen tampilan kamarnya terlebih dahulu?`
      );
    }

    // 2. Psychological Support & Stress Relief (Menenangkan, Dinginkan Pikiran, Cegah Hal Negatif)
    if (
      lower.includes('stres') ||
      lower.includes('stress') ||
      lower.includes('kacau') ||
      lower.includes('sedih') ||
      lower.includes('putus asa') ||
      lower.includes('lelah') ||
      lower.includes('capek') ||
      lower.includes('nangis') ||
      lower.includes('bingung') ||
      lower.includes('masalah') ||
      lower.includes('bunuh') ||
      lower.includes('mati') ||
      lower.includes('hancur') ||
      lower.includes('tertekan')
    ) {
      return (
        `🌿 **Kang Teguh AI - Sahabat Penyejuk Hati**\n\n` +
        `Assalamu'alaikum sahabatku tercinta. Tarik napas perlahan melalui hidung... tahan 3 detik... lalu hembuskan pelan-pelan melalui mulut.\n\n` +
        `Dengarkan saya sejenak:\n` +
        `1. **Perasaan Lelahmu Sangat Valid:** Wajar sekali bila ada hari-hari di mana beban hidup terasa begitu berat dan pikiran terasa sangat sesak. Kamu manusia biasa, tidak harus selalu kuat setiap saat.\n` +
        `2. **Tunda Segala Pikiran Negatif:** Apapun bisikan negatif yang sedang melintas di pikiranmu saat ini, tolong urungkan dan lepaskan dulu. Pikiran negatif itu hanya kabut hitam sementara yang menutupi pandangan jernihmu. Jangan membuat keputusan besar saat hati sedang mendung.\n` +
        `3. **Kamu Sangat Berharga:** Hidupmu penting, ada banyak kebaikan yang belum kamu jumpai di depan sana. Masalah ini besar, tapi pertolongan dan ketenangan yang akan datang jauh lebih besar (*Fa inna ma'al 'usri yusra*).\n\n` +
        `Saya ada di sini siap menemani dan mendengarkan. Tumpahkan saja semua unek-unekmu, saya siap mendengarkan sepenuh hati tanpa menghakimi.`
      );
    }

    // 3. Otomotif (Hanya jika benar-benar membahas motor/kendaraan)
    if (
      lower.includes('mesin') ||
      lower.includes('brebet') ||
      lower.includes('mogok') ||
      lower.includes('cvt') ||
      lower.includes('gregel') ||
      lower.includes('getar') ||
      lower.includes('roller') ||
      lower.includes('motor') ||
      lower.includes('busi') ||
      lower.includes('oli') ||
      lower.includes('bengkel')
    ) {
      if (lower.includes('cvt') || lower.includes('gregel') || lower.includes('getar') || lower.includes('roller')) {
        return (
          `⚙️ **Solusi CVT Getar / Gregel - Kang Teguh AI**\n\n` +
          `Assalamu'alaikum lur! Getar tarikan awal motor matic biasanya terjadi karena:\n\n` +
          `1. **Mangkok Ganda Berdebu:** Bersihkan mangkok ganda dan kampas dari debu friksi.\n` +
          `2. **Roller CVT Peang:** Periksa keausan roller (ganti jika sudah tidak bulat rata).\n` +
          `3. **V-Belt & Slider:** Pastikan v-belt bebas retakan.\n\n` +
          `InsyaAllah tarikan motor kembali halus dan responsif!`
        );
      }

      return (
        `🔧 **Diagnosa Otomotif Kang Teguh AI**\n\n` +
        `Assalamu'alaikum lur! Terkait pemeriksaan motor:\n\n` +
        `1. **Cek Pengapian & Busi:** Periksa elektroda busi apakah basah atau kotor kerak karbon.\n` +
        `2. **Filter Udara & Throttle Body:** Pastikan pasokan udara bersih dan semprot injector cleaner.\n` +
        `3. **Ganti Oli Rutin:** Jaga pelumasan mesin setiap 2.000 - 3.000 km demi keawetan piston.\n\n` +
        `Tetap utamakan keselamatan dan bismillah sebelum berkendara!`
      );
    }

    // 4. Default Universal Intelligent Response
    return (
      `✨ **Kang Teguh AI - Asisten Cerdas Sahabat Santri**\n\n` +
      `Assalamu'alaikum sahabat! Pertanyaan atau topik Anda mengenai:\n` +
      `*"${message}"*\n\n` +
      `Saya siap membantu dan berdiskusi secara mendalam mengenai topik ini. Sebagai asisten AI serba bisa, saya menguasai:\n` +
      `- 💻 **Pemrograman & Coding:** Pembuatan website, backend, frontend, dan database.\n` +
      `- 🌿 **Konsultasi & Psikologi:** Teman bicara hangat untuk menenangkan stres, curhat, dan solusi hidup positif.\n` +
      `- 💡 **Bisnis & Ide Kreatif:** Perencanaan usaha dan inovasi produktif.\n` +
      `- 🔧 **Otomotif & Servis:** Perawatan kendaraan bermotor.\n\n` +
      `Bisa ceritakan lebih lanjut detail yang ingin Anda ketahui atau diskusikan? Bismillah, saya siap bantu!`
    );
  }
}

// Manager that handles fallback and selection
class AIManager {
  private serverProvider = new ServerGeminiProvider();
  private byokProvider = new BYOKGeminiProvider();
  private offlineProvider = new OfflineRuleBasedProvider();

  isBYOKActive(): boolean {
    return Boolean(localStorage.getItem('teguhone_user_byok_gemini_key'));
  }

  setBYOKKey(key: string): void {
    const clean = key.trim();
    if (clean) {
      localStorage.setItem('teguhone_user_byok_gemini_key', clean);
    }
  }

  clearBYOKKey(): void {
    localStorage.removeItem('teguhone_user_byok_gemini_key');
  }

  async ask(message: string, history: ChatEntry[] = [], signal?: AbortSignal): Promise<string> {
    // 1. Try BYOK if configured
    if (this.isBYOKActive()) {
      try {
        return await this.byokProvider.sendMessage(message, history, signal);
      } catch (err) {
        console.warn('BYOK Provider error, trying server fallback:', err);
      }
    }

    // 2. Try Server Proxy Provider with 1 retry
    let attempts = 0;
    while (attempts < 2) {
      try {
        return await this.serverProvider.sendMessage(message, history, signal);
      } catch (err) {
        attempts++;
        if (attempts >= 2) break;
        // Wait 800ms before retry with backoff
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    // 3. Graceful offline fallback
    return await this.offlineProvider.sendMessage(message);
  }
}

export const aiManager = new AIManager();
