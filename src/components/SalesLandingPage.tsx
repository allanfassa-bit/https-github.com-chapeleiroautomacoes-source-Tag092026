import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Star,
  QrCode,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
  MessageCircle,
  Instagram,
  Wifi,
  ChevronRight,
  Award,
  Users,
  BarChart3,
  Flame,
  Check,
  Palette,
  Camera,
  Layers,
  Sparkle
} from 'lucide-react';
import { detectNicheVisualProfile, NicheVisualProfile } from '../utils/nicheVisualDatabase';

interface SalesLandingPageProps {
  onOpenLogin: (suggestedTab?: string) => void;
  onExploreDemo?: () => void;
  initialNiche?: string;
}

const NICHE_PREVIEWS = [
  { id: 'estetica', label: 'Estética & Spa VIP', icon: '✨', badge: 'Luxo & GSAP' },
  { id: 'mercado', label: 'Supermercado & Hortifruti', icon: '🛒', badge: 'Alta Rotatividade' },
  { id: 'mecanica', label: 'Oficina & Auto Center', icon: '🔧', badge: 'Reparos & Peças' },
  { id: 'odontologia', label: 'Odontologia & Clínica', icon: '🦷', badge: 'Saúde & Precisão' },
  { id: 'gastronomia', label: 'Restaurante & Bar', icon: '🍔', badge: 'Gastronômico' },
  { id: 'fitness', label: 'Academia & Treino', icon: '💪', badge: 'Energético' },
  { id: 'pet', label: 'Pet Shop & Vet', icon: '🐾', badge: 'Cuidado & Banho' },
  { id: 'juridico', label: 'Advocacia & Direito', icon: '⚖️', badge: 'Corporativo VIP' },
];

export const SalesLandingPage: React.FC<SalesLandingPageProps> = ({
  onOpenLogin,
  onExploreDemo,
  initialNiche
}) => {
  const [dailyClients, setDailyClients] = useState<number>(30);
  const [activeTechTab, setActiveTechTab] = useState<'nfc' | 'qr' | 'social' | 'sites'>('nfc');

  // Niche visual profile state - allows dynamic testing of any client segment
  const [activeNiche, setActiveNiche] = useState<string>(() => {
    if (initialNiche) return initialNiche;
    try {
      const params = new URLSearchParams(window.location.search);
      const paramNiche = params.get('niche') || params.get('nicho') || params.get('segmento');
      if (paramNiche) return paramNiche;
    } catch (_) {}
    return 'estetica';
  });

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Dynamic visual assets loaded from the specialized niche database
  const visualProfile: NicheVisualProfile = useMemo(() => {
    return detectNicheVisualProfile(activeNiche);
  }, [activeNiche]);

  const { visual_assets } = visualProfile;
  const { palette, image_prompts, animation_style } = visual_assets;

  // Interactive ROI calculation
  const estimatedMonthlyReviews = Math.round(dailyClients * 0.2 * 30);
  const estimatedNewCustomers = Math.round(dailyClients * 0.35 * 30);
  const estimatedRevenueGain = estimatedNewCustomers * 45; // ticket médio R$ 45

  // Animation class based on the detected animation style
  const getAnimationClass = () => {
    switch (animation_style) {
      case 'premium_fade':
        return 'transition-all duration-700 ease-out animate-in fade-in';
      case 'dynamic_slide':
        return 'transition-all duration-500 ease-out animate-in slide-in-from-bottom-6 fade-in';
      case 'smooth_reveal':
        return 'transition-all duration-500 ease-out animate-in zoom-in-95 fade-in';
      case 'energetic_pop':
        return 'transition-all duration-300 ease-out animate-in zoom-in-90 fade-in';
      default:
        return 'transition-all duration-500 ease-out animate-in fade-in';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-black text-slate-950 text-sm shadow-lg shadow-cyan-500/20">
              ALF
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight flex items-center gap-1.5 leading-none">
                ALF Automação
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded-sm border border-cyan-500/20 uppercase tracking-wider">
                  NFC &amp; GMB
                </span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Tecnologia para Negócios Físicos
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#solucoes" className="hover:text-white transition">Soluções</a>
            <a href="#placa-nfc" className="hover:text-white transition">Placa NFC 5★</a>
            <a href="#redes-sociais" className="hover:text-white transition">Tags Sociais &amp; Wi-Fi</a>
            <a href="#mini-sites" className="hover:text-white transition">Mini Sites por Nicho</a>
            <a href="#simulador" className="hover:text-white transition">Simulador ROI</a>
            <a href="#precos" className="hover:text-white transition">Planos</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLogin()}
              className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black py-2 px-4 rounded-xl flex items-center gap-2 transition shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-95"
              id="btn-nav-login"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acessar Plataforma</span>
            </button>
          </div>
        </div>
      </header>

      {/* NICHE EXPERIENCE SWITCHER BAR (Banner de Demonstração por Nicho) */}
      <section className="bg-slate-900/80 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Demonstração Visual por Ramo de Atuação:</span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${palette.glow}20`,
                color: palette.accent,
                border: `1px solid ${palette.accent}40`
              }}
            >
              {visualProfile.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
            {NICHE_PREVIEWS.map(item => {
              const isSelected = activeNiche.toLowerCase().includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNiche(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-md scale-105'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background adapted to niche colors */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: `${palette.glow}25` }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: `${palette.secondary}20` }}
        />

        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 mb-6 backdrop-blur-sm shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>A Revolução do Google Meu Negócio &amp; Ponto de Venda</span>
          <span className="bg-cyan-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            2026
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Transforme Quem Visita Sua Loja em{' '}
          <span
            className="bg-clip-text text-transparent bg-linear-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${palette.accent}, #38bdf8, ${palette.secondary})`
            }}
          >
            Avaliações 5★ no Google
          </span>{' '}
          em 3 Segundos
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Placas Acrílicas NFC Inteligentes, QR Codes Dinâmicos, Tags de Redes Sociais e Mini Sites de Alta Conversão desenhados sob medida para o ramo de{' '}
          <strong className="text-white font-bold">{visualProfile.name}</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => onOpenLogin()}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition active:scale-95 cursor-pointer text-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Acessar Painel / Entrar</span>
          </button>
          
          <a
            href={`https://wa.me/5514999999999?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20Placas%20NFC%20e%20Mini%20Sites%20para%20${encodeURIComponent(visualProfile.name)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center justify-center gap-2 transition text-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Falar com Especialista</span>
          </a>
        </div>

        {/* Security & Visual Style Engine Badge */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Plataforma blindada com controle de acesso corporativo</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Engine Visual: <strong>{visualProfile.styleMode}</strong> ({animation_style})
            </span>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-2xl font-black text-cyan-400 font-mono">1 Toque</div>
            <div className="text-xs font-bold text-white mt-1">Aproximação NFC</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sem digitar link nem procurar no Google</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-2xl font-black text-emerald-400 font-mono">+300%</div>
            <div className="text-xs font-bold text-white mt-1">Mais Avaliações</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Empresas saltam para o Top 3 do Maps</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-2xl font-black text-amber-400 font-mono">100%</div>
            <div className="text-xs font-bold text-white mt-1">Dinâmico &amp; Remoto</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Troque o link da placa quando quiser</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs">
            <div className="text-2xl font-black text-indigo-400 font-mono">Zero App</div>
            <div className="text-xs font-bold text-white mt-1">Nenhum Aplicativo</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Funciona em qualquer iPhone ou Android</div>
          </div>
        </div>
      </section>

      {/* TECH SHOWCASE TABS SECTION */}
      <section id="solucoes" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
              Ecossistema Completo de Vendas Físicas &amp; Digitais
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Tudo o Que Seu Estabelecimento Precisa para Ser a Referência da Região
            </h2>
            <p className="text-sm text-slate-400">
              Conecte a experiência no balcão com sua reputação online e fature muito mais com soluções inteligentes.
            </p>
          </div>

          {/* Interactive Tech Selector */}
          <div className="flex justify-center mt-10">
            <div className="inline-flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTechTab('nfc')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTechTab === 'nfc' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
                <span>1. Placas NFC 5★</span>
              </button>
              <button
                onClick={() => setActiveTechTab('social')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTechTab === 'social' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>2. Tags Redes &amp; Wi-Fi</span>
              </button>
              <button
                onClick={() => setActiveTechTab('qr')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTechTab === 'qr' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>3. QR Dinâmicos</span>
              </button>
              <button
                onClick={() => setActiveTechTab('sites')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTechTab === 'sites' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>4. Sites &amp; Mini Sites</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PLACAS NFC (Condizente com o Nicho Ativo) */}
          {activeTechTab === 'nfc' && (
            <div id="placa-nfc" className={`mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 ${getAnimationClass()}`}>
              <div className="lg:col-span-7 space-y-5 text-left">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${palette.glow}20`,
                    borderColor: `${palette.accent}50`,
                    color: palette.accent
                  }}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Placa de Balcão Customizada para {visualProfile.name}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Totem Acrílico de Balcão 10x10cm com Chip NFC de Alta Velocidade
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  O cliente finaliza o atendimento ou consumo no seu estabelecimento, aproxima a traseira do celular e o aplicativo oficial do Google Maps abre instantaneamente na tela com 5 estrelas prontas para envio. Sem precisar digitar o nome da loja nem soletrar endereço.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Acrílico cast premium com impressão UV de alta durabilidade</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Compatível com 99% dos celulares (NFC + QR Code)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Sem aplicativo, sem login e sem bateria</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Painel online para mudar o link quando quiser</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => onOpenLogin()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Configurar Placa no Sistema</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Mockup Totem adaptado ao nicho */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-2 p-6 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden group transition-all duration-500"
                  style={{
                    borderColor: `${palette.accent}60`,
                    boxShadow: `0 20px 50px -10px ${palette.glow}30`
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at center, ${palette.glow}20, transparent 70%)`
                    }}
                  />
                  
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: `${palette.glow}25`,
                      borderColor: `${palette.accent}50`,
                      color: palette.accent
                    }}
                  >
                    <Smartphone className="w-6 h-6 animate-bounce" />
                  </div>

                  <div>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all"
                      style={{
                        backgroundColor: `${palette.primary}cc`,
                        color: palette.accent,
                        borderColor: `${palette.accent}60`
                      }}
                    >
                      {visualProfile.badges[0] || 'Aproxime o Celular Aqui'}
                    </span>
                    <h4 className="text-lg font-black text-white mt-2">Avalie no Google</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">{visualProfile.name}</p>
                    <div className="flex items-center justify-center gap-1 text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> NFC Chip</span>
                    <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5 text-amber-400" /> QR Backup</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL & WIFI TAGS */}
          {activeTechTab === 'social' && (
            <div id="redes-sociais" className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 text-rose-400 bg-rose-950/60 border border-rose-800/80 px-3 py-1 rounded-full text-xs font-bold">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Conexão Imediata no Ponto de Venda</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Tags NFC para Instagram, WhatsApp, TikTok e Wi-Fi Sem Senha
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Elimine placas com senhas escritas em papel. O cliente aproxima o celular na mesa e já entra na rede Wi-Fi da loja, segue seu perfil no Instagram na hora ou inicia conversa direto no WhatsApp do atendente.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">Ganhe Seguidores Reais no Balcão</h5>
                      <p className="text-[11px] text-slate-400">O Instagram do estabelecimento abre com botão 'Seguir' pronto.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">Conexão Wi-Fi Instantânea com 1 Toque</h5>
                      <p className="text-[11px] text-slate-400">O celular conecta na rede Wi-Fi sem o cliente ter que digitar senha complexa.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">Chave Pix ou WhatsApp de Atendimento</h5>
                      <p className="text-[11px] text-slate-400">Copia chave Pix direto ou abre o chat com mensagem pré-formatada.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-5 text-center space-y-2">
                    <Instagram className="w-8 h-8 text-pink-400 mx-auto" />
                    <span className="block text-xs font-black text-white">Tag Instagram</span>
                    <span className="block text-[10px] text-slate-400">+ Engajamento</span>
                  </div>
                  <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 text-center space-y-2">
                    <Wifi className="w-8 h-8 text-cyan-400 mx-auto" />
                    <span className="block text-xs font-black text-white">Tag Wi-Fi</span>
                    <span className="block text-[10px] text-slate-400">Conexão Rápida</span>
                  </div>
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
                    <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <span className="block text-xs font-black text-white">Tag WhatsApp</span>
                    <span className="block text-[10px] text-slate-400">Vendas Diretas</span>
                  </div>
                  <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 text-center space-y-2">
                    <Star className="w-8 h-8 text-amber-400 mx-auto" />
                    <span className="block text-xs font-black text-white">Tag Google 5★</span>
                    <span className="block text-[10px] text-slate-400">Reputação Top</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC QR */}
          {activeTechTab === 'qr' && (
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-full text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Nunca Mais Perca Material Impresso</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  QR Codes Dinâmicos em Nuvem com Redirecionamento em Tempo Real
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Diferente de um QR Code comum que fica fixo para sempre, o <strong>QR Dinâmico ALF Automação</strong> passa pelos nossos servidores de alta velocidade. Você pode alterar para onde ele aponta em 5 segundos direto pelo celular!
                </p>

                <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span><strong>Exemplo 1:</strong> De manhã, o QR aponta para o Google Avaliações.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span><strong>Exemplo 2:</strong> No fim de semana, você altera para o cardápio ou cupom no WhatsApp.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span><strong>Exemplo 3:</strong> Gestão de lotes físicos para distribuidores e revendedores.</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => onOpenLogin()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Gerenciar QR Codes no Painel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 max-w-sm">
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto shadow-xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      https://seu-dominio/r/empresa
                    </span>
                    <h5 className="text-sm font-bold text-white mt-2">Destino Alterável em Nuvem</h5>
                    <p className="text-xs text-slate-400 mt-1">Se o cliente trocar de endereço, telefone ou site, a placa continua funcionando 100%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SITES & MINI SITES (Totalmente condizente com o Ramo de Atuação & Visual Assets) */}
          {activeTechTab === 'sites' && (
            <div id="mini-sites" className={`mt-12 space-y-8 ${getAnimationClass()}`}>
              
              {/* Card principal com o modelo condizente */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10">
                <div className="lg:col-span-6 space-y-5 text-left">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: `${palette.glow}20`,
                      borderColor: `${palette.accent}50`,
                      color: palette.accent
                    }}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visual Específico: {visualProfile.name}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Landing Pages e Mini Sites Condizentes com o Ramo de Atuação
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    Cada setor exige uma linguagem visual exclusiva: um <strong className="text-emerald-400">supermercado</strong> precisa de produtos frescos e dinamismo de ofertas; uma <strong className="text-amber-400">oficina mecânica</strong> demanda imagens de elevadores hidráulicos e precisão técnica; uma clínica de <strong className="text-purple-400">estética</strong> requer elegância premium, paleta refinada e transições suaves de scroll.
                  </p>

                  {/* Badges de estilo e animação do nicho */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estilo de Animação</span>
                      <div className="flex items-center gap-1.5">
                        <Sparkle className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-white font-mono font-bold text-xs">{animation_style}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">GSAP ScrollTrigger &amp; transições adaptadas ao nicho.</p>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Paleta Hex Curada</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: palette.primary }} title={`Primary: ${palette.primary}`} />
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: palette.secondary }} title={`Secondary: ${palette.secondary}`} />
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: palette.accent }} title={`Accent: ${palette.accent}`} />
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: palette.darkBg }} title={`DarkBg: ${palette.darkBg}`} />
                        <span className="text-[11px] font-mono text-slate-300 font-bold ml-1">{palette.accent}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Cores hex harmônicas para alta conversão.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onOpenLogin('site_preview')}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
                    >
                      <span>Gerar Mini Site no Painel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">Exportação .ZIP e HTML único com 1 clique</span>
                  </div>
                </div>

                {/* Smartphone / Tablet Live Preview do Mini Site com a imagem e dados reais do nicho */}
                <div className="lg:col-span-6 flex justify-center">
                  <div
                    className="w-full max-w-md bg-slate-900 border-2 rounded-3xl p-4 shadow-2xl relative overflow-hidden transition-all duration-500"
                    style={{
                      borderColor: `${palette.accent}60`,
                      boxShadow: `0 25px 60px -15px ${palette.glow}40`
                    }}
                  >
                    {/* Top Device Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Preview Ao Vivo: {visualProfile.name}</span>
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${palette.accent}20`,
                          color: palette.accent
                        }}
                      >
                        {visualProfile.styleMode}
                      </span>
                    </div>

                    {/* Mini Site Mockup Screen */}
                    <div className="mt-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-left shadow-inner">
                      
                      {/* Hero Image do Nicho */}
                      <div className="relative h-44 w-full overflow-hidden group">
                        <img
                          src={visualProfile.images.hero}
                          alt={visualProfile.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent"
                        />
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md text-white shadow-md backdrop-blur-md"
                            style={{ backgroundColor: `${palette.secondary}e6` }}
                          >
                            5.0 ★ Google Maps
                          </span>
                        </div>

                        {/* Title over Hero */}
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider block"
                            style={{ color: palette.accent }}
                          >
                            {visualProfile.badges[0]}
                          </span>
                          <h4 className="text-base font-black text-white leading-tight mt-0.5 drop-shadow">
                            {visualProfile.name}
                          </h4>
                        </div>
                      </div>

                      {/* Mini Site Body Content */}
                      <div className="p-3.5 space-y-3">
                        {/* Gallery Thumbnails */}
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                            Galeria de Fotos do Segmento:
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {visualProfile.images.gallery.slice(0, 4).map((g, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveGalleryIndex(idx)}
                                className={`h-12 rounded-lg overflow-hidden border transition relative cursor-pointer ${
                                  activeGalleryIndex === idx
                                    ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                                    : 'border-slate-800 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={g.url}
                                  alt={g.title}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Services List Preview */}
                        <div className="space-y-1.5">
                          {visualProfile.defaultServices.slice(0, 2).map((srv, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-slate-900/80 border border-slate-800/80 p-2 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5 pr-2">
                                <span className="font-bold text-white block text-[11px] leading-tight">
                                  {srv.title}
                                </span>
                                <span className="text-[9px] text-slate-400 block line-clamp-1">
                                  {srv.description}
                                </span>
                              </div>
                              <span
                                className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: `${palette.glow}20`,
                                  color: palette.accent
                                }}
                              >
                                {srv.badge}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* CTA WhatsApp Button styled with niche colors */}
                        <a
                          href={`https://wa.me/5514999999999?text=Ol%C3%A1!%20Vim%20pelo%20Mini%20Site%20de%20${encodeURIComponent(visualProfile.name)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 text-slate-950 transition shadow-lg active:scale-95"
                          style={{
                            backgroundColor: palette.accent
                          }}
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>Falar no WhatsApp Agora</span>
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* CARD DESTRUTURADO: PROMPTS DE IMAGEM & VISUAL ASSETS DA IA */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-base font-black text-white">
                      Objeto Estruturado 'visual_assets' para {visualProfile.name}
                    </h4>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full w-fit"
                    style={{
                      backgroundColor: `${palette.glow}20`,
                      color: palette.accent,
                      border: `1px solid ${palette.accent}40`
                    }}
                  >
                    Estilo de Animação: {animation_style}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hero Prompt */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      image_prompts.hero (8K Commercial Photography)
                    </span>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{image_prompts.hero}"
                    </p>
                  </div>

                  {/* Showcase & Ambient Prompts */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      image_prompts.showcase &amp; ambient
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 line-clamp-2">
                        <strong>Showcase:</strong> "{image_prompts.showcase[0]}"
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 line-clamp-2">
                        <strong>Ambient:</strong> "{image_prompts.ambient}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hex Palette Swatches */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Paleta Hexadecimal Ativa:</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                      <span className="text-slate-400">primary:</span> <strong className="text-white">{palette.primary}</strong>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.secondary }} />
                      <span className="text-slate-400">secondary:</span> <strong className="text-white">{palette.secondary}</strong>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                      <span className="text-slate-400">accent:</span> <strong className="text-white">{palette.accent}</strong>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.glow }} />
                      <span className="text-slate-400">glow:</span> <strong className="text-white">{palette.glow}</strong>
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* INTERACTIVE ROI SIMULATOR SECTION */}
      <section id="simulador" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full">
            Calculadora de Impacto no Negócio Físico
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white mt-4">
            Quanto Mais a Sua Empresa Pode Faturar com o Google 5★?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Arraste a quantidade média de clientes que entram na sua loja ou consultório todos os dias:
          </p>

          <div className="mt-8 max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
              <span>Fluxo Diário:</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{dailyClients} clientes/dia</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={dailyClients}
              onChange={(e) => setDailyClients(Number(e.target.value))}
              className="w-full accent-cyan-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-bold">
              <span>5 clientes/dia</span>
              <span>100 clientes/dia</span>
              <span>200 clientes/dia</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Novas Avaliações 5★</span>
              <div className="text-3xl font-black text-amber-400 font-mono">+{estimatedMonthlyReviews} /mês</div>
              <p className="text-xs text-slate-500">Com apenas 20% dos clientes encostando o celular na placa NFC</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subida no Google Maps</span>
              <div className="text-3xl font-black text-cyan-400 font-mono">Top 3</div>
              <p className="text-xs text-slate-500">Mais visibilidade na busca local quando alguém pesquisa sua área</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Extra Estimado</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">R$ {estimatedRevenueGain.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-slate-500">Estimativa baseada em +{estimatedNewCustomers} novos clientes no mês</p>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={() => onOpenLogin()}
              className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition shadow-xl shadow-cyan-500/20 cursor-pointer"
            >
              Fazer Login no Painel e Ativar Minha Placa
            </button>
          </div>
        </div>
      </section>

      {/* PRICING TABLE SECTION */}
      <section id="precos" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
            Tabela Oficial de Soluções
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
            Investimento Acessível e Sem Letras Miúdas
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Escolha a solução ideal para acelerar seu ponto de venda físico ou sua presença na internet.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            
            {/* CARD 1: PLACA NFC */}
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800">
                  Mais Popular
                </span>
                <h3 className="text-xl font-black text-white mt-3">Placa NFC de Balcão</h3>
                <p className="text-xs text-slate-400 mt-1">Totem acrílico 10x10cm personalizado com chip NFC + QR Code.</p>
                
                <div className="mt-5">
                  <span className="text-3xl font-black text-white font-mono">R$ 129</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">/ unidade única</span>
                  <p className="text-[11px] text-amber-400 font-semibold mt-1">Condição especial: R$ 100 no pacote</p>
                </div>

                <div className="space-y-2.5 pt-5 text-xs text-slate-300 border-t border-slate-800 mt-5">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Totem Acrílico 10x10cm com base</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Chip NFC programado para Google 5★</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> QR Code Dinâmico em Nuvem</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Acesso ao Portal do Cliente</div>
                </div>
              </div>

              <button
                onClick={() => onOpenLogin()}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                Acessar Plataforma
              </button>
            </div>

            {/* CARD 2: COMBO COMPLETO (HIGHLIGHT) */}
            <div className="bg-linear-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/80 p-6 sm:p-8 rounded-3xl space-y-5 flex flex-col justify-between relative shadow-2xl shadow-cyan-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                ⭐ Melhor Custo-Benefício
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                  Combo Completo
                </span>
                <h3 className="text-xl font-black text-white mt-3">Placa NFC + Site Pro</h3>
                <p className="text-xs text-slate-400 mt-1">A solução definitiva: o cliente avalia na loja e te acha na internet.</p>
                
                <div className="mt-5">
                  <span className="text-3xl font-black text-cyan-400 font-mono">R$ 1.300</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">/ projeto</span>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">Economia de R$ 329 em relação ao avulso</p>
                </div>

                <div className="space-y-2.5 pt-5 text-xs text-slate-200 border-t border-slate-800 mt-5">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> 1 Placa Acrílica NFC Personalizada</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Criação de Site Institucional sob Medida</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Mini Site com Botão WhatsApp e Pix</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Redirecionamento em Nuvem Ativo</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Suporte e Atualizações Rápidas</div>
                </div>
              </div>

              <button
                onClick={() => onOpenLogin()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Entrar e Contratar Combo
              </button>
            </div>

            {/* CARD 3: SITE PROFISSIONAL */}
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                  Presença Web
                </span>
                <h3 className="text-xl font-black text-white mt-3">Site Institucional</h3>
                <p className="text-xs text-slate-400 mt-1">Site veloz, moderno e responsivo para rankear no Google da cidade.</p>
                
                <div className="mt-5">
                  <span className="text-3xl font-black text-white font-mono">R$ 1.500</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">/ projeto avulso</span>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Entrega rápida com código limpo</p>
                </div>

                <div className="space-y-2.5 pt-5 text-xs text-slate-300 border-t border-slate-800 mt-5">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Design moderno e profissional</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Integração com WhatsApp e Mapas</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Otimização SEO para cidade/bairro</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Exportação de arquivos (.ZIP) inclusa</div>
                </div>
              </div>

              <button
                onClick={() => onOpenLogin()}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                Acessar Plataforma
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-black flex items-center justify-center text-xs">
              ALF
            </div>
            <div>
              <span className="font-bold text-white text-sm">ALF Automação</span>
              <p className="text-[11px] text-slate-500">Tecnologia Inteligente para Crescimento de Negócios Locais</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#solucoes" className="hover:text-white transition">Soluções</a>
            <a href="#placa-nfc" className="hover:text-white transition">Placa NFC</a>
            <a href="#simulador" className="hover:text-white transition">Simulador</a>
            <button
              onClick={() => onOpenLogin()}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login do Sistema</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            © 2026 ALF Automação. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};
