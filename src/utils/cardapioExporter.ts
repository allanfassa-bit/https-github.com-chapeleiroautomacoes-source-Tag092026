import JSZip from 'jszip';
import { RestaurantMenu, CartItem } from '../types/cardapio';
import { generateQrDataUrl } from './qrCodeGenerator';

/**
 * Formata um valor numérico em moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Constrói a mensagem de pedido pronta para envio via WhatsApp
 */
export function buildWhatsAppOrderMessage(
  menu: RestaurantMenu,
  cart: CartItem[],
  tableNumber: string,
  customerName?: string,
  orderType: 'mesa' | 'balcao' | 'delivery' = 'mesa',
  paymentMethod: string = 'Pix',
  generalNotes?: string
): string {
  const total = cart.reduce((sum, item) => {
    const unitPrice = item.item.promotionalPrice ?? item.item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const lines: string[] = [];
  lines.push(`🍽️ *NOVO PEDIDO - ${menu.name.toUpperCase()}*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  if (orderType === 'mesa') {
    lines.push(`📍 *Local:* MESA ${tableNumber || '01'}`);
  } else if (orderType === 'balcao') {
    lines.push(`📍 *Local:* Retirada no Balcão`);
  } else {
    lines.push(`📍 *Local:* Entrega / Delivery`);
  }

  if (customerName && customerName.trim()) {
    lines.push(`👤 *Cliente:* ${customerName.trim()}`);
  }
  lines.push(`⏰ *Horário:* ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*ITENS DO PEDIDO:*`);

  cart.forEach((cartItem, idx) => {
    const unitPrice = cartItem.item.promotionalPrice ?? cartItem.item.price;
    const subtotal = unitPrice * cartItem.quantity;
    lines.push(`*${cartItem.quantity}x* ${cartItem.item.name} - ${formatCurrency(subtotal)}`);
    if (cartItem.observation && cartItem.observation.trim()) {
      lines.push(`   _Obs: ${cartItem.observation.trim()}_`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *TOTAL:* *${formatCurrency(total)}*`);
  lines.push(`💳 *Forma de Pagamento:* ${paymentMethod}`);

  if (generalNotes && generalNotes.trim()) {
    lines.push(`📝 *Observações Gerais:* ${generalNotes.trim()}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Pedido gerado via Cardápio Digital NFC / QR Code_`);

  return lines.join('\n');
}

/**
 * Gera o código HTML completo e independente do Cardápio Digital (pronto para Vercel / Netlify / Single file)
 */
export function generateStandaloneCardapioHtml(menu: RestaurantMenu, defaultTable: string = '01'): string {
  const safeJson = JSON.stringify(menu).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${menu.name} | Cardápio Digital</title>
  <meta name="description" content="${menu.tagline || 'Confira nosso cardápio completo com fotos, preços e faça seu pedido direto pelo WhatsApp!'}" />
  <meta property="og:title" content="${menu.name} | Cardápio Digital" />
  <meta property="og:description" content="${menu.tagline || 'Cardápio digital interativo para mesas'}" />
  <meta property="og:image" content="${menu.coverUrl || menu.logoUrl || ''}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#fffbeb',
              100: '#fef3c7',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .animate-slide-up { animation: slideUp 0.25s ease-out; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen pb-32">
  <div id="app" class="max-w-md mx-auto relative min-h-screen bg-slate-950 shadow-2xl overflow-x-hidden">
    <!-- Header Hero -->
    <header class="relative h-56 bg-slate-850 overflow-hidden">
      <img id="coverImg" src="${menu.coverUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}" alt="Capa" class="w-full h-full object-cover filter brightness-[0.65]" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      
      <!-- Top Badges -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div id="tableBadge" class="bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-300/40">
          <span>📍</span>
          <span id="tableLabel">MESA ${defaultTable}</span>
        </div>
        <div class="flex items-center gap-2">
          ${menu.wifiPassword ? `
          <button onclick="toggleWifiModal()" class="bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-700/60 shadow-lg active:scale-95 transition-all">
            <span>📶</span> <span>Wi-Fi</span>
          </button>` : ''}
          ${menu.allowCallWaiter ? `
          <button onclick="callWaiter()" class="bg-emerald-600/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-400/40 shadow-lg active:scale-95 transition-all">
            <span>🛎️</span> <span>Garçom</span>
          </button>` : ''}
        </div>
      </div>

      <!-- Restaurant Info Overlay -->
      <div class="absolute bottom-4 left-4 right-4 z-10 flex items-end gap-3.5">
        <img id="logoImg" src="${menu.logoUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80'}" alt="Logo" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/70 shadow-xl bg-slate-900 shrink-0" />
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-extrabold text-white tracking-tight leading-tight truncate">${menu.name}</h1>
          <p class="text-xs text-slate-300 line-clamp-1 mt-0.5">${menu.tagline}</p>
          <div class="flex items-center gap-2 mt-1.5 text-[11px] text-amber-400">
            <span class="inline-flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Aberto agora
            </span>
            ${menu.googleReviewUrl ? `
            <a href="${menu.googleReviewUrl}" target="_blank" class="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-slate-200 font-medium transition-colors">
              ⭐ 5.0 no Google
            </a>` : ''}
          </div>
        </div>
      </div>
    </header>

    <!-- Search & Category Sticky Navigation -->
    <div class="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md pt-3 pb-2 px-4 border-b border-slate-800/80 shadow-md">
      <!-- Search Bar -->
      <div class="relative mb-2.5">
        <input 
          id="searchInput"
          type="text" 
          placeholder="O que você quer pedir hoje? (ex: calabresa, burger...)"
          oninput="handleSearch(this.value)"
          class="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-inner"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Category Filter Pills -->
      <div id="categoryPills" class="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <!-- Rendered by JS -->
      </div>
    </div>

    <!-- Products Section -->
    <main class="px-4 py-4 space-y-6">
      <div id="productsContainer" class="space-y-6">
        <!-- Rendered by JS -->
      </div>
    </main>

    <!-- Floating Cart Bar -->
    <div id="floatingCart" class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 transition-all duration-300 transform translate-y-32">
      <button onclick="openCartModal()" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-300/40 active:scale-[0.98] transition-all">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow">
            <span id="cartCount">0</span>
          </div>
          <div class="text-left">
            <div class="text-xs uppercase font-extrabold tracking-wider text-slate-950/80">Ver Comanda / Pedido</div>
            <div id="cartSubtotal" class="text-base font-black text-slate-950">R$ 0,00</div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm font-extrabold bg-slate-950/15 px-3 py-1.5 rounded-xl">
          <span>Avançar</span>
          <span>→</span>
        </div>
      </button>
    </div>

    <!-- Cart Modal / Checkout Drawer -->
    <div id="cartModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-end justify-center">
      <div class="bg-slate-900 border-t border-slate-700 w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛒</span>
            <h3 class="text-lg font-bold text-white">Comanda da Mesa</h3>
          </div>
          <button onclick="closeCartModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold hover:text-white">✕</button>
        </div>

        <div id="cartItemsList" class="p-4 overflow-y-auto flex-1 space-y-3">
          <!-- Rendered by JS -->
        </div>

        <!-- Checkout Details -->
        <div class="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <!-- Mesa Selector & Customer Name -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[11px] font-bold text-slate-400 block mb-1">MESA / LOCAL</label>
              <select id="checkoutTableSelect" class="w-full bg-slate-850 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-400">
                ${Array.from({ length: menu.tableCount || 15 }, (_, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  return `<option value="${num}" ${num === defaultTable ? 'selected' : ''}>Mesa ${num}</option>`;
                }).join('')}
              </select>
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-400 block mb-1">FORMA PAGAMENTO</label>
              <select id="checkoutPaymentSelect" class="w-full bg-slate-850 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-400">
                <option value="Pix">Pix no Caixa</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-400 block mb-1">SEU NOME (OPCIONAL)</label>
            <input id="checkoutCustomerName" type="text" placeholder="Ex: Allan" class="w-full bg-slate-850 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-400" />
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-400 block mb-1">OBSERVAÇÕES GERAIS</label>
            <input id="checkoutNotes" type="text" placeholder="Ex: Trazer pratos extras, gelo e limão..." class="w-full bg-slate-850 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-400" />
          </div>

          <!-- Total & WhatsApp Button -->
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span class="text-sm text-slate-400">Total a pagar:</span>
            <span id="checkoutTotalAmount" class="text-xl font-extrabold text-amber-400">R$ 0,00</span>
          </div>

          <button onclick="sendOrderToWhatsApp()" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.453.748.972 1.21.668.594 1.232.779 1.405.866.173.087.275.072.376-.043.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.42-.101.825z"/></svg>
            <span>Enviar Pedido para a Cozinha</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Wi-Fi Modal -->
    <div id="wifiModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center space-y-4">
        <div class="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl">📶</div>
        <h3 class="text-lg font-bold text-white">Wi-Fi de Clientes</h3>
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Rede:</span>
            <span class="font-bold text-white">${menu.wifiName || 'Wi-Fi Clientes'}</span>
          </div>
          <div class="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
            <span class="text-slate-400">Senha:</span>
            <span id="wifiPasswordText" class="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">${menu.wifiPassword || 'Sem senha'}</span>
          </div>
        </div>
        <button onclick="copyWifiPassword('${menu.wifiPassword || ''}')" id="copyWifiBtn" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors">
          Copiar Senha do Wi-Fi
        </button>
        <button onclick="toggleWifiModal()" class="text-xs text-slate-400 hover:text-white">Fechar</button>
      </div>
    </div>
  </div>

  <script>
    const MENU_DATA = ${safeJson};
    let currentTable = '${defaultTable}';
    let selectedCategory = 'all';
    let searchQuery = '';
    let cart = [];

    // Parse URL parameter ?mesa=05 or ?table=05
    const urlParams = new URLSearchParams(window.location.search);
    const paramTable = urlParams.get('mesa') || urlParams.get('table');
    if (paramTable) {
      currentTable = String(paramTable).padStart(2, '0');
      const tableLabel = document.getElementById('tableLabel');
      if (tableLabel) tableLabel.textContent = 'MESA ' + currentTable;
      const checkoutSelect = document.getElementById('checkoutTableSelect');
      if (checkoutSelect) checkoutSelect.value = currentTable;
    }

    function init() {
      renderCategoryPills();
      renderProducts();
    }

    function renderCategoryPills() {
      const container = document.getElementById('categoryPills');
      if (!container) return;

      let html = '<button onclick="setCategory(\\'all\\')" class="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ' + 
        (selectedCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800') + 
        '">🔥 Todos (' + MENU_DATA.items.length + ')</button>';

      MENU_DATA.categories.forEach(cat => {
        const count = MENU_DATA.items.filter(i => i.categoryId === cat.id).length;
        const isActive = selectedCategory === cat.id;
        html += '<button onclick="setCategory(\\'' + cat.id + '\\')" class="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ' + 
          (isActive ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800') + 
          '">' + cat.name + ' (' + count + ')</button>';
      });

      container.innerHTML = html;
    }

    function setCategory(catId) {
      selectedCategory = catId;
      renderCategoryPills();
      renderProducts();
    }

    function handleSearch(val) {
      searchQuery = val.toLowerCase().trim();
      renderProducts();
    }

    function renderProducts() {
      const container = document.getElementById('productsContainer');
      if (!container) return;

      let filtered = MENU_DATA.items;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(i => i.categoryId === selectedCategory);
      }
      if (searchQuery) {
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(searchQuery) || 
          i.description.toLowerCase().includes(searchQuery)
        );
      }

      if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center py-12 text-slate-400"><div class="text-3xl mb-2">🔍</div><p class="font-medium text-sm">Nenhum item encontrado.</p></div>';
        return;
      }

      // Group by category if "all" is selected and no search
      if (selectedCategory === 'all' && !searchQuery) {
        let fullHtml = '';
        MENU_DATA.categories.forEach(cat => {
          const itemsInCat = filtered.filter(i => i.categoryId === cat.id);
          if (itemsInCat.length === 0) return;

          fullHtml += '<div class="space-y-3">';
          fullHtml += '<div class="border-b border-slate-800/80 pb-2"><h2 class="text-base font-extrabold text-white tracking-tight flex items-center gap-2"><span>' + cat.name + '</span><span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">' + itemsInCat.length + '</span></h2>' + (cat.description ? '<p class="text-xs text-slate-400 mt-0.5">' + cat.description + '</p>' : '') + '</div>';
          fullHtml += '<div class="space-y-3">';
          itemsInCat.forEach(item => {
            fullHtml += renderProductCard(item);
          });
          fullHtml += '</div></div>';
        });
        container.innerHTML = fullHtml;
      } else {
        container.innerHTML = '<div class="space-y-3">' + filtered.map(item => renderProductCard(item)).join('') + '</div>';
      }
    }

    function renderProductCard(item) {
      const priceFormatted = (item.promotionalPrice || item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const originalPrice = item.promotionalPrice ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null;

      return '<div class="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 hover:border-slate-700/80 transition-all flex gap-3.5 relative overflow-hidden shadow-sm">' +
        (item.badge ? '<span class="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow uppercase tracking-wider z-10">' + item.badge + '</span>' : '') +
        '<div class="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative ring-1 ring-slate-800">' +
          '<img src="' + item.imageUrl + '" alt="' + item.name + '" class="w-full h-full object-cover" loading="lazy" />' +
        '</div>' +
        '<div class="flex-1 min-w-0 flex flex-col justify-between">' +
          '<div>' +
            '<h3 class="font-bold text-sm text-white leading-snug line-clamp-1">' + item.name + '</h3>' +
            '<p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">' + item.description + '</p>' +
          '</div>' +
          '<div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">' +
            '<div class="flex items-baseline gap-1.5">' +
              '<span class="font-black text-sm text-amber-400">' + priceFormatted + '</span>' +
              (originalPrice ? '<span class="text-[11px] text-slate-400 line-through">' + originalPrice + '</span>' : '') +
            '</div>' +
            '<button onclick="addToCart(\\'' + item.id + '\\')" class="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-all">' +
              '<span>+</span> <span>Adicionar</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function addToCart(itemId) {
      const product = MENU_DATA.items.find(i => i.id === itemId);
      if (!product) return;

      const existing = cart.find(c => c.item.id === itemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ item: product, quantity: 1, observation: '' });
      }

      updateCartUI();
    }

    function changeQuantity(itemId, delta) {
      const idx = cart.findIndex(c => c.item.id === itemId);
      if (idx === -1) return;

      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
      }
      updateCartUI();
    }

    function updateObservation(itemId, text) {
      const item = cart.find(c => c.item.id === itemId);
      if (item) item.observation = text;
    }

    function updateCartUI() {
      const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = cart.reduce((sum, i) => sum + (i.item.promotionalPrice || i.item.price) * i.quantity, 0);

      const floatingCart = document.getElementById('floatingCart');
      const cartCount = document.getElementById('cartCount');
      const cartSubtotal = document.getElementById('cartSubtotal');
      const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');

      if (cartCount) cartCount.textContent = totalCount;
      const formattedTotal = totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      if (cartSubtotal) cartSubtotal.textContent = formattedTotal;
      if (checkoutTotalAmount) checkoutTotalAmount.textContent = formattedTotal;

      if (floatingCart) {
        if (totalCount > 0) {
          floatingCart.classList.remove('translate-y-32');
        } else {
          floatingCart.classList.add('translate-y-32');
          closeCartModal();
        }
      }

      renderCartItemsList();
    }

    function renderCartItemsList() {
      const list = document.getElementById('cartItemsList');
      if (!list) return;

      if (cart.length === 0) {
        list.innerHTML = '<div class="text-center py-8 text-slate-400"><p>Sua comanda está vazia.</p></div>';
        return;
      }

      list.innerHTML = cart.map(cartItem => {
        const itemPrice = (cartItem.item.promotionalPrice || cartItem.item.price) * cartItem.quantity;
        return '<div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">' +
          '<div class="flex items-center justify-between">' +
            '<div class="flex-1 min-w-0 pr-2">' +
              '<h4 class="font-bold text-sm text-white truncate">' + cartItem.item.name + '</h4>' +
              '<span class="text-xs font-semibold text-amber-400">' + itemPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">' +
              '<button onclick="changeQuantity(\\'' + cartItem.item.id + '\\', -1)" class="text-slate-400 hover:text-white font-bold w-5 h-5 flex items-center justify-center">-</button>' +
              '<span class="text-xs font-black text-white w-4 text-center">' + cartItem.quantity + '</span>' +
              '<button onclick="changeQuantity(\\'' + cartItem.item.id + '\\', 1)" class="text-slate-400 hover:text-white font-bold w-5 h-5 flex items-center justify-center">+</button>' +
            '</div>' +
          '</div>' +
          '<input type="text" placeholder="Observações deste item (ex: sem cebola)" value="' + (cartItem.observation || '') + '" oninput="updateObservation(\\'' + cartItem.item.id + '\\', this.value)" class="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400" />' +
        '</div>';
      }).join('');
    }

    function openCartModal() {
      const modal = document.getElementById('cartModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeCartModal() {
      const modal = document.getElementById('cartModal');
      if (modal) modal.classList.add('hidden');
    }

    function toggleWifiModal() {
      const modal = document.getElementById('wifiModal');
      if (modal) modal.classList.toggle('hidden');
    }

    function copyWifiPassword(pass) {
      if (!pass) return;
      navigator.clipboard.writeText(pass).then(() => {
        const btn = document.getElementById('copyWifiBtn');
        if (btn) {
          btn.textContent = '✓ Senha Copiada com Sucesso!';
          btn.classList.add('bg-emerald-500', 'text-white');
          setTimeout(() => {
            btn.textContent = 'Copiar Senha do Wi-Fi';
            btn.classList.remove('bg-emerald-500', 'text-white');
          }, 2000);
        }
      });
    }

    function callWaiter() {
      const selTable = document.getElementById('checkoutTableSelect');
      const tableVal = (selTable ? selTable.value : currentTable) || '01';
      const msg = encodeURIComponent('🛎️ *CHAMAR GARÇOM*\\nPor favor, o cliente da *MESA ' + tableVal + '* está solicitando atendimento!');
      window.open('https://api.whatsapp.com/send?phone=' + MENU_DATA.phone.replace(/[^0-9]/g, '') + '&text=' + msg, '_blank');
    }

    function sendOrderToWhatsApp() {
      if (cart.length === 0) return;

      const selTable = document.getElementById('checkoutTableSelect');
      const tableVal = selTable ? selTable.value : currentTable;
      const customerName = document.getElementById('checkoutCustomerName')?.value || '';
      const notes = document.getElementById('checkoutNotes')?.value || '';
      const paymentMethod = document.getElementById('checkoutPaymentSelect')?.value || 'Pix';

      let text = '🍽️ *NOVO PEDIDO - ' + MENU_DATA.name.toUpperCase() + '*\\n';
      text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '📍 *Local:* MESA ' + (tableVal || '01') + '\\n';
      if (customerName.trim()) text += '👤 *Cliente:* ' + customerName.trim() + '\\n';
      text += '⏰ *Horário:* ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '\\n';
      text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '*ITENS DO PEDIDO:*\\n';

      let total = 0;
      cart.forEach(c => {
        const price = (c.item.promotionalPrice || c.item.price) * c.quantity;
        total += price;
        text += '*' + c.quantity + 'x* ' + c.item.name + ' - ' + price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '\\n';
        if (c.observation && c.observation.trim()) {
          text += '   _Obs: ' + c.observation.trim() + '_\\n';
        }
      });

      text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '💰 *TOTAL:* *' + total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '*\\n';
      text += '💳 *Forma de Pagamento:* ' + paymentMethod + '\\n';
      if (notes.trim()) text += '📝 *Observações:* ' + notes.trim() + '\\n';
      text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '_Pedido via Cardápio Digital NFC / QR Code_';

      const cleanPhone = MENU_DATA.phone.replace(/[^0-9]/g, '');
      const url = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    }

    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      init();
    }
  </script>
</body>
</html>`;
}

/**
 * Cria o pacote ZIP pronto para publicação direta na Vercel ou Netlify
 */
export async function downloadCardapioZip(menu: RestaurantMenu): Promise<void> {
  const zip = new JSZip();

  // 1. Arquivo HTML principal
  const htmlContent = generateStandaloneCardapioHtml(menu);
  zip.file('index.html', htmlContent);

  // 2. Configuração vercel.json para hospedagem otimizada
  const vercelJson = JSON.stringify({
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
          { "key": "X-Content-Type-Options", "value": "nosniff" }
        ]
      }
    ]
  }, null, 2);
  zip.file('vercel.json', vercelJson);

  // 3. Guia README.md de publicação passo a passo
  const readmeContent = `# Cardápio Digital - ${menu.name}

Este pacote contém o Cardápio Digital responsivo e otimizado para mesas (QR Code e NFC) de **${menu.name}**.

## Como hospedar gratuitamente na Vercel (menos de 1 minuto):

1. Acesse https://vercel.com e entre na sua conta (ou crie uma gratuita).
2. Na tela inicial (Dashboard), clique no botão **"Add New..."** e selecione **"Project"**.
3. Basta **arrastar esta pasta descompactada** para a área de upload da Vercel.
4. Clique em **Deploy**.
5. Pronto! Você receberá o link seguro do cardápio (ex: \`https://${menu.id}.vercel.app\`).

## Como usar nas Mesas com QR Code:
Para cada mesa, adicione \`?mesa=01\`, \`?mesa=02\`, etc. ao final do link:
- Mesa 1: \`https://${menu.id}.vercel.app/?mesa=01\`
- Mesa 2: \`https://${menu.id}.vercel.app/?mesa=02\`

Quando o cliente escanear o QR Code da mesa, a comanda já abre identificando a mesa dele automaticamente!
`;
  zip.file('README.md', readmeContent);

  // Gerar e baixar arquivo ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `cardapio-${menu.id}-vercel.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Baixa o HTML único para teste ou hospedagem direta
 */
export function downloadCardapioHtml(menu: RestaurantMenu): void {
  const html = generateStandaloneCardapioHtml(menu);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `cardapio-${menu.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Abre o preview ao vivo em nova aba
 */
export function openCardapioLivePreview(menu: RestaurantMenu, tableNumber: string = '01'): void {
  const html = generateStandaloneCardapioHtml(menu, tableNumber);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
