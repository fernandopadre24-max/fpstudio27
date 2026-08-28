import React, { useState } from 'react';
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
} from 'lucide-react';
import { Role, UserProfile, PushNotification } from '../types';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';
import { useCustomization } from '../context/CustomizationContext';
import { FlagIcon } from './FlagIcon';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeClient: UserProfile;
  activeStaffUser?: UserProfile | null;
  clients: UserProfile[];
  onSelectClient: (client: UserProfile) => void;
  notifications: PushNotification[];
  onMarkNotificationRead: (id?: string) => void;
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
  notifications,
  onMarkNotificationRead,
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

  const roleFilteredNotifs = notifications.filter((n) => {
    if (currentRole === 'studio') {
      return n.targetRole === 'studio';
    } else {
      return n.targetRole === 'client' && (!n.targetUserId || n.targetUserId === activeClient?.id);
    }
  });

  const unreadCount = roleFilteredNotifs.filter((n) => !n.read).length;

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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                title={t('nav_notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-black font-black text-[9px] sm:text-[10px] rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: isStudioMode ? '#38bdf8' : currentAccent.hex,
                      boxShadow: isStudioMode ? '0 0 10px rgba(56,189,248,0.6)' : `0 0 10px ${currentAccent.hex}60`,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="p-3 bg-zinc-900 flex items-center justify-between border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }} />
                      <span className="font-bold text-xs text-white">
                        {t('nav_notifications')} ({unreadCount})
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => onMarkNotificationRead()}
                        className="text-[11px] hover:underline font-semibold cursor-pointer"
                        style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                      >
                        {t('nav_mark_read')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900">
                    {roleFilteredNotifs.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs">
                        {t('nav_no_notifications')}
                      </div>
                    ) : (
                      roleFilteredNotifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            if (currentRole === 'client') {
                              setActiveTab('chat');
                            } else {
                              setActiveTab('chat_budget');
                            }
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs hover:bg-zinc-900 cursor-pointer transition flex items-start gap-3 ${
                            !n.read ? 'bg-zinc-900/60 border-l-2' : 'opacity-70'
                          }`}
                          style={{
                            borderLeftColor: !n.read ? (isStudioMode ? '#38bdf8' : currentAccent.hex) : undefined,
                          }}
                        >
                          <div
                            className="p-1.5 rounded-lg bg-zinc-800 shrink-0 mt-0.5"
                            style={{ color: isStudioMode ? '#38bdf8' : currentAccent.hex }}
                          >
                            {n.type === 'payment' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : n.type === 'quote' ? (
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-zinc-200 leading-snug">{n.title}</p>
                            <p className="text-zinc-400 text-[11px] line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-zinc-500 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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


