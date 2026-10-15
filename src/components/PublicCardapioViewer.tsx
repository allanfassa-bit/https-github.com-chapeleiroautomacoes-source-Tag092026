import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Wifi,
  BellRing,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Sparkles,
  Share2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RestaurantMenu, MenuItem, CartItem } from '../types/cardapio';
import { formatCurrency, buildWhatsAppOrderMessage } from '../utils/cardapioExporter';

interface PublicCardapioViewerProps {
  menu: RestaurantMenu;
  initialTable?: string;
  onBackToAdmin?: () => void;
}

export const PublicCardapioViewer: React.FC<PublicCardapioViewerProps> = ({
  menu,
  initialTable = '01',
  onBackToAdmin
}) => {
  const [currentTable, setCurrentTable] = useState<string>(initialTable);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState<boolean>(false);
  const [wifiCopied, setWifiCopied] = useState<boolean>(false);
  
  // Checkout drawer fields
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<'mesa' | 'balcao'>('mesa');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix no Caixa');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isOrderSentModalOpen, setIsOrderSentModalOpen] = useState<boolean>(false);

  // Selected item modal for customization
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalObs, setModalObs] = useState<string>('');

  // Cart totals
  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const unit = item.item.promotionalPrice ?? item.item.price;
      return sum + unit * item.quantity;
    }, 0);
  }, [cart]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = menu.items.filter(item => item.available);
    if (selectedCategoryId !== 'all') {
      result = result.filter(item => item.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [menu, selectedCategoryId, searchQuery]);

  const handleOpenProductModal = (item: MenuItem) => {
    setSelectedProduct(item);
    setModalQuantity(1);
    setModalObs('');
  };

  const handleAddModalToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => {
      const existingIdx = prev.findIndex(
        c => c.item.id === selectedProduct.id && (c.observation || '') === modalObs.trim()
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += modalQuantity;
        return copy;
      }
      return [
        ...prev,
        { item: selectedProduct, quantity: modalQuantity, observation: modalObs.trim() }
      ];
    });
    setSelectedProduct(null);
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.item.id === item.id && !c.observation);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { item, quantity: 1, observation: '' }];
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const copy = [...prev];
      copy[index].quantity += delta;
      if (copy[index].quantity <= 0) {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const handleCallWaiter = () => {
    const text = `🛎️ *CHAMADA DE GARÇOM*\nPor favor, o cliente da *MESA ${currentTable}* do ${menu.name} está solicitando atendimento presencial!`;
    const cleanPhone = menu.phone.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    const text = buildWhatsAppOrderMessage(
      menu,
      cart,
      currentTable,
      customerName,
      orderType,
      paymentMethod,
      generalNotes
    );
    const cleanPhone = menu.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOrderSentModalOpen(true);
    setIsCartOpen(false);
  };

  const handleCopyWifi = () => {
    if (!menu.wifiPassword) return;
    navigator.clipboard.writeText(menu.wifiPassword).then(() => {
      setWifiCopied(true);
      setTimeout(() => setWifiCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-900 min-h-screen relative shadow-2xl pb-32 flex flex-col">
        
        {/* Admin Bar (if opened in preview mode) */}
        {onBackToAdmin && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-bold shrink-0 sticky top-0 z-50 shadow">
            <span>👁️ Modo Demonstração do Cardápio</span>
            <button
              onClick={onBackToAdmin}
              className="bg-slate-950 text-amber-400 px-2.5 py-1 rounded-md text-[11px] hover:bg-slate-900 transition-colors"
            >
              Voltar ao Painel
            </button>
          </div>
        )}

        {/* Hero Section */}
        <header className="relative h-60 bg-slate-850 shrink-0 overflow-hidden">
          <img
            src={menu.coverUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}
            alt="Capa"
            className="w-full h-full object-cover filter brightness-[0.6] select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            {/* Table Badge with selector */}
            <div className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-300/40">
              <MapPin className="w-3.5 h-3.5 text-slate-950" />
              <span>MESA {currentTable}</span>
            </div>

            <div className="flex items-center gap-2">
              {menu.wifiPassword && (
                <button
                  onClick={() => setIsWifiModalOpen(true)}
                  className="bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-700/60 shadow-lg active:scale-95 transition-all"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Wi-Fi</span>
                </button>
              )}

              {menu.allowCallWaiter && (
                <button
                  onClick={handleCallWaiter}
                  className="bg-emerald-600/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-400/40 shadow-lg active:scale-95 transition-all"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Garçom</span>
                </button>
              )}
            </div>
          </div>

          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end gap-3.5">
            <img
              src={menu.logoUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80'}
              alt={menu.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-xl bg-slate-900 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight truncate">
                {menu.name}
              </h1>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {menu.tagline}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-amber-400 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Aberto agora
                </span>
                {menu.googleReviewUrl && (
                  <a
                    href={menu.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-slate-200 font-medium transition-colors"
                  >
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>5.0 no Google</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Sticky Search & Category Navigation */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md pt-3 pb-2 px-4 border-b border-slate-800 shadow-md">
          {/* Search Input */}
          <div className="relative mb-2.5">
            <input
              type="text"
              placeholder="O que você deseja pedir? (ex: pizza, burger...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-9 py-2.5 rounded-xl border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              🔥 Todos ({menu.items.length})
            </button>
            {menu.categories.map(cat => {
              const count = menu.items.filter(i => i.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Reviews Banner (Synergy with NFC smart plate!) */}
        {menu.googleReviewUrl && (
          <div className="mx-4 mt-3 bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-white truncate">Avalie nossa Casa no Google</h4>
                <p className="text-[11px] text-amber-200/80">Sua avaliação de 5 estrelas nos ajuda muito!</p>
              </div>
            </div>
            <a
              href={menu.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl shrink-0 transition-transform active:scale-95 flex items-center gap-1 shadow"
            >
              <span>Avaliar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Product List */}
        <main className="px-4 py-4 space-y-5 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="font-bold text-sm text-slate-200">Nenhum prato ou produto encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Tente buscar por outro termo ou escolha outra categoria.</p>
            </div>
          ) : (
            <>
              {selectedCategoryId === 'all' && !searchQuery ? (
                // Grouped by Category
                menu.categories.map(cat => {
                  const catItems = filteredItems.filter(i => i.categoryId === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="border-b border-slate-800 pb-2">
                        <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                          <span>{cat.name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                            {catItems.length}
                          </span>
                        </h2>
                        {cat.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {catItems.map(item => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            onClick={() => handleOpenProductModal(item)}
                            onQuickAdd={(e) => handleQuickAdd(item, e)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Flat filtered list
                <div className="space-y-3">
                  {filteredItems.map(item => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onClick={() => handleOpenProductModal(item)}
                      onQuickAdd={(e) => handleQuickAdd(item, e)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Floating Cart Button */}
        {totalItemsCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-300/40 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow">
                  {totalItemsCount}
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-slate-950/80">
                    Comanda • Mesa {currentTable}
                  </div>
                  <div className="text-base font-black text-slate-950">
                    {formatCurrency(totalCartAmount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-extrabold bg-slate-950/15 px-3.5 py-1.5 rounded-xl">
                <span>Ver Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="relative h-56 bg-slate-800 shrink-0">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center font-bold hover:bg-slate-950"
                >
                  <X className="w-4 h-4" />
                </button>
                {selectedProduct.badge && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wider">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-extrabold text-white leading-snug">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-amber-400">
                      {formatCurrency(selectedProduct.promotionalPrice ?? selectedProduct.price)}
                    </span>
                    {selectedProduct.promotionalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">
                    Observações do seu prato (opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={modalObs}
                    onChange={e => setModalObs(e.target.value)}
                    placeholder="Ex: Sem cebola, molho à parte, bem passado..."
                    className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-400 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="text-slate-400 hover:text-white font-bold w-6 h-6 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black text-white w-6 text-center">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="text-slate-400 hover:text-white font-bold w-6 h-6 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddModalToCart}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Adicionar • {formatCurrency((selectedProduct.promotionalPrice ?? selectedProduct.price) * modalQuantity)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart & Checkout Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
            <div className="bg-slate-900 border-t border-slate-700 w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Comanda & Pedido</h3>
                    <p className="text-[11px] text-slate-400">{totalItemsCount} item(ns) selecionado(s)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {cart.map((cartItem, idx) => {
                  const unit = cartItem.item.promotionalPrice ?? cartItem.item.price;
                  return (
                    <div
                      key={`${cartItem.item.id}-${idx}`}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-bold text-sm text-white truncate">
                            {cartItem.item.name}
                          </h4>
                          <span className="text-xs font-semibold text-amber-400">
                            {formatCurrency(unit * cartItem.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="text-slate-400 hover:text-white font-bold w-5 h-5 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-white w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            className="text-slate-400 hover:text-white font-bold w-5 h-5 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {cartItem.observation && (
                        <p className="text-[11px] text-amber-300/80 italic">
                          Obs: {cartItem.observation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Checkout Form */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      MESA
                    </label>
                    <select
                      value={currentTable}
                      onChange={e => setCurrentTable(e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                    >
                      {Array.from({ length: menu.tableCount || 15 }, (_, i) => {
                        const num = String(i + 1).padStart(2, '0');
                        return (
                          <option key={num} value={num}>
                            Mesa {num}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      PAGAMENTO
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Pix no Caixa">Pix no Caixa</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      SEU NOME (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ex: Carlos"
                      className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      OBSERVAÇÃO GERAL
                    </label>
                    <input
                      type="text"
                      value={generalNotes}
                      onChange={e => setGeneralNotes(e.target.value)}
                      placeholder="Ex: Copos c/ gelo"
                      className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Total & Send Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total do Pedido:</span>
                  <span className="text-lg font-black text-amber-400">
                    {formatCurrency(totalCartAmount)}
                  </span>
                </div>

                <button
                  onClick={handleSendOrder}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido para a Cozinha / WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Sent Confirmation Modal */}
        {isOrderSentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Pedido Enviado!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seu pedido foi formatado e direcionado para a equipe de atendimento via WhatsApp da <strong>Mesa {currentTable}</strong>.
              </p>
              <button
                onClick={() => {
                  setIsOrderSentModalOpen(false);
                  setCart([]);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Concluir e Voltar ao Cardápio
              </button>
            </div>
          </div>
        )}

        {/* Wi-Fi Modal */}
        {isWifiModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Conexão Wi-Fi Clientes</h3>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Nome da Rede:</span>
                  <span className="font-bold text-white">{menu.wifiName || 'Clientes'}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Senha:</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                    {menu.wifiPassword || 'Sem senha'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyWifi}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  wifiCopied ? 'bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {wifiCopied ? '✓ Senha Copiada!' : 'Copiar Senha do Wi-Fi'}
              </button>
              <button
                onClick={() => setIsWifiModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, onQuickAdd }) => {
  return (
    <div
      onClick={onClick}
      className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 hover:border-slate-700 transition-all flex gap-3.5 relative overflow-hidden shadow-sm cursor-pointer group active:scale-[0.99]"
    >
      {item.badge && (
        <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow uppercase tracking-wider z-10">
          {item.badge}
        </span>
      )}

      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative ring-1 ring-slate-800">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-white leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-sm text-amber-400">
              {formatCurrency(item.promotionalPrice ?? item.price)}
            </span>
            {item.promotionalPrice && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatCurrency(item.price)}
              </span>
            )}
          </div>

          <button
            onClick={onQuickAdd}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
