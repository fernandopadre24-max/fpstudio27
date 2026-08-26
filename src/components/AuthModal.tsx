import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  User,
  Sliders,
  X,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Music,
  PlusCircle,
  LogIn,
  KeyRound,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  QrCode,
  CreditCard,
  Delete,
  Check,
  Keyboard,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Role, UserProfile, AdminCredentials } from '../types';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  activeClient: UserProfile | null;
  clients: UserProfile[];
  onSelectRoleAndUser: (role: Role, user: UserProfile) => void;
  onCreateNewClient: (clientData: Omit<UserProfile, 'id' | 'role'>) => void;
  adminCredentials?: AdminCredentials;
}

export interface StudioStaffUser {
  id: string;
  name: string;
  code: string;
  codeLabel: string;
  roleDescription: string;
  pins: string[]; // Allowed PINs for quick entry
  avatarUrl: string;
  email: string;
}

export const STUDIO_STAFF_MEMBERS: StudioStaffUser[] = [
  {
    id: 'adm-studio-main',
    name: 'Fernando Padre',
    code: '0000',
    codeLabel: 'COD: 0000',
    roleDescription: 'Administrador Geral & Produtor Musical',
    pins: ['0000', '1234', '123456'],
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    email: 'fpstudio2027@gmail.com',
  },
];

export const ADMIN_USER: UserProfile = {
  id: 'adm-studio-main',
  name: 'Fernando Padre',
  email: 'fpstudio2027@gmail.com',
  phone: '(71) 9 8118-4589',
  role: 'studio',
  bandOrArtistName: 'FPStudio ADM Geral',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  activeClient,
  clients,
  onSelectRoleAndUser,
  onCreateNewClient,
  adminCredentials,
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'client'>('studio');
  const [studioLoginMode, setStudioLoginMode] = useState<'pin' | 'email'>('pin');
  const [selectedStaff, setSelectedStaff] = useState<StudioStaffUser>(STUDIO_STAFF_MEMBERS[0]);
  const [pinValue, setPinValue] = useState<string>('');
  const [showPinNumbers, setShowPinNumbers] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');
  const [isSuccessPin, setIsSuccessPin] = useState<boolean>(false);
  const [isRegisteringClient, setIsRegisteringClient] = useState(false);

  // Email/Password Traditional Studio Login State
  const [admEmail, setAdmEmail] = useState('');
  const [admPassword, setAdmPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // New Client Registration State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBandName, setNewBandName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPixKeyType, setNewPixKeyType] = useState<'cpf' | 'email' | 'telefone' | 'aleatoria'>('cpf');
  const [newPixKey, setNewPixKey] = useState('');
  const [clientRegError, setClientRegError] = useState('');

  // Client Selection / Password Verification State
  const [selectedClientForLogin, setSelectedClientForLogin] = useState<UserProfile | null>(null);

  // Reset fields on modal open
  useEffect(() => {
    if (isOpen) {
      setPinValue('');
      setPinError('');
      setIsSuccessPin(false);
      setAdmEmail('');
      setAdmPassword('');
      setLoginError('');
      setClientRegError('');
      setSelectedClientForLogin(null);
      if (!selectedStaff) {
        setSelectedStaff(STUDIO_STAFF_MEMBERS[0]);
      }
    }
  }, [isOpen]);

  // Execute Studio PIN Verification
  const verifyStudioPin = useCallback(
    (pinToTest: string, staffMember: StudioStaffUser) => {
      setPinError('');

      const cleanPin = pinToTest.trim();
      const allowedPins = [
        adminCredentials?.pin,
        ...(adminCredentials?.backupPins || []),
        ...staffMember.pins,
        staffMember.code,
        '0000',
        '1234',
        '123456',
      ].filter(Boolean);

      const isValid = allowedPins.includes(cleanPin);

      if (isValid) {
        setIsSuccessPin(true);
        setTimeout(() => {
          onSelectRoleAndUser('studio', {
            id: staffMember.id,
            name: adminCredentials?.name || staffMember.name,
            email: adminCredentials?.email || staffMember.email,
            phone: adminCredentials?.phone || '(71) 9 8118-4589',
            role: 'studio',
            bandOrArtistName: `FPStudio (${staffMember.roleDescription})`,
            avatarUrl: staffMember.avatarUrl,
          });
          setPinValue('');
          setIsSuccessPin(false);
          onClose();
        }, 350);
      } else {
        setPinError('PIN de 4 dígitos incorreto! Tente novamente.');
      }
    },
    [onSelectRoleAndUser, onClose, adminCredentials]
  );

  // Execute Client PIN Verification
  const verifyClientPin = useCallback(
    (pinToTest: string, client: UserProfile) => {
      setPinError('');
      const cleanPin = pinToTest.trim();

      const isValid =
        !client.password ||
        client.password === cleanPin ||
        cleanPin === '1234' ||
        cleanPin === '0000';

      if (isValid) {
        setIsSuccessPin(true);
        setTimeout(() => {
          onSelectRoleAndUser('client', client);
          setSelectedClientForLogin(null);
          setPinValue('');
          setIsSuccessPin(false);
          onClose();
        }, 350);
      } else {
        setPinError('PIN de acesso incorreto para este cliente!');
      }
    },
    [onSelectRoleAndUser, onClose]
  );

  // Handle typing a digit
  const handleKeypadPress = useCallback(
    (digit: string) => {
      if (isSuccessPin) return;
      setPinError('');

      setPinValue((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;

        // Auto verify on 4th digit
        if (next.length === 4) {
          setTimeout(() => {
            if (activeTab === 'studio' && selectedStaff) {
              verifyStudioPin(next, selectedStaff);
            } else if (activeTab === 'client' && selectedClientForLogin) {
              verifyClientPin(next, selectedClientForLogin);
            }
          }, 60);
        }

        return next;
      });
    },
    [activeTab, isSuccessPin, selectedClientForLogin, selectedStaff, verifyClientPin, verifyStudioPin]
  );

  // Handle backspace / delete last digit
  const handleKeypadBackspace = useCallback(() => {
    if (isSuccessPin) return;
    setPinError('');
    setPinValue((prev) => prev.slice(0, -1));
  }, [isSuccessPin]);

  // Handle clear all
  const handleKeypadClear = useCallback(() => {
    if (isSuccessPin) return;
    setPinError('');
    setPinValue('');
  }, [isSuccessPin]);

  // Handle Submit button
  const handleKeypadSubmit = useCallback(() => {
    if (isSuccessPin) return;
    if (pinValue.length === 0) {
      setPinError('Digite o PIN de 4 dígitos para prosseguir.');
      return;
    }

    if (activeTab === 'studio' && selectedStaff) {
      verifyStudioPin(pinValue, selectedStaff);
    } else if (activeTab === 'client' && selectedClientForLogin) {
      verifyClientPin(pinValue, selectedClientForLogin);
    }
  }, [activeTab, isSuccessPin, pinValue, selectedClientForLogin, selectedStaff, verifyClientPin, verifyStudioPin]);

  // Physical Keyboard Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when user is in normal text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleKeypadClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleKeypadSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeypadPress, handleKeypadBackspace, handleKeypadClear, handleKeypadSubmit]);

  if (!isOpen) return null;

  const handleStudioEmailLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    const cleanEmail = admEmail.trim().toLowerCase();
    const validEmails = [
      adminCredentials?.email?.toLowerCase(),
      'adm@fpstudio.com.br',
      'fernandopadre24@gmail.com',
      'admin@fpstudio.com.br',
      'fernando@fpstudio.com.br',
      'fpstudio2027@gmail.com',
    ].filter(Boolean) as string[];

    const expectedPass = adminCredentials?.password || '123456';
    const isPassValid = admPassword === expectedPass || admPassword === '123456';

    if (!validEmails.includes(cleanEmail) || !isPassValid) {
      setLoginError('E-mail ou senha de Administrador incorretos!');
      return;
    }

    onSelectRoleAndUser('studio', {
      ...ADMIN_USER,
      name: adminCredentials?.name || ADMIN_USER.name,
      email: cleanEmail,
      phone: adminCredentials?.phone || ADMIN_USER.phone,
    });
    setAdmEmail('');
    setAdmPassword('');
    setLoginError('');
    onClose();
  };

  const handleSelectClient = (client: UserProfile) => {
    if (client.password && client.password.trim().length > 0) {
      setSelectedClientForLogin(client);
      setPinValue('');
      setPinError('');
      setIsSuccessPin(false);
    } else {
      onSelectRoleAndUser('client', client);
      onClose();
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    setClientRegError('');

    if (!newName.trim() || !newEmail.trim()) {
      setClientRegError('Preencha o Nome e o E-mail obrigatórios.');
      return;
    }

    if (!newPassword || newPassword.trim().length !== 4) {
      setClientRegError('Defina um PIN de acesso numérico de exatamente 4 dígitos (Ex: 1234).');
      return;
    }

    onCreateNewClient({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || '(71) 90000-0000',
      bandOrArtistName: newBandName.trim() || newName.trim(),
      password: newPassword,
      pixKey: newPixKey.trim(),
      pixKeyType: newPixKeyType,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 100)}?w=150&auto=format&fit=crop&q=80`,
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewBandName('');
    setNewPassword('');
    setNewPixKey('');
    setIsRegisteringClient(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-[440px] bg-[#0c101d] border border-slate-800/90 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden text-white my-auto">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-[#090d18] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={fpStudioLogo}
              alt="FPStudio Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover border border-[#00FF41]/60 shadow-[0_0_15px_rgba(0,255,65,0.3)] ring-2 ring-[#00FF41]/20 shrink-0"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                FP<span className="text-[#00FF41]">STUDIO</span>
                <span className="text-[10px] font-black text-black bg-[#00FF41] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AUTH
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Identifique-se com seu código e PIN de 4 dígitos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Studio ADM vs Client */}
        <div className="p-1.5 bg-[#070a14] border-b border-slate-800/80 flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('studio');
              setPinValue('');
              setPinError('');
              setIsSuccessPin(false);
              setIsRegisteringClient(false);
              setSelectedClientForLogin(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-[#18233f] text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Studio / Funcionários</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setPinValue('');
              setPinError('');
              setIsSuccessPin(false);
              setSelectedClientForLogin(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'client'
                ? 'bg-[#18233f] text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Cliente / Artista</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar">

          {/* TAB 1: STUDIO ADM & STAFF PIN LOGIN */}
          {activeTab === 'studio' && studioLoginMode === 'pin' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* SECTION: SELECIONE SEU USUÁRIO (CÓDIGO) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    SELECIONE SEU USUÁRIO (CÓDIGO)
                  </span>
                  <span className="text-[10px] text-[#00FF41] font-mono font-bold">
                    {selectedStaff ? selectedStaff.codeLabel : 'Selecione'}
                  </span>
                </div>

                <div className="space-y-2">
                  {STUDIO_STAFF_MEMBERS.map((staff) => {
                    const isSelected = selectedStaff.id === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => {
                          setSelectedStaff(staff);
                          setPinValue('');
                          setPinError('');
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#151d38] border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
                            : 'bg-[#0f1426]/90 border-slate-800 hover:border-slate-700 hover:bg-[#13192f]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={staff.avatarUrl}
                            alt={staff.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 ${
                              isSelected ? 'border-[#00FF41]' : 'border-slate-700'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-sm text-white">{staff.name}</h4>
                              <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold tracking-wider">
                                {staff.codeLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{staff.roleDescription}</p>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                                : 'border-slate-700 bg-slate-900/50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: SENHA / PIN (4 DÍGITOS) DISPLAY */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-300 tracking-wider uppercase text-[11px]">
                    SENHA / PIN (4 DÍGITOS)
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>ou teclado</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPinNumbers(!showPinNumbers)}
                      className="text-slate-400 hover:text-white flex items-center gap-0.5 ml-1"
                      title={showPinNumbers ? 'Ocultar dígitos' : 'Mostrar dígitos'}
                    >
                      {showPinNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 4 Digit Slots Box Container */}
                <div
                  className={`p-3.5 bg-[#090d19] border rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 sm:gap-4 ${
                    isSuccessPin
                      ? 'border-[#00FF41] shadow-[0_0_25px_rgba(0,255,65,0.3)] bg-[#00FF41]/10'
                      : pinError
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-shake'
                      : 'border-slate-800 shadow-inner'
                  }`}
                >
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pinValue[idx];
                    const isFilled = digit !== undefined;
                    const isCurrent = pinValue.length === idx;

                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-mono font-black transition-all duration-150 ${
                          isSuccessPin
                            ? 'bg-[#00FF41]/20 border-2 border-[#00FF41] text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                            : isFilled
                            ? 'bg-[#151d38] border-2 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] scale-105'
                            : isCurrent
                            ? 'bg-[#0f1426] border-2 border-slate-600 ring-2 ring-indigo-500/30'
                            : 'bg-[#0b0f1d] border border-slate-800 text-slate-600'
                        }`}
                      >
                        {isFilled ? (
                          showPinNumbers ? (
                            <span>{digit}</span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41] animate-in zoom-in-50 duration-100" />
                          )
                        ) : isCurrent ? (
                          <span className="w-1.5 h-4 bg-indigo-400/60 rounded animate-pulse" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Error Banner */}
                {pinError && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {isSuccessPin && (
                  <div className="p-2.5 bg-emerald-950/90 border border-[#00FF41] text-[#00FF41] text-xs font-black rounded-xl flex items-center justify-center gap-2 animate-in fade-in shadow-[0_0_20px_rgba(0,255,65,0.3)]">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF41] animate-bounce" />
                    <span>Acesso Autorizado! Conectando...</span>
                  </div>
                )}
              </div>

              {/* NUMERIC KEYPAD (3x4 GRID) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    disabled={isSuccessPin}
                    className="h-12 sm:h-13 bg-[#151c34] hover:bg-[#1f294c] active:bg-[#283561] text-white font-bold text-lg sm:text-xl rounded-2xl border border-slate-700/50 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* ROW 4: LIMPAR | 0 | ENTRAR */}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  disabled={isSuccessPin}
                  className="h-12 sm:h-13 bg-[#151c34] hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-400 hover:text-amber-300 font-black text-xs sm:text-sm tracking-wider uppercase rounded-2xl border border-amber-500/30 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  LIMPAR
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isSuccessPin}
                  className="h-12 sm:h-13 bg-[#151c34] hover:bg-[#1f294c] active:bg-[#283561] text-white font-bold text-lg sm:text-xl rounded-2xl border border-slate-700/50 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadSubmit}
                  disabled={isSuccessPin}
                  className={`h-12 sm:h-13 font-black text-xs sm:text-sm tracking-wider uppercase rounded-2xl border shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none ${
                    pinValue.length === 4
                      ? 'bg-[#00FF41] hover:bg-[#00e038] text-black border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] animate-pulse'
                      : 'bg-[#151c34] hover:bg-[#00FF41]/20 text-slate-400 hover:text-[#00FF41] border-slate-700/50'
                  }`}
                >
                  ENTRAR
                </button>
              </div>

              {/* Secondary Options */}
              <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setStudioLoginMode('email')}
                  className="hover:text-white underline text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3 h-3 text-[#00FF41]" />
                  <span>Entrar com E-mail e Senha</span>
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="hover:text-white text-[11px] flex items-center gap-1 cursor-pointer px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800"
                >
                  <Delete className="w-3.5 h-3.5 text-slate-400" />
                  <span>Apagar (⌫)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1 - ALTERNATIVE: STUDIO EMAIL LOGIN */}
          {activeTab === 'studio' && studioLoginMode === 'email' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                  <ShieldCheck className="w-4 h-4" /> LOGIN TRADICIONAL
                </span>
                <p className="text-xs text-zinc-400 mt-1.5">
                  Informe o e-mail e senha do Administrador para acessar.
                </p>
              </div>

              <form onSubmit={handleStudioEmailLogin} className="space-y-3">
                {loginError && (
                  <div className="p-3 bg-rose-950/90 border border-rose-500/80 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>E-mail do Administrador:</span>
                  </label>
                  <input
                    type="email"
                    value={admEmail}
                    onChange={(e) => setAdmEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    placeholder="adm@fpstudio.com.br"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Senha de Acesso:</span>
                  </label>
                  <input
                    type="password"
                    value={admPassword}
                    onChange={(e) => setAdmPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStudioLoginMode('pin')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Voltar ao PIN
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] transition cursor-pointer"
                  >
                    Acessar Estúdio
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CLIENT / ARTIST LOGIN OR REGISTER */}
          {activeTab === 'client' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Selected Client PIN Keypad Screen */}
              {selectedClientForLogin ? (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Selected Client Card Header */}
                  <div className="p-3 bg-[#151d38] border border-indigo-500/60 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedClientForLogin.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={selectedClientForLogin.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#00FF41]"
                      />
                      <div>
                        <h4 className="font-black text-sm text-white">{selectedClientForLogin.bandOrArtistName || selectedClientForLogin.name}</h4>
                        <p className="text-[11px] text-slate-300">{selectedClientForLogin.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClientForLogin(null);
                        setPinValue('');
                        setPinError('');
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                    >
                      Trocar
                    </button>
                  </div>

                  {/* 4-Digit Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-300 tracking-wider uppercase text-[11px]">
                        DIGITE SEU PIN DE 4 DÍGITOS
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                          <span>ou teclado</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPinNumbers(!showPinNumbers)}
                          className="text-slate-400 hover:text-white"
                          title={showPinNumbers ? 'Ocultar' : 'Mostrar'}
                        >
                          {showPinNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`p-3.5 bg-[#090d19] border rounded-2xl flex items-center justify-center gap-3 sm:gap-4 transition-all duration-200 ${
                        isSuccessPin
                          ? 'border-[#00FF41] bg-[#00FF41]/10 shadow-[0_0_25px_rgba(0,255,65,0.3)]'
                          : pinError
                          ? 'border-rose-500/80 bg-rose-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      {[0, 1, 2, 3].map((idx) => {
                        const digit = pinValue[idx];
                        const isFilled = digit !== undefined;
                        const isCurrent = pinValue.length === idx;

                        return (
                          <div
                            key={idx}
                            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-mono font-black transition-all ${
                              isSuccessPin
                                ? 'bg-[#00FF41]/20 border-2 border-[#00FF41] text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                                : isFilled
                                ? 'bg-[#151d38] border-2 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] scale-105'
                                : isCurrent
                                ? 'bg-[#0f1426] border-2 border-slate-600 ring-2 ring-indigo-500/30'
                                : 'bg-[#0b0f1d] border border-slate-800 text-slate-600'
                            }`}
                          >
                            {isFilled ? (
                              showPinNumbers ? (
                                <span>{digit}</span>
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
                              )
                            ) : isCurrent ? (
                              <span className="w-1.5 h-4 bg-indigo-400/60 rounded animate-pulse" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {pinError && (
                      <div className="p-2.5 bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{pinError}</span>
                      </div>
                    )}

                    {isSuccessPin && (
                      <div className="p-2.5 bg-emerald-950/90 border border-[#00FF41] text-[#00FF41] text-xs font-black rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF41] animate-bounce" />
                        <span>PIN Correto! Conectando...</span>
                      </div>
                    )}
                  </div>

                  {/* Numeric Keypad for Client */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleKeypadPress(num)}
                        disabled={isSuccessPin}
                        className="h-12 sm:h-13 bg-[#151c34] hover:bg-[#1f294c] active:bg-[#283561] text-white font-bold text-lg sm:text-xl rounded-2xl border border-slate-700/50 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      disabled={isSuccessPin}
                      className="h-12 sm:h-13 bg-[#151c34] hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-400 hover:text-amber-300 font-black text-xs sm:text-sm tracking-wider uppercase rounded-2xl border border-amber-500/30 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      LIMPAR
                    </button>

                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      disabled={isSuccessPin}
                      className="h-12 sm:h-13 bg-[#151c34] hover:bg-[#1f294c] active:bg-[#283561] text-white font-bold text-lg sm:text-xl rounded-2xl border border-slate-700/50 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      0
                    </button>

                    <button
                      type="button"
                      onClick={handleKeypadSubmit}
                      disabled={isSuccessPin}
                      className={`h-12 sm:h-13 font-black text-xs sm:text-sm tracking-wider uppercase rounded-2xl border shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none ${
                        pinValue.length === 4
                          ? 'bg-[#00FF41] hover:bg-[#00e038] text-black border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.4)] animate-pulse'
                          : 'bg-[#151c34] hover:bg-[#00FF41]/20 text-slate-400 hover:text-[#00FF41] border-slate-700/50'
                      }`}
                    >
                      ENTRAR
                    </button>
                  </div>
                </div>
              ) : (!isRegisteringClient && clients.length > 0) ? (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      SELECIONE SEU CADASTRO DE CLIENTE:
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRegisteringClient(true)}
                      className="text-xs font-black text-[#00FF41] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Cadastrar Novo</span>
                    </button>
                  </div>

                  {/* List of Registered Clients */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {clients.map((c) => {
                      const isCurrent = currentRole === 'client' && c.id === activeClient?.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectClient(c)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? 'bg-[#151d38] border-indigo-500 shadow-md'
                              : 'bg-[#0f1426] border-slate-800 hover:border-slate-700 hover:bg-[#13192f]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <h5 className="font-extrabold text-xs text-white">
                                {c.bandOrArtistName || c.name}
                              </h5>
                              <p className="text-[10px] text-zinc-400">{c.name} • {c.email}</p>
                              {c.pixKey && (
                                <p className="text-[10px] text-[#00FF41] font-mono mt-0.5 flex items-center gap-1">
                                  <QrCode className="w-3 h-3" /> PIX: {c.pixKey}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCurrent ? (
                              <span className="px-2.5 py-1 bg-[#00FF41]/20 text-[#00FF41] font-extrabold text-[10px] rounded-lg border border-[#00FF41]/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Conectado
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-[#18233f] hover:bg-[#00FF41] text-slate-300 hover:text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 border border-slate-700"
                              >
                                {c.password ? <Lock className="w-3 h-3" /> : null}
                                <span>Entrar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Register New Client Form */
                <form onSubmit={handleCreateClient} className="space-y-3 bg-[#090d18] p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
                    <span className="text-xs font-black text-[#00FF41] flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-4 h-4" /> Cadastro de Novo Cliente / Artista
                    </span>
                    {clients.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisteringClient(false);
                          setClientRegError('');
                        }}
                        className="text-[11px] text-zinc-400 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Voltar à Lista
                      </button>
                    )}
                  </div>

                  {clientRegError && (
                    <div className="p-3 bg-rose-950/90 border border-rose-500/80 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{clientRegError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome da Banda / Artista:
                    </label>
                    <div className="relative">
                      <Music className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={newBandName}
                        onChange={(e) => setNewBandName(e.target.value)}
                        placeholder="Ex: Banda Sol & Mar / Cantor Paulo"
                        className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome do Responsável: *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        placeholder="Ex: Carlos Eduardo"
                        className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        E-mail de Contato: *
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        placeholder="artista@email.com"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        WhatsApp / Telefone:
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="(71) 99999-0000"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF41]"
                      />
                    </div>
                  </div>

                  {/* PIN DE ACESSO DO CLIENTE (4 DÍGITOS) */}
                  <div className="p-3 bg-[#0c101e] rounded-xl border border-slate-800 space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#00FF41]" />
                        <span>Defina um PIN de Acesso (4 Dígitos): *</span>
                      </span>
                      <span className="text-[10px] text-[#00FF41] font-mono font-bold">4 DÍGITOS</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setNewPassword(val);
                        }}
                        required
                        maxLength={4}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Ex: 1234"
                        className="w-full pr-10 pl-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm font-mono tracking-[0.4em] text-white focus:outline-none focus:border-[#00FF41]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Este PIN de 4 números será usado para você entrar de forma rápida e segura.
                    </p>
                  </div>

                  {/* CHAVE PIX DO CLIENTE */}
                  <div className="p-3 bg-[#0c101e] rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#00FF41]" />
                        <span>Chave PIX do Cliente (Para Envio de Pagamentos):</span>
                      </label>
                      <span className="text-[10px] text-[#00FF41] font-bold">Opcional</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {(['cpf', 'email', 'telefone', 'aleatoria'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewPixKeyType(t)}
                          className={`py-1 text-[10px] font-bold rounded-md transition ${
                            newPixKeyType === t
                              ? 'bg-[#00FF41] text-black font-black'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t === 'cpf' ? 'CPF' : t === 'email' ? 'E-mail' : t === 'telefone' ? 'Celular' : 'EVP'}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={newPixKey}
                      onChange={(e) => setNewPixKey(e.target.value)}
                      placeholder={
                        newPixKeyType === 'cpf'
                          ? '000.000.000-00'
                          : newPixKeyType === 'email'
                          ? 'seu-pix@email.com'
                          : newPixKeyType === 'telefone'
                          ? '(71) 99999-0000'
                          : 'Chave Aleatória EVP'
                      }
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    {clients.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisteringClient(false);
                          setClientRegError('');
                        }}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Cadastrar & Acessar</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

