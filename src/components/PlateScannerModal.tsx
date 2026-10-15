import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ScanLine,
  Camera,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Save,
  X,
  Building2,
  QrCode,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { Lead } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { getDynamicQrUrl, getTestRedirectUrl } from '../utils/publicUrlHelper';
import { getPlateIdentification, fromRomanNumeral } from '../utils/plateNumberHelper';

interface PlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onPlateUpdated?: (updatedLead: Lead) => void;
}

export function PlateScannerModal({
  isOpen,
  onClose,
  leads,
  onPlateUpdated
}: PlateScannerModalProps) {
  const [query, setQuery] = useState('');
  const [selectedPlate, setSelectedPlate] = useState<Lead | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [matchedPlates, setMatchedPlates] = useState<Lead[]>([]);
  
  // Binding / Sale Form state
  const [isBinding, setIsBinding] = useState(false);
  const [bindName, setBindName] = useState('');
  const [bindUrl, setBindUrl] = useState('');
  const [bindNiche, setBindNiche] = useState('');
  const [bindCity, setBindCity] = useState('');
  const [bindPhone, setBindPhone] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedPlate(null);
      setIsSearched(false);
      setMatchedPlates([]);
      setSaveSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Real-time lookup helper
  const findMatches = (searchTerm: string): Lead[] => {
    if (!searchTerm || !searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();

    // 1. Direct match by ID
    const exactId = leads.filter(l => l.id.toLowerCase() === term);
    if (exactId.length > 0) return exactId;

    // 2. Extracted ID from URL (/r/:id, /qr/:id, etc.)
    const urlMatch = term.match(/\/(r|qr|p|nfc|tag|l|m|redirect)\/([a-zA-Z0-9_\-]+)/i);
    if (urlMatch && urlMatch[2]) {
      const extracted = urlMatch[2].toLowerCase();
      const byUrl = leads.filter(l => 
        l.id.toLowerCase() === extracted || 
        l.id.toLowerCase().replace(/_/g, '') === extracted.replace(/_/g, '')
      );
      if (byUrl.length > 0) return byUrl;
    }

    // 3. Numeric & Roman numeral match (e.g. "08", "8", "VIII", "IV")
    let targetNum: number | null = null;
    const numOnly = term.match(/\d+/);
    if (numOnly) {
      targetNum = parseInt(numOnly[0], 10);
    } else {
      const romanVal = fromRomanNumeral(term);
      if (romanVal) targetNum = romanVal;
    }

    let byNum: Lead[] = [];
    if (targetNum !== null) {
      byNum = leads.filter(l => {
        const pInfo = getPlateIdentification(l.id, l.name);
        return pInfo.num === targetNum;
      });
    }

    // 4. Substring match across ID, Name, Google Maps URL
    const byText = leads.filter(l => 
      l.id.toLowerCase().includes(term) ||
      (l.name && l.name.toLowerCase().includes(term)) ||
      (l.googleMapsUrl && l.googleMapsUrl.toLowerCase().includes(term))
    );

    const merged = [...exactId, ...byNum, ...byText];
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    return unique;
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setSaveSuccess(false);
    setErrorMessage('');
    if (!val.trim()) {
      setMatchedPlates([]);
      setSelectedPlate(null);
      setIsSearched(false);
      return;
    }
    const results = findMatches(val);
    setMatchedPlates(results);
    setIsSearched(true);
    if (results.length === 1) {
      selectPlate(results[0]);
    } else if (results.length === 0) {
      setSelectedPlate(null);
    }
  };

  const selectPlate = (plate: Lead) => {
    setSelectedPlate(plate);
    const isGeneric = plate.name.toLowerCase().startsWith('empresa') || 
                      plate.name.toUpperCase().includes('SOBRE SUA EXPERIÊNCIA') || 
                      plate.name === '.';
    setBindName(isGeneric ? '' : plate.name);
    setBindUrl(plate.googleMapsUrl || plate.nfcCustomUrl || '');
    setBindNiche(plate.niche || '');
    setBindCity(plate.city || '');
    setBindPhone(plate.phone || '');
  };

  // Image QR decoder from file / camera
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if ('BarcodeDetector' in window) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const raw = barcodes[0].rawValue;
          setQuery(raw);
          handleSearchChange(raw);
          return;
        }
      }
    } catch (_) {}

    // Fallback: match by file name or prompt
    handleSearchChange(file.name);
  };

  const handleSaveBinding = async () => {
    if (!selectedPlate) return;
    if (!bindName.trim()) {
      setErrorMessage('Informe o nome da empresa/cliente que comprou a placa.');
      return;
    }
    if (!bindUrl.trim()) {
      setErrorMessage('Informe o link da avaliação do Google ou URL de destino.');
      return;
    }

    setIsBinding(true);
    setErrorMessage('');

    try {
      let finalUrl = bindUrl.trim();

      // Normalize if standard short link
      const leadRef = doc(db, 'leads', selectedPlate.id);
      const updates: Partial<Lead> = {
        name: bindName.trim(),
        googleMapsUrl: finalUrl,
        nfcCustomUrl: finalUrl,
        nfcRedirectActive: 'gmb',
        nfcBillingStatus: 'active',
        niche: bindNiche.trim() || selectedPlate.niche || 'Geral',
        city: bindCity.trim() || selectedPlate.city || 'Brasil',
        phone: bindPhone.trim() || selectedPlate.phone || ''
      };

      await updateDoc(leadRef, updates);

      const updatedLead = { ...selectedPlate, ...updates };
      setSelectedPlate(updatedLead);
      setSaveSuccess(true);
      if (onPlateUpdated) {
        onPlateUpdated(updatedLead);
      }
    } catch (err: any) {
      console.error('Erro ao vincular placa:', err);
      setErrorMessage(err?.message || 'Erro ao salvar alterações no banco de dados.');
    } finally {
      setIsBinding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 text-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <ScanLine className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Identificador de Placa &amp; Leitor QR
              </h2>
              <p className="text-xs text-slate-500">
                Identifique a qual empresa pertence a placa impressa e cadastre o novo cliente na hora da venda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Digite o número da placa, nome da empresa ou leia o QR Code:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Ex: IV, 08, empresa08 ou cole o link do QR..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 font-mono transition outline-hidden"
                />
              </div>

              {/* Upload photo or camera capture */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Tirar foto ou carregar imagem do QR Code"
              >
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Foto da Placa</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>💡 Dica: Se ler pelo celular, basta olhar o final do link (ex: <strong>empre08</strong> ou <strong>08</strong>)</span>
              <span className="font-mono text-slate-400">{leads.length} placas cadastradas</span>
            </div>
          </div>

          {/* Multiple matches list */}
          {matchedPlates.length > 1 && (
            <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                {matchedPlates.length} placas encontradas para &quot;{query}&quot;:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                {matchedPlates.map((plate) => {
                  const pInfo = getPlateIdentification(plate.id, plate.name);
                  const isSelected = selectedPlate?.id === plate.id;
                  const hasUrl = Boolean(plate.googleMapsUrl || plate.nfcCustomUrl);
                  return (
                    <button
                      key={plate.id}
                      onClick={() => selectPlate(plate)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-800 font-black bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-300">
                            {pInfo.leftEdgeTag || plate.id}
                          </span>
                          <span className="truncate font-semibold">{plate.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          {hasUrl ? '⭐ Google Reviews Ativo' : '⚪ Aguardando Cadastro'}
                        </span>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not found state */}
          {isSearched && matchedPlates.length === 0 && (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                Nenhuma placa encontrada para &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Verifique se digitou o número correto (ex: 08, 04, assadosdojapa) ou cadastre esta nova placa na aba <strong>Placas &amp; QR Codes</strong>.
              </p>
            </div>
          )}

          {/* Selected Plate Details & One-Click Activation Form */}
          {selectedPlate && (
            <div className="space-y-4 pt-1">
              
              {/* Card Summary */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const pInfo = getPlateIdentification(selectedPlate.id, selectedPlate.name);
                      return (
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md flex items-center gap-1.5">
                          <span>Placa: {pInfo.leftEdgeTag ? `${pInfo.leftEdgeTag} (${selectedPlate.id})` : selectedPlate.id}</span>
                        </span>
                      );
                    })()}
                    <span className="text-xs text-slate-500">
                      Link gravado: <code className="font-mono text-slate-700">/r/{selectedPlate.id}</code>
                    </span>
                  </div>

                  <a
                    href={getTestRedirectUrl(selectedPlate.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                    title="Testar redirecionamento direto no navegador"
                  >
                    <span>Testar Link 5★ Agora</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Empresa Cadastrada:</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedPlate.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Canal Atual:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedPlate.nfcRedirectActive === 'gmb' ? 'Google Avaliações (Oficial)' :
                       selectedPlate.nfcRedirectActive === 'whatsapp' ? 'WhatsApp Direto' :
                       selectedPlate.nfcRedirectActive === 'instagram' ? 'Instagram' : 'Link Personalizado'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 break-all font-mono">
                  <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase mb-0.5">Destino Ativo:</span>
                  {selectedPlate.googleMapsUrl || selectedPlate.nfcCustomUrl || 'https://maps.google.com (Padrão Busca)'}
                </div>
              </div>

              {/* Instant Bind / Reassign Section */}
              <div className="border border-indigo-100 rounded-2xl p-4.5 bg-indigo-50/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Vender ou Atualizar Destino Desta Placa
                    </h3>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-semibold">
                    Atualização Imediata no Banco
                  </span>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Placa atualizada com sucesso! O QR Code físico agora abre diretamente a nova empresa.</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Nome da Nova Empresa:
                    </label>
                    <input
                      type="text"
                      value={bindName}
                      onChange={(e) => setBindName(e.target.value)}
                      placeholder="Ex: Padaria Bela Vista"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-900 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Telefone / WhatsApp (opcional):
                    </label>
                    <input
                      type="text"
                      value={bindPhone}
                      onChange={(e) => setBindPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-900 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Link Oficial de Avaliação no Google (WriteReview ou maps.app.goo.gl):
                    </label>
                    <input
                      type="text"
                      value={bindUrl}
                      onChange={(e) => setBindUrl(e.target.value)}
                      placeholder="Cole aqui o link de avaliação do Google..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-900 font-mono outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveBinding}
                    disabled={isBinding}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    {isBinding ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando no Sistema...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar &amp; Ativar Esta Placa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ALF Automação • Leitura Instantânea de Placas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
