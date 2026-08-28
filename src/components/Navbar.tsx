import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  FileCheck2,
  Music2,
  Sliders,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  LogIn,
  UserCheck,
  MessageSquare,
  Star,
  Menu,
  X,
  User,
  LogOut,
  Building2,
  DollarSign,
  Bot,
  Users,
  Palette,
  Globe,
  Lock,
  Sun,
  Moon,
  ShieldCheck,
  KeyRound,
  Trash2,
  Check,
  Volume2,
} from 'lucide-react';
import { Role, UserProfile, PushNotification } from '../types';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';
import { useCustomization } from '../context/CustomizationContext';
import { FlagIcon } from './FlagIcon';
import { playNotificationChime } from '../utils/audioUtils';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeClient: UserProfile;
  activeStaffUser?: UserProfile | null;
  clients: UserProfile[];
  onSelectClient: (client: UserProfile) => void;
  notifications: PushNotification[];
  onMarkNotificationRead: (id?: string) => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: (role?: Role) => void;
  onTriggerTestNotification?: () => void;
  isConnected: boolean;
  onResetState: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenAdminSecurityModal?: () => void;
  isClientLoggedIn?: boolean;
  onLogoutClient?: () => void;
  onLogoutStudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeClient,
  activeStaffUser,
  clients,
  onSelectClient,
  notifications = [],
  onMarkNotificationRead,
  onDeleteNotification,
  onClearAllNotifications,
  onTriggerTestNotification,
  isConnected,
  onResetState,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenAdminSecurityModal,
  isClientLoggedIn = false,
  onLogoutClient,
  onLogoutStudio,
}) => {
  const {
    colorMode,
    toggleColorMode,
    language,
    setLanguage,
    currentAccent,
    currentTheme,
    currentFont,
    t,
    setIsCustomModalOpen,
  } = useCustomization();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  const roleFilteredNotifs = (notifications || []).filter((n) => {
    if (currentRole === 'studio') {
      return n.targetRole === 'studio' || n.targetRole === 'all' || !n.targetRole;
    } else {
      // Client mode: show notifications targeted to client or all
      return (
        (n.targetRole === 'client' || n.targetRole === 'all' || !n.targetRole) &&
        (!n.targetUserId || !activeClient?.id || n.targetUserId === activeClient?.id)
      );
    }
  });

  const displayedNotifs = roleFilteredNotifs.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = roleFilteredNotifs.filter((n) => !n.read).length;

  const handleNotificationItemClick = (n: PushNotification) => {
    onMarkNotificationRead(n.id);
    setShowNotifications(false);

    const titleLower = (n.title || '').toLowerCase();
    const msgLower = (n.message || '').toLowerCase();

    if (currentRole === 'studio') {
      if (n.type === 'booking' || titleLower.includes('agendamento') || titleLower.includes('pedido') || msgLower.includes('agendamento')) {
        setActiveTab('agenda');
      } else if (n.type === 'payment' || titleLower.includes('pagamento') || titleLower.includes('pix') || titleLower.includes('faturamento')) {
        setActiveTab('financials');
      } else if (n.type === 'info' && (titleLower.includes('avaliação') || titleLower.includes('depoimento') || msgLower.includes('avaliação'))) {
        setActiveTab('reviews');
      } else if (n.type === 'system' && (titleLower.includes('segurança') || titleLower.includes('pin') || titleLower.includes('senha'))) {
        if (onOpenAdminSecurityModal) onOpenAdminSecurityModal();
        else setActiveTab('admin_security');
      } else if (n.type === 'quote' || titleLower.includes('orçamento')) {
        setActiveTab('chat_budget');
      } else {
        setActiveTab('agenda');
      }
    } else {
      // Client role
      if (n.type === 'booking' || titleLower.includes('agendamento') || titleLower.includes('pedido')) {
        setActiveTab('bookings');
      } else if (n.type === 'payment' || titleLower.includes('pagamento') || titleLower.includes('pix')) {
        setActiveTab('bookings');
      } else if (n.type === 'info' && (titleLower.includes('avaliação') || titleLower.includes('depoimento'))) {
        setActiveTab('reviews');
      } else if (n.type === 'quote' || titleLower.includes('orçamento') || titleLower.includes('chat')) {
        setActiveTab('chat');
      } else {
        setActiveTab('bookings');
      }
    }
  };

  const handleTestChimeAndNotif = () => {
    playNotificationChime();
    if (onTriggerTestNotification) {
      onTriggerTestNotification();
    }
  };

  interface NavItem {
    id: string;
    label: string;
    sublabel?: string;
    title?: string;
    icon: React.ReactNode;
  }

  const clientNavItems: NavItem[] = [
    { id: 'new_booking', label: language === 'en' ? 'Schedule' : 'Agendar', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'bookings', label: language === 'en' ? 'My Bookings' : 'Meus Pedidos', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'services_equipment', label: language === 'en' ? 'Services' : 'Serviços', sublabel: language === 'en' ? 'Gear' : 'Material', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'reviews', label: language === 'en' ? 'Reviews' : 'Depoimentos', icon: <Star className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'chat', label: language === 'en' ? 'Chat' : 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'profile', label: '', title: language === 'en' ? 'My Profile' : 'Meu Cadastro', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const studioNavItems: NavItem[] = [
    { id: 'agenda', label: language === 'en' ? 'Bookings & Orders' : 'Agendamentos', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'client_reports', label: language === 'en' ? 'Clients' : 'Clientes', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'services_equipment', label: language === 'en' ? 'Services' : 'Serviços', sublabel: language === 'en' ? 'Gear' : 'Material', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'reviews', label: language === 'en' ? 'Reviews Moderation' : 'Avaliações', icon: <Star className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'financials', label: language === 'en' ? 'Finances' : 'Financeiro', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'ai_assistant', label: language === 'en' ? 'AI Assistant' : 'Assistente IA', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'chat_budget', label: language === 'en' ? 'Chat & Quotes' : 'Chat & Orçamentos', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'admin_security', label: language === 'en' ? 'Edit Admin Data' : 'Alterar Dados ADM', sublabel: language === 'en' ? 'Password & PIN' : 'Senha & PIN', icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> },
  ];

  const currentNavItems = currentRole === 'studio' ? studioNavItems : clientNavItems;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
    if (tabId === 'new_booking' && currentRole === 'client') {
      setTimeout(() => {
        document.getElementById('servicos-desejados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const toggleLanguageQuick = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const isStudioMode = currentRole === 'studio';

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b text-white shadow-2xl transition-all ${
        isStudioMode
          ? 'bg-[#0b1120]/95 border-slate-700/80 shadow-slate-950/50'
          : 'border-zinc-800/90'
      }`}
      style={{
        backgroundColor: isStudioMode ? '#0b1120f2' : `${currentTheme?.cardHex || '#121216'}f0`,
        fontFamily: currentFont?.cssFamily || 'inherit',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[60px] sm:min-h-[68px] py-1.5 gap-2 sm:gap-4">
          
          {/* Left: Logo & Role Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                if (currentRole === 'client') setActiveTab('new_booking');
                else setActiveTab('agenda');
              }}
              className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <div className="relative group shrink-0">
                <img
                  src={fpStudioLogo}
                  alt="FPStudio Logo"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover shadow-lg border ring-2 transition group-hover:scale-105"
                  style={{
                    borderColor: isStudioMode ? '#38bdf8' : currentAccent.hex,
                    boxShadow: isStudioMode ? '0 0 18px rgba(56,189,248,0.35)' : `0 0 18px ${currentAccent.hex}40`,
                    outlineColor: isStudioMode ? 'rgba(56,189,248,0.2)' : `${currentAccent.hex}30`,
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-xl md:text-2xl tracking-tight text-white">
                    FP<span style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}>STUDIO</span>
                  </span>
                  {isStudioMode ? (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[9px] font-black uppercase tracking-wider">
                      PAINEL ADM
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 text-[9px] font-black uppercase tracking-wider">
                      CLIENTE
                    </span>
                  )}
                </div>
                <p
                  className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase hidden sm:block"
                  style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                >
                  {isStudioMode
                    ? (language === 'en' ? 'Studio Management & Control' : 'Gestão & Controle do Estúdio')
                    : (language === 'en' ? 'Artist & Booking Portal' : 'Portal do Artista & Gravação')}
                </p>
              </div>
            </button>
          </div>

          {/* Center Screen Navigation Tabs (Desktop & Laptop) */}
          <nav className={`hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-full border shadow-xl overflow-x-auto no-scrollbar max-w-full ${
            isStudioMode ? 'bg-[#0f172a]/95 border-slate-700/80' : 'bg-[#121216]/90 border-zinc-800/90'
          }`}>
            {currentNavItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'services_equipment' && (activeTab === 'services' || activeTab === 'equipment' || activeTab === 'services_equipment')) ||
                (item.id === 'chat_budget' && activeTab === 'chat') ||
                (item.id === 'chat' && activeTab === 'chat_budget');

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={item.title || item.label || 'Cadastro'}
                  className={`${item.label ? 'px-2.5 lg:px-3 py-1 lg:py-1.5' : 'p-1.5 lg:p-2'} rounded-full text-[11px] lg:text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-black shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                  style={{
                    backgroundColor: isActive ? (isStudioMode ? '#38bdf8' : currentAccent.hex) : 'transparent',
                    boxShadow: isActive ? (isStudioMode ? '0 0 15px rgba(56,189,248,0.5)' : `0 0 15px ${currentAccent.hex}50`) : undefined,
                  }}
                >
                  {item.sublabel ? (
                    <span className="flex flex-col text-left leading-[1.05]">
                      <span className="text-[11px] lg:text-xs font-black tracking-tight">{item.label}</span>
                      <span className="text-[8.5px] lg:text-[9.5px] font-bold opacity-80 -mt-0.5">{item.sublabel}</span>
                    </span>
                  ) : item.label ? (
                    <span>{item.label}</span>
                  ) : null}
                  <span className="shrink-0">{item.icon}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Quick Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleColorMode}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition flex items-center justify-center cursor-pointer shadow-sm group hover:scale-105"
              title={
                colorMode === 'light'
                  ? (language === 'en' ? 'Switch to Dark Mode' : 'Mudar para Modo Escuro')
                  : (language === 'en' ? 'Switch to Light Mode' : 'Mudar para Modo Claro')
              }
            >
              {colorMode === 'light' ? (
                <Moon className="w-4 h-4 text-sky-400 transition group-hover:scale-110" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 transition group-hover:scale-110" />
              )}
            </button>

            {/* Quick Language Toggle Button (Icon Only with Flag) */}
            <button
              onClick={toggleLanguageQuick}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition flex items-center justify-center cursor-pointer shadow-sm group hover:scale-105"
              title={language === 'pt' ? 'Mudar para Inglês (Switch to English)' : 'Switch to Portuguese (Mudar para Português)'}
            >
              <FlagIcon language={language} size="md" className="rounded-full w-5 h-5 object-cover" />
            </button>

            {/* Customization & Design Palette Button (Icon Only) */}
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer shadow-sm group"
              title={t('custom_title')}
            >
              <Palette className="w-4 h-4 transition group-hover:scale-110" style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }} />
            </button>

            {/* Role-Specific Identity & Switching Controls */}
            {isStudioMode ? (
              /* Studio ADM Controls */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (onOpenAdminSecurityModal) onOpenAdminSecurityModal();
                    else setActiveTab('admin_security');
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900 hover:bg-sky-950/80 border border-slate-700/80 hover:border-sky-500/60 text-xs text-slate-200 hover:text-white transition cursor-pointer shadow-sm group"
                  title="Clique para Alterar Dados do ADM, Senha e PIN"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="font-black text-sky-300 group-hover:text-white truncate max-w-[130px]">
                    {activeStaffUser?.name || 'Fernando Padre'}
                  </span>
                  <span className="text-[10px] text-black bg-sky-400 font-black px-1.5 py-0.2 rounded group-hover:scale-105 transition">
                    ALTERAR DADOS ⚙️
                  </span>
                </button>

                <button
                  onClick={() => onRoleChange('client')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-black text-xs transition flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Mudar para Visão do Cliente"
                >
                  <span className="hidden sm:inline">Modo Cliente</span>
                  <User className="w-3.5 h-3.5 text-[#00FF41]" />
                </button>

                <button
                  onClick={() => {
                    if (onLogoutStudio) onLogoutStudio();
                    else onRoleChange('client');
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  title="Sair do Modo ADM"
                >
                  <span className="hidden sm:inline">Sair ADM</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Client Portal Controls */
              <div className="flex items-center gap-1.5">
                {isClientLoggedIn ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onOpenAuthModal}
                      className="px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-900 border hover:bg-zinc-800 transition flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer group max-w-[130px] sm:max-w-[190px]"
                      style={{ borderColor: `${currentAccent.hex}80` }}
                      title="Ver ou trocar perfil cadastrado"
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-pulse shrink-0"
                        style={{ backgroundColor: currentAccent.hex }}
                      />
                      <span className="text-zinc-200 text-xs font-black tracking-wide group-hover:text-white transition truncate">
                        {activeClient?.bandOrArtistName || activeClient?.name || 'Cliente'}
                      </span>
                      <span
                        className="hidden sm:inline-block px-1.5 py-0.2 rounded text-black text-[9px] font-black uppercase shrink-0"
                        style={{ backgroundColor: currentAccent.hex }}
                      >
                        ON
                      </span>
                    </button>
                    {onLogoutClient && (
                      <button
                        onClick={onLogoutClient}
                        className="p-1.5 sm:px-2 sm:py-1 rounded-full bg-zinc-900 hover:bg-rose-950 border border-zinc-800 hover:border-rose-500 text-zinc-400 hover:text-rose-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                        title={t('nav_signout')}
                      >
                        <span className="hidden sm:inline">{t('nav_signout')}</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="px-3 sm:px-4 py-1.5 rounded-full text-black font-black text-xs transition flex items-center gap-1.5 cursor-pointer group shadow-md"
                    style={{
                      backgroundColor: currentAccent.hex,
                      boxShadow: `0 0 15px ${currentAccent.hex}40`,
                    }}
                    title="Entrar ou Cadastrar-se para Agendar"
                  >
                    <span className="whitespace-nowrap font-black">{t('nav_signin')}</span>
                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}

                {/* Direct Studio ADM Login Button */}
                <button
                  onClick={onOpenAuthModal}
                  className="px-2 sm:px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-sky-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Acesso de Funcionários / Administrador"
                >
                  <span className="hidden sm:inline">ADM</span>
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                  showNotifications
                    ? 'bg-zinc-800 border-zinc-500 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title={t('nav_notifications')}
                aria-label={t('nav_notifications')}
              >
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${unreadCount > 0 ? 'animate-bounce text-white' : 'text-zinc-200'}`} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-black font-black text-[9px] sm:text-[10px] rounded-full flex items-center justify-center shadow-lg ring-2 ring-zinc-950"
                    style={{
                      backgroundColor: isStudioMode ? '#38bdf8' : currentAccent.hex,
                      boxShadow: isStudioMode ? '0 0 12px rgba(56,189,248,0.8)' : `0 0 12px ${currentAccent.hex}80`,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-20px)] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="p-3 bg-zinc-900/90 flex items-center justify-between border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }} />
                      <span className="font-bold text-xs text-white">
                        {t('nav_notifications')}
                      </span>
                      {unreadCount > 0 && (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-black"
                          style={{ backgroundColor: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                        >
                          {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => onMarkNotificationRead()}
                          className="text-[11px] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                          style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                          title="Marcar todas as mensagens como lidas"
                        >
                          <Check className="w-3 h-3" />
                          <span>{t('nav_mark_read')}</span>
                        </button>
                      )}
                      {roleFilteredNotifs.length > 0 && onClearAllNotifications && (
                        <button
                          onClick={() => onClearAllNotifications(currentRole)}
                          className="text-[11px] text-zinc-400 hover:text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5 transition"
                          title="Limpar todos os avisos"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Limpar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter tabs & test action */}
                  <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          notifFilter === 'all'
                            ? 'bg-zinc-800 text-white font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Todas ({roleFilteredNotifs.length})
                      </button>
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          notifFilter === 'unread'
                            ? 'bg-zinc-800 text-white font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Não lidas ({unreadCount})
                      </button>
                    </div>

                    <button
                      onClick={handleTestChimeAndNotif}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800/70 hover:bg-zinc-700/80 px-2 py-0.5 rounded border border-zinc-700/50 transition cursor-pointer"
                      title="Testar som e disparo de notificação"
                    >
                      <Volume2 className="w-2.5 h-2.5 text-sky-400" />
                      <span>Testar Som</span>
                    </button>
                  </div>

                  {/* Notification items list */}
                  <div className="max-h-84 overflow-y-auto divide-y divide-zinc-900/80">
                    {displayedNotifs.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
                        <div className="p-3 rounded-full bg-zinc-900 text-zinc-600">
                          <Bell className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-zinc-400">
                          {notifFilter === 'unread' ? 'Nenhuma notificação não lida' : t('nav_no_notifications')}
                        </p>
                        <p className="text-[11px] text-zinc-600 max-w-[220px]">
                          {isStudioMode
                            ? 'Avisos de novos pedidos, pagamentos PIX e chats aparecerão automaticamente aqui.'
                            : 'Você receberá atualizações sobre seus pedidos e orçamentos aqui.'}
                        </p>
                        <button
                          onClick={handleTestChimeAndNotif}
                          className="mt-2 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          <span>Simular Alerta de Teste</span>
                        </button>
                      </div>
                    ) : (
                      displayedNotifs.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs hover:bg-zinc-900/80 cursor-pointer transition flex items-start gap-3 relative group ${
                            !n.read ? 'bg-zinc-900/40 border-l-2' : 'opacity-75 hover:opacity-100'
                          }`}
                          style={{
                            borderLeftColor: !n.read ? (isStudioMode ? '#38bdf8' : currentAccent.hex) : undefined,
                          }}
                        >
                          <div
                            onClick={() => handleNotificationItemClick(n)}
                            className="p-2 rounded-xl bg-zinc-800/90 shrink-0 mt-0.5"
                            style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                          >
                            {n.type === 'payment' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : n.type === 'quote' ? (
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            ) : n.type === 'booking' ? (
                              <Calendar className="w-4 h-4 text-sky-400" />
                            ) : n.type === 'system' ? (
                              <ShieldCheck className="w-4 h-4 text-purple-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>

                          <div
                            onClick={() => handleNotificationItemClick(n)}
                            className="flex-1 min-w-0 pr-6"
                          >
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-zinc-200 leading-snug truncate">{n.title}</p>
                              {!n.read && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-ping"
                                  style={{ backgroundColor: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                                />
                              )}
                            </div>
                            <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(n.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às{' '}
                                {new Date(n.timestamp).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="text-[10px] text-sky-400 font-semibold group-hover:underline">
                                Ver detalhes →
                              </span>
                            </div>
                          </div>

                          {/* Delete single notification button */}
                          {onDeleteNotification && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition absolute top-3 right-2.5 cursor-pointer"
                              title="Excluir notificação"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {roleFilteredNotifs.length > 0 && (
                    <div className="p-2 bg-zinc-900/90 border-t border-zinc-800 text-center">
                      <p className="text-[10px] text-zinc-500">
                        Clique em qualquer aviso para abrir a tela correspondente no estúdio.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reset State Button */}
            <button
              onClick={onResetState}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition cursor-pointer"
              title={language === 'en' ? 'Restore initial data' : 'Restaurar dados iniciais'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile / Tablet Horizontal Menu Strip - ALWAYS VISIBLE */}
        <div className="md:hidden py-1.5 border-t border-zinc-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {currentNavItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'services_equipment' && (activeTab === 'services' || activeTab === 'equipment' || activeTab === 'services_equipment')) ||
              (item.id === 'chat_budget' && activeTab === 'chat') ||
              (item.id === 'chat' && activeTab === 'chat_budget');

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-black transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-black shadow-md'
                    : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
                style={{
                  backgroundColor: isActive ? (isStudioMode ? '#38bdf8' : currentAccent.hex) : undefined,
                }}
              >
                {item.sublabel ? (
                  <span className="flex items-center gap-0.5 truncate">
                    <span>{item.label}</span>
                    <span className="text-[9px] opacity-75 font-normal">{item.sublabel}</span>
                  </span>
                ) : (
                  <span>{item.label || item.title || 'PERFIL'}</span>
                )}
                <span
                  className="shrink-0"
                  style={{ color: isActive ? '#000000' : (isStudioMode ? '#38bdf8' : currentAccent.hex) }}
                >
                  {item.icon}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};


