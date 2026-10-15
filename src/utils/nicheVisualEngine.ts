/**
 * MOTOR DE IDENTIDADE VISUAL E ASSETS SETORIAIS POR NICHO
 * 
 * Fornece inteligência de design 100% condizente com o ramo de atuação:
 * - Supermercados & Hortifrúti: Frescor, gôndolas, ofertas, cestas, açougue, padaria.
 * - Oficinas Mecânicas: Consertos automotivos, motores, ferramentas, freios, diagnóstico.
 * - Clínicas de Estética & Spa: Conceito ultra-premium/luxo, tipografia serifada sofisticada,
 *   efeitos GSAP ScrollTrigger suaves, paleta champagne/rose gold/nude, pele radiante.
 * - Odontologia, Gastronomia, Pet Shop, Advocacia, Construção e Fitness.
 */

export type NicheCategory =
  | 'estetica'
  | 'mecanica'
  | 'mercado'
  | 'odontologia'
  | 'gastronomia'
  | 'pet'
  | 'advocacia'
  | 'construcao'
  | 'fitness'
  | 'geral';

export interface NicheVisualData {
  category: NicheCategory;
  categoryLabel: string;
  conceptStyle: 'luxury_serenity' | 'industrial_tech' | 'vibrant_retail' | 'clean_clinical' | 'warm_culinary' | 'friendly_care' | 'sober_trust';
  fontTitle: string;
  fontBody: string;
  googleFontsLink: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    darkBg: string;
    border: string;
    heroOverlay: string;
    badgeBg: string;
    badgeText: string;
  };
  heroImage: string;
  aboutImage: string;
  servicesImages: Array<{ title: string; image: string; description: string; badge: string }>;
  galleryImages: Array<{ title: string; image: string; tag: string }>;
  avatarImages: string[];
  defaultHeroTag: string;
  defaultHeroTitle: string;
  defaultHeroSubtitle: string;
  defaultCtaText: string;
  defaultQuoteTitle: string;
  defaultQuoteSubtitle: string;
  defaultQuoteOptions: Array<{ name: string; estimatedPrice: string; highlight: string; desc: string }>;
  trustMetrics: Array<{ value: string; label: string }>;
  aboutTitle: string;
  aboutText: string;
  aboutHighlights: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  urgencyBadge: string;
  enableGsapSmoothScroll: boolean;
  gsapAnimationPreset: 'luxury_float' | 'mechanical_precision' | 'energetic_pop' | 'clean_reveal';
}

/**
 * Banco de Imagens Curadas de Altíssima Resolução (Unsplash CDN direto com parâmetros otimizados)
 */
const NICHE_IMAGE_LIBRARY = {
  estetica: {
    hero: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1920&q=85', // Tratamento facial relaxante luxo
    about: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', // Ambiente de spa acolhedor e requintado
    services: [
      {
        title: 'Harmonização & Procedimentos Faciais',
        image: 'https://images.unsplash.com/photo-1512290900672-1f55b9e59d45?auto=format&fit=crop&w=800&q=80',
        description: 'Técnicas modernas minimamente invasivas para realçar seus traços com naturalidade.',
        badge: 'Procedimento VIP'
      },
      {
        title: 'Tratamentos de Pele & Glow Facial',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        description: 'Limpeza profunda, hidratação celular e peelings com produtos de alta tecnologia.',
        badge: 'Mais Procurado'
      },
      {
        title: 'Massagens Relaxantes & Drenagem Linfática',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        description: 'Alívio imediato do estresse, renovação muscular e relaxamento sensorial completo.',
        badge: 'Experiência SPA'
      },
      {
        title: 'Estética Corporal Avançada & Criolipólise',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
        description: 'Equipamentos certificados de última geração para remodelagem corporal e firmeza.',
        badge: 'Tecnologia 2026'
      }
    ],
    gallery: [
      { title: 'Recepção e Lounge Sensorial', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', tag: 'Ambiente' },
      { title: 'Consultório de Avaliação Personalizada', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80', tag: 'Privacidade' },
      { title: 'Produtos e Cosmecêuticos Internacionais', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', tag: 'Exclusividade' },
      { title: 'Sala de Relaxamento com Aromaterapia', image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80', tag: 'Bem-Estar' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    ]
  },

  mecanica: {
    hero: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=85', // Mecânico qualificado examinando motor de alta precisão
    about: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80', // Oficina organizada, elevador e ferramentas profissionais
    services: [
      {
        title: 'Diagnóstico Eletrônico & Scanner Computadorizado',
        image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80',
        description: 'Varredura completa de injeção eletrônica, sensores e módulos para identificar a falha exata sem rodeios.',
        badge: 'Precisão Absoluta'
      },
      {
        title: 'Revisão Preventiva & Troca de Óleo',
        image: 'https://images.unsplash.com/photo-1632823471565-1ebdf5c91bf1?auto=format&fit=crop&w=800&q=80',
        description: 'Lubrificantes originais e checklist de 30 itens de segurança para você viajar sem surpresas.',
        badge: 'Mais Solicitado'
      },
      {
        title: 'Sistema de Freios, Suspensão & Direção',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        description: 'Troca de pastilhas, discos, amortecedores e alinhamento a laser com peças de procedência certificada.',
        badge: 'Segurança Máxima'
      },
      {
        title: 'Manutenção de Câmbio & Embreagem',
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
        description: 'Reparos especializados em transmissão manual e automática com garantia expressa em contrato.',
        badge: 'Garantia Formal'
      }
    ],
    gallery: [
      { title: 'Elevadores Automotivos Modernos', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', tag: 'Estrutura' },
      { title: 'Scanner e Diagnóstico em Tempo Real', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', tag: 'Tecnologia' },
      { title: 'Bancada de Testes de Injeção e Bicos', image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80', tag: 'Ferramental' },
      { title: 'Área de Atendimento ao Cliente com Café', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', tag: 'Conforto' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
    ]
  },

  mercado: {
    hero: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=85', // Mercado acolhedor com hortifrúti colorido e produtos frescos
    about: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80', // Corredores iluminados e limpos com gôndolas abastecidas
    services: [
      {
        title: 'Hortifrúti Selecionado & Direto do Produtor',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
        description: 'Frutas, legumes e verduras fresquinhas que chegam todos os dias para a sua família.',
        badge: 'Chegada Diária'
      },
      {
        title: 'Açougue de Carnes Nobres & Cortes Especiais',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
        description: 'Cortes nobres, carnes inspecionadas e preparos feitos sob medida pelos nossos açougueiros.',
        badge: 'Qualidade Inspecionada'
      },
      {
        title: 'Padaria Artesanal & Fornada Quentinha',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        description: 'Pães franceses quentinhos a toda hora, bolos caseiros, salgados e confeitaria artesanal.',
        badge: 'Fornadas do Dia'
      },
      {
        title: 'Entrega Rápida pelo WhatsApp (Delivery no Bairro)',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
        description: 'Envie sua lista pelo WhatsApp e receba suas compras com agilidade e cuidado em sua casa.',
        badge: 'Comodidade Total'
      }
    ],
    gallery: [
      { title: 'Frutas e Verduras da Estação', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', tag: 'Hortifrúti' },
      { title: 'Variedade em Mercearia e Despensa', image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80', tag: 'Corredores' },
      { title: 'Frios Fatiados na Hora e Queijos', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80', tag: 'Laticínios' },
      { title: 'Atendimento Rápido e Caixas Organizados', image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80', tag: 'Praticidade' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    ]
  },

  odontologia: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1920&q=85', // Consultório odontológico de alta tecnologia e acolhedor
    about: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        title: 'Implantes Dentários & Próteses Fixas',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
        description: 'Recupere a mastigação e o sorriso com técnicas guiadas e materiais de titânio de alta absorção.',
        badge: 'Especialidade'
      },
      {
        title: 'Alinhadores Invisíveis & Ortodontia',
        image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
        description: 'Correção precisa e discreta sem fios metálicos, com escaneamento 3D intraoral.',
        badge: 'Tecnologia 3D'
      },
      {
        title: 'Clareamento Dental a Laser & Facetas',
        image: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80',
        description: 'Dentes mais brancos e estética do sorriso com segurança e sem sensibilidade excessiva.',
        badge: 'Estética Dental'
      },
      {
        title: 'Check-up Preventivo & Limpeza Profunda',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        description: 'Prevenção de cáries, tártaro e inflamações gengivais com ultrassom e profilaxia moderna.',
        badge: 'Saúde Bucal'
      }
    ],
    gallery: [
      { title: 'Equipamentos e Escaneamento Digital', image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80', tag: 'Consultório' },
      { title: 'Biossegurança e Esterilização Rígida', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', tag: 'Segurança' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    ]
  },

  gastronomia: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85', // Restaurante requintado com iluminação acolhedora
    about: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        title: 'Cardápio Autoral & Ingredientes Frescos',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        description: 'Pratos preparados na hora por chefs dedicados, combinando sabor autêntico e apresentação refinada.',
        badge: 'Sabor Único'
      },
      {
        title: 'Reserva de Mesas & Eventos Especiais',
        image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
        description: 'Espaço climatizado e aconchegante para comemorações, jantares românticos e reuniões em família.',
        badge: 'Ambiente Climatizado'
      },
      {
        title: 'Delivery Expresso no WhatsApp',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
        description: 'Receba seus pratos quentinhos e embalados com segurança no conforto da sua residência.',
        badge: 'Entrega Ágil'
      }
    ],
    gallery: [
      { title: 'Salão Principal Iluminado', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', tag: 'Ambiente' },
      { title: 'Pratos Autorais de Sucesso', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', tag: 'Culinária' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    ]
  },

  pet: {
    hero: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1920&q=85',
    about: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        title: 'Banho & Tosa Estética com Carinho',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
        description: 'Produtos hipoalergênicos, hidratação de pelos e profissionais dedicados ao bem-estar do seu pet.',
        badge: 'Cuidado Humanizado'
      },
      {
        title: 'Consultas Veterinárias & Vacinação',
        image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
        description: 'Exames, vacinas importadas e acompanhamento preventivo completo com veterinários experientes.',
        badge: 'Medicina Preventiva'
      }
    ],
    gallery: [
      { title: 'Espaço Limpo e Amigável', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', tag: 'Clínica' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    ]
  },

  geral: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85',
    about: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        title: 'Atendimento Prioritário & Diagnóstico',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        description: 'Identificação imediata da solução certa com orçamento transparente sem compromisso.',
        badge: 'Agilidade'
      },
      {
        title: 'Execução Técnica de Alto Padrão',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
        description: 'Profissionais altamente treinados e comprometidos com a entrega no prazo estipulado.',
        badge: 'Qualidade'
      }
    ],
    gallery: [
      { title: 'Instalações e Equipe', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', tag: 'Estrutura' }
    ],
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    ]
  }
};

/**
 * Normaliza e identifica a categoria exata do nicho
 */
export function detectNicheCategory(niche: string = ''): NicheCategory {
  const clean = niche.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (
    clean.includes('estetic') ||
    clean.includes('beleza') ||
    clean.includes('spa') ||
    clean.includes('salao') ||
    clean.includes('harmonizacao') ||
    clean.includes('dermatol') ||
    clean.includes('sobrancelh') ||
    clean.includes('unha') ||
    clean.includes('lash') ||
    clean.includes('massag') ||
    clean.includes('depila') ||
    clean.includes('bronze') ||
    clean.includes('cabelo') ||
    clean.includes('barbearia')
  ) {
    return 'estetica';
  }

  if (
    clean.includes('mecanic') ||
    clean.includes('oficina') ||
    clean.includes('auto') ||
    clean.includes('carro') ||
    clean.includes('veiculo') ||
    clean.includes('funilaria') ||
    clean.includes('pneu') ||
    clean.includes('freio') ||
    clean.includes('troca de oleo') ||
    clean.includes('suspens') ||
    clean.includes('guincho') ||
    clean.includes('eletrica auto') ||
    clean.includes('cambio') ||
    clean.includes('motor') ||
    clean.includes('lavarapido') ||
    clean.includes('estetica automotiva')
  ) {
    return 'mecanica';
  }

  if (
    clean.includes('mercado') ||
    clean.includes('supermercado') ||
    clean.includes('hortifruti') ||
    clean.includes('sacolao') ||
    clean.includes('emporio') ||
    clean.includes('mercearia') ||
    clean.includes('padaria') ||
    clean.includes('acougue') ||
    clean.includes('conveniencia') ||
    clean.includes('minimercado') ||
    clean.includes('quitanda') ||
    clean.includes('varejo')
  ) {
    return 'mercado';
  }

  if (
    clean.includes('odonto') ||
    clean.includes('dentist') ||
    clean.includes('sorriso') ||
    clean.includes('ortodont') ||
    clean.includes('implante') ||
    clean.includes('protese')
  ) {
    return 'odontologia';
  }

  if (
    clean.includes('restaurante') ||
    clean.includes('pizz') ||
    clean.includes('burger') ||
    clean.includes('hamburguer') ||
    clean.includes('lanche') ||
    clean.includes('sushi') ||
    clean.includes('comida') ||
    clean.includes('bar') ||
    clean.includes('gastronom') ||
    clean.includes('bife') ||
    clean.includes('cafe') ||
    clean.includes('confeitaria')
  ) {
    return 'gastronomia';
  }

  if (
    clean.includes('pet') ||
    clean.includes('vet') ||
    clean.includes('veterinar') ||
    clean.includes('animal') ||
    clean.includes('banho e tosa') ||
    clean.includes('racao')
  ) {
    return 'pet';
  }

  if (
    clean.includes('advoc') ||
    clean.includes('direito') ||
    clean.includes('juridic') ||
    clean.includes('contab') ||
    clean.includes('tributar')
  ) {
    return 'advocacia';
  }

  if (
    clean.includes('constru') ||
    clean.includes('reforma') ||
    clean.includes('eletricist') ||
    clean.includes('encanador') ||
    clean.includes('marcen') ||
    clean.includes('gesso') ||
    clean.includes('pintor') ||
    clean.includes('vidrac')
  ) {
    return 'construcao';
  }

  if (
    clean.includes('academia') ||
    clean.includes('crossfit') ||
    clean.includes('fitness') ||
    clean.includes('personal') ||
    clean.includes('pilates') ||
    clean.includes('treino') ||
    clean.includes('luta')
  ) {
    return 'fitness';
  }

  return 'geral';
}

/**
 * Retorna as diretrizes visuais e conceituais completas para o nicho detectado
 */
export function getNicheVisualData(
  niche: string = 'Serviços',
  businessName: string = 'Empresa',
  city: string = 'Brasil'
): NicheVisualData {
  const category = detectNicheCategory(niche);

  if (category === 'estetica') {
    const assets = NICHE_IMAGE_LIBRARY.estetica;
    return {
      category: 'estetica',
      categoryLabel: 'Clínica de Estética & Bem-Estar VIP',
      conceptStyle: 'luxury_serenity',
      fontTitle: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
      googleFontsLink: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,600&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      colors: {
        primary: '#1c1917', // Grafite nobre / Pedra quente
        secondary: '#c59b6d', // Ouro champanhe suave
        accent: '#b45309', // Dourado âmbar sofisticado
        bg: '#faf8f5', // Linho / Nude champanhe refinado
        surface: '#ffffff',
        text: '#1c1917',
        textMuted: '#78716c',
        darkBg: '#12100e',
        border: 'rgba(197, 155, 109, 0.22)',
        heroOverlay: 'linear-gradient(to top, rgba(18, 16, 14, 0.92) 0%, rgba(18, 16, 14, 0.5) 55%, rgba(18, 16, 14, 0.25) 100%)',
        badgeBg: 'rgba(197, 155, 109, 0.15)',
        badgeText: '#c59b6d'
      },
      heroImage: assets.hero,
      aboutImage: assets.about,
      servicesImages: assets.services,
      galleryImages: assets.gallery,
      avatarImages: assets.avatars,
      defaultHeroTag: `✦ EXPERIÊNCIA SENSORIAL & ESTÉTICA DE ELITE EM ${city.toUpperCase()}`,
      defaultHeroTitle: `${businessName}: Onde a Ciência e a Delicadeza Realçam Sua Melhor Versão`,
      defaultHeroSubtitle: `Tratamentos faciais e corporais personalizados em um ambiente privativo de alto padrão. Mais de 1.400 clientes satisfeitas com nota máxima de 5 estrelas no Google.`,
      defaultCtaText: 'Reservar Avaliação VIP no WhatsApp',
      defaultQuoteTitle: 'Menu de Procedimentos & Simulação Personalizada',
      defaultQuoteSubtitle: 'Selecione a experiência desejada para receber os detalhes e horários exclusivos:',
      defaultQuoteOptions: [
        { name: 'Harmonização & Rejuvenescimento Facial', estimatedPrice: 'Avaliação Personalizada', highlight: 'Mais Desejado', desc: 'Protocolo exclusivo com produtos certificados e naturalidade' },
        { name: 'Limpeza de Pele Profunda + Hidratação Glow', estimatedPrice: 'Condição Especial', highlight: 'Sessão Renovadora', desc: 'Desobstrução com ativos botânicos e máscara reconstrutora' },
        { name: 'Drenagem Linfática & SPA Relaxante', estimatedPrice: 'Pacote Exclusivo', highlight: 'Bem-Estar Total', desc: 'Alívio da retenção e relaxamento muscular imediato' }
      ],
      trustMetrics: [
        { value: '5.0 ★', label: 'Avaliação Máxima no Google' },
        { value: '1.400+', label: 'Procedimentos Realizados' },
        { value: '100%', label: 'Ambiente Privativo Climatizado' },
        { value: 'Anvisa', label: 'Produtos Certificados' }
      ],
      aboutTitle: `Um refúgio de sofisticação e cuidado em ${city}`,
      aboutText: `A ${businessName} nasceu do desejo de proporcionar mais do que estética: uma pausa no seu dia para reconectar corpo, mente e autoestima. Nossos protocolos são individualizados, respeitando a sua anatomia com delicadeza e tecnologia de vanguarda.`,
      aboutHighlights: [
        'Atendimento individual em salas privativas com aromaterapia',
        'Protocolos desenvolvidos por especialistas pós-graduadas',
        'Acompanhamento pós-procedimento contínuo e humanizado'
      ],
      faq: [
        { question: 'Como funciona a primeira avaliação?', answer: 'Você conversa diretamente com a nossa especialista, analisamos a sua queixa e montamos um plano de tratamento exclusivo com transparência total.' },
        { question: 'Os procedimentos exigem tempo de recuperação?', answer: 'A maioria dos nossos protocolos permite retorno imediato à rotina, com orientações de skincare personalizadas para manter o viço.' },
        { question: 'Quais as formas de pagamento facilitadas?', answer: 'Pix, cartões de crédito em até 12x e pacotes promocionais para tratamentos continuados.' }
      ],
      ctaTitle: 'Sua autoestima merece este momento de cuidado.',
      ctaText: `Converse com nossa equipe e garanta seu horário de atendimento exclusivo em ${city}.`,
      ctaButtonText: 'Agendar pelo WhatsApp Oficial',
      urgencyBadge: 'Poucas vagas disponíveis na agenda desta semana',
      enableGsapSmoothScroll: true,
      gsapAnimationPreset: 'luxury_float'
    };
  }

  if (category === 'mecanica') {
    const assets = NICHE_IMAGE_LIBRARY.mecanica;
    return {
      category: 'mecanica',
      categoryLabel: 'Centro Automotivo & Oficina Mecânica Especializada',
      conceptStyle: 'industrial_tech',
      fontTitle: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
      googleFontsLink: 'https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      colors: {
        primary: '#0f172a', // Azul petróleo industrial profundo
        secondary: '#1d4ed8', // Azul royal automotivo
        accent: '#f59e0b', // Âmbar / Laranja de precisão
        bg: '#0f172a', // Dark mode imersivo automotivo
        surface: '#1e293b',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        darkBg: '#090d16',
        border: 'rgba(245, 158, 11, 0.25)',
        heroOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.65) 60%, rgba(15, 23, 42, 0.35) 100%)',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeText: '#fbbf24'
      },
      heroImage: assets.hero,
      aboutImage: assets.about,
      servicesImages: assets.services,
      galleryImages: assets.gallery,
      avatarImages: assets.avatars,
      defaultHeroTag: `⚙️ MECÂNICA DE CONFIANÇA & DIAGNÓSTICO AVANÇADO EM ${city.toUpperCase()}`,
      defaultHeroTitle: `${businessName}: Seu Carro Pronto Sem Enrolação e Com Garantia Formal`,
      defaultHeroSubtitle: `Diagnóstico por scanner computadorizado, orçamento transparente antes de mexer no veículo e peças com procedência comprovada. Chega de surpresas na conta!`,
      defaultCtaText: 'Pedir Orçamento sem Compromisso no WhatsApp',
      defaultQuoteTitle: 'Calculadora Rápida de Serviços Automotivos',
      defaultQuoteSubtitle: 'Selecione a necessidade do seu veículo para estimar o conserto e agendar horário:',
      defaultQuoteOptions: [
        { name: 'Revisão Preventiva Geral + Troca de Óleo', estimatedPrice: 'Orçamento Especial', highlight: 'Checklist 30 Itens', desc: 'Troca de lubrificante, filtros, verificação de freios e suspensão' },
        { name: 'Diagnóstico de Injeção & Luz Acesa no Painel', estimatedPrice: 'Diagnóstico Rápido', highlight: 'Scanner Eletrônico', desc: 'Identificação exata do código de falha para resolver de primeira' },
        { name: 'Freios, Pastilhas, Discos & Suspensão', estimatedPrice: 'Peças com Garantia', highlight: 'Segurança Total', desc: 'Alinhamento, amortecedores e balanceamento de alta precisão' }
      ],
      trustMetrics: [
        { value: '4.9 ★', label: 'Avaliações Reais no Google' },
        { value: '2.800+', label: 'Veículos Consertados' },
        { value: '90 Dias', label: 'Garantia Formal em Contrato' },
        { value: '100%', label: 'Peças com Nota Fiscal' }
      ],
      aboutTitle: `Transparência e honestidade mecânica em ${city}`,
      aboutText: `Na ${businessName}, você não é surpreendido com trocas de peças desnecessárias. Filmamos e mostramos o que realmente precisa ser trocado, explicamos cada detalhe com respeito ao seu bolso e entregamos o veículo no prazo combinado.`,
      aboutHighlights: [
        'Orçamento discriminado aprovado antes de desmontar',
        'Mecânicos certificados com equipamentos eletrônicos modernos',
        'Facilidade de pagamento em até 12x no cartão'
      ],
      faq: [
        { question: 'Vocês cobram para passar o scanner automotivo?', answer: 'Ao aprovar a manutenção preventiva ou corretiva conosco, o diagnóstico eletrônico é abatido no serviço final.' },
        { question: 'Como funciona a garantia das peças e mão de obra?', answer: 'Emitimos certificado formal de garantia de 90 dias a 1 ano (conforme o fabricante das peças instaladas).' },
        { question: 'Fazem socorro ou recebem guincho?', answer: 'Sim! Nosso pátio recebe veículos de guincho durante todo o horário comercial para atendimento emergencial.' }
      ],
      ctaTitle: 'Não arrisque a segurança da sua família na estrada.',
      ctaText: `Traga seu carro para uma inspeção de confiança na ${businessName} em ${city}.`,
      ctaButtonText: 'Falar no WhatsApp da Oficina Agora',
      urgencyBadge: 'Box de atendimento com vagas para hoje',
      enableGsapSmoothScroll: true,
      gsapAnimationPreset: 'mechanical_precision'
    };
  }

  if (category === 'mercado') {
    const assets = NICHE_IMAGE_LIBRARY.mercado;
    return {
      category: 'mercado',
      categoryLabel: 'Supermercado, Hortifrúti & Mercearia do Bairro',
      conceptStyle: 'vibrant_retail',
      fontTitle: "'Plus Jakarta Sans', -apple-system, sans-serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
      googleFontsLink: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap',
      colors: {
        primary: '#15803d', // Verde hortifrúti fresco vibrante
        secondary: '#dc2626', // Vermelho apetite e ofertas
        accent: '#ea580c', // Laranja quente de ação
        bg: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        darkBg: '#052e16',
        border: 'rgba(21, 128, 61, 0.18)',
        heroOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%)',
        badgeBg: 'rgba(21, 128, 61, 0.15)',
        badgeText: '#15803d'
      },
      heroImage: assets.hero,
      aboutImage: assets.about,
      servicesImages: assets.services,
      galleryImages: assets.gallery,
      avatarImages: assets.avatars,
      defaultHeroTag: `🛒 HORTIFRÚTI FRESCO & AS MELHORES OFERTAS EM ${city.toUpperCase()}`,
      defaultHeroTitle: `${businessName}: Economia Real para Sua Casa e Produtos Frescos Todos os Dias`,
      defaultHeroSubtitle: `Frutas e verduras colhidas no dia, açougue com cortes inspecionados, padaria com fornada quentinha e entrega rápida no seu bairro pelo WhatsApp!`,
      defaultCtaText: 'Receber Ofertas do Dia no WhatsApp',
      defaultQuoteTitle: 'Faça Seu Pedido ou Consulte Nossos Setores',
      defaultQuoteSubtitle: 'Selecione o setor desejado para atendimento rápido pelo WhatsApp:',
      defaultQuoteOptions: [
        { name: 'Hortifrúti Fresco & Feira da Semana', estimatedPrice: 'Preço Imbatível', highlight: 'Chegada Diária', desc: 'Legumes, verduras e frutas frescas direto dos melhores produtores' },
        { name: 'Açougue de Carnes Nobres & Churrasco', estimatedPrice: 'Cortes Especiais', highlight: 'Qualidade Inspecionada', desc: 'Picanha, alcatra, carnes moídas na hora e espetos prontos' },
        { name: 'Padaria Artesanal & Fornada de Pão Francês', estimatedPrice: 'Sempre Quente', highlight: 'Fornadas do Dia', desc: 'Pão de queijo, bolos caseiros, frios fatiados e mercearia completa' }
      ],
      trustMetrics: [
        { value: '4.8 ★', label: 'Nota Média Google Meu Negócio' },
        { value: '100%', label: 'Hortifrúti Abastecido Diariamente' },
        { value: 'Entrega', label: 'Delivery Rápido no Bairro' },
        { value: 'Economia', label: 'Garantia de Preço Justo' }
      ],
      aboutTitle: `O supermercado que faz parte da rotina de ${city}`,
      aboutText: `Na ${businessName}, você encontra ambiente climatizado, corredores espaçosos e caixas ágeis para suas compras diárias sem estresse. Se preferir comodidade, você manda a lista pelo WhatsApp e nós separamos com todo o carinho para entregar na sua porta.`,
      aboutHighlights: [
        'Hortifrúti selecionado com reposição fresca todas as manhãs',
        'Açougue com profissionais atenciosos e cortes sob medida',
        'Aceitamos todos os cartões, vale-alimentação e Pix'
      ],
      faq: [
        { question: 'Como funciona o delivery pelo WhatsApp?', answer: 'Você nos envia a sua lista pelo WhatsApp, nossa equipe separa os melhores itens e combina o horário de entrega na sua residência.' },
        { question: 'Quais dias acontecem a feira com desconto?', answer: 'Temos promoções especiais de hortifrúti às quartas e quintas, e ofertas do açougue aos fins de semana!' },
        { question: 'Quais os cartões de benefício aceitos?', answer: 'Aceitamos Ticket, VR, Sodexo, Alelo, Ben, cartões de crédito e Pix.' }
      ],
      ctaTitle: 'Economize tempo e dinheiro nas suas compras.',
      ctaText: `Receba o encarte com as ofertas secretas de hoje no seu WhatsApp da ${businessName}.`,
      ctaButtonText: 'Pedir Encarte de Ofertas no WhatsApp',
      urgencyBadge: 'Ofertas válidas enquanto durarem os estoques',
      enableGsapSmoothScroll: true,
      gsapAnimationPreset: 'energetic_pop'
    };
  }

  if (category === 'odontologia') {
    const assets = NICHE_IMAGE_LIBRARY.odontologia;
    return {
      category: 'odontologia',
      categoryLabel: 'Clínica Odontológica & Ortodontia Moderna',
      conceptStyle: 'clean_clinical',
      fontTitle: "'Plus Jakarta Sans', -apple-system, sans-serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
      googleFontsLink: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap',
      colors: {
        primary: '#0369a1',
        secondary: '#0284c7',
        accent: '#059669',
        bg: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        darkBg: '#082f49',
        border: 'rgba(3, 105, 161, 0.2)',
        heroOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%)',
        badgeBg: 'rgba(3, 105, 161, 0.15)',
        badgeText: '#0284c7'
      },
      heroImage: assets.hero,
      aboutImage: assets.about,
      servicesImages: assets.services,
      galleryImages: assets.gallery,
      avatarImages: assets.avatars,
      defaultHeroTag: `✨ ODONTOLOGIA AVANÇADA & IMPLANTES EM ${city.toUpperCase()}`,
      defaultHeroTitle: `${businessName}: Conquiste o Sorriso dos Seus Sonhos Sem Dor e Com Tecnologia`,
      defaultHeroSubtitle: `Alinhadores invisíveis, implantes guiados e clareamento dental a laser com especialistas renomados e conforto absoluto em ${city}.`,
      defaultCtaText: 'Agendar Consulta de Avaliação no WhatsApp',
      defaultQuoteTitle: 'Simulador de Tratamento Odontológico',
      defaultQuoteSubtitle: 'Escolha a área de atenção para conversar com nosso dentista especialista:',
      defaultQuoteOptions: [
        { name: 'Implantes & Reabilitação Oral', estimatedPrice: 'Planejamento Digital', highlight: 'Dentes Fixos', desc: 'Recupere a mastigação e estética com implantes guiados' },
        { name: 'Alinhadores Invisíveis & Ortodontia', estimatedPrice: 'Parcelas Facilitadas', highlight: 'Sem Fios Metálicos', desc: 'Alinhamento rápido e discreto para adultos e jovens' },
        { name: 'Clareamento Dental & Facetas em Resina', estimatedPrice: 'Condição Especial', highlight: 'Estética do Sorriso', desc: 'Sorriso iluminado com técnicas de última geração' }
      ],
      trustMetrics: [
        { value: '5.0 ★', label: 'Avaliações de Pacientes Google' },
        { value: '3.200+', label: 'Sorrisos Transformados' },
        { value: '100%', label: 'Tecnologia 3D sem Moldes' },
        { value: 'Conforto', label: 'Procedimentos Humanizados' }
      ],
      aboutTitle: `Cuidado odontológico acolhedor em ${city}`,
      aboutText: `Na ${businessName}, você encontra uma equipe que entende o medo de ir ao dentista e transforma sua experiência em algo relaxante e acolhedor, com anestesia de ponta e equipamentos digitais.`,
      aboutHighlights: [
        'Ambiente esterilizado com normas hospitalares de biossegurança',
        'Planejamento digital com visualização prévia do resultado',
        'Atendimento de urgência e horários flexíveis'
      ],
      faq: [
        { question: 'A colocação de implantes dói?', answer: 'Não. Utilizamos anestésicos modernos e planejamento cirúrgico guiado para um procedimento rápido e pós-operatório muito tranquilo.' },
        { question: 'Quanto tempo dura o tratamento com alinhador?', answer: 'Varia entre 6 e 18 meses dependendo do caso, com consultas mensais rápidas e confortáveis.' },
        { question: 'Facilitam o pagamento dos tratamentos?', answer: 'Sim, parcelamos em até 12x ou 24x e oferecemos planos especiais de tratamento completo.' }
      ],
      ctaTitle: 'Volte a sorrir com confiança hoje mesmo.',
      ctaText: `Nossa equipe em ${city} está pronta para cuidar da saúde e beleza do seu sorriso.`,
      ctaButtonText: 'Falar com a Central de Atendimento',
      urgencyBadge: 'Primeiras consultas da semana com horários exclusivos',
      enableGsapSmoothScroll: true,
      gsapAnimationPreset: 'clean_reveal'
    };
  }

  // Fallback geral com alta qualidade
  const assets = NICHE_IMAGE_LIBRARY.geral;
  return {
    category: 'geral',
    categoryLabel: `Especialistas em ${niche}`,
    conceptStyle: 'clean_clinical',
    fontTitle: "'Plus Jakarta Sans', -apple-system, sans-serif",
    fontBody: "'Plus Jakarta Sans', -apple-system, sans-serif",
    googleFontsLink: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap',
    colors: {
      primary: '#0f172a',
      secondary: '#2563eb',
      accent: '#10b981',
      bg: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textMuted: '#64748b',
      darkBg: '#090d16',
      border: 'rgba(0, 0, 0, 0.08)',
      heroOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%)',
      badgeBg: 'rgba(37, 99, 235, 0.12)',
      badgeText: '#2563eb'
    },
    heroImage: assets.hero,
    aboutImage: assets.about,
    servicesImages: assets.services,
    galleryImages: assets.gallery,
    avatarImages: assets.avatars,
    defaultHeroTag: `★ EXCELÊNCIA EM ${niche.toUpperCase()} • ${city.toUpperCase()}`,
    defaultHeroTitle: `${businessName}: Atendimento de Alto Padrão e Compromisso em ${city}`,
    defaultHeroSubtitle: `Soluções ágeis, equipe qualificada e atendimento humanizado. Mais de 1.200 clientes atendidos com nota 4.9★ no Google Meu Negócio.`,
    defaultCtaText: 'Pedir Orçamento sem Compromisso no WhatsApp',
    defaultQuoteTitle: 'Simulador de Atendimento Expresso',
    defaultQuoteSubtitle: 'Clique na opção desejada para receber os detalhes imediatos:',
    defaultQuoteOptions: [
      { name: 'Atendimento Prioritário Imediato', estimatedPrice: 'Orçamento Especial', highlight: 'Mais Procurado', desc: 'Resposta ágil com solução sob medida' },
      { name: 'Serviço Completo com Garantia Total', estimatedPrice: 'Melhor Custo-Benefício', highlight: 'Recomendado', desc: 'Trabalho minucioso com certificação formal' }
    ],
    trustMetrics: [
      { value: '4.9 ★', label: 'Google Meu Negócio' },
      { value: '1.200+', label: 'Clientes Atendidos' },
      { value: '30 min', label: 'Resposta Rápida' },
      { value: '100%', label: 'Garantia Formal' }
    ],
    aboutTitle: `Por que confiar na equipe da ${businessName}?`,
    aboutText: `Com histórico comprovado em ${city}, nós nos dedicamos a resolver seu problema com transparência ética e atendimento de excelência. Nosso foco é sua tranquilidade e fidelidade.`,
    aboutHighlights: [
      'Orçamento claro e detalhado antes do serviço',
      'Profissionais rigorosamente certificados e experientes',
      'Facilidade no pagamento em até 12x ou Pix'
    ],
    faq: [
      { question: 'Como funciona para solicitar um orçamento?', answer: 'Você clica no botão do WhatsApp, nos conta sua necessidade e respondemos em poucos minutos com orientações claras.' },
      { question: 'Possui garantia dos serviços?', answer: 'Sim, emitimos certificado de garantia e suporte continuado para todos os atendimentos.' }
    ],
    ctaTitle: 'Pronto para ter o melhor atendimento?',
    ctaText: `Fale agora mesmo com nossa equipe e garanta as melhores condições em ${city}.`,
    ctaButtonText: 'Iniciar Conversa no WhatsApp',
    urgencyBadge: 'Atendimento de prontidão hoje',
    enableGsapSmoothScroll: true,
    gsapAnimationPreset: 'clean_reveal'
  };
}
