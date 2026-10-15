/**
 * Base de Dados Visual e Estilística por Ramo de Atuação (Nichos)
 * Fornece fotografia de altíssima resolução (Unsplash curado), paletas de cores,
 * gatilhos de conversão, prompts de IA, termos técnicos e estilos de animação para cada setor.
 */

export interface NicheVisualAssets {
  image_prompts: {
    hero: string;
    showcase: string[];
    ambient: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    darkBg: string;
    glow: string;
  };
  animation_style: 'premium_fade' | 'dynamic_slide' | 'smooth_reveal' | 'energetic_pop' | 'elegant_glow' | string;
}

export interface NicheVisualProfile {
  id: string;
  category: 'mercado' | 'mecanica' | 'estetica' | 'odontologia' | 'gastronomia' | 'fitness' | 'pet' | 'juridico' | 'geral';
  name: string;
  styleMode: 'fresh_market' | 'industrial' | 'luxury' | 'medical' | 'gastronomic' | 'energetic' | 'friendly' | 'corporate' | 'modern';
  visual_assets: NicheVisualAssets;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    darkBg: string;
    cardBorder?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontImportUrl?: string;
  };
  images: {
    hero: string;
    about: string;
    gallery: Array<{ url: string; title: string; category: string }>;
    serviceThumbnails: string[];
  };
  badges: string[];
  defaultMetrics: Array<{ value: string; label: string }>;
  defaultQuoteOptions: Array<{ name: string; estimatedPrice: string; highlight: string }>;
  defaultServices: Array<{ title: string; description: string; badge: string }>;
}

export const NICHE_VISUAL_REGISTRY: Record<string, NicheVisualProfile> = {
  // ==========================================
  // 1. SUPERMERCADO / MERCADO / HORTIFRUTI
  // ==========================================
  mercado: {
    id: 'mercado',
    category: 'mercado',
    name: 'Supermercado, Mercado & Hortifruti',
    styleMode: 'fresh_market',
    visual_assets: {
      image_prompts: {
        hero: "Ultra-realistic photograph of a vibrant modern supermarket fresh produce aisle, colorful organic fruits and vegetables neatly arranged on rustic wooden crates, bright warm overhead lighting, clean polished floor, professional commercial photography 8k",
        showcase: [
          "Close-up of freshly harvested crisp greens, artisan breads and citrus fruits",
          "Gourmet butcher department with premium clean cuts of beef and poultry",
          "Artisanal bakery section with golden crust sourdough loaves and warm pastries",
          "Eco-friendly paper shopping bag packed with fresh healthy groceries ready for delivery"
        ],
        ambient: "Lively, clean, inviting neighborhood supermarket atmosphere with natural wood accents and emerald green signage"
      },
      palette: {
        primary: '#047857', // Verde esmeralda fresco
        secondary: '#b91c1c', // Vermelho ofertas
        accent: '#d97706', // Âmbar feira
        background: '#fcfdfb',
        surface: '#ffffff',
        text: '#14281d',
        darkBg: '#051b11',
        glow: '#047857'
      },
      animation_style: 'dynamic_slide'
    },
    colors: {
      primary: '#047857',
      secondary: '#b91c1c',
      accent: '#d97706',
      bg: '#fcfdfb',
      surface: '#ffffff',
      text: '#14281d',
      darkBg: '#051b11',
      cardBorder: '#e2ece6'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
          title: 'Hortifruti Selecionado Diário',
          category: 'Produtos Frescos'
        },
        {
          url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80',
          title: 'Açougue & Cortes Especiais',
          category: 'Qualidade Garantida'
        },
        {
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
          title: 'Padaria Artesanal & Confeitaria',
          category: 'Fornadas Quentes'
        },
        {
          url: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80',
          title: 'Entrega Rápida no Bairro',
          category: 'Delivery WhatsApp'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Hortifruti Fresco Todo Dia', 'Preço Justo de Verdade', 'Entrega Rápida WhatsApp'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Avaliação Google' },
      { value: '+8.000', label: 'Itens em Estoque' },
      { value: '30 min', label: 'Entrega Express' },
      { value: '100%', label: 'Origem Selecionada' }
    ],
    defaultQuoteOptions: [
      { name: 'Cesta Hortifruti & Feira da Semana', estimatedPrice: 'A partir de R$ 79', highlight: 'Mais Pedido' },
      { name: 'Combo Carnes Nobres & Churrasco', estimatedPrice: 'Sob medida', highlight: 'Cortes Especiais' },
      { name: 'Lista de Compras Completa via WhatsApp', estimatedPrice: 'Entrega Imediata', highlight: 'Economia Garantida' }
    ],
    defaultServices: [
      {
        title: 'Hortifruti & Verduras Selecionadas',
        description: 'Frutas, legumes e verduras fresquinhas que chegam todos os dias dos melhores produtores.',
        badge: 'Colheita Diária'
      },
      {
        title: 'Açougue de Alta Qualidade',
        description: 'Cortes limpos, carnes nobres e atendimento personalizado para o seu dia a dia e churrasco.',
        badge: 'Cortes Selecionados'
      },
      {
        title: 'Delivery Express via WhatsApp',
        description: 'Mande sua lista de compras pelo WhatsApp e receba tudo embalado com cuidado no conforto de casa.',
        badge: 'Comodidade Total'
      }
    ]
  },

  // ==========================================
  // 2. OFICINA MECÂNICA / AUTO CENTER / REPARO
  // ==========================================
  mecanica: {
    id: 'mecanica',
    category: 'mecanica',
    name: 'Oficina Mecânica & Auto Center',
    styleMode: 'industrial',
    visual_assets: {
      image_prompts: {
        hero: "Cinematic photograph of a high-end auto repair workshop with hydraulic vehicle lift, clean epoxy garage floor, modern German car undergoing inspection, certified mechanic with tablet scanner, industrial blue and amber lighting, 8k resolution",
        showcase: [
          "Master automotive technician tuning an engine using digital diagnostic computer scanner",
          "Brand new ventilated disc brake calipers and sports suspension shock absorbers assembly",
          "High-precision 3D computerized laser wheel alignment calibration machine",
          "Comprehensive 30-point mechanical checkup inspection tablet report"
        ],
        ambient: "Professional high-tech automotive service center with steel tool cabinets, clean pneumatic lifts and focused lighting"
      },
      palette: {
        primary: '#0f172a', // Grafite industrial
        secondary: '#ea580c', // Laranja automotivo mecânico
        accent: '#2563eb', // Azul diagnóstico de precisão
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        darkBg: '#090d16',
        glow: '#ea580c'
      },
      animation_style: 'dynamic_slide'
    },
    colors: {
      primary: '#0f172a',
      secondary: '#ea580c',
      accent: '#2563eb',
      bg: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      darkBg: '#090d16',
      cardBorder: '#e2e8f0'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80',
          title: 'Diagnóstico Eletrônico & Scanner',
          category: 'Precisão Computadorizada'
        },
        {
          url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=800&q=80',
          title: 'Freios, Suspensão & Amortecedores',
          category: 'Segurança Máxima'
        },
        {
          url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          title: 'Alinhamento 3D & Balanceamento',
          category: 'Alta Tecnologia'
        },
        {
          url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
          title: 'Revisão Preventiva Geral',
          category: 'Garantia 1 Ano'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Diagnóstico Computadorizado 100% Preciso', 'Peças Originais com Garantia', 'Sem Letras Miúdas'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Avaliação no Google' },
      { value: '+4.500', label: 'Carros Reparados' },
      { value: '1 Ano', label: 'Garantia Formal Peças' },
      { value: '100%', label: 'Transparência de Peças' }
    ],
    defaultQuoteOptions: [
      { name: 'Revisão Preventiva & Check-up 30 Itens', estimatedPrice: 'Diagnóstico Expresso', highlight: 'Mais Procurado' },
      { name: 'Troca de Óleo, Filtros & Fluidos', estimatedPrice: 'Pacote Especial', highlight: 'Rápido & Garantido' },
      { name: 'Sistema de Freios, Pastilhas e Discos', estimatedPrice: 'Sob Avaliação', highlight: 'Segurança Máxima' },
      { name: 'Suspensão, Direção & Injeção Eletrônica', estimatedPrice: 'Orçamento Claro', highlight: 'Sem Surpresas' }
    ],
    defaultServices: [
      {
        title: 'Diagnóstico Eletrônico Computadorizado',
        description: 'Scanner de última geração para identificar falhas exatas na injeção, motor e módulos sem adivinhação.',
        badge: 'Precisão 100%'
      },
      {
        title: 'Manutenção de Freios e Suspensão',
        description: 'Revisão completa de discos, pastilhas, amortecedores e bandejas para garantir a segurança da sua família.',
        badge: 'Segurança Total'
      },
      {
        title: 'Revisão Completa para Viagem e Preventiva',
        description: 'Check-up detalhado de mais de 30 itens essenciais com relatório transparente em foto e vídeo no WhatsApp.',
        badge: 'Garantia 1 Ano'
      }
    ]
  },

  // ==========================================
  // 3. ESTÉTICA / HARMONIZAÇÃO / SPA / BELEZA
  // ==========================================
  estetica: {
    id: 'estetica',
    category: 'estetica',
    name: 'Clínica de Estética, Harmonização & Spa',
    styleMode: 'luxury',
    visual_assets: {
      image_prompts: {
        hero: "Ultra-luxury aesthetic clinic and spa interior, radiant model with flawless glowing porcelain skin receiving delicate skin rejuvenation treatment, minimalist curved architecture, champagne gold and bronze accents, soft diffused ambient glow, architectural digest photography",
        showcase: [
          "Specialist aesthetic practitioner performing delicate facial harmonization assessment",
          "Advanced clinical LED skincare glow therapy with soothing hydrogel mask",
          "VIP private treatment suite with warm marble, aromatic diffuser and plush treatment bed",
          "High-definition non-invasive body contouring sculpting technology"
        ],
        ambient: "Serene whisper-quiet beauty sanctuary with cashmere blankets, warm travertine marble and organic silk drapery"
      },
      palette: {
        primary: '#1c1917', // Obsidian Black Luxury
        secondary: '#c084fc', // Lilás Champanhe
        accent: '#be185d', // Rose Gold / Fúcsia Premium
        background: '#faf5f8',
        surface: '#ffffff',
        text: '#1c1917',
        darkBg: '#09050d',
        glow: '#c084fc'
      },
      animation_style: 'premium_fade'
    },
    colors: {
      primary: '#1c1917',
      secondary: '#c084fc',
      accent: '#be185d',
      bg: '#faf5f8',
      surface: '#ffffff',
      text: '#1c1917',
      darkBg: '#09050d',
      cardBorder: '#f3e8ee'
    },
    typography: {
      headingFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      fontImportUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap'
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1512290900672-1f02e6a0d013?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          title: 'Harmonização & Rejuvenescimento Facial',
          category: 'Protocolo VIP'
        },
        {
          url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          title: 'Skin Care Avançado & Glow Instantâneo',
          category: 'Tecnologia Estética'
        },
        {
          url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          title: 'Massagem Relaxante & Drenagem Linfática',
          category: 'Bem-Estar & Saúde'
        },
        {
          url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
          title: 'Tratamentos Corporais & Alta Definição',
          category: 'Resultados Visíveis'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Protocolos Exclusivos de Alta Performance', 'Ambiente Privativo & Atendimento VIP', 'Produtos de Grau Médico'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Google Avaliações' },
      { value: '+3.200', label: 'Transformações Reais' },
      { value: '100%', label: 'Produtos Certificados' },
      { value: 'VIP', label: 'Sala Exclusiva' }
    ],
    defaultQuoteOptions: [
      { name: 'Protocolo Glow Facial & Limpeza Profunda', estimatedPrice: 'Sessão Exclusiva', highlight: 'Mais Amado' },
      { name: 'Harmonização & Bioestimuladores de Colágeno', estimatedPrice: 'Consulta Personalizada', highlight: 'Alta Definição' },
      { name: 'Drenagem Linfática & Modeladora VIP', estimatedPrice: 'Pacote Especial', highlight: 'Efeito Imediato' },
      { name: 'Day Spa Relaxamento & Bem-Estar', estimatedPrice: 'Experiência Completa', highlight: 'Luxo & Paz' }
    ],
    defaultServices: [
      {
        title: 'Harmonização & Rejuvenescimento Facial',
        description: 'Técnicas sutis e refinadas que valorizam a sua beleza natural com naturalidade e elegância incomparáveis.',
        badge: 'Excelência Médica'
      },
      {
        title: 'Protocolos de Pele Glow & Skincare Clínico',
        description: 'Peelings suaves, hidratação profunda e renovação celular para uma pele radiante e com toque aveludado.',
        badge: 'Pele Perfeita'
      },
      {
        title: 'Modelagem Corporal & Drenagem Especializada',
        description: 'Associação de tecnologias de ponta e técnicas manuais para redução de medidas e relaxamento absoluto.',
        badge: 'Resultados Visíveis'
      }
    ]
  },

  // ==========================================
  // 4. DENTISTA / ODONTOLOGIA / ORTODONTIA
  // ==========================================
  odontologia: {
    id: 'odontologia',
    category: 'odontologia',
    name: 'Clínica Odontológica & Ortodontia',
    styleMode: 'medical',
    visual_assets: {
      image_prompts: {
        hero: "Pristine contemporary dental clinic with ergonomic treatment chair, 3D intraoral digital scanner display showing dental arches, bright natural confident smile, soft teal and white lighting, medical excellence photography",
        showcase: [
          "Gentle laser teeth whitening procedure with high-tech blue light activator",
          "Crystal clear invisible orthodontic aligners in premium protective case",
          "Computer-guided painless dental implant simulation on high-resolution monitor",
          "Friendly pediatric dentistry welcoming room with compassionate doctors"
        ],
        ambient: "Ultra-clean, serene clinical environment designed to eliminate anxiety with soothing ambient lighting"
      },
      palette: {
        primary: '#0e7490', // Ciano médico profundo
        secondary: '#0284c7', // Azul saúde
        accent: '#059669', // Verde aprovação
        background: '#f0fdfa',
        surface: '#ffffff',
        text: '#134e4a',
        darkBg: '#042f2e',
        glow: '#0e7490'
      },
      animation_style: 'smooth_reveal'
    },
    colors: {
      primary: '#0e7490',
      secondary: '#0284c7',
      accent: '#059669',
      bg: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      darkBg: '#042f2e',
      cardBorder: '#ccfbf1'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1629909615184-74f495363b63?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
          title: 'Clareamento Dental a Laser',
          category: 'Sorriso Branco'
        },
        {
          url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
          title: 'Aparelhos Invisíveis & Alinhadores',
          category: 'Ortodontia Moderna'
        },
        {
          url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80',
          title: 'Implantes & Próteses Guiadas',
          category: 'Sem Dor'
        },
        {
          url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
          title: 'Prevenção & Odontopediatria',
          category: 'Família Toda'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Tecnologia Guiada por Computador', 'Atendimento Humanizado Sem Dor', 'Aparelhos Invisíveis'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Google Avaliações' },
      { value: '+5.000', label: 'Sorrisos Renovados' },
      { value: '3D', label: 'Scanner Digital' },
      { value: '100%', label: 'Garantia Clínica' }
    ],
    defaultQuoteOptions: [
      { name: 'Avaliação Digital com Scanner 3D', estimatedPrice: 'Consulta Inicial', highlight: 'Sem Moldagem' },
      { name: 'Clareamento Dental a Laser Premium', estimatedPrice: 'Condição Especial', highlight: 'Resultado Imediato' },
      { name: 'Alinhadores Invisíveis Transparentes', estimatedPrice: 'Parcelamento em até 24x', highlight: 'Mais Confortável' },
      { name: 'Implantes Dentários com Carga Imediata', estimatedPrice: 'Sob Planejamento', highlight: 'Segurança Máxima' }
    ],
    defaultServices: [
      {
        title: 'Alinhadores Invisíveis e Ortodontia Digital',
        description: 'Dentes perfeitamente alinhados sem o incômodo dos fios metálicos tradicionais, com acompanhamento 3D.',
        badge: 'Estética Máxima'
      },
      {
        title: 'Implantes e Reabilitação Oral sem Dor',
        description: 'Recupere a mastigação e a confiança no sorriso com materiais importados de padrão suíço.',
        badge: 'Carga Imediata'
      },
      {
        title: 'Clareamento Dental e Lentes de Contato',
        description: 'Brilho natural, proporção perfeita e dentes iluminados com segurança e preservação biológica.',
        badge: 'Sorriso Marcante'
      }
    ]
  },

  // ==========================================
  // 5. RESTAURANTE / GASTRONOMIA / HAMBURGUERIA
  // ==========================================
  gastronomia: {
    id: 'gastronomia',
    category: 'gastronomia',
    name: 'Restaurante, Bar & Gastronomia',
    styleMode: 'gastronomic',
    visual_assets: {
      image_prompts: {
        hero: "Atmospheric gourmet restaurant interior with exposed brick and warm glowing Edison bulbs, executive chef finishing artisan fire-grilled dish with fresh herb drizzle, vibrant dining room bokeh, food editorial photography",
        showcase: [
          "Sizzling prime ribeye steak on cast iron skillet with fragrant rosemary butter",
          "Wood-fired Neapolitan pizza with blistered crust, melted fior di latte and fresh basil",
          "Artisanal brioche smash burger with crispy pancetta and melting cheddar",
          "Handcrafted mixology cocktail with crystal clear ice and citrus smoke"
        ],
        ambient: "Warm hospitable dining hall with candlelight, rich dark wood and bustling open kitchen"
      },
      palette: {
        primary: '#991b1b', // Vinho / Rubro gastronômico
        secondary: '#d97706', // Âmbar grelha
        accent: '#15803d', // Ervas frescas
        background: '#fdfbf7',
        surface: '#ffffff',
        text: '#291410',
        darkBg: '#180806',
        glow: '#d97706'
      },
      animation_style: 'energetic_pop'
    },
    colors: {
      primary: '#991b1b',
      secondary: '#d97706',
      accent: '#15803d',
      bg: '#fdfbf7',
      surface: '#ffffff',
      text: '#291410',
      darkBg: '#180806',
      cardBorder: '#f5e8e3'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          title: 'Pratos Principais & Grelhados',
          category: 'Culinária Autoral'
        },
        {
          url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          title: 'Hambúrgueres Artesanais & Porções',
          category: 'Sabor Explosivo'
        },
        {
          url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          title: 'Pizzas na Pedra com Fermentação Natural',
          category: 'Forno Especial'
        },
        {
          url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
          title: 'Sobremesas Finas & Drinks Autorais',
          category: 'Carta Exclusiva'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Ingredientes Selecionados a Dedo', 'Ambiente Acolhedor Climatizado', 'Delivery Rápido & Quentinho'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Google Avaliações' },
      { value: '+12.000', label: 'Pratos Servidos' },
      { value: '35 min', label: 'Tempo Delivery' },
      { value: '100%', label: 'Feito na Hora' }
    ],
    defaultQuoteOptions: [
      { name: 'Reserva de Mesa Especial para Casal/Família', estimatedPrice: 'Reserva Imediata', highlight: 'Sem Filas' },
      { name: 'Combo Degustação Especial do Chef', estimatedPrice: 'Preço Promocional', highlight: 'Mais Pedido' },
      { name: 'Cardápio Delivery Completo no WhatsApp', estimatedPrice: 'Entrega Express', highlight: 'Quentinho em Casa' }
    ],
    defaultServices: [
      {
        title: 'Experiência Gastronômica no Salão',
        description: 'Atendimento impecável, música ambiente agradável e pratos preparados ao vivo com técnica refinada.',
        badge: 'Ambiente Único'
      },
      {
        title: 'Delivery Rápido com Embalagem Térmica',
        description: 'Sua refeição chega com a mesma temperatura, textura e frescor de quando saiu da nossa cozinha.',
        badge: 'Entrega Perfeita'
      },
      {
        title: 'Eventos, Confraternizações & Aniversários',
        description: 'Espaço reservado e pacotes especiais de bebidas e petiscos para comemorações memoráveis.',
        badge: 'Eventos VIP'
      }
    ]
  },

  // ==========================================
  // 6. FITNESS / ACADEMIA / CROSSFIT
  // ==========================================
  fitness: {
    id: 'fitness',
    category: 'fitness',
    name: 'Academia, Centro Fitness & Cross Training',
    styleMode: 'energetic',
    visual_assets: {
      image_prompts: {
        hero: "Cinematic dark gym training facility with modern dumbbells, powerlifting racks, athlete training with chalk and high focus, dynamic rim lighting in neon red and amber, dramatic athletic commercial photography 8k",
        showcase: [
          "State-of-the-art cardiovascular and strength training equipment zone",
          "Dedicated high-intensity interval training crossfit functional arena",
          "Certified personal trainer conducting biometric evaluation and posture screening",
          "Clean modern locker room and recovery smoothie nutrition bar"
        ],
        ambient: "High-energy athletic center with industrial black rubber flooring and motivating LED lighting"
      },
      palette: {
        primary: '#09090b',
        secondary: '#ef4444',
        accent: '#f59e0b',
        background: '#09090b',
        surface: '#18181b',
        text: '#f4f4f5',
        darkBg: '#09090b',
        glow: '#ef4444'
      },
      animation_style: 'energetic_pop'
    },
    colors: {
      primary: '#09090b',
      secondary: '#ef4444',
      accent: '#f59e0b',
      bg: '#09090b',
      surface: '#18181b',
      text: '#f4f4f5',
      darkBg: '#09090b',
      cardBorder: '#27272a'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
          title: 'Área de Treinamento Funcional',
          category: 'Alta Intensidade'
        },
        {
          url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
          title: 'Equipamentos de Biomecânica',
          category: 'Musculação Pro'
        },
        {
          url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
          title: 'Acompanhamento com Personal',
          category: 'Resultados Rápidos'
        },
        {
          url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
          title: 'Aulas Coletivas & Spinning',
          category: 'Motivação em Grupo'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Instrutores Credenciados CREF', 'Ambiente Climatizado 100%', 'Planos Flexíveis Sem Fidelidade'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Nota Google Maps' },
      { value: '+900', label: 'Alunos Ativos' },
      { value: '6h às 23h', label: 'Horário Estendido' },
      { value: '100%', label: 'Foco no Resultado' }
    ],
    defaultQuoteOptions: [
      { name: 'Plano Mensal Livre', estimatedPrice: 'R$ 139,90/mês', highlight: 'Sem taxa de matrícula' },
      { name: 'Plano Anual VIP', estimatedPrice: 'R$ 99,90/mês', highlight: 'Economia de 30% + Avaliação' },
      { name: 'Personal Individual', estimatedPrice: 'Sob consulta', highlight: 'Treino 100% sob medida' }
    ],
    defaultServices: [
      {
        title: 'Musculação & Hipertrofia',
        description: 'Aparelhos modernos com biomecânica avançada para ganho muscular seguro e eficiente.',
        badge: 'Equipamentos Novos'
      },
      {
        title: 'Treinamento Funcional & Cross',
        description: 'Aulas dinâmicas que queimam calorias, melhoram resistência cardiovascular e mobilidade.',
        badge: 'Alta Intensidade'
      },
      {
        title: 'Avaliação Bioimpedância Periódica',
        description: 'Relatório detalhado de massa magra, gordura corporal e evolução mês a mês.',
        badge: 'Ciência & Métricas'
      }
    ]
  },

  // ==========================================
  // 7. PET SHOP & CLÍNICA VETERINÁRIA
  // ==========================================
  pet: {
    id: 'pet',
    category: 'pet',
    name: 'Pet Shop, Banho & Tosa & Veterinária',
    styleMode: 'friendly',
    visual_assets: {
      image_prompts: {
        hero: "Adorable happy golden retriever freshly groomed wearing stylish bandana sitting next to gentle veterinarian in clean modern pet clinic, soft teal and amber warm lighting, joyful caring commercial photography",
        showcase: [
          "Professional master pet groomer performing delicate scissors styling on fluffy poodle",
          "Compassionate veterinary examination with digital diagnostic monitoring",
          "Premium pet boutique section filled with healthy organic treats and interactive toys",
          "Safe and loving pet hotel daycare playground with happy socializing dogs"
        ],
        ambient: "Warm, hygienic, pet-friendly boutique with cheerful pastel tones and soothing acoustic environment"
      },
      palette: {
        primary: '#0f766e',
        secondary: '#f97316',
        accent: '#eab308',
        background: '#f0fdfa',
        surface: '#ffffff',
        text: '#134e4a',
        darkBg: '#042f2e',
        glow: '#f97316'
      },
      animation_style: 'smooth_reveal'
    },
    colors: {
      primary: '#0f766e',
      secondary: '#f97316',
      accent: '#eab308',
      bg: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      darkBg: '#042f2e',
      cardBorder: '#ccfbf1'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
          title: 'Banho & Tosa com Carinho',
          category: 'Spa Pet'
        },
        {
          url: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=800&q=80',
          title: 'Consultório Veterinário',
          category: 'Saúde & Vacinas'
        },
        {
          url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
          title: 'Boutique & Farmácia Pet',
          category: 'Produtos Premium'
        },
        {
          url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
          title: 'Hotelzinho & Creche',
          category: 'Socialização Segura'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Veterinários de Plantão', 'Produtos Hipoalergênicos', 'Táxi Pet com Ar Condicionado'],
    defaultMetrics: [
      { value: '5.0 ★', label: 'Google Maps' },
      { value: '+3.000', label: 'Pets Atendidos' },
      { value: '100%', label: 'Água Morna & Carinho' },
      { value: 'Livre', label: 'Leva & Traz Seguro' }
    ],
    defaultQuoteOptions: [
      { name: 'Banho Completo + Hidratação', estimatedPrice: 'A partir de R$ 65', highlight: 'Shampoo premium hipoalergênico' },
      { name: 'Tosa da Raça / Higiênica', estimatedPrice: 'A partir de R$ 90', highlight: 'Profissionais especialistas' },
      { name: 'Consulta Veterinária Geral', estimatedPrice: 'R$ 130', highlight: 'Exame clínico minucioso' }
    ],
    defaultServices: [
      {
        title: 'Banho Terapêutico & Tosa Especializada',
        description: 'Secagem silenciosa, toalhas esterilizadas e corte específico para o padrão da raça.',
        badge: 'Sem Estresse'
      },
      {
        title: 'Clínica Veterinária & Vacinação',
        description: 'Acompanhamento preventivo, vacinas importadas e exames rápidos para a longevidade do pet.',
        badge: 'Cuidado Médico'
      },
      {
        title: 'Táxi Pet Leva & Traz',
        description: 'Buscamos e levamos seu pet na sua casa com veículos adaptados e seguros.',
        badge: 'Comodidade Total'
      }
    ]
  },

  // ==========================================
  // 8. ESCRITÓRIO DE ADVOCACIA & JURÍDICO
  // ==========================================
  juridico: {
    id: 'juridico',
    category: 'juridico',
    name: 'Advocacia & Consultoria Jurídica',
    styleMode: 'corporate',
    visual_assets: {
      image_prompts: {
        hero: "Prestigious law firm library boardroom with solid mahogany conference table, elegant leather chairs, law books on shelves, bronze Lady Justice scales, deep navy and warm gold ambient lighting, prestigious corporate photography 8k",
        showcase: [
          "Senior partner attorney reviewing complex contractual documents with magnifying attention to detail",
          "Private confidential executive meeting with corporate board of directors",
          "Modern high-security digital legal vault and compliance dashboard",
          "Courthouse steps with confident litigator holding briefing briefcase"
        ],
        ambient: "Sober, prestigious and authoritative legal headquarters designed to project unshakeable trust"
      },
      palette: {
        primary: '#0f172a',
        secondary: '#b45309',
        accent: '#1e3a8a',
        background: '#fafaf9',
        surface: '#ffffff',
        text: '#1c1917',
        darkBg: '#0c0a09',
        glow: '#b45309'
      },
      animation_style: 'premium_fade'
    },
    colors: {
      primary: '#0f172a',
      secondary: '#b45309',
      accent: '#1e3a8a',
      bg: '#fafaf9',
      surface: '#ffffff',
      text: '#1c1917',
      darkBg: '#0c0a09',
      cardBorder: '#e7e5e4'
    },
    typography: {
      headingFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
          title: 'Consultoria Estratégica',
          category: 'Prevenção de Riscos'
        },
        {
          url: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=800&q=80',
          title: 'Contencioso & Litígios',
          category: 'Defesa Rigorosa'
        },
        {
          url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
          title: 'Direito Empresarial & Tributário',
          category: 'Blindagem de Ativos'
        },
        {
          url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
          title: 'Atendimento Personalizado',
          category: 'Confidencialidade Absoluta'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Advogados Especialistas OAB', 'Sigilo & Compliance Rigoroso', 'Atendimento Online em Todo o Brasil'],
    defaultMetrics: [
      { value: '5.0 ★', label: 'Reputação Google' },
      { value: '+1.200', label: 'Processos Conduzidos' },
      { value: '15 anos', label: 'Experiência Jurídica' },
      { value: '100%', label: 'Transparência Processual' }
    ],
    defaultQuoteOptions: [
      { name: 'Análise Preliminar de Caso', estimatedPrice: 'Agendamento Direto', highlight: 'Parecer técnico objetivo' },
      { name: 'Assessoria Mensal Empresarial', estimatedPrice: 'Sob demanda', highlight: 'Prevenção contínua de passivos' },
      { name: 'Atuação Contenciosa Direta', estimatedPrice: 'Honorários de êxito', highlight: 'Dedicação exclusiva ao processo' }
    ],
    defaultServices: [
      {
        title: 'Direito Cível, Família & Contratos',
        description: 'Elaboração, revisão de minutas e resolução ágil de disputas patrimoniais.',
        badge: 'Segurança Jurídica'
      },
      {
        title: 'Direito Trabalhista & Previdenciário',
        description: 'Defesa e compliance para empresas e garantia integral de direitos para trabalhadores.',
        badge: 'Rigor Técnico'
      },
      {
        title: 'Direito Empresarial & Tributário',
        description: 'Planejamento sucessório, recuperação fiscal e blindagem de patrimônio societário.',
        badge: 'Estratégico'
      }
    ]
  },

  // ==========================================
  // 9. SERVIÇOS GERAIS / CORPORATIVO / PADRÃO
  // ==========================================
  geral: {
    id: 'geral',
    category: 'geral',
    name: 'Serviços Profissionais & Comércio',
    styleMode: 'modern',
    visual_assets: {
      image_prompts: {
        hero: "Modern architectural commercial office with panoramic glass facade, consulting team reviewing business growth metrics on digital dashboard, sleek technology aesthetic, high-key commercial photography",
        showcase: [
          "Strategic business advisory consultation session in private conference room",
          "Modern verified retail storefront displaying NFC tap-to-review acrylic plate",
          "Dedicated customer service representative with headset smiling warmly",
          "Client handshake celebrating verified top 3 Google ranking milestone"
        ],
        ambient: "Clean slate and sapphire corporate setting with subtle cyber-blue neon accents"
      },
      palette: {
        primary: '#0f172a',
        secondary: '#2563eb',
        accent: '#10b981',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        darkBg: '#090d16',
        glow: '#2563eb'
      },
      animation_style: 'premium_fade'
    },
    colors: {
      primary: '#0f172a',
      secondary: '#2563eb',
      accent: '#10b981',
      bg: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      darkBg: '#090d16',
      cardBorder: '#e2e8f0'
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Inter', sans-serif"
    },
    images: {
      hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
          title: 'Estrutura Completa de Atendimento',
          category: 'Tecnologia'
        },
        {
          url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
          title: 'Consultoria e Planejamento',
          category: 'Compromisso'
        },
        {
          url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
          title: 'Equipe Qualificada',
          category: 'Dedicação'
        },
        {
          url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
          title: 'Resultados Comprovados',
          category: 'Qualidade'
        }
      ],
      serviceThumbnails: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    badges: ['Atendimento com Padrão de Excelência', 'Profissionais Altamente Capacitados', 'Garantia Formal de Satisfação'],
    defaultMetrics: [
      { value: '4.9 ★', label: 'Google Meu Negócio' },
      { value: '+1.500', label: 'Clientes Atendidos' },
      { value: '30 min', label: 'Resposta WhatsApp' },
      { value: '100%', label: 'Garantia de Serviço' }
    ],
    defaultQuoteOptions: [
      { name: 'Atendimento Prioritário Imediato', estimatedPrice: 'Orçamento Especial', highlight: 'Mais Procurado' },
      { name: 'Serviço Completo com Garantia Total', estimatedPrice: 'Condições Facilitadas', highlight: 'Melhor Avaliado' },
      { name: 'Consultoria Especializada Sob Medida', estimatedPrice: 'Sem Letras Miúdas', highlight: 'Transparência' }
    ],
    defaultServices: [
      {
        title: 'Diagnóstico & Consultoria Personalizada',
        description: 'Identificação cirúrgica das reais demandas com foco em máxima eficiência e economia.',
        badge: 'Agilidade Máxima'
      },
      {
        title: 'Execução Técnica de Alto Padrão',
        description: 'Materiais de primeira linha e metodologia moderna para um resultado duradouro no primeiro contato.',
        badge: 'Padrão Premium'
      },
      {
        title: 'Suporte & Acompanhamento Pós-Serviço',
        description: 'Garantia continuada e canal aberto de WhatsApp para tirar dúvidas a qualquer momento.',
        badge: 'Garantia Total'
      }
    ]
  }
};

/**
 * Detecta inteligentemente o perfil de nicho com base no texto digitado ou categoria.
 * Retorna o perfil completo incluindo o objeto estruturado 'visual_assets'
 * contendo prompts específicos de imagem, paleta de cores (hex) e estilo de animação
 * (ex: 'premium_fade', 'dynamic_slide', 'smooth_reveal', 'energetic_pop').
 */
export function detectNicheVisualProfile(nicheRaw: string = '', businessNameRaw: string = ''): NicheVisualProfile {
  const rawKey = (nicheRaw || '').trim().toLowerCase();
  if (NICHE_VISUAL_REGISTRY[rawKey]) {
    return NICHE_VISUAL_REGISTRY[rawKey];
  }

  const combined = `${nicheRaw || ''} ${businessNameRaw || ''}`.toLowerCase();

  // 1. Mercado / Supermercado / Hortifruti
  if (
    combined.includes('mercado') ||
    combined.includes('supermercado') ||
    combined.includes('mercearia') ||
    combined.includes('hortifruti') ||
    combined.includes('horti') ||
    combined.includes('sacolao') ||
    combined.includes('sacolão') ||
    combined.includes('açougue') ||
    combined.includes('acougue') ||
    combined.includes('quitanda') ||
    combined.includes('armazem') ||
    combined.includes('armazém') ||
    combined.includes('emporio') ||
    combined.includes('empório')
  ) {
    return NICHE_VISUAL_REGISTRY.mercado;
  }

  // 2. Mecânica / Oficina / Carro / Auto
  if (
    combined.includes('mecanic') ||
    combined.includes('mecânic') ||
    combined.includes('oficina') ||
    combined.includes('auto center') ||
    combined.includes('autocenter') ||
    combined.includes('automotiv') ||
    combined.includes('funilaria') ||
    combined.includes('pintura automotiva') ||
    combined.includes('troca de oleo') ||
    combined.includes('troca de óleo') ||
    combined.includes('escapamento') ||
    combined.includes('freio') ||
    combined.includes('suspensao') ||
    combined.includes('suspensão') ||
    combined.includes('pneu') ||
    combined.includes('borracharia') ||
    combined.includes('alinhamento')
  ) {
    return NICHE_VISUAL_REGISTRY.mecanica;
  }

  // 3. Estética / Beleza / Spa / Harmonização
  if (
    combined.includes('estetica') ||
    combined.includes('estética') ||
    combined.includes('harmonizacao') ||
    combined.includes('harmonização') ||
    combined.includes('spa') ||
    combined.includes('salao') ||
    combined.includes('salão') ||
    combined.includes('beleza') ||
    combined.includes('cabelo') ||
    combined.includes('cabeleireir') ||
    combined.includes('sobrancelha') ||
    combined.includes('cílios') ||
    combined.includes('cilios') ||
    combined.includes('skincare') ||
    combined.includes('skin care') ||
    combined.includes('dermatolog') ||
    combined.includes('massagem') ||
    combined.includes('podologia') ||
    combined.includes('depilacao') ||
    combined.includes('depilação') ||
    combined.includes('manicure') ||
    combined.includes('unhas') ||
    combined.includes('barbearia') ||
    combined.includes('barber')
  ) {
    return NICHE_VISUAL_REGISTRY.estetica;
  }

  // 4. Odontologia / Dentista
  if (
    combined.includes('dentista') ||
    combined.includes('odonto') ||
    combined.includes('ortodont') ||
    combined.includes('clareamento') ||
    combined.includes('implante dent') ||
    combined.includes('protese dent') ||
    combined.includes('prótese dent') ||
    combined.includes('alinhador')
  ) {
    return NICHE_VISUAL_REGISTRY.odontologia;
  }

  // 5. Gastronomia / Restaurante / Pizzaria / Hamburgueria
  if (
    combined.includes('restaurante') ||
    combined.includes('hamburguer') ||
    combined.includes('hambúrguer') ||
    combined.includes('burger') ||
    combined.includes('pizza') ||
    combined.includes('pizzaria') ||
    combined.includes('lanchonete') ||
    combined.includes('bar') ||
    combined.includes('churrascaria') ||
    combined.includes('sushi') ||
    combined.includes('japones') ||
    combined.includes('japonês') ||
    combined.includes('padaria') ||
    combined.includes('confeitaria') ||
    combined.includes('cafeteria') ||
    combined.includes('cafe') ||
    combined.includes('café') ||
    combined.includes('bistrô') ||
    combined.includes('bistro')
  ) {
    return NICHE_VISUAL_REGISTRY.gastronomia;
  }

  // 6. Fitness / Academia / Crossfit
  if (
    combined.includes('academia') ||
    combined.includes('fitness') ||
    combined.includes('crossfit') ||
    combined.includes('personal') ||
    combined.includes('treino') ||
    combined.includes('musculacao') ||
    combined.includes('musculação') ||
    combined.includes('pilates') ||
    combined.includes('yoga')
  ) {
    return NICHE_VISUAL_REGISTRY.fitness;
  }

  // 7. Pet Shop / Veterinária
  if (
    combined.includes('pet') ||
    combined.includes('veterinari') ||
    combined.includes('veterinári') ||
    combined.includes('banho e tosa') ||
    combined.includes('racao') ||
    combined.includes('ração') ||
    combined.includes('cachorro') ||
    combined.includes('gato')
  ) {
    return NICHE_VISUAL_REGISTRY.pet;
  }

  // 8. Advocacia / Jurídico
  if (
    combined.includes('advocacia') ||
    combined.includes('advogad') ||
    combined.includes('juridic') ||
    combined.includes('jurídic') ||
    combined.includes('direito') ||
    combined.includes('escritorio de advocacia') ||
    combined.includes('escritório de advocacia')
  ) {
    return NICHE_VISUAL_REGISTRY.juridico;
  }

  // Fallback para perfil moderno geral
  return NICHE_VISUAL_REGISTRY.geral;
}

/**
 * Retorna especificamente o objeto estruturado 'visual_assets' para o nicho fornecido.
 */
export function detectNicheVisualAssets(nicheRaw: string = '', businessNameRaw: string = ''): NicheVisualAssets {
  return detectNicheVisualProfile(nicheRaw, businessNameRaw).visual_assets;
}
