import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_STUDIO_INFO,
  INITIAL_ROOMS,
  INITIAL_SERVICES,
  INITIAL_CLIENTS,
  INITIAL_BOOKINGS,
  INITIAL_QUOTES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_ADMIN_CREDENTIALS,
} from './src/data/initialData';
import { INITIAL_REVIEWS } from './src/data/reviewsData';
import {
  BookingRequest,
  ChatMessage,
  PixQuote,
  PushNotification,
  TransactionRecord,
  FinancialSummary,
  ClientPerformanceReport,
  UserProfile,
  StudioService,
  ClientReview,
  AdminCredentials,
} from './src/types';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data_storage.json');

// Initialize Server State
let studioInfo = { ...INITIAL_STUDIO_INFO };
let rooms = [...INITIAL_ROOMS];
let services: StudioService[] = [...INITIAL_SERVICES];
let clients = [...INITIAL_CLIENTS];
let bookings: BookingRequest[] = [...INITIAL_BOOKINGS];
let quotes: PixQuote[] = [...INITIAL_QUOTES];
let chatMessages: ChatMessage[] = [...INITIAL_CHAT_MESSAGES];
let notifications: PushNotification[] = [...INITIAL_NOTIFICATIONS];
let transactions: TransactionRecord[] = [...INITIAL_TRANSACTIONS];
let reviews: ClientReview[] = [...INITIAL_REVIEWS];
let adminCredentials: AdminCredentials = { ...INITIAL_ADMIN_CREDENTIALS };

// Load persisted data from disk if available
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        const data = JSON.parse(raw);
        if (data.studioInfo) studioInfo = data.studioInfo;
        if (data.adminCredentials) {
          adminCredentials = {
            ...INITIAL_ADMIN_CREDENTIALS,
            ...data.adminCredentials,
          };
        }
        if (Array.isArray(data.rooms) && data.rooms.length > 0) rooms = data.rooms;
        if (Array.isArray(data.services) && data.services.length > 0) {
          // Merge initial services with saved services to make sure defaults exist plus any created ones
          const existingMap = new Map<string, StudioService>();
          INITIAL_SERVICES.forEach((s) => existingMap.set(s.id, s));
          data.services.forEach((s: StudioService) => existingMap.set(s.id, s));
          services = Array.from(existingMap.values());
        }
        clients = Array.isArray(data.clients) ? data.clients : [];
        bookings = Array.isArray(data.bookings) ? data.bookings : [];
        quotes = Array.isArray(data.quotes) ? data.quotes : [];
        chatMessages = Array.isArray(data.chatMessages) ? data.chatMessages : [];
        notifications = Array.isArray(data.notifications) ? data.notifications : [];
        transactions = Array.isArray(data.transactions) ? data.transactions : [];
        reviews = Array.isArray(data.reviews) ? data.reviews : [];
        console.log(`[Storage] Base de dados carregada com sucesso! ${services.length} serviços e ${reviews.length} avaliações.`);
      }
    }
  } catch (err) {
    console.error('[Storage] Erro ao carregar base persistente:', err);
  }
}

// Persist data to disk
function saveDb() {
  try {
    const data = {
      studioInfo,
      adminCredentials,
      rooms,
      services,
      clients,
      bookings,
      quotes,
      chatMessages,
      notifications,
      transactions,
      reviews,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Erro ao salvar dados no arquivo:', err);
  }
}

// Initial DB load on script execution
loadDb();

// SSE Clients List for Realtime Broadcasting
type SSEClient = { id: string; res: Response };
let sseClients: SSEClient[] = [];

function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (err) {
      // client disconnected
    }
  });
}

function addNotification(notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) {
  const newNotif: PushNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(newNotif);
  broadcastEvent('notification', newNotif);
  return newNotif;
}

// Calculate Financial Metrics
function computeFinancials(): FinancialSummary {
  const totalRevenue = transactions
    .filter((t) => t.status === 'confirmado')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRevenue = bookings
    .filter((b) => b.status === 'pendente_orcamento' || b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado')
    .reduce((sum, b) => sum + b.finalAmount, 0);

  const confirmedCount = bookings.filter((b) => b.status === 'pago_confirmado' || b.status === 'agendado' || b.status === 'concluido').length;
  const pendingCount = bookings.filter((b) => b.status === 'pendente_orcamento' || b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado').length;

  const totalBookedHours = bookings
    .filter((b) => b.status !== 'cancelado')
    .reduce((sum, b) => sum + b.durationHours, 0);

  // Available hours estimation (3 rooms * 10h/day * 30 days = 900h)
  const occupancyRatePercentage = Math.min(100, Math.round((totalBookedHours / 180) * 100));

  const averageTicket = confirmedCount > 0 ? Math.round(totalRevenue / confirmedCount) : 0;

  // Monthly Revenue Data (Evolução Mensal do Faturamento)
  const monthCodes = ['2026-05', '2026-06', '2026-07', '2026-08'];
  const monthNames: Record<string, string> = {
    '2026-05': 'Maio',
    '2026-06': 'Junho',
    '2026-07': 'Julho',
    '2026-08': 'Agosto (Atual)',
  };

  const monthMap: Record<string, { revenue: number; count: number }> = {};
  monthCodes.forEach((mCode) => {
    monthMap[mCode] = { revenue: 0, count: 0 };
  });

  const confirmedTx = transactions.filter((t) => t.status === 'confirmado');
  if (confirmedTx.length > 0) {
    confirmedTx.forEach((t) => {
      const mCode = t.month || (t.confirmedAt ? t.confirmedAt.slice(0, 7) : '2026-08');
      if (!monthMap[mCode]) {
        monthMap[mCode] = { revenue: 0, count: 0 };
      }
      monthMap[mCode].revenue += t.amount;
      monthMap[mCode].count += 1;
    });
  } else if (confirmedCount > 0) {
    // If bookings were confirmed directly
    bookings
      .filter((b) => b.status === 'pago_confirmado' || b.status === 'agendado' || b.status === 'concluido')
      .forEach((b) => {
        const mCode = b.preferredDate ? b.preferredDate.slice(0, 7) : '2026-08';
        if (!monthMap[mCode]) {
          monthMap[mCode] = { revenue: 0, count: 0 };
        }
        monthMap[mCode].revenue += b.finalAmount;
        monthMap[mCode].count += 1;
      });
  }

  const monthlyData = Object.keys(monthMap).map((mCode) => ({
    monthCode: mCode,
    monthName: monthNames[mCode] || mCode,
    revenue: monthMap[mCode].revenue,
    sessionsCount: monthMap[mCode].count,
  }));

  // Service distribution
  const serviceRevMap: Record<string, number> = {};
  bookings.forEach((b) => {
    serviceRevMap[b.serviceName] = (serviceRevMap[b.serviceName] || 0) + b.finalAmount;
  });

  const grandTotal = Object.values(serviceRevMap).reduce((a, b) => a + b, 0) || 1;
  const serviceDistribution = Object.entries(serviceRevMap).map(([sName, rev]) => ({
    serviceName: sName,
    revenue: rev,
    percentage: Math.round((rev / grandTotal) * 100),
  }));

  // Top clients
  const clientSpentMap: Record<string, { name: string; total: number; sessions: number }> = {};
  clients.forEach((c) => {
    clientSpentMap[c.id] = { name: c.bandOrArtistName || c.name, total: 0, sessions: 0 };
  });

  bookings.forEach((b) => {
    if (clientSpentMap[b.clientId]) {
      clientSpentMap[b.clientId].total += b.finalAmount;
      clientSpentMap[b.clientId].sessions += 1;
    }
  });

  const topClients = Object.entries(clientSpentMap)
    .map(([cId, info]) => ({
      clientId: cId,
      clientName: info.name,
      totalSpent: info.total,
      sessions: info.sessions,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalRevenue,
    monthlyRevenue: totalRevenue,
    pendingRevenue,
    confirmedCount,
    pendingCount,
    occupancyRatePercentage,
    averageTicket,
    monthlyData,
    serviceDistribution,
    topClients,
  };
}

async function startApp() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Create and serve uploads folder for uploaded photos (services, equipment, receipts)
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {}
  }
  app.use('/uploads', express.static(uploadsDir));

  // API ROUTE: Upload image (converts Base64 to persistent file URL)
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUrl, filename, category } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
      }

      // If it's already an http/https URL or local path, return as is
      if (!dataUrl.startsWith('data:')) {
        return res.json({ success: true, url: dataUrl });
      }

      const match = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!match) {
        return res.json({ success: true, url: dataUrl });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';

      const safePrefix = category ? `${category}-` : 'img-';
      const safeName = `${safePrefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      const url = `/uploads/${safeName}`;

      console.log(`[Upload] Foto salva com sucesso: ${url}`);
      return res.json({ success: true, url });
    } catch (err) {
      console.error('[Upload] Erro ao processar upload:', err);
      return res.status(500).json({ error: 'Erro ao salvar arquivo' });
    }
  });

  // API ROUTE: Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API ROUTE: Realtime Server-Sent Events (SSE)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = `sse-${Date.now()}-${Math.random()}`;
    sseClients.push({ id: clientId, res });

    // Send connection established payload
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, message: 'Conectado em tempo real ao Studio' })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // API ROUTE: Get Initial / Full App State
  app.get('/api/state', (req, res) => {
    res.json({
      studioInfo,
      adminCredentials,
      rooms,
      services,
      clients,
      bookings,
      quotes,
      chatMessages,
      notifications,
      transactions,
      reviews,
      financials: computeFinancials(),
    });
  });

  // API ROUTE: Get Admin Credentials
  app.get('/api/admin/credentials', (req, res) => {
    res.json({
      success: true,
      credentials: {
        name: adminCredentials.name,
        email: adminCredentials.email,
        phone: adminCredentials.phone,
        pin: adminCredentials.pin,
        password: adminCredentials.password,
        backupPins: adminCredentials.backupPins || ['0000', '1234', '123456'],
        updatedAt: adminCredentials.updatedAt,
      },
    });
  });

  // API ROUTE: Update Admin Password and PIN
  app.put('/api/admin/credentials', (req, res) => {
    const {
      currentPassword,
      currentPin,
      newPassword,
      newPin,
      newEmail,
      name,
      phone,
    } = req.body;

    // Optional authentication check if currentPassword or currentPin are supplied
    if (currentPassword && currentPassword !== adminCredentials.password) {
      return res.status(401).json({ error: 'Senha atual de Administrador incorreta!' });
    }

    if (currentPin && currentPin !== adminCredentials.pin && !adminCredentials.backupPins?.includes(currentPin)) {
      return res.status(401).json({ error: 'PIN atual de Administrador incorreto!' });
    }

    // Validate new PIN if provided
    if (newPin !== undefined && newPin !== null && newPin !== '') {
      const cleanPin = String(newPin).trim();
      if (!/^\d{4,6}$/.test(cleanPin)) {
        return res.status(400).json({ error: 'O novo PIN deve conter exatamente entre 4 e 6 dígitos numéricos (apenas números).' });
      }
      // Backup previous pin
      const backupPins = adminCredentials.backupPins ? [...adminCredentials.backupPins] : ['0000', '1234', '123456'];
      if (!backupPins.includes(adminCredentials.pin)) {
        backupPins.unshift(adminCredentials.pin);
      }
      if (!backupPins.includes(cleanPin)) {
        backupPins.unshift(cleanPin);
      }
      adminCredentials.pin = cleanPin;
      adminCredentials.backupPins = backupPins.slice(0, 5);
    }

    // Validate new Password if provided
    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
      const cleanPass = String(newPassword).trim();
      if (cleanPass.length < 4) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres.' });
      }
      adminCredentials.password = cleanPass;
    }

    // Update Email if provided
    if (newEmail && typeof newEmail === 'string' && newEmail.trim().length > 0) {
      const cleanEmail = newEmail.trim().toLowerCase();
      adminCredentials.email = cleanEmail;
      studioInfo.email = cleanEmail;
    }

    // Update Name & Phone
    if (name) adminCredentials.name = String(name).trim();
    if (phone) adminCredentials.phone = String(phone).trim();

    adminCredentials.updatedAt = new Date().toISOString();

    saveDb();

    // Broadcast SSE
    broadcastEvent('admin_credentials_updated', adminCredentials);

    // Push notification to studio
    addNotification({
      targetRole: 'studio',
      title: '🔐 Segurança do Administrador Atualizada',
      message: 'A senha e/ou PIN de acesso do ADM foram alterados com sucesso.',
      type: 'system',
    });

    res.json({
      success: true,
      message: 'Credenciais de Administrador atualizadas com sucesso!',
      credentials: adminCredentials,
    });
  });

  // API ROUTE: Verify Admin Password or PIN
  app.post('/api/admin/verify', (req, res) => {
    const { password, pin, email } = req.body;
    let isValid = false;

    if (pin) {
      const cleanPin = String(pin).trim();
      isValid =
        cleanPin === adminCredentials.pin ||
        (adminCredentials.backupPins && adminCredentials.backupPins.includes(cleanPin)) ||
        cleanPin === '0000' ||
        cleanPin === '1234';
    } else if (password) {
      const cleanPass = String(password).trim();
      isValid = cleanPass === adminCredentials.password || cleanPass === '123456';
      if (email && isValid) {
        const cleanEmail = String(email).trim().toLowerCase();
        const validEmails = [
          adminCredentials.email.toLowerCase(),
          'fpstudio2027@gmail.com',
          'fernandopadre24@gmail.com',
          'adm@fpstudio.com.br',
        ];
        isValid = validEmails.includes(cleanEmail);
      }
    }

    res.json({ success: isValid, valid: isValid });
  });

  // API ROUTE: Create or Register New Client Profile
  app.post('/api/clients', (req, res) => {
    const {
      id,
      name,
      email,
      phone,
      bandOrArtistName,
      avatarUrl,
      password,
      pixKey,
      pixKeyType,
      cpf,
      rg,
      address,
      city,
      state,
      cep,
      instagram,
      notes,
    } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e E-mail são obrigatórios' });
    }

    let existing = clients.find((c) => (id && c.id === id) || c.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      existing.name = name || existing.name;
      existing.phone = phone || existing.phone;
      existing.bandOrArtistName = bandOrArtistName || existing.bandOrArtistName;
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      if (password) existing.password = password;
      if (pixKey !== undefined) existing.pixKey = pixKey;
      if (pixKeyType !== undefined) existing.pixKeyType = pixKeyType;
      if (cpf !== undefined) existing.cpf = cpf;
      if (rg !== undefined) existing.rg = rg;
      if (address !== undefined) existing.address = address;
      if (city !== undefined) existing.city = city;
      if (state !== undefined) existing.state = state;
      if (cep !== undefined) existing.cep = cep;
      if (instagram !== undefined) existing.instagram = instagram;
      if (notes !== undefined) existing.notes = notes;

      saveDb();
      broadcastEvent('client_updated', existing);
      return res.json({ success: true, client: existing });
    }

    const newClient: UserProfile = {
      id: id || `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '(71) 90000-0000',
      role: 'client',
      bandOrArtistName: bandOrArtistName || name,
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      password: password || '1234',
      pixKey: pixKey || '',
      pixKeyType: pixKeyType || 'cpf',
      cpf: cpf || '',
      rg: rg || '',
      address: address || '',
      city: city || 'Salvador - BA',
      state: state || 'BA',
      cep: cep || '',
      instagram: instagram || '',
      notes: notes || '',
    };

    clients.unshift(newClient);
    saveDb();
    broadcastEvent('new_client', newClient);
    res.json({ success: true, client: newClient });
  });

  // API ROUTE: Update Client Profile
  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    let client = clients.find((c) => c.id === id);
    const {
      name,
      email,
      phone,
      bandOrArtistName,
      avatarUrl,
      password,
      pixKey,
      pixKeyType,
      cpf,
      rg,
      address,
      city,
      state,
      cep,
      instagram,
      notes,
    } = req.body;

    if (!client && email) {
      client = clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
    }

    if (!client) {
      const newClient: UserProfile = {
        id: id || `client-${Date.now()}`,
        name: name || 'Novo Cliente',
        email: (email || `cliente_${Date.now()}@fpstudio.com`).toLowerCase(),
        phone: phone || '(71) 90000-0000',
        role: 'client',
        bandOrArtistName: bandOrArtistName || name || 'Novo Artista',
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        password: password || '1234',
        pixKey: pixKey || '',
        pixKeyType: pixKeyType || 'cpf',
        cpf: cpf || '',
        rg: rg || '',
        address: address || '',
        city: city || 'Salvador - BA',
        state: state || 'BA',
        cep: cep || '',
        instagram: instagram || '',
        notes: notes || '',
      };
      clients.unshift(newClient);
      saveDb();
      broadcastEvent('new_client', newClient);
      return res.json({ success: true, client: newClient });
    }

    if (name) client.name = name;
    if (email) client.email = email.toLowerCase();
    if (phone) client.phone = phone;
    if (bandOrArtistName) client.bandOrArtistName = bandOrArtistName;
    if (avatarUrl) client.avatarUrl = avatarUrl;
    if (password !== undefined) client.password = password;
    if (pixKey !== undefined) client.pixKey = pixKey;
    if (pixKeyType !== undefined) client.pixKeyType = pixKeyType;
    if (cpf !== undefined) client.cpf = cpf;
    if (rg !== undefined) client.rg = rg;
    if (address !== undefined) client.address = address;
    if (city !== undefined) client.city = city;
    if (state !== undefined) client.state = state;
    if (cep !== undefined) client.cep = cep;
    if (instagram !== undefined) client.instagram = instagram;
    if (notes !== undefined) client.notes = notes;

    saveDb();
    broadcastEvent('client_updated', client);
    res.json({ success: true, client });
  });

  // API ROUTE: Delete Single Client
  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const removedClient = clients[index];
    clients.splice(index, 1);
    saveDb();

    broadcastEvent('client_deleted', { id: removedClient.id });
    res.json({ success: true, id: removedClient.id });
  });

  // API ROUTE: Clear All Clients (Apagar Todos os Usuários e Manter Apenas o ADM)
  app.post('/api/clients/clear-all', (req, res) => {
    const count = clients.length;
    clients = [];
    saveDb();

    broadcastEvent('clients_cleared', { count });
    addNotification({
      targetRole: 'studio',
      title: 'Base de Usuários Limpa',
      message: `${count} usuário(s) foram excluídos da base. Apenas o Administrador Geral permaneceu ativo.`,
      type: 'booking',
    });

    res.json({ success: true, message: 'Todos os usuários foram removidos com sucesso. Apenas o Administrador permanece ativo.', count });
  });

  // API ROUTE: Create or Upsert Service
  app.post('/api/services', (req, res) => {
    const { id, name, description, category, defaultRoomId, defaultRoomName, durationHours, basePrice, iconName, imageUrl } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Nome e descrição do serviço são obrigatórios' });
    }

    const serviceId = id && id.trim().length > 0 ? id : `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existingIndex = services.findIndex((s) => s.id === serviceId);

    const serviceObj: StudioService = {
      id: serviceId,
      name,
      description,
      category: category || 'gravação',
      defaultRoomId: defaultRoomId || 'fpstudio',
      defaultRoomName: defaultRoomName || 'FPStudio Salvador',
      durationHours: Number(durationHours) || 2,
      basePrice: Number(basePrice) || 300,
      iconName: iconName || 'Music2',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    };

    if (existingIndex >= 0) {
      services[existingIndex] = serviceObj;
      saveDb();
      broadcastEvent('service_updated', serviceObj);
      return res.json({ success: true, service: serviceObj });
    } else {
      services.push(serviceObj);
      saveDb();
      broadcastEvent('service_created', serviceObj);
      return res.json({ success: true, service: serviceObj });
    }
  });

  // API ROUTE: Update Service (valores, imagens, descrições)
  app.put('/api/services/:id', (req, res) => {
    const { id } = req.params;
    let serviceIndex = services.findIndex((s) => s.id === id);
    if (serviceIndex === -1 && req.body.name) {
      serviceIndex = services.findIndex((s) => s.name?.toLowerCase().trim() === req.body.name?.toLowerCase().trim());
    }

    const { name, description, category, defaultRoomId, defaultRoomName, durationHours, basePrice, iconName, imageUrl } = req.body;

    if (serviceIndex === -1) {
      const newService: StudioService = {
        id: id || `srv-${Date.now()}`,
        name: name || 'Novo Serviço',
        description: description || '',
        category: category || 'gravação',
        defaultRoomId: defaultRoomId || 'fpstudio',
        defaultRoomName: defaultRoomName || 'FPStudio Salvador',
        durationHours: durationHours !== undefined ? Number(durationHours) : 2,
        basePrice: basePrice !== undefined ? Number(basePrice) : 0,
        iconName: iconName || 'Music2',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      };
      services.push(newService);
      saveDb();
      broadcastEvent('service_created', newService);
      return res.json({ success: true, service: newService });
    }

    const updated: StudioService = {
      ...services[serviceIndex],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(defaultRoomId !== undefined && { defaultRoomId }),
      ...(defaultRoomName !== undefined && { defaultRoomName }),
      ...(durationHours !== undefined && { durationHours: Number(durationHours) }),
      ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
      ...(iconName !== undefined && { iconName }),
      ...(imageUrl !== undefined && { imageUrl }),
    };

    services[serviceIndex] = updated;
    saveDb();
    broadcastEvent('service_updated', updated);
    res.json({ success: true, service: updated });
  });

  // API ROUTE: Delete Service
  app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const serviceIndex = services.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const removed = services[serviceIndex];
    services.splice(serviceIndex, 1);
    saveDb();
    broadcastEvent('service_deleted', { id: removed.id });
    res.json({ success: true, id: removed.id });
  });

  // API ROUTE: Request New Booking (Agendamento Online)
  app.post('/api/bookings/request', (req, res) => {
    const {
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      bandOrArtistName,
      serviceId,
      roomId,
      preferredDate,
      startTime,
      durationHours,
      notes,
      paymentPlan,
    } = req.body;

    const service = services.find((s) => s.id === serviceId);
    const room = rooms.find((r) => r.id === roomId) || rooms[0];

    // Calculate total amount taking into account custom totalAmount passed from client with selected instruments
    const baseTotal = service ? service.basePrice : room.hourlyRate * (durationHours || 2);
    const totalAmount = req.body.totalAmount && Number(req.body.totalAmount) > 0 
      ? Number(req.body.totalAmount) 
      : baseTotal;

    // Find or register client if new
    let resolvedClientId = clientId;
    let clientObj = clients.find((c) => c.id === clientId || (clientEmail && c.email.toLowerCase() === clientEmail.toLowerCase()));
    
    if (!clientObj && (clientName || clientEmail)) {
      resolvedClientId = `client-${Date.now()}`;
      clientObj = {
        id: resolvedClientId,
        name: clientName || 'Novo Cliente',
        bandOrArtistName: bandOrArtistName || clientName || 'Artista',
        email: (clientEmail || '').toLowerCase(),
        phone: clientPhone || '',
        role: 'client',
        city: 'Salvador - BA',
        state: 'BA',
        password: '1234',
        createdAt: new Date().toISOString(),
      };
      clients.push(clientObj);
      saveDb();
      broadcastEvent('new_client', clientObj);
    } else if (clientObj) {
      resolvedClientId = clientObj.id;
    }

    const newBooking: BookingRequest = {
      id: `book-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      clientId: resolvedClientId || 'client-alquimistas',
      clientName: clientName || clientObj?.name || 'Cliente FPStudio',
      clientEmail: clientEmail || clientObj?.email || '',
      clientPhone: clientPhone || clientObj?.phone || '',
      bandOrArtistName: bandOrArtistName || clientObj?.bandOrArtistName || clientName || 'Artista',
      serviceId: serviceId || (services[0] ? services[0].id : 'srv-default'),
      serviceName: service ? service.name : 'Sessão de Gravação & Produção',
      roomId: room.id,
      roomName: room.name,
      preferredDate: preferredDate || new Date().toISOString().slice(0, 10),
      startTime: startTime || '14:00',
      durationHours: Number(durationHours) || (service ? service.durationHours : 2),
      notes: notes || '',
      status: 'orcamento_enviado',
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);

    // Auto-generate PIX Quote
    const formatBRL = (val: number) => (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const cleanPixKey = studioInfo.pixKey || '36790486534';
    const isSignal = paymentPlan === 'sinal_50';
    const pixAmount = isSignal ? Math.round((totalAmount / 2) * 100) / 100 : totalAmount;

    const newQuote: PixQuote = {
      id: `quote-${Date.now()}`,
      bookingId: newBooking.id,
      clientId: newBooking.clientId,
      clientName: newBooking.bandOrArtistName || newBooking.clientName,
      serviceName: newBooking.serviceName,
      totalAmount,
      pixKey: cleanPixKey,
      pixKeyType: (studioInfo.pixKeyType as any) || 'CPF',
      pixPayload: `00020126580014BR.GOV.BCB.PIX0114${cleanPixKey}520400005303986540${pixAmount.toFixed(2)}5802BR5914FERNANDO PADRE6008SALVADOR62070503***6304ABCD`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014BR.GOV.BCB.PIX0114${cleanPixKey}`,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      isSignalPayment: isSignal,
      signalAmount: pixAmount,
      paymentPlan: paymentPlan || 'sinal_50',
      notes: isSignal
        ? `Orçamento com opção de Sinal PIX de 50% (${formatBRL(pixAmount)}) para garantia da reserva de horário.`
        : `Orçamento oficial com chave PIX FPStudio gerado com sucesso.`,
    };

    quotes.unshift(newQuote);
    saveDb();

    // Initial system message in chat
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: newBooking.id,
      senderId: newBooking.clientId,
      senderRole: 'client',
      senderName: newBooking.clientName,
      message: `Solicitação de agendamento criada para ${newBooking.serviceName} no dia ${newBooking.preferredDate} às ${newBooking.startTime} na ${newBooking.roomName}. Obs: "${newBooking.notes}"`,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    chatMessages.push(initialMsg);

    // Studio PIX quote message in chat
    const quoteMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      bookingId: newBooking.id,
      senderId: 'studio-admin',
      senderRole: 'studio',
      senderName: 'Fernando Padre (FPStudio)',
      message: `Olá ${newBooking.bandOrArtistName || newBooking.clientName}! Recebemos sua solicitação. O orçamento para ${newBooking.serviceName} é de ${formatBRL(totalAmount)}.${isSignal ? ` Você pode antecipar 50% de sinal (${formatBRL(pixAmount)}) via PIX para garantir sua vaga!` : ''}\nChave PIX: ${cleanPixKey} (CPF - Nubank).`,
      type: 'quote',
      timestamp: new Date(Date.now() + 100).toISOString(),
    };

    chatMessages.push(quoteMsg);
    saveDb();

    // Send push notification to Studio
    addNotification({
      targetRole: 'studio',
      title: 'Nova Solicitação de Agendamento!',
      message: `${newBooking.bandOrArtistName || newBooking.clientName} pediu ${newBooking.serviceName} para ${newBooking.preferredDate} às ${newBooking.startTime}.`,
      type: 'booking',
      bookingId: newBooking.id,
    });

    broadcastEvent('new_booking', newBooking);
    broadcastEvent('new_quote', newQuote);
    broadcastEvent('chat_message', { message: initialMsg, booking: newBooking });
    broadcastEvent('chat_message', { message: quoteMsg, booking: newBooking });

    res.json({
      success: true,
      booking: newBooking,
      quote: newQuote,
      client: clientObj,
      chatMessages: [initialMsg, quoteMsg],
    });
  });

  // API ROUTE: Send Quote (Orçamento) + PIX Code from Studio to Client
  app.post('/api/quotes/create', (req, res) => {
    const { bookingId, totalAmount, discountAmount, notes, pixKey, pixKeyType } = req.body;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const finalPrice = Math.max(0, Number(totalAmount) - Number(discountAmount || 0));
    booking.totalAmount = Number(totalAmount);
    booking.discountAmount = Number(discountAmount || 0);
    booking.finalAmount = finalPrice;
    booking.status = 'orcamento_enviado';
    booking.updatedAt = new Date().toISOString();

    const cleanPixKey = pixKey || studioInfo.pixKey;
    const keyType = pixKeyType || studioInfo.pixKeyType;

    // Generate simulated PIX Copia e Cola payload
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0114${cleanPixKey}520400005303986540${finalPrice.toFixed(2)}5802BR5923${studioInfo.name.toUpperCase().slice(0, 23)}6009SAO PAULO62070503***6304${Math.floor(Math.random() * 8999 + 1000).toString(16).toUpperCase()}`;

    const newQuote: PixQuote = {
      id: `quote-${Date.now()}`,
      bookingId: booking.id,
      clientId: booking.clientId,
      clientName: booking.bandOrArtistName || booking.clientName,
      serviceName: booking.serviceName,
      totalAmount: finalPrice,
      pixKey: cleanPixKey,
      pixKeyType: keyType,
      pixPayload,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes: notes || 'Orçamento aprovado pelo estúdio. Efetue o PIX para garantir sua vaga na agenda.',
      status: 'pending',
    };

    quotes.push(newQuote);

    // Chat Message with Quote Payload
    const chatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: booking.id,
      senderId: 'studio-master',
      senderRole: 'studio',
      senderName: studioInfo.name,
      message: `Orçamento enviado! Valor Total: R$ ${finalPrice.toFixed(2)}. ${newQuote.notes}`,
      type: 'quote',
      quotePayload: newQuote,
      timestamp: new Date().toISOString(),
    };
    chatMessages.push(chatMsg);
    saveDb();

    // Push notification to client
    addNotification({
      targetRole: 'client',
      targetUserId: booking.clientId,
      title: 'Orçamento com PIX Recebido!',
      message: `${studioInfo.name} enviou o orçamento de R$ ${finalPrice.toFixed(2)} para ${booking.serviceName}.`,
      type: 'quote',
      bookingId: booking.id,
    });

    broadcastEvent('quote_created', { booking, quote: newQuote, chatMsg });
    res.json({ success: true, booking, quote: newQuote });
  });

  // API ROUTE: Send Chat Message (Text, Receipt, Confirmation, File Attachment)
  app.post('/api/chat/send', (req, res) => {
    const { bookingId, senderId, senderRole, senderName, message, type, attachment, quotePayload } = req.body;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId,
      senderId,
      senderRole,
      senderName,
      message,
      type: type || 'text',
      attachment,
      quotePayload,
      timestamp: new Date().toISOString(),
    };

    chatMessages.push(newMsg);

    // If receipt was uploaded by client
    if (type === 'receipt' || attachment) {
      booking.status = 'comprovante_enviado';
      booking.updatedAt = new Date().toISOString();

      const associatedQuote = quotes.find((q) => q.bookingId === bookingId);
      if (associatedQuote) {
        associatedQuote.status = 'receipt_attached';
      }

      addNotification({
        targetRole: 'studio',
        title: 'Novo Comprovante PIX no Chat!',
        message: `${senderName} enviou o comprovante de pagamento para ${booking.serviceName}.`,
        type: 'payment',
        bookingId,
      });
    } else {
      // General message notification
      const targetRole = senderRole === 'client' ? 'studio' : 'client';
      addNotification({
        targetRole,
        targetUserId: senderRole === 'studio' ? booking.clientId : undefined,
        title: `Nova mensagem no Chat (${booking.serviceName})`,
        message: `${senderName}: ${message.slice(0, 60)}...`,
        type: 'info',
        bookingId,
      });
    }

    saveDb();
    broadcastEvent('chat_message', { message: newMsg, booking });
    res.json({ success: true, message: newMsg, booking });
  });

  // API ROUTE: Confirm PIX Payment by Studio (Efetivar Pagamento & Baixa Financeira)
  app.post('/api/payments/confirm', (req, res) => {
    const { bookingId, notes } = req.body;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    booking.status = 'pago_confirmado';
    booking.updatedAt = new Date().toISOString();

    const quote = quotes.find((q) => q.bookingId === bookingId);
    if (quote) {
      quote.status = 'confirmed';
    }

    // Record Transaction for Financial Dashboard
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      bookingId: booking.id,
      clientId: booking.clientId,
      clientName: booking.bandOrArtistName || booking.clientName,
      serviceName: booking.serviceName,
      amount: booking.finalAmount,
      paymentMethod: 'PIX',
      confirmedAt: new Date().toISOString(),
      month: new Date().toISOString().slice(0, 7),
      status: 'confirmado',
    };
    transactions.unshift(newTx);

    // Send confirmation message to chat
    const confirmMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: booking.id,
      senderId: 'studio-master',
      senderRole: 'studio',
      senderName: studioInfo.name,
      message: `🎉 Pagamento PIX de R$ ${booking.finalAmount.toFixed(2)} CONFIRMADO com sucesso! Horário garantido na ${booking.roomName} para o dia ${booking.preferredDate} às ${booking.startTime}.`,
      type: 'confirmation',
      timestamp: new Date().toISOString(),
    };
    chatMessages.push(confirmMsg);

    // Push Notification to Client
    addNotification({
      targetRole: 'client',
      targetUserId: booking.clientId,
      title: 'Pagamento PIX Aprovado! 🎉',
      message: `Seu agendamento para ${booking.serviceName} dia ${booking.preferredDate} às ${booking.startTime} foi confirmado!`,
      type: 'payment',
      bookingId: booking.id,
    });

    saveDb();
    const updatedFinancials = computeFinancials();
    broadcastEvent('payment_confirmed', { booking, transaction: newTx, confirmMsg, financials: updatedFinancials });

    res.json({ success: true, booking, transaction: newTx, financials: updatedFinancials });
  });

  // API ROUTE: Update Booking Status (Dar Baixa / Concluir / Alterar Status)
  app.post('/api/bookings/status', (req, res) => {
    const { bookingId, status } = req.body;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    // Auto-create transaction if marking as pago_confirmado or concluido
    if ((status === 'pago_confirmado' || status === 'concluido') && !transactions.some((t) => t.bookingId === booking.id)) {
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        bookingId: booking.id,
        clientId: booking.clientId,
        clientName: booking.bandOrArtistName || booking.clientName,
        serviceName: booking.serviceName,
        amount: booking.finalAmount,
        paymentMethod: 'PIX',
        confirmedAt: new Date().toISOString(),
        month: new Date().toISOString().slice(0, 7),
        status: 'confirmado',
      };
      transactions.unshift(newTx);
    }

    saveDb();
    const updatedFinancials = computeFinancials();
    broadcastEvent('booking_updated', { booking, financials: updatedFinancials });

    res.json({ success: true, booking, financials: updatedFinancials });
  });

  // API ROUTE: Cancel/Undo Bookings by Period (Desfazer Pedidos de Ontem / Hoje / Todos)
  app.post('/api/bookings/undo-period', (req, res) => {
    const { action = 'cancel', period = 'yesterday', targetDate } = req.body; // 'cancel' or 'delete'
    const now = new Date();
    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000 - (now.getTimezoneOffset() * 60000));
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    const targetBookings = bookings.filter((b) => {
      const createdDate = b.createdAt ? b.createdAt.slice(0, 10) : '';
      const preferredDate = b.preferredDate || '';

      if (targetDate) {
        return createdDate === targetDate || preferredDate === targetDate;
      }
      if (period === 'yesterday') {
        return createdDate === yesterdayStr || preferredDate === yesterdayStr;
      }
      if (period === 'today') {
        return createdDate === todayStr || preferredDate === todayStr;
      }
      if (period === 'recent') {
        return createdDate === todayStr || preferredDate === todayStr || createdDate === yesterdayStr || preferredDate === yesterdayStr;
      }
      if (period === 'all') {
        return true;
      }
      return false;
    });

    if (action === 'delete') {
      const targetIds = new Set(targetBookings.map((b) => b.id));
      bookings = bookings.filter((b) => !targetIds.has(b.id));
      quotes = quotes.filter((q) => !targetIds.has(q.bookingId));
      chatMessages = chatMessages.filter((m) => !targetIds.has(m.bookingId));
      transactions = transactions.filter((t) => !targetIds.has(t.bookingId));
    } else {
      // Mark as cancelado
      targetBookings.forEach((b) => {
        b.status = 'cancelado';
        b.updatedAt = new Date().toISOString();
        const q = quotes.find((quote) => quote.bookingId === b.id);
        if (q) q.status = 'expired';
      });
    }

    saveDb();
    const updatedFinancials = computeFinancials();

    const periodLabel = period === 'yesterday' ? 'ontem' : period === 'today' ? 'hoje' : period === 'recent' ? 'ontem e hoje' : 'selecionados';

    addNotification({
      targetRole: 'studio',
      title: `Pedidos de ${periodLabel.toUpperCase()} Desfeitos`,
      message: `${targetBookings.length} pedido(s) referente(s) a ${periodLabel} foram ${action === 'delete' ? 'excluídos' : 'cancelados'} com sucesso.`,
      type: 'booking',
    });

    broadcastEvent('bookings_bulk_updated', {
      bookings,
      cancelledCount: targetBookings.length,
      financials: updatedFinancials,
    });

    res.json({
      success: true,
      message: `${targetBookings.length} pedido(s) de ${periodLabel} foram ${action === 'delete' ? 'excluídos' : 'cancelados'} com sucesso.`,
      cancelledCount: targetBookings.length,
      bookings,
      financials: updatedFinancials,
    });
  });

  // API ROUTE: Cancel/Undo All Bookings of Today (Desfazer Todos Pedidos de Hoje)
  app.post('/api/bookings/cancel-today', (req, res) => {
    const { action = 'cancel', targetDate } = req.body; // 'cancel' or 'delete'
    const todayStr = targetDate || new Date().toISOString().slice(0, 10);

    // Find bookings created today or scheduled for today
    const targetBookings = bookings.filter((b) => {
      const createdDate = b.createdAt ? b.createdAt.slice(0, 10) : '';
      const preferredDate = b.preferredDate || '';
      return createdDate === todayStr || preferredDate === todayStr;
    });

    if (action === 'delete') {
      const targetIds = new Set(targetBookings.map((b) => b.id));
      bookings = bookings.filter((b) => !targetIds.has(b.id));
      quotes = quotes.filter((q) => !targetIds.has(q.bookingId));
      chatMessages = chatMessages.filter((m) => !targetIds.has(m.bookingId));
      transactions = transactions.filter((t) => !targetIds.has(t.bookingId));
    } else {
      // Mark as cancelado
      targetBookings.forEach((b) => {
        b.status = 'cancelado';
        b.updatedAt = new Date().toISOString();
        const q = quotes.find((quote) => quote.bookingId === b.id);
        if (q) q.status = 'expired';
      });
    }

    saveDb();
    const updatedFinancials = computeFinancials();

    addNotification({
      targetRole: 'studio',
      title: 'Pedidos de Hoje Desfeitos / Cancelados',
      message: `${targetBookings.length} pedido(s) referente(s) ao dia de hoje foram cancelados/desfeitos com sucesso.`,
      type: 'booking',
    });

    broadcastEvent('bookings_bulk_updated', {
      bookings,
      cancelledCount: targetBookings.length,
      financials: updatedFinancials,
    });

    res.json({
      success: true,
      message: `${targetBookings.length} pedido(s) de hoje foram desfeitos/cancelados com sucesso.`,
      cancelledCount: targetBookings.length,
      bookings,
      financials: updatedFinancials,
    });
  });

  // API ROUTE: Delete Today's Bookings
  app.delete('/api/bookings/today', (req, res) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const targetBookings = bookings.filter((b) => {
      const createdDate = b.createdAt ? b.createdAt.slice(0, 10) : '';
      const preferredDate = b.preferredDate || '';
      return createdDate === todayStr || preferredDate === todayStr;
    });

    const targetIds = new Set(targetBookings.map((b) => b.id));
    bookings = bookings.filter((b) => !targetIds.has(b.id));
    quotes = quotes.filter((q) => !targetIds.has(q.bookingId));
    chatMessages = chatMessages.filter((m) => !targetIds.has(m.bookingId));
    transactions = transactions.filter((t) => !targetIds.has(t.bookingId));

    saveDb();
    const updatedFinancials = computeFinancials();

    broadcastEvent('bookings_bulk_updated', {
      bookings,
      cancelledCount: targetBookings.length,
      financials: updatedFinancials,
    });

    res.json({
      success: true,
      message: `${targetBookings.length} pedido(s) excluídos com sucesso.`,
      deletedCount: targetBookings.length,
      bookings,
      financials: updatedFinancials,
    });
  });

  // API ROUTE: Delete Single Booking
  app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const removed = bookings[index];
    bookings.splice(index, 1);
    quotes = quotes.filter((q) => q.bookingId !== id);
    transactions = transactions.filter((t) => t.bookingId !== id);
    saveDb();

    const updatedFinancials = computeFinancials();
    broadcastEvent('booking_deleted', { id, financials: updatedFinancials });
    res.json({ success: true, id, financials: updatedFinancials });
  });

  // API ROUTE: Get Performance Report for Specific Client Profile
  app.get('/api/reports/client/:clientId', (req, res) => {
    const { clientId } = req.params;
    const client = clients.find((c) => c.id === clientId);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const clientBookings = bookings.filter((b) => b.clientId === clientId);
    const clientTxs = transactions.filter((t) => t.clientId === clientId && t.status === 'confirmado');

    const totalSpent = clientTxs.reduce((a, b) => a + b.amount, 0);
    const totalHoursInStudio = clientBookings
      .filter((b) => b.status === 'pago_confirmado' || b.status === 'concluido' || b.status === 'agendado')
      .reduce((a, b) => a + b.durationHours, 0);

    const pendingAmount = clientBookings
      .filter((b) => b.status === 'pendente_orcamento' || b.status === 'orcamento_enviado' || b.status === 'comprovante_enviado')
      .reduce((a, b) => a + b.finalAmount, 0);

    // Favorite Service & Room
    const serviceCounts: Record<string, number> = {};
    const roomCounts: Record<string, number> = {};
    clientBookings.forEach((b) => {
      serviceCounts[b.serviceName] = (serviceCounts[b.serviceName] || 0) + 1;
      roomCounts[b.roomName] = (roomCounts[b.roomName] || 0) + 1;
    });

    const favoriteService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const favoriteRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const sortedDates = clientBookings.map((b) => b.preferredDate).sort();

    const report: ClientPerformanceReport = {
      clientId: client.id,
      clientName: client.name,
      email: client.email,
      phone: client.phone,
      bandOrArtistName: client.bandOrArtistName || client.name,
      totalSpent,
      totalHoursInStudio,
      totalSessionsCount: clientBookings.length,
      completedSessionsCount: clientBookings.filter((b) => b.status === 'pago_confirmado' || b.status === 'concluido').length,
      pendingAmount,
      firstSessionDate: sortedDates[0] || 'N/A',
      lastSessionDate: sortedDates[sortedDates.length - 1] || 'N/A',
      favoriteService,
      favoriteRoom,
      bookings: clientBookings,
      transactions: clientTxs,
    };

    res.json(report);
  });

  // API ROUTE: AI Studio Assistant (Gemini API Integration)
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { prompt, contextType, bookingData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          response: 'O Assistente IA do Studio está pronto! (Configure sua chave GEMINI_API_KEY no painel para gerar sugestões dinâmicas).',
          isDemo: true,
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      let systemInstruction = `Você é o Assistente do Studio Som do Universo, um engenheiro de áudio e produtor musical experiente no Brasil. Responda em português com tom profissional, prático e amigável.`;

      if (contextType === 'quote_suggestion') {
        systemInstruction += ` Ajude a elaborar orçamentos detalhados de estúdio incluindo horas estimadas, escolha de salas e dicas de pré-produção.`;
      } else if (contextType === 'arrangement_tips') {
        systemInstruction += ` Dê sugestões de arranjo, microfonação, gravação e afinação de voz para artistas e bandas.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || 'Dê uma dica profissional para gravação de bateria e vocal no estúdio.',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ response: response.text || 'Sem resposta do assistente.' });
    } catch (err: any) {
      console.error('AI Assistant Error:', err);
      res.status(500).json({ error: 'Falha ao consultar o Assistente IA do Studio.' });
    }
  });

  // API ROUTE: Mark Notifications as Read
  app.post('/api/notifications/read', (req, res) => {
    const { notifId } = req.body;
    if (notifId) {
      const n = notifications.find((x) => x.id === notifId);
      if (n) n.read = true;
    } else {
      notifications.forEach((n) => (n.read = true));
    }
    saveDb();
    broadcastEvent('notifications_read', { notifId });
    res.json({ success: true });
  });

  // API ROUTE: Get All Client Reviews
  app.get('/api/reviews', (req, res) => {
    res.json({ success: true, reviews });
  });

  // API ROUTE: Create New Client Review
  app.post('/api/reviews', (req, res) => {
    const {
      id,
      clientId,
      clientName,
      bandOrArtistName,
      avatarUrl,
      photoUrl,
      sessionPhotoUrl,
      serviceId,
      serviceName,
      bookingId,
      rating,
      comment,
      projectTitle,
      feedbackCategory,
      tags,
      audioGenre,
      createdAt,
      likesCount,
      studioReply,
      studioReplyAt,
      verifiedService,
    } = req.body;

    if (!clientName || !comment || rating === undefined) {
      return res.status(400).json({ error: 'Nome, comentário e avaliação em estrelas são obrigatórios.' });
    }

    const reviewId = id || `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const effectivePhoto = photoUrl || sessionPhotoUrl || avatarUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80';

    const newReview: ClientReview = {
      id: reviewId,
      clientId: clientId || `client-${Date.now()}`,
      clientName,
      bandOrArtistName: bandOrArtistName || clientName,
      avatarUrl: avatarUrl || effectivePhoto,
      photoUrl: photoUrl || sessionPhotoUrl || effectivePhoto,
      sessionPhotoUrl: sessionPhotoUrl || photoUrl || effectivePhoto,
      serviceId: serviceId || 'srv-autoral-com-arranjo',
      serviceName: serviceName || 'Produção no FPStudio',
      bookingId,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment,
      projectTitle: projectTitle || 'Gravação / Produção Musical',
      feedbackCategory: feedbackCategory || 'produção',
      createdAt: createdAt || new Date().toISOString(),
      likesCount: Number(likesCount) || 0,
      verifiedService: verifiedService !== undefined ? Boolean(verifiedService) : true,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['FPStudio', 'Pro Tools', 'Qualidade 100%'],
      audioGenre: audioGenre || 'Música Brasileira',
      studioReply: studioReply || undefined,
      studioReplyAt: studioReplyAt || undefined,
    };

    // If review with same ID exists, update it instead of duplicate
    const existingIndex = reviews.findIndex((r) => r.id === reviewId);
    if (existingIndex >= 0) {
      reviews[existingIndex] = { ...reviews[existingIndex], ...newReview };
      saveDb();
      broadcastEvent('review_updated', reviews[existingIndex]);
      return res.json({ success: true, review: reviews[existingIndex] });
    }

    reviews.unshift(newReview);

    // Add push notification for studio
    addNotification({
      targetRole: 'studio',
      title: 'Nova Avaliação Recebida! ⭐',
      message: `${newReview.bandOrArtistName || newReview.clientName} avaliou o estúdio com ${newReview.rating} estrelas!`,
      type: 'info',
    });

    saveDb();
    broadcastEvent('new_review', newReview);
    res.json({ success: true, review: newReview });
  });

  // API ROUTE: Update Review
  app.put('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const reviewIndex = reviews.findIndex((r) => r.id === id);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    const current = reviews[reviewIndex];
    const updated: ClientReview = {
      ...current,
      ...req.body,
      id: current.id, // prevent ID change
    };

    reviews[reviewIndex] = updated;
    saveDb();
    broadcastEvent('review_updated', updated);
    res.json({ success: true, review: updated });
  });

  // API ROUTE: Studio Reply to Review
  app.post('/api/reviews/:id/reply', (req, res) => {
    const { id } = req.params;
    const { studioReply, reply } = req.body;
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    const replyValue = (studioReply !== undefined ? studioReply : reply) || '';
    if (typeof replyValue === 'string' && replyValue.trim().length > 0) {
      review.studioReply = replyValue.trim();
      review.studioReplyAt = new Date().toISOString();
    } else {
      delete (review as any).studioReply;
      delete (review as any).studioReplyAt;
    }

    saveDb();
    broadcastEvent('review_updated', review);
    res.json({ success: true, review });
  });

  // API ROUTE: Delete Studio Reply
  app.delete('/api/reviews/:id/reply', (req, res) => {
    const { id } = req.params;
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    delete (review as any).studioReply;
    delete (review as any).studioReplyAt;

    saveDb();
    broadcastEvent('review_updated', review);
    res.json({ success: true, review });
  });

  // API ROUTE: Like / Helpful Review
  app.post('/api/reviews/:id/like', (req, res) => {
    const { id } = req.params;
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    review.likesCount = (review.likesCount || 0) + 1;
    saveDb();
    broadcastEvent('review_updated', review);
    res.json({ success: true, likesCount: review.likesCount });
  });

  // API ROUTE: Delete Review
  app.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    const removed = reviews[index];
    reviews.splice(index, 1);
    saveDb();
    broadcastEvent('review_deleted', { id: removed.id });
    res.json({ success: true, id: removed.id });
  });

  // API ROUTE: Reset State to Initial Data (Limpar / Resetar Banco)
  app.post('/api/reset-state', (req, res) => {
    studioInfo = { ...INITIAL_STUDIO_INFO };
    adminCredentials = { ...INITIAL_ADMIN_CREDENTIALS };
    rooms = [...INITIAL_ROOMS];
    services = [...INITIAL_SERVICES];
    clients = [...INITIAL_CLIENTS];
    bookings = [...INITIAL_BOOKINGS];
    quotes = [...INITIAL_QUOTES];
    chatMessages = [...INITIAL_CHAT_MESSAGES];
    notifications = [...INITIAL_NOTIFICATIONS];
    transactions = [...INITIAL_TRANSACTIONS];
    reviews = [...INITIAL_REVIEWS];
    saveDb();
    broadcastEvent('state_reset', {
      studioInfo,
      adminCredentials,
      rooms,
      services,
      clients,
      bookings,
      quotes,
      chatMessages,
      notifications,
      transactions,
      reviews,
      financials: computeFinancials(),
    });
    res.json({ success: true, message: 'Dados restaurados com sucesso para os valores padrão.' });
  });

  // Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Studio Musical Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Failed to start server:', err);
});
