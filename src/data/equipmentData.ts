import { StudioEquipmentItem } from '../types';

export const INITIAL_EQUIPMENT_ITEMS: StudioEquipmentItem[] = [
  {
    id: "eq-bateria",
    title: "BATERIA COMPLETA & MULTICANAL",
    categoryTag: "PERCUSSÃO & BATERIA",
    modelTag: "BATERIA ACÚSTICA & TRIGGER",
    price: 120,
    priceDetails: "Gravação multicanal + Edição cirúrgica e Quantização de tempo",
    description: "Bateria completa profissional com pratos de alta resposta, microfonação multicanal dedicada (bumbo, caixa, tons, over) acompanhada de alinhamento e quantização de tempo no Pro-Tools.",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Kit acústico completo com peles controladas e esteira ajustada",
      "Captação multicanal independente para bumbo, caixa, chimbal, tons e over estéreo",
      "Edição cirúrgica de tempo (quantização de bateria) inclusa no Pro-Tools",
      "Sample reinforcement e substituição acústica opcional para impacto máximo",
      "Monitoramento por fones de alta isolação para o baterista"
    ],
    recommendedUses: [
      "Baterias pesadas de Rock, Metal, Pop e Sertanejo Universitário",
      "Levadas de Forró, Piseiro, Arrocha e Xote com precisão métrica",
      "Grooves de Funk, Samba, Pagode e MPB",
      "Gravações de Louvor e Worship com dinâmica controlada"
    ],
    includedInStudio: true
  },
  {
    id: "eq-guitarras",
    title: "GUITARRAS ELÉTRICAS (IBANEZ STEVE VAI, MEMPHIS & STRINBERG)",
    categoryTag: "CORDAS",
    modelTag: "IBANEZ, MEMPHIS & STRINBERG",
    price: 80,
    priceDetails: "Gravação em linha / amplificador + Edição e Timbragem",
    description: "Guitarras elétricas Ibanez Steve Vai, Strinberg e Memphis reguladas com precisão para gravação em linha direta ou microfonada em amplificadores valvulados com edição inclusa.",
    imageUrl: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Ibanez Steve Vai Signature com ponte Floyd Rose e captadores DiMarzio",
      "Guitarra Memphis ST-180 Strato com timbre limpo clássico",
      "Guitarra Strinberg EAD-20 Les Paul para bases encorpadas",
      "Gravação via Direct Box Ativo e Reamp com simuladores de tubo Neural DSP / Amplitube",
      "Edição, corte cirúrgico e alinhamento métrico de solos e bases no Pro-Tools"
    ],
    recommendedUses: [
      "Solos virtuosos e marcantes de Rock, Metal e Pop",
      "Bases ritmadas de Forró Piseiro, Sertanejo e Axé",
      "Riffs de Guitarrada Paranaense e Lambada",
      "Arranjos de Louvor / Worship com Reverb e Shimmer"
    ],
    includedInStudio: true
  },
  {
    id: "eq-baixos",
    title: "BAIXO ELÉTRICO (4, 5 E 6 CORDAS)",
    categoryTag: "CORDAS",
    modelTag: "4, 5 & 6 CORDAS PRO",
    price: 70,
    priceDetails: "Gravação via Direct Box + Edição e Alinhamento rítmico",
    description: "Contrabaixos de 4, 5 e 6 cordas ativas/passivas para Sertanejo, Forró, MPB, Pop, Rock e Gospel com graves definidos, pegada firme e alinhamento com a bateria.",
    imageUrl: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Contrabaixo 6 Cordas Ativo com pré-amp de 3 bandas para afinação B-E-A-D-G-C",
      "Contrabaixo 5 Cordas com captadores Jazz Bass ativos para graves profundos",
      "Contrabaixo 4 Cordas Passivo Precision Bass clássico",
      "Gravação via Direct Box Ativo profissional + processamento de graves no Pro-Tools",
      "Edição e alinhamento de graves perfeitamente sincronizados com o bumbo"
    ],
    recommendedUses: [
      "Gravação de baixos pulsantes para Forró e Sertanejo",
      "Linhas complexas de Funk, Disco e MPB no 6 cordas",
      "Gospel e Worship com graves estendidos na corda B",
      "Rock e Reggae com definição e ataque de palheta ou dedo"
    ],
    includedInStudio: true
  },
  {
    id: "eq-violoes",
    title: "VIOLÃO AÇO & NYLON",
    categoryTag: "CORDAS",
    modelTag: "AÇO & NYLON PRO",
    price: 70,
    priceDetails: "Gravação com captação dupla + Edição e Equalização",
    description: "Violões profissionais de aço e nylon acusticamente balanceados para captação limpa, microfonação condensadora e excelente projeção sonora com edição inclusa.",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Violão Aço Folk Tampo Sólido com resposta harmônica brilhante",
      "Violão Nylon Clássico Cutaway com tampo em Pinho selecionado",
      "Captação dupla estéreo: Piezoelétrico + Microfonação Condensadora Kadosh 412",
      "Edição de ruídos de dedo/traste e alinhamento rítmico no Pro-Tools"
    ],
    recommendedUses: [
      "Bases harmônicas de MPB, Bossa Nova e Samba",
      "Dedilhados de Sertanejo Acústico e Pop",
      "Violão base para Forró de Pé de Serra e Reggae",
      "Acompanhamento de Voz & Violão ao vivo no estúdio"
    ],
    includedInStudio: true
  },
  {
    id: "eq-sanfona",
    title: "SANFONA TODESCHINI",
    categoryTag: "INSTRUMENTOS ESPECIAIS",
    modelTag: "TODESCHINI 80/120 BAIXOS",
    price: 90,
    priceDetails: "Gravação em microfonação estéreo + Edição dedicada",
    description: "Acordeon Todeschini tradicional com timbre acústico cristalino e timbragem perfeita para forró e sertanejo caipira gravado em microfonação estéreo dedicada com edição inclusa.",
    imageUrl: "https://images.unsplash.com/photo-1525994886773-080587e161c2?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Acordeon Todeschini 80 e 120 baixos impecavelmente afinado",
      "Vozes de aço sueco com resposta acústica de fole selado",
      "Captação estéreo dedicada com microfones condensadores no teclado e baixos",
      "Edição de fole e afinação de detalhes harmônicos no Pro-Tools"
    ],
    recommendedUses: [
      "Forró Tradicional, Pé de Serra, Piseiro e Baião",
      "Sertanejo Caipira, Vanerão e Xote",
      "Música Regional Nordestina e arranjos folclóricos",
      "Solos marcantes de sanfona em produções autorais"
    ],
    includedInStudio: true
  },
  {
    id: "eq-midi",
    title: "CONTROLADOR MIDI & VSTs PRO",
    categoryTag: "TECLADOS & FX",
    modelTag: "USB MIDI & VSTs PRO",
    price: 80,
    priceDetails: "Gravação de arranjos MIDI, Pianos e VSTs + Edição",
    description: "Controlador MIDI de alta sensibilidade com Kontakt 7, Keyscape, Omnisphere 2 e Pianos de cauda para arranjos, vamps, sintetizadores e orquestrações.",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Teclado controlador com teclas semi-pesadas e pitch/modulação de alta precisão",
      "Integração direta com Kontakt 7, Keyscape, Omnisphere 2 e Pro Tools",
      "Biblioteca VST de Pianos de Cauda Steinway, Rhodes Mark I, Hammond B3 e Strings",
      "Edição e quantização MIDI detalhada com ajuste de velocity e expressão"
    ],
    recommendedUses: [
      "Arranjos de Pianos e Teclados de Arrocha e Sertanejo",
      "Synth Leads, Vamps e Efeitos para Trap, Pop e Eletrônico",
      "Orquestrações de Cordas, Metais e Pad para Músicas Nacionais",
      "Criação de loops e bases eletrônicas personalizadas"
    ],
    includedInStudio: true
  },
  {
    id: "eq-percussao",
    title: "PERCUSSÃO GERAL & ACESSÓRIOS",
    categoryTag: "PERCUSSÃO & BATERIA",
    modelTag: "PERCUSSÃO ACÚSTICA PRO",
    price: 60,
    priceDetails: "Gravação acústica multicanal + Edição rítmica",
    description: "Conjunto completo de percussão para forró, samba, pagode, axé e sertanejo (triângulo, zabumba, pandeiro, shaker, congas e efeitos).",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Kit de percussão tradicional: Zabumba, Triângulo, Agogô, Pandeiro e Meia-Lua",
      "Shakers, Ganzás e efeitos de transição de alta frequência",
      "Captação por microfones dinâmicos e condensadores com resposta rápida",
      "Edição e sincronização métrica no Pro-Tools"
    ],
    recommendedUses: [
      "Levadas de Forró Pé de Serra e Piseiro",
      "Batucada de Samba, Pagode e Axé Music",
      "Camadas rítmicas de MPB e Pop Acústico"
    ],
    includedInStudio: true
  },
  {
    id: "eq-violino",
    title: "VIOLINO ACÚSTICO",
    categoryTag: "INSTRUMENTOS ESPECIAIS",
    modelTag: "VIOLINO 4/4 ACÚSTICO PRO",
    price: 90,
    priceDetails: "Gravação condensadora de alta sensibilidade + Edição",
    description: "Violino acústico 4/4 regulado para solos emocionantes de sertanejo, música erudita, pop acústico e arranjos orquestrais.",
    imageUrl: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Violino 4/4 em madeira nobre com arco de crina animal balanceado",
      "Captação por microfone condensador de estúdio com Pop Filter e sala tratada",
      "Edição cirúrgica de afinação e dinâmica no Melodyne / Pro-Tools"
    ],
    recommendedUses: [
      "Solos e contra-cantos para Sertanejo e Música Autoral",
      "Arranjos de Cordas para Louvor e Música Clássica/Gospel"
    ],
    includedInStudio: true
  },
  {
    id: "eq-protools",
    title: "PRO TOOLS 12 & BUNDLE DE PLUGINS",
    categoryTag: "DAW & SOFTWARE",
    modelTag: "AVID PRO TOOLS HD",
    price: 0,
    priceDetails: "Incluso na Sessão (DAW Padrão do FPStudio)",
    description: "DAW padrão da indústria para gravação multipista, edição cirúrgica, alinhamento de tempo e mixagem de alta fidelidade operado por Fernando Padre.",
    imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Avid Pro Tools 12 HD Native com latência ultra-baixa",
      "Suporte a gravação até 24-bit / 96kHz em múltiplos canais simultâneos",
      "Bundle completo: FabFilter Total, Waves Mercury, Slate Digital, Melodyne 5 Pro",
      "Processadores analógicos modelados SSL, Neve, Universal Audio e Teletronix"
    ],
    recommendedUses: [
      "Gravação multipista de voz e instrumentos",
      "Edição cirúrgica de bateria, quantização e alinhamento de tempo",
      "Afinação de vozes e instrumentos com Melodyne Pro",
      "Mixagem e Masterização profissional"
    ],
    includedInStudio: true
  },
  {
    id: "eq-kadosh",
    title: "MICROFONE KADOSH 412",
    categoryTag: "CAPTAÇÃO & VOZ",
    modelTag: "KADOSH 412 CONDENSER",
    price: 0,
    priceDetails: "Incluso na Sessão (Microfonação Principal)",
    description: "Microfone Kadosh 412 condensador de grande diafragma para captação detalhada e cristalina de vozes, sanfona e instrumentos acústicos.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Microfone condensador de grande diafragma com padrão cardioide",
      "Cápsula banhada a ouro com ruído próprio extremamente baixo",
      "Suporta altos níveis de pressão sonora (SPL) sem distorcer",
      "Acompanha Shockmount antivibração e Pop Filter duplo de estúdio"
    ],
    recommendedUses: [
      "Captação de Voz Principal e Voz Guia no FPStudio",
      "Locução de Vinhetas comerciais e Podcasts",
      "Microfonação de Violão Acústico, Sanfona e Percussão"
    ],
    includedInStudio: true
  },
  {
    id: "eq-tomate",
    title: "MONITORES TOMATE PRO & PLACA M-AUDIO",
    categoryTag: "MONITORAMENTO",
    modelTag: "TOMATE STUDIO & M-AUDIO",
    price: 0,
    priceDetails: "Incluso na Sessão (Monitoramento & Conversão)",
    description: "Sistema de monitoramento Tomate de resposta de frequência precisa e interface M-Audio Pro para conversão de áudio sem perdas.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    fullSpecs: [
      "Monitores de campo próximo Bi-amplificados com crossover de alta precisão",
      "Woofer de Kevlar para graves profundos e rápidos sem distorção",
      "Placa de áudio M-Audio Pro com pré-amplificadores de baixo ruído",
      "Calibração acústica adaptada ao controle de sala do FPStudio"
    ],
    recommendedUses: [
      "Monitoramento crítico durante sessões de gravação ao vivo",
      "Ajustes de equalização, compressão e efeitos de reverb/delay",
      "Conferência de balanço de mixagem em volumes altos e baixos"
    ],
    includedInStudio: true
  }
];
