import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  MessageSquare,
  QrCode,
  CheckCircle2,
  FileText,
  Download,
  Users,
  Sparkles,
  Send,
  Upload,
  PieChart,
  BarChart3,
  Search,
  Clock,
  ShieldCheck,
  Disc,
  Sliders,
  ChevronRight,
  Filter,
  UserCheck,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  ExternalLink,
  X,
  AlertCircle,
  Eye,
  Trash2,
  Music,
  Lock,
  RotateCcw,
  UserPlus,
  Plus,
  KeyRound,
  Shield,
  Smartphone,
} from 'lucide-react';
import {
  BookingRequest,
  ChatMessage,
  PixQuote,
  FinancialSummary,
  UserProfile,
  TransactionRecord,
  ClientPerformanceReport,
  StudioRoom,
  StudioService,
  AdminCredentials,
} from '../types';
import { EquipmentView } from './EquipmentView';
import { AdminSecurityPanel } from './AdminSecurityPanel';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';
import {
  formatBRL,
  formatDateBR,
  exportFinancialsPDF,
  exportFinancialsExcel,
  exportClientReportPDF,
  exportClientReportExcel,
  exportReceiptPDF,
} from '../utils/exportUtils';

interface StudioViewProps {
  activeStaffUser?: UserProfile | null;
  onSwitchToClientView?: () => void;
  bookings: BookingRequest[];
  quotes: PixQuote[];
  chatMessages: ChatMessage[];
  financials: FinancialSummary;
  clients: UserProfile[];
  transactions: TransactionRecord[];
  rooms: StudioRoom[];
  services?: StudioService[];
  studioInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreateQuote: (data: any) => void;
  onSendChatMessage: (data: any) => void;
  onConfirmPayment: (bookingId: string) => void;
  onDeleteClient?: (clientId: string) => void;
  onCreateClient?: (clientData: any) => Promise<any> | void;
  onClearAllClients?: () => Promise<any> | void;
  onUpdateService?: (service: StudioService) => void;
  onCreateService?: (service: Partial<StudioService>) => void;
  onDeleteService?: (serviceId: string) => void;
  onCancelTodayBookings?: (
    action?: 'cancel' | 'delete',
    period?: 'yesterday' | 'today' | 'recent' | 'all',
    targetDate?: string
  ) => Promise<any> | void;
  onDeleteBooking?: (bookingId: string) => void;
  adminCredentials?: AdminCredentials;
  onOpenAdminSecurityModal?: () => void;
  onUpdateAdminCredentials?: (
    data: Partial<AdminCredentials> & {
      currentPassword?: string;
      currentPin?: string;
      newPassword?: string;
      newPin?: string;
      newEmail?: string;
    }
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const StudioView: React.FC<StudioViewProps> = ({
  activeStaffUser,
  onSwitchToClientView,
  bookings = [],
  quotes = [],
  chatMessages = [],
  financials = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingRevenue: 0,
    confirmedCount: 0,
    pendingCount: 0,
    occupancyRatePercentage: 0,
    averageTicket: 0,
    monthlyData: [],
    serviceDistribution: [],
    topClients: [],
  },
  clients = [],
  transactions = [],
  rooms = [],
  services = [],
  studioInfo = {} as any,
  activeTab = 'agenda',
  setActiveTab,
  onCreateQuote,
  onSendChatMessage,
  onConfirmPayment,
  onDeleteClient,
  onCreateClient,
  onClearAllClients,
  onUpdateService,
  onCreateService,
  onDeleteService,
  onCancelTodayBookings,
  onDeleteBooking,
  adminCredentials,
  onOpenAdminSecurityModal,
  onUpdateAdminCredentials,
}) => {
  // Chat & Quote State
  const [selectedBookingId, setSelectedBookingId] = useState<string>((bookings || [])[0]?.id || '');
  const [chatInputText, setChatInputText] = useState<string>('');

  // Undo / Cancel Bookings State
  const [isUndoingToday, setIsUndoingToday] = useState<boolean>(false);
  const [undoPeriod, setUndoPeriod] = useState<'yesterday' | 'today' | 'recent' | 'all'>('yesterday');
  const [undoSuccessMsg, setUndoSuccessMsg] = useState<string | null>(null);
  const [showConfirmUndoModal, setShowConfirmUndoModal] = useState<boolean>(false);

  // User Management State (Cadastrar Novo Usuário / Limpar Base)
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [showConfirmClearUsersModal, setShowConfirmClearUsersModal] = useState<boolean>(false);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);
  const [isClearingUsers, setIsClearingUsers] = useState<boolean>(false);
  const [userCreateSuccessMsg, setUserCreateSuccessMsg] = useState<string | null>(null);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    bandOrArtistName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '1234',
    pixKey: '',
    pixKeyType: 'cpf' as 'cpf' | 'email' | 'telefone' | 'aleatoria',
    city: 'Salvador - BA',
    address: '',
    notes: '',
  });

  // Quote Creation Modal State
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [quoteAmount, setQuoteAmount] = useState<number>(500);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('Orçamento aprovado pelo estúdio. Inclui engenheiro de som e equipamentos.');

  // Client Report & Detail Modal State
  const [selectedClientId, setSelectedClientId] = useState<string>((clients || [])[0]?.id || '');
  const [clientReport, setClientReport] = useState<ClientPerformanceReport | null>(null);
  const [detailModalClient, setDetailModalClient] = useState<UserProfile | null>(null);
  const [clientToDelete, setClientToDelete] = useState<UserProfile | null>(null);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Filter Bookings by Status for Studio Inbox
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('todos');

  // Agenda / Agendamentos & Baixas State
  const [agendaStatusFilter, setAgendaStatusFilter] = useState<string>('todos');
  const [agendaSearchQuery, setAgendaSearchQuery] = useState<string>('');
  const [agendaDateFilter, setAgendaDateFilter] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string, statusLabel: string) => {
    try {
      const res = await fetch('/api/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus === 'concluido' || newStatus === 'pago_confirmado') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
        setActionSuccessMsg(`Status do agendamento atualizado para "${statusLabel}" com sucesso!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const filteredAgendaBookings = bookings.filter((b) => {
    let matchesStatus = true;
    if (agendaStatusFilter === 'pendente') {
      matchesStatus = b.status === 'pendente_orcamento' || b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado';
    } else if (agendaStatusFilter === 'pago_confirmado') {
      matchesStatus = b.status === 'pago_confirmado' || b.status === 'agendado';
    } else if (agendaStatusFilter === 'concluido') {
      matchesStatus = b.status === 'concluido';
    } else if (agendaStatusFilter === 'cancelado') {
      matchesStatus = b.status === 'cancelado';
    }

    const matchesQuery =
      !agendaSearchQuery ||
      b.clientName.toLowerCase().includes(agendaSearchQuery.toLowerCase()) ||
      (b.bandOrArtistName && b.bandOrArtistName.toLowerCase().includes(agendaSearchQuery.toLowerCase())) ||
      b.serviceName.toLowerCase().includes(agendaSearchQuery.toLowerCase()) ||
      b.clientPhone.includes(agendaSearchQuery);

    const matchesDate = !agendaDateFilter || b.preferredDate === agendaDateFilter;

    return matchesStatus && matchesQuery && matchesDate;
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];
  const currentChatMsgs = chatMessages.filter((m) => m.bookingId === selectedBooking?.id);

  // Load Client Performance Report on client change
  useEffect(() => {
    if (!selectedClientId) return;
    fetch(`/api/reports/client/${selectedClientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setClientReport(data);
      })
      .catch((err) => console.error('Error fetching client report:', err));
  }, [selectedClientId, bookings, transactions]);

  // Synchronize initial selections when props arrive
  useEffect(() => {
    if (!selectedBookingId && bookings && bookings.length > 0) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings, selectedBookingId]);

  useEffect(() => {
    if (!selectedClientId && clients && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const handleSendStudioMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedBooking) return;

    onSendChatMessage({
      bookingId: selectedBooking.id,
      senderId: 'studio-master',
      senderRole: 'studio',
      senderName: studioInfo?.name || 'FPStudio',
      message: chatInputText,
      type: 'text',
    });

    setChatInputText('');
  };

  const handleCreateQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    onCreateQuote({
      bookingId: selectedBooking.id,
      totalAmount: quoteAmount,
      discountAmount: quoteDiscount,
      notes: quoteNotes,
      pixKey: studioInfo?.pixKey || '',
      pixKeyType: studioInfo?.pixKeyType || 'chave',
    });

    setShowQuoteModal(false);
  };

  const handleConfirmPixAction = (bookingId: string) => {
    // Trigger confetti victory animation
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    onConfirmPayment(bookingId);
  };

  const handleAskAiAssistant = async (contextType: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || 'Gere um texto de orçamento atraente para gravação de banda.',
          contextType,
        }),
      });
      const data = await res.json();
      setAiResponse(data.response || 'Sem resposta do assistente.');
    } catch {
      setAiResponse('Erro ao conectar com a IA do Studio.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredBookingsList = bookings.filter((b) => {
    if (bookingFilterStatus === 'todos') return true;
    return b.status === bookingFilterStatus;
  });

  // Top KPI / Somatória geral calculations
  const confirmedBookingsList = bookings.filter((b) => b.status === 'pago_confirmado');
  const totalConfirmedRevenue = confirmedBookingsList.reduce((acc, b) => acc + (b.totalAmount || 0), 0) || financials.totalRevenue || 0;

  const pendingBookingsList = bookings.filter((b) => b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado' || b.status === 'pendente_orcamento');
  const totalPendingRevenue = pendingBookingsList.reduce((acc, b) => acc + (b.totalAmount || 0), 0) || financials.pendingRevenue || 0;

  const totalBookingsSum = bookings
    .filter((b) => b.status !== 'cancelado')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  const pendingReceiptsCount = bookings.filter((b) => b.status === 'comprovante_enviado').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Executive ADM Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border-b border-sky-900/60 shadow-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  PAINEL EXECUTIVO • FPSTUDIO ADM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  Área Restrita
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {activeStaffUser?.name ? `Operador: ${activeStaffUser.name}` : 'Fernando Padre'} • Gestão de Agenda, Clientes, PIX e Relatórios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (onOpenAdminSecurityModal) onOpenAdminSecurityModal();
                else setActiveTab('admin_security');
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95"
              title="Alterar Dados do Administrador, Senha e PIN de Acesso"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
              <span>⚙️ Alterar Dados do ADM (Senha, PIN & Perfil)</span>
            </button>

            {onSwitchToClientView && (
              <button
                onClick={onSwitchToClientView}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Mudar visualização para a tela que os clientes veem"
              >
                <Eye className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>Ver como Cliente</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Header */}
      <div className="bg-[#0F172A] border-b border-slate-800 relative z-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
          <div className="flex gap-2 py-3">
            <button
              id="admin-tab-agenda"
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Agendamentos</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                activeTab === 'agenda' ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {bookings.length}
              </span>
            </button>

            <button
              id="admin-tab-client-reports"
              onClick={() => setActiveTab('client_reports')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'client_reports'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Clientes</span>
            </button>

            <button
              id="admin-tab-services-equipment"
              onClick={() => setActiveTab('services_equipment')}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'services_equipment' || activeTab === 'services' || activeTab === 'equipment'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Music className="w-4 h-4 shrink-0" />
              <span className="flex flex-col text-left leading-[1.1]">
                <span>Serviços</span>
                <span className={`text-[10px] font-bold ${
                  activeTab === 'services_equipment' || activeTab === 'services' || activeTab === 'equipment' ? 'opacity-85 text-slate-950' : 'text-slate-400'
                }`}>& Material</span>
              </span>
            </button>

            <button
              id="admin-tab-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span className="text-amber-400 font-bold">⭐</span>
              <span>Depoimentos & Notas</span>
            </button>

            <button
              id="admin-tab-financials"
              onClick={() => setActiveTab('financials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Finanças</span>
            </button>

            <button
              id="admin-tab-ai-assistant"
              onClick={() => setActiveTab('ai_assistant')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'ai_assistant'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>Assistente</span>
            </button>

            <button
              id="admin-tab-chat-pix"
              onClick={() => setActiveTab('chat_budget')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'chat_budget' || activeTab === 'chat'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Chat</span>
              {bookings.filter((b) => b.status === 'comprovante_enviado').length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>

            <button
              id="admin-tab-security"
              onClick={() => setActiveTab('admin_security')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'admin_security' || activeTab === 'security'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
              <span>Alterar Dados ADM</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                activeTab === 'admin_security' || activeTab === 'security'
                  ? 'bg-black/20 text-slate-950'
                  : 'bg-sky-950 text-sky-300 border border-sky-800'
              }`}>
                SENHA & PIN
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
            <DollarSign className="w-4 h-4" /> Faturamento Mês: {formatBRL(financials.monthlyRevenue)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ================= TOP KPI SUMMARY HEADER / SOMATÓRIA DA TELA DE ESTÚDIO ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          
          {/* Card 1: Somatória Total das Solicitações com Logo FPStudio */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4.5 rounded-2xl border border-indigo-900/50 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={fpStudioLogo}
                  alt="FPStudio Logo"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-400/50 shadow-md shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                    Somatória Geral
                  </span>
                  <span className="text-xs font-black text-white">FPStudio</span>
                </div>
              </div>
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                {formatBRL(totalBookingsSum)}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Total acumulado de {bookings.length} {bookings.length === 1 ? 'solicitação' : 'solicitações'}
              </p>
            </div>
          </div>

          {/* Card 2: Receita Confirmada / Paga */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl border border-emerald-900/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Faturamento Confirmado
              </span>
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight">
                {formatBRL(totalConfirmedRevenue)}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {confirmedBookingsList.length} {confirmedBookingsList.length === 1 ? 'sessão paga' : 'sessões pagas'}
              </p>
            </div>
          </div>

          {/* Card 3: Valor em Aberto / Pendente */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white p-4 rounded-2xl border border-amber-900/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Total Pendente em Aberto
              </span>
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black text-amber-300 tracking-tight">
                {formatBRL(totalPendingRevenue)}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {pendingBookingsList.length} {pendingBookingsList.length === 1 ? 'orçamento em análise' : 'orçamentos em análise'}
              </p>
            </div>
          </div>

          {/* Card 4: Comprovantes e Atividade do Estúdio */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white p-4 rounded-2xl border border-sky-900/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                Validação de PIX / Status
              </span>
              <div className="p-2 bg-sky-500/20 text-sky-300 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {pendingReceiptsCount}
                </p>
                {pendingReceiptsCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md animate-pulse">
                    Aprovação Pendente
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {pendingReceiptsCount === 0 ? 'Todos os PIX validados' : 'Comprovantes para validar no chat'}
              </p>
            </div>
          </div>

        </div>
        
        {/* ================= TAB 1: CENTRAL DE CHAT & ORÇAMENTOS PIX ================= */}
        {activeTab === 'chat_budget' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
              
              {/* Left Column: Bookings Inbox */}
              <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 space-y-4">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500" /> Solicitações & Clientes
                  </h3>

                  {/* Filter Dropdown */}
                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-[11px] font-semibold focus:outline-none"
                  >
                    <option value="todos">Todos ({bookings.length})</option>
                    <option value="comprovante_enviado">Comprovante Enviado</option>
                    <option value="pendente_orcamento">Pendentes de Orçamento</option>
                    <option value="orcamento_enviado">Aguardando PIX</option>
                    <option value="pago_confirmado">Pagamento Confirmado</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredBookingsList.map((b) => {
                    const isActive = b.id === selectedBooking?.id;
                    const isReceiptSent = b.status === 'comprovante_enviado';
                    const isPaid = b.status === 'pago_confirmado';

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                          isActive
                            ? 'bg-slate-900 text-white border-indigo-500 shadow-xl'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs truncate max-w-[180px]">
                            {b.bandOrArtistName || b.clientName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isReceiptSent
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {isPaid ? 'CONFIRMADO' : isReceiptSent ? 'COMPROVANTE!' : 'PENDENTE'}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-400">
                          {b.serviceName}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>{formatDateBR(b.preferredDate)} às {b.startTime}</span>
                          <span className="font-bold text-emerald-400">{formatBRL(b.finalAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Right Column: Chat Window & Fast Quote / Confirm Actions */}
              <div className="md:col-span-7 flex flex-col justify-between bg-slate-900 text-white h-[600px]">
                
                {selectedBooking ? (
                  <>
                    {/* Header Controls */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-sm text-white flex items-center gap-2">
                          {selectedBooking.bandOrArtistName || selectedBooking.clientName}
                          <span className="text-[10px] font-normal text-slate-400">({selectedBooking.clientPhone})</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedBooking.serviceName} • {selectedBooking.durationHours}h de sessão
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Send Quote Button */}
                        <button
                          onClick={() => {
                            setQuoteAmount(selectedBooking.totalAmount);
                            setShowQuoteModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Enviar Orçamento PIX
                        </button>

                        {/* One-Click Confirm Payment */}
                        {selectedBooking.status !== 'pago_confirmado' && (
                          <button
                            onClick={() => handleConfirmPixAction(selectedBooking.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1 animate-pulse"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar PIX!
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/90">
                      {currentChatMsgs.map((msg) => {
                        const isStudioSender = msg.senderRole === 'studio';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isStudioSender ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] text-slate-400 mb-1 px-1">
                              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <div
                              className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md space-y-2 ${
                                isStudioSender
                                  ? 'bg-indigo-600 text-white rounded-br-none'
                                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                              {/* Receipt attached alert */}
                              {msg.attachment && (
                                <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/50 space-y-2">
                                  <p className="text-[10px] font-bold text-amber-400 uppercase">
                                    Comprovante Anexado pelo Cliente
                                  </p>
                                  {msg.attachment.dataUrl && (
                                    <img
                                      src={msg.attachment.dataUrl}
                                      alt="Comprovante"
                                      className="w-full max-h-48 object-contain rounded-lg border border-slate-700"
                                    />
                                  )}
                                  <button
                                    onClick={() => handleConfirmPixAction(selectedBooking.id)}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Aprovar Comprovante & Efetivar PIX
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input bar */}
                    <form onSubmit={handleSendStudioMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        placeholder="Responder ao cliente no chat..."
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        <Send className="w-4 h-4" /> Enviar
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    Selecione uma solicitação ao lado.
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: AGENDAMENTOS E DAR BAIXA ================= */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-500" /> Painel de Agendamentos & Baixa de Sessões
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerenciamento completo dos horários de estúdio, confirmação de PIX e baixa de sessões concluídas.
                </p>
              </div>

              {/* Status Action Banner Toast */}
              {actionSuccessMsg && (
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Top KPI Cards for Agenda */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              
              <div
                onClick={() => setAgendaStatusFilter('todos')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  agendaStatusFilter === 'todos'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Total de Agendamentos</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white mt-1">{bookings.length}</p>
                <p className="text-[10px] text-slate-400">Todas as solicitações</p>
              </div>

              <div
                onClick={() => setAgendaStatusFilter('pago_confirmado')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  agendaStatusFilter === 'pago_confirmado'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-400">Confirmados / Ativos</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {bookings.filter((b) => b.status === 'pago_confirmado' || b.status === 'agendado').length}
                </p>
                <p className="text-[10px] text-slate-400">Aguardando execução</p>
              </div>

              <div
                onClick={() => setAgendaStatusFilter('concluido')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  agendaStatusFilter === 'concluido'
                    ? 'bg-sky-600/20 border-sky-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-sky-400">Sessões Concluídas (Baixa)</span>
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-2xl font-black text-sky-400 mt-1">
                  {bookings.filter((b) => b.status === 'concluido').length}
                </p>
                <p className="text-[10px] text-slate-400">Baixa realizada</p>
              </div>

              <div
                onClick={() => setAgendaStatusFilter('pendente')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  agendaStatusFilter === 'pendente'
                    ? 'bg-amber-600/20 border-amber-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400">Pendentes de PIX</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {bookings.filter((b) => b.status === 'pendente_orcamento' || b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado').length}
                </p>
                <p className="text-[10px] text-slate-400">Em análise / orçamento</p>
              </div>

            </div>

            {/* Undo Today's Bookings Action Bar & Notification */}
            {undoSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{undoSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setUndoSuccessMsg(null)}
                  className="text-emerald-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-900/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    Gerenciamento & Retrocesso de Pedidos
                    {bookings.length > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 rounded-full text-[10px] font-black">
                        {bookings.length} no total
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Retroceda pedidos de ontem, de hoje ou restaure o estado anterior da base com segurança.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  id="btn-undo-yesterday-orders"
                  onClick={() => {
                    setUndoPeriod('yesterday');
                    setShowConfirmUndoModal(true);
                  }}
                  disabled={isUndoingToday}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer border border-amber-400/30 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isUndoingToday && undoPeriod === 'yesterday' ? 'animate-spin' : ''}`} />
                  <span>Retroceder Pedidos de Ontem</span>
                </button>

                <button
                  id="btn-undo-today-orders"
                  onClick={() => {
                    setUndoPeriod('today');
                    setShowConfirmUndoModal(true);
                  }}
                  disabled={isUndoingToday}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer border border-rose-400/30 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isUndoingToday && undoPeriod === 'today' ? 'animate-spin' : ''}`} />
                  <span>Desfazer Pedidos de Hoje</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pago_confirmado', label: 'Confirmados' },
                  { id: 'concluido', label: 'Concluídos (Baixa)' },
                  { id: 'pendente', label: 'Pendentes PIX' },
                  { id: 'cancelado', label: 'Cancelados' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAgendaStatusFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition whitespace-nowrap cursor-pointer shrink-0 ${
                      agendaStatusFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search + Date Picker */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Pesquisar cliente, banda..."
                    value={agendaSearchQuery}
                    onChange={(e) => setAgendaSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={agendaDateFilter}
                    onChange={(e) => setAgendaDateFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  {agendaDateFilter && (
                    <button
                      onClick={() => setAgendaDateFilter('')}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                      title="Limpar Data"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* List of Bookings */}
            <div className="space-y-4">
              {filteredAgendaBookings.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-lg">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum agendamento encontrado</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Não encontramos sessões correspondentes aos filtros selecionados.
                  </p>
                  <button
                    onClick={() => {
                      setAgendaStatusFilter('todos');
                      setAgendaSearchQuery('');
                      setAgendaDateFilter('');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Resetar Filtros
                  </button>
                </div>
              ) : (
                filteredAgendaBookings.map((b) => {
                  const isConcluido = b.status === 'concluido';
                  const isPago = b.status === 'pago_confirmado' || b.status === 'agendado';
                  const isComprovante = b.status === 'comprovante_enviado';
                  const isCancelado = b.status === 'cancelado';

                  return (
                    <div
                      key={b.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isConcluido
                          ? 'border-sky-500/40 bg-sky-950/10'
                          : isPago
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isCancelado
                          ? 'border-rose-500/30 opacity-75'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Left: Info & Date Badge */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Date Badge Box */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center min-w-[85px] shrink-0 space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-indigo-400 block">
                            {new Date(b.preferredDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-black text-white block leading-tight">
                            {formatDateBR(b.preferredDate).slice(0, 5)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 block">
                            {b.startTime} ({b.durationHours}h)
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black text-base text-slate-900 dark:text-white">
                              {b.bandOrArtistName || b.clientName}
                            </h3>
                            <span className="text-xs text-slate-400">({b.clientName})</span>

                            {/* Status Tag */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${
                                isConcluido
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                                  : isPago
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : isComprovante
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                  : isCancelado
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                              }`}
                            >
                              {isConcluido && <CheckCircle2 className="w-3 h-3" />}
                              {isConcluido
                                ? 'SESSÃO CONCLUÍDA (BAIXA DADA)'
                                : isPago
                                ? 'PAGAMENTO CONFIRMADO'
                                : isComprovante
                                ? 'COMPROVANTE ANEXADO!'
                                : isCancelado
                                ? 'CANCELADO'
                                : 'AGUARDANDO PIX'}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {b.serviceName}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {b.clientPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {b.clientEmail}
                            </span>
                            {b.roomName && (
                              <span className="px-2 py-0.5 bg-slate-800 text-zinc-300 rounded-md text-[10px] font-bold">
                                {b.roomName}
                              </span>
                            )}
                          </div>

                          {b.notes && (
                            <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-1">
                              "{b.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Action Buttons */}
                      <div className="flex flex-col items-start md:items-end justify-between gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Final</span>
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatBRL(b.finalAmount)}
                          </span>
                        </div>

                        {/* Action Buttons Group */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* "DAR BAIXA / CONCLUIR" BUTTON */}
                          {!isConcluido && !isCancelado && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'concluido', 'Sessão Concluída / Baixa Dada')}
                              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                              title="Marcar sessão como concluída e dar baixa no sistema"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Dar Baixa (Concluir)
                            </button>
                          )}

                          {/* "CONFIRMAR PIX" BUTTON */}
                          {!isPago && !isConcluido && !isCancelado && (
                            <button
                              onClick={() => onConfirmPayment(b.id)}
                              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer uppercase"
                              title="Confirmar recebimento do PIX"
                            >
                              <DollarSign className="w-4 h-4" /> Confirmar PIX
                            </button>
                          )}

                          {/* "VER CHAT / ORÇAMENTO" BUTTON */}
                          <button
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setActiveTab('chat_budget');
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Chat
                          </button>

                          {/* "CANCELAR" BUTTON */}
                          {!isCancelado && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelado', 'Cancelado')}
                              className="px-2.5 py-2 bg-rose-950/80 hover:bg-rose-800 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/80 transition cursor-pointer"
                              title="Cancelar este agendamento"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* "EXCLUIR" BUTTON */}
                          {onDeleteBooking && (
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o agendamento de ${b.bandOrArtistName || b.clientName}?`)) {
                                  onDeleteBooking(b.id);
                                }
                              }}
                              className="px-2.5 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                              title="Excluir agendamento permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>

                        {/* Status Manual Override Selector */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>Alterar Status:</span>
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleUpdateBookingStatus(
                                b.id,
                                e.target.value,
                                e.target.options[e.target.selectedIndex].text
                              )
                            }
                            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-semibold focus:outline-none"
                          >
                            <option value="pendente_orcamento">Pendente Orçamento</option>
                            <option value="orcamento_enviado">Orçamento Enviado (PIX)</option>
                            <option value="comprovante_enviado">Comprovante Anexado</option>
                            <option value="pago_confirmado">Pago & Confirmado</option>
                            <option value="concluido">Concluído (Baixa Dada)</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 3: FLUXO DE CAIXA MENSAL & FINANÇAS ================= */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            
            {/* Header with Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-500" /> Painel Financeiro & Fluxo de Caixa Mensal
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monitoramento em tempo real do faturamento e controle de recebimentos PIX
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => exportFinancialsPDF(financials, transactions)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Exportar PDF
                </button>

                <button
                  onClick={() => exportFinancialsExcel(transactions, financials)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Exportar Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Confirmado</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatBRL(financials.totalRevenue)}
                </h3>
                <p className="text-[10px] text-slate-500">{financials.confirmedCount} pagamentos PIX confirmados</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendente a Receber</span>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {formatBRL(financials.pendingRevenue)}
                </h3>
                <p className="text-[10px] text-slate-500">{financials.pendingCount} agendamentos aguardando PIX</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio por Sessão</span>
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatBRL(financials.averageTicket)}
                </h3>
                <p className="text-[10px] text-slate-500">Média por cliente cadastrado</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ocupação das Salas</span>
                <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {financials.occupancyRatePercentage}%
                </h3>
                <p className="text-[10px] text-slate-500">Capacidade de estúdio utilizada</p>
              </div>

            </div>

            {/* Visual Charts / Monthly Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Monthly Evolution */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" /> Evolução Mensal do Faturamento
                </h3>

                <div className="space-y-3 pt-2">
                  {financials.monthlyData.map((m) => {
                    const maxRev = Math.max(...financials.monthlyData.map((x) => x.revenue), 0);
                    const percent = maxRev > 0 && m.revenue > 0 ? Math.round((m.revenue / maxRev) * 100) : 0;

                    return (
                      <div key={m.monthCode} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{m.monthName}</span>
                          <span className={`font-bold ${m.revenue > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatBRL(m.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-transparent'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Service Distribution */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-500" /> Distribuição por Tipo de Serviço
                </h3>

                <div className="space-y-3 pt-2">
                  {financials.serviceDistribution.map((sd) => (
                    <div key={sd.serviceName} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[200px]">{sd.serviceName}</span>
                        <span className="font-bold">{formatBRL(sd.revenue)} ({sd.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${sd.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Transactions Ledger Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Histórico de Entradas PIX
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="py-3 px-2">Data/Hora</th>
                      <th className="py-3 px-2">Cliente / Artista</th>
                      <th className="py-3 px-2">Serviço Prestado</th>
                      <th className="py-3 px-2">Forma</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-medium text-slate-600 dark:text-slate-300">
                          {formatDateBR(tx.confirmedAt)}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                          {tx.clientName}
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                          {tx.serviceName}
                        </td>
                        <td className="py-3 px-2 font-bold text-emerald-600 dark:text-emerald-400">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-black text-slate-900 dark:text-white">
                          {formatBRL(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: CLIENTES SINCRONIZADOS & RELATÓRIOS ================= */}
        {activeTab === 'client_reports' && (
          <div className="space-y-6">
            
            {/* User Action Feedback Notification */}
            {userCreateSuccessMsg && (
              <div className="p-3.5 bg-emerald-950/90 border border-[#00FF41] rounded-2xl flex items-center justify-between text-[#00FF41] text-xs font-bold animate-in fade-in shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF41] shrink-0" />
                  <span>{userCreateSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setUserCreateSuccessMsg(null)}
                  className="p-1 hover:bg-[#00FF41]/20 rounded-lg text-[#00FF41] transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#00FF41]" /> Usuários, Clientes & Histórico de Pedidos
                </h2>
                <p className="text-xs text-zinc-400">
                  Gestão da base de usuários, artistas e clientes cadastrados no FPStudio.
                </p>
              </div>

              {/* Action Buttons: Cadastrar Novo Usuário & Limpar Base */}
              <div className="flex items-center flex-wrap gap-2.5">
                <button
                  id="btn-open-create-user-modal"
                  onClick={() => {
                    setCreateUserError(null);
                    setShowCreateUserModal(true);
                  }}
                  className="px-4 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.3)] transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Cadastrar Novo Usuário</span>
                </button>

                {clients.length > 0 && (
                  <button
                    id="btn-open-clear-users-modal"
                    onClick={() => setShowConfirmClearUsersModal(true)}
                    className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                    title="Apagar todos os clientes e manter apenas o administrador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Usuários (Deixar só ADM)</span>
                  </button>
                )}

                {/* Client Selector Dropdown */}
                {clients.length > 0 && (
                  <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">Filtrar:</span>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00FF41]"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bandOrArtistName || c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Synchronized Clients List Table or Empty State */}
            {clients.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#00FF41] flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-xs font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Apenas o Administrador Ativo
                  </div>
                  <h3 className="text-lg font-black text-white">Nenhum cliente ou usuário secundário cadastrado</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A base de dados foi limpa e apenas a conta principal do Administrador (Fernando Padre) está ativa no sistema.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCreateUserError(null);
                      setShowCreateUserModal(true);
                    }}
                    className="px-6 py-3 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(0,255,65,0.35)] transition flex items-center gap-2 mx-auto cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Novo Usuário / Artista</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00FF41]" />
                    <h3 className="font-extrabold text-sm text-white">
                      Lista de Clientes Cadastrados ({clients.length})
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-black uppercase">
                    Sincronizado via Servidor
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                        <th className="py-3 px-3">Artista / Banda</th>
                        <th className="py-3 px-3">Contato & CPF</th>
                        <th className="py-3 px-3">E-mail</th>
                        <th className="py-3 px-3">Telefone</th>
                        <th className="py-3 px-3 text-center">Sessões / Pedidos</th>
                        <th className="py-3 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {clients.map((c) => {
                        const isSelected = c.id === selectedClientId;
                        const clientBookingsCount = bookings.filter((b) => b.clientId === c.id || b.clientName === c.name).length;

                        return (
                          <tr
                            key={c.id}
                            onClick={() => {
                              setSelectedClientId(c.id);
                            }}
                            className={`hover:bg-zinc-900/80 transition cursor-pointer ${
                              isSelected ? 'bg-zinc-900/90 font-bold border-l-2 border-[#00FF41]' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={c.name}
                                  className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                                />
                                <div>
                                  <div className="font-black text-white">{c.bandOrArtistName || c.name}</div>
                                  <div className="text-[10px] text-zinc-400">{c.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {c.cpf ? (
                                <div className="flex items-center gap-1 font-mono text-[11px] text-[#00FF41]">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{c.cpf}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-500 italic">CPF não cadastrado</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">{c.email}</td>
                            <td className="py-3 px-3 text-zinc-300">{c.phone || '(71) 99999-0000'}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[#00FF41] font-bold text-[10px]">
                                {clientBookingsCount} {clientBookingsCount === 1 ? 'pedido' : 'pedidos'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setDetailModalClient(c)}
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-[#00FF41] hover:text-black text-[#00FF41] border border-[#00FF41]/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver Ficha & Pedidos</span>
                                </button>

                                <button
                                  onClick={() => setClientToDelete(c)}
                                  className="p-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-800/80 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                                  title="Excluir Cliente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {clientReport ? (
              <div className="space-y-6">
                
                {/* Client Profile Header Box */}
                <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl space-y-6 border border-zinc-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF41]/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00FF41] to-emerald-700 p-0.5 shadow-lg flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                          alt={clientReport.clientName}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white">{clientReport.bandOrArtistName}</h3>
                          {clients.find((c) => c.id === selectedClientId)?.cpf && (
                            <span className="px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-mono font-bold">
                              CPF OK
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">Responsável: {clientReport.clientName} • Tel: {clientReport.phone}</p>
                        <p className="text-xs text-zinc-400">E-mail: {clientReport.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const clientObj = clients.find((c) => c.id === selectedClientId);
                          if (clientObj) setDetailModalClient(clientObj);
                        }}
                        className="px-4 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" /> Mostrar Todos os Dados & Cadastro
                      </button>

                      <button
                        onClick={() => exportClientReportPDF(clientReport)}
                        className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#00FF41]" /> PDF
                      </button>

                      <button
                        onClick={() => exportClientReportExcel(clientReport)}
                        className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" /> Excel
                      </button>
                    </div>
                  </div>

                  {/* Ficha Cadastral Resumida */}
                  {(() => {
                    const clientObj = clients.find((c) => c.id === selectedClientId);
                    if (!clientObj) return null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#00FF41]" /> Documentos Oficiais
                          </span>
                          <p className="font-mono text-zinc-200">
                            <strong>CPF:</strong> {clientObj.cpf || 'Não cadastrado'}
                          </p>
                          <p className="text-zinc-300">
                            <strong>RG:</strong> {clientObj.rg || 'Não informado'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00FF41]" /> Endereço & Localização
                          </span>
                          <p className="text-zinc-200 truncate">
                            <strong>Endereço:</strong> {clientObj.address || 'Não cadastrado'}
                          </p>
                          <p className="text-zinc-300">
                            <strong>Cidade/CEP:</strong> {clientObj.city || 'Salvador/BA'} • CEP: {clientObj.cep || '41110-050'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#00FF41]" /> Contatos & Notas do Artista
                          </span>
                          <p className="text-zinc-200">
                            <strong>Insta:</strong> {clientObj.instagram || '@estudio_cliente'}
                          </p>
                          <p className="text-zinc-400 italic truncate">
                            <strong>Notas:</strong> {clientObj.notes || 'Sem observações técnicas.'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Investido no Estúdio</span>
                    <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatBRL(clientReport.totalSpent)}</h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Horas em Estúdio</span>
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">{clientReport.totalHoursInStudio} horas</h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total de Sessões</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{clientReport.totalSessionsCount} sessões</h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Serviço Mais Utilizado</span>
                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 truncate">{clientReport.favoriteService}</h3>
                  </div>
                </div>

                {/* Client Bookings Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Histórico de Sessões do Artista
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                          <th className="py-3 px-2">Data</th>
                          <th className="py-3 px-2">Serviço</th>
                          <th className="py-3 px-2">Sala</th>
                          <th className="py-3 px-2">Duração</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Valor Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {clientReport.bookings.map((b) => (
                          <tr key={b.id}>
                            <td className="py-3 px-2 font-semibold">{formatDateBR(b.preferredDate)}</td>
                            <td className="py-3 px-2">{b.serviceName}</td>
                            <td className="py-3 px-2">{b.roomName}</td>
                            <td className="py-3 px-2">{b.durationHours}h ({b.startTime})</td>
                            <td className="py-3 px-2 font-bold text-emerald-500">{b.status}</td>
                            <td className="py-3 px-2 text-right font-black">{formatBRL(b.finalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">Carregando relatório do cliente...</div>
            )}

          </div>
        )}

        {/* ================= TAB 5: ASSISTENTE IA DO STUDIO ================= */}
        {activeTab === 'ai_assistant' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
            
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Assistente IA do Studio Musical
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gere orçamentos inteligentes, dicas de gravação e estimativas de tempo de estúdio
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prompt ou Projeto do Cliente:
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Cliente quer gravar um álbum de rock de 8 faixas com 2 guitarras, baixo, bateria e vozes. Qual a sugestão de horas de estúdio e cronograma?"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAskAiAssistant('quote_suggestion')}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Sugerir Orçamento Completo
                </button>

                <button
                  onClick={() => handleAskAiAssistant('arrangement_tips')}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Disc className="w-4 h-4 text-emerald-400" /> Dicas de Gravação e Microfonação
                </button>
              </div>

              {aiResponse && (
                <div className="bg-slate-950 text-slate-200 border border-indigo-500/40 rounded-2xl p-5 space-y-3 text-xs leading-relaxed font-sans shadow-2xl">
                  <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
                    <span>Resposta do Assistente do Studio:</span>
                    <span className="text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded-md">Gemini IA</span>
                  </div>
                  <div className="whitespace-pre-wrap">{aiResponse}</div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab: Services / Equipment / Material do Estúdio */}
        {(activeTab === 'equipment' || activeTab === 'services' || activeTab === 'services_equipment') && (
          <EquipmentView
            currentRole="studio"
            defaultSection={activeTab === 'services' ? 'services' : activeTab === 'equipment' ? 'equipment' : 'all'}
            services={services}
            onNavigateToBooking={() => setActiveTab('agenda')}
            onUpdateService={onUpdateService}
            onCreateService={onCreateService}
            onDeleteService={onDeleteService}
          />
        )}

        {/* Tab: Admin Security & PIN Management */}
        {(activeTab === 'admin_security' || activeTab === 'security') && (
          <AdminSecurityPanel
            adminCredentials={
              adminCredentials || {
                name: 'Fernando Padre',
                email: 'fpstudio2027@gmail.com',
                phone: '(71) 9 8118-4589',
                password: '123456',
                pin: '0000',
                backupPins: ['0000', '1234', '123456'],
              }
            }
            onUpdateAdminCredentials={
              onUpdateAdminCredentials ||
              (async () => ({ success: true, message: 'Credenciais atualizadas localmente!' }))
            }
          />
        )}

      </div>

      {/* Quote Creation Modal */}
      {showQuoteModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-500" /> Criar Orçamento com PIX
              </h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateQuoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Total do Serviço (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desconto de Promocional (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  value={quoteDiscount}
                  onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações e Instruções:
                </label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Valor Final com PIX:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatBRL(Math.max(0, quoteAmount - quoteDiscount))}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Gerar PIX e Enviar ao Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL CLIENT PROFILE & SERVICES DETAILS MODAL */}
      {detailModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00FF41] to-emerald-700 p-0.5 shadow-lg flex-shrink-0">
                  <img
                    src={detailModalClient.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={detailModalClient.name}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {detailModalClient.bandOrArtistName || detailModalClient.name}
                    </h2>
                    {detailModalClient.cpf ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CPF CADASTRADO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> CPF PENDENTE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Ficha Cadastral Unificada & Histórico do Cliente • ID: <span className="font-mono">{detailModalClient.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalClient(null)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Section 1: Cadastro & Documentos do Cliente */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#00FF41] font-black text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4" /> 1. Dados Cadastrais & Documentos (CPF / RG)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Nome / Razão Social</span>
                  <span className="font-bold text-white text-sm">{detailModalClient.name}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Nome da Banda / Projeto</span>
                  <span className="font-bold text-[#00FF41]">{detailModalClient.bandOrArtistName || 'Solo / Não Informado'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">CPF (Pessoa Física)</span>
                  <span className="font-mono font-bold text-white bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 inline-block mt-0.5">
                    {detailModalClient.cpf || 'Não cadastrado pelo cliente'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Chave PIX (Envio / Cachê)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {detailModalClient.pixKey ? (
                      <span className="font-mono font-bold text-[#00FF41] bg-[#00FF41]/10 px-2.5 py-1 rounded border border-[#00FF41]/30 inline-flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        <span>{detailModalClient.pixKey}</span>
                        {detailModalClient.pixKeyType && (
                          <span className="text-[9px] uppercase px-1 py-0.2 bg-zinc-900 text-zinc-300 rounded ml-1">
                            {detailModalClient.pixKeyType}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 inline-block">
                        Não cadastrada
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Segurança de Acesso</span>
                  <div className="mt-0.5">
                    {detailModalClient.password ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded text-xs font-bold">
                        <Lock className="w-3 h-3" /> PIN 4D Definido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded text-xs">
                        Sem PIN (Acesso Livre)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">RG / Documento</span>
                  <span className="font-bold text-zinc-200">{detailModalClient.rg || 'Não informado'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">E-mail de Contato</span>
                  <span className="font-mono text-zinc-300">{detailModalClient.email}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Telefone / WhatsApp</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-zinc-200">{detailModalClient.phone || '(71) 99999-0000'}</span>
                    <a
                      href={`https://wa.me/55${(detailModalClient.phone || '71999990000').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded flex items-center gap-1 border border-emerald-500/30"
                    >
                      <Phone className="w-2.5 h-2.5" /> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Endereço de Faturamento</span>
                  <span className="text-zinc-200">
                    {detailModalClient.address ? `${detailModalClient.address}, ${detailModalClient.city || 'Salvador/BA'} - CEP: ${detailModalClient.cep || ''}` : 'Endereço não cadastrado'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Instagram / Rede Social</span>
                  <span className="text-[#00FF41] font-bold">{detailModalClient.instagram || '@estudio_cliente'}</span>
                </div>
              </div>

              {detailModalClient.notes && (
                <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Observações Técnicas / Preferências de Gravação:</span>
                  <p className="text-zinc-300 italic">{detailModalClient.notes}</p>
                </div>
              )}
            </div>

            {/* Grid Section 2: Histórico de Serviços & Pedidos Solicitados */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#00FF41] font-black text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> 2. Histórico de Serviços Solicitados & Agendamentos
                </div>
                {(() => {
                  const clientBookings = bookings.filter(b => b.clientId === detailModalClient.id || b.clientName === detailModalClient.name);
                  return (
                    <span className="text-xs font-bold text-zinc-400">
                      Total: <span className="text-[#00FF41]">{clientBookings.length}</span> {clientBookings.length === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  );
                })()}
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                        <th className="py-2.5 px-3">Data / Hora</th>
                        <th className="py-2.5 px-3">Serviço Solicitado</th>
                        <th className="py-2.5 px-3">Sala</th>
                        <th className="py-2.5 px-3">Duração</th>
                        <th className="py-2.5 px-3">Instrumentos</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {(() => {
                        const clientBookings = bookings.filter(b => b.clientId === detailModalClient.id || b.clientName === detailModalClient.name);
                        if (clientBookings.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-zinc-500 italic">
                                Nenhum serviço ou agendamento registrado para este cliente ainda.
                              </td>
                            </tr>
                          );
                        }

                        return clientBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-zinc-800/50">
                            <td className="py-3 px-3 font-bold text-white">
                              {formatDateBR(b.preferredDate)} <span className="text-zinc-400 font-normal">às {b.startTime}</span>
                            </td>
                            <td className="py-3 px-3 font-bold text-[#00FF41]">
                              {b.serviceName}
                            </td>
                            <td className="py-3 px-3 text-zinc-300">{b.roomName}</td>
                            <td className="py-3 px-3 text-zinc-300">{b.durationHours} hora(s)</td>
                            <td className="py-3 px-3 text-zinc-400 max-w-[150px] truncate">
                              {b.selectedInstruments && b.selectedInstruments.length > 0
                                ? b.selectedInstruments.join(', ')
                                : 'Padrão da sala'}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'pago_confirmado'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}>
                                {b.status === 'pago_confirmado' ? 'PAGO / CONFIRMADO' : 'AGUARDANDO PIX'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-white">
                              {formatBRL(b.totalAmount)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Grid Section 3: Histórico de Pagamentos PIX */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-[#00FF41] font-black text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" /> 3. Entradas Financeiras & Pagamentos PIX Confirmados
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {(() => {
                  const clientTxs = transactions.filter(tx => tx.clientName === detailModalClient.name || tx.clientName === detailModalClient.bandOrArtistName);
                  if (clientTxs.length === 0) {
                    return <p className="text-xs text-zinc-500 italic py-2">Sem histórico de transações financeiras arquivadas.</p>;
                  }

                  return (
                    <div className="space-y-2">
                      {clientTxs.map(tx => (
                        <div key={tx.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{tx.serviceName}</span>
                            <span className="text-[10px] text-zinc-400">{formatDateBR(tx.confirmedAt)} • Forma: {tx.paymentMethod}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#00FF41] block">{formatBRL(tx.amount)}</span>
                            <span className="text-[9px] uppercase font-bold text-emerald-400">PIX Confirmado</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const b = bookings.find(x => x.clientId === detailModalClient.id || x.clientName === detailModalClient.name);
                    if (b) {
                      setSelectedBookingId(b.id);
                      setActiveTab('chat_quotes');
                    }
                    setDetailModalClient(null);
                  }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#00FF41]" /> Abrir Chat de Comunicação
                </button>

                <button
                  onClick={() => setClientToDelete(detailModalClient)}
                  className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-700 text-rose-300 hover:text-white font-bold text-xs rounded-xl border border-rose-800/80 transition flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" /> Excluir Cliente
                </button>
              </div>

              <button
                onClick={() => setDetailModalClient(null)}
                className="px-6 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition cursor-pointer"
              >
                FECHAR FICHA DO CLIENTE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CLIENT CONFIRMATION MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-rose-800/80 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Excluir Cliente?</h3>
                <p className="text-xs text-zinc-400">Esta ação removerá o cadastro do sistema FPStudio.</p>
              </div>
            </div>

            <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
              <p className="text-zinc-200">
                <strong className="text-zinc-400">Artista / Banda:</strong> {clientToDelete.bandOrArtistName || clientToDelete.name}
              </p>
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Responsável:</strong> {clientToDelete.name}
              </p>
              <p className="text-zinc-400 font-mono text-[11px]">
                <strong className="text-zinc-500">E-mail:</strong> {clientToDelete.email}
              </p>
              {clientToDelete.cpf && (
                <p className="text-[#00FF41] font-mono text-[11px]">
                  <strong>CPF:</strong> {clientToDelete.cpf}
                </p>
              )}
            </div>

            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl">
              ⚠️ Tem certeza que deseja excluir permanentemente este cliente do cadastro?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteClient) {
                    onDeleteClient(clientToDelete.id);
                  }
                  if (detailModalClient?.id === clientToDelete.id) {
                    setDetailModalClient(null);
                  }
                  setClientToDelete(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM UNDO / CANCEL ORDERS MODAL */}
      {showConfirmUndoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-amber-500/60 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {undoPeriod === 'yesterday'
                      ? 'Retroceder Pedidos de Ontem'
                      : undoPeriod === 'today'
                      ? 'Desfazer Pedidos de Hoje'
                      : undoPeriod === 'recent'
                      ? 'Desfazer Pedidos Recentes (48h)'
                      : 'Restaurar Estado Anterior'}
                  </h3>
                  <p className="text-xs text-slate-400">Cancelamento e limpeza com recálculo financeiro</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmUndoModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs">
              {[
                { id: 'yesterday', label: 'Ontem' },
                { id: 'today', label: 'Hoje' },
                { id: 'recent', label: 'Últimas 48h' },
                { id: 'all', label: 'Todos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setUndoPeriod(tab.id as any)}
                  className={`py-2 px-2 rounded-xl font-bold transition cursor-pointer ${
                    undoPeriod === tab.id
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {(() => {
              const now = new Date();
              const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
              const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000);
              const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

              const matchingBookings = bookings.filter((b) => {
                const createdDate = b.createdAt ? b.createdAt.slice(0, 10) : '';
                const preferredDate = b.preferredDate || '';
                if (undoPeriod === 'yesterday') return createdDate === yesterdayStr || preferredDate === yesterdayStr;
                if (undoPeriod === 'today') return createdDate === todayStr || preferredDate === todayStr;
                if (undoPeriod === 'recent')
                  return createdDate === todayStr || preferredDate === todayStr || createdDate === yesterdayStr || preferredDate === yesterdayStr;
                return true;
              });

              return (
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-300 font-semibold">
                    {undoPeriod === 'yesterday'
                      ? 'Você está selecionando todos os pedidos criados ou agendados para ontem.'
                      : undoPeriod === 'today'
                      ? 'Você está selecionando todos os pedidos criados ou agendados para hoje.'
                      : undoPeriod === 'recent'
                      ? 'Você está selecionando todos os pedidos dos últimos 2 dias (ontem e hoje).'
                      : 'Você está selecionando todos os pedidos da base para restaurar o estado limpo original.'}
                  </p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Período selecionado:</span>
                      <span className="font-mono text-white font-bold">
                        {undoPeriod === 'yesterday'
                          ? `Ontem (${formatDateBR(yesterdayStr)})`
                          : undoPeriod === 'today'
                          ? `Hoje (${formatDateBR(todayStr)})`
                          : undoPeriod === 'recent'
                          ? `${formatDateBR(yesterdayStr)} a ${formatDateBR(todayStr)}`
                          : 'Todo o histórico'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pedidos identificados:</span>
                      <span className="text-amber-400 font-bold">
                        {matchingBookings.length} pedido(s)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Escolha a ação desejada:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    setIsUndoingToday(true);
                    if (onCancelTodayBookings) {
                      await onCancelTodayBookings('cancel', undoPeriod);
                    }
                    setIsUndoingToday(false);
                    setShowConfirmUndoModal(false);
                    const periodName = undoPeriod === 'yesterday' ? 'de ontem' : undoPeriod === 'today' ? 'de hoje' : undoPeriod === 'recent' ? 'recentes' : 'selecionados';
                    setUndoSuccessMsg(`Pedidos ${periodName} foram marcados como cancelados.`);
                    setTimeout(() => setUndoSuccessMsg(null), 4000);
                  }}
                  disabled={isUndoingToday}
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-2xl text-left space-y-1 transition group cursor-pointer"
                >
                  <span className="text-xs font-black text-amber-400 block group-hover:text-amber-300">
                    Marcar como Cancelados
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    Mantém o registro com status "Cancelado" e reajusta métricas financeiras.
                  </span>
                </button>

                <button
                  onClick={async () => {
                    setIsUndoingToday(true);
                    if (onCancelTodayBookings) {
                      await onCancelTodayBookings('delete', undoPeriod);
                    }
                    setIsUndoingToday(false);
                    setShowConfirmUndoModal(false);
                    const periodName = undoPeriod === 'yesterday' ? 'de ontem' : undoPeriod === 'today' ? 'de hoje' : undoPeriod === 'recent' ? 'recentes' : 'selecionados';
                    setUndoSuccessMsg(`Pedidos ${periodName} foram removidos permanentemente. Estado restaurado como antes.`);
                    setTimeout(() => setUndoSuccessMsg(null), 4000);
                  }}
                  disabled={isUndoingToday}
                  className="p-3.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 hover:border-rose-500 rounded-2xl text-left space-y-1 transition group cursor-pointer"
                >
                  <span className="text-xs font-black text-rose-400 block group-hover:text-rose-300">
                    Excluir Permanentemente
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    Remove da base e restaura o painel exatamente como estava antes.
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowConfirmUndoModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Voltar / Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER / CLIENT MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Cadastrar Novo Usuário</h3>
                  <p className="text-xs text-zinc-400">Adicione um novo cliente, banda ou artista ao sistema.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {createUserError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{createUserError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateUserError(null);

                if (!newUserForm.name.trim()) {
                  setCreateUserError('Por favor, informe o nome completo do responsável.');
                  return;
                }
                if (!newUserForm.email.trim()) {
                  setCreateUserError('Por favor, informe o e-mail do usuário.');
                  return;
                }

                setIsSavingUser(true);
                try {
                  const clientPayload = {
                    name: newUserForm.name.trim(),
                    bandOrArtistName: newUserForm.bandOrArtistName.trim() || newUserForm.name.trim(),
                    email: newUserForm.email.trim().toLowerCase(),
                    phone: newUserForm.phone.trim() || '(71) 99999-0000',
                    cpf: newUserForm.cpf.trim(),
                    password: newUserForm.password.trim() || '1234',
                    pixKey: newUserForm.pixKey.trim(),
                    pixKeyType: newUserForm.pixKeyType,
                    city: newUserForm.city.trim() || 'Salvador - BA',
                    address: newUserForm.address.trim(),
                    notes: newUserForm.notes.trim(),
                    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=120&auto=format&fit=crop&q=80`,
                  };

                  if (onCreateClient) {
                    await onCreateClient(clientPayload);
                  } else {
                    await fetch('/api/clients', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(clientPayload),
                    });
                  }

                  confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                  setUserCreateSuccessMsg(`Usuário "${clientPayload.bandOrArtistName}" cadastrado com sucesso!`);
                  setShowCreateUserModal(false);
                  setNewUserForm({
                    name: '',
                    bandOrArtistName: '',
                    email: '',
                    phone: '',
                    cpf: '',
                    password: '1234',
                    pixKey: '',
                    pixKeyType: 'cpf',
                    city: 'Salvador - BA',
                    address: '',
                    notes: '',
                  });
                  setTimeout(() => setUserCreateSuccessMsg(null), 5000);
                } catch (err: any) {
                  console.error('Error creating user:', err);
                  setCreateUserError(err?.message || 'Erro ao cadastrar usuário. Tente novamente.');
                } finally {
                  setIsSavingUser(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nome Completo */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Nome Completo do Responsável <span className="text-[#00FF41]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* Nome Artístico / Banda */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Nome Artístico / Banda / Produtora
                  </label>
                  <div className="relative">
                    <Music className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: Banda Solar / DJ Alok"
                      value={newUserForm.bandOrArtistName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, bandOrArtistName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    E-mail de Acesso <span className="text-[#00FF41]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="email@exemplo.com"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* Telefone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="(71) 99999-9999"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* CPF */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    CPF (Opcional)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={newUserForm.cpf}
                      onChange={(e) => setNewUserForm({ ...newUserForm, cpf: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* Senha / PIN 4 Dígitos */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    PIN / Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="1234"
                      maxLength={6}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block">Padrão: 1234 (fácil acesso)</span>
                </div>

                {/* Chave PIX */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Chave PIX
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Chave PIX do cliente"
                      value={newUserForm.pixKey}
                      onChange={(e) => setNewUserForm({ ...newUserForm, pixKey: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* Cidade / Estado */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Cidade / Região
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Salvador - BA"
                      value={newUserForm.city}
                      onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Notas Internas / Preferências
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Estilo musical, instrumentos principais, preferências técnicas..."
                    value={newUserForm.notes}
                    onChange={(e) => setNewUserForm({ ...newUserForm, notes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00FF41] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black text-xs font-black rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.3)] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSavingUser ? 'Salvando...' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL USERS MODAL */}
      {showConfirmClearUsersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-rose-800/80 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Limpar Todos os Usuários?</h3>
                <p className="text-xs text-zinc-400">Apagar todos os clientes e deixar apenas o Administrador.</p>
              </div>
            </div>

            <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 text-xs space-y-2">
              <p className="text-zinc-200 leading-relaxed">
                Esta ação removerá todos os <strong className="text-white font-bold">{clients.length} usuário(s)/cliente(s)</strong> cadastrados na base.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-[#00FF41] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conta Preservada:</span>
                </div>
                <p className="text-white font-bold">Fernando Padre (Administrador Geral)</p>
              </div>
            </div>

            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl">
              ⚠️ Tem certeza? Esta operação não pode ser desfeita, mas você poderá cadastrar novos usuários a qualquer momento.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowConfirmClearUsersModal(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setIsClearingUsers(true);
                  if (onClearAllClients) {
                    await onClearAllClients();
                  } else {
                    await fetch('/api/clients/clear-all', { method: 'POST' });
                  }
                  setIsClearingUsers(false);
                  setShowConfirmClearUsersModal(false);
                  setUserCreateSuccessMsg('Base de usuários limpa com sucesso. Apenas o Administrador permanece ativo.');
                  setTimeout(() => setUserCreateSuccessMsg(null), 5000);
                }}
                disabled={isClearingUsers}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isClearingUsers ? 'Apagando...' : 'Sim, Limpar e Deixar Só ADM'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
