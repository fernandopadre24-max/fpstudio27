import { StudioService, StudioRoom, UserProfile, BookingRequest, ChatMessage, PushNotification, TransactionRecord, PixQuote } from '../types';

export const INITIAL_STUDIO_INFO = {
  name: "FPStudio",
  subtitle: "Gravações e Edição Video",
  cnpj: "12.345.678/0001-90",
  pixKey: "36790486534",
  pixKeyType: "CPF / Chave PIX" as const,
  pixBeneficiary: "FPStudio (Nubank)",
  city: "Salvador - BA",
  address: "Trav. Dois Leões, 19 - Pernambués",
  fullAddress: "Travessa Dois Leões, 19 - Pernambués, Salvador - BA, CEP 41110-050",
  cep: "41110-050",
  phone: "(71) 9 8118-4589",
  whatsapp: "5571981184589",
  email: "fpstudio2027@gmail.com",
};

export const INITIAL_ROOMS: StudioRoom[] = [
  {
    id: "room-a",
    name: "Sala A - Gravação Principal & Produção",
    description: "Ambiente acústico completo do FPStudio equipado com DAW Pro-Tools, placa M-Audio Pro, monitoramento caixas TOMATO e microfonação KADOSH 412.",
    hourlyRate: 120,
    capacity: 8,
    equipmentList: [
      "DAW Pro-Tools",
      "Microfone KADOSH 412",
      "Placa de Áudio M-Audio Pro",
      "Caixas TOMATO",
      "Guitarras Ibanez e Memphis",
      "Baixo 6 cordas e 5 cordas",
      "Violão Aço e Nylon"
    ],
  },
  {
    id: "room-b",
    name: "Sala B - Estúdio de Instrumentos & Edição",
    description: "Espaço projetado para gravação de Bateria, Baixo, Guitarras, Teclado, Percussão, Sanfona e Violino com acústica tratada.",
    hourlyRate: 90,
    capacity: 6,
    equipmentList: [
      "DAW Pro-Tools",
      "Placa de Áudio M-Audio Pro",
      "Caixas TOMATO",
      "Microfones KADOSH 412",
      "Guitarras Ibanez & Memphis",
      "Baixo 5 e 6 cordas",
      "Violão Aço & Nylon"
    ],
  },
  {
    id: "room-c",
    name: "Cabine Vocal & Edição de Vídeo",
    description: "Cabine acústica isolada para gravação de Voz, Voz Guia, Afinação de Voz, Edição de Bateria e Produção de Vinhetas.",
    hourlyRate: 80,
    capacity: 4,
    equipmentList: [
      "DAW Pro-Tools",
      "Microfone KADOSH 412",
      "Placa de Áudio M-Audio Pro",
      "Caixas TOMATO",
      "Ilha de Edição de Vídeo Pro"
    ],
  },
];

export const FPSTUDIO_EQUIPMENT = [
  { category: "DAW & Áudio", item: "DAW Pro-Tools (Incluso)" },
  { category: "Microfonação", item: "Microfone KADOSH 412 (Incluso)" },
  { category: "Placa de Áudio", item: "Placa de Áudio M-Audio Pro (Incluso)" },
  { category: "Monitoramento", item: "Caixas TOMATO" },
  { category: "Guitarras", item: "Guitarra Ibanez e Memphis" },
  { category: "Baixos", item: "Baixo 6 cordas e Baixo 5 cordas" },
  { category: "Violões", item: "Violão Aço e Violão Nylon" },
];

export interface RecordingOption {
  id: string;
  label: string;
  type: 'instrument' | 'vocal' | 'edition';
  price: number;
}

export const RECORDING_OPTIONS: RecordingOption[] = [
  { id: "pro_tools", label: "Pro-Tools", type: "edition", price: 0 },
  { id: "microfone", label: "Microfone", type: "edition", price: 0 },
  { id: "placa_audio", label: "Placa de Áudio", type: "edition", price: 0 },
  { id: "bateria", label: "Bateria", type: "instrument", price: 120 },
  { id: "guitarra", label: "Guitarra", type: "instrument", price: 80 },
  { id: "violao", label: "Violão", type: "instrument", price: 70 },
  { id: "baixo", label: "Baixo", type: "instrument", price: 70 },
  { id: "teclado", label: "Teclado", type: "instrument", price: 80 },
  { id: "percussao", label: "Percussão", type: "instrument", price: 60 },
  { id: "sanfona", label: "Sanfona", type: "instrument", price: 90 },
  { id: "violino", label: "Violino", type: "instrument", price: 90 },
  { id: "voz_guia", label: "Voz Guia", type: "vocal", price: 50 },
  { id: "voz", label: "Voz Principal", type: "vocal", price: 100 },
  { id: "afinacao_voz", label: "Afinação de Voz", type: "edition", price: 80 },
  { id: "edicao_bateria", label: "Edição de Bateria", type: "edition", price: 100 },
];

export const INITIAL_SERVICES: StudioService[] = [
  {
    id: "srv-autoral-com-arranjo",
    name: "Música Autoral (Com Arranjo)",
    description: "Produção completa de composição autoral no FPStudio com criação de arranjo instrumental, captação multicanal e gravação no Pro-Tools.",
    category: "produção",
    defaultRoomId: "room-a",
    defaultRoomName: "Sala A - Gravação Principal & Produção",
    durationHours: 4,
    basePrice: 800,
    iconName: "Music2",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-autoral-sem-arranjo",
    name: "Música Autoral (Sem Arranjo)",
    description: "Gravação direta e captação da sua música autoral com voz guia, instrumento base (violão/teclado) ou acompanhamento simples.",
    category: "gravação",
    defaultRoomId: "room-a",
    defaultRoomName: "Sala A - Gravação Principal & Produção",
    durationHours: 2,
    basePrice: 500,
    iconName: "Mic2",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-comum-com-arranjo",
    name: "Música Comum (Com Arranjo)",
    description: "Gravação de música comum/cover com arranjo instrumental exclusivo personalizado com instrumentos da sua escolha.",
    category: "produção",
    defaultRoomId: "room-a",
    defaultRoomName: "Sala A - Gravação Principal & Produção",
    durationHours: 3,
    basePrice: 600,
    iconName: "Sliders",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-comum-sem-arranjo",
    name: "Música Comum (Sem Arranjo)",
    description: "Captação rápida de voz e instrumentos para reprodução de música comum sem alterações de arranjo.",
    category: "gravação",
    defaultRoomId: "room-b",
    defaultRoomName: "Sala B - Estúdio de Instrumentos & Edição",
    durationHours: 2,
    basePrice: 400,
    iconName: "Disc3",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-vinheta",
    name: "Vinheta Profissional",
    description: "Criação, locução, gravação e edição de vinheta para comerciais, podcasts, emissoras de rádio e redes sociais.",
    category: "dublagem",
    defaultRoomId: "room-c",
    defaultRoomName: "Cabine Vocal & Edição de Vídeo",
    durationHours: 1,
    basePrice: 250,
    iconName: "Radio",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-edicao-afinacao",
    name: "Edição de Bateria & Afinação de Voz",
    description: "Tratamento de áudio em Pro-Tools: quantização/alinhamento de bateria e afinação cirúrgica de vozes.",
    category: "mix_master",
    defaultRoomId: "room-c",
    defaultRoomName: "Cabine Vocal & Edição de Vídeo",
    durationHours: 2,
    basePrice: 300,
    iconName: "AudioWaveform",
    imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&auto=format&fit=crop&q=80",
  },
];

export const INITIAL_CLIENTS: UserProfile[] = [];

export const INITIAL_BOOKINGS: BookingRequest[] = [];

export const INITIAL_QUOTES: PixQuote[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];
