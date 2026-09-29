import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Heart,
  QrCode,
  Coffee,
  CheckCircle2,
  X,
  CreditCard,
  Share2,
  Gift,
  Copy,
  Check,
} from 'lucide-react';
import { AffiliateItem } from '../types';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { monetizationService } from '../services/monetizationService';

interface BelanjaScreenProps {
  onBack: () => void;
}

export const BelanjaScreen: React.FC<BelanjaScreenProps> = ({ onBack }) => {
  const monConfig = monetizationService.getConfig();
  const [activeTab, setActiveTab] = useState<'affiliate' | 'donasi'>('affiliate');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'shopee' | 'tiktok'>('all');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(25000);
  const [donationConfirmed, setDonationConfirmed] = useState(false);
  const [copiedQris, setCopiedQris] = useState(false);

  const affiliateItems: AffiliateItem[] = [
    {
      id: 'aff-1',
      title: 'Oli Mesin Full Synthetic Motul 7100 10W-40 4T 1L Original',
      platform: 'shopee',
      price: 135000,
      originalPrice: 195000,
      discountPercent: 30,
      soldCount: '4.2K terjual',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
      affiliateUrl: 'https://shopee.co.id',
      commissionNote: 'Rekomendasi Kang Teguh untuk motor harian bertenaga',
    },
    {
      id: 'aff-2',
      title: 'Paket V-Belt + Roller Racing Daytona Kevlar Beat / Scoopy FI',
      platform: 'tiktok',
      price: 175000,
      originalPrice: 260000,
      discountPercent: 33,
      soldCount: '8.9K terjual',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      affiliateUrl: 'https://www.tiktok.com',
      commissionNote: 'Top Seller TikTok Shop Bengkel Santri',
    },
    {
      id: 'aff-3',
      title: 'Sarung Santri Tenun Eksklusif Motif BHS Classic Halus Nyaman',
      platform: 'shopee',
      price: 185000,
      originalPrice: 320000,
      discountPercent: 42,
      soldCount: '1.5K terjual',
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80',
      affiliateUrl: 'https://shopee.co.id',
      commissionNote: 'Perlengkapan Ibadah Santri Barokah',
    },
    {
      id: 'aff-4',
      title: 'Intercom Helm Bluetooth V6 Plus Waterproof Suara Jernih',
      platform: 'tiktok',
      price: 320000,
      originalPrice: 650000,
      discountPercent: 50,
      soldCount: '12K terjual',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      affiliateUrl: 'https://www.tiktok.com',
      commissionNote: 'Diskon Spesial 50% Flash Sale',
    },
  ];

  const filteredItems = affiliateItems.filter((item) =>
    platformFilter === 'all' ? true : item.platform === platformFilter
  );

  const handleCopyNMID = () => {
    navigator.clipboard.writeText('ID102026TEGUHONE01');
    setCopiedQris(true);
    setTimeout(() => setCopiedQris(false), 2000);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Clean In-App SubScreen Header */}
      <SubScreenHeader
        title="Belanja &amp; Donasi"
        subtitle="Shopee &amp; TikTok Affiliate + QRIS Bebas Biaya"
        badge="Zero-Capital"
        badgeColor="bg-pink-50 text-pink-700 border-pink-200"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowQrisModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QRIS</span>
          </button>
        }
      />

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveTab('affiliate')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'affiliate'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Barang Afiliasi</span>
        </button>

        <button
          onClick={() => setActiveTab('donasi')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'donasi'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Donasi (Saweria/QRIS)</span>
        </button>
      </div>

      {/* Mode 1: Afiliasi Showcase */}
      {activeTab === 'affiliate' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'shopee', label: 'Shopee' },
                { id: 'tiktok', label: 'TikTok Shop' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    platformFilter === p.id
                      ? 'bg-pink-50 text-pink-700 border-pink-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {filteredItems.length} Produk
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold shadow-xs">
                      -{item.discountPercent}%
                    </span>
                    <span
                      className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white uppercase ${
                        item.platform === 'shopee' ? 'bg-[#ee4d2d]' : 'bg-black'
                      }`}
                    >
                      {item.platform}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-pink-700 font-medium mt-0.5 line-clamp-1">
                      {item.commissionNote}
                    </p>

                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400 line-through">
                        Rp {item.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <p className="text-sm font-black text-rose-600 leading-none">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                      <span>{item.soldCount}</span>
                      <span>★ {item.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0">
                  <a
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 ${
                      item.platform === 'shopee'
                        ? 'bg-[#ee4d2d] hover:bg-[#d73211]'
                        : 'bg-black hover:bg-slate-800'
                    }`}
                  >
                    <span>Beli di {item.platform === 'shopee' ? 'Shopee' : 'TikTok'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Donasi & Dukungan Tim */}
      {activeTab === 'donasi' && (
        <div className="space-y-3">
          <div className="bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-3xl border border-blue-800 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30">
                T1
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Dedikasi Pengembangan &amp; Operasional Mandiri
                </h3>
                <p className="text-[11px] text-blue-200">
                  Untuk Kemaslahatan Ummat &amp; Kemajuan Ilmu Pengetahuan
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed pt-1">
              Aplikasi <strong>TeguhOne</strong> dibangun dengan prinsip <strong>Biaya Nol Rupiah</strong> bagi pengguna.
              Segala donasi dari sahabat didedikasikan sepenuhnya untuk <strong>pengembangan ilmu pengetahuan</strong>, 
              riset teknologi mandiri, dan menutupi <strong>biaya operasional (bayar Wi-Fi pengembang, kuota serverless, listrik, dsb)</strong> 
              agar aplikasi ini terus aktif melayani jutaan insan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Trakteer Kopi Buat Pengembang */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                    Trakteer.id
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2">
                  Traktir Kopi Buat Pengembang
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Traktir secangkir kopi hangat penyemangat untuk menemani pengembang coding hingga larut malam.
                </p>
              </div>
              <a
                href="https://trakteer.id"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs text-center shadow-xs block transition-transform active:scale-95"
              >
                Traktir Kopi Pengembang
              </a>
            </div>

            {/* Saweria */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                    Saweria.co
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2">
                  Dukungan Kuota &amp; Bayar Wi-Fi
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Dukungan operasional bulanan bayar Wi-Fi, listrik, dan kuota internet riset P2P pengembang.
                </p>
              </div>
              <a
                href="https://saweria.co"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center shadow-xs block transition-transform active:scale-95"
              >
                Kirim via Saweria
              </a>
            </div>

            {/* QRIS Universal */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                    QRIS Universal
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2">
                  Donasi Sains &amp; Operasional
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Scan instan melalui semua Bank (BCA, Mandiri, BRI, BSI) &amp; E-Wallet (GoPay, OVO, DANA, ShopeePay).
                </p>
              </div>
              <button
                onClick={() => setShowQrisModal(true)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-xs cursor-pointer transition-transform active:scale-95"
              >
                Buka Barcode QRIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-linear-to-r from-blue-700 to-sky-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  QRIS Donasi TeguhOne
                </h3>
                <p className="text-[11px] text-blue-100">
                  NMID: ID102026TEGUHONE01
                </p>
              </div>
              <button
                onClick={() => setShowQrisModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              {donationConfirmed ? (
                <div className="py-6 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-extrabold text-base text-slate-900">
                    Jazakumullah Khairan Katsiran!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Terima kasih telah berpartisipasi menjaga keberlangsungan aplikasi TeguhOne.
                  </p>
                  <button
                    onClick={() => {
                      setDonationConfirmed(false);
                      setShowQrisModal(false);
                    }}
                    className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSelectedDonationAmount(amt)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDonationAmount === amt
                            ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Rp {amt.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-300 inline-block shadow-inner mx-auto">
                    <div className="w-48 h-48 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white relative">
                      <QrCode className="w-36 h-36 text-white stroke-1" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                          T1
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-2">
                      Scan Semua E-Wallet &amp; Bank
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleCopyNMID}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5"
                    >
                      {copiedQris ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQris ? 'Tersalin' : 'Salin NMID'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setDonationConfirmed(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Saya Sudah Transfer Donasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
