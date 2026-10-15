import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  ExternalLink,
  QrCode,
  Smartphone,
  Eye,
  Check,
  Copy,
  FolderPlus,
  Sparkles,
  Wifi,
  Phone,
  MapPin,
  Star,
  Settings,
  Layers,
  ArrowRight,
  RefreshCw,
  Share2,
  FileCode,
  FileArchive,
  Search,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import {
  RestaurantMenu,
  MenuCategory,
  MenuItem,
  FOOD_PHOTO_PRESETS,
  INITIAL_MENUS
} from '../types/cardapio';
import {
  downloadCardapioZip,
  downloadCardapioHtml,
  openCardapioLivePreview,
  formatCurrency
} from '../utils/cardapioExporter';
import { generateQrDataUrl } from '../utils/qrCodeGenerator';
import { PublicCardapioViewer } from './PublicCardapioViewer';
import JSZip from 'jszip';

interface CardapioDigitalManagerProps {
  initialMenuId?: string;
  onLinkToNfc?: (url: string, menuName: string) => void;
}

const STORAGE_KEY = 'alf_cardapios_data';

export const CardapioDigitalManager: React.FC<CardapioDigitalManagerProps> = ({
  initialMenuId,
  onLinkToNfc
}) => {
  // Load saved menus or fallback to presets
  const [menus, setMenus] = useState<RestaurantMenu[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar cardápios do localStorage:', e);
    }
    return INITIAL_MENUS;
  });

  const [activeMenuId, setActiveMenuId] = useState<string>(() => {
    if (initialMenuId && menus.some(m => m.id === initialMenuId)) return initialMenuId;
    return menus[0]?.id || 'bellariobranco';
  });

  // Current active menu
  const activeMenu = useMemo(() => {
    return menus.find(m => m.id === activeMenuId) || menus[0];
  }, [menus, activeMenuId]);

  // Sub-tabs inside Cardapio Manager
  const [subTab, setSubTab] = useState<'items' | 'tables' | 'settings' | 'export'>('items');

  // Preview Mode: Side-by-side or Phone Simulator
  const [showPhoneSimulator, setShowPhoneSimulator] = useState<boolean>(true);
  const [simulatorTable, setSimulatorTable] = useState<string>('01');

  // Product & Category filters / search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');

  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState<boolean>(false);
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuSegment, setNewMenuSegment] = useState<'pizzaria' | 'hamburgueria' | 'restaurante' | 'padaria' | 'bar'>('pizzaria');
  const [newMenuPhone, setNewMenuPhone] = useState<string>('5511999999999');

  // Table QR preview
  const [tableQrDataUrl, setTableQrDataUrl] = useState<string>('');
  const [selectedTableForQr, setSelectedTableForQr] = useState<string>('01');
  const [isGeneratingAllQrZip, setIsGeneratingAllQrZip] = useState<boolean>(false);

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form states for Product Modal
  const [prodFormName, setProdFormName] = useState<string>('');
  const [prodFormCategory, setProdFormCategory] = useState<string>('');
  const [prodFormDesc, setProdFormDesc] = useState<string>('');
  const [prodFormPrice, setProdFormPrice] = useState<string>('0.00');
  const [prodFormPromoPrice, setProdFormPromoPrice] = useState<string>('');
  const [prodFormImage, setProdFormImage] = useState<string>('');
  const [prodFormBadge, setProdFormBadge] = useState<string>('');
  const [prodFormAvailable, setProdFormAvailable] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    } catch (e) {
      console.warn('Erro ao salvar cardápios:', e);
    }
  }, [menus]);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Build the public URL for this cardapio
  const getCardapioPublicUrl = (tableNum: string = '01') => {
    const origin = window.location.origin;
    return `${origin}/?cardapio=${activeMenu.id}&mesa=${tableNum}`;
  };

  // Generate QR code for the selected table
  useEffect(() => {
    if (!activeMenu) return;
    const url = getCardapioPublicUrl(selectedTableForQr);
    generateQrDataUrl(url, { width: 500, margin: 2, darkColor: '#0f172a' })
      .then(data => setTableQrDataUrl(data))
      .catch(err => console.error('Erro ao gerar QR Code:', err));
  }, [activeMenu, selectedTableForQr]);

  // Open Product Modal for creation or edit
  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCategory(activeMenu.categories[0]?.id || '');
    setProdFormDesc('');
    setProdFormPrice('35.00');
    setProdFormPromoPrice('');
    setProdFormImage(FOOD_PHOTO_PRESETS[0]?.url || '');
    setProdFormBadge('');
    setProdFormAvailable(true);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (item: MenuItem) => {
    setEditingProduct(item);
    setProdFormName(item.name);
    setProdFormCategory(item.categoryId);
    setProdFormDesc(item.description);
    setProdFormPrice(item.price.toFixed(2));
    setProdFormPromoPrice(item.promotionalPrice ? item.promotionalPrice.toFixed(2) : '');
    setProdFormImage(item.imageUrl);
    setProdFormBadge(item.badge || '');
    setProdFormAvailable(item.available);
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = () => {
    if (!prodFormName.trim()) {
      alert('Digite o nome do produto.');
      return;
    }
    const priceNum = parseFloat(prodFormPrice.replace(',', '.')) || 0;
    const promoNum = prodFormPromoPrice ? parseFloat(prodFormPromoPrice.replace(',', '.')) : undefined;

    const updatedItem: MenuItem = {
      id: editingProduct ? editingProduct.id : `item-${Date.now()}`,
      categoryId: prodFormCategory || activeMenu.categories[0]?.id || 'cat-geral',
      name: prodFormName.trim(),
      description: prodFormDesc.trim(),
      price: priceNum,
      promotionalPrice: promoNum && promoNum > 0 ? promoNum : undefined,
      imageUrl: prodFormImage.trim() || FOOD_PHOTO_PRESETS[0].url,
      badge: (prodFormBadge as any) || undefined,
      available: prodFormAvailable,
      order: editingProduct ? editingProduct.order : activeMenu.items.length + 1
    };

    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      let newItems = [...m.items];
      if (editingProduct) {
        newItems = newItems.map(i => i.id === editingProduct.id ? updatedItem : i);
      } else {
        newItems.push(updatedItem);
      }
      return { ...m, items: newItems, updatedAt: new Date().toISOString() };
    }));

    setIsProductModalOpen(false);
    showNotification(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto adicionado ao cardápio!');
  };

  // Delete product
  const handleDeleteProduct = (itemId: string) => {
    if (!confirm('Deseja realmente remover este produto do cardápio?')) return;
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      return { ...m, items: m.items.filter(i => i.id !== itemId), updatedAt: new Date().toISOString() };
    }));
    showNotification('Produto removido.');
  };

  // Toggle availability
  const handleToggleAvailable = (itemId: string) => {
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      return {
        ...m,
        items: m.items.map(i => i.id === itemId ? { ...i, available: !i.available } : i),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim() || undefined,
      order: activeMenu.categories.length + 1
    };

    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      return { ...m, categories: [...m.categories, newCat], updatedAt: new Date().toISOString() };
    }));

    setNewCategoryName('');
    setNewCategoryDesc('');
    setIsCategoryModalOpen(false);
    showNotification('Categoria adicionada!');
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (!confirm('Remover esta categoria? Os produtos continuarão no cardápio.')) return;
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      return {
        ...m,
        categories: m.categories.filter(c => c.id !== catId),
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Update Settings
  const handleUpdateActiveMenuField = (field: keyof RestaurantMenu, value: any) => {
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenu.id) return m;
      return { ...m, [field]: value, updatedAt: new Date().toISOString() };
    }));
  };

  // Create New Menu
  const handleCreateNewMenu = () => {
    if (!newMenuName.trim()) return;
    const slug = newMenuName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const newMenu: RestaurantMenu = {
      id: slug || `cardapio-${Date.now()}`,
      name: newMenuName.trim(),
      tagline: 'Os melhores sabores servidos com carinho e tradição',
      segment: newMenuSegment,
      phone: newMenuPhone.replace(/[^0-9]/g, '') || '5511999999999',
      address: 'Endereço do Estabelecimento',
      city: 'São Paulo - SP',
      logoUrl: FOOD_PHOTO_PRESETS[0].url,
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      themeColor: 'amber',
      currency: 'BRL',
      tableCount: 15,
      wifiName: `${newMenuName.trim().replace(/\s+/g, '')}_Clientes`,
      wifiPassword: 'senha123clientes',
      googleReviewUrl: '',
      allowWhatsAppOrders: true,
      allowCallWaiter: true,
      categories: [
        { id: 'cat-principais', name: 'Pratos Principais', order: 1 },
        { id: 'cat-porcoes', name: 'Porções & Entradas', order: 2 },
        { id: 'cat-bebidas', name: 'Bebidas', order: 3 },
        { id: 'cat-sobremesas', name: 'Sobremesas', order: 4 }
      ],
      items: [
        {
          id: `item-${Date.now()}-1`,
          categoryId: 'cat-principais',
          name: 'Especial da Casa',
          description: 'Preparado artesanalmente com ingredientes nobres selecionados.',
          price: 49.90,
          imageUrl: FOOD_PHOTO_PRESETS[0].url,
          badge: 'Mais Pedido',
          available: true,
          order: 1
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMenus(prev => [...prev, newMenu]);
    setActiveMenuId(newMenu.id);
    setIsNewMenuModalOpen(false);
    setNewMenuName('');
    showNotification(`Cardápio "${newMenu.name}" criado com sucesso!`);
  };

  // Download All Tables QR Codes ZIP
  const handleDownloadAllTablesZip = async () => {
    setIsGeneratingAllQrZip(true);
    try {
      const zip = new JSZip();
      const count = activeMenu.tableCount || 15;

      for (let i = 1; i <= count; i++) {
        const tableNum = String(i).padStart(2, '0');
        const url = getCardapioPublicUrl(tableNum);
        const dataUrl = await generateQrDataUrl(url, { width: 600, margin: 2, darkColor: '#0f172a' });
        const base64Data = dataUrl.split(',')[1];
        zip.file(`Mesa-${tableNum}-Cardapio-${activeMenu.id}.png`, base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `QR-Codes-Mesas-01-a-${String(count).padStart(2, '0')}-${activeMenu.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
      showNotification('ZIP com todas as mesas baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar zip de mesas:', err);
      alert('Erro ao gerar pacote de mesas.');
    } finally {
      setIsGeneratingAllQrZip(false);
    }
  };

  // Filtered items in admin list
  const adminFilteredItems = useMemo(() => {
    let list = activeMenu.items;
    if (categoryFilter !== 'all') {
      list = list.filter(i => i.categoryId === categoryFilter);
    }
    if (itemSearchQuery.trim()) {
      const q = itemSearchQuery.toLowerCase().trim();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return list;
  }, [activeMenu, categoryFilter, itemSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 font-bold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Banner & Menu Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Módulo Cardápio Digital
              </h2>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Mesas • QR Code • NFC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Crie cardápios rápidos para restaurantes, pizzarias e bares com fotos e preços. Otimizado para leitura rápida nas mesas com pedido direto no WhatsApp.
            </p>
          </div>
        </div>

        {/* Menu Picker & New Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 pl-2">Restaurante:</span>
            <select
              value={activeMenuId}
              onChange={e => setActiveMenuId(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700/80 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {menus.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.items.length} itens)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewMenuModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cardápio</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Management Tabs on Left, Mobile Live Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Dashboard & Editors) */}
        <div className={`space-y-6 ${showPhoneSimulator ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'}`}>
          
          {/* Navigation Sub-Tabs */}
          <div className="bg-slate-900 rounded-2xl p-1.5 border border-slate-800 flex items-center gap-1 overflow-x-auto shadow-sm">
            <button
              onClick={() => setSubTab('items')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                subTab === 'items'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Cardápio & Produtos ({activeMenu.items.length})</span>
            </button>

            <button
              onClick={() => setSubTab('tables')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                subTab === 'tables'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Mesas & QR Codes ({activeMenu.tableCount || 15})</span>
            </button>

            <button
              onClick={() => setSubTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                subTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Dados do Estabelecimento</span>
            </button>

            <button
              onClick={() => setSubTab('export')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                subTab === 'export'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Hospedar & Vercel (.ZIP)</span>
            </button>

            {/* Toggle simulator visibility */}
            <div className="ml-auto pl-2 hidden lg:flex items-center">
              <button
                onClick={() => setShowPhoneSimulator(!showPhoneSimulator)}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{showPhoneSimulator ? 'Ocultar Celular' : 'Ver no Celular'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ITEMS & CATEGORIES */}
          {subTab === 'items' && (
            <div className="space-y-5">
              {/* Top Controls: Add Product, Add Category, Search, Filter */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Filtrar por nome ou ingrediente..."
                      value={itemSearchQuery}
                      onChange={e => setItemSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Todas Categorias ({activeMenu.items.length})</option>
                    {activeMenu.categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({activeMenu.items.filter(i => i.categoryId === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Gerenciar Categorias</span>
                  </button>

                  <button
                    onClick={handleOpenNewProductModal}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Produto</span>
                  </button>
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-3">
                {adminFilteredItems.length === 0 ? (
                  <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 text-slate-400">
                    <Utensils className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-200">Nenhum produto cadastrado</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Adicione pizzas, hambúrgueres, porções ou bebidas ao cardápio de {activeMenu.name}.
                    </p>
                    <button
                      onClick={handleOpenNewProductModal}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Primeiro Produto</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminFilteredItems.map(item => {
                      const cat = activeMenu.categories.find(c => c.id === item.categoryId);
                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 hover:border-slate-700 transition-all flex gap-3 relative shadow-sm"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover bg-slate-800 shrink-0 ring-1 ring-slate-800"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.badge && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                                    {item.badge}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-semibold truncate">
                                  {cat?.name || 'Geral'}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white leading-snug truncate mt-0.5">
                                {item.name}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-black text-amber-400">
                                  {formatCurrency(item.promotionalPrice ?? item.price)}
                                </span>
                                {item.promotionalPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(item.price)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleAvailable(item.id)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                                    item.available
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {item.available ? 'Ativo' : 'Esgotado'}
                                </button>
                                <button
                                  onClick={() => handleOpenEditProductModal(item)}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800"
                                  title="Editar"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-lg border border-slate-800"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TABLES & QR CODES */}
          {subTab === 'tables' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-amber-400" />
                      <span>Gerador de QR Codes de Mesas</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Cada mesa tem seu QR Code exclusivo. Quando o cliente escaneia na mesa dele, o pedido já é identificado com o número da mesa correto!
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadAllTablesZip}
                    disabled={isGeneratingAllQrZip}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingAllQrZip ? 'Gerando Pacote...' : 'Baixar Todas as Mesas (.ZIP)'}</span>
                  </button>
                </div>

                {/* Table configuration */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-300">Total de Mesas no Estabelecimento:</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={activeMenu.tableCount || 15}
                      onChange={e => handleUpdateActiveMenuField('tableCount', parseInt(e.target.value) || 1)}
                      className="w-20 bg-slate-900 text-white text-xs font-bold text-center py-1.5 rounded-lg border border-slate-700"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    (Gera automaticamente de Mesa 01 até Mesa {String(activeMenu.tableCount || 15).padStart(2, '0')})
                  </span>
                </div>
              </div>

              {/* Single Table QR Code Display Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Acrylic Card Mockup (10x10 / A6) */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-center flex flex-col items-center shadow-xl">
                  <div className="w-full max-w-[260px] bg-white rounded-2xl p-5 text-slate-900 shadow-2xl border-4 border-amber-400 flex flex-col items-center relative">
                    <div className="text-[10px] uppercase font-black tracking-widest text-amber-600 mb-1">
                      CARDÁPIO DIGITAL
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate max-w-full">
                      {activeMenu.name}
                    </div>

                    {/* QR Code Container */}
                    <div className="w-40 h-40 bg-white p-2 rounded-xl my-3 flex items-center justify-center border border-slate-200 shadow-inner">
                      {tableQrDataUrl ? (
                        <img src={tableQrDataUrl} alt="QR Code Mesa" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-xs text-slate-400">Carregando QR...</div>
                      )}
                    </div>

                    <div className="bg-slate-900 text-amber-400 font-black text-sm px-4 py-1.5 rounded-full shadow-md tracking-wider mb-2">
                      MESA {selectedTableForQr}
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                      Aponte a câmera ou aproxime pelo NFC para ver o cardápio e fazer seu pedido
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-bold">Ver Mesa:</label>
                    <select
                      value={selectedTableForQr}
                      onChange={e => setSelectedTableForQr(e.target.value)}
                      className="bg-slate-950 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-slate-700"
                    >
                      {Array.from({ length: activeMenu.tableCount || 15 }, (_, i) => {
                        const num = String(i + 1).padStart(2, '0');
                        return <option key={num} value={num}>Mesa {num}</option>;
                      })}
                    </select>

                    <a
                      href={tableQrDataUrl}
                      download={`QR-Mesa-${selectedTableForQr}-${activeMenu.id}.png`}
                      className="bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar PNG</span>
                    </a>
                  </div>
                </div>

                {/* Direct Link & NFC Plate linking */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Link Direto da Mesa {selectedTableForQr}</span>
                  </h4>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getCardapioPublicUrl(selectedTableForQr)}
                      className="bg-transparent text-xs text-slate-300 font-mono flex-1 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getCardapioPublicUrl(selectedTableForQr));
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <h5 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Vincular à Placa NFC Física de Mesa</span>
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Se você fabrica totens de acrílico ou placas NFC de mesa para restaurantes, você pode gravar esse link diretamente no chip NFC com o gravador do sistema!
                    </p>
                    {onLinkToNfc && (
                      <button
                        onClick={() => onLinkToNfc(getCardapioPublicUrl(selectedTableForQr), `${activeMenu.name} - Mesa ${selectedTableForQr}`)}
                        className="bg-slate-950 hover:bg-slate-900 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 mt-2"
                      >
                        <span>Gravar no Módulo de Placas NFC</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESTAURANT SETTINGS */}
          {subTab === 'settings' && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Dados & Personalização de {activeMenu.name}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Estabelecimento</label>
                  <input
                    type="text"
                    value={activeMenu.name}
                    onChange={e => handleUpdateActiveMenuField('name', e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp para Receber Pedidos</label>
                  <input
                    type="text"
                    value={activeMenu.phone}
                    onChange={e => handleUpdateActiveMenuField('phone', e.target.value)}
                    placeholder="Ex: 5511999999999"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400">Com DDD (apenas números). Ex: 5511987654321</span>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Slogan ou Descrição Breve</label>
                  <input
                    type="text"
                    value={activeMenu.tagline}
                    onChange={e => handleUpdateActiveMenuField('tagline', e.target.value)}
                    placeholder="Ex: Pizzas no forno a lenha e porções especiais"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Wi-Fi de Clientes</label>
                  <input
                    type="text"
                    value={activeMenu.wifiName || ''}
                    onChange={e => handleUpdateActiveMenuField('wifiName', e.target.value)}
                    placeholder="Ex: BellaRioBranco_Clientes"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Senha do Wi-Fi</label>
                  <input
                    type="text"
                    value={activeMenu.wifiPassword || ''}
                    onChange={e => handleUpdateActiveMenuField('wifiPassword', e.target.value)}
                    placeholder="Ex: pizzaquente2026"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Link de Avaliação Google 5 Estrelas (NFC Synergy)
                  </label>
                  <input
                    type="text"
                    value={activeMenu.googleReviewUrl || ''}
                    onChange={e => handleUpdateActiveMenuField('googleReviewUrl', e.target.value)}
                    placeholder="Ex: https://search.google.com/local/writereview?placeid=..."
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400">
                    Exibe um banner convidando o cliente a avaliar no Google direto pelo cardápio!
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">URL da Imagem de Capa</label>
                  <input
                    type="text"
                    value={activeMenu.coverUrl || ''}
                    onChange={e => handleUpdateActiveMenuField('coverUrl', e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & HOSTING (VERCEL, NETLIFY, RENDER) */}
          {subTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Hospedagem & Exportação do Cardápio
                    </h3>
                    <p className="text-xs text-slate-400">
                      Você pode usar o cardápio de duas formas: direto pelo link do sistema ou exportado para a Vercel/Netlify.
                    </p>
                  </div>
                </div>

                {/* Option 1: System Live Link */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      OPÇÃO 1 • HOSPEDADO DIRETAMENTE NO SEU SISTEMA (SEM CONFIGURAR NADA)
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                      ✓ Ativo Agora
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este link já funciona automaticamente na internet no seu servidor Render. Qualquer alteração de preço ou foto atualiza instantaneamente para quem ler o QR code!
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getCardapioPublicUrl(simulatorTable)}
                      className="bg-slate-900 text-xs text-slate-200 font-mono p-2.5 rounded-xl border border-slate-700 flex-1 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getCardapioPublicUrl(simulatorTable));
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                    <a
                      href={getCardapioPublicUrl(simulatorTable)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Option 2: Standalone ZIP for Vercel / Netlify */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      OPÇÃO 2 • EXPORTAR PARA A VERCEL / NETLIFY (.ZIP)
                    </span>
                    <span className="text-[11px] bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                      100% Estático & Grátis
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Gera um pacote ZIP completo contendo o <code>index.html</code>, configurações do <code>vercel.json</code> e manual. Basta arrastar a pasta na Vercel para ter um site próprio do cliente em menos de 1 minuto!
                  </p>

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <button
                      onClick={async () => {
                        setIsDownloadingZip(true);
                        try {
                          await downloadCardapioZip(activeMenu);
                          showNotification('ZIP pronto para Vercel baixado!');
                        } finally {
                          setIsDownloadingZip(false);
                        }
                      }}
                      disabled={isDownloadingZip}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      <FileArchive className="w-4 h-4" />
                      <span>{isDownloadingZip ? 'Compactando...' : 'Baixar Pacote Vercel (.ZIP)'}</span>
                    </button>

                    <button
                      onClick={() => downloadCardapioHtml(activeMenu)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4" />
                      <span>Baixar Apenas index.html</span>
                    </button>
                  </div>
                </div>

                {/* Quick Step by Step Guide */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Passo a Passo para hospedar na Vercel em 1 minuto:</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Clique no botão <strong>"Baixar Pacote Vercel (.ZIP)"</strong> acima e descompacte a pasta no seu computador.</li>
                    <li>Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">vercel.com</a> e clique em <strong>"Add New..." ➔ "Project"</strong>.</li>
                    <li>Arraste a pasta descompactada para a tela da Vercel e clique em <strong>Deploy</strong>.</li>
                    <li>Pronto! Você receberá o link gratuito e seguro (ex: <code>{activeMenu.id}.vercel.app</code>) para colocar nas placas de mesa.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Mobile Phone Simulator */}
        {showPhoneSimulator && (
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white">Simulador em Tempo Real</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={simulatorTable}
                    onChange={e => setSimulatorTable(e.target.value)}
                    className="bg-slate-950 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-slate-700"
                  >
                    {Array.from({ length: activeMenu.tableCount || 15 }, (_, i) => {
                      const num = String(i + 1).padStart(2, '0');
                      return <option key={num} value={num}>Mesa {num}</option>;
                    })}
                  </select>
                  <button
                    onClick={() => openCardapioLivePreview(activeMenu, simulatorTable)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    title="Abrir em Nova Aba"
                  >
                    <span>Abrir</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* iPhone Frame */}
              <div className="w-[340px] h-[640px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-8 ring-slate-800 ring-offset-2 ring-offset-slate-900 relative overflow-hidden flex flex-col border border-slate-700/80">
                {/* iPhone Dynamic Island / Speaker */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 ml-auto mr-2"></div>
                </div>

                {/* Simulated Screen */}
                <div className="w-full h-full rounded-[34px] overflow-y-auto no-scrollbar relative bg-slate-900">
                  <PublicCardapioViewer
                    menu={activeMenu}
                    initialTable={simulatorTable}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>{editingProduct ? 'Editar Produto' : 'Novo Produto no Cardápio'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Prato / Produto *</label>
                <input
                  type="text"
                  value={prodFormName}
                  onChange={e => setProdFormName(e.target.value)}
                  placeholder="Ex: Pizza Calabresa Especial Forno a Lenha"
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Categoria *</label>
                  <select
                    value={prodFormCategory}
                    onChange={e => setProdFormCategory(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  >
                    {activeMenu.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Selo / Destaque</label>
                  <select
                    value={prodFormBadge}
                    onChange={e => setProdFormBadge(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Sem selo</option>
                    <option value="Mais Pedido">Mais Pedido</option>
                    <option value="Novidade">Novidade</option>
                    <option value="Promoção">Promoção</option>
                    <option value="Sugestão do Chef">Sugestão do Chef</option>
                    <option value="Vegetariano">Vegetariano</option>
                    <option value="Sem Glúten">Sem Glúten</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição / Ingredientes</label>
                <textarea
                  rows={2}
                  value={prodFormDesc}
                  onChange={e => setProdFormDesc(e.target.value)}
                  placeholder="Ex: Molho de tomate pelado, mussarela premium, calabresa e orégano."
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Preço Normal (R$) *</label>
                  <input
                    type="text"
                    value={prodFormPrice}
                    onChange={e => setProdFormPrice(e.target.value)}
                    placeholder="49.90"
                    className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Preço Promocional (R$)</label>
                  <input
                    type="text"
                    value={prodFormPromoPrice}
                    onChange={e => setProdFormPromoPrice(e.target.value)}
                    placeholder="Opcional. Ex: 39.90"
                    className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Photo selector & Presets */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL da Foto do Prato</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodFormImage}
                    onChange={e => setProdFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                  />
                  {prodFormImage && (
                    <img src={prodFormImage} alt="Prévia" className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700" />
                  )}
                </div>

                {/* Preset Photos Quick Picker */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">Ou clique para escolher uma foto profissional pronta:</span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {FOOD_PHOTO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProdFormImage(preset.url)}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-transform active:scale-90 ${
                          prodFormImage === preset.url ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodAvailableCheck"
                  checked={prodFormAvailable}
                  onChange={e => setProdFormAvailable(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="prodAvailableCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Produto Disponível no Cardápio (desmarque se estiver esgotado no dia)
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Produto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORIES MANAGER */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Categorias de {activeMenu.name}</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Existing Categories */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {activeMenu.categories.map(cat => {
                const count = activeMenu.items.filter(i => i.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                      <span className="text-[10px] text-slate-400">{count} produto(s)</span>
                    </div>
                    {activeMenu.categories.length > 1 && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Category Form */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <h4 className="text-xs font-black text-amber-400">Nova Categoria</h4>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Ex: Pizzas Doces, Chopps, Porções..."
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={newCategoryDesc}
                onChange={e => setNewCategoryDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleAddCategory}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-transform active:scale-95"
              >
                + Adicionar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW RESTAURANT MENU */}
      {isNewMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Criar Novo Cardápio Digital</span>
              </h3>
              <button
                onClick={() => setIsNewMenuModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Restaurante / Estabelecimento *</label>
                <input
                  type="text"
                  value={newMenuName}
                  onChange={e => setNewMenuName(e.target.value)}
                  placeholder="Ex: Pizzaria Bella Napoli"
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Segmento</label>
                <select
                  value={newMenuSegment}
                  onChange={e => setNewMenuSegment(e.target.value as any)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                >
                  <option value="pizzaria">Pizzaria & Forneria</option>
                  <option value="hamburgueria">Hamburgueria Artesanal</option>
                  <option value="restaurante">Restaurante & Buffet</option>
                  <option value="padaria">Padaria & Cafeteria</option>
                  <option value="bar">Bar & Petiscaria</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp para Pedidos</label>
                <input
                  type="text"
                  value={newMenuPhone}
                  onChange={e => setNewMenuPhone(e.target.value)}
                  placeholder="Ex: 5511999999999"
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsNewMenuModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewMenu}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Criar Cardápio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
