export type Role = 'client' | 'studio';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  bandOrArtistName?: string;
  password?: string;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'telefone' | 'aleatoria' | string;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  instagram?: string;
  notes?: string;
  createdAt?: string;
}

export interface StudioService {
  id: string;
  name: string;
  description: string;
  category: 'gravação' | 'mix_master' | 'produção' | 'dublagem' | 'equipamentos' | string;
  defaultRoomId: string;
  defaultRoomName: string;
  durationHours: number;
  basePrice: number;
  iconName: string;
  imageUrl?: string;
}

export interface StudioRoom {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  capacity: number;
  equipmentList: string[];
}

export interface StudioEquipmentItem {
  id: string;
  title: string;
  categoryTag: string; // "CORDAS", "INSTRUMENTOS ESPECIAIS", "TECLADOS & FX", "DAW & SOFTWARE", "CAPTAÇÃO & VOZ", "MONITORAMENTO", "PERCUSSÃO & BATERIA"
  modelTag: string;
  description: string;
  imageUrl: string;
  price?: number;
  priceDetails?: string;
  fullSpecs?: string[];
  recommendedUses?: string[];
  includedInStudio?: boolean;
}

export type BookingStatus = 'pendente_orcamento' | 'orcamento_enviado' | 'comprovante_enviado' | 'pago_confirmado' | 'agendado' | 'concluido' | 'cancelado';

export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bandOrArtistName: string;
  serviceId: string;
  serviceName: string;
  roomId: string;
  roomName: string;
  preferredDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationHours: number;
  notes: string;
  selectedInstruments?: string[];
  status: BookingStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PixQuote {
  id: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  totalAmount: number;
  pixKey: string;
  pixKeyType: 'CNPJ' | 'EVP' | 'E-mail' | 'Telefone' | 'CPF' | string;
  pixPayload: string; // PIX copia e cola string
  qrCodeUrl?: string;
  expiresAt: string;
  notes?: string;
  status: 'pending' | 'receipt_attached' | 'confirmed' | 'expired' | 'enviado';
  isSignalPayment?: boolean;
  signalAmount?: number;
  paymentPlan?: string;
}

export type ChatMessageType = 'text' | 'quote' | 'receipt' | 'confirmation' | 'system' | 'quote_proposal' | 'receipt_attached';

export interface ChatAttachment {
  name: string;
  url?: string;
  fileType: 'image' | 'pdf' | 'audio' | 'other';
  dataUrl?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: Role;
  senderName: string;
  message: string;
  type: ChatMessageType;
  attachment?: ChatAttachment;
  quotePayload?: PixQuote;
  timestamp: string;
}

export interface PushNotification {
  id: string;
  targetRole: Role;
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'quote' | 'payment' | 'booking' | 'system';
  read: boolean;
  timestamp: string;
  bookingId?: string;
}

export interface TransactionRecord {
  id: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  amount: number;
  paymentMethod: 'PIX';
  confirmedAt: string;
  month: string; // YYYY-MM
  status: 'confirmado' | 'estornado' | 'cancelado';
  invoicePdfUrl?: string;
}

export interface ClientPerformanceReport {
  clientId: string;
  clientName: string;
  email: string;
  phone: string;
  bandOrArtistName: string;
  totalSpent: number;
  totalHoursInStudio: number;
  totalSessionsCount: number;
  completedSessionsCount: number;
  pendingAmount: number;
  firstSessionDate: string;
  lastSessionDate: string;
  favoriteService: string;
  favoriteRoom: string;
  bookings: BookingRequest[];
  transactions: TransactionRecord[];
}

export interface FinancialSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingRevenue: number;
  confirmedCount: number;
  pendingCount: number;
  occupancyRatePercentage: number;
  averageTicket: number;
  monthlyData: { monthName: string; monthCode: string; revenue: number; sessionsCount: number }[];
  serviceDistribution: { serviceName: string; revenue: number; percentage: number }[];
  topClients: { clientId: string; clientName: string; totalSpent: number; sessions: number }[];
}

export interface ClientReview {
  id: string;
  clientId: string;
  clientName: string;
  bandOrArtistName?: string;
  avatarUrl?: string;
  photoUrl?: string;
  sessionPhotoUrl?: string;
  serviceId?: string;
  serviceName: string;
  bookingId?: string;
  rating: number; // 1 to 5
  comment: string;
  projectTitle?: string;
  feedbackCategory?: 'produção' | 'gravação' | 'mix_master' | 'dublagem' | 'equipamentos' | 'geral';
  createdAt: string;
  likesCount: number;
  studioReply?: string;
  studioReplyAt?: string;
  verifiedService: boolean;
  tags?: string[];
  audioGenre?: string;
}

export interface AdminCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  pin: string;
  backupPins?: string[];
  updatedAt?: string;
}
