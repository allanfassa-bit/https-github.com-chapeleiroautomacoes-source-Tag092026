import React, { useState } from 'react';
import { 
  Briefcase, 
  X, 
  Check, 
  AlertCircle, 
  Lock, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SellerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export const SellerRegisterModal: React.FC<SellerRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seller' | 'reseller'>('seller');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 9) {
      clean = clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    } else if (clean.length > 6) {
      clean = clean.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (clean.length > 3) {
      clean = clean.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
    }
    setCpf(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_\-.]/g, '');
    if (cleanUsername.length < 3) {
      setErrorMsg('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    const cleanCpfDigits = cpf.replace(/\D/g, '');
    if (cleanCpfDigits.length !== 11) {
      setErrorMsg('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          cpf: cpf.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      // Save credentials for instant login
      if (data.token && data.user) {
        localStorage.setItem('alf_auth_user', JSON.stringify({
          token: data.token,
          user: data.user
        }));
        onSuccess(data.user, data.token);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full text-white shadow-2xl p-6 sm:p-8 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Programa de Parceiros Comerciais
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Cadastro de Novo Vendedor / Revendedor
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cadastre-se para prospectar empresas, vincular totens e placas de avaliação Google no balcão de lojistas e lucrar com nosso sistema.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Nome Completo (*)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                CPF do Titular (*)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  maxLength={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-bold"
                />
              </div>
              <span className="text-[10px] text-slate-500">Exclusivo para conferência do Master.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                WhatsApp / Celular (*)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                E-mail de Contato (*)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Usuário / Login (*)
              </label>
              <input
                type="text"
                required
                placeholder="carlos_vendas"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-.]/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Sem espaços ou acentos.</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Senha de Acesso (*)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 dígitos"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Modalidade de Atuação
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  role === 'seller'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>💼 Vendedor Direto</span>
                  {role === 'seller' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Vender totens no balcão e ativar placas em campo.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('reseller')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  role === 'reseller'
                    ? 'bg-purple-500/10 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🤝 Revendedor Parceiro</span>
                  {role === 'reseller' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Agência ou parceiro com link próprio e comissões.
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span>Criando Conta de Vendedor...</span>
              ) : (
                <>
                  <span>Criar Minha Conta &amp; Começar a Vender</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dados protegidos por criptografia CyberShield PBKDF2</span>
          </div>
        </form>
      </div>
    </div>
  );
};
