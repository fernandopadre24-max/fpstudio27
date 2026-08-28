import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { StudioView } from './components/StudioView';
import { ReviewsView } from './components/ReviewsView';
import { AuthModal, ADMIN_USER } from './components/AuthModal';
import { AdminSecurityModal } from './components/AdminSecurityModal';
import { CustomizationModal } from './components/CustomizationModal';
import { CustomizationProvider, useCustomization } from './context/CustomizationContext';
import { Footer } from './components/Footer';
import { FlagIcon } from './components/FlagIcon';
import { Palette, Globe } from 'lucide-react';
import {
  Role,
  UserProfile,
  StudioService,
  StudioRoom,
  BookingRequest,
  PixQuote,
  ChatMessage,
  PushNotification,
  TransactionRecord,
  FinancialSummary,
  ClientReview,
  AdminCredentials,
} from './types';
import {
  INITIAL_STUDIO_INFO,
  INITIAL_ROOMS,
  INITIAL_SERVICES,
  INITIAL_ADMIN_CREDENTIALS,
} from './data/initialData';
import { safeStorage } from './utils/safeStorage';
import { playNotificationChime } from './utils/audioUtils';

function AppContent() {
  const { currentAccent, currentTheme, currentFont, t, setIsCustomModalOpen, language, setLanguage } =
    useCustomization();
  const getInitialRole = (): Role => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('role');
      if (mode === 'studio') return 'studio';
      if (mode === 'client') return 'client';
    }
    return 'client';
  };

  const [currentRole, setCurrentRole] = useState<Role>(getInitialRole);
  const [activeStaffUser, setActiveStaffUser] = useState<UserProfile | null>(() => {
    try {
      const savedStaff = safeStorage.getItem('fpstudio_active_staff_user');
      if (savedStaff) {
        return JSON.parse(savedStaff);
      }
    } catch (e) {}
    return ADMIN_USER;
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminSecurityModalOpen, setIsAdminSecurityModalOpen] = useState<boolean>(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean>(() => {
    try {
      const loggedIn = safeStorage.getItem('fpstudio_client_logged_in') === 'true';
      const clientId = safeStorage.getItem('fpstudio_active_client_id');
      if (loggedIn && clientId && clientId !== 'client-alquimistas') {
        return true;
      }
      safeStorage.removeItem('fpstudio_client_logged_in');
      safeStorage.removeItem('fpstudio_active_client_id');
    } catch (e) {
      return false;
    }
    return false;
  });

  // Sync role to URL query params
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', newRole);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };

  const handleSelectRoleAndUser = (role: Role, user: UserProfile) => {
    handleRoleChange(role);
    if (role === 'client') {
      setActiveClient(user);
      setIsClientLoggedIn(true);
      safeStorage.setItem('fpstudio_client_logged_in', 'true');
      safeStorage.setItem('fpstudio_active_client_id', user.id);
    } else {
      setActiveStaffUser(user);
      try {
        safeStorage.setItem('fpstudio_active_staff_user', JSON.stringify(user));
      } catch (e) {}
    }
  };

  const handleLogoutClient = () => {
    setIsClientLoggedIn(false);
    setActiveClient(null);
    safeStorage.removeItem('fpstudio_client_logged_in');
    safeStorage.removeItem('fpstudio_active_client_id');
  };

  const handleLogoutStudio = () => {
    handleRoleChange('client');
  };

  const handleUpdateClientProfile = async (updatedData: Partial<UserProfile>) => {
    const targetId = updatedData.id || activeClient?.id;
    const clientToUpdate = targetId ? clients.find((c) => c.id === targetId) || activeClient : activeClient;

    if (!clientToUpdate?.id) {
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
        const data = await res.json();
        if (data.success && data.client) {
          setActiveClient(data.client);
          setIsClientLoggedIn(true);
          setClients((prev) => {
            const next = [data.client, ...prev.filter((c) => c.id !== data.client.id)];
            try {
              safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
          safeStorage.setItem('fpstudio_client_logged_in', 'true');
          safeStorage.setItem('fpstudio_active_client_id', data.client.id);
          safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(data.client));
          return data.client;
        }
      } catch (err) {
        console.error('Error creating client profile on save:', err);
      }
      return;
    }

    const mergedClient: UserProfile = {
      ...clientToUpdate,
      ...updatedData,
      id: clientToUpdate.id,
    };

    // 1. Optimistic update in UI & Local Storage
    if (activeClient?.id === mergedClient.id) {
      setActiveClient(mergedClient);
      try {
        safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(mergedClient));
      } catch (e) {}
    }
    setClients((prev) => {
      const next = prev.map((c) => (c.id === mergedClient.id ? mergedClient : c));
      try {
        safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Persist to server
    try {
      const res = await fetch(`/api/clients/${mergedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedClient),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.client) {
            if (activeClient?.id === data.client.id) {
              setActiveClient(data.client);
              try {
                safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(data.client));
              } catch (e) {}
            }
            setClients((prev) => {
              const next = prev.map((c) => (c.id === data.client.id ? data.client : c));
              try {
                safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
              } catch (e) {}
              return next;
            });
            return data.client;
          }
        } catch (jsonErr) {
          console.warn('[App] Server returned non-JSON for client update:', jsonErr);
        }
      }
    } catch (err) {
      console.warn('Error updating client profile on server:', err);
    }
    return mergedClient;
  };

  const handleCreateNewClient = async (clientData: Omit<UserProfile, 'id' | 'role'>): Promise<UserProfile> => {
    const newClient: UserProfile = {
      id: `client-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: clientData.name?.trim() || 'Artista',
      email: clientData.email?.trim().toLowerCase() || `cliente_${Date.now()}@fpstudio.com`,
      phone: clientData.phone?.trim() || '(71) 90000-0000',
      role: 'client',
      bandOrArtistName: clientData.bandOrArtistName?.trim() || clientData.name?.trim() || 'Artista',
      avatarUrl: clientData.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      password: clientData.password?.trim() || '1234',
      pixKey: clientData.pixKey?.trim() || '',
      pixKeyType: clientData.pixKeyType || 'cpf',
      cpf: clientData.cpf?.trim() || '',
      rg: clientData.rg?.trim() || '',
      address: clientData.address?.trim() || '',
      city: clientData.city || 'Salvador - BA',
      state: clientData.state || 'BA',
      cep: clientData.cep?.trim() || '',
      instagram: clientData.instagram?.trim() || '',
      notes: clientData.notes?.trim() || '',
    };

    // 1. Optimistically update state and storage immediately
    setClients((prev) => {
      const next = [newClient, ...prev.filter((c) => c.id !== newClient.id && c.email.toLowerCase() !== newClient.email.toLowerCase())];
      try {
        safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (currentRole === 'client') {
      setActiveClient(newClient);
      setIsClientLoggedIn(true);
      safeStorage.setItem('fpstudio_client_logged_in', 'true');
      safeStorage.setItem('fpstudio_active_client_id', newClient.id);
      try {
        safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(newClient));
      } catch (e) {}
      handleRoleChange('client');
      setClientActiveTab('new_booking');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // 2. Persist to server backend safely
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.client) {
            setClients((prev) => {
              const next = [data.client, ...prev.filter((c) => c.id !== newClient.id && c.id !== data.client.id)];
              try {
                safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
              } catch (e) {}
              return next;
            });
            if (activeClient?.id === newClient.id) {
              setActiveClient(data.client);
              safeStorage.setItem('fpstudio_active_client_id', data.client.id);
              try {
                safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(data.client));
              } catch (e) {}
            }
            return data.client;
          }
        } catch (jsonErr) {
          console.warn('[App] Non-JSON response for new client:', jsonErr);
        }
      }
    } catch (err) {
      console.warn('[App] Background save client failed:', err);
    }

    return newClient;
  };

  // Core Application State
  const [studioInfo, setStudioInfo] = useState<any>(INITIAL_STUDIO_INFO);
  const [rooms, setRooms] = useState<StudioRoom[]>(INITIAL_ROOMS);
  const [services, setServices] = useState<StudioService[]>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_services_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SERVICES;
  });
  const [clients, setClients] = useState<UserProfile[]>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_clients_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [activeClient, setActiveClient] = useState<UserProfile | null>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_active_client_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [quotes, setQuotes] = useState<PixQuote[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_admin_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.password && parsed.pin) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_ADMIN_CREDENTIALS;
  });
  const [financials, setFinancials] = useState<FinancialSummary>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingRevenue: 0,
    confirmedCount: 0,
    pendingCount: 0,
    occupancyRatePercentage: 0,
    averageTicket: 0,
    monthlyData: [],
    serviceDistribution: [],
    topClients: [],
  });

  // Active Tab State for Client and Studio Views
  const [clientActiveTab, setClientActiveTab] = useState<string>('new_booking');
  const [studioActiveTab, setStudioActiveTab] = useState<string>('agenda');

  // Load Initial Full State
  const loadState = () => {
    fetch('/api/state')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then((data) => {
        if (!data) return;
        setStudioInfo(data.studioInfo || {});
        setRooms(data.rooms || []);
        
        // Robust service state synchronization: merge server and local changes
        const serverServices: StudioService[] = data.services || [];
        let finalServices: StudioService[] = [...serverServices];

        const localSaved = safeStorage.getItem('fpstudio_services_data');
        if (localSaved) {
          try {
            const localList: StudioService[] = JSON.parse(localSaved);
            if (Array.isArray(localList) && localList.length > 0) {
              const serverMap = new Map(serverServices.map((s) => [s.id, s]));
              const mergedMap = new Map<string, StudioService>();

              // First populate with server services
              serverServices.forEach((s) => mergedMap.set(s.id, s));

              // Process local services to preserve customized images, prices, and names
              localList.forEach((localSrv) => {
                if (!localSrv || !localSrv.id) return;
                const serverSrv = serverMap.get(localSrv.id);
                if (!serverSrv) {
                  // Locally created service that wasn't on server yet
                  mergedMap.set(localSrv.id, localSrv);
                  fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(localSrv),
                  }).catch(() => {});
                } else {
                  // Check if local service has custom modifications
                  const hasDifferentImage = Boolean(localSrv.imageUrl && localSrv.imageUrl !== serverSrv.imageUrl);
                  const hasDifferentPrice = localSrv.basePrice !== undefined && localSrv.basePrice !== serverSrv.basePrice;
                  const hasDifferentName = Boolean(localSrv.name && localSrv.name !== serverSrv.name);
                  const hasDifferentDesc = Boolean(localSrv.description && localSrv.description !== serverSrv.description);

                  if (hasDifferentImage || hasDifferentPrice || hasDifferentName || hasDifferentDesc) {
                    const mergedSrv: StudioService = {
                      ...serverSrv,
                      ...localSrv,
                    };
                    mergedMap.set(localSrv.id, mergedSrv);
                    // Sync to server so backend data_storage is permanently updated
                    fetch(`/api/services/${localSrv.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(mergedSrv),
                    }).catch(() => {});
                  }
                }
              });

              finalServices = Array.from(mergedMap.values());
            }
          } catch (e) {
            console.warn('[App] Erro ao restaurar serviços do localStorage:', e);
          }
        }
        try {
          safeStorage.setItem('fpstudio_services_data', JSON.stringify(finalServices));
        } catch (e) {}
        setServices(finalServices);

        // Merge Server Clients with Local Storage to ensure persistence across restarts
        let finalClients: UserProfile[] = data.clients || [];
        const localSavedClients = safeStorage.getItem('fpstudio_clients_data');
        if (localSavedClients) {
          try {
            const parsedLocal = JSON.parse(localSavedClients);
            if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
              const clientsMap = new Map<string, UserProfile>();
              finalClients.forEach((c) => clientsMap.set(c.id, c));
              parsedLocal.forEach((localC: UserProfile) => {
                if (localC && localC.id) {
                  const existing = clientsMap.get(localC.id);
                  if (!existing) {
                    clientsMap.set(localC.id, localC);
                    // Sync locally saved client to server so backend DB stays updated
                    fetch('/api/clients', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(localC),
                    }).catch(() => {});
                  } else {
                    const mergedC = { ...existing, ...localC };
                    clientsMap.set(localC.id, mergedC);
                  }
                }
              });
              finalClients = Array.from(clientsMap.values());
            }
          } catch (e) {
            console.warn('[App] Erro ao restaurar clientes do localStorage:', e);
          }
        }
        try {
          safeStorage.setItem('fpstudio_clients_data', JSON.stringify(finalClients));
        } catch (e) {}
        setClients(finalClients);

        if (finalClients && finalClients.length > 0) {
          const savedId = safeStorage.getItem('fpstudio_active_client_id');
          const savedLoggedIn = safeStorage.getItem('fpstudio_client_logged_in') === 'true';
          if (savedLoggedIn && savedId) {
            const match = finalClients.find((c: UserProfile) => c.id === savedId);
            if (match) {
              setActiveClient(match);
              setIsClientLoggedIn(true);
            } else {
              setActiveClient(null);
              setIsClientLoggedIn(false);
            }
          } else {
            setActiveClient(null);
            setIsClientLoggedIn(false);
          }
        }
        
        // Ensure unique keys
        const rawBookings: BookingRequest[] = data.bookings || [];
        const uniqueBookings = Array.from(new Map(rawBookings.map((b) => [b.id, b])).values());
        setBookings(uniqueBookings);

        const rawQuotes: PixQuote[] = data.quotes || [];
        const uniqueQuotes = Array.from(new Map(rawQuotes.map((q) => [q.id, q])).values());
        setQuotes(uniqueQuotes);

        const rawMsgs: ChatMessage[] = data.chatMessages || [];
        const uniqueMsgs = Array.from(new Map(rawMsgs.map((m) => [m.id, m])).values());
        setChatMessages(uniqueMsgs);

        const rawNotifs: PushNotification[] = data.notifications || [];
        const uniqueNotifs = Array.from(new Map(rawNotifs.map((n) => [n.id, n])).values());
        setNotifications(uniqueNotifs);

        const rawTxs: TransactionRecord[] = data.transactions || [];
        const uniqueTxs = Array.from(new Map(rawTxs.map((t) => [t.id, t])).values());
        setTransactions(uniqueTxs);

        const rawReviews: ClientReview[] = data.reviews || [];
        const uniqueReviews = Array.from(new Map(rawReviews.map((r) => [r.id, r])).values());
        setReviews(uniqueReviews);

        if (data.adminCredentials && data.adminCredentials.password) {
          setAdminCredentials(data.adminCredentials);
          try {
            safeStorage.setItem('fpstudio_admin_credentials', JSON.stringify(data.adminCredentials));
          } catch (e) {}
        }

        setFinancials(data.financials || {});
      })
      .catch((err) => console.error('Failed to load initial state:', err));
  };

  useEffect(() => {
    loadState();

    // Establish Realtime Server-Sent Events (SSE) Connection safely
    let eventSource: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
        };

        eventSource.addEventListener('notification', (e: MessageEvent) => {
          try {
            const notif: PushNotification = JSON.parse(e.data);
            setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
            playNotificationChime();
          } catch (err) {
            console.error('Error parsing SSE notification:', err);
          }
        });

        eventSource.addEventListener('notifications_read', (e: MessageEvent) => {
          try {
            const { notifId } = JSON.parse(e.data);
            if (notifId) {
              setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
            } else {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }
          } catch (err) {
            console.error('Error parsing SSE notifications_read:', err);
          }
        });

        eventSource.addEventListener('notification_deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            if (id) {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            }
          } catch (err) {
            console.error('Error parsing SSE notification_deleted:', err);
          }
        });

        eventSource.addEventListener('notifications_cleared', (e: MessageEvent) => {
          try {
            const { role } = JSON.parse(e.data);
            if (role) {
              setNotifications((prev) => prev.filter((n) => n.targetRole !== role && n.targetRole !== 'all'));
            } else {
              setNotifications([]);
            }
          } catch (err) {
            console.error('Error parsing SSE notifications_cleared:', err);
          }
        });

        eventSource.addEventListener('new_booking', (e: MessageEvent) => {
          try {
            const newBooking: BookingRequest = JSON.parse(e.data);
            setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
          } catch (err) {
            console.error('Error parsing SSE new_booking:', err);
          }
        });

        eventSource.addEventListener('quote_created', (e: MessageEvent) => {
          try {
            const { booking, quote, chatMsg } = JSON.parse(e.data);
            setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
            setQuotes((prev) => [...prev.filter((q) => q.id !== quote.id), quote]);
            if (chatMsg) setChatMessages((prev) => [...prev.filter((m) => m.id !== chatMsg.id), chatMsg]);
          } catch (err) {
            console.error('Error parsing SSE quote_created:', err);
          }
        });

        eventSource.addEventListener('chat_message', (e: MessageEvent) => {
          try {
            const rawData = JSON.parse(e.data);
            let msgObj: ChatMessage | null = null;
            let bookingObj: BookingRequest | null = null;

            if (rawData && typeof rawData === 'object') {
              if (rawData.message && typeof rawData.message === 'object' && rawData.message.id) {
                msgObj = rawData.message;
                bookingObj = rawData.booking || null;
              } else if (rawData.chatMsg && typeof rawData.chatMsg === 'object' && rawData.chatMsg.id) {
                msgObj = rawData.chatMsg;
                bookingObj = rawData.booking || null;
              } else if (rawData.id && rawData.bookingId) {
                msgObj = rawData as ChatMessage;
              }
            }

            if (msgObj && msgObj.id) {
              setChatMessages((prev) => [...prev.filter((m) => m.id !== msgObj!.id), msgObj!]);
            }
            if (bookingObj && bookingObj.id) {
              setBookings((prev) => prev.map((b) => (b.id === bookingObj!.id ? bookingObj! : b)));
            }
          } catch (err) {
            console.error('Error parsing SSE chat_message:', err);
          }
        });

        eventSource.addEventListener('payment_confirmed', (e: MessageEvent) => {
          try {
            const { booking, transaction, confirmMsg, financials: updatedFinancials } = JSON.parse(e.data);
            setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
            if (transaction) setTransactions((prev) => [transaction, ...prev.filter((t) => t.id !== transaction.id)]);
            if (confirmMsg) setChatMessages((prev) => [...prev.filter((m) => m.id !== confirmMsg.id), confirmMsg]);
            if (updatedFinancials) setFinancials(updatedFinancials);
          } catch (err) {
            console.error('Error parsing SSE payment_confirmed:', err);
          }
        });

        eventSource.addEventListener('new_client', (e: MessageEvent) => {
          try {
            const newClient: UserProfile = JSON.parse(e.data);
            setClients((prev) => {
              const next = [newClient, ...prev.filter((c) => c.id !== newClient.id)];
              try {
                safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
              } catch (err) {}
              return next;
            });
          } catch (err) {
            console.error('Error parsing SSE new_client:', err);
          }
        });

        eventSource.addEventListener('client_updated', (e: MessageEvent) => {
          try {
            const updatedClient: UserProfile = JSON.parse(e.data);
            setClients((prev) => {
              const next = prev.map((c) => (c.id === updatedClient.id ? updatedClient : c));
              try {
                safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
              } catch (err) {}
              return next;
            });
            setActiveClient((prev) => (prev && prev.id === updatedClient.id ? { ...prev, ...updatedClient } : prev));
          } catch (err) {
            console.error('Error parsing SSE client_updated:', err);
          }
        });

        eventSource.addEventListener('client_deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            setClients((prev) => {
              const next = prev.filter((c) => c.id !== id);
              try {
                safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
              } catch (err) {}
              return next;
            });
          } catch (err) {
            console.error('Error parsing SSE client_deleted:', err);
          }
        });

        eventSource.addEventListener('clients_cleared', () => {
          try {
            setClients([]);
            setActiveClient(null);
            safeStorage.removeItem('fpstudio_clients_data');
            safeStorage.removeItem('fpstudio_active_client_id');
            safeStorage.removeItem('fpstudio_client_logged_in');
          } catch (err) {
            console.error('Error handling SSE clients_cleared:', err);
          }
        });

        eventSource.addEventListener('service_created', (e: MessageEvent) => {
          try {
            const newService: StudioService = JSON.parse(e.data);
            setServices((prev) => [...prev.filter((s) => s.id !== newService.id), newService]);
          } catch (err) {
            console.error('Error parsing SSE service_created:', err);
          }
        });

        eventSource.addEventListener('service_updated', (e: MessageEvent) => {
          try {
            const updatedService: StudioService = JSON.parse(e.data);
            setServices((prev) => prev.map((s) => (s.id === updatedService.id ? updatedService : s)));
          } catch (err) {
            console.error('Error parsing SSE service_updated:', err);
          }
        });

        eventSource.addEventListener('service_deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            setServices((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            console.error('Error parsing SSE service_deleted:', err);
          }
        });

        eventSource.addEventListener('booking_updated', (e: MessageEvent) => {
          try {
            const { booking, transaction, financials: updatedFinancials } = JSON.parse(e.data);
            if (booking) {
              setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));
            }
            if (transaction) {
              setTransactions((prev) => [transaction, ...prev.filter((t) => t.id !== transaction.id)]);
            }
            if (updatedFinancials) {
              setFinancials(updatedFinancials);
            }
          } catch (err) {
            console.error('Error parsing SSE booking_updated:', err);
          }
        });

        eventSource.addEventListener('bookings_bulk_updated', (e: MessageEvent) => {
          try {
            const { bookings: updatedBookings, financials: updatedFinancials } = JSON.parse(e.data);
            if (updatedBookings) setBookings(updatedBookings);
            if (updatedFinancials) setFinancials(updatedFinancials);
          } catch (err) {
            console.error('Error parsing SSE bookings_bulk_updated:', err);
          }
        });

        eventSource.addEventListener('booking_deleted', (e: MessageEvent) => {
          try {
            const { id, financials: updatedFinancials } = JSON.parse(e.data);
            setBookings((prev) => prev.filter((b) => b.id !== id));
            if (updatedFinancials) setFinancials(updatedFinancials);
          } catch (err) {
            console.error('Error parsing SSE booking_deleted:', err);
          }
        });

        eventSource.addEventListener('new_review', (e: MessageEvent) => {
          try {
            const newRev: ClientReview = JSON.parse(e.data);
            setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
          } catch (err) {
            console.error('Error parsing SSE new_review:', err);
          }
        });

        eventSource.addEventListener('review_updated', (e: MessageEvent) => {
          try {
            const updatedRev: ClientReview = JSON.parse(e.data);
            setReviews((prev) => prev.map((r) => (r.id === updatedRev.id ? updatedRev : r)));
          } catch (err) {
            console.error('Error parsing SSE review_updated:', err);
          }
        });

        eventSource.addEventListener('review_deleted', (e: MessageEvent) => {
          try {
            const { id } = JSON.parse(e.data);
            setReviews((prev) => prev.filter((r) => r.id !== id));
          } catch (err) {
            console.error('Error parsing SSE review_deleted:', err);
          }
        });

        eventSource.addEventListener('state_reset', () => {
          loadState();
        });
      }
    } catch (sseErr) {
      console.warn('SSE connection unavailable:', sseErr);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Action Handlers
  const handleRequestBooking = async (bookingData: any) => {
    const total = Number(bookingData.totalAmount) || 300;
    const isSignal = bookingData.paymentPlan === 'sinal_50';
    const pixAmount = isSignal ? Math.round((total / 2) * 100) / 100 : total;
    const cleanPixKey = studioInfo?.pixKey || '36790486534';
    const cleanService = services.find((s) => s.id === bookingData.serviceId) || services[0] || {
      id: 'srv-grava-producao',
      name: 'Gravação & Produção Musical',
      basePrice: 300,
      durationHours: 2,
    };

    const fallbackBooking: BookingRequest = {
      id: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId: bookingData.clientId || activeClient?.id || `client-${Date.now()}`,
      clientName: bookingData.clientName || activeClient?.name || 'Cliente FPStudio',
      clientEmail: bookingData.clientEmail || activeClient?.email || '',
      clientPhone: bookingData.clientPhone || activeClient?.phone || '',
      bandOrArtistName: bookingData.bandOrArtistName || activeClient?.bandOrArtistName || bookingData.clientName || 'Artista',
      serviceId: bookingData.serviceId || cleanService.id,
      serviceName: cleanService.name,
      roomId: bookingData.roomId || 'fpstudio',
      roomName: bookingData.roomName || 'FPStudio Salvador',
      preferredDate: bookingData.preferredDate || new Date().toISOString().slice(0, 10),
      startTime: bookingData.startTime || '14:00',
      durationHours: bookingData.durationHours || cleanService.durationHours || 2,
      notes: bookingData.notes || '',
      status: 'orcamento_enviado',
      totalAmount: total,
      discountAmount: 0,
      finalAmount: total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fallbackQuote: PixQuote = {
      id: `quote-${Date.now()}`,
      bookingId: fallbackBooking.id,
      clientId: fallbackBooking.clientId,
      clientName: fallbackBooking.bandOrArtistName || fallbackBooking.clientName,
      serviceName: fallbackBooking.serviceName,
      totalAmount: total,
      pixKey: cleanPixKey,
      pixKeyType: (studioInfo?.pixKeyType as any) || 'CPF',
      pixPayload: `00020126580014BR.GOV.BCB.PIX0114${cleanPixKey}520400005303986540${pixAmount.toFixed(2)}5802BR5914FERNANDO PADRE6008SALVADOR62070503***6304ABCD`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014BR.GOV.BCB.PIX0114${cleanPixKey}`,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      isSignalPayment: isSignal,
      signalAmount: pixAmount,
      paymentPlan: bookingData.paymentPlan || 'sinal_50',
      notes: isSignal
        ? `Orçamento com opção de Sinal PIX de 50% para garantia da reserva de horário.`
        : `Orçamento oficial com chave PIX FPStudio gerado com sucesso.`,
    };

    // Initial optimistic chat messages for new booking
    const fallbackInitialMsg: ChatMessage = {
      id: `msg-${Date.now()}-init`,
      bookingId: fallbackBooking.id,
      senderId: fallbackBooking.clientId,
      senderRole: 'client',
      senderName: fallbackBooking.clientName,
      message: `Solicitação de agendamento criada para ${fallbackBooking.serviceName} no dia ${fallbackBooking.preferredDate} às ${fallbackBooking.startTime} na ${fallbackBooking.roomName}.${fallbackBooking.notes ? ` Obs: "${fallbackBooking.notes}"` : ''}`,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    const fallbackQuoteMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}-quote`,
      bookingId: fallbackBooking.id,
      senderId: 'studio-admin',
      senderRole: 'studio',
      senderName: studioInfo?.name || 'Fernando Padre (FPStudio)',
      message: `Olá ${fallbackBooking.bandOrArtistName || fallbackBooking.clientName}! Recebemos sua solicitação. O orçamento para ${fallbackBooking.serviceName} é de R$ ${total.toFixed(2)}.${isSignal ? ` Você pode antecipar 50% de sinal (R$ ${pixAmount.toFixed(2)}) via PIX para garantir sua vaga!` : ''}\nChave PIX: ${cleanPixKey} (${studioInfo?.pixKeyType || 'CPF'}).`,
      type: 'quote',
      quotePayload: fallbackQuote,
      timestamp: new Date(Date.now() + 100).toISOString(),
    };

    // Optimistically update frontend state
    setBookings((prev) => [fallbackBooking, ...prev.filter((b) => b.id !== fallbackBooking.id)]);
    setQuotes((prev) => [fallbackQuote, ...prev.filter((q) => q.id !== fallbackQuote.id)]);
    setChatMessages((prev) => [
      ...prev.filter((m) => m.bookingId !== fallbackBooking.id),
      fallbackInitialMsg,
      fallbackQuoteMsg,
    ]);

    try {
      const res = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.booking) {
            setBookings((prev) => [data.booking, ...prev.filter((b) => b.id !== data.booking.id && b.id !== fallbackBooking.id)]);
          }
          if (data.quote) {
            setQuotes((prev) => [data.quote, ...prev.filter((q) => q.id !== data.quote.id && q.id !== fallbackQuote.id)]);
          }
          if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            setChatMessages((prev) => {
              const msgMap = new Map(prev.map((m) => [m.id, m]));
              data.chatMessages.forEach((m: ChatMessage) => {
                if (m && m.id) msgMap.set(m.id, m);
              });
              return Array.from(msgMap.values());
            });
          }
          if (data.client) {
            setClients((prev) => [data.client, ...prev.filter((c) => c.id !== data.client.id)]);
            if (!activeClient?.id) {
              setActiveClient(data.client);
              setIsClientLoggedIn(true);
              try {
                safeStorage.setItem('fpstudio_client_logged_in', 'true');
                safeStorage.setItem('fpstudio_active_client_id', data.client.id);
                safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(data.client));
              } catch (e) {}
            }
          }
          return data;
        } catch (jsonErr) {
          console.warn('[App] Non-JSON response for booking request:', jsonErr);
        }
      }
    } catch (err) {
      console.warn('Error submitting booking request to backend:', err);
    }

    return { success: true, booking: fallbackBooking, quote: fallbackQuote };
  };

  const handleCreateQuote = async (quoteData: any) => {
    try {
      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (data.booking && data.quote) {
        setBookings((prev) => prev.map((b) => (b.id === data.booking.id ? data.booking : b)));
        setQuotes((prev) => [...prev.filter((q) => q.id !== data.quote.id), data.quote]);
      }
    } catch (err) {
      console.error('Error creating quote:', err);
    }
  };

  const handleSendChatMessage = async (msgData: any) => {
    // 1. Optimistically append message immediately to chat
    const tempMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingId: msgData.bookingId,
      senderId: msgData.senderId || (msgData.senderRole === 'studio' ? 'studio-master' : activeClient?.id || 'client'),
      senderRole: msgData.senderRole || 'client',
      senderName: msgData.senderName || (msgData.senderRole === 'studio' ? 'FPStudio' : activeClient?.name || 'Cliente'),
      message: msgData.message || '',
      type: msgData.type || 'text',
      attachment: msgData.attachment,
      quotePayload: msgData.quotePayload,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev.filter((m) => m.id !== tempMsg.id), tempMsg]);

    // If sending a receipt, update booking status optimistically
    if (msgData.type === 'receipt' || msgData.attachment) {
      setBookings((prev) =>
        prev.map((b) => (b.id === msgData.bookingId ? { ...b, status: 'comprovante_enviado', updatedAt: new Date().toISOString() } : b))
      );
    }

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData),
      });
      const data = await res.json();
      if (data.message) {
        setChatMessages((prev) => [
          ...prev.filter((m) => m.id !== data.message.id && m.id !== tempMsg.id),
          data.message,
        ]);
      }
      if (data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === data.booking.id ? data.booking : b)));
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    // 1. Immediate optimistic UI update
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking) {
      const paymentAmount = Number(targetBooking.finalAmount) || Number(targetBooking.totalAmount) || 0;
      const updatedBooking: BookingRequest = {
        ...targetBooking,
        status: 'pago_confirmado',
        updatedAt: new Date().toISOString(),
      };

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        bookingId: targetBooking.id,
        clientId: targetBooking.clientId,
        clientName: targetBooking.bandOrArtistName || targetBooking.clientName,
        serviceName: targetBooking.serviceName,
        amount: paymentAmount,
        paymentMethod: 'PIX',
        confirmedAt: new Date().toISOString(),
        month: new Date().toISOString().slice(0, 7),
        status: 'confirmado',
      };

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)));
      setTransactions((prev) => [newTx, ...prev.filter((t) => t.bookingId !== bookingId)]);

      setFinancials((prev) => {
        const newTotal = (Number(prev.totalRevenue) || 0) + paymentAmount;
        const newCount = (Number(prev.confirmedCount) || 0) + 1;
        const newPendingCount = Math.max(0, (Number(prev.pendingCount) || 1) - 1);
        const newPendingRevenue = Math.max(0, (Number(prev.pendingRevenue) || 0) - paymentAmount);

        return {
          ...prev,
          totalRevenue: newTotal,
          monthlyRevenue: newTotal,
          confirmedCount: newCount,
          pendingCount: newPendingCount,
          pendingRevenue: newPendingRevenue,
          averageTicket: newCount > 0 ? Math.round(newTotal / newCount) : prev.averageTicket,
        };
      });
    }

    // 2. Server persistence
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === data.booking.id ? data.booking : b)));
      }
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev.filter((t) => t.id !== data.transaction.id)]);
      }
      if (data.financials) {
        setFinancials(data.financials);
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setClients((prev) => {
          const next = prev.filter((c) => c.id !== clientId);
          try {
            safeStorage.setItem('fpstudio_clients_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        if (activeClient?.id === clientId) {
          const remaining = clients.filter((c) => c.id !== clientId);
          if (remaining.length > 0) {
            setActiveClient(remaining[0]);
            safeStorage.setItem('fpstudio_active_client_id', remaining[0].id);
            try {
              safeStorage.setItem('fpstudio_active_client_data', JSON.stringify(remaining[0]));
            } catch (e) {}
          } else {
            setActiveClient(null);
            safeStorage.removeItem('fpstudio_active_client_id');
            safeStorage.removeItem('fpstudio_active_client_data');
            safeStorage.removeItem('fpstudio_client_logged_in');
          }
        }
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  const handleClearAllClients = async () => {
    try {
      const res = await fetch('/api/clients/clear-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setClients([]);
        setActiveClient(null);
        safeStorage.removeItem('fpstudio_clients_data');
        safeStorage.removeItem('fpstudio_active_client_id');
        safeStorage.removeItem('fpstudio_active_client_data');
        safeStorage.removeItem('fpstudio_client_logged_in');
      }
    } catch (err) {
      console.error('Error clearing clients:', err);
    }
  };

  const handleCancelTodayBookings = async (
    action: 'cancel' | 'delete' = 'cancel',
    period: 'yesterday' | 'today' | 'recent' | 'all' = 'today',
    targetDate?: string
  ) => {
    try {
      const res = await fetch('/api/bookings/undo-period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, period, targetDate }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.bookings) {
          setBookings(data.bookings);
        } else {
          loadState();
        }
        if (data.financials) {
          setFinancials(data.financials);
        }
      }
      return data;
    } catch (err) {
      console.error('Error cancelling bookings by period:', err);
      loadState();
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        if (data.financials) {
          setFinancials(data.financials);
        }
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  const handleUpdateService = async (serviceData: StudioService) => {
    // 1. Update React state immediately for instant feedback
    setServices((prev) => {
      const next = prev.map((s) => (s.id === serviceData.id ? serviceData : s));
      try {
        safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
      } catch (e) {
        console.warn('[App] LocalStorage quota:', e);
      }
      return next;
    });

    // 2. Persist to backend server API
    try {
      const res = await fetch(`/api/services/${serviceData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      if (res.ok) {
        const data = await res.json();
        const srv = data.service || serviceData;
        setServices((prev) => {
          const next = prev.map((s) => (s.id === srv.id ? srv : s));
          try {
            safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating service on server:', err);
    }
  };

  const handleCreateService = async (newServiceData: Partial<StudioService>) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServiceData),
      });
      const data = await res.json();
      if (data.service) {
        setServices((prev) => {
          const next = [...prev.filter((s) => s.id !== data.service.id), data.service];
          try {
            safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.error('Error creating service:', err);
      if (newServiceData.name) {
        const fallback = newServiceData as StudioService;
        setServices((prev) => {
          const next = [...prev.filter((s) => s.id !== fallback.id), fallback];
          try {
            safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      setServices((prev) => {
        const next = prev.filter((s) => s.id !== serviceId);
        try {
          safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    } catch (err) {
      console.error('Error deleting service:', err);
      setServices((prev) => {
        const next = prev.filter((s) => s.id !== serviceId);
        try {
          safeStorage.setItem('fpstudio_services_data', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const handleMarkNotificationRead = async (id?: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifId: id }),
      });
      if (id) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAllNotifications = async (role?: Role) => {
    try {
      if (role) {
        setNotifications((prev) => prev.filter((n) => n.targetRole !== role && n.targetRole !== 'all'));
      } else {
        setNotifications([]);
      }
      await fetch('/api/notifications/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleTriggerTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: currentRole,
          title: currentRole === 'studio' ? '🔔 Alerta de Teste do Estúdio' : '🔔 Alerta de Teste do Cliente',
          message: 'O sino de avisos do FPStudio está funcionando perfeitamente em tempo real!',
        }),
      });
      const data = await res.json();
      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev.filter((n) => n.id !== data.notification.id)]);
      }
    } catch (err) {
      console.error('Error triggering test notification:', err);
    }
  };

  const handleResetState = async () => {
    try {
      await fetch('/api/reset-state', { method: 'POST' });
      loadState();
    } catch (err) {
      console.error('Error resetting state:', err);
    }
  };

  const handleCreateReview = async (reviewData: Partial<ClientReview>) => {
    const fullReview: ClientReview = {
      id: reviewData.id || `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      clientId: reviewData.clientId || activeClient?.id || `client-${Date.now()}`,
      clientName: reviewData.clientName || activeClient?.name || 'Artista',
      bandOrArtistName: reviewData.bandOrArtistName || activeClient?.bandOrArtistName || reviewData.clientName || 'Artista FPStudio',
      avatarUrl:
        reviewData.avatarUrl ||
        reviewData.photoUrl ||
        activeClient?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      photoUrl: reviewData.photoUrl || reviewData.avatarUrl,
      sessionPhotoUrl: reviewData.sessionPhotoUrl || reviewData.photoUrl || reviewData.avatarUrl,
      serviceId: reviewData.serviceId || 'srv-autoral-com-arranjo',
      serviceName: reviewData.serviceName || 'Produção no FPStudio',
      bookingId: reviewData.bookingId,
      rating: reviewData.rating !== undefined ? reviewData.rating : 5,
      comment: reviewData.comment || '',
      projectTitle: reviewData.projectTitle || 'Gravação / Produção Musical',
      feedbackCategory: reviewData.feedbackCategory || 'produção',
      createdAt: reviewData.createdAt || new Date().toISOString(),
      likesCount: reviewData.likesCount || 0,
      verifiedService: true,
      tags: reviewData.tags && reviewData.tags.length > 0 ? reviewData.tags : ['FPStudio', 'Pro Tools'],
      audioGenre: reviewData.audioGenre || 'Música Brasileira',
    };

    // 1. Optimistically update local state & safeStorage immediately
    setReviews((prev) => {
      const next = [fullReview, ...prev.filter((r) => r.id !== fullReview.id)];
      try {
        safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
      } catch (e) {
        console.warn('[App] SafeStorage error:', e);
      }
      return next;
    });

    // 2. Persist to backend server API
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReview),
      });
      const data = await res.json();
      if (data.review) {
        setReviews((prev) => {
          const next = [data.review, ...prev.filter((r) => r.id !== data.review.id)];
          try {
            safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.error('Error creating review on server:', err);
    }
  };

  const handleReplyReview = async (reviewId: string, replyText: string) => {
    const isRemoving = !replyText || replyText.trim().length === 0;

    // 1. Optimistic update
    setReviews((prev) => {
      const next = prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              studioReply: isRemoving ? undefined : replyText.trim(),
              studioReplyAt: isRemoving ? undefined : new Date().toISOString(),
            }
          : r
      );
      try {
        safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: isRemoving ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isRemoving ? undefined : JSON.stringify({ reply: replyText.trim(), studioReply: replyText.trim() }),
      });
      const data = await res.json();
      if (data.review) {
        setReviews((prev) => {
          const next = prev.map((r) => (r.id === data.review.id ? data.review : r));
          try {
            safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating/deleting reply on server:', err);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    setReviews((prev) => {
      const next = prev.map((r) =>
        r.id === reviewId ? { ...r, likesCount: (r.likesCount || 0) + 1 } : r
      );
      try {
        safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.likesCount !== undefined) {
        setReviews((prev) => {
          const next = prev.map((r) =>
            r.id === reviewId ? { ...r, likesCount: data.likesCount } : r
          );
          try {
            safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== reviewId);
      try {
        safeStorage.setItem('fpstudio_reviews_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleUpdateAdminCredentials = async (
    data: Partial<AdminCredentials> & { currentPassword?: string; currentPin?: string }
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Falha ao atualizar credenciais do administrador' };
      }
      if (json.credentials) {
        setAdminCredentials(json.credentials);
        try {
          safeStorage.setItem('fpstudio_admin_credentials', JSON.stringify(json.credentials));
        } catch (e) {}
      }
      return { success: true, message: json.message || 'Senha e PIN atualizados com sucesso!' };
    } catch (err: any) {
      console.error('Error updating admin credentials:', err);
      // Fallback local update if offline/network error
      setAdminCredentials((prev) => {
        const next: AdminCredentials = {
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          password: data.password || prev.password,
          pin: data.pin || prev.pin,
          backupPins: data.backupPins || prev.backupPins,
        };
        try {
          safeStorage.setItem('fpstudio_admin_credentials', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      return { success: true, message: 'Credenciais atualizadas e salvas com sucesso!' };
    }
  };

  return (
    <div
      className="min-h-screen antialiased selection:text-black pb-12 transition-colors duration-300"
      style={{
        backgroundColor: currentTheme?.bgHex || '#09090b',
        color: '#FFFFFF',
        fontFamily: currentFont?.cssFamily || 'inherit',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeClient={activeClient || ({
          id: '',
          name: language === 'en' ? 'Logged Out Visitor' : 'Visitante Não Logado',
          email: '',
          phone: '',
          role: 'client',
          bandOrArtistName: language === 'en' ? 'Logged Out Visitor' : 'Visitante Não Logado',
        } as UserProfile)}
        activeStaffUser={activeStaffUser}
        clients={clients}
        onSelectClient={setActiveClient}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onTriggerTestNotification={handleTriggerTestNotification}
        isConnected={isConnected}
        onResetState={handleResetState}
        activeTab={currentRole === 'client' ? clientActiveTab : studioActiveTab}
        setActiveTab={currentRole === 'client' ? setClientActiveTab : setStudioActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminSecurityModal={() => setIsAdminSecurityModalOpen(true)}
        isClientLoggedIn={isClientLoggedIn}
        onLogoutClient={handleLogoutClient}
        onLogoutStudio={handleLogoutStudio}
      />

      {/* Main View Area */}
      <main className="pt-6">
        {(currentRole === 'client' && clientActiveTab === 'reviews') ||
        (currentRole === 'studio' && studioActiveTab === 'reviews') ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewsView
              currentRole={currentRole}
              isStudio={currentRole === 'studio'}
              reviews={reviews}
              services={services}
              activeClient={activeClient}
              isClientLoggedIn={isClientLoggedIn}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onCreateReview={handleCreateReview}
              onReplyReview={handleReplyReview}
              onLikeReview={handleLikeReview}
              onDeleteReview={handleDeleteReview}
            />
          </div>
        ) : currentRole === 'client' ? (
          <ClientView
            activeClient={activeClient || ({
              id: '',
              name: language === 'en' ? 'Logged Out Visitor' : 'Visitante Não Logado',
              email: '',
              phone: '',
              role: 'client',
              bandOrArtistName: language === 'en' ? 'Logged Out Visitor' : 'Visitante Não Logado',
            } as UserProfile)}
            isClientLoggedIn={isClientLoggedIn}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogoutClient={handleLogoutClient}
            services={services}
            rooms={rooms}
            bookings={bookings}
            quotes={quotes}
            chatMessages={chatMessages}
            studioInfo={studioInfo}
            activeTab={clientActiveTab}
            setActiveTab={setClientActiveTab}
            onRequestBooking={handleRequestBooking}
            onSendChatMessage={handleSendChatMessage}
            onUpdateClientProfile={handleUpdateClientProfile}
          />
        ) : (
          <StudioView
            activeStaffUser={activeStaffUser}
            onSwitchToClientView={() => handleRoleChange('client')}
            bookings={bookings}
            quotes={quotes}
            chatMessages={chatMessages}
            financials={financials}
            clients={clients}
            transactions={transactions}
            rooms={rooms}
            services={services}
            studioInfo={studioInfo}
            activeTab={studioActiveTab}
            setActiveTab={setStudioActiveTab}
            onCreateQuote={handleCreateQuote}
            onSendChatMessage={handleSendChatMessage}
            onConfirmPayment={handleConfirmPayment}
            onDeleteClient={handleDeleteClient}
            onCreateClient={handleCreateNewClient}
            onUpdateClient={handleUpdateClientProfile}
            onClearAllClients={handleClearAllClients}
            onUpdateService={handleUpdateService}
            onCreateService={handleCreateService}
            onDeleteService={handleDeleteService}
            onCancelTodayBookings={handleCancelTodayBookings}
            onDeleteBooking={handleDeleteBooking}
            adminCredentials={adminCredentials}
            onUpdateAdminCredentials={handleUpdateAdminCredentials}
            onOpenAdminSecurityModal={() => setIsAdminSecurityModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Quick Customizer & Language Bar (Icon Only with Flag) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md p-1.5 rounded-full border border-zinc-800 shadow-2xl">
        <button
          onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
          className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white transition flex items-center justify-center cursor-pointer border border-zinc-700/80 shadow-sm group hover:scale-105"
          title={language === 'pt' ? 'Mudar para Inglês (Switch to English)' : 'Switch to Portuguese (Mudar para Português)'}
        >
          <FlagIcon language={language} size="md" className="rounded-full w-5 h-5 object-cover" />
        </button>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="w-8 h-8 rounded-full text-black transition flex items-center justify-center cursor-pointer shadow-lg group"
          style={{
            backgroundColor: currentAccent?.hex || '#00FF41',
            boxShadow: `0 0 16px ${currentAccent?.hex || '#00FF41'}45`,
          }}
          title={t('custom_title')}
        >
          <Palette className="w-4 h-4 transition group-hover:scale-110" />
        </button>
      </div>

      {/* Footer / Rodapé Oficial */}
      <Footer />

      {/* Customization (Design, Font, Size, Language) Modal */}
      <CustomizationModal />

      {/* Authentication & Profile Switching Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={currentRole}
        activeClient={activeClient}
        clients={clients}
        onSelectRoleAndUser={handleSelectRoleAndUser}
        onCreateNewClient={handleCreateNewClient}
        adminCredentials={adminCredentials}
      />

      {/* Admin Security & Credentials Modal */}
      <AdminSecurityModal
        isOpen={isAdminSecurityModalOpen}
        onClose={() => setIsAdminSecurityModalOpen(false)}
        adminCredentials={adminCredentials}
        onUpdateAdminCredentials={handleUpdateAdminCredentials}
      />

    </div>
  );
}

export default function App() {
  return (
    <CustomizationProvider>
      <AppContent />
    </CustomizationProvider>
  );
}
