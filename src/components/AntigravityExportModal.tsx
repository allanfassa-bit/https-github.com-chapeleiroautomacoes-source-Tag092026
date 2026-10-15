import React, { useState } from 'react';
import {
  Download,
  X,
  Check,
  Copy,
  Terminal,
  FileCode,
  FolderArchive,
  ArrowRight,
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';

interface AntigravityExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AntigravityExportModal: React.FC<AntigravityExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  const handleDownloadZip = () => {
    setIsDownloading(true);
    // Trigger download
    const link = document.createElement('a');
    link.href = '/api/export/zip';
    link.download = 'alf-automacao-gmb.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-base font-bold text-slate-900 tracking-tight">
                Exportar Projeto para Antigravity &amp; IDEs
              </h2>
              <p className="text-xs text-slate-500">
                Baixe o código-fonte completo e execute localmente, no Antigravity, Cursor ou Render
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Main Download Callout */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900">Arquivo Completo .ZIP</span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs text-slate-500">Full-Stack (Vite, React, Express, TS)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contém todos os componentes, o servidor de banco em memória, geradores de arte 10x10, IA e configurações de deploy.
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition shadow-xs cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Gerando .ZIP...' : 'Baixar alf-automacao-gmb.zip'}</span>
            </button>
          </div>

          {/* Workflow Steps for Antigravity & Local Development */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Como importar e rodar no Antigravity ou na sua máquina
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Extrair a pasta do projeto</p>
                  <p className="text-xs text-slate-600">
                    Descompacte o arquivo <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">alf-automacao-gmb.zip</code> em uma pasta de sua preferência.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">Instalar dependências e iniciar</p>
                    <button
                      onClick={() => copyToClipboard('npm install && npm run dev', 'cmd-dev')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      {copiedCommand === 'cmd-dev' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 font-mono text-xs px-3 py-2 rounded-lg flex items-center justify-between">
                    <code>npm install &amp;&amp; npm run dev</code>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    O servidor sobe em <code className="font-mono text-slate-700">http://localhost:3000</code> com Express e Vite integrados.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Uso no Antigravity (Google Cloud / Workspace)</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No Antigravity, abra a pasta como seu workspace de trabalho. Os arquivos <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">server.ts</code> e <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">src/</code> contêm toda a lógica de inteligência, geração de páginas, templates e integrações.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">Deploy Contínuo no Render &amp; GitHub</p>
                    <button
                      onClick={() => copyToClipboard('git init && git add . && git commit -m "feat: initial commit" && git branch -M main', 'cmd-git')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      {copiedCommand === 'cmd-git' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar comandos Git</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O projeto já inclui o arquivo <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">render.yaml</code> configurado. Basta fazer o push para o seu repositório GitHub vinculado ao Render.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-800">Estrutura incluída no pacote:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-800">server.ts</strong>: Gateway de redirecionamento e APIs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-800">src/components</strong>: Placas 10x10, CRM e Mini-Sites</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-800">render.yaml</strong>: Blueprint pronto para produção</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-800">Tailwind + Vite</strong>: Build de alta performance</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Exportação em tempo real gerada pelo servidor
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar ZIP Agora</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
