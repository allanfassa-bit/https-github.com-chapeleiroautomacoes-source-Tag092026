import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Copy,
  ExternalLink,
  Check,
  Globe,
  Server,
  Zap,
  Shield,
  HelpCircle,
  X,
  Sparkles,
  Phone,
  FileArchive,
  ArrowRight,
  Smartphone,
  Radio,
  Wifi
} from 'lucide-react';
import {
  SiteTemplateData,
  ExportLeadData,
  downloadClientSiteZip,
  downloadSingleHtml,
  openLiveSitePreview,
  copyHtmlToClipboard
} from '../utils/siteExporter';
import {
  downloadMiniSiteHtml,
  downloadMiniSiteZip,
  openMiniSiteLivePreview,
  copyMiniSiteHtmlToClipboard,
  MiniSiteConfig
} from '../utils/miniSiteExporter';
import {
  downloadVercelClientZip,
  getClientVercelUrl,
  generateVercelClientPitchWhatsapp,
  cleanClientSlug
} from '../utils/vercelMiniSiteExporter';

interface ExportSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteTemplate: SiteTemplateData | null;
  lead: ExportLeadData | null;
  theme?: 'clean' | 'dark' | 'vibrant';
}

export const ExportSiteModal: React.FC<ExportSiteModalProps> = ({
  isOpen,
  onClose,
  siteTemplate,
  lead,
  theme = 'clean'
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'minisite' | 'guide_vercel' | 'guide_netlify' | 'guide_cpanel' | 'pricing'>('guide_vercel');
  const [customWhatsapp, setCustomWhatsapp] = useState(lead?.phone || '');
  const [customVercelDomain, setCustomVercelDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedMiniLink, setCopiedMiniLink] = useState(false);
  const [copiedMiniHtml, setCopiedMiniHtml] = useState(false);
  const [copiedVercelLink, setCopiedVercelLink] = useState(false);
  const [copiedVercelPitch, setCopiedVercelPitch] = useState(false);
  const [copiedVercelCli, setCopiedVercelCli] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isZippingMini, setIsZippingMini] = useState(false);
  const [isZippingVercel, setIsZippingVercel] = useState(false);

  if (!isOpen || !siteTemplate || !lead) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadClientSiteZip(siteTemplate, lead, {
        theme,
        customWhatsapp
      });
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadSingleHtml(siteTemplate, lead, {
      theme,
      customWhatsapp
    });
  };

  const handlePreviewNewTab = () => {
    openLiveSitePreview(siteTemplate, lead, {
      theme,
      customWhatsapp
    });
  };

  const handleCopyCode = async () => {
    const success = await copyHtmlToClipboard(siteTemplate, lead, {
      theme,
      customWhatsapp
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const cleanDomain = lead.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Central de Exportação & Hospedagem</h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Pronto para Produção
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gere os arquivos do site para <strong className="text-white font-bold">{lead.name}</strong> e coloque no ar em minutos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'download'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Landing Page (ZIP / HTML)
          </button>

          <button
            onClick={() => setActiveTab('guide_vercel')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'guide_vercel'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="font-mono font-black text-slate-950 text-xs">▲</span>
            Hospedar na Vercel (Cada Cliente)
            <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md bg-slate-950 text-white">
              Novo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('minisite')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'minisite'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-sky-500" />
            Mini Site (Link-in-Bio &amp; NFC)
          </button>

          <button
            onClick={() => setActiveTab('guide_netlify')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'guide_netlify'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Netlify Drop (Grátis • 30 Seg)
          </button>

          <button
            onClick={() => setActiveTab('guide_cpanel')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'guide_cpanel'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            cPanel / Hostinger / Hostgator
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            Como Monetizar Hospedagem
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Config Bar */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Telefone nos Botões do Site</span>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <input
                  type="text"
                  value={customWhatsapp}
                  onChange={(e) => setCustomWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 w-44 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block">Sugestão de Domínio:</span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                www.{cleanDomain}.com.br
              </span>
            </div>
          </div>

          {activeTab === 'download' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. ZIP Bundle Download */}
                <div className="bg-white border-2 border-blue-500/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                    Mais Completo
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileArchive className="h-5 w-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Pacote ZIP Completo de Hospedagem</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Contém toda a estrutura: <code className="text-blue-700 font-bold">index.html</code>, pasta <code className="text-blue-700 font-bold">/css</code>, pasta <code className="text-blue-700 font-bold">/js</code>, ícone <code className="text-blue-700 font-bold">favicon.svg</code> e manual passo a passo.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {isZipping ? (
                      <span className="animate-pulse">Compactando arquivos...</span>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Baixar ZIP de Hospedagem</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Standalone HTML File */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Arquivo Único Autônomo (index.html)</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tudo embutido em um único arquivo super leve (CSS + JS + HTML integrados). Abre com 2 cliques em qualquer computador ou navegador sem instalar nada.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadHtml}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar index.html Único</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row: Copy and Fullscreen Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePreviewNewTab}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                  <span>Ver Site em Tela Cheia (Nova Aba)</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Código Copiado para a Área de Transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>Copiar Código Fonte HTML</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informative footer */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pronto para Qualquer Hospedagem</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Os arquivos gerados são compatíveis com 100% dos servidores mundiais: Vercel, Netlify, Cloudflare Pages, GitHub Pages, Hostinger, cPanel, Apache, Nginx, Hostgator, Locaweb e WordPress.
                </p>
              </div>

            </div>
          )}

          {activeTab === 'minisite' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-sky-950">Mini Site Hub &amp; Link-in-Bio para Placas NFC</h4>
                  <p className="text-sky-800 mt-1 leading-relaxed">
                    Página ultraleve autônoma com botões inteligentes: <strong>WhatsApp direto, Pix (com cópia automática da chave), Wi-Fi 1-clique (sem digitar senha), Instagram e Avaliação 5 Estrelas no Google</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Standalone minisite.html */}
                <div className="bg-white border-2 border-sky-500/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Arquivo Único Autônomo (minisite.html)</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Código completo embutido (CSS, SVG e JS). Funciona offline ou online em qualquer navegador sem necessidade de banco de dados.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const miniConfig: MiniSiteConfig = {
                        companyName: lead.name,
                        city: lead.city,
                        niche: lead.niche,
                        phone: customWhatsapp || lead.phone,
                        whatsappNumber: customWhatsapp || lead.phone,
                        googleReviewUrl: lead.googleMapsUrl || 'https://maps.google.com',
                        theme: 'dark_neon',
                        pixBeneficiary: lead.name,
                        pixKey: customWhatsapp ? customWhatsapp.replace(/\D/g, '') : 'pix@empresa.com.br'
                      };
                      downloadMiniSiteHtml(miniConfig);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar minisite.html</span>
                  </button>
                </div>

                {/* 2. Full ZIP with README */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileArchive className="h-5 w-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Pacote ZIP Completo com Instruções</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Contém index.html do Mini Site pronto para subir no Netlify Drop em 30 segundos, com manual de publicação.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      setIsZippingMini(true);
                      try {
                        const miniConfig: MiniSiteConfig = {
                          companyName: lead.name,
                          city: lead.city,
                          niche: lead.niche,
                          phone: customWhatsapp || lead.phone,
                          whatsappNumber: customWhatsapp || lead.phone,
                          googleReviewUrl: lead.googleMapsUrl || 'https://maps.google.com',
                          theme: 'dark_neon',
                          pixBeneficiary: lead.name,
                          pixKey: customWhatsapp ? customWhatsapp.replace(/\D/g, '') : 'pix@empresa.com.br'
                        };
                        await downloadMiniSiteZip(miniConfig);
                      } finally {
                        setIsZippingMini(false);
                      }
                    }}
                    disabled={isZippingMini}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isZippingMini ? 'Compactando...' : 'Baixar ZIP do Mini Site'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Preview and Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const miniConfig: MiniSiteConfig = {
                      companyName: lead.name,
                      city: lead.city,
                      niche: lead.niche,
                      phone: customWhatsapp || lead.phone,
                      whatsappNumber: customWhatsapp || lead.phone,
                      googleReviewUrl: lead.googleMapsUrl || 'https://maps.google.com',
                      theme: 'dark_neon',
                      pixBeneficiary: lead.name,
                      pixKey: customWhatsapp ? customWhatsapp.replace(/\D/g, '') : 'pix@empresa.com.br'
                    };
                    openMiniSiteLivePreview(miniConfig);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-sky-600" />
                  <span>Abrir Prévia do Mini Site</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const miniConfig: MiniSiteConfig = {
                      companyName: lead.name,
                      city: lead.city,
                      niche: lead.niche,
                      phone: customWhatsapp || lead.phone,
                      whatsappNumber: customWhatsapp || lead.phone,
                      googleReviewUrl: lead.googleMapsUrl || 'https://maps.google.com',
                      theme: 'dark_neon',
                      pixBeneficiary: lead.name,
                      pixKey: customWhatsapp ? customWhatsapp.replace(/\D/g, '') : 'pix@empresa.com.br'
                    };
                    const ok = await copyMiniSiteHtmlToClipboard(miniConfig);
                    if (ok) {
                      setCopiedMiniHtml(true);
                      setTimeout(() => setCopiedMiniHtml(false), 2500);
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copiedMiniHtml ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">HTML do Mini Site Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-600" />
                      <span>Copiar Código HTML</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide_vercel' && (
            <div className="space-y-5">
              {/* Vercel Header Banner */}
              <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 font-mono font-black text-base">
                    ▲
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm">Hospedagem Vercel para {lead.name}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Zero Custo • SSL Automático
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      Publique um link exclusivo para este cliente cadastrado na Vercel. Ideal para entregar aos clientes com alta velocidade de carregamento (menos de 0.8s) e sem custos de servidor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vercel Client Link Configuration Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Link Vercel do Cliente ({lead.name})
                </span>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={customVercelDomain || getClientVercelUrl(lead.name)}
                      onChange={(e) => setCustomVercelDomain(e.target.value)}
                      placeholder={`https://${cleanClientSlug(lead.name)}.vercel.app`}
                      className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const url = customVercelDomain || getClientVercelUrl(lead.name);
                      await navigator.clipboard.writeText(url);
                      setCopiedVercelLink(true);
                      setTimeout(() => setCopiedVercelLink(false), 2500);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedVercelLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={customVercelDomain || getClientVercelUrl(lead.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Testar Link</span>
                  </a>
                </div>

                <p className="text-[11px] text-slate-500">
                  Dica: Você pode usar o link padrão da Vercel (<code className="text-slate-800 font-bold">{cleanClientSlug(lead.name)}.vercel.app</code>) ou configurar domínio próprio do cliente (ex: <code className="text-slate-800 font-bold">link.{cleanDomain}.com.br</code>).
                </p>
              </div>

              {/* Action Buttons: ZIP Package & Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Download Vercel ZIP */}
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-slate-900">▲</span>
                      <strong className="text-xs font-black text-slate-900">Pacote Vercel Completo (ZIP)</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Contém: <code className="text-slate-900 font-bold">index.html</code>, <code className="text-slate-900 font-bold">vercel.json</code>, <code className="text-slate-900 font-bold">package.json</code> e manual.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsZippingVercel(true);
                      try {
                        const miniConfig: MiniSiteConfig = {
                          companyName: lead.name,
                          city: lead.city,
                          niche: lead.niche,
                          phone: customWhatsapp || lead.phone,
                          whatsappNumber: customWhatsapp || lead.phone,
                          googleReviewUrl: lead.googleMapsUrl || 'https://maps.google.com',
                          theme: 'dark_neon',
                          pixBeneficiary: lead.name,
                          pixKey: customWhatsapp ? customWhatsapp.replace(/\D/g, '') : 'pix@empresa.com.br'
                        };
                        const targetUrl = customVercelDomain || getClientVercelUrl(lead.name);
                        await downloadVercelClientZip(miniConfig, targetUrl);
                      } finally {
                        setIsZippingVercel(false);
                      }
                    }}
                    disabled={isZippingVercel}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isZippingVercel ? (
                      <span className="animate-pulse">Preparando Pacote Vercel...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Baixar Pacote Vercel (ZIP)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Copy Pitch WhatsApp */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <strong className="text-xs font-black text-slate-900">Mensagem de Entrega no WhatsApp</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Texto persuasivo pronto para enviar ao cliente com o link ativo da Vercel e instruções das placas NFC.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const targetUrl = customVercelDomain || getClientVercelUrl(lead.name);
                      const pitch = generateVercelClientPitchWhatsapp(lead.name, targetUrl, lead.niche);
                      await navigator.clipboard.writeText(pitch);
                      setCopiedVercelPitch(true);
                      setTimeout(() => setCopiedVercelPitch(false), 2500);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    {copiedVercelPitch ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Mensagem Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Mensagem WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step-by-Step Vercel Guide */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Passo a Passo de Publicação na Vercel (Gratuito)
                </span>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">$</span>
                    <span className="text-emerald-400 font-bold">npx vercel --prod</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText('npx vercel --prod');
                      setCopiedVercelCli(true);
                      setTimeout(() => setCopiedVercelCli(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-sans font-bold transition cursor-pointer"
                  >
                    {copiedVercelCli ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">1</span>
                    <strong className="block text-slate-900 font-bold">Descompacte o ZIP</strong>
                    <p className="text-[11px] text-slate-500">Baixe o pacote acima e extraia os arquivos na sua máquina ou no GitHub.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">2</span>
                    <strong className="block text-slate-900 font-bold">Deploy com 1 Linha</strong>
                    <p className="text-[11px] text-slate-500">Abra o terminal na pasta e digite <code>npx vercel --prod</code> ou suba no dashboard da Vercel.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">3</span>
                    <strong className="block text-slate-900 font-bold">Pronto para o Cliente</strong>
                    <p className="text-[11px] text-slate-500">O link ganha SSL automático e pode ser gravado nas Placas NFC ou colocado no Instagram.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide_netlify' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <Zap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-emerald-950">Método mais Fácil e 100% Gratuito (30 Segundos)</h4>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    Você não precisa de servidor pago para colocar o site do cliente online. O Netlify Drop hospeda de graça com certificado SSL automático (cadeado verde).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">Baixe o ZIP ou o index.html</p>
                    <p className="text-slate-500 text-[11px]">Clique em "Baixar ZIP de Hospedagem" e descompacte a pasta no seu computador.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">Acesse o Netlify Drop</p>
                    <p className="text-slate-500 text-[11px]">
                      Abra o site <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">app.netlify.com/drop</a> no seu navegador.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">Arraste e Solte a Pasta</p>
                    <p className="text-slate-500 text-[11px]">Basta arrastar a pasta descompactada para a tela. Em 5 segundos o site ganha um link público seguro.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">Conecte o Domínio do Cliente</p>
                    <p className="text-slate-500 text-[11px]">
                      No painel da Netlify, clique em <strong>"Domain Settings" &gt; "Add custom domain"</strong> e digite o domínio do cliente (ex: <code className="text-blue-600">www.{cleanDomain}.com.br</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide_cpanel' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-start gap-3">
                <Server className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-blue-950">Hospedagens Tradicionais (cPanel, Hostinger, Hostgator, Locaweb)</h4>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    Caso o cliente já tenha uma hospedagem contratada, o processo leva apenas 1 minuto pelo Gerenciador de Arquivos.
                  </p>
                </div>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs text-slate-700">
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Faça login no painel</strong> da hospedagem do cliente (cPanel, hPanel da Hostinger, etc.).
                </li>
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  Abra a ferramenta <strong>"Gerenciador de Arquivos" (File Manager)</strong>.
                </li>
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  Navegue até o diretório <strong>public_html</strong> (pasta raiz do site).
                </li>
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  Faça o upload do arquivo <strong>ZIP</strong> baixado e clique com o botão direito em <strong>"Extract" (Extrair)</strong>.
                </li>
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  Confirme que o arquivo <code>index.html</code> está na raiz da pasta <code>public_html</code>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  Modelo de Receita Recorrente (MRR)
                </h4>
                <p className="text-emerald-800 leading-relaxed">
                  Não venda apenas a criação do site uma única vez! Venda a solução com <strong>manutenção mensal e hospedagem gerenciada</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Criação & Configuração</span>
                  <span className="text-lg font-black text-slate-900 block">R$ 500 a R$ 1.500</span>
                  <p className="text-[10px] text-slate-500">Taxa única pela personalização e entrega inicial.</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">Hospedagem & Suporte</span>
                  <span className="text-lg font-black text-blue-700 block">R$ 97 a R$ 197 /mês</span>
                  <p className="text-[10px] text-blue-600">Recorrência garantida para o seu fluxo de caixa.</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-purple-600 block">Combo Totem NFC + Site</span>
                  <span className="text-lg font-black text-purple-700 block">R$ 1.990 + Mensalidade</span>
                  <p className="text-[10px] text-purple-600">A solução mais lucrativa com totem físico acrílico.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Arquivos compatíveis com mobile, desktop e tablets.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
