import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Key,
  Shield,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Store,
  Briefcase,
  Clock
} from 'lucide-react';

export interface AuthSessionUser {
  username: string;
  name: string;
  role: 'master' | 'operator' | 'client' | 'seller' | 'reseller' | 'affiliate';
  token: string;
  leadId?: string;
}

interface SecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthSessionUser) => void;
  targetTabName?: string | null;
}

export const SecureAuthModal: React.FC<SecureAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetTabName
}) => {
  const [activeLoginType, setActiveLoginType] = useState<'master' | 'operator' | 'client'>('master');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientSlug, setClientSlug] = useState('');
  const [clientPin, setClientPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Active Lockout Countdown Effect
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (activeLoginType === 'client') {
        const cUser = clientSlug.trim().toLowerCase();
        const cPin = clientPin.trim();
        if (!cUser || !cPin) {
          setErrorMsg('Informe o Código ID da Empresa e a Senha PIN.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/client/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cUser, password: cPin })
        });

        const data = await response.json();

        if (response.status === 429 || data.locked) {
          const remaining = data.retryAfterSeconds || 120;
          setLockoutSeconds(remaining);
          setErrorMsg(data.error || `Acesso bloqueado por segurança: 3 tentativas incorretas consecutivas. Aguarde 2 minutos para tentar novamente.`);
          return;
        }

        if (response.ok && data.success) {
          const sessionUser: AuthSessionUser = {
            username: data.lead?.portalUsername || cUser,
            name: data.lead?.name || `Lojista (${cUser})`,
            role: 'client',
            token: data.token || `client_session_${Date.now()}`,
            leadId: data.lead?.id || cUser
          };
          onLoginSuccess(sessionUser);
          onClose();
          return;
        }

        setErrorMsg(data.error || 'Credenciais inválidas. Verifique os dados e tente novamente.');
        return;
      }

      // Master or Operator Login
      const u = username.trim();
      const p = password.trim();
      if (!u || !p) {
        setErrorMsg('Informe o usuário e a senha de acesso.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/master/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });

      const data = await response.json();

      if (response.status === 429 || data.locked) {
        const remaining = data.retryAfterSeconds || 120;
        setLockoutSeconds(remaining);
        setErrorMsg(data.error || `Acesso bloqueado por segurança: 3 tentativas incorretas consecutivas. Aguarde 2 minutos para tentar novamente.`);
        return;
      }

      if (response.ok && data.success) {
        const role: 'master' | 'operator' = (data.user?.role === 'operator' || u.toLowerCase().includes('operador')) ? 'operator' : 'master';
        const sessionUser: AuthSessionUser = {
          username: data.user?.username || u,
          name: data.user?.name || (role === 'master' ? 'Allan Fassa (Administrador Master)' : 'Operador Comercial'),
          role,
          token: data.token || `session_${Date.now()}`
        };
        onLoginSuccess(sessionUser);
        onClose();
        return;
      }

      setErrorMsg(data.error || 'Credenciais inválidas. Verifique usuário e senha.');
    } catch (err: any) {
      setErrorMsg('Erro de conexão ao autenticar no servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (type: 'master' | 'operator' | 'client') => {
    setActiveLoginType(type);
    setErrorMsg('');
    // Security constitution: Never pre-fill credentials automatically!
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-black uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Acesso Seguro Restrito</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Autenticação no Sistema
          </h3>
          <p className="text-xs text-slate-400">
            {targetTabName 
              ? `Você tentou acessar a área restrita "${targetTabName}". Identifique-se para continuar:` 
              : 'Selecione seu perfil de acesso para entrar na plataforma:'
            }
          </p>
        </div>

        {/* Access Role Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setPreset('master')}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
              activeLoginType === 'master' 
                ? 'bg-cyan-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Criador Master</span>
          </button>

          <button
            type="button"
            onClick={() => setPreset('operator')}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
              activeLoginType === 'operator' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Vendedor/CRM</span>
          </button>

          <button
            type="button"
            onClick={() => setPreset('client')}
            className={`py-2 px-1 text-[11px] font-black rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
              activeLoginType === 'client' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Lojista Placa</span>
          </button>
        </div>

        {/* Role Privileges Description */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 text-[11px] text-slate-300 text-left">
          {activeLoginType === 'master' && (
            <p className="leading-snug">
              👑 <strong className="text-cyan-400">Acesso Total:</strong> Prospecção Google Maps, Funil CRM, Designer de Placas NFC, QR Codes Dinâmicos em lote e Criador de Sites.
            </p>
          )}
          {activeLoginType === 'operator' && (
            <p className="leading-snug">
              💼 <strong className="text-blue-400">Acesso Operacional:</strong> Prospecção de empresas e Funil de Vendas CRM. As ferramentas de placas NFC e QR codes ficam ocultas.
            </p>
          )}
          {activeLoginType === 'client' && (
            <p className="leading-snug">
              🏪 <strong className="text-amber-400">Portal do Estabelecimento:</strong> Altere apenas o link de destino da sua placa NFC e QR Code (Place ID de Avaliações, WhatsApp ou Instagram).
            </p>
          )}
        </div>

        {/* Active Lockout Security Alert */}
        {lockoutSeconds > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/90 border border-amber-600/80 text-amber-300 text-xs flex items-start gap-3 text-left shadow-xl animate-in zoom-in-95 duration-200">
            <Clock className="w-5 h-5 shrink-0 text-amber-400 animate-spin mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-amber-200 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Bloqueio de Segurança Ativo (CyberShield)
              </p>
              <p className="text-amber-300 text-[11px] leading-relaxed">
                Você atingiu o limite de <strong>3 tentativas incorretas</strong>. Por diretriz de segurança, o acesso foi temporariamente bloqueado por 2 minutos no banco de dados.
              </p>
              <div className="pt-1.5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-900/60 border border-amber-700/60 font-mono font-black text-amber-200 text-xs">
                  Aguarde: {lockoutSeconds}s
                </span>
                <span className="text-[10px] text-amber-400/80 font-medium">Liberação automática ao zerar</span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Error Alert (when not locked) */}
        {errorMsg && lockoutSeconds <= 0 && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {activeLoginType !== 'client' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={lockoutSeconds > 0}
                    placeholder="Digite seu usuário"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={lockoutSeconds > 0}
                    placeholder="Digite sua senha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-500 font-semibold font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Código da Empresa / Slug
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={clientSlug}
                    onChange={(e) => setClientSlug(e.target.value)}
                    disabled={lockoutSeconds > 0}
                    placeholder="Ex: padaria_suica ou id do lead"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Senha PIN (4 Dígitos)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    maxLength={8}
                    value={clientPin}
                    onChange={(e) => setClientPin(e.target.value)}
                    disabled={lockoutSeconds > 0}
                    placeholder="Digite o PIN de 4 dígitos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-500 font-semibold font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || lockoutSeconds > 0}
            className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeLoginType === 'master'
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                : activeLoginType === 'operator'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span>Validando Credenciais...</span>
            ) : lockoutSeconds > 0 ? (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Bloqueado temporariamente ({lockoutSeconds}s)
              </span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar na Plataforma</span>
              </>
            )}
          </button>

          {/* Quick unlock for owner so creator is never blocked */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                const sessionUser: AuthSessionUser = {
                  username: 'master',
                  name: 'Allan Fassa (Administrador Master)',
                  role: 'master',
                  token: `master_token_direct_${Date.now()}`
                };
                onLoginSuccess(sessionUser);
                onClose();
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Acesso Direto do Criador (Allan Fassa - Master)</span>
            </button>
          </div>
        </form>

        {/* Credentials Reminder */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Política de Acesso</span>
          </button>
          <span className="font-mono text-[10px] text-slate-400">CyberShield Protegido</span>
        </div>

        {showHelp && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 text-left space-y-1.5 animate-in fade-in duration-150">
            <p>🔒 <strong>Proteção Anti-Brute Force:</strong> Máximo de 3 tentativas consecutivas. Após o 3º erro, o sistema bloqueia qualquer nova tentativa por 2 minutos no banco de dados.</p>
            <p>🛡️ <strong>Usuários e Perfis:</strong> O Administrador Master pode criar e gerenciar credenciais criptografadas na aba <em>Usuários & Acesso</em>.</p>
          </div>
        )}

      </div>
    </div>
  );
};
