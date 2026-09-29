import React, { useState } from 'react';
import {
  Search,
  Bike,
  Smartphone,
  Shirt,
  Home,
  Wrench,
  Building,
  Gamepad2,
  Grid,
  Plus,
  Heart,
  MapPin,
  Star,
  CheckCircle2,
  X,
  Upload,
  MessageCircle,
  Phone,
  Sparkles,
  Filter,
  ArrowLeftRight,
  Calculator,
  RefreshCw,
  Send,
} from 'lucide-react';
import { MarketItem } from '../types';
import { p2pEngine } from '../services/p2pSync';
import { rateLimiter } from '../services/rateLimiter';
import { SubScreenHeader } from '../components/SubScreenHeader';

interface TMarketScreenProps {
  onBack: () => void;
}

export const TMarketScreen: React.FC<TMarketScreenProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketItem | null>(null);
  const [marketToast, setMarketToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setMarketToast(msg);
    setTimeout(() => setMarketToast(null), 2500);
  };

  // Tukar Tambah (Trade-In) Filter & Calculator State
  const [tradeInOnlyFilter, setTradeInOnlyFilter] = useState(false);
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [myTradeInItem, setMyTradeInItem] = useState('');
  const [myTradeInValuation, setMyTradeInValuation] = useState('');
  const [myTradeInCondition, setMyTradeInCondition] = useState('Normal Mulus');

  // Form for new ad listing
  const [adTitle, setAdTitle] = useState('');
  const [adCategory, setAdCategory] = useState<MarketItem['category']>('Motor');
  const [adPrice, setAdPrice] = useState('');
  const [adLocation, setAdLocation] = useState('Bandung');
  const [adDescription, setAdDescription] = useState('');
  const [adPhone, setAdPhone] = useState('081234567890');
  const [compressedImagePreview, setCompressedImagePreview] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const [adSubmitted, setAdSubmitted] = useState(false);
  const [adAcceptTradeIn, setAdAcceptTradeIn] = useState(true);
  const [adTradeInPreferences, setAdTradeInPreferences] = useState('');

  const [items, setItems] = useState<MarketItem[]>([
    {
      id: 'mkt-1',
      title: 'Helm Full Face KYT TT Course D-City Black Gloss Original',
      category: 'Motor',
      price: 350000,
      location: 'Bandung',
      date: 'Hari ini',
      condition: 'Bekas Berkualitas',
      sellerName: 'Rian Motor',
      sellerPhone: '081299887766',
      description: 'Kondisi 95% mulus, busa pipi tebal wangi, visor bening anti gores, kelengkapan kardus & sarung helm ada.',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      acceptTradeIn: true,
      tradeInPreferences: 'Menerima tukar tambah helm open face (KYT Dj Maru / INK Centro) + tambah dana.',
    },
    {
      id: 'mkt-2',
      title: 'Sepatu Running Sport Breathable Ringan Anti Selip',
      category: 'Fashion',
      price: 199000,
      location: 'Surabaya',
      date: 'Kemarin',
      condition: 'Baru',
      sellerName: 'Sport Santri Shop',
      sellerPhone: '081377889900',
      description: 'Sol empuk nyaman buat jogging harian, ukuran 40-44 ready stok.',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      acceptTradeIn: false,
    },
    {
      id: 'mkt-3',
      title: 'Honda Beat ESP 2021 Pajak Hidup Mesin Halus Siap Pakai',
      category: 'Motor',
      price: 12500000,
      location: 'Malang',
      date: '2 hari lalu',
      condition: 'Bekas Berkualitas',
      sellerName: 'Pak Haji Santoso',
      sellerPhone: '081223344556',
      description: 'Surat lengkap BPKB & STNK, ban baru tubeless, servis rutin di bengkel rekanan TeguhOne, no minus.',
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
      acceptTradeIn: true,
      tradeInPreferences: 'Siap tukar tambah Beat karbu, Vario lama, atau Scoopy yang mau upgrade ke tahun muda.',
    },
    {
      id: 'mkt-4',
      title: 'Knalpot Racing Stainless Header Las Cacing Suara Bass Bulat',
      category: 'Motor',
      price: 450000,
      location: 'Yogyakarta',
      date: '3 hari lalu',
      condition: 'Baru',
      sellerName: 'Speed Garage',
      sellerPhone: '081555667788',
      description: 'Material stainless steel anti karat, db killer include, suara ramah lingkungan tidak memekakkan telinga.',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
      acceptTradeIn: true,
      tradeInPreferences: 'Bisa tukar tambah knalpot orisinil bawaan motor.',
    },
  ]);

  const categories = [
    { name: 'Semua', icon: Grid },
    { name: 'Motor', icon: Bike },
    { name: 'Elektronik', icon: Smartphone },
    { name: 'Fashion', icon: Shirt },
    { name: 'Rumah', icon: Home },
    { name: 'Jasa', icon: Wrench },
    { name: 'Properti', icon: Building },
    { name: 'Hobi', icon: Gamepad2 },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME type & size security validation
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      showToast('Hanya format foto JPEG, PNG, atau WebP yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB');
      return;
    }

    setCompressing(true);
    try {
      const compressedDataUrl = await p2pEngine.compressImage(file, 640, 0.6);
      setCompressedImagePreview(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      showToast('Gagal memproses gambar, silakan coba lagi');
    } finally {
      setCompressing(false);
    }
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adPrice.trim()) return;

    // Rate limit check: max 3 ads in 5 minutes per user session
    const limitCheck = rateLimiter.isAllowed('market_post', 3, 5 * 60 * 1000);
    if (!limitCheck.allowed) {
      showToast(`Batas posting tercapai. Tunggu ${limitCheck.retryAfterSeconds} detik lagi.`);
      return;
    }

    // Input sanitization & limits
    const cleanTitle = adTitle.trim().slice(0, 80);
    const cleanDesc = adDescription.trim().slice(0, 1000);
    const cleanLocation = adLocation.trim().slice(0, 50);

    const newItem: MarketItem = {
      id: 'mkt_' + Date.now(),
      title: cleanTitle,
      category: adCategory,
      price: parseInt(adPrice.replace(/\D/g, '') || '0', 10),
      location: cleanLocation,
      date: 'Baru saja',
      condition: 'Baru',
      sellerName: p2pEngine.getNodeName(),
      sellerPhone: adPhone,
      description: cleanDesc,
      rating: 5.0,
      imageUrl:
        compressedImagePreview ||
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      acceptTradeIn: adAcceptTradeIn,
      tradeInPreferences: adTradeInPreferences,
    };

    setItems([newItem, ...items]);
    p2pEngine.queueAction('market_ad', newItem);

    setAdSubmitted(true);
    setTimeout(() => {
      setAdSubmitted(false);
      setShowAddModal(false);
      setAdTitle('');
      setAdPrice('');
      setAdDescription('');
      setCompressedImagePreview('');
      setAdTradeInPreferences('');
    }, 1800);
  };

  const filteredItems = items.filter((item) => {
    const matchCat =
      selectedCategory === 'Semua' ? true : item.category === selectedCategory;
    const matchSearch =
      searchQuery === ''
        ? true
        : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTradeIn = tradeInOnlyFilter ? item.acceptTradeIn === true : true;
    return matchCat && matchSearch && matchTradeIn;
  });

  return (
    <div className="space-y-3 pb-8">
      {/* Clean In-App SubScreen Header */}
      <SubScreenHeader
        title="TMarket (Gaya OLX)"
        subtitle="Jual Beli &amp; Jasa Komunitas"
        badge="Zero-Fee"
        badgeColor="bg-orange-50 text-orange-800 border-orange-200"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pasang Iklan</span>
          </button>
        }
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari motor, sparepart, helm, properti..."
          className="w-full bg-white text-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200"
        />
      </div>

      {/* OLX-Style Categories Bar */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 text-center shadow-2xs">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IconComp className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] truncate w-full">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Trade-In (Tukar Tambah) Quick Filter Pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTradeInOnlyFilter(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            !tradeInOnlyFilter
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Iklan
        </button>
        <button
          onClick={() => setTradeInOnlyFilter(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            tradeInOnlyFilter
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Bisa Tukar Tambah</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {items.filter((i) => i.acceptTradeIn).length}
          </span>
        </button>
      </div>

      {/* Product List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>
            {tradeInOnlyFilter
              ? 'Iklan Tukar Tambah (Trade-In)'
              : selectedCategory === 'Semua'
              ? 'Iklan Terbaru'
              : `Kategori ${selectedCategory}`}
          </span>
          <span className="text-orange-600">{filteredItems.length} Iklan Tersedia</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  {item.acceptTradeIn && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-extrabold flex items-center gap-1 shadow-xs">
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      <span>Tukar Tambah</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="p-3 pt-0">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-0.5 truncate max-w-[85px]">
                    <MapPin className="w-2.5 h-2.5" />
                    {item.location}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Ad Modal with Canvas Compression */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="p-4 bg-linear-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  Pasang Iklan Gratis (Zero-Cost)
                </h3>
                <p className="text-xs text-amber-100">
                  Kompresi Canvas otomatis (&lt;50KB) tanpa beban server
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">
                  Iklan Anda Berhasil Diterbitkan!
                </h4>
                <p className="text-xs text-slate-500">
                  Tersimpan di HP &amp; tersinkronisasi via P2P Mesh.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAd} className="p-4 space-y-3 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Judul Iklan / Barang
                  </label>
                  <input
                    type="text"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="Contoh: Helm Full Face KYT Size L Mulus"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={adCategory}
                      onChange={(e) => setAdCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Motor">Motor &amp; Sparepart</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Rumah">Perabot Rumah</option>
                      <option value="Jasa">Jasa &amp; Servis</option>
                      <option value="Hobi">Hobi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={adPrice}
                      onChange={(e) => setAdPrice(e.target.value)}
                      placeholder="350000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kota / Lokasi
                  </label>
                  <input
                    type="text"
                    value={adLocation}
                    onChange={(e) => setAdLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Foto Barang (Otomatis Kompres &lt;50KB)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl p-3 text-center cursor-pointer bg-slate-50">
                      <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                      <span className="text-[11px] text-slate-600 block font-medium">
                        {compressing ? 'Mengompres...' : 'Pilih Foto dari HP'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {compressedImagePreview && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={compressedImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    rows={2}
                    value={adDescription}
                    onChange={(e) => setAdDescription(e.target.value)}
                    placeholder="Kondisi barang, kelengkapan surat, minus, dll..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Tukar Tambah (Trade-In) Checkbox in Ad Form */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adAcceptTradeIn}
                      onChange={(e) => setAdAcceptTradeIn(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Menerima Tukar Tambah (Trade-In / Barter)
                    </span>
                  </label>
                  {adAcceptTradeIn && (
                    <input
                      type="text"
                      value={adTradeInPreferences}
                      onChange={(e) => setAdTradeInPreferences(e.target.value)}
                      placeholder="Barang yang diminati (misal: Beat Karbu / Helm INK Centro)"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={compressing}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  Terbitkan Iklan Sekarang
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="relative aspect-video w-full bg-slate-100 shrink-0">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase">
                  {selectedProduct.category} • {selectedProduct.condition}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {selectedProduct.title}
                </h3>
                <p className="text-lg font-black text-orange-600 mt-1">
                  Rp {selectedProduct.price.toLocaleString('id-ID')}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {selectedProduct.description}
              </p>

              {/* Trade-In Banner if Available */}
              {selectedProduct.acceptTradeIn && (
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                      Penjual Menerima Tukar Tambah
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                      Tukar Tambah OK
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-snug">
                    {selectedProduct.tradeInPreferences ||
                      'Penjual terbuka untuk tukar tambah motor, helm, atau barang sejenis dengan penyesuaian dana.'}
                  </p>
                  <button
                    onClick={() => setShowTradeInModal(true)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Hitung &amp; Ajukan Tukar Tambah</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Penjual: <strong>{selectedProduct.sellerName}</strong></span>
                <span>Lokasi: {selectedProduct.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://wa.me/${selectedProduct.sellerPhone}?text=Halo%20saya%20tertarik%20dengan%20${encodeURIComponent(
                    selectedProduct.title
                  )}%20di%20TeguhOne`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi Penjual
                </a>
                <button
                  onClick={() => {
                    showToast('Nomor Kontak Penjual: ' + selectedProduct.sellerPhone);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Telepon Langsung
                </button>
                <div className="col-span-2 pt-1 text-center">
                  <button
                    onClick={() => {
                      showToast('Terima kasih. Laporan iklan telah dikirim ke tim moderasi.');
                      setSelectedProduct(null);
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    🚩 Laporkan Iklan Ini (Spam / Penipuan)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade-In (Tukar Tambah) Interactive Calculator Modal */}
      {showTradeInModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    Kalkulator Tukar Tambah
                  </h3>
                  <p className="text-[10px] text-emerald-100">
                    Solusi Cerdas Ganti Barang Tanpa Ribet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTradeInModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Barang Penjual:</span>
                <p className="font-bold text-slate-900 truncate">{selectedProduct.title}</p>
                <p className="text-emerald-700 font-extrabold">Rp {selectedProduct.price.toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Barang Anda (Yang Mau Ditukar):
                </label>
                <input
                  type="text"
                  value={myTradeInItem}
                  onChange={(e) => setMyTradeInItem(e.target.value)}
                  placeholder="Contoh: Beat Karbu 2012 Surat Lengkap"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Taksiran Nilai Barang Anda (Rp):
                </label>
                <input
                  type="number"
                  value={myTradeInValuation}
                  onChange={(e) => setMyTradeInValuation(e.target.value)}
                  placeholder="Contoh: 5000000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kondisi Barang Anda:
                </label>
                <select
                  value={myTradeInCondition}
                  onChange={(e) => setMyTradeInCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Sangat Mulus & Terawat">Sangat Mulus &amp; Terawat</option>
                  <option value="Normal Pemakaian Harian">Normal Pemakaian Harian</option>
                  <option value="Perlu Servis Ringan">Perlu Servis Ringan</option>
                </select>
              </div>

              {/* Live Calculator Summary */}
              {myTradeInValuation && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 space-y-1 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                    Hasil Perhitungan Selisih:
                  </span>
                  {selectedProduct.price > parseInt(myTradeInValuation, 10) ? (
                    <div>
                      <p className="text-xs text-slate-600">Estimasi Tambah Dana Dari Anda:</p>
                      <p className="text-base font-black text-rose-600">
                        + Rp {(selectedProduct.price - parseInt(myTradeInValuation, 10)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ) : selectedProduct.price < parseInt(myTradeInValuation, 10) ? (
                    <div>
                      <p className="text-xs text-slate-600">Estimasi Dana Kembalian ke Anda:</p>
                      <p className="text-base font-black text-emerald-600">
                        - Rp {(parseInt(myTradeInValuation, 10) - selectedProduct.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-black text-emerald-700">Barter Impas (1:1 Tanpa Tambah Dana)</p>
                  )}
                </div>
              )}

              <a
                href={`https://wa.me/${selectedProduct.sellerPhone}?text=${encodeURIComponent(
                  `Halo ${selectedProduct.sellerName}, saya melihat iklan "${selectedProduct.title}" (Rp ${selectedProduct.price.toLocaleString('id-ID')}) di TMarket TeguhOne.\n\nSaya ingin mengajukan TUKAR TAMBAH dengan barang saya:\n- Barang: ${myTradeInItem || 'Barang Saya'}\n- Kondisi: ${myTradeInCondition}\n- Taksiran Nilai: Rp ${parseInt(myTradeInValuation || '0', 10).toLocaleString('id-ID')}\n- Estimasi Selisih: Rp ${Math.abs(selectedProduct.price - parseInt(myTradeInValuation || '0', 10)).toLocaleString('id-ID')}\n\nApakah berkenan untuk kita diskusikan lebih lanjut? Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 block text-center"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Tawaran Tukar Tambah via WA</span>
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Non-blocking Toast Notification */}
      {marketToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 font-bold pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{marketToast}</span>
        </div>
      )}
    </div>
  );
};
