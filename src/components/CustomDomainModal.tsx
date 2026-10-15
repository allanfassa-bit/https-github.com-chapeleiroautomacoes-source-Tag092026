import React, { useState } from 'react';
import {
  Globe,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  QrCode,
  Smartphone
} from 'lucide-react';
import {
  getCustomPublicDomain,
  setCustomPublicDomain,
  getPublicAppOrigin
} from '../utils/publicUrlHelper';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDomainSaved?: (domain: string) => void;
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  isOpen,
  onClose,
  onDomainSaved
}) => {
  const currentDomain = getCustomPublicDomain();
  const [domainInput, setDomainInput] = useState<string>(currentDomain || '');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(key);
    setTimeout(() => setIsCopied(null), 2500);
  };

  const handleSave = () => {
    const cleaned = domainInput.trim();
    setCustomPublicDomain(cleaned);
    setSaveSuccess(true);
    if (onDomainSaved) {
      onDomainSaved(cleaned);
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  const handleRemove = () => {
    setCustomPublicDomain('');
    setDomainInput('');
    setSaveSuccess(true);
    if (onDomainSaved) {
      onDomainSaved('');
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestDomain = async () => {
    if (!domainInput.trim()) {
      setTestResult({ ok: false, message: 'Digite um domínio para testar.' });
      return;
    }

    let url = domainInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test basic URL format
      new URL(url);
      setTestResult({
        ok: true,
        message: `Domínio formatado corretamente (${url}). Certifique-se de que os registros DNS já foram apontados na sua registradora (ex: Registro.br, Cloudflare, Hostinger).`
      });
    } catch {
      setTestResult({
        ok: false,
        message: 'Formato de URL inválido. Exemplo correto: https://link.meunegocio.com.br'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sampleShortUrl = `${domainInput.trim() ? (domainInput.trim().startsWith('http') ? domainInput.trim() : `https://${domainInput.trim()}`) : getPublicAppOrigin()}/r/empresa01`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Configuração de Domínio Próprio
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  White Label
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Aponte seu domínio para as placas NFC, QR codes e painel da sua marca.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs">
          
          {/* Explanation Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Para que serve o Domínio Próprio nas Placas NFC?</span>
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Quando você grava um chip NFC ou imprime um QR Code na placa acrílica, o link gravado será 
              <strong className="font-mono text-blue-950"> https://seu-dominio.com.br/r/[id]</strong>.
              Isso transmite 100% de autoridade e profissionalismo para seus clientes e parceiros!
            </p>
          </div>

          {/* Form Input */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              Seu Domínio ou Subdomínio:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Ex: https://link.alfautomacao.com.br ou https://minhaagencia.com.br"
                className="flex-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 transition shadow-inner font-mono text-slate-800"
              />
              <button
                type="button"
                onClick={handleTestDomain}
                disabled={isTesting}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Validar'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Dica: Você pode usar seu domínio principal (<code className="font-mono text-slate-600">https://suaempresa.com.br</code>) ou um subdomínio dedicado (<code className="font-mono text-slate-600">https://link.suaempresa.com.br</code> ou <code className="font-mono text-slate-600">https://nfc.suaempresa.com.br</code>).
            </p>
          </div>

          {/* Validation Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="text-[11px] font-medium leading-relaxed">
                {testResult.message}
              </span>
            </div>
          )}

          {/* Real-time Preview of Generated Links */}
          <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                Como os Links das Placas NFC Serão Gerados:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(sampleShortUrl, 'sample')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {isCopied === 'sample' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied === 'sample' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all">
              {sampleShortUrl}
            </div>
          </div>

          {/* DNS Instructions Guide */}
          <div className="space-y-2.5 pt-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Instruções de Apontamento DNS (Na sua Registradora / Provedor)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                <strong className="text-slate-800 block text-xs">Opção 1: Subdomínio (Recomendado)</strong>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Crie um registro <strong>CNAME</strong> na sua hospedagem (Registro.br, Cloudflare, Hostinger):
                </p>
                <div className="bg-white border border-slate-200 p-2 rounded-lg font-mono text-[10px] text-slate-700">
                  <div><strong>Tipo:</strong> CNAME</div>
                  <div><strong>Nome/Host:</strong> link (ou nfc)</div>
                  <div><strong>Destino:</strong> {window.location.host}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                <strong className="text-slate-800 block text-xs">Opção 2: Hospedagem Completa</strong>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Se você fizer deploy do código (.ZIP) na Vercel, Netlify ou VPS:
                </p>
                <div className="bg-white border border-slate-200 p-2 rounded-lg font-mono text-[10px] text-slate-700">
                  <div>Adicione seu domínio nas configurações do projeto (ex: Vercel Domains) e aponte os Nameservers indicados.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div>
            {currentDomain ? (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
              >
                Remover Domínio Customizado (Voltar ao Padrão)
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">
                Domínio atual: <strong className="text-slate-700 font-mono">{getPublicAppOrigin()}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-white" />
                  <span>Salvar Domínio</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
