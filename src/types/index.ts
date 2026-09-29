export type TabType = 
  | 'home'
  | 'video'
  | 'tilawah'
  | 'tuning'
  | 'tchat'
  | 'tmarket'
  | 'belanja'
  | 'ai'
  | 'radio';

export interface VideoItem {
  id: string;
  title: string;
  source: 'youtube' | 'tiktok';
  category: 'Drakor' | 'Dracin' | 'Film India' | 'Murotal' | 'Kajian' | 'Musik' | 'Hiburan' | 'Olahraga' | 'Tuning Motor';
  duration: string;
  views: string;
  channel: string;
  thumbnail: string;
  embedUrl: string;
  directUrl?: string;
  description: string;
}

export interface RadioChannel {
  id: string;
  name: string;
  tagline: string;
  program: string;
  host: string;
  category: 'Berita' | 'Musik' | 'Dakwah' | 'Dangdut' | 'Daerah';
  streamUrl: string;
  artwork: string;
  frequency?: string;
  location?: string;
}

export interface SurahItem {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  reciter: string;
  duration: string;
  audioUrl: string;
  arabicSnippet?: string;
}

export interface DoaItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  category: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Servis' | 'Upgrade' | 'Sparepart' | 'Injeksi';
  price: number;
  duration: string;
  description: string;
  popular?: boolean;
}

export interface SparepartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  original: boolean;
  stock: number;
  rating: number;
  image: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  type?: 'text' | 'image' | 'video' | 'voice' | 'file';
  audioDuration?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  caption?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  isAi?: boolean;
}

export interface MarketItem {
  id: string;
  title: string;
  category: 'Motor' | 'Elektronik' | 'Fashion' | 'Rumah' | 'Jasa' | 'Properti' | 'Hobi' | 'Lainnya';
  price: number;
  location: string;
  date: string;
  condition: 'Baru' | 'Bekas Berkualitas' | 'Custom';
  sellerName: string;
  sellerPhone: string;
  description: string;
  rating: number;
  imageUrl: string;
  isAffiliate?: boolean;
  acceptTradeIn?: boolean;
  tradeInPreferences?: string;
}

export interface AffiliateItem {
  id: string;
  title: string;
  platform: 'shopee' | 'tiktok';
  price: number;
  originalPrice: number;
  discountPercent: number;
  soldCount: string;
  rating: number;
  imageUrl: string;
  affiliateUrl: string;
  commissionNote?: string;
}

export interface RadioSchedule {
  time: string;
  title: string;
  host: string;
  category: string;
}
