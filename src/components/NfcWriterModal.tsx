import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Radio,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { getDynamicQrUrl } from '../utils/publicUrlHelper';

interface NfcWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  customUrl?: string;
}

export const NfcWriterModal: React.FC<NfcWriterModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName,
  customUrl
}) => {
  const [status, setStatus] = useState<'idle' | 'waiting_tap' | 'success' | 'error' | 'unsupported'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isWebNfcSupported, setIsWebNfcSupported] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const targetUrl = customUrl || getDynamicQrUrl(leadId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'NDEFReader' in window;
      setIsWebNfcSupported(supported);
      if (!supported) {
        setStatus('unsupported');
      } else {
        setStatus('idle');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-indigo-500/80 rounded-2xl shadow-2xl p-3 flex items-center gap-3 text-white animate-in slide-in-from-bottom-5 duration-200">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="min-w-0 max-w-[180px] sm:max-w-xs">
          <p className="text-xs font-black truncate">Gravador NFC: {leadName}</p>
          <p className="text-[10px] text-indigo-300 font-mono truncate">ID: {leadId}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Restaurar / Maximizar Gravador NFC"
            aria-label="Restaurar Gravador NFC"
          >
            <Maximize2 className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              onClose();
            }}
            className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar Gravador NFC"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleStartWrite = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('unsupported');
      return;
    }

    try {
      setStatus('waiting_tap');
      setErrorMessage('');

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      // Initiate Web NFC write
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: targetUrl
          }
        ]
      });

      // Haptic feedback if available on device
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (_) {}
      }

      setStatus('success');
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Permissão para uso do sensor NFC foi negada no navegador. Permita o acesso ao sensor nas configurações do Chrome.');
      } else if (err.name === 'NotSupportedError') {
        setErrorMessage('A tag aproximada não é compatível com o formato NDEF ou está bloqueada contra regravação.');
      } else {
        setErrorMessage(err.message || 'Falha ao gravar na tag NFC. Verifique se o NFC do celular está ligado.');
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/50 shrink-0">
                  Gravador Web NFC
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{leadId}</span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5 truncate max-w-[280px]">
                {leadName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Minimizar janela"
              aria-label="Minimizar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Minimizar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-xl font-black text-xs transition cursor-pointer active:scale-95 group"
              title="Fechar janela (Esc ou clique fora)"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target URL Preview */}
          <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              URL Dinâmica que será gravada na Tag:
            </span>
            <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-xs font-mono font-bold text-cyan-400 truncate">
                {targetUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                title="Copiar Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              ⚡ Esta URL é permanente. Você grava o chip NFC uma única vez e altera o destino depois no painel.
            </p>
          </div>

          {/* STATE: WAITING FOR TAP (RADAR ANIMATION) */}
          {status === 'waiting_tap' && (
            <div className="py-8 px-4 text-center space-y-5 bg-gradient-to-b from-cyan-950/20 to-transparent border border-cyan-500/20 rounded-3xl animate-in zoom-in-95">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-cyan-500/20 animate-ping absolute"></div>
                <div className="w-20 h-20 rounded-full bg-cyan-500/30 animate-pulse absolute"></div>
                <div className="w-16 h-16 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center relative shadow-lg shadow-cyan-500/50">
                  <Smartphone className="w-8 h-8 animate-bounce" />
                </div>
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-lg font-black text-cyan-300">
                  Encoste a Tag NFC agora!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aproxime a tag ou chaveiro NFC da parte traseira do seu celular Android até sentir a vibração de confirmação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Cancelar gravação
              </button>
            </div>
          )}

          {/* STATE: SUCCESS */}
          {status === 'success' && (
            <div className="py-8 px-4 text-center space-y-4 bg-emerald-950/20 border border-emerald-500/30 rounded-3xl animate-in zoom-in-95">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-400">
                  Tag Gravada com Sucesso!
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  A tag NFC agora direciona diretamente para o link dinâmico de <strong>{leadName}</strong>. Pode testar encostando qualquer celular!
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleStartWrite}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gravar Outra Tag</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {status === 'error' && (
            <div className="p-5 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-red-300">Falha na gravação NFC</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartWrite}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* STATE: IDLE (Android Chrome Supported) */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Navegador Compatível com Web NFC</h4>
                  <p className="text-[11px] text-slate-400">
                    O Google Chrome no Android pode gravar diretamente na sua tag física sem nenhum aplicativo adicional.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartWrite}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Iniciar Gravação na Tag (Encostar Celular)</span>
              </button>
            </div>
          )}

          {/* STATE: UNSUPPORTED (iPhone, Mac, PC, or Non-Chrome) */}
          {status === 'unsupported' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300">
                    Gravação Direta Web NFC Requer Google Chrome no Android
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Você está em um computador ou iPhone (iOS). A Apple bloqueia a gravação de NFC direto por páginas web por política de segurança. 
                  </p>
                </div>
              </div>

              {/* Step-by-step for NFC Tools (free app for iOS & Android) */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Como gravar no iPhone ou com o App NFC Tools (30 segundos):
                </span>

                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed font-medium">
                  <li>
                    Clique no botão <strong className="text-cyan-400">"Copiar Link"</strong> abaixo.
                  </li>
                  <li>
                    Abra o app gratuito <strong className="text-white">NFC Tools</strong> no seu celular (App Store ou Play Store).
                  </li>
                  <li>
                    Toque na aba <strong className="text-white">Escrever</strong> &gt; <strong className="text-white">Adicionar um registro</strong>.
                  </li>
                  <li>
                    Escolha <strong className="text-white">URL / Link</strong> e cole a URL copiada.
                  </li>
                  <li>
                    Toque em <strong className="text-white">Escrever / Aproximar</strong> e encoste a tag no topo do celular!
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Link Permanente Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-950" />
                        <span>Copiar Link para o NFC Tools</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <span>Compatível com chips NTAG213, NTAG215 e NTAG216</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
