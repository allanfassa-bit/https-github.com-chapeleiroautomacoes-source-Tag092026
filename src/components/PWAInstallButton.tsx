import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, X, Smartphone, ArrowUpFromLine, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone app, do not display the prompt
  if (isInstalled) {
    return null;
  }

  // Android, Chrome, and PC Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        id="pwa-install-btn-android"
        className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-900/20 hover:bg-cyan-500 hover:shadow-cyan-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instalar no Celular</span>
      </button>
    );
  }

  // iOS Safari flow (Apple Safari does not support beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-btn-ios"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600/10 border border-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">Instalar no iPhone / iPad</h3>
                    <p className="text-xs text-slate-400">Adicione à tela de início para usar em tela cheia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4 rounded-xl bg-slate-950 p-4 border border-slate-800/60 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-800">
                    <ArrowUpFromLine className="w-4 h-4" />
                  </div>
                  <p>1. Toque no botão de <strong>Compartilhar</strong> na barra do Safari.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-800">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <p>2. Role a lista para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-750 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
