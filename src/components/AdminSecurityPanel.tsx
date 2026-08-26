import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Loader2,
  RefreshCw,
  User,
  Mail,
  Phone,
  HelpCircle,
  BadgeCheck,
  Check,
  Shield,
  Smartphone,
  LockKeyhole,
} from 'lucide-react';
import { AdminCredentials } from '../types';

interface AdminSecurityPanelProps {
  adminCredentials: AdminCredentials;
  onUpdateAdminCredentials: (
    data: Partial<AdminCredentials> & {
      currentPassword?: string;
      currentPin?: string;
      newPassword?: string;
      newPin?: string;
      newEmail?: string;
    }
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const AdminSecurityPanel: React.FC<AdminSecurityPanelProps> = ({
  adminCredentials,
  onUpdateAdminCredentials,
}) => {
  // Tabs inside Security Panel
  const [securitySection, setSecuritySection] = useState<'pin' | 'password' | 'profile'>('pin');

  // PIN Form State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile Form State
  const [admName, setAdmName] = useState(adminCredentials.name || 'Fernando Padre');
  const [admEmail, setAdmEmail] = useState(adminCredentials.email || 'fpstudio2027@gmail.com');
  const [admPhone, setAdmPhone] = useState(adminCredentials.phone || '(71) 9 8118-4589');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Evaluate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Não informada', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Fraca', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Boa', color: 'bg-amber-500' };
    return { score: 3, label: 'Muito Forte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Handle PIN Submit
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    const cleanNewPin = newPin.trim();
    const cleanConfirmPin = confirmPin.trim();
    const cleanCurrentPin = currentPin.trim();

    if (!cleanNewPin) {
      setPinError('Informe o novo PIN de acesso.');
      return;
    }

    if (!/^\d{4,6}$/.test(cleanNewPin)) {
      setPinError('O PIN deve conter de 4 a 6 dígitos numéricos (apenas números).');
      return;
    }

    if (cleanNewPin !== cleanConfirmPin) {
      setPinError('A confirmação do PIN não confere com o novo PIN digitado.');
      return;
    }

    setPinLoading(true);
    try {
      const res = await onUpdateAdminCredentials({
        currentPin: cleanCurrentPin || undefined,
        pin: cleanNewPin,
        newPin: cleanNewPin,
      });

      if (res.success) {
        setPinSuccess(`✅ PIN alterado com sucesso para "${cleanNewPin}"! Use este novo PIN no próximo acesso.`);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setPinError(res.error || 'Erro ao alterar o PIN. Verifique o PIN atual.');
      }
    } catch (err: any) {
      setPinError(err.message || 'Erro de conexão ao salvar novo PIN.');
    } finally {
      setPinLoading(false);
    }
  };

  // Handle Password Submit
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const cleanCurrentPass = currentPassword.trim();
    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (!cleanNewPass) {
      setPasswordError('Informe a nova senha.');
      return;
    }

    if (cleanNewPass.length < 4) {
      setPasswordError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await onUpdateAdminCredentials({
        currentPassword: cleanCurrentPass || undefined,
        password: cleanNewPass,
        newPassword: cleanNewPass,
      });

      if (res.success) {
        setPasswordSuccess('✅ Senha de Administrador alterada com sucesso! Suas novas credenciais estão ativas.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Erro ao alterar a senha. Verifique a senha atual.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Erro de conexão ao salvar nova senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Profile Update Submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!admName.trim() || !admEmail.trim()) {
      setProfileError('Nome e E-mail são obrigatórios.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await onUpdateAdminCredentials({
        name: admName.trim(),
        email: admEmail.trim().toLowerCase(),
        newEmail: admEmail.trim().toLowerCase(),
        phone: admPhone.trim(),
      });

      if (res.success) {
        setProfileSuccess('✅ Dados cadastrais do Administrador atualizados com sucesso!');
      } else {
        setProfileError(res.error || 'Erro ao atualizar dados do administrador.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao salvar perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  Segurança & Credenciais do ADM
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/40 text-sky-300 text-[10px] font-black uppercase tracking-wider">
                  Mestre
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Altere seu PIN numérico de acesso rápido, senha mestra de e-mail e dados de login administrativo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300">
            <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">PIN ATUAL ATIVO</span>
              <span className="font-mono font-black text-sky-300 tracking-wider">
                •••• {adminCredentials.pin ? `(Termina em ${adminCredentials.pin.slice(-2)})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setSecuritySection('pin')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              securitySection === 'pin'
                ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Alterar PIN de Acesso (4-6 Dígitos)</span>
          </button>

          <button
            onClick={() => setSecuritySection('password')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              securitySection === 'password'
                ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Alterar Senha do Administrador</span>
          </button>

          <button
            onClick={() => setSecuritySection('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              securitySection === 'profile'
                ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados de Login & E-mail ADM</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PIN ALTERATION */}
      {securitySection === 'pin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Alterar PIN Numérico de Acesso Rápido</h3>
              <p className="text-xs text-slate-400">
                O PIN de 4 a 6 dígitos é utilizado para entrar rapidamente no painel administrativo sem precisar digitar e-mail e senha longa.
              </p>
            </div>
          </div>

          {pinError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSavePin} className="space-y-5 max-w-xl">
            {/* PIN Atual (Opcional se logado) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>PIN Atual (se já possuir)</span>
                <span className="text-[10px] text-slate-500 font-normal">Padrão inicial: 0000 ou 1234</span>
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-400 tracking-widest"
              />
            </div>

            {/* Novo PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Novo PIN Numérico (4 a 6 Dígitos) *</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPin ? 'Ocultar Dígitos' : 'Ver Dígitos'}
                </button>
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite de 4 a 6 números"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-400 tracking-[0.25em]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Apenas números de 0 a 9. Exemplos: 2027, 7198, 8888, 123456.
              </p>
            </div>

            {/* Confirmar Novo PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Confirmar Novo PIN *
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Repita o novo PIN"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-400 tracking-[0.25em]"
              />
            </div>

            {/* Teclas de PIN de Exemplo Rápido */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">Sugestões de PIN Seguros:</span>
              <div className="flex flex-wrap gap-2">
                {['2027', '7198', '8888', '4321', '0707'].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => {
                      setNewPin(sugg);
                      setConfirmPin(sugg);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Salvar */}
            <button
              type="submit"
              disabled={pinLoading || !newPin || newPin.length < 4}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                pinLoading || !newPin || newPin.length < 4
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              }`}
            >
              {pinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{pinLoading ? 'Gravando Novo PIN...' : 'Salvar Novo PIN do Administrador'}</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: PASSWORD ALTERATION */}
      {securitySection === 'password' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Alterar Senha do Administrador</h3>
              <p className="text-xs text-slate-400">
                Utilizada no login tradicional com e-mail e senha do estúdio no modal de acesso.
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-5 max-w-xl">
            {/* Senha Atual */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Senha Atual de Administrador</span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showCurrentPassword ? 'Ocultar' : 'Ver'}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha atual (Padrão inicial: 123456)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Nova Senha de Administrador *</span>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showNewPassword ? 'Ocultar' : 'Ver'}
                </button>
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres (Ex: fpstudio@2027)"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
              />

              {/* Indicador de Força de Senha */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-800'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-800'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-800'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Força: <strong className="text-white">{passwordStrength.label}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Confirmar Nova Senha *</span>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showConfirmPassword ? 'Ocultar' : 'Ver'}
                </button>
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita exatamente a nova senha"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Botão de Salvar Senha */}
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || newPassword.length < 4}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                passwordLoading || !newPassword || newPassword.length < 4
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
              }`}
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{passwordLoading ? 'Gravando Senha...' : 'Salvar Nova Senha do Administrador'}</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: ADMIN PROFILE & EMAIL */}
      {securitySection === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Dados de Identidade do Administrador</h3>
              <p className="text-xs text-slate-400">
                Nome de exibição, e-mail de login administrativo e telefone de contato oficial do produtor.
              </p>
            </div>
          </div>

          {profileError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Nome do Produtor / Administrador *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={admName}
                  onChange={(e) => setAdmName(e.target.value)}
                  placeholder="Ex: Fernando Padre"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                E-mail Principal de Login ADM *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={admEmail}
                  onChange={(e) => setAdmEmail(e.target.value)}
                  placeholder="Ex: fpstudio2027@gmail.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Telefone / WhatsApp de Contato
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={admPhone}
                  onChange={(e) => setAdmPhone(e.target.value)}
                  placeholder="Ex: (71) 9 8118-4589"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading || !admName || !admEmail}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                profileLoading || !admName || !admEmail
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{profileLoading ? 'Salvando Perfil...' : 'Salvar Dados do Administrador'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
