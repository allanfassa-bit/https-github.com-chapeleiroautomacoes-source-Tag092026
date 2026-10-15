import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface SellerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export const SYSTEM_TAB_OPTIONS = [
  { id: 'leads', label: 'Diretório de Clientes & Leads', desc: 'Cadastrar clientes, placas NFC e gerenciar empresas' },
  { id: 'site_preview', label: 'Criador de Mini-Site & Logo', desc: 'Subir logotipo, cadastrar serviços/preços e publicar Mini-Site' },
  { id: 'overview', label: 'Radar Local & Mapa', desc: 'Buscar comércios na região e mapear oportunidades' },
  { id: 'sales_pitch', label: 'Scripts de Vendas & WhatsApp', desc: 'Abordagens prontas e calculadora de ganhos' },
  { id: 'totem_config', label: 'Configurador de Placas / QR Code', desc: 'Ativar tags NFC, QR Code e link de avaliação Google' },
  { id: 'portal', label: 'Portal do Parceiro & Comissões', desc: 'Acompanhar vendas, link de afiliado e saques' },
  { id: 'ads', label: 'Tráfego Pago & Anúncios', desc: 'Templates de campanhas Google Ads e Meta Ads' },
];

export const CLIENT_PERMISSION_OPTIONS = [
  { id: 'mini_site', label: 'Mini-Site Personalizado com Logo & Serviços', desc: 'Página exclusiva do cliente com botão WhatsApp e catálogo' },
  { id: 'nfc_totem', label: 'Placa / Totem NFC & QR Code Google', desc: 'Link direto para avaliação 5 estrelas no Google Meu Negócio' },
  { id: 'leads_crm', label: 'Painel de Avaliações & Clientes', desc: 'Acesso do lojista aos resultados e cliques da placa' },
  { id: 'whatsapp_button', label: 'Atendimento Rápido via WhatsApp', desc: 'Orçamentos diretos dos serviços no celular do cliente' },
];

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
  const [role, setRole] = useState<'seller' | 'reseller' | 'client'>('reseller');
  const [allowedTabs, setAllowedTabs] = useState<string[]>([
    'leads',
    'site_preview',
    'overview',
    'sales_pitch',
    'totem_config',
    'portal'
  ]);
  const [clientPermissions, setClientPermissions] = useState<string[]>([
    'mini_site',
    'nfc_totem',
    'leads_crm',
    'whatsapp_button'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 14);
    if (clean.length <= 11) {
      if (clean.length > 9) {
        clean = clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
      } else if (clean.length > 6) {
        clean = clean.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      } else if (clean.length > 3) {
        clean = clean.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
      }
    } else {
      // CNPJ mask 00.000.000/0000-00
      clean = clean
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCpf(clean);
  };

  const toggleTabPermission = (tabId: string) => {
    setAllowedTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  const toggleClientPermission = (permId: string) => {
    setClientPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleRolePreset = (newRole: 'seller' | 'reseller' | 'client') => {
    setRole(newRole);
    if (newRole === 'client') {
      setAllowedTabs(['leads', 'site_preview', 'totem_config']);
    } else if (newRole === 'seller') {
      setAllowedTabs(['leads', 'site_preview', 'overview', 'sales_pitch', 'totem_config', 'portal']);
    } else {
      setAllowedTabs(['leads', 'site_preview', 'overview', 'sales_pitch', 'totem_config', 'portal', 'ads']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMsg('Por favor, informe o nome completo ou razão social.');
      return;
    }

    const cleanUsername = (username.trim() || cleanName.toLowerCase().replace(/\s+/g, '_'))
      .toLowerCase()
      .replace(/[^a-z0-9_\-.@]/g, '');
    if (cleanUsername.length < 2) {
      setErrorMsg('O nome de usuário deve ter pelo menos 2 caracteres.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (allowedTabs.length === 0) {
      setErrorMsg('Selecione pelo menos 1 aba liberada para o acesso.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          cpf: cpf.trim() || '000.000.000-00',
          email: email.trim(),
          phone: phone.trim(),
          password,
          role,
          allowedTabs,
          clientPermissions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      // Also persist directly to Firestore client-side for immediate cross-device sync
      const docId = cleanUsername.replace(/[^a-z0-9_\-]/g, '_');
      const nowIso = new Date().toISOString();
      try {
        await setDoc(doc(db, 'sellers', docId), {
          id: docId,
          username: cleanUsername,
          name: cleanName,
          cpf: cpf.trim() || '000.000.000-00',
          email: email.trim(),
          phone: phone.trim(),
          role,
          vendorCode: data.user?.vendorCode || cleanUsername,
          allowedTabs: allowedTabs.join(','),
          clientPermissions: clientPermissions.join(','),
          active: true,
          createdAt: nowIso
        }, { merge: true });
      } catch (_) {
        // Backend already persisted or queued sync
      }

      setSuccessMsg('Cadastro salvo com sucesso!');

      if (data.token && data.user) {
        const enrichedUser = {
          ...data.user,
          allowedTabs,
          clientPermissions
        };
        // Only overwrite localStorage session if not currently logged in as Master
        const existingAuth = localStorage.getItem('alf_auth_user');
        let isMasterLogged = false;
        if (existingAuth) {
          try {
            const parsed = JSON.parse(existingAuth);
            if (parsed?.user?.role === 'master') {
              isMasterLogged = true;
            }
          } catch (_) {}
        }
        if (!isMasterLogged) {
          localStorage.setItem('alf_auth_user', JSON.stringify({
            token: data.token,
            user: enrichedUser
          }));
        }
        onSuccess(enrichedUser, data.token);
      }

      setTimeout(() => {
        onClose();
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col text-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header with High-Visibility Close Button */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Cadastro &amp; Permissões de Acesso
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 truncate mt-0.5">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <span className="truncate">Novo Revendedor, Vendedor ou Cliente</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition text-xs font-bold cursor-pointer"
            title="Fechar tela"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-left">
          <p className="text-xs text-slate-400 leading-relaxed">
            Preencha os dados abaixo e selecione exatamente <strong>quais abas do sistema</strong> e <strong>quais recursos (Mini-Site, Logotipo, Serviços, Placa NFC)</strong> este revendedor ou cliente poderá utilizar.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form id="seller-register-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                1. Tipo de Conta / Modalidade
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleRolePreset('reseller')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === 'reseller'
                      ? 'bg-purple-500/15 border-purple-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>🤝 Revendedor</span>
                    {role === 'reseller' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Cadastra clientes, cria Mini-Sites e gerencia placas.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRolePreset('seller')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === 'seller'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>💼 Vendedor</span>
                    {role === 'seller' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Prospecção em campo, ativação de totens e comissão.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRolePreset('client')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === 'client'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>🏪 Cliente / Lojista</span>
                    {role === 'client' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Acessa seu próprio Mini-Site, logotipo, serviços e placa.
                  </div>
                </button>
              </div>
            </div>

            {/* Personal / Company Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Nome Completo ou Empresa (*)
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
                  CPF ou CNPJ do Titular
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="000.000.000-00 ou CNPJ"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    maxLength={18}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
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
                  E-mail de Contato
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
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
                  Usuário / Login de Acesso (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="carlos_vendas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-.@]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Usado para entrar no sistema.</span>
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
                    placeholder="Mínimo 4 dígitos"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Selection of Allowed System Tabs */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-emerald-400 uppercase flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  2. Quais Abas do Sistema este Usuário Pode Utilizar?
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setAllowedTabs(
                      allowedTabs.length === SYSTEM_TAB_OPTIONS.length
                        ? ['leads', 'site_preview']
                        : SYSTEM_TAB_OPTIONS.map((t) => t.id)
                    )
                  }
                  className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {allowedTabs.length === SYSTEM_TAB_OPTIONS.length ? 'Marcar Essenciais' : 'Selecionar Todas'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYSTEM_TAB_OPTIONS.map((tab) => {
                  const checked = allowedTabs.includes(tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => toggleTabPermission(tab.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                        checked
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">{tab.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{tab.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection of Client / Reseller Features */}
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
              <label className="text-[11px] font-black text-cyan-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                3. Recursos Liberados para o Cliente / Mini-Site
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLIENT_PERMISSION_OPTIONS.map((perm) => {
                  const checked = clientPermissions.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => toggleClientPermission(perm.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                        checked
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">{perm.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{perm.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer with Save & Close Actions */}
        <div className="sticky bottom-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Dados sincronizados com segurança no painel Master</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancelar / Fechar
            </button>

            <button
              type="submit"
              form="seller-register-form"
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span>Salvando Cadastro...</span>
              ) : (
                <>
                  <span>Salvar Cadastro &amp; Liberar Acesso</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
