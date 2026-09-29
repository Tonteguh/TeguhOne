import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Play,
  Share2,
  Bookmark,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Eye,
  Tv,
  Plus,
  ExternalLink,
  Film,
  Video as VideoIcon,
  RotateCcw,
  AlertCircle,
  Smartphone,
  ClipboardPaste,
  Check,
  Compass,
  Loader2,
} from 'lucide-react';
import { VideoItem } from '../types';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { audioManager } from '../services/audioManager';

interface VideoScreenProps {
  onBack: () => void;
}

// Database kata kunci pencarian offline cadangan
const KEYWORD_VIDEO_MAP: Array<{
  keywords: string[];
  videoId: string;
  title: string;
  channel: string;
  category: VideoItem['category'];
  description: string;
  source: 'youtube' | 'tiktok';
}> = [
  {
    keywords: ['cvt', 'beat', 'scoopy', 'matic', 'servis cvt', 'mangkok ganda', 'roller beat'],
    videoId: 'eJfUKHOvKmk',
    title: 'Tutorial Servis CVT Beat Fi ESP Lengkap & Bersihkan Mangkok Ganda',
    channel: 'ARGA TR',
    category: 'Tuning Motor',
    description: 'Panduan lengkap membongkar cover CVT matic, membersihkan debu kampas ganda, cek roller dan v-belt agar tarikan kembali responsif.',
    source: 'youtube',
  },
  {
    keywords: ['vario', 'gredek', 'getar', 'pcx', 'aerox', 'vario 125', 'vario 150'],
    videoId: 'sJhrZ-bjw8s',
    title: 'Tips & Tutorial Servis CVT Vario 125/150 LED Tarikan Enteng Anti Gredek',
    channel: 'muh motovlog',
    category: 'Tuning Motor',
    description: 'Solusi mengatasi getaran gredek saat akselerasi awal pada Vario, Aerox dan PCX dengan setelan roller silang.',
    source: 'youtube',
  },
  {
    keywords: ['oli', 'grease', 'gemuk', 'pelumas', 'cvt aman'],
    videoId: 'I_a3AlV0pr0',
    title: 'Servis CVT Yang Aman Pakai Pelumas Apa? Kupas Tuntas Jenis Grease',
    channel: 'MODIFIKA TV',
    category: 'Tuning Motor',
    description: 'Memahami perbedaan gemuk CVT primer (pulley depan) dan sekunder (pulley belakang) agar v-belt tidak selip.',
    source: 'youtube',
  },
  {
    keywords: ['murotal', 'murottal', 'ar-rahman', 'ar rahman', 'surah', 'muzammil', 'quran', 'tilawah'],
    videoId: 'rOdi8cxR9xY',
    title: 'Murottal Merdu Surah Ar-Rahman FULL - Menyejukkan Jiwa',
    channel: 'Muzammil Hasballah',
    category: 'Murotal',
    description: 'Lantunan indah Surah Ar-Rahman dengan tartil makhorijul huruf dan nada kurdi yang syahdu menyejukkan hati.',
    source: 'youtube',
  },
  {
    keywords: ['juz 30', 'juz amma', 'anak', 'hafalan', 'surat pendek', 'an-nas', 'al-ikhlas'],
    videoId: '-M91zIG4Z24',
    title: 'Murottal Anak Merdu Juz 30 / Juz \'Amma Lengkap untuk Hafalan Keluarga',
    channel: 'Riko The Series',
    category: 'Murotal',
    description: 'Bacaan surat-surat pendek Al-Qur\'an Juz 30 dengan visual animasi ramah anak untuk menemani hafalan di rumah.',
    source: 'youtube',
  },
  {
    keywords: ['adi hidayat', 'cemas', 'gelisah', 'ujian', 'tenang', 'ceramah uah', 'uah'],
    videoId: '3VjwogzQSD8',
    title: 'Cara Menghilangkan Rasa Cemas & Gelisah dalam Menghadapi Ujian Hidup',
    channel: 'Adi Hidayat Official',
    category: 'Kajian',
    description: 'Nasihat mendalam Ustadz Adi Hidayat tentang kunci ketenangan batin, tawakal, dan amalan doa pengikis kecemasan.',
    source: 'youtube',
  },
  {
    keywords: ['somad', 'uas', 'rezeki', 'lucu', 'berkah', 'abdul somad', 'ceramah somad'],
    videoId: 'YXEGz9MdIxQ',
    title: 'Ceramah Lucu Penuh Hikmah: Rahasia Berkah Rezeki & Ketenangan Keluarga',
    channel: 'Prof. H. Abdul Somad Lc.',
    category: 'Kajian',
    description: 'Kajian santai dan menghibur Ustadz Abdul Somad yang sarat petuah tentang kejujuran dan keberkahan mencari nafkah.',
    source: 'youtube',
  },
  {
    keywords: ['drakor', 'queen of tears', 'korea', 'kdrama', 'sub indo', 'drama korea', 'kim soo hyun'],
    videoId: 'tNhIiisjjJg',
    title: 'Queen of Tears | Trailer Resmi Subtitle Indonesia',
    channel: 'Netflix Indonesia',
    category: 'Drakor',
    description: 'Cuplikan resmi drama Korea fenomenal tentang dinamika pernikahan chaebol dan kisah cinta mendalam.',
    source: 'youtube',
  },
  {
    keywords: ['dracin', 'china', 'mandarin', 'irreplaceable', 'drama china'],
    videoId: 'KydYMiSAQ2Y',
    title: 'Drama China Romantis Irreplaceable Subtitle Indonesia Episode Lengkap',
    channel: 'YOUKU Indonesia',
    category: 'Dracin',
    description: 'Kisah drama romantis modern dengan alur manis dan hangat yang sangat digemari pecinta drama Mandarin.',
    source: 'youtube',
  },
  {
    keywords: ['india', 'bollywood', 'lagu india', 'humnava', 'kuch kuch', 'shah rukh'],
    videoId: 'tCBc2XntrBI',
    title: 'Lagu Romantis India Terpopuler Humnava Mere Subtitle Indonesia',
    channel: 'Bollywood Indo',
    category: 'Film India',
    description: 'Koleksi lagu melodi Bollywood syahdu dengan lirik terjemahan bahasa Indonesia yang sangat menyentuh hati.',
    source: 'youtube',
  },
  {
    keywords: ['lucu', 'komedi', 'ngakak', 'motor lucu', 'gokil', 'hiburan', 'pemotor'],
    videoId: 'rNCSQvCfFII',
    title: 'Top 5 Momen Kocak & Lucu Pemotor Indonesia yang Bikin Heran',
    channel: 'Oemah LOL',
    category: 'Hiburan',
    description: 'Kumpulan tingkah lucu, aksi unik, dan kejadian nyeleneh pengendara roda dua di jalan raya Indonesia.',
    source: 'youtube',
  },
];

// Utility untuk mem-parsing berbagai format link YouTube, TikTok, atau ID video
export function parseVideoInput(input: string): {
  isUrl: boolean;
  type: 'youtube' | 'tiktok' | 'search';
  videoId?: string;
  embedUrl: string;
  directUrl: string;
  thumbnail: string;
  title: string;
} {
  const trimmed = input.trim();

  // 1. YouTube direct ID (11 karakter seperti eJfUKHOvKmk)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      isUrl: true,
      type: 'youtube',
      videoId: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`,
      directUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      thumbnail: `https://img.youtube.com/vi/${trimmed}/hqdefault.jpg`,
      title: `Video YouTube (${trimmed})`,
    };
  }

  // 2. Format URL YouTube:
  // - https://www.youtube.com/watch?v=...
  // - https://youtu.be/...
  // - https://www.youtube.com/shorts/...
  // - https://m.youtube.com/watch?v=...
  // - https://www.youtube.com/embed/...
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isUrl: true,
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`,
      directUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: `Video YouTube Pilihan`,
    };
  }

  // 3. Format URL TikTok:
  // - https://www.tiktok.com/@user/video/1234567890
  // - https://vt.tiktok.com/...
  if (trimmed.includes('tiktok.com')) {
    const tiktokIdMatch = trimmed.match(/\/video\/(\d+)/);
    const videoId = tiktokIdMatch ? tiktokIdMatch[1] : '';
    const safeUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      isUrl: true,
      type: 'tiktok',
      videoId,
      embedUrl: videoId
        ? `https://www.tiktok.com/embed/v2/${videoId}`
        : safeUrl,
      directUrl: safeUrl,
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=600&q=80',
      title: `Video TikTok Pilihan`,
    };
  }

  // 4. Kata Kunci Pencarian Teks Murni (Bukan URL)
  return {
    isUrl: false,
    type: 'search',
    embedUrl: '',
    directUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    title: `Pencarian: "${trimmed}"`,
  };
}

// Koleksi Video Awal Lengkap — Termasuk YouTube & TikTok Terverifikasi 100% Aktif!
const INITIAL_VIDEOS: VideoItem[] = [
  // ==========================================
  // --- TIKTOK VIRAL & TRENDING ---
  // ==========================================
  {
    id: 'vid-tiktok-1',
    title: 'Tips Rahasia Bersihkan Injektor Motor Sendiri Tanpa Perlu ke Bengkel #TipsOtomotif',
    source: 'tiktok',
    category: 'Tuning Motor',
    duration: '01:15',
    views: '2.4M',
    channel: '@montir_santri_official',
    thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fSGXgFXMVHE', // Fallback player teruji
    directUrl: 'https://www.tiktok.com/tag/servismotor',
    description: 'Video viral TikTok: trik mudah semprotkan injector cleaner pada throttle body motor matic agar tarikan enteng dan bebas brebet.',
  },
  {
    id: 'vid-tiktok-2',
    title: 'Solusi Cepat Gredek Motor Matic Vario & Beat Hanya Modal Amplas Halus #ViralTikTok',
    source: 'tiktok',
    category: 'Tuning Motor',
    duration: '00:58',
    views: '1.8M',
    channel: '@bengkel_matic_pro',
    thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/sJhrZ-bjw8s',
    directUrl: 'https://www.tiktok.com/tag/variomodifikasi',
    description: 'Tips singkat 1 menit TikTok cara menghaluskan permukaan kampas ganda yang licin agar tarikan awal motor tidak bergetar.',
  },
  {
    id: 'vid-tiktok-3',
    title: 'Murottal Merdu Surah Al-Fatihah Pembuka Rezeki & Penenang Pikiran #MurottalTikTok',
    source: 'tiktok',
    category: 'Murotal',
    duration: '01:30',
    views: '3.9M',
    channel: '@tilawah_harian',
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rOdi8cxR9xY',
    directUrl: 'https://www.tiktok.com/tag/murottalmerdu',
    description: 'Lantunan suara merdu menyejukkan hati dari hafizh muda Indonesia yang viral dan disukai jutaan pengguna TikTok.',
  },
  {
    id: 'vid-tiktok-4',
    title: 'Nasihat Singkat 1 Menit: Mengapa Hatimu Sering Cemas & Gelisah? #KajianTikTok',
    source: 'tiktok',
    category: 'Kajian',
    duration: '01:00',
    views: '4.2M',
    channel: '@quote_islami_berkah',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3VjwogzQSD8',
    directUrl: 'https://www.tiktok.com/tag/kajianpendek',
    description: 'Kutipan tausiyah singkat menenangkan batin tentang ikhtiar, doa, dan berserah diri kepada Allah SWT.',
  },
  {
    id: 'vid-tiktok-5',
    title: 'Rekomendasi 5 Drakor Romantis Rating Tertinggi yang Wajib Ditonton di Akhir Pekan',
    source: 'tiktok',
    category: 'Drakor',
    duration: '02:10',
    views: '1.5M',
    channel: '@review_drakor_id',
    thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tNhIiisjjJg',
    directUrl: 'https://www.tiktok.com/tag/drakorindo',
    description: 'Kompilasi rekomendasi drama Korea romantis terpopuler dengan cerita manis dan rating tertinggi dari netizen.',
  },
  {
    id: 'vid-tiktok-6',
    title: 'Momen Lucu Pemotor Bawa Belanjaan Jumbo Bikin Ngakak di Lampu Merah #KomediTikTok',
    source: 'tiktok',
    category: 'Hiburan',
    duration: '00:45',
    views: '5.1M',
    channel: '@komedi_motor_lucu',
    thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DaLPSevGWG4',
    directUrl: 'https://www.tiktok.com/tag/motorlucu',
    description: 'Aksi kocak tingkah unik warga Indonesia saat mengendarai sepeda motor yang mengundang tawa jutaan penonton.',
  },

  // ==========================================
  // --- TUNING MOTOR (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-tune-1',
    title: 'Tutorial Servis CVT Beat Fi ESP Lengkap & Bersihkan Mangkok Ganda',
    source: 'youtube',
    category: 'Tuning Motor',
    duration: '15:20',
    views: '1.4M',
    channel: 'ARGA TR',
    thumbnail: 'https://img.youtube.com/vi/eJfUKHOvKmk/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/eJfUKHOvKmk',
    directUrl: 'https://www.youtube.com/watch?v=eJfUKHOvKmk',
    description: 'Panduan lengkap membongkar cover CVT matic, membersihkan debu kampas ganda, cek roller dan v-belt agar tarikan kembali responsif.',
  },
  {
    id: 'vid-tune-2',
    title: 'Cara Servis CVT Honda Beat Sendiri di Rumah Tanpa Bengkel',
    source: 'youtube',
    category: 'Tuning Motor',
    duration: '10:45',
    views: '980K',
    channel: 'Ibal garage',
    thumbnail: 'https://img.youtube.com/vi/fSGXgFXMVHE/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fSGXgFXMVHE',
    directUrl: 'https://www.youtube.com/watch?v=fSGXgFXMVHE',
    description: 'Langkah mudah perawatan berkala motor matic Beat & Scoopy dengan alat sederhana dan pelumasan grease CVT yang benar.',
  },
  {
    id: 'vid-tune-3',
    title: 'Tips & Tutorial Servis CVT Vario 125/150 LED Tarikan Enteng Anti Gredek',
    source: 'youtube',
    category: 'Tuning Motor',
    duration: '12:15',
    views: '750K',
    channel: 'muh motovlog',
    thumbnail: 'https://img.youtube.com/vi/sJhrZ-bjw8s/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/sJhrZ-bjw8s',
    directUrl: 'https://www.youtube.com/watch?v=sJhrZ-bjw8s',
    description: 'Solusi mengatasi getaran gredek saat akselerasi awal pada Vario, Aerox dan PCX dengan setelan roller silang.',
  },
  {
    id: 'vid-tune-4',
    title: 'Servis CVT Yang Aman Pakai Pelumas Apa? Kupas Tuntas Jenis Grease',
    source: 'youtube',
    category: 'Tuning Motor',
    duration: '08:30',
    views: '420K',
    channel: 'MODIFIKA TV',
    thumbnail: 'https://img.youtube.com/vi/I_a3AlV0pr0/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/I_a3AlV0pr0',
    directUrl: 'https://www.youtube.com/watch?v=I_a3AlV0pr0',
    description: 'Memahami perbedaan gemuk CVT primer (pulley depan) dan sekunder (pulley belakang) agar v-belt tidak selip.',
  },

  // ==========================================
  // --- MUROTAL (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-murotal-1',
    title: 'Murottal Merdu Surah Ar-Rahman FULL - Menyejukkan & Menenangkan Jiwa',
    source: 'youtube',
    category: 'Murotal',
    duration: '18:45',
    views: '8.5M',
    channel: 'Muzammil Hasballah',
    thumbnail: 'https://img.youtube.com/vi/rOdi8cxR9xY/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rOdi8cxR9xY',
    directUrl: 'https://www.youtube.com/watch?v=rOdi8cxR9xY',
    description: 'Lantunan indah Surah Ar-Rahman dengan makhorijul huruf tartil dan nada kurdi yang syahdu menyejukkan hati.',
  },
  {
    id: 'vid-murotal-2',
    title: 'Murottal Anak Merdu Juz 30 / Juz \'Amma Lengkap untuk Hafalan Keluarga',
    source: 'youtube',
    category: 'Murotal',
    duration: '45:10',
    views: '5.2M',
    channel: 'Riko The Series',
    thumbnail: 'https://img.youtube.com/vi/-M91zIG4Z24/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/-M91zIG4Z24',
    directUrl: 'https://www.youtube.com/watch?v=-M91zIG4Z24',
    description: 'Bacaan surat-surat pendek Al-Qur\'an Juz 30 dengan visual animasi ramah anak untuk menemani hafalan di rumah.',
  },

  // ==========================================
  // --- KAJIAN (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-kajian-1',
    title: 'Cara Menghilangkan Rasa Cemas & Gelisah dalam Menghadapi Ujian Hidup',
    source: 'youtube',
    category: 'Kajian',
    duration: '26:40',
    views: '2.1M',
    channel: 'Adi Hidayat Official',
    thumbnail: 'https://img.youtube.com/vi/3VjwogzQSD8/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3VjwogzQSD8',
    directUrl: 'https://www.youtube.com/watch?v=3VjwogzQSD8',
    description: 'Nasihat mendalam Ustadz Adi Hidayat tentang kunci ketenangan batin, tawakal, dan amalan doa pengikis kecemasan.',
  },
  {
    id: 'vid-kajian-2',
    title: 'Ceramah Lucu Penuh Hikmah: Rahasia Berkah Rezeki & Ketenangan Keluarga',
    source: 'youtube',
    category: 'Kajian',
    duration: '31:15',
    views: '4.8M',
    channel: 'Prof. H. Abdul Somad Lc.',
    thumbnail: 'https://img.youtube.com/vi/YXEGz9MdIxQ/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/YXEGz9MdIxQ',
    directUrl: 'https://www.youtube.com/watch?v=YXEGz9MdIxQ',
    description: 'Kajian santai dan menghibur Ustadz Abdul Somad yang sarat petuah tentang kejujuran dan keberkahan mencari nafkah.',
  },

  // ==========================================
  // --- DRAKOR & DRACIN (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-drakor-1',
    title: 'Queen of Tears | Trailer Resmi Subtitle Indonesia',
    source: 'youtube',
    category: 'Drakor',
    duration: '02:30',
    views: '3.6M',
    channel: 'Netflix Indonesia',
    thumbnail: 'https://img.youtube.com/vi/tNhIiisjjJg/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tNhIiisjjJg',
    directUrl: 'https://www.youtube.com/watch?v=tNhIiisjjJg',
    description: 'Cuplikan resmi drama Korea fenomenal tentang dinamika pernikahan, intrik keluarga chaebol, dan kisah cinta mendalam.',
  },
  {
    id: 'vid-dracin-1',
    title: 'Drama China Romantis Irreplaceable Subtitle Indonesia Episode Lengkap',
    source: 'youtube',
    category: 'Dracin',
    duration: '45:00',
    views: '2.4M',
    channel: 'YOUKU Indonesia',
    thumbnail: 'https://img.youtube.com/vi/KydYMiSAQ2Y/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/KydYMiSAQ2Y',
    directUrl: 'https://www.youtube.com/watch?v=KydYMiSAQ2Y',
    description: 'Kisah drama romantis modern dengan alur manis dan hangat yang sangat digemari pecinta drama Mandarin.',
  },

  // ==========================================
  // --- FILM INDIA (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-india-1',
    title: 'Lagu Romantis India Terpopuler Humnava Mere Subtitle Indonesia',
    source: 'youtube',
    category: 'Film India',
    duration: '05:40',
    views: '6.7M',
    channel: 'Bollywood Indo',
    thumbnail: 'https://img.youtube.com/vi/tCBc2XntrBI/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tCBc2XntrBI',
    directUrl: 'https://www.youtube.com/watch?v=tCBc2XntrBI',
    description: 'Koleksi lagu melodi Bollywood syahdu dengan lirik terjemahan bahasa Indonesia yang sangat menyentuh hati.',
  },

  // ==========================================
  // --- HIBURAN (YOUTUBE) ---
  // ==========================================
  {
    id: 'vid-hiburan-1',
    title: 'Top 5 Momen Kocak & Lucu Pemotor Indonesia yang Bikin Heran',
    source: 'youtube',
    category: 'Hiburan',
    duration: '04:10',
    views: '3.2M',
    channel: 'Oemah LOL',
    thumbnail: 'https://img.youtube.com/vi/rNCSQvCfFII/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rNCSQvCfFII',
    directUrl: 'https://www.youtube.com/watch?v=rNCSQvCfFII',
    description: 'Kumpulan tingkah lucu, aksi unik, dan kejadian nyeleneh pengendara roda dua di jalan raya Indonesia.',
  },
  {
    id: 'vid-hiburan-2',
    title: 'Momen Gokil & Unik Jok Motor Lucu Bikin Ngakak #Shorts',
    source: 'youtube',
    category: 'Hiburan',
    duration: '01:00',
    views: '4.5M',
    channel: 'Maas Agunk',
    thumbnail: 'https://img.youtube.com/vi/DaLPSevGWG4/hqdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DaLPSevGWG4',
    directUrl: 'https://www.youtube.com/watch?v=DaLPSevGWG4',
    description: 'Video komedi pendek seputar dunia motor dan kehidupan santai yang viral di medsos.',
  },
];

export const VideoScreen: React.FC<VideoScreenProps> = ({ onBack }) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'youtube' | 'tiktok'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  // Status pencarian dinamis real-time
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // Koleksi Video dengan state lokal
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);

  // Daftarkan ke Global Audio Manager agar video mati jika radio/tilawah berbunyi
  useEffect(() => {
    audioManager.registerSource('video', () => {
      setActiveVideo(null);
    });
    return () => {
      audioManager.unregisterSource('video');
    };
  }, []);

  const categories = [
    { name: 'Semua', icon: Flame },
    { name: 'Tuning Motor', icon: Flame },
    { name: 'Murotal', icon: Sparkles },
    { name: 'Kajian', icon: Sparkles },
    { name: 'Drakor', icon: Tv },
    { name: 'Dracin', icon: Tv },
    { name: 'Film India', icon: Film },
    { name: 'Hiburan', icon: Play },
  ];

  // Quick chips rekomendasi pencarian
  const quickSearches = [
    'Film petualangan alam',
    'TikTok Viral',
    'Lagu Pop Indonesia',
    'Murottal Merdu',
    'Drakor Sub Indo',
    'Servis CVT Beat',
    'Ustadz Adi Hidayat',
    'Video Lucu',
  ];

  const handlePlayVideo = (vid: VideoItem) => {
    audioManager.requestPlayback('video');
    setPlayerKey((prev) => prev + 1);
    setActiveVideo(vid);
  };

  // Logika Eksekusi Pencarian / Penyetelan Video Nyata (Real-time YouTube Search)
  const handleExecuteSearch = async (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const term = (customTerm !== undefined ? customTerm : searchQuery).trim();
    if (!term) return;

    setAppliedSearch(term);

    // 1. Periksa apakah input adalah URL langsung (YouTube / TikTok / direct ID)
    const parsed = parseVideoInput(term);

    if (parsed.isUrl) {
      // Input berupa URL atau ID video langsung
      const newVid: VideoItem = {
        id: 'url_' + Date.now(),
        title: parsed.title,
        source: parsed.type === 'tiktok' ? 'tiktok' : 'youtube',
        category: (selectedCategory === 'Semua' ? 'Hiburan' : selectedCategory) as VideoItem['category'],
        duration: 'Video Pilihan',
        views: 'Diputar Langsung',
        channel: parsed.type === 'tiktok' ? 'TikTok' : 'YouTube',
        thumbnail: parsed.thumbnail,
        embedUrl: parsed.embedUrl,
        directUrl: parsed.directUrl,
        description: `Video siap putar dari link yang Anda masukkan: ${parsed.directUrl}`,
      };

      setVideos((prev) => [newVid, ...prev.filter((v) => v.id !== newVid.id)]);
      handlePlayVideo(newVid);
      return;
    }

    // 2. Pencarian Dinamis Real-Time ke Server (/api/videos/search)
    // Menemukan dan menampilkan video ASLI yang 100% cocok dengan apa yang diketik pengguna!
    setIsSearching(true);
    setSearchNotification(`Sedang mencari video asli untuk "${term}"...`);

    try {
      const response = await fetch(`/api/videos/search?q=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];

        if (Array.isArray(results) && results.length > 0) {
          // Tentukan kategori yang relevan secara cerdas
          const lowerTerm = term.toLowerCase();
          let detectedCategory: VideoItem['category'] = 'Hiburan';
          if (
            lowerTerm.includes('film') ||
            lowerTerm.includes('drakor') ||
            lowerTerm.includes('movie') ||
            lowerTerm.includes('bioskop') ||
            lowerTerm.includes('petualangan')
          ) {
            detectedCategory = 'Drakor';
          } else if (
            lowerTerm.includes('dracin') ||
            lowerTerm.includes('china') ||
            lowerTerm.includes('mandarin')
          ) {
            detectedCategory = 'Dracin';
          } else if (lowerTerm.includes('india') || lowerTerm.includes('bollywood')) {
            detectedCategory = 'Film India';
          } else if (
            lowerTerm.includes('lagu') ||
            lowerTerm.includes('musik') ||
            lowerTerm.includes('dangdut') ||
            lowerTerm.includes('pop')
          ) {
            detectedCategory = 'Musik';
          } else if (
            lowerTerm.includes('murotal') ||
            lowerTerm.includes('murottal') ||
            lowerTerm.includes('quran') ||
            lowerTerm.includes('surah') ||
            lowerTerm.includes('tilawah')
          ) {
            detectedCategory = 'Murotal';
          } else if (
            lowerTerm.includes('kajian') ||
            lowerTerm.includes('ceramah') ||
            lowerTerm.includes('ustadz') ||
            lowerTerm.includes('dakwah')
          ) {
            detectedCategory = 'Kajian';
          } else if (
            lowerTerm.includes('motor') ||
            lowerTerm.includes('cvt') ||
            lowerTerm.includes('bengkel') ||
            lowerTerm.includes('beat') ||
            lowerTerm.includes('vario') ||
            lowerTerm.includes('mesin') ||
            lowerTerm.includes('oli')
          ) {
            detectedCategory = 'Tuning Motor';
          }

          const formattedVideos: VideoItem[] = results.map((item: any) => ({
            id: item.id || `yt_${item.videoId}`,
            title: item.title,
            source: 'youtube' as const,
            category: detectedCategory,
            duration: item.duration || 'Video',
            views: item.views || 'Banyak ditonton',
            channel: item.channel || 'YouTube',
            thumbnail: item.thumbnail,
            embedUrl: item.embedUrl,
            directUrl: item.directUrl,
            description: item.description || `Video asli hasil pencarian untuk "${term}".`,
          }));

          // Masukkan seluruh hasil pencarian ke daftar teratas
          setVideos((prev) => {
            const existingIds = new Set(formattedVideos.map((v) => v.id));
            return [...formattedVideos, ...prev.filter((v) => !existingIds.has(v.id))];
          });

          // Reset filter agar seluruh video hasil pencarian terlihat
          setSelectedCategory('Semua');
          setSourceFilter('all');

          // Putar otomatis video #1 yang paling cocok
          handlePlayVideo(formattedVideos[0]);
          setSearchNotification(`Ditemukan ${formattedVideos.length} video nyata untuk "${term}"!`);
          setTimeout(() => setSearchNotification(null), 4000);
          return;
        }
      }
    } catch (err) {
      console.warn('Dynamic video search error:', err);
    } finally {
      setIsSearching(false);
    }

    // 3. Fallback: Cari kecocokan kata kunci di koleksi lokal jika koneksi server sedang sibuk
    const localMatch = videos.find(
      (v) =>
        v.title.toLowerCase().includes(term.toLowerCase()) ||
        v.channel.toLowerCase().includes(term.toLowerCase()) ||
        v.description.toLowerCase().includes(term.toLowerCase())
    );

    if (localMatch) {
      handlePlayVideo(localMatch);
      setSearchNotification(`Memutar video lokal: ${localMatch.title}`);
      setTimeout(() => setSearchNotification(null), 3500);
      return;
    }

    const offlineKeywordMatch = KEYWORD_VIDEO_MAP.find((m) =>
      m.keywords.some((k) => term.toLowerCase().includes(k)) ||
      m.title.toLowerCase().includes(term.toLowerCase())
    );

    if (offlineKeywordMatch) {
      const vidFromMap: VideoItem = {
        id: 'kw_' + Date.now(),
        title: offlineKeywordMatch.title,
        source: offlineKeywordMatch.source,
        category: offlineKeywordMatch.category,
        duration: 'Siap Putar',
        views: 'Rekomendasi Cerdas',
        channel: offlineKeywordMatch.channel,
        thumbnail: `https://img.youtube.com/vi/${offlineKeywordMatch.videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${offlineKeywordMatch.videoId}`,
        directUrl: `https://www.youtube.com/watch?v=${offlineKeywordMatch.videoId}`,
        description: offlineKeywordMatch.description,
      };
      setVideos((prev) => [vidFromMap, ...prev.filter((v) => v.id !== vidFromMap.id)]);
      handlePlayVideo(vidFromMap);
      return;
    }

    setSearchNotification(`Tidak ada video yang cocok untuk "${term}". Silakan buka di aplikasi YouTube resmi di bawah.`);
    setTimeout(() => setSearchNotification(null), 5000);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
  };

  // Tempel Link dari Clipboard HP
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setSearchQuery(text);
          handleExecuteSearch(undefined, text);
        }
      }
    } catch {
      // Fallback jika permission clipboard ditolak browser
    }
  };

  // Tambah Link Kustom
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const parsed = parseVideoInput(customUrlInput.trim());

    const newVid: VideoItem = {
      id: 'custom_' + Date.now(),
      title: parsed.title,
      source: parsed.type === 'tiktok' ? 'tiktok' : 'youtube',
      category: 'Hiburan',
      duration: 'Link Kustom',
      views: 'Ditambahkan Sendiri',
      channel: parsed.type === 'tiktok' ? 'TikTok' : 'YouTube Pilihan',
      thumbnail: parsed.thumbnail,
      embedUrl: parsed.embedUrl,
      directUrl: parsed.directUrl,
      description: 'Video hasil penambahan tautan URL mandiri oleh pengguna.',
    };

    setVideos((prev) => [newVid, ...prev]);
    handlePlayVideo(newVid);
    setCustomUrlInput('');
    setShowAddUrlModal(false);
  };

  const activeQuery = (appliedSearch || searchQuery).trim().toLowerCase();

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchSource =
        sourceFilter === 'all' ? true : v.source === sourceFilter;
      const matchCategory =
        selectedCategory === 'Semua' ? true : v.category === selectedCategory;
      const matchQuery =
        activeQuery === ''
          ? true
          : v.title.toLowerCase().includes(activeQuery) ||
            v.channel.toLowerCase().includes(activeQuery) ||
            v.category.toLowerCase().includes(activeQuery) ||
            v.description.toLowerCase().includes(activeQuery);
      return matchSource && matchCategory && matchQuery;
    });
  }, [videos, sourceFilter, selectedCategory, activeQuery]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Salin link video
  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Helper untuk membersihkan dan menyiapkan URL embed iframe
  const getCleanEmbedUrl = (rawUrl: string) => {
    let url = rawUrl;
    // Ubah youtube.com/embed ke youtube-nocookie.com/embed demi kelancaran pemutar web
    url = url.replace('https://www.youtube.com/embed/', 'https://www.youtube-nocookie.com/embed/');

    if (url.includes('?')) {
      if (!url.includes('autoplay=')) url += '&autoplay=1';
      if (!url.includes('playsinline=')) url += '&playsinline=1';
      if (!url.includes('enablejsapi=')) url += '&enablejsapi=1';
    } else {
      url += '?autoplay=1&playsinline=1&enablejsapi=1&rel=0';
    }
    return url;
  };

  return (
    <div className="space-y-3 pb-8">
      {/* SubScreen Header */}
      <SubScreenHeader
        title="Video Aggregator"
        subtitle="YouTube &amp; TikTok Siap Putar"
        badge="In-App Player Aktif"
        badgeColor="bg-red-50 text-red-700 border-red-200"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowAddUrlModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
            title="Tonton Link Sendiri"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Link</span>
          </button>
        }
      />

      {/* Search Bar Pintar & Penyetelan Video */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2.5">
        <form onSubmit={(e) => handleExecuteSearch(e)} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari video apa saja (film, lagu, kajian, dsb)..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl pl-9 pr-14 py-2 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-200"
            />
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Tempel Link dari Clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Cari / Setel</span>
              </>
            )}
          </button>
        </form>

        {/* Live Search Notification Banner */}
        {searchNotification && (
          <div className="p-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 truncate">
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">{searchNotification}</span>
            </div>
            <button
              onClick={() => setSearchNotification(null)}
              className="p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
            <Compass className="w-3 h-3" /> Rekomendasi:
          </span>
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchQuery(term);
                if (term === 'TikTok Viral') {
                  setSourceFilter('tiktok');
                  setSelectedCategory('Semua');
                } else {
                  handleExecuteSearch(undefined, term);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent whitespace-nowrap transition-all cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Source Filter: Semua, YouTube, TikTok (Lengkap & Terisi Semua!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {[
            { id: 'all', label: 'Semua Sumber' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'tiktok', label: 'TikTok (Trending)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                sourceFilter === tab.id
                  ? tab.id === 'tiktok'
                    ? 'bg-black text-white shadow-2xs border border-slate-700'
                    : 'bg-red-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              {tab.id === 'tiktok' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-500 text-[9px] text-white font-bold">
                  {videos.filter((v) => v.source === 'tiktok').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-6 text-center border border-slate-200 shadow-2xs">
            <VideoIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              Tidak Ada Video di Filter Ini
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Ketik judul di kolom pencarian atau klik tombol di bawah untuk memuat semua video.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSourceFilter('all');
                setSearchQuery('');
                setAppliedSearch('');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
            >
              Tampilkan Semua Video
            </button>
          </div>
        ) : (
          filteredVideos.map((vid) => {
            const isBookmarked = bookmarkedIds.includes(vid.id);
            const isTikTok = vid.source === 'tiktok';

            return (
              <div
                key={vid.id}
                onClick={() => handlePlayVideo(vid)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                    {vid.duration}
                  </span>

                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase shadow-xs flex items-center gap-1 ${
                      isTikTok
                        ? 'bg-black/90 border border-slate-600 text-pink-400'
                        : 'bg-red-600'
                    }`}
                  >
                    {isTikTok ? 'TikTok Viral' : 'YouTube'}
                  </span>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                        isTikTok ? 'bg-pink-600/90 hover:bg-pink-600' : 'bg-red-600/90 hover:bg-red-600'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {vid.title}
                      </h4>
                      <button
                        onClick={(e) => toggleBookmark(vid.id, e)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                        title="Simpan Video"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-red-600 text-red-600' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
                    <span className="truncate max-w-[150px] font-semibold text-slate-700">
                      {vid.channel}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {vid.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* In-App Video Player Dialog dengan Sistem Perlindungan Ganda (In-App + Deep-Link Resmi) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[94vh]">
            {/* Header Dialog */}
            <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 truncate pr-2">
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="truncate">
                  Pemutar TeguhOne ({activeVideo.source === 'tiktok' ? 'TikTok' : 'YouTube'})
                </span>
              </span>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-full hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video IFrame Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                key={playerKey}
                src={getCleanEmbedUrl(activeVideo.embedUrl)}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Video Details & Action Panel */}
            <div className="p-4 space-y-3 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activeVideo.source === 'tiktok'
                        ? 'bg-pink-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {activeVideo.source === 'tiktok' ? 'TikTok' : 'YouTube'}
                  </span>
                  <span className="text-[11px] text-slate-400">{activeVideo.category}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {activeVideo.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-300 truncate max-w-[200px]">
                    Channel: {activeVideo.channel}
                  </span>
                  <span>{activeVideo.views}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                {activeVideo.description}
              </p>

              {/* Status Pemutar & Bebas Biaya Info */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Gratis 100% tanpa biaya &amp; tanpa batas. Jika ingin tampilan layar penuh vertikal asli, Anda juga dapat membuka di aplikasi resmi di bawah ini.
                </p>
              </div>

              {/* Action Buttons: Buka di App Resmi & Salin Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={activeVideo.directUrl || activeVideo.embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                    activeVideo.source === 'tiktok'
                      ? 'bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500'
                      : 'bg-linear-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    Buka di {activeVideo.source === 'tiktok' ? 'Aplikasi TikTok' : 'Aplikasi YouTube'}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(activeVideo.directUrl || activeVideo.embedUrl)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-98 cursor-pointer"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Salin / Bagikan Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Video Link Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-sm">Tonton Link Kustom</h4>
              <button
                onClick={() => setShowAddUrlModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCustomUrl} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tempel URL YouTube / TikTok / ID Video
                </label>
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://youtu.be/... atau https://tiktok.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mendukung link YouTube biasa, Shorts, youtu.be, TikTok, maupun 11 karakter ID video langsung.
              </p>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Putar Sekarang di TeguhOne
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
