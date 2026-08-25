import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mic2,
  Music2,
  Sliders,
  Disc3,
  Radio,
  AudioWaveform,
  Send,
  MessageSquare,
  QrCode,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Copy,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Paperclip,
  X,
  UserCheck,
  User,
  Save,
  Building,
  CreditCard,
  Phone,
  Mail,
  Camera,
  UploadCloud,
  FolderUp,
  RefreshCw,
  Trash2,
  Laptop,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Star,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { MapModal } from './MapModal';
import {
  StudioService,
  StudioRoom,
  BookingRequest,
  ChatMessage,
  PixQuote,
  UserProfile,
} from '../types';
import { formatBRL, formatDateBR, exportReceiptPDF } from '../utils/exportUtils';
import { PIXModal } from './PIXModal';
import { EquipmentView } from './EquipmentView';
import { RECORDING_OPTIONS, FPSTUDIO_EQUIPMENT } from '../data/initialData';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';

interface ClientViewProps {
  activeClient: UserProfile;
  isClientLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  onLogoutClient?: () => void;
  services: StudioService[];
  rooms: StudioRoom[];
  bookings: BookingRequest[];
  quotes: PixQuote[];
  chatMessages: ChatMessage[];
  studioInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRequestBooking: (data: any) => void;
  onSendChatMessage: (data: any) => void;
  onUpdateClientProfile?: (updatedData: Partial<UserProfile>) => void;
}

export const ClientView: React.FC<ClientViewProps> = ({
  activeClient,
  isClientLoggedIn = false,
  onOpenAuthModal,
  onLogoutClient,
  services = [],
  rooms = [],
  bookings = [],
  quotes = [],
  chatMessages = [],
  studioInfo = {} as any,
  activeTab = 'new_booking',
  setActiveTab,
  onRequestBooking,
  onSendChatMessage,
  onUpdateClientProfile,
}) => {
  // New Booking State
  const [selectedService, setSelectedService] = useState<StudioService | undefined>(services?.[0]);
  const [selectedRoom, setSelectedRoom] = useState<StudioRoom | undefined>(rooms?.[0]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['pro_tools', 'microfone', 'placa_audio', 'voz', 'guitarra']);
  const [tracksCount, setTracksCount] = useState<number>(1);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((item) => item !== optionId) : [...prev, optionId]
    );
  };

  // Synchronize initial selections when props arrive
  React.useEffect(() => {
    if (!selectedService && services && services.length > 0) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  React.useEffect(() => {
    if (!selectedRoom && rooms && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // Active Chat Booking Selection
  const [activeBookingIdForChat, setActiveBookingIdForChat] = useState<string>(
    (bookings || []).filter((b) => b.clientId === activeClient?.id)[0]?.id || ''
  );
  const [chatInputText, setChatInputText] = useState<string>('');
  const [pendingAttachment, setPendingAttachment] = useState<{
    name: string;
    fileType: string;
    dataUrl: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingAttachment({
        name: file.name,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  // Profile Form States
  const [profileName, setProfileName] = useState(activeClient?.name || '');
  const [profileBand, setProfileBand] = useState(activeClient?.bandOrArtistName || '');
  const [profileEmail, setProfileEmail] = useState(activeClient?.email || '');
  const [profilePhone, setProfilePhone] = useState(activeClient?.phone || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(activeClient?.avatarUrl || '');
  const [profilePassword, setProfilePassword] = useState(activeClient?.password || '');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profilePixKey, setProfilePixKey] = useState(activeClient?.pixKey || '');
  const [profilePixKeyType, setProfilePixKeyType] = useState<'cpf' | 'email' | 'telefone' | 'aleatoria' | string>(activeClient?.pixKeyType || 'cpf');
  const [profileCpf, setProfileCpf] = useState(activeClient?.cpf || '');
  const [profileRg, setProfileRg] = useState(activeClient?.rg || '');
  const [profileAddress, setProfileAddress] = useState(activeClient?.address || '');
  const [profileCity, setProfileCity] = useState(activeClient?.city || '');
  const [profileState, setProfileState] = useState(activeClient?.state || '');
  const [profileCep, setProfileCep] = useState(activeClient?.cep || '');
  const [profileInstagram, setProfileInstagram] = useState(activeClient?.instagram || '');
  const [profileNotes, setProfileNotes] = useState(activeClient?.notes || '');
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const [isAvatarProcessing, setIsAvatarProcessing] = useState(false);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeClient) {
      setProfileName(activeClient.name || '');
      setProfileBand(activeClient.bandOrArtistName || '');
      setProfileEmail(activeClient.email || '');
      setProfilePhone(activeClient.phone || '');
      setProfileAvatarUrl(activeClient.avatarUrl || '');
      setProfilePassword(activeClient.password || '');
      setProfilePixKey(activeClient.pixKey || '');
      setProfilePixKeyType(activeClient.pixKeyType || 'cpf');
      setProfileCpf(activeClient.cpf || '');
      setProfileRg(activeClient.rg || '');
      setProfileAddress(activeClient.address || '');
      setProfileCity(activeClient.city || '');
      setProfileState(activeClient.state || '');
      setProfileCep(activeClient.cep || '');
      setProfileInstagram(activeClient.instagram || '');
      setProfileNotes(activeClient.notes || '');
    }
  }, [activeClient]);

  const processAvatarFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsAvatarProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setProfileAvatarUrl(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          setProfileAvatarUrl(raw);
        }
        setIsAvatarProcessing(false);
      };
      img.onerror = () => {
        setProfileAvatarUrl(raw);
        setIsAvatarProcessing(false);
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    if (onUpdateClientProfile) {
      onUpdateClientProfile({
        name: profileName,
        bandOrArtistName: profileBand,
        email: profileEmail,
        phone: profilePhone,
        avatarUrl: profileAvatarUrl,
        password: profilePassword,
        pixKey: profilePixKey,
        pixKeyType: profilePixKeyType,
        cpf: profileCpf,
        rg: profileRg,
        address: profileAddress,
        city: profileCity,
        state: profileState,
        cep: profileCep,
        instagram: profileInstagram,
        notes: profileNotes,
      });
    }

    setProfileSavedSuccess(true);

    // After brief success notification, automatically exit profile and return to start (Início)
    setTimeout(() => {
      setProfileSavedSuccess(false);
      setIsSavingProfile(false);
      setActiveTab('new_booking');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1100);
  };

  // Active PIX Modal
  const [activePixModalQuote, setActivePixModalQuote] = useState<PixQuote | null>(null);
  const [activePixModalBooking, setActivePixModalBooking] = useState<BookingRequest | null>(null);

  // Filter client's bookings
  const clientBookings = bookings.filter((b) => b.clientId === activeClient?.id);

  // Get active chat booking & messages
  const selectedChatBooking = bookings.find((b) => b.id === activeBookingIdForChat) || clientBookings[0];
  const currentChatMsgs = chatMessages.filter((m) => m.bookingId === selectedChatBooking?.id);

  // Available Time Slots for Room Calendar
  const timeSlots = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic2': return <Mic2 className="w-5 h-5" />;
      case 'Sliders': return <Sliders className="w-5 h-5" />;
      case 'Disc3': return <Disc3 className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'AudioWaveform': return <AudioWaveform className="w-5 h-5" />;
      default: return <Music2 className="w-5 h-5" />;
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setIsSubmittingBooking(true);

    const optionsTotal = selectedOptions.reduce((acc, optId) => {
      const opt = RECORDING_OPTIONS.find((o) => o.id === optId);
      return acc + (opt ? opt.price : 0);
    }, 0);

    const perTrackPrice = (selectedService?.basePrice || 0) + optionsTotal;
    const estimatedTotal = perTrackPrice * tracksCount;

    const optionsDetails = selectedOptions.map((optId) => {
      const opt = RECORDING_OPTIONS.find((o) => o.id === optId);
      if (!opt) return optId;
      return opt.price === 0 ? `${opt.label} (Incluso)` : `${opt.label} (${formatBRL(opt.price)})`;
    });

    const tracksHeader = `Quantidade de Trilhas/Músicas: ${tracksCount} ${tracksCount === 1 ? 'faixa/música' : 'faixas/músicas'}.`;
    const optionsText = selectedOptions.length > 0 
      ? `Recursos e Instrumentos Selecionados: ${optionsDetails.join(', ')}.\nValor por Trilha: ${formatBRL(perTrackPrice)}.`
      : `Valor por Trilha: ${formatBRL(perTrackPrice)}.`;
    const fullNotes = [tracksHeader, optionsText, bookingNotes].filter(Boolean).join('\n');

    setTimeout(() => {
      onRequestBooking({
        clientId: activeClient?.id || '',
        clientName: activeClient?.name || '',
        clientEmail: activeClient?.email || '',
        clientPhone: activeClient?.phone || '',
        bandOrArtistName: activeClient?.bandOrArtistName || '',
        serviceId: selectedService.id,
        roomId: 'fpstudio',
        roomName: 'FPStudio Salvador',
        preferredDate: selectedDate,
        startTime: selectedTime,
        durationHours: selectedService.durationHours,
        notes: fullNotes,
        totalAmount: estimatedTotal,
      });

      setIsSubmittingBooking(false);
      setBookingNotes('');
      setActiveTab('bookings'); // Switch to "Meus Agendamentos"
    }, 500);
  };

  const handleSendTextChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInputText.trim() && !pendingAttachment) || !selectedChatBooking) return;

    onSendChatMessage({
      bookingId: selectedChatBooking.id,
      senderId: activeClient?.id || '',
      senderRole: 'client',
      senderName: activeClient?.bandOrArtistName || activeClient?.name || 'Cliente',
      message: chatInputText.trim() || (pendingAttachment ? 'Comprovante de pagamento PIX enviado!' : ''),
      type: pendingAttachment ? 'receipt' : 'text',
      attachment: pendingAttachment ? { ...pendingAttachment } : undefined,
    });

    setChatInputText('');
    setPendingAttachment(null);
  };

  const handleOpenPixModal = (booking: BookingRequest) => {
    const quote = quotes.find((q) => q.bookingId === booking.id);
    if (quote) {
      setActivePixModalQuote(quote);
      setActivePixModalBooking(booking);
    }
  };

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleGoToServicos = () => {
    setActiveTab('new_booking');
    setTimeout(() => {
      const el = document.getElementById('servicos-desejados');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSendReceiptFromModal = (fileDataUrl: string, fileName: string) => {
    if (!activePixModalBooking) return;

    onSendChatMessage({
      bookingId: activePixModalBooking.id,
      senderId: activeClient.id,
      senderRole: 'client',
      senderName: activeClient.bandOrArtistName || activeClient.name,
      message: `Comprovante de pagamento PIX enviado! (${fileName})`,
      type: 'receipt',
      attachment: {
        name: fileName,
        fileType: 'image',
        dataUrl: fileDataUrl,
      },
    });

    setActiveTab('chat');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Hero Banner matching exact style from user screenshot */}
      <div className="relative overflow-hidden bg-[#0a0a0d] border-b border-zinc-800/80 text-white py-10 px-4 sm:px-6 lg:px-8">
        {/* Subtle radial background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Main Hero Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={fpStudioLogo}
                    alt="FPStudio Logo"
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-2 border-[#00FF41] shadow-[0_0_35px_rgba(0,255,65,0.4)] ring-4 ring-[#00FF41]/20"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#00FF41] text-black font-black text-[10px] uppercase tracking-wider shadow-lg">
                    Salvador
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#00FF41] text-xs font-black uppercase tracking-wider">
                      (Produção Musical)
                    </span>
                    <span className="text-zinc-400 text-xs font-bold">
                      • Salvador - BA
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 leading-tight">
                    PRODUÇÃO MUSICAL, GRAVAÇÃO & <span className="text-[#00FF41] drop-shadow-[0_0_15px_rgba(0,255,65,0.4)]">VÍDEO</span>
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-2xl">
                Sessões de gravação de voz e instrumentos, edição de áudio, afinação vocal (Melodyne) e mixagem em um ambiente intimista acusticamente tratado em Salvador.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleGoToServicos}
                  className="px-6 py-3.5 rounded-full bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>⚡ SIMULAR ORÇAMENTO POR INSTRUMENTOS</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGoToServicos}
                  className="px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm border border-zinc-700/80 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>👁️ VER HORÁRIOS & GRADE</span>
                </button>

                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="px-4 py-3.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#00FF41]" />
                  <span>Ver GPS / Mapa</span>
                </button>
              </div>

              {/* Feature Badges under Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#00FF41]/10 text-[#00FF41]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">FERNANDO PADRE</p>
                    <p className="text-[10px] text-zinc-400 font-semibold">Produtor & Engenheiro</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#00FF41]/10 text-[#00FF41]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">AFINAÇÃO VOCAL</p>
                    <p className="text-[10px] text-zinc-400 font-semibold">Melodyne / Auto-Tune</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#00FF41]/10 text-[#00FF41]">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">MIX & MASTER</p>
                    <p className="text-[10px] text-zinc-400 font-semibold">Pronto p/ Streaming</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Card: Spaces & Room Cards */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-[#111115] border border-zinc-800 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#00FF41]">
                      PRODUÇÃO & GRAVAÇÃO
                    </span>
                    <h3 className="text-base font-black text-white">FPStudio Salvador</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-black uppercase tracking-wider">
                    DISPONÍVEL
                  </span>
                </div>

                {/* Highlight: Pro-Tools (INCLUSO) */}
                <div
                  onClick={handleGoToServicos}
                  className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-[#00FF41]/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#00FF41] transition">
                        PRO-TOOLS
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">DAW Profissional de Gravação e Mixagem</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#00FF41]/20 text-[#00FF41] font-black text-[11px] border border-[#00FF41]/40 shrink-0">
                    INCLUSO
                  </span>
                </div>

                {/* Highlight: Microfone (Incluso) */}
                <div
                  onClick={handleGoToServicos}
                  className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-[#00FF41]/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#00FF41] transition">
                        MICROFONE
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">Microfonação Kadosh 412 Alta Performance</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#00FF41]/20 text-[#00FF41] font-black text-[11px] border border-[#00FF41]/40 shrink-0">
                    INCLUSO
                  </span>
                </div>

                {/* Highlight: Placa de Áudio (Incluso) */}
                <div
                  onClick={handleGoToServicos}
                  className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-[#00FF41]/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#00FF41] transition">
                        PLACA DE ÁUDIO
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400">Interface de Áudio M-Audio Pro HD</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#00FF41]/20 text-[#00FF41] font-black text-[11px] border border-[#00FF41]/40 shrink-0">
                    INCLUSO
                  </span>
                </div>

                {/* Bottom link to Chat */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-zinc-400 border-t border-zinc-800/80">
                  <span>DÚVIDAS SOBRE SUA PRODUÇÃO?</span>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-[#00FF41] hover:underline font-black flex items-center gap-1 cursor-pointer"
                  >
                    <span>CHAT DO ESTÚDIO</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Section Header: Infrastructure & Gear */}
          <div className="pt-8 border-t border-zinc-800/80 text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-xs font-black uppercase tracking-wider">
              🎧 INFRAESTRUTURA DE ALTO PADRÃO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ESPAÇOS & EQUIPAMENTOS DO ESTÚDIO
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Ambiente acusticamente tratado, tratamento contra reflexões e microfonação de ponta operados diretamente pelo músico e produtor Fernando Padre.
            </p>
          </div>

        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="bg-[#0a0a0d] border-b border-zinc-800/80 relative z-10 px-3 sm:px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 py-0.5 shrink-0">
            <button
              onClick={handleGoToServicos}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'new_booking'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Meus Pedidos</span>
              {clientBookings.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'bookings' ? 'bg-black text-[#00FF41]' : 'bg-[#00FF41]/20 text-[#00FF41]'
                }`}>
                  {clientBookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services_equipment')}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'services_equipment' || activeTab === 'services' || activeTab === 'equipment'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Music2 className="w-3.5 h-3.5 shrink-0" />
              <span className="flex flex-col text-left leading-[1.1]">
                <span className="font-black text-xs">Serviços</span>
                <span className={`text-[9.5px] font-bold ${
                  activeTab === 'services_equipment' || activeTab === 'services' || activeTab === 'equipment' ? 'opacity-85' : 'text-zinc-400'
                }`}>& Material</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Depoimentos ⭐</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
              {currentChatMsgs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              title="Meu Cadastro"
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#00FF41] text-black font-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-400 shrink-0">
            <span className="text-zinc-500">Cliente:</span>
            <span className="font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1.5 max-w-[200px] truncate">
              <span className="truncate">{activeClient?.bandOrArtistName || activeClient?.name || 'Cliente'}</span>
              {activeClient?.cpf && (
                <span className="text-[9px] text-[#00FF41] font-mono px-1 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 shrink-0">
                  CPF OK
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= TAB 1: NOVO AGENDAMENTO ONLINE ================= */}
        {activeTab === 'new_booking' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Catalog of Services & Studio Rooms */}
            <div id="servicos-desejados" className="lg:col-span-7 space-y-6 scroll-mt-28">
              
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Music2 className="w-6 h-6 text-[#00FF41]" /> Serviços Desejados & Simulação de Orçamento
                </h2>
                <p className="text-xs text-zinc-400">
                  Selecione o serviço e os instrumentos/opções de gravação desejadas para recalcular o orçamento em tempo real
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(services || []).map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedService(srv);
                      }}
                      className={`overflow-hidden rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10 dark:bg-emerald-950/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {srv.imageUrl ? (
                        <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                          <img
                            src={srv.imageUrl}
                            alt={srv.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                            <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                              {getServiceIcon(srv.iconName)}
                              <span className="capitalize">{srv.category || 'Serviço'}</span>
                            </span>
                            <span className="text-xs font-black text-emerald-400 bg-black/70 px-2 py-0.5 rounded">
                              {formatBRL(srv.basePrice)}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {!srv.imageUrl && (
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                {getServiceIcon(srv.iconName)}
                              </div>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full">
                                {formatBRL(srv.basePrice)}
                              </span>
                            </div>
                          )}

                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {srv.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {srv.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> {srv.durationHours}h de sessão
                          </span>
                          <span className="font-medium text-emerald-500/80">FPStudio Salvador</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FPStudio Equipment Showcase */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#00FF41] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00FF41]" /> Instrumentos & Setup FPStudio
                  </h4>
                  <span className="text-[10px] bg-[#00FF41]/20 text-[#00FF41] px-2 py-0.5 rounded font-bold border border-[#00FF41]/30">Gravação & Edição</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {FPSTUDIO_EQUIPMENT.map((eq, i) => (
                    <div key={i} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                      <p className="text-[9px] text-indigo-400 font-bold uppercase">{eq.category}</p>
                      <p className="font-semibold text-white truncate mt-0.5">{eq.item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Schedule Calendar & Request Form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Serviço Selecionado</p>
                  <h3 className="font-bold text-base leading-tight">{selectedService?.name || 'Selecione um serviço'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">FPStudio Salvador • Sessão Profissional</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-400">{formatBRL(selectedService?.basePrice || 0)}</p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Sessão de Gravação:
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Time Slots Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Horários de Gravação Disponíveis:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      // Check if slot is booked
                      const isBooked = bookings.some(
                        (b) => b.preferredDate === selectedDate && b.startTime === time && b.status !== 'cancelado'
                      );
                      const isSelected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            isBooked
                              ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" /> {time}
                          {isBooked && <span className="text-[9px] text-red-400 font-normal ml-0.5">(Ocupado)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tracks Quantity Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Quantidade de Trilhas / Músicas a Gravar / Produzir:
                    </label>
                    <span className="text-[10px] text-indigo-500 font-semibold">Defina o nº de faixas</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTracksCount((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-base shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition flex items-center justify-center border border-slate-200 dark:border-slate-600"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={tracksCount}
                        onChange={(e) => setTracksCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 text-center font-black text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setTracksCount((prev) => Math.min(50, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-base shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition flex items-center justify-center border border-slate-200 dark:border-slate-600"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[1, 2, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTracksCount(num)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            tracksCount === num
                              ? 'bg-indigo-600 text-white shadow-sm font-black'
                              : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600/50'
                          }`}
                        >
                          {num} {num === 1 ? 'trilha' : 'trilhas'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recording Options & Instruments Checkbox Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Instrumentos & Recursos por Trilha (Valores Individuais):
                    </label>
                    <span className="text-[10px] text-emerald-500 font-semibold">Clique para incluir</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {RECORDING_OPTIONS.map((opt) => {
                      const isSelected = selectedOptions.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleOption(opt.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between border ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span className="truncate">{opt.label}</span>
                          </span>
                          <span className={`text-[10px] ml-1 shrink-0 px-1.5 py-0.5 rounded font-black ${
                            opt.price === 0
                              ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'
                              : isSelected
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {opt.price === 0 ? 'Incluso' : formatBRL(opt.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Price Breakdown Box */}
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Serviço Base ({selectedService?.name || 'Serviço'}):</span>
                    <span className="font-semibold text-white">{formatBRL(selectedService?.basePrice || 0)}</span>
                  </div>
                  {selectedOptions.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span>Adicionais por Trilha ({selectedOptions.length} item{selectedOptions.length > 1 ? 's' : ''}):</span>
                        <span className="text-emerald-400">+ {formatBRL(selectedOptions.reduce((acc, optId) => acc + (RECORDING_OPTIONS.find((o) => o.id === optId)?.price || 0), 0))}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedOptions.map((optId) => {
                          const opt = RECORDING_OPTIONS.find((o) => o.id === optId);
                          if (!opt) return null;
                          return (
                            <span key={opt.id} className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                              <span>{opt.label}</span>
                              <span className="font-mono text-emerald-400 font-bold">
                                {opt.price === 0 ? '(Incluso)' : `+${formatBRL(opt.price)}`}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-indigo-300">
                      <span className="font-semibold">Valor Unitário por Trilha:</span>
                      <span className="font-bold text-white">
                        {formatBRL((selectedService?.basePrice || 0) + selectedOptions.reduce((acc, optId) => acc + (RECORDING_OPTIONS.find((o) => o.id === optId)?.price || 0), 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-indigo-300">
                      <span className="font-semibold">Quantidade de Trilhas / Músicas:</span>
                      <span className="font-black text-indigo-400">× {tracksCount} {tracksCount === 1 ? 'trilha' : 'trilhas'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Total Estimado do Projeto:</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatBRL(((selectedService?.basePrice || 0) + selectedOptions.reduce((acc, optId) => acc + (RECORDING_OPTIONS.find((o) => o.id === optId)?.price || 0), 0)) * tracksCount)}
                    </span>
                  </div>
                </div>

                {/* Custom Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detalhes do Projeto / Instrumentos:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Gravaremos 2 faixas com metrônomo a 120BPM, levaremos pedaleira própria..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmittingBooking ? (
                    <span>Enviando para o Estúdio...</span>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Solicitar Agendamento e Orçamento PIX
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  A equipe do estúdio enviará o código PIX para confirmação diretamente pelo Chat em tempo real.
                </p>

              </form>

            </div>

          </div>
        )}

        {/* ================= TAB 2: MEUS AGENDAMENTOS E ORÇAMENTOS ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Meus Agendamentos & Status de PIX
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe seus horários de gravação e efetue pagamentos pendentes
                </p>
              </div>

              <button
                onClick={() => setActiveTab('new_booking')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                + Novo Agendamento
              </button>
            </div>

            {clientBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <Music2 className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Nenhum agendamento encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Você ainda não possui horários reservados neste perfil de artista/banda.
                </p>
                <button
                  onClick={() => setActiveTab('new_booking')}
                  className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Reservar Primeiro Horário
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientBookings.map((b) => {
                  const quote = quotes.find((q) => q.bookingId === b.id);
                  const isPaid = b.status === 'pago_confirmado';
                  const isQuoted = b.status === 'orcamento_enviado';
                  const isReceiptSent = b.status === 'comprovante_enviado';

                  return (
                    <div
                      key={b.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Código: {b.id}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                                : isReceiptSent
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400'
                                : isQuoted
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pago & Confirmado
                              </>
                            ) : isReceiptSent ? (
                              <>
                                <Upload className="w-3.5 h-3.5" /> Comprovante em Análise
                              </>
                            ) : isQuoted ? (
                              <>
                                <QrCode className="w-3.5 h-3.5" /> Aguardando PIX
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" /> Em Análise no Estúdio
                              </>
                            )}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                            {b.serviceName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            FPStudio Salvador • {b.durationHours}h de sessão
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Data & Horário:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatDateBR(b.preferredDate)} às {b.startTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Valor Final:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatBRL(b.finalAmount)}
                            </span>
                          </div>
                        </div>

                        {b.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            "{b.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        {quote && !isPaid && (
                          <button
                            onClick={() => handleOpenPixModal(b)}
                            className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                          >
                            <QrCode className="w-4 h-4" /> Pagar via PIX
                          </button>
                        )}

                        {isPaid && (
                          <>
                            <button
                              onClick={() => exportReceiptPDF(b, studioInfo)}
                              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                            >
                              <FileText className="w-4 h-4 text-emerald-400" /> Baixar Comprovante PDF
                            </button>
                            <button
                              onClick={() => setActiveTab('reviews')}
                              className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                              title="Avaliar este serviço com estrelas e comentário"
                            >
                              <span>⭐</span>
                              <span>Avaliar Serviço</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setActiveBookingIdForChat(b.id);
                            setActiveTab('chat');
                          }}
                          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-4 h-4 text-indigo-400" /> Abrir Chat
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: CHAT EM TEMPO REAL COM O ESTÚDIO ================= */}
        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            
            {/* Left Chat Sidebar: List of Active Sessions */}
            <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Minhas Conversas com o Estúdio
              </h3>

              <div className="space-y-2">
                {clientBookings.map((b) => {
                  const isActive = b.id === selectedChatBooking?.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setActiveBookingIdForChat(b.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isActive
                          ? 'bg-slate-900 text-white border-emerald-500 shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs">{b.serviceName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDateBR(b.preferredDate)} • FPStudio
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Chat Window */}
            <div className="md:col-span-8 flex flex-col justify-between h-[580px] bg-slate-900 text-white">
              
              {/* Chat Header */}
              {selectedChatBooking ? (
                <>
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{studioInfo?.name || 'FPStudio'}</h4>
                        <p className="text-[11px] text-slate-400">
                          Sessão: {selectedChatBooking.serviceName} ({selectedChatBooking.id})
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[#00FF41] border border-[#00FF41]/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="Anexar Comprovante de Pagamento"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Enviar Comprovante</span>
                      </button>

                      {quotes.some((q) => q.bookingId === selectedChatBooking.id) && (
                        <button
                          onClick={() => handleOpenPixModal(selectedChatBooking)}
                          className="px-3 py-1.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Pagar com PIX
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/90">
                    {currentChatMsgs.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Nenhuma mensagem trocada para este agendamento.
                      </div>
                    ) : (
                      currentChatMsgs.map((msg) => {
                        const isClientSender = msg.senderRole === 'client';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isClientSender ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] text-slate-400 mb-1 px-1">
                              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <div
                              className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-md space-y-2 ${
                                isClientSender
                                  ? 'bg-emerald-600 text-white rounded-br-none'
                                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                              {/* Quote Payload Card inside chat */}
                              {msg.quotePayload && (
                                <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3 space-y-2.5 text-white">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                      Orçamento Oficial PIX
                                    </span>
                                    <span className="text-sm font-black text-emerald-400">
                                      {formatBRL(msg.quotePayload.totalAmount)}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-300">
                                    {msg.quotePayload.notes}
                                  </p>

                                  <button
                                    onClick={() => handleOpenPixModal(selectedChatBooking)}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                                  >
                                    <QrCode className="w-3.5 h-3.5" /> Abrir Código & QR Code PIX
                                  </button>
                                </div>
                              )}

                              {/* Attachment Preview (Comprovante) */}
                              {msg.attachment && (
                                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-700 flex items-center gap-2">
                                  {msg.attachment.dataUrl ? (
                                    <img
                                      src={msg.attachment.dataUrl}
                                      alt="Comprovante"
                                      className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                                    />
                                  ) : (
                                    <FileText className="w-8 h-8 text-emerald-400" />
                                  )}
                                  <div className="truncate">
                                    <p className="font-bold text-[11px] text-slate-200 truncate">{msg.attachment.name}</p>
                                    <span className="text-[9px] text-emerald-400">Comprovante de pagamento</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pending Attachment Preview Banner */}
                  {pendingAttachment && (
                    <div className="mx-3 my-2 p-2.5 bg-zinc-950/90 rounded-xl border border-[#00FF41]/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pendingAttachment.fileType === 'image' ? (
                          <img
                            src={pendingAttachment.dataUrl}
                            alt="Preview Comprovante"
                            className="w-12 h-12 object-cover rounded-lg border border-zinc-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#00FF41]">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[220px]">
                            {pendingAttachment.name}
                          </p>
                          <span className="text-[10px] text-[#00FF41] font-bold">
                            Anexo: Comprovante de Pagamento PIX
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPendingAttachment(null)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                        title="Remover Anexo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChatFileSelect}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendTextChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                        pendingAttachment
                          ? 'bg-[#00FF41] text-black border-[#00FF41]'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:border-[#00FF41]/60'
                      }`}
                      title="Anexar Comprovante PIX (Imagem ou PDF)"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder="Escreva sua mensagem ou envie o comprovante PIX..."
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,255,65,0.3)] cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Enviar
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  Selecione uma sessão ao lado para abrir o chat.
                </div>
              )}

            </div>

          </div>
        )}

        {/* ================= TAB 4: MEU CADASTRO DE INFORMAÇÕES & CPF ================= */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6 py-4">
            {/* Header Banner */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-[11px] font-black uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5" /> Ficha Cadastral do Cliente
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Cadastro de Dados Pessoais & CPF
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Cadastre e atualize suas informações como CPF, RG, Endereço e Contatos para emissão de contratos de gravação, recibos oficiais e notas do FPStudio.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('new_booking');
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Início</span>
                  </button>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Status Cadastral</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {profileCpf ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> CPF OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-bold">
                          <AlertCircle className="w-3 h-3" /> CPF Pendente
                        </span>
                      )}

                      {profilePixKey ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-full text-[11px] font-bold">
                          <QrCode className="w-3 h-3" /> PIX OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full text-[11px] font-bold">
                          <QrCode className="w-3 h-3" /> PIX Não Definido
                        </span>
                      )}

                      {profilePassword ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-[11px] font-bold">
                          <Lock className="w-3 h-3" /> PIN 4D Ativo
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Toast with Automatic Exit to Start */}
            {profileSavedSuccess && (
              <div className="p-4 bg-emerald-950/90 border-2 border-[#00FF41] rounded-2xl text-[#00FF41] flex items-center justify-between shadow-[0_0_30px_rgba(0,255,65,0.3)] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF41]/20 border border-[#00FF41]/50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#00FF41] animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white flex items-center gap-2">
                      <span>Dados Cadastrais Salvos com Sucesso!</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00FF41] text-black text-[10px] font-black uppercase">SALVO</span>
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium mt-0.5">
                      Suas informações foram atualizadas. Retornando para a tela inicial em instantes...
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-[#00FF41]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saindo da tela...</span>
                </div>
              </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSaveProfile} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Section 1: Dados do Artista / Responsável */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <User className="w-5 h-5 text-[#00FF41]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    1. Identificação do Artista / Músico
                  </h3>
                </div>

                {/* Avatar / Photo Upload from Computer */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group">
                    <img
                      src={
                        profileAvatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={profileName || 'Foto do Artista'}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-zinc-700 group-hover:border-[#00FF41] shadow-xl transition"
                    />
                    {isAvatarProcessing && (
                      <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-[#00FF41] animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
                        <Camera className="w-4 h-4 text-[#00FF41]" />
                        <span>Foto de Perfil / Logo do Artista</span>
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Adicione sua foto para aparecer nos depoimentos, sessões de gravação e chat com Fernando Padre.
                      </p>
                    </div>

                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processAvatarFile(file);
                      }}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#00FF41] hover:text-black text-[#00FF41] border border-[#00FF41]/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Carregar do Computador</span>
                      </button>

                      {profileAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileAvatarUrl('')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome Completo / Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome da Banda / Projeto Artístico
                    </label>
                    <input
                      type="text"
                      value={profileBand}
                      onChange={(e) => setProfileBand(e.target.value)}
                      placeholder="Ex: Banda Os Alquimistas"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                      <span>CPF (Cadastro de Pessoa Física) *</span>
                      <span className="text-[10px] text-[#00FF41] font-normal">Para recibos e contratos</span>
                    </label>
                    <input
                      type="text"
                      value={profileCpf}
                      onChange={(e) => setProfileCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      RG / Documento de Identidade
                    </label>
                    <input
                      type="text"
                      value={profileRg}
                      onChange={(e) => setProfileRg(e.target.value)}
                      placeholder="Ex: 12.345.678-9 SSP/BA"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contatos & Redes */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <Phone className="w-5 h-5 text-[#00FF41]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    2. Canais de Contato & Redes Sociais
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="artista@email.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="(71) 99999-8888"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Instagram / Rede Social
                    </label>
                    <input
                      type="text"
                      value={profileInstagram}
                      onChange={(e) => setProfileInstagram(e.target.value)}
                      placeholder="@banda_oficial"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Endereço do Cliente */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <MapPin className="w-5 h-5 text-[#00FF41]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    3. Endereço de Faturamento / Residência
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={profileCep}
                      onChange={(e) => setProfileCep(e.target.value)}
                      placeholder="41110-050"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Endereço Completo (Rua, Número, Bairro)
                    </label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Ex: Travessa Dois Leões, nº 19, Pernambués"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Cidade / Estado
                    </label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Salvador - BA"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Chave PIX para Envio / Recebimento de Pagamento */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <QrCode className="w-5 h-5 text-[#00FF41]" />
                  <div className="flex items-center justify-between flex-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      4. Chave PIX do Cliente (Envio de Pagamentos & Repasses)
                    </h3>
                    <span className="text-[10px] text-[#00FF41] font-bold">Uso para cachês e devoluções</span>
                  </div>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-2">
                      Tipo da Chave PIX
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'cpf', label: 'CPF' },
                        { id: 'email', label: 'E-mail' },
                        { id: 'telefone', label: 'Celular/WhatsApp' },
                        { id: 'aleatoria', label: 'Chave Aleatória (EVP)' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setProfilePixKeyType(t.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition border text-center ${
                            profilePixKeyType === t.id
                              ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      value={profilePixKey}
                      onChange={(e) => setProfilePixKey(e.target.value)}
                      placeholder={
                        profilePixKeyType === 'cpf'
                          ? '000.000.000-00'
                          : profilePixKeyType === 'email'
                          ? 'artista@email.com'
                          : profilePixKeyType === 'telefone'
                          ? '(71) 99999-8888'
                          : 'Ex: 123e4567-e89b-12d3-a456-426614174000'
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FF41]"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
                      Esta chave será utilizada pelo estúdio para repasses de cachês, pagamentos de serviços e eventuais estornos/devoluções.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: Segurança & PIN de Acesso */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <Lock className="w-5 h-5 text-[#00FF41]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    5. Segurança da Conta & PIN de Acesso (4 Dígitos)
                  </h3>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                      <span>PIN Numérico de Acesso</span>
                      <span className="text-[10px] text-[#00FF41] font-mono font-bold">4 DÍGITOS</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showProfilePassword ? 'text' : 'password'}
                        value={profilePassword}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setProfilePassword(val);
                        }}
                        maxLength={4}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Ex: 1234"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-xs font-mono tracking-widest text-white focus:outline-none focus:border-[#00FF41]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfilePassword(!showProfilePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                        title={showProfilePassword ? 'Ocultar PIN' : 'Ver PIN'}
                      >
                        {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      O PIN de 4 números será solicitado sempre que você acessar a sua área de cliente no estúdio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6: Observações / Requisitos Técnicos */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-zinc-300">
                  6. Observações Técnicas / Preferências de Produção
                </label>
                <textarea
                  rows={3}
                  value={profileNotes}
                  onChange={(e) => setProfileNotes(e.target.value)}
                  placeholder="Ex: Preferência por afinação de vocal suave, uso de microfone Kadosh 412, gravação de violão em nylon..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Submit / Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('new_booking');
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Início</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto px-6 py-3 bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-80 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SALVANDO E RETORNANDO...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>SALVAR DADOS CADASTRAIS (CPF & PIX)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tab: Services / Material & Equipamentos do Estúdio */}
        {(activeTab === 'equipment' || activeTab === 'services' || activeTab === 'services_equipment') && (
          <EquipmentView
            currentRole="client"
            defaultSection={activeTab === 'services' ? 'services' : activeTab === 'equipment' ? 'equipment' : 'all'}
            services={services}
            onNavigateToBooking={(serviceId) => {
              if (serviceId) {
                const srv = services.find((s) => s.id === serviceId);
                if (srv) {
                  setSelectedService(srv);
                }
              }
              setActiveTab('new_booking');
              setTimeout(() => {
                document.getElementById('servicos-desejados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          />
        )}

      </div>

      {/* PIX Payment Modal */}
      {activePixModalQuote && activePixModalBooking && (
        <PIXModal
          quote={activePixModalQuote}
          booking={activePixModalBooking}
          onClose={() => {
            setActivePixModalQuote(null);
            setActivePixModalBooking(null);
          }}
          onSendReceipt={handleSendReceiptFromModal}
        />
      )}

      {/* Sticky Floating Chat Button matching user screenshot */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setActiveTab('chat')}
          className="px-5 py-3 rounded-full bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs shadow-[0_0_25px_rgba(0,255,65,0.5)] hover:scale-105 transition flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-black animate-ping" />
          <span>🟢 CHAT COM O ESTÚDIO</span>
        </button>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

    </div>
  );
};
