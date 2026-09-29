import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  UserPlus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  ArrowLeft,
  Lock,
  Plus,
  X,
  Volume2,
  VolumeX,
  Camera,
  Smile,
  Image as ImageIcon,
  FileText,
  MapPin,
  Play,
  Pause,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Check,
  CheckCircle2,
  MessageCircle,
  Eye,
  Trash2,
  Headphones,
  ShieldCheck,
  AlertCircle,
  Settings,
  UserCheck,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ChatRoom, ChatMessage } from '../types';

interface TChatScreenProps {
  onBack: () => void;
  onNavigateToAi: () => void;
}

interface TChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  registeredAt: string;
}

// Built-in system usernames that cannot be re-registered (to prevent duplicates)
const RESERVED_USERNAMES = [
  'kangteguh',
  'teguh',
  'farhansantri',
  'budimatic',
  'ibu',
  'ustadzabdullah',
  'admin',
  'tchat',
];

export const TChatScreen: React.FC<TChatScreenProps> = ({
  onBack,
  onNavigateToAi,
}) => {
  // ==========================================
  // 1. SIMPLE REGISTRATION & USER PROFILE STATE
  // ==========================================
  const [currentUser, setCurrentUser] = useState<TChatUser | null>(() => {
    try {
      const saved = localStorage.getItem('tchat_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredUsernames, setRegisteredUsernames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tchat_registered_users');
      return saved ? JSON.parse(saved) : RESERVED_USERNAMES;
    } catch {
      return RESERVED_USERNAMES;
    }
  });

  // Registration form states
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regError, setRegError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ==========================================
  // 2. WHATSAPP NAVIGATION & TABS
  // ==========================================
  const [activeTab, setActiveTab] = useState<'chat' | 'status' | 'panggilan' | 'komunitas'>('chat');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Voice Note Recording with Real MediaRecorder Web API
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Text-To-Speech (TTS) states
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoTtsEnabled, setAutoTtsEnabled] = useState(false);

  // Story Viewer
  const [activeStory, setActiveStory] = useState<{
    name: string;
    avatar: string;
    time: string;
    mediaUrl: string;
    caption?: string;
  } | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // ==========================================
  // 3. REAL CALLING & DEVICE PERMISSION STATE
  // ==========================================
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<'audio' | 'video'>('audio');
  const [pendingCallContact, setPendingCallContact] = useState<{ name: string; avatar: string } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [activeCall, setActiveCall] = useState<{
    name: string;
    avatar: string;
    type: 'audio' | 'video';
    status: 'calling' | 'connected';
    duration: number;
    isMuted: boolean;
    isVideoOff: boolean;
  } | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const callTimerRef = useRef<any>(null);

  // File Input References
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interactive UI states
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [speakerActive, setSpeakerActive] = useState(false);
  const [tchatToast, setTchatToast] = useState<string | null>(null);
  const [showNewCommunityModal, setShowNewCommunityModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatInputName, setNewChatInputName] = useState('');

  const showToast = (msg: string) => {
    setTchatToast(msg);
    setTimeout(() => setTchatToast(null), 2500);
  };

  // Contacts
  const [contacts] = useState([
    {
      id: 'c1',
      name: 'Ibu',
      phone: '+62 812-3456-7890',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      status: 'Sedang menyiapkan sarapan keluarga',
      isOnline: true,
    },
    {
      id: 'c2',
      name: 'Farhan Santri',
      phone: '+62 856-7890-1234',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'Hafalan Surah Ar-Rahman Juz 27',
      isOnline: true,
    },
    {
      id: 'c3',
      name: 'Budi Matic',
      phone: '+62 878-1122-3344',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      status: 'Ada di jalan raya',
      isOnline: false,
    },
    {
      id: 'c4',
      name: 'Kang Teguh (Montir Cerdas)',
      phone: '+62 821-9988-7766',
      avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80',
      status: 'Solusi riset mesin & edukasi otomotif',
      isOnline: true,
    },
    {
      id: 'c5',
      name: 'Ustadz Abdullah',
      phone: '+62 813-4455-6677',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      status: 'Kajian Fiqih & Murotal Al-Qur\'an',
      isOnline: true,
    },
  ]);

  // Stories
  const [statuses, setStatuses] = useState([
    {
      id: 'st-1',
      name: 'Ibu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      time: '24 menit yang lalu',
      mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      caption: 'Alhamdulillah sarapan pagi bersama keluarga berkah.',
    },
    {
      id: 'st-2',
      name: 'Farhan Santri',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      time: '1 jam yang lalu',
      mediaUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
      caption: 'Kajian tilawah 30 juz di masjid agung.',
    },
    {
      id: 'st-3',
      name: 'Kang Teguh (Montir Cerdas)',
      avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80',
      time: '3 jam yang lalu',
      mediaUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      caption: 'Simulasi riset klep & CVT 4-tak selesai diuji di lab!',
    },
  ]);

  // Call logs
  const [callLogs, setCallLogs] = useState([
    {
      id: 'call-1',
      name: 'Farhan Santri',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      type: 'audio' as const,
      direction: 'incoming' as const,
      status: 'missed' as const,
      time: 'Hari ini, 09:15',
    },
    {
      id: 'call-2',
      name: 'Ibu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      type: 'video' as const,
      direction: 'outgoing' as const,
      status: 'connected' as const,
      time: 'Kemarin, 19:42',
    },
    {
      id: 'call-3',
      name: 'Budi Matic',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      type: 'audio' as const,
      direction: 'incoming' as const,
      status: 'connected' as const,
      time: '26 Sept, 14:10',
    },
  ]);

  // Chat Rooms
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: 'room-keluarga',
      name: 'Keluarga Besar',
      avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=200&q=80',
      isGroup: true,
      lastMessage: 'Selamat pagi semua.. Jangan lupa sarapan dan bismillah',
      time: '08:12',
      unreadCount: 2,
    },
    {
      id: 'room-santri',
      name: 'Farhan Santri',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isGroup: false,
      lastMessage: 'Oke siap! Nanti sore kumpul di serambi masjid ya.',
      time: '06:52',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: 'room-komunitas',
      name: 'Komunitas Sahabat Motor Matic',
      avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80',
      isGroup: true,
      lastMessage: 'Ada materi simulasi mesin 4-tak & CVT baru nih di lab!',
      time: '07:30',
      unreadCount: 5,
    },
    {
      id: 'room-ai',
      name: 'Kang Teguh AI (Asisten)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isGroup: false,
      isAi: true,
      lastMessage: 'Assalamu\'alaikum lur, asisten cerdas siap berdiskusi 24 jam.',
      time: '06:18',
      unreadCount: 0,
      isOnline: true,
    },
  ]);

  // Messages per room
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'room-keluarga': [
      {
        id: 'm1',
        senderId: 'user-bunda',
        senderName: 'Ibu',
        text: 'Assalamu\'alaikum anak-anak, apa kabar semuanya?',
        timestamp: '08:05',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'Saya',
        text: 'Wa\'alaikumsalam bu, alhamdulillah sehat wal afiat. Sedang belajar materi simulasi mesin.',
        timestamp: '08:08',
        isMe: true,
        status: 'read',
        isEncrypted: true,
      },
      {
        id: 'm3',
        senderId: 'user-kakak',
        senderName: 'Kakak',
        text: 'Selamat pagi semua.. Jangan lupa sarapan dan bismillah',
        timestamp: '08:12',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
    ],
    'room-santri': [
      {
        id: 's1',
        senderId: 'farhan',
        senderName: 'Farhan Santri',
        text: 'Bagaimana hafalan surah Ar-Rahman juz 27 antum hari ini?',
        timestamp: '06:45',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
      {
        id: 's2',
        senderId: 'me',
        senderName: 'Saya',
        text: 'Alhamdulillah sudah lancar lur. Murotal komplit 30 juz di aplikasi sekarang ada teks latin dan terjemahannya, jadi enak banget.',
        timestamp: '06:50',
        isMe: true,
        status: 'read',
        isEncrypted: true,
      },
      {
        id: 's3',
        senderId: 'farhan',
        senderName: 'Farhan Santri',
        text: 'Oke siap! Nanti sore kumpul di serambi masjid ya.',
        timestamp: '06:52',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
    ],
    'room-komunitas': [
      {
        id: 'k1',
        senderId: 'budi',
        senderName: 'Budi Matic',
        text: 'Lur, coba cek menu Simulasi Mesin, grafis 4-tak dan CVT nya jalan bergerak keren banget!',
        timestamp: '07:25',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
      {
        id: 'k2',
        senderId: 'me',
        senderName: 'Saya',
        text: 'Iya betul, sekarang isinya materi berbobot edukasi mekanika dan fisika mesin, bukan harga booking bengkel lagi.',
        timestamp: '07:28',
        isMe: true,
        status: 'read',
        isEncrypted: true,
      },
    ],
    'room-ai': [
      {
        id: 'ai-1',
        senderId: 'ai',
        senderName: 'Kang Teguh AI',
        text: 'Assalamu\'alaikum lur! Montir cerdas & asisten santri siap bantu analisa mesin dan konsultasi Al-Qur\'an.',
        timestamp: '06:18',
        isMe: false,
        status: 'read',
        isEncrypted: true,
      },
    ],
  });

  // Story Progress Timer
  useEffect(() => {
    if (!activeStory) return;
    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory]);

  // Call timer logic
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setActiveCall((c) => (c ? { ...c, duration: c.duration + 1 } : null));
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall?.status]);

  // Connect local video stream to <video> element
  useEffect(() => {
    if (activeCall && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [activeCall, activeCall?.status]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (selectedRoom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesMap, selectedRoom]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ==========================================
  // REGISTRATION HANDLER
  // ==========================================
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username minimal 3 karakter (huruf, angka, garis bawah).');
      return;
    }

    // Check if username already taken
    const isTaken = registeredUsernames.some((u) => u.toLowerCase() === cleanUsername);
    if (isTaken) {
      setRegError(`Username "@${cleanUsername}" sudah digunakan oleh orang lain! Buat username unik lainnya.`);
      return;
    }

    // Success: register user
    const newUser: TChatUser = {
      id: 'usr_' + Date.now(),
      username: cleanUsername,
      displayName: regDisplayName.trim() || cleanUsername,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      bio: 'Pengguna aktif TChat TeguhOne',
      registeredAt: new Date().toLocaleDateString('id-ID'),
    };

    const updatedUsernames = [...registeredUsernames, cleanUsername];
    localStorage.setItem('tchat_current_user', JSON.stringify(newUser));
    localStorage.setItem('tchat_registered_users', JSON.stringify(updatedUsernames));

    setRegisteredUsernames(updatedUsernames);
    setCurrentUser(newUser);
    setRegError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('tchat_current_user');
    setCurrentUser(null);
    setShowProfileModal(false);
  };

  // ==========================================
  // REAL VOICE NOTE RECORDING (MediaRecorder API)
  // ==========================================
  const handleStartVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendVoiceNoteMessage(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or not available, using simulated recorder:', err);
      // Fallback recording simulation
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleFinishVoiceRecord = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback
      sendVoiceNoteMessage();
    }
    setIsRecording(false);
  };

  const handleCancelVoiceRecord = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const sendVoiceNoteMessage = (audioUrl?: string) => {
    if (!selectedRoom) return;
    const durationStr = `0:${recordSeconds < 10 ? '0' : ''}${Math.max(1, recordSeconds)}`;

    const newMsg: ChatMessage = {
      id: 'vn_' + Date.now(),
      senderId: 'me',
      senderName: currentUser?.displayName || 'Saya',
      text: `Pesan Suara (${durationStr})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'read',
      isEncrypted: true,
      type: 'voice',
      audioDuration: durationStr,
      mediaUrl: audioUrl,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
    }));
  };

  // ==========================================
  // TEXT TO SPEECH (TTS)
  // ==========================================
  const handleSpeakText = (msgId: string, textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Browser Anda tidak mendukung Web Speech API');
    }
  };

  // ==========================================
  // SEND TEXT MESSAGE
  // ==========================================
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const newMsgText = inputText.trim();
    const newMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      senderId: 'me',
      senderName: currentUser?.displayName || 'Saya',
      text: newMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
      isEncrypted: true,
      type: 'text',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
    }));

    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    // AI automated reply if room is AI
    if (selectedRoom.isAi) {
      setTimeout(() => {
        const replyText = `Sip lur! Pesan "${newMsgText}" sudah diterima sistem cerdas. Siap bantu analisa kapanpun.`;
        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          senderId: 'ai',
          senderName: 'Kang Teguh AI',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          status: 'read',
          isEncrypted: true,
          type: 'text',
        };
        setMessagesMap((prev) => ({
          ...prev,
          [selectedRoom.id]: [...(prev[selectedRoom.id] || []), aiMsg],
        }));

        if (autoTtsEnabled) {
          handleSpeakText(aiMsg.id, replyText);
        }
      }, 1000);
    }
  };

  // ==========================================
  // REAL CALLING WITH DEVICE PERMISSIONS
  // ==========================================
  const handleInitiateCall = (contactName: string, avatar: string, type: 'audio' | 'video') => {
    setPendingCallContact({ name: contactName, avatar });
    setPendingCallType(type);
    setPermissionError(null);
    setShowPermissionPrompt(true);
  };

  const handleGrantPermissionsAndCall = async () => {
    if (!pendingCallContact) return;

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: pendingCallType === 'video' ? { facingMode: 'user' } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      setShowPermissionPrompt(false);
      setActiveCall({
        name: pendingCallContact.name,
        avatar: pendingCallContact.avatar,
        type: pendingCallType,
        status: 'calling',
        duration: 0,
        isMuted: false,
        isVideoOff: false,
      });

      // Connect after short ringing
      setTimeout(() => {
        setActiveCall((c) => (c ? { ...c, status: 'connected' } : null));
      }, 1800);
    } catch (err: any) {
      console.warn('Media permission error:', err);
      setPermissionError(
        'Izin Mikrofon / Kamera ditolak atau diblokir browser. Anda dapat mengklik "Uji Coba Panggilan Langsung" di bawah untuk mencoba panggilan sekarang.'
      );
    }
  };

  const handleStartSimulatedCall = () => {
    if (!pendingCallContact) return;
    setShowPermissionPrompt(false);
    setPermissionError(null);
    setActiveCall({
      name: pendingCallContact.name,
      avatar: pendingCallContact.avatar,
      type: pendingCallType,
      status: 'calling',
      duration: 0,
      isMuted: false,
      isVideoOff: false,
    });

    setTimeout(() => {
      setActiveCall((c) => (c ? { ...c, status: 'connected' } : null));
    }, 1500);
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setActiveCall(null);
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setActiveCall((c) => (c ? { ...c, isMuted: !c.isMuted } : null));
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setActiveCall((c) => (c ? { ...c, isVideoOff: !c.isVideoOff } : null));
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render Panggilan & Izin Perangkat (Bisa diakses dari Chat Room maupun Tab Panggilan)
  const renderCallModals = () => (
    <>
      {/* INTERACTIVE DEVICE PERMISSION MODAL FOR CALLS */}
      {showPermissionPrompt && pendingCallContact && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#008069] flex items-center justify-center mx-auto shadow-xs">
              {pendingCallType === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                Izin Perangkat Diperlukan
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                TChat memerlukan izin {pendingCallType === 'video' ? 'Kamera & Mikrofon' : 'Mikrofon'} untuk menghubungkan panggilan ke <span className="font-bold text-slate-900">{pendingCallContact.name}</span> secara langsung.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Keamanan &amp; Privasi Terjaga</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Kamera dan mikrofon Anda hanya diakses saat panggilan aktif dan tidak pernah direkam ke server.
              </p>
            </div>

            {permissionError && (
              <div className="space-y-2">
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {permissionError}
                </div>
                <button
                  type="button"
                  onClick={handleStartSimulatedCall}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mulai Panggilan Langsung (Mode Uji Coba)</span>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleGrantPermissionsAndCall}
                className="w-full py-3 rounded-2xl bg-[#00a884] hover:bg-[#008f70] text-white font-bold text-sm shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Setujui &amp; Mulai Panggilan</span>
              </button>
              <button
                type="button"
                onClick={handleStartSimulatedCall}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Uji Coba Langsung (Tanpa Izin Kamera)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPermissionPrompt(false)}
                className="w-full py-1 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE AUDIO / VIDEO CALL DIALOG WITH REAL CAMERA STREAM */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 text-white animate-in fade-in duration-300">
          {/* Header info */}
          <div className="text-center pt-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {activeCall.type === 'video' ? 'Panggilan Video TChat' : 'Panggilan Suara TChat'}
            </span>
            <h2 className="text-2xl font-black mt-3">{activeCall.name}</h2>
            <p className="text-sm text-slate-300 font-mono mt-1">
              {activeCall.status === 'calling'
                ? 'Menghubungkan...'
                : `Tersambung • ${formatSecs(activeCall.duration)}`}
            </p>
          </div>

          {/* Center Area: Real Local Camera Video OR Profile Avatar */}
          {activeCall.type === 'video' && !activeCall.isVideoOff ? (
            <div className="relative w-full max-w-xs h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black">
              {localStreamRef.current ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                  <img
                    src={activeCall.avatar}
                    alt={activeCall.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Kamera Simulasi Aktif
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-emerald-400">
                Kamera Anda (Aktif)
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00a884] shadow-2xl relative">
                <img
                  src={activeCall.avatar}
                  alt={activeCall.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {activeCall.status === 'calling' && (
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping pointer-events-none" />
              )}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex items-center gap-6 pb-6">
            <button
              onClick={handleToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                activeCall.isMuted ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={activeCall.isMuted ? 'Nyalakan Mikrofon' : 'Matikan Mikrofon'}
            >
              {activeCall.isMuted ? <VolumeX className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
              title="Akhiri Panggilan"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {activeCall.type === 'video' ? (
              <button
                onClick={handleToggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  activeCall.isVideoOff ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={activeCall.isVideoOff ? 'Nyalakan Kamera' : 'Matikan Kamera'}
              >
                <Video className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setSpeakerActive(!speakerActive);
                  showToast(speakerActive ? 'Pengeras suara dimatikan' : 'Pengeras suara diaktifkan');
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  speakerActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={speakerActive ? 'Matikan Pengeras Suara' : 'Nyalakan Pengeras Suara'}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Filtered rooms
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // REGISTRATION VIEW (If user hasn't registered a username yet)
  // ==========================================
  if (!currentUser) {
    const cleanInput = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const isTaken = cleanInput.length >= 3 && registeredUsernames.some((u) => u.toLowerCase() === cleanInput);
    const isAvailable = cleanInput.length >= 3 && !isTaken;

    return (
      <div className="w-full bg-[#efeae2] rounded-3xl overflow-hidden border border-slate-300 shadow-2xl p-4 sm:p-6 min-h-[580px] flex flex-col justify-center items-center">
        {/* Header Logo & Title */}
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#008069] text-white flex items-center justify-center mx-auto shadow-md">
            <MessageCircle className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Daftar Akun TChat
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Cukup buat 1 username unik Anda. Bebas tanpa ribet, langsung siap kirim pesan, suara, &amp; telepon!
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Pilih Username Anda:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value);
                    setRegError('');
                  }}
                  placeholder="misal: teguh_montir"
                  className={`w-full bg-slate-50 border rounded-2xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-950 focus:outline-none transition-colors ${
                    isTaken
                      ? 'border-red-500 bg-red-50/40 text-red-900'
                      : isAvailable
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                      : 'border-slate-300 focus:border-[#008069]'
                  }`}
                />
              </div>

              {/* Live Real-time Status Indicator */}
              <div className="mt-1.5 min-h-[20px]">
                {isTaken ? (
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Username "@{cleanInput}" sudah digunakan! Coba yang lain.</span>
                  </p>
                ) : isAvailable ? (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Username "@{cleanInput}" tersedia &amp; siap didaftarkan!</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Gunakan huruf kecil, angka, atau garis bawah (min. 3 karakter).
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Nama Tampilan (Opsional):
              </label>
              <input
                type="text"
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="misal: Kang Teguh"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-950 focus:outline-none focus:border-[#008069]"
              />
            </div>

            {regError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                {regError}
              </div>
            )}

            <button
              type="submit"
              disabled={isTaken || cleanInput.length < 3}
              className={`w-full py-3 rounded-2xl font-black text-sm text-white shadow-lg cursor-pointer transition-all active:scale-95 ${
                isTaken || cleanInput.length < 3
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-[#008069] hover:bg-[#00705c]'
              }`}
            >
              Daftar &amp; Buka TChat
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ← Kembali ke Beranda Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // INSIDE CHAT ROOM VIEW (TChat Native UI)
  // ==========================================
  if (selectedRoom) {
    const activeMessages = messagesMap[selectedRoom.id] || [];

    return (
      <div className="w-full flex flex-col h-[calc(100dvh-6rem)] min-h-[580px] max-h-[880px] bg-[#efeae2] rounded-3xl overflow-hidden border border-slate-300 shadow-2xl relative">
        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;
                  const maxDim = 800;
                  if (width > maxDim || height > maxDim) {
                    if (width > height) {
                      height = Math.round((height * maxDim) / width);
                      width = maxDim;
                    } else {
                      width = Math.round((width * maxDim) / height);
                      height = maxDim;
                    }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);
                  const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);

                  const newMsg: ChatMessage = {
                    id: 'img_' + Date.now(),
                    senderId: 'me',
                    senderName: currentUser.displayName,
                    text: 'Foto Terkirim',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    status: 'read',
                    isEncrypted: true,
                    type: 'image',
                    mediaUrl: compressedUrl,
                  };
                  setMessagesMap((prev) => ({
                    ...prev,
                    [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
                  }));
                };
                img.src = event.target?.result as string;
              };
              reader.readAsDataURL(file);
            } catch (err) {
              console.warn('Image upload error:', err);
            }
            setShowAttachmentMenu(false);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800;
                if (width > maxDim || height > maxDim) {
                  if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                  } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);

                const newMsg: ChatMessage = {
                  id: 'cam_' + Date.now(),
                  senderId: 'me',
                  senderName: currentUser.displayName,
                  text: 'Foto Kamera Langsung',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isMe: true,
                  status: 'read',
                  isEncrypted: true,
                  type: 'image',
                  mediaUrl: compressedUrl,
                };
                setMessagesMap((prev) => ({
                  ...prev,
                  [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
                }));
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          }}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const newMsg: ChatMessage = {
              id: 'doc_' + Date.now(),
              senderId: 'me',
              senderName: currentUser.displayName,
              text: `📄 Dokumen: ${file.name} (${Math.round(file.size / 1024)} KB)`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: true,
              status: 'read',
              isEncrypted: true,
              type: 'text',
            };
            setMessagesMap((prev) => ({
              ...prev,
              [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
            }));
            setShowAttachmentMenu(false);
          }}
        />
        <input
          ref={audioFileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const audioUrl = URL.createObjectURL(file);
            const newMsg: ChatMessage = {
              id: 'aud_' + Date.now(),
              senderId: 'me',
              senderName: currentUser.displayName,
              text: `🎵 Audio: ${file.name}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: true,
              status: 'read',
              isEncrypted: true,
              type: 'voice',
              audioDuration: '0:30',
              mediaUrl: audioUrl,
            };
            setMessagesMap((prev) => ({
              ...prev,
              [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
            }));
            setShowAttachmentMenu(false);
          }}
        />

        {/* TChat Room Header (Dark Emerald #008069) */}
        <div className="bg-[#008069] text-white px-3 py-2.5 flex items-center justify-between shadow-md shrink-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSelectedRoom(null)}
              className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full cursor-pointer transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={selectedRoom.avatar}
                alt={selectedRoom.name}
                className="w-9 h-9 rounded-full object-cover border border-white/40 shadow-xs"
              />
              {selectedRoom.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white ring-1 ring-emerald-600" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate leading-tight">
                {selectedRoom.name}
              </h3>
              <p className="text-[11px] text-emerald-100/90 truncate">
                {selectedRoom.isOnline ? 'online' : 'terakhir dilihat hari ini 11:20'}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 text-white shrink-0">
            <button
              onClick={() => setAutoTtsEnabled(!autoTtsEnabled)}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                autoTtsEnabled
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'hover:bg-white/10 text-emerald-100'
              }`}
              title={autoTtsEnabled ? 'Auto-TTS Aktif' : 'Nyalakan Auto-TTS'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Video Call with Device Permission Check */}
            <button
              onClick={() => handleInitiateCall(selectedRoom.name, selectedRoom.avatar, 'video')}
              className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
              title="Panggilan Video"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Audio Call with Device Permission Check */}
            <button
              onClick={() => handleInitiateCall(selectedRoom.name, selectedRoom.avatar, 'audio')}
              className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
              title="Panggilan Suara"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowProfileModal(true)}
              className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
              title="Menu Profil"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Encryption Banner */}
        <div className="py-1 px-3 bg-[#ffeecd] border-b border-[#fed88f] flex items-center justify-center text-center text-xs text-[#54656f] shadow-2xs shrink-0">
          <div className="flex items-center gap-1.5 max-w-sm">
            <Lock className="w-3 h-3 text-[#54656f] shrink-0" />
            <span className="text-[10px] font-medium leading-tight">
              Pesan dienkripsi end-to-end. Hanya Anda dan {selectedRoom.name} yang dapat membaca.
            </span>
          </div>
        </div>

        {/* Messages Stream - High Contrast, Large Readable Text */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-2.5 sm:p-3 shadow-xs relative transition-all ${
                  msg.isMe
                    ? 'bg-[#d9fdd3] text-slate-950 rounded-tr-xs border border-emerald-200/60'
                    : 'bg-white text-slate-950 rounded-tl-xs border border-slate-200/80'
                }`}
              >
                {!msg.isMe && selectedRoom.isGroup && (
                  <p className="text-xs font-black text-[#008069] mb-1">
                    {msg.senderName}
                  </p>
                )}

                {/* Voice Note Message */}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() => {
                        if (msg.mediaUrl) {
                          const audio = new Audio(msg.mediaUrl);
                          audio.play();
                        } else {
                          handleSpeakText(msg.id, 'Pesan suara: ' + (msg.audioDuration || '5 detik'));
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </button>
                    <div className="space-y-1 min-w-[140px]">
                      <div className="flex items-end gap-1 h-5">
                        {[40, 70, 90, 60, 30, 80, 100, 60, 40, 75, 85, 50].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-full bg-[#00a884]"
                            style={{ height: `${(h / 100) * 18}px` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] font-mono font-bold text-slate-700">
                        <span>{msg.audioDuration || '0:05'}</span>
                        <span className="text-[#008069]">Voice Note</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Message */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="rounded-xl overflow-hidden mb-1 border border-slate-200 max-w-xs">
                    <img
                      src={msg.mediaUrl}
                      alt="Gambar Terkirim"
                      className="w-full max-h-60 object-cover"
                    />
                  </div>
                )}

                {/* Text Content - Large, Crisp, High Contrast */}
                <p className="text-sm sm:text-base font-bold text-slate-950 leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Message Footer */}
                <div className="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-black/5 text-[11px] text-slate-600">
                  <button
                    onClick={() => handleSpeakText(msg.id, msg.text)}
                    className="flex items-center gap-1 font-bold text-[#008069] hover:underline cursor-pointer"
                    title="Dengarkan Teks Pesan (TTS)"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{speakingMsgId === msg.id ? 'Berhenti' : 'Dengarkan'}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-slate-600">
                    <span>{msg.timestamp}</span>
                    {msg.isMe && (
                      <CheckCheck className="w-4 h-4 text-[#53bdeb] inline" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Tray Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-2 right-2 sm:right-auto sm:w-80 bg-white rounded-3xl p-3 shadow-2xl border border-slate-300 z-40 max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">Pilih Emoji</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-2xl text-center">
              {['😀', '😂', '👍', '❤️', '🤲', '🙏', '🔥', '🏍️', '🔧', '🕌', '💪', '💯', '✨', '☕', '🎉', '🌟', '🤝', '🚗', '⚡', '💡', '📖'].map(
                (em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + em);
                      textInputRef.current?.focus();
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-transform active:scale-125"
                  >
                    {em}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Attachment Menu Popup */}
        {showAttachmentMenu && (
          <div className="absolute bottom-20 left-3 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-40 animate-in fade-in duration-200">
            <div className="grid grid-cols-4 gap-2 text-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Kamera</span>
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Galeri</span>
              </button>

              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Dokumen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newMsg: ChatMessage = {
                    id: 'loc_' + Date.now(),
                    senderId: 'me',
                    senderName: currentUser.displayName,
                    text: '📍 Lokasi Saya: Indonesia',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    status: 'read',
                    isEncrypted: true,
                    type: 'text',
                  };
                  setMessagesMap((prev) => ({
                    ...prev,
                    [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMsg],
                  }));
                  setShowAttachmentMenu(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Lokasi</span>
              </button>
            </div>
          </div>
        )}

        {/* NATIVE-STYLE MESSAGE INPUT BAR AT BOTTOM (CLEARS HOME BUTTON AREA) */}
        {isRecording ? (
          <div className="p-2 sm:p-2.5 pb-4 sm:pb-3 bg-white border-t border-slate-300 flex items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs sm:text-sm font-bold text-red-600 font-mono">
                Merekam Suara: 0:{recordSeconds < 10 ? '0' : ''}{recordSeconds}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelVoiceRecord}
                className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                title="Batalkan Rekaman"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleFinishVoiceRecord}
                className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
                title="Kirim Pesan Suara"
              >
                <Send className="w-5 h-5 translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-2.5 pb-4 sm:pb-3 bg-[#efeae2] border-t border-slate-300/80 flex items-center gap-1.5 sm:gap-2 shrink-0 z-20"
          >
            {/* White Capsule Pill Input Container - with min-w-0 to prevent horizontal overflow */}
            <div className="flex-1 min-w-0 bg-white rounded-full flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 shadow-sm border border-slate-300">
              {/* Emoji Icon */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachmentMenu(false);
                }}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
                title="Pilih Emoji"
              >
                <Smile className="w-5 h-5 text-slate-600" />
              </button>

              {/* High Contrast Text Input with min-w-0 */}
              <input
                ref={textInputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 min-w-0 w-full bg-transparent px-2 py-1.5 text-sm sm:text-base font-bold text-slate-950 placeholder-slate-500 focus:outline-none"
              />

              {/* Attachment Paperclip */}
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowEmojiPicker(false);
                }}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
                title="Lampirkan File"
              >
                <Paperclip className="w-5 h-5 text-slate-600" />
              </button>

              {/* Camera Icon */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
                title="Buka Kamera"
              >
                <Camera className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* ROUND ACTION BUTTON (SEND OR MIC) - ALWAYS VISIBLE, NEVER CUT OFF */}
            <div className="shrink-0">
              {inputText.trim() ? (
                <button
                  type="submit"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00a884] hover:bg-[#008f70] text-white flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer border border-emerald-600/30"
                  title="Kirim Pesan"
                >
                  <Send className="w-5 h-5 fill-current translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartVoiceRecord}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00a884] hover:bg-[#008f70] text-white flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer border border-emerald-600/30"
                  title="Rekam Pesan Suara"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* INTERACTIVE CALL & PERMISSION MODALS */}
        {renderCallModals()}
      </div>
    );
  }

  // ==========================================
  // MAIN TCHAT SCREEN (Tabs: Chat, Pembaruan/Status, Panggilan, Komunitas)
  // ==========================================
  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative min-h-[580px] pb-16">
      {/* TChat Header (#008069) */}
      <div className="bg-[#008069] text-white px-4 pt-3 pb-0 shadow-md">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              TChat
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
              @{currentUser.username}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              title="Kamera Cepat"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className={`p-1 rounded-full cursor-pointer transition-colors ${
                showSearchBar ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              title="Pencarian Obrolan"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              title="Profil Pengguna"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-xs font-bold bg-white/10 px-2.5 py-1"
              title="Kembali ke Beranda Utama"
            >
              Beranda
            </button>
          </div>
        </div>

        {/* Interactive Search Bar (When Toggled) */}
        {showSearchBar && (
          <div className="pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kontak atau pesan di TChat..."
                autoFocus
                className="w-full bg-white text-slate-900 rounded-2xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TChat Tabs Bar */}
        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-emerald-100">
          <button
            onClick={() => setActiveTab('komunitas')}
            className={`py-2 px-3 border-b-3 transition-all cursor-pointer ${
              activeTab === 'komunitas' ? 'border-white text-white' : 'border-transparent text-emerald-200 hover:text-white'
            }`}
            title="Komunitas"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-center border-b-3 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chat' ? 'border-white text-white' : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>Chat</span>
            <span className="w-4 h-4 rounded-full bg-white text-[#008069] text-[10px] font-black flex items-center justify-center">
              {filteredRooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 text-center border-b-3 transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'status' ? 'border-white text-white' : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>Pembaruan</span>
            <span className="w-2 h-2 rounded-full bg-amber-300" />
          </button>

          <button
            onClick={() => setActiveTab('panggilan')}
            className={`flex-1 py-2 text-center border-b-3 transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'panggilan' ? 'border-white text-white' : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>Panggilan</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setStatuses([
            {
              id: 'st_new_' + Date.now(),
              name: currentUser.displayName,
              avatar: currentUser.avatar,
              time: 'Baru saja',
              mediaUrl: url,
              caption: 'Status baru dari kamera',
            },
            ...statuses,
          ]);
          showToast('Status cerita berhasil diperbarui!');
        }}
      />

      {/* TAB 1: CHAT LIST */}
      {activeTab === 'chat' && (
        <div className="divide-y divide-slate-100">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="flex items-center gap-3 p-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="relative shrink-0">
                <img
                  src={room.avatar}
                  alt={room.name}
                  className="w-13 h-13 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                {room.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25d366] border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-sm sm:text-base text-slate-950 truncate">
                    {room.name}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500 font-mono">
                    {room.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate pr-2">
                    {room.lastMessage}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-[#25d366] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Floating Action Button (FAB) for New Chat */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#00a884] hover:bg-[#008f70] text-white shadow-xl flex items-center justify-center transition-transform active:scale-90 cursor-pointer z-30"
            title="Chat Baru"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* TAB 2: PEMBARUAN (STATUS STORIES) */}
      {activeTab === 'status' && (
        <div className="p-4 space-y-4">
          <div
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt="Status Saya"
                className="w-13 h-13 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-xs border-2 border-white">
                +
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Status Saya</h4>
              <p className="text-xs text-slate-500">Ketuk untuk memperbarui status cerita</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Pembaruan Terkini
            </span>

            <div className="space-y-3">
              {statuses.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setActiveStory(st)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#00a884] flex items-center justify-center shrink-0">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                    <p className="text-xs font-semibold text-slate-500">{st.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PANGGILAN (CALL LOGS & DEVICE PERMISSION TESTING) */}
      {activeTab === 'panggilan' && (
        <div className="p-3 divide-y divide-slate-100 space-y-3">
          {/* Device Permissions Check & Test Card */}
          <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#008069] flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Uji Perangkat &amp; Izin Panggilan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 font-bold text-[10px]">
                Mikrofon &amp; Kamera
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Pastikan browser Anda mengizinkan akses mikrofon dan kamera untuk panggilan audio dan video real-time.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleInitiateCall('Uji Coba Suara', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', 'audio')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Tes Panggilan Suara</span>
              </button>
              <button
                onClick={() => handleInitiateCall('Uji Coba Video', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', 'video')}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Tes Kamera &amp; Video</span>
              </button>
            </div>
          </div>

          {/* Call Logs History */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 px-2">
              Riwayat Panggilan
            </span>

            {callLogs.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={call.avatar}
                    alt={call.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{call.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                      {call.direction === 'incoming' ? (
                        call.status === 'missed' ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-600 inline" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#00a884] inline" />
                        )
                      ) : (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-slate-400 inline" />
                      )}
                      <span>{call.time}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleInitiateCall(call.name, call.avatar, call.type)}
                  className="p-2 text-[#008069] hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
                  title="Panggil Kembali"
                >
                  {call.type === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KOMUNITAS */}
      {activeTab === 'komunitas' && (
        <div className="p-4 space-y-4">
          <div className="bg-linear-to-r from-emerald-800 to-[#008069] text-white p-4 rounded-3xl shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Komunitas Terbuka TChat
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                P2P Mesh
              </span>
            </div>
            <h3 className="font-black text-lg text-white">
              Wadah Kolaborasi Santri &amp; Otomotif
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Satukan grup diskusi montir, majelis tilawah, dan keluarga dalam saluran terenkripsi tanpa server pihak ketiga.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setShowNewCommunityModal(true)}
                className="w-full py-2.5 rounded-xl bg-white text-[#008069] font-black text-xs shadow-md hover:bg-emerald-50 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Komunitas / Saluran Baru</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
              Rekomendasi Komunitas Aktif
            </span>

            {[
              {
                id: 'comm-1',
                name: 'Bengkel & Mekanik Santri Nusantara',
                members: '128 anggota',
                desc: 'Diskusi analisa injeksi, tune up, tips bore-up, & info sparepart terpercaya.',
                avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80',
              },
              {
                id: 'comm-2',
                name: 'Paguyuban Motor Matic Honda & Yamaha',
                members: '340 anggota',
                desc: 'Sharing pengalaman servis CVT, perawatan v-belt, dan kopdar silaturahmi.',
                avatar: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=200&q=80',
              },
              {
                id: 'comm-3',
                name: 'Majelis Tilawah & Murotal Subuh',
                members: '89 anggota',
                desc: 'Khataman Al-Qur\'an 30 Juz bersama, saling mengingatkan dalam kebaikan.',
                avatar: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=200&q=80',
              },
            ].map((comm) => (
              <div
                key={comm.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3"
              >
                <img
                  src={comm.avatar}
                  alt={comm.name}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                    {comm.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-600 block mb-0.5">
                    {comm.members}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-tight">
                    {comm.desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const existing = rooms.find((r) => r.id === comm.id);
                    if (!existing) {
                      const newR: ChatRoom = {
                        id: comm.id,
                        name: comm.name,
                        avatar: comm.avatar,
                        isGroup: true,
                        lastMessage: 'Bergabung dengan komunitas',
                        time: 'Baru saja',
                        unreadCount: 0,
                        isOnline: true,
                      };
                      setRooms([newR, ...rooms]);
                      setSelectedRoom(newR);
                    } else {
                      setSelectedRoom(existing);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs rounded-xl shadow-2xs shrink-0 cursor-pointer self-center"
                >
                  Buka
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN STATUS STORY VIEWER */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 text-white animate-in fade-in duration-200">
          <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
            <div
              className="bg-white h-full transition-all duration-100 ease-linear"
              style={{ width: `${storyProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={activeStory.avatar}
                alt={activeStory.name}
                className="w-10 h-10 rounded-full object-cover border border-white"
              />
              <div>
                <h4 className="font-bold text-sm text-white">{activeStory.name}</h4>
                <p className="text-xs text-white/70">{activeStory.time}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveStory(null)}
              className="p-1.5 rounded-full bg-black/40 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-4 overflow-hidden">
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            {activeStory.caption && (
              <p className="text-sm font-semibold text-center text-white mt-3 px-4 py-2 bg-black/60 rounded-xl">
                {activeStory.caption}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder={`Balas ke ${activeStory.name}...`}
              className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none"
            />
            <button
              onClick={() => {
                showToast('Balasan status terkirim!');
                setActiveStory(null);
              }}
              className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* USER PROFILE & LOGOUT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                Profil Akun TChat Anda
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#008069]"
              />
              <div>
                <h4 className="font-bold text-base text-slate-950">
                  {currentUser.displayName}
                </h4>
                <p className="text-xs font-mono font-bold text-[#008069]">
                  @{currentUser.username}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Terdaftar: {currentUser.registeredAt}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold block text-slate-900">Tentang / Status:</span>
              <p>{currentUser.bio}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Ganti Akun / Logout Username</span>
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                Mulai Obrolan Baru
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ketik Nama Kontak / Teman:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChatInputName}
                  onChange={(e) => setNewChatInputName(e.target.value)}
                  placeholder="Contoh: Pak RT / Montir Budi"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newChatInputName.trim()) return;
                    const newR: ChatRoom = {
                      id: 'room_' + Date.now(),
                      name: newChatInputName.trim(),
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      isGroup: false,
                      lastMessage: 'Obrolan dimulai',
                      time: 'Baru saja',
                      unreadCount: 0,
                      isOnline: true,
                    };
                    setRooms([newR, ...rooms]);
                    setSelectedRoom(newR);
                    setShowNewChatModal(false);
                    setNewChatInputName('');
                  }}
                  className="px-4 py-2 bg-[#008069] text-white font-bold text-xs rounded-xl hover:bg-[#00705c] cursor-pointer"
                >
                  Mulai
                </button>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Pilih Dari Kontak Tersedia:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      const existing = rooms.find((r) => r.name.toLowerCase() === c.name.toLowerCase());
                      if (existing) {
                        setSelectedRoom(existing);
                      } else {
                        const newR: ChatRoom = {
                          id: 'room_' + Date.now(),
                          name: c.name,
                          avatar: c.avatar,
                          isGroup: false,
                          lastMessage: 'Obrolan baru',
                          time: 'Baru saja',
                          unreadCount: 0,
                          isOnline: c.isOnline,
                        };
                        setRooms([newR, ...rooms]);
                        setSelectedRoom(newR);
                      }
                      setShowNewChatModal(false);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100"
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{c.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#008069] bg-emerald-50 px-2 py-0.5 rounded-md">
                      Chat
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW COMMUNITY MODAL */}
      {showNewCommunityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                Buat Komunitas Baru
              </h3>
              <button
                onClick={() => setShowNewCommunityModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Komunitas / Grup:
                </label>
                <input
                  type="text"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="misal: Paguyuban Honda Vario Bandung"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi Singkat:
                </label>
                <textarea
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="Jelaskan tujuan atau topik komunitas..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008069]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!newCommunityName.trim()) return;
                    const newR: ChatRoom = {
                      id: 'comm_' + Date.now(),
                      name: newCommunityName.trim(),
                      avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80',
                      isGroup: true,
                      lastMessage: 'Komunitas baru dibentuk',
                      time: 'Baru saja',
                      unreadCount: 0,
                      isOnline: true,
                    };
                    setRooms([newR, ...rooms]);
                    setSelectedRoom(newR);
                    setShowNewCommunityModal(false);
                    setNewCommunityName('');
                    setNewCommunityDesc('');
                    showToast('Komunitas berhasil dibuat!');
                  }}
                  className="flex-1 py-2.5 bg-[#008069] text-white font-bold text-xs rounded-xl hover:bg-[#00705c] cursor-pointer shadow-xs"
                >
                  Buat Komunitas
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCommunityModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NON-BLOCKING TOAST NOTIFICATION */}
      {tchatToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 font-bold pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{tchatToast}</span>
        </div>
      )}

      {/* CALL & PERMISSION MODALS (Accessible from Tabs: Panggilan, Chat, dll.) */}
      {renderCallModals()}
    </div>
  );
};
