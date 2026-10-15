export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  imageUrl: string;
  badge?: 'Mais Pedido' | 'Novidade' | 'Promoção' | 'Vegetariano' | 'Sugestão do Chef' | 'Sem Glúten';
  available: boolean;
  order: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  order: number;
}

export interface RestaurantMenu {
  id: string; // slug, e.g. "bellariobranco"
  name: string;
  tagline: string;
  segment: 'pizzaria' | 'hamburgueria' | 'restaurante' | 'padaria' | 'bar' | 'cafeteria';
  phone: string; // WhatsApp: 5511999999999
  address: string;
  city: string;
  logoUrl?: string;
  coverUrl?: string;
  themeColor: 'amber' | 'emerald' | 'rose' | 'indigo' | 'orange' | 'dark';
  currency: string;
  tableCount: number; // e.g. 15
  wifiName?: string;
  wifiPassword?: string;
  googleReviewUrl?: string;
  allowWhatsAppOrders: boolean;
  allowCallWaiter: boolean;
  categories: MenuCategory[];
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  observation?: string;
}

export const FOOD_PHOTO_PRESETS = [
  {
    category: 'Pizzas',
    name: 'Pizza Calabresa Forno a Lenha',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Pizzas',
    name: 'Pizza Margherita Especial',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Pizzas',
    name: 'Pizza Quatro Queijos Suprema',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Hambúrgueres',
    name: 'Hambúrguer Artesanal com Bacon',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Hambúrgueres',
    name: 'Smash Burger Duplo Cheddar',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Porções',
    name: 'Batata Frita Rústica Crocante',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Porções',
    name: 'Iscas de Filé com Molho',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Bebidas',
    name: 'Chopp Artesanal Gelado',
    url: 'https://images.unsplash.com/photo-1608270119159-247545938bf8?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Bebidas',
    name: 'Suco Natural da Fruta',
    url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Sobremesas',
    name: 'Petit Gâteau com Sorvete',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Sobremesas',
    name: 'Torta Cheesecake de Frutas Vermelhas',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Cafeteria & Padaria',
    name: 'Cappuccino Italiano com Arte',
    url: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'Cafeteria & Padaria',
    name: 'Croissant Recheado Folhado',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_MENUS: RestaurantMenu[] = [
  {
    id: 'bellariobranco',
    name: 'Padaria & Confeitaria Bella Rio Branco',
    tagline: 'Pizzas artesanais, lanches especiais, cafés e confeitaria fina desde 1994',
    segment: 'pizzaria',
    phone: '5511987654321',
    address: 'Av. Rio Branco, 450 - Centro',
    city: 'São Paulo - SP',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'amber',
    currency: 'BRL',
    tableCount: 16,
    wifiName: 'BellaRioBranco_Clientes',
    wifiPassword: 'paoquentinho2026',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
    allowWhatsAppOrders: true,
    allowCallWaiter: true,
    categories: [
      { id: 'cat-pizzas', name: 'Pizzas Forno a Lenha', icon: 'Pizza', order: 1, description: 'Massa artesanal de fermentação lenta 48h' },
      { id: 'cat-lanches', name: 'Lanches & Hambúrgueres', icon: 'Utensils', order: 2, description: 'Servidos no pão brioche da casa' },
      { id: 'cat-porcoes', name: 'Porções da Casa', icon: 'UtensilsCrossed', order: 3, description: 'Perfeitas para compartilhar na mesa' },
      { id: 'cat-bebidas', name: 'Bebidas & Cafés', icon: 'Coffee', order: 4, description: 'Sucos naturais, refrigerantes e cafés especiais' },
      { id: 'cat-sobremesas', name: 'Confeitaria & Doces', icon: 'Sparkles', order: 5, description: 'Sobremesas artesanais exclusivas' }
    ],
    items: [
      {
        id: 'item-1',
        categoryId: 'cat-pizzas',
        name: 'Pizza Calabresa Especial Forno a Lenha',
        description: 'Molho de tomate pelado San Marzano, mussarela fatiada, calabresa artesanal especial, cebola roxa marinada e azeitonas pretas.',
        price: 59.90,
        promotionalPrice: 49.90,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        badge: 'Mais Pedido',
        available: true,
        order: 1
      },
      {
        id: 'item-2',
        categoryId: 'cat-pizzas',
        name: 'Pizza Margherita Bella Rio',
        description: 'Molho pomodoro artesanal, fatias de mussarela de búfala fresca, tomates cereja confitados e folhas frescas de manjericão.',
        price: 64.90,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
        badge: 'Sugestão do Chef',
        available: true,
        order: 2
      },
      {
        id: 'item-3',
        categoryId: 'cat-pizzas',
        name: 'Pizza 4 Queijos Suprema',
        description: 'Creme de queijos especiais: mussarela derretida, provolone defumado, gorgonzola legítimo e catupiry original da bisnaga.',
        price: 68.90,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
        available: true,
        order: 3
      },
      {
        id: 'item-4',
        categoryId: 'cat-lanches',
        name: 'Smash Burger Bella Duplo',
        description: '2x discos smash de 100g de fraldinha, queijo cheddar inglês duplo, bacon artesanal caramelizado no pão brioche tostado na manteiga.',
        price: 36.90,
        promotionalPrice: 32.90,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        badge: 'Mais Pedido',
        available: true,
        order: 1
      },
      {
        id: 'item-5',
        categoryId: 'cat-lanches',
        name: 'Bauru Tradicional no Francês Redondo',
        description: 'Rosbife caseiro fatiado fininho, queijo prato derretido na chapa, tomate caqui e picles crocante.',
        price: 28.50,
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        available: true,
        order: 2
      },
      {
        id: 'item-6',
        categoryId: 'cat-porcoes',
        name: 'Batata Rústica com Cheddar e Bacon',
        description: '500g de batatas rústicas com casca, temperadas com alecrim, cobertas com molho cremoso de cheddar e crispy de bacon.',
        price: 38.00,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
        badge: 'Mais Pedido',
        available: true,
        order: 1
      },
      {
        id: 'item-7',
        categoryId: 'cat-bebidas',
        name: 'Chopp Pilsen Artesanal 500ml',
        description: 'Chopp tirado na pressão, colarinho cremoso, servido em caldereta ultracongelada.',
        price: 14.00,
        imageUrl: 'https://images.unsplash.com/photo-1608270119159-247545938bf8?auto=format&fit=crop&w=600&q=80',
        badge: 'Promoção',
        available: true,
        order: 1
      },
      {
        id: 'item-8',
        categoryId: 'cat-bebidas',
        name: 'Suco de Laranja Natural 400ml',
        description: 'Feito na hora com laranjas selecionadas, sem adição de açúcar e sem conservantes.',
        price: 11.50,
        imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80',
        available: true,
        order: 2
      },
      {
        id: 'item-9',
        categoryId: 'cat-sobremesas',
        name: 'Petit Gâteau Belga com Sorvete de Creme',
        description: 'Bolo quente com coração de chocolate meio amargo derretido, acompanhado de bola de sorvete de baunilha Bourbon e calda morna.',
        price: 24.90,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        badge: 'Novidade',
        available: true,
        order: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'panificadorasuica',
    name: 'Panificadora & Cafeteria Suíça',
    tagline: 'Tradição artesanal, cafés de grãos selecionados e confeitaria suíça',
    segment: 'padaria',
    phone: '5511977778888',
    address: 'Rua das Flores, 180 - Jardim Europa',
    city: 'São Paulo - SP',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'rose',
    currency: 'BRL',
    tableCount: 12,
    wifiName: 'Suica_Padaria_Free',
    wifiPassword: 'cafecomcroissant',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
    allowWhatsAppOrders: true,
    allowCallWaiter: true,
    categories: [
      { id: 'cat-cafes', name: 'Cafés & Bebidas Especiais', icon: 'Coffee', order: 1 },
      { id: 'cat-salgados', name: 'Croissants & Pães Especiais', icon: 'Utensils', order: 2 },
      { id: 'cat-tortas', name: 'Doces & Confeitaria Fina', icon: 'Sparkles', order: 3 }
    ],
    items: [
      {
        id: 'item-s1',
        categoryId: 'cat-cafes',
        name: 'Cappuccino Suíço com Borda de Chocolate',
        description: 'Espresso duplo, leite vaporizado aveludado e borda generosa de ganache de chocolate suíço.',
        price: 16.90,
        imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=600&q=80',
        badge: 'Mais Pedido',
        available: true,
        order: 1
      },
      {
        id: 'item-s2',
        categoryId: 'cat-salgados',
        name: 'Croissant Francês com Queijo Brie e Damasco',
        description: 'Massa folhada artesanal na manteiga pura, fatias de queijo brie derretido e geleia rústica de damasco.',
        price: 24.50,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        badge: 'Sugestão do Chef',
        available: true,
        order: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
