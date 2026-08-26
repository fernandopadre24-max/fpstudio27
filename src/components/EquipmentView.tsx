import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ZoomIn,
  Mic2,
  Music2,
  Radio,
  Cpu,
  Layers,
  Phone,
  Calendar,
  Key,
  ShieldCheck,
  Award,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Disc3,
  AudioWaveform,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { StudioEquipmentItem, StudioService, Role } from '../types';
import { INITIAL_EQUIPMENT_ITEMS } from '../data/equipmentData';
import { INITIAL_SERVICES } from '../data/initialData';
import { formatBRL } from '../utils/exportUtils';
import { compressImageFile, uploadImageToServer } from '../utils/imageUtils';
import { safeStorage } from '../utils/safeStorage';

interface EquipmentViewProps {
  currentRole: Role;
  defaultSection?: 'all' | 'services' | 'equipment';
  onNavigateToBooking?: (serviceId?: string) => void;
  services?: StudioService[];
  onUpdateService?: (service: StudioService) => void;
  onCreateService?: (service: Partial<StudioService>) => void;
  onDeleteService?: (serviceId: string) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  currentRole,
  defaultSection = 'all',
  onNavigateToBooking,
  services: propServices,
  onUpdateService,
  onCreateService,
  onDeleteService,
}) => {
  const [viewSection, setViewSection] = useState<'all' | 'services' | 'equipment'>(defaultSection);

  useEffect(() => {
    if (defaultSection) {
      setViewSection(defaultSection);
    }
  }, [defaultSection]);

  // Equipment States
  const [equipmentList, setEquipmentList] = useState<StudioEquipmentItem[]>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_equipment_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged: StudioEquipmentItem[] = parsed.map((p: StudioEquipmentItem) => {
            const init = INITIAL_EQUIPMENT_ITEMS.find((initItem) => initItem.id === p.id);
            return {
              ...init,
              ...p,
              price: p.price !== undefined ? p.price : (init?.price !== undefined ? init.price : 0),
              priceDetails: p.priceDetails || init?.priceDetails || '',
            };
          });
          INITIAL_EQUIPMENT_ITEMS.forEach((initItem) => {
            if (!merged.some((m) => m.id === initItem.id)) {
              merged.unshift(initItem);
            }
          });
          return merged;
        }
      }
    } catch (e) {}
    return INITIAL_EQUIPMENT_ITEMS;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Equipment Modals
  const [selectedItem, setSelectedItem] = useState<StudioEquipmentItem | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<StudioEquipmentItem> | null>(null);

  // Services States
  const [serviceList, setServiceList] = useState<StudioService[]>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_services_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    if (propServices && propServices.length > 0) return propServices;
    return INITIAL_SERVICES;
  });
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('Todos');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  
  // Service Modals
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<StudioService | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Partial<StudioService> | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<StudioService | null>(null);
  const [isCompressingServiceImage, setIsCompressingServiceImage] = useState<boolean>(false);
  const [isCompressingEquipImage, setIsCompressingEquipImage] = useState<boolean>(false);
  const [serviceImageTab, setServiceImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [equipImageTab, setEquipImageTab] = useState<'upload' | 'preset' | 'url'>('upload');

  // Synchronize with propServices when they update from server
  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setServiceList(propServices);
    }
  }, [propServices]);

  // Save to local storage on change
  const saveEquipmentToStorage = (items: StudioEquipmentItem[]) => {
    setEquipmentList(items);
    try {
      safeStorage.setItem('fpstudio_equipment_items', JSON.stringify(items));
    } catch (err) {
      console.warn('[EquipmentView] Erro ao salvar equipamentos no storage:', err);
    }
  };

  const saveServicesToStorage = (servicesData: StudioService[]) => {
    setServiceList(servicesData);
    try {
      safeStorage.setItem('fpstudio_services_data', JSON.stringify(servicesData));
    } catch (err) {
      console.warn('[EquipmentView] Erro ao salvar serviços no storage:', err);
    }
  };

  const categories = [
    'Todos',
    'CORDAS',
    'PERCUSSÃO & BATERIA',
    'INSTRUMENTOS ESPECIAIS',
    'TECLADOS & FX',
    'DAW & SOFTWARE',
    'CAPTAÇÃO & VOZ',
    'MONITORAMENTO',
  ];

  const serviceCategories = [
    'Todos',
    'gravação',
    'produção',
    'mix_master',
    'dublagem',
  ];

  const filteredItems = equipmentList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.categoryTag.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredServices = serviceList.filter((srv) => {
    const matchesCategory =
      serviceCategoryFilter === 'Todos' || srv.category.toLowerCase() === serviceCategoryFilter.toLowerCase();
    const matchesSearch =
      srv.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      srv.defaultRoomName.toLowerCase().includes(serviceSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Upload handler for Equipment with automatic compression & server storage
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingEquipImage(true);
    try {
      const uploadedUrl = await uploadImageToServer(file, 'equipment');
      setEditingItem((prev) => (prev ? { ...prev, imageUrl: uploadedUrl } : null));
    } catch (err) {
      console.error('Erro ao processar imagem de equipamento:', err);
      alert('Não foi possível processar esta imagem. Tente uma imagem diferente.');
    } finally {
      setIsCompressingEquipImage(false);
      e.target.value = '';
    }
  };

  // Upload handler for Service with automatic compression & permanent server upload
  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingServiceImage(true);
    try {
      const uploadedUrl = await uploadImageToServer(file, 'service');
      setEditingService((prev) => (prev ? { ...prev, imageUrl: uploadedUrl } : null));
    } catch (err) {
      console.error('Erro ao processar imagem de serviço:', err);
      alert('Não foi possível processar a imagem do serviço. Tente outra foto.');
    } finally {
      setIsCompressingServiceImage(false);
      e.target.value = '';
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.description) return;

    let finalImageUrl =
      editingItem.imageUrl ||
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80';

    if (finalImageUrl.startsWith('data:')) {
      try {
        finalImageUrl = await uploadImageToServer(finalImageUrl, 'equipment');
      } catch (err) {}
    }

    if (editingItem.id) {
      // Update existing
      const updated = equipmentList.map((item) =>
        item.id === editingItem.id
          ? ({
              ...item,
              ...editingItem,
              imageUrl: finalImageUrl,
              price: editingItem.price !== undefined ? editingItem.price : (item.price || 0),
              priceDetails: editingItem.priceDetails !== undefined ? editingItem.priceDetails : (item.priceDetails || ''),
            } as StudioEquipmentItem)
          : item
      );
      saveEquipmentToStorage(updated);
    } else {
      // Create new
      const newItem: StudioEquipmentItem = {
        id: `eq-${Date.now()}`,
        title: editingItem.title || 'NOVO EQUIPAMENTO',
        categoryTag: editingItem.categoryTag || 'EQUIPAMENTOS',
        modelTag: editingItem.modelTag || 'PRO EQUIPMENT',
        price: editingItem.price !== undefined ? editingItem.price : 0,
        priceDetails: editingItem.priceDetails || '',
        description: editingItem.description || '',
        imageUrl: finalImageUrl,
        fullSpecs: editingItem.fullSpecs || ['Equipamento de alta fidelidade para o FPStudio'],
        recommendedUses: editingItem.recommendedUses || ['Gravação', 'Mixagem'],
        includedInStudio: true,
      };
      saveEquipmentToStorage([newItem, ...equipmentList]);
    }

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item do acervo do estúdio?')) {
      const updated = equipmentList.filter((item) => item.id !== id);
      saveEquipmentToStorage(updated);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  // Save Service handler with persistent server image conversion
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || !editingService?.description) return;

    const basePriceNum = Number(editingService.basePrice) || 0;
    const durationNum = Number(editingService.durationHours) || 2;

    let finalImageUrl =
      editingService.imageUrl ||
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80';

    if (finalImageUrl.startsWith('data:')) {
      try {
        finalImageUrl = await uploadImageToServer(finalImageUrl, 'service');
      } catch (err) {}
    }

    if (editingService.id) {
      // Update existing
      const updatedService: StudioService = {
        id: editingService.id,
        name: editingService.name,
        description: editingService.description,
        category: editingService.category || 'gravação',
        defaultRoomId: editingService.defaultRoomId || 'fpstudio',
        defaultRoomName: editingService.defaultRoomName || 'FPStudio Salvador',
        durationHours: durationNum,
        basePrice: basePriceNum,
        iconName: editingService.iconName || 'Music2',
        imageUrl: finalImageUrl,
      };

      const updatedList = serviceList.map((s) => (s.id === updatedService.id ? updatedService : s));
      saveServicesToStorage(updatedList);

      if (onUpdateService) {
        onUpdateService(updatedService);
      }
      try {
        await fetch(`/api/services/${updatedService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedService),
        });
      } catch (err) {
        console.error('Error saving service to API:', err);
      }
    } else {
      // Create new service
      const newService: StudioService = {
        id: `srv-${Date.now()}`,
        name: editingService.name,
        description: editingService.description,
        category: editingService.category || 'gravação',
        defaultRoomId: editingService.defaultRoomId || 'fpstudio',
        defaultRoomName: editingService.defaultRoomName || 'FPStudio Salvador',
        durationHours: durationNum,
        basePrice: basePriceNum,
        iconName: editingService.iconName || 'Music2',
        imageUrl: finalImageUrl,
      };

      const updatedList = [...serviceList, newService];
      saveServicesToStorage(updatedList);

      if (onCreateService) {
        onCreateService(newService);
      }
      try {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newService),
        });
      } catch (err) {
        console.error('Error creating service in API:', err);
      }
    }

    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteServiceConfirm = async () => {
    if (!serviceToDelete) return;
    const id = serviceToDelete.id;
    const updatedList = serviceList.filter((s) => s.id !== id);
    saveServicesToStorage(updatedList);

    if (onDeleteService) {
      onDeleteService(id);
    }
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting service from API:', err);
    }

    setServiceToDelete(null);
    if (selectedServiceDetail?.id === id) setSelectedServiceDetail(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 text-white">
      
      {/* SECTION SWITCHER PILLS */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-xl overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setViewSection('services')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              viewSection === 'services'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Music2 className="w-4 h-4" />
            <span>SERVIÇOS & VALORES</span>
          </button>

          <button
            onClick={() => setViewSection('equipment')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              viewSection === 'equipment'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>MATERIAL & INSTRUMENTOS</span>
          </button>

          <button
            onClick={() => setViewSection('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 shrink-0 ${
              viewSection === 'all'
                ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>VER TUDO</span>
          </button>
        </div>

        {viewSection === 'services' && currentRole === 'studio' && (
          <button
            onClick={() => {
              setEditingService({
                name: '',
                description: '',
                category: 'gravação',
                defaultRoomId: 'room-a',
                defaultRoomName: 'Sala A - Gravação Principal & Produção',
                durationHours: 2,
                basePrice: 300,
                iconName: 'Music2',
                imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
              });
              setIsServiceModalOpen(true);
            }}
            className="px-4 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> NOVO SERVIÇO
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SEÇÃO DE MATERIAL & INSTRUMENTOS DO ESTÚDIO                            */}
      {/* ========================================================================= */}
      {(viewSection === 'all' || viewSection === 'equipment') && (
        <section id="material-section" className="space-y-6">
        
        {/* HEADER HERO SECTION */}
        <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF41]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 text-xs font-black uppercase tracking-wider">
              <Key className="w-4 h-4 text-[#00FF41]" />
              ACERVO E INSTRUMENTOS DO ESTÚDIO
            </div>

            {/* Right Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-xs font-black uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#00FF41]" />
              TABELA DE GRAVAÇÃO & EDIÇÃO
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none">
              MATERIAL & INSTRUMENTOS PARA GRAVAÇÃO
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Fotos reais, valores de uso na gravação com edição inclusa e acervo de instrumentos de alta fidelidade operados por Fernando Padre no <strong className="text-white">FPStudio</strong>.
            </p>
          </div>

          {/* Categories & Search Bar */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-zinc-800/80">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory.toUpperCase() === cat.toUpperCase()
                      ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box & Admin Add Action */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar item no acervo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF41] transition"
                />
              </div>

              {currentRole === 'studio' && (
                <button
                  onClick={() => {
                    setEditingItem({
                      title: '',
                      categoryTag: 'CORDAS',
                      modelTag: 'EQUIPAMENTO PRO',
                      price: 80,
                      priceDetails: 'Gravação + Edição e Alinhamento inclusos',
                      description: '',
                      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
                      fullSpecs: ['Equipamento de alta definição para gravação no FPStudio'],
                      recommendedUses: ['Gravação', 'Mixagem'],
                      includedInStudio: true,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Adicionar Item
                </button>
              )}
            </div>

          </div>

        </div>

        {/* EQUIPMENT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl flex flex-col hover:border-[#00FF41]/60 transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Image Box with Overlay Tags */}
              <div className="relative h-56 overflow-hidden bg-zinc-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                {/* Overlay Tags */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                  <span className="bg-[#00FF41]/20 backdrop-blur-md border border-[#00FF41]/40 text-[#00FF41] text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md shadow-lg max-w-[65%] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                    {item.modelTag}
                  </span>

                  <span className="bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-lg">
                    {item.categoryTag}
                  </span>
                </div>

                {/* Floating Price Tag on Bottom Right of Photo (like in Services) */}
                <div className="absolute bottom-3 right-3 z-10">
                  <div className="px-3.5 py-1.5 rounded-xl bg-black/90 border border-[#00FF41]/60 backdrop-blur-md shadow-xl flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-zinc-400">VALOR:</span>
                    <span className="text-xs sm:text-sm font-black text-[#00FF41] tracking-tight">
                      {item.price !== undefined && item.price > 0 ? formatBRL(item.price) : 'INCLUSO'}
                    </span>
                  </div>
                </div>

                {/* Admin Actions Bar on Hover */}
                {currentRole === 'studio' && (
                  <div className="absolute top-10 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 bg-zinc-900/90 hover:bg-[#00FF41] text-zinc-200 hover:text-black rounded-lg border border-zinc-700 transition cursor-pointer shadow-lg"
                      title="Editar Item e Valores"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 bg-rose-950/90 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-800 transition cursor-pointer shadow-lg"
                      title="Excluir Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-black text-white text-sm sm:text-base leading-tight tracking-tight uppercase group-hover:text-[#00FF41] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Pricing & Edition detail line */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                    <span className="text-[11px] text-zinc-300 font-medium truncate">
                      {item.priceDetails || (item.price && item.price > 0 ? 'Gravação + Edição inclusas' : 'Incluso na sessão')}
                    </span>
                  </div>
                </div>

                {/* CTA Action Button */}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-[#00FF41] hover:text-black text-zinc-200 font-extrabold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md group/btn border border-zinc-700/60 hover:border-[#00FF41] uppercase tracking-wide"
                >
                  <Search className="w-4 h-4 text-[#00FF41] group-hover/btn:text-black transition-colors" />
                  DETALHES & FOTO DO ITEM
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State for Equipment */}
        {filteredItems.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum equipamento encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Não encontramos itens correspondentes à pesquisa "{searchQuery}". Tente filtrar por outra categoria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. SEÇÃO DE SERVIÇOS OFERECIDOS & VALORES                                */}
      {/* ========================================================================= */}
      {(viewSection === 'all' || viewSection === 'services') && (
        <section id="servicos-section" className={`space-y-6 ${viewSection === 'all' ? 'pt-6 border-t border-zinc-800/80' : ''}`}>
        
        {/* SERVICES HEADER SECTION */}
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 text-xs font-black uppercase tracking-wider">
              <Music2 className="w-4 h-4 text-[#00FF41]" />
              TABELA OFICIAL DE SERVIÇOS FPSTUDIO
            </div>

            {currentRole === 'studio' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black uppercase tracking-wider">
                <Edit2 className="w-4 h-4 text-indigo-300" />
                MODO DE EDIÇÃO DE PREÇOS E FOTOS ATIVO
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none">
                SERVIÇOS OFERECIDOS & VALORES
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                Lista de produções, gravações autorais, edições de áudio e vinhetas com valores, fotos e especificações completas. 
                {currentRole === 'studio' && (
                  <span className="text-[#00FF41] font-bold block mt-1">
                    Como Administrador, você pode alterar os valores em R$ e imagens de cada serviço a qualquer momento.
                  </span>
                )}
              </p>
            </div>

            {currentRole === 'studio' && (
              <button
                onClick={() => {
                  setEditingService({
                    name: '',
                    description: '',
                    category: 'gravação',
                    defaultRoomId: 'room-a',
                    defaultRoomName: 'Sala A - Gravação Principal & Produção',
                    durationHours: 2,
                    basePrice: 300,
                    iconName: 'Music2',
                    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
                  });
                  setIsServiceModalOpen(true);
                }}
                className="px-5 py-3 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> NOVO SERVIÇO / PACOTE
              </button>
            )}
          </div>

          {/* Filters & Search for Services */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-zinc-800/80">
            
            {/* Service Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setServiceCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 capitalize ${
                    serviceCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {cat === 'mix_master' ? 'Mix & Master' : cat}
                </button>
              ))}
            </div>

            {/* Service Search Bar */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar serviço ou pacote..."
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF41] transition"
              />
            </div>

          </div>

        </div>

        {/* SERVICES CARDS GRID (3 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl flex flex-col hover:border-[#00FF41]/70 transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Service Cover Image */}
              <div className="relative h-52 overflow-hidden bg-zinc-950">
                <img
                  src={
                    service.imageUrl ||
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={service.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Badges on Top of Image */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                  <span className="bg-[#00FF41]/20 backdrop-blur-md border border-[#00FF41]/40 text-[#00FF41] text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.durationHours}h de estúdio
                  </span>

                  <span className="bg-zinc-950/85 backdrop-blur-md border border-zinc-700 text-zinc-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg capitalize">
                    {service.category === 'mix_master' ? 'Mix & Master' : service.category}
                  </span>
                </div>

                {/* Floating Price Tag on Bottom Right of Photo */}
                <div className="absolute bottom-3 right-3 z-10">
                  <div className="px-3.5 py-1.5 rounded-xl bg-black/90 border border-[#00FF41]/60 backdrop-blur-md shadow-xl flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-zinc-400">VALOR:</span>
                    <span className="text-sm font-black text-[#00FF41] tracking-tight">
                      {formatBRL(service.basePrice)}
                    </span>
                  </div>
                </div>

                {/* Admin Quick Edit Button on Image */}
                {currentRole === 'studio' && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingService(service);
                        setIsServiceModalOpen(true);
                      }}
                      className="p-2 bg-zinc-950/90 hover:bg-[#00FF41] text-zinc-200 hover:text-black rounded-xl border border-zinc-700 transition cursor-pointer shadow-lg"
                      title="Editar Valores e Foto do Serviço"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setServiceToDelete(service);
                      }}
                      className="p-2 bg-rose-950/90 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl border border-rose-800 transition cursor-pointer shadow-lg"
                      title="Excluir Serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Service Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-white text-base leading-tight tracking-tight uppercase group-hover:text-[#00FF41] transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" /> FPStudio Salvador
                    </span>
                    <span className="text-[#00FF41] font-mono font-bold text-[11px]">
                      {service.durationHours}h de sessão
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  {currentRole === 'studio' ? (
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setIsServiceModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-[#00FF41] hover:text-black text-zinc-200 font-black text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md border border-zinc-700/60 hover:border-[#00FF41] uppercase tracking-wide"
                    >
                      <Edit2 className="w-4 h-4 text-[#00FF41] group-hover:text-black" />
                      ALTERAR VALOR & IMAGEM
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedServiceDetail(service)}
                        className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                      >
                        <Info className="w-3.5 h-3.5 text-zinc-400" /> Detalhes
                      </button>

                      {onNavigateToBooking && (
                        <button
                          onClick={() => onNavigateToBooking(service.id)}
                          className="flex-1 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] transition flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Agendar
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Empty State for Services */}
        {filteredServices.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <Music2 className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum serviço encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Não encontramos serviços para "{serviceSearchQuery}". Tente outra categoria ou adicione um novo pacote.
            </p>
            <button
              onClick={() => {
                setServiceCategoryFilter('Todos');
                setServiceSearchQuery('');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Limpar Filtros de Serviços
            </button>
          </div>
        )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAIS & VISUALIZADORES                                                */}
      {/* ========================================================================= */}

      {/* DETALHES E FOTO DO ITEM DE EQUIPAMENTO MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-mono font-bold uppercase">
                    {selectedItem.modelTag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-bold uppercase">
                    {selectedItem.categoryTag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-bold uppercase flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-[#00FF41]" />
                    {selectedItem.price !== undefined && selectedItem.price > 0 ? `VALOR: ${formatBRL(selectedItem.price)}` : 'INCLUSO NA SESSÃO'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white uppercase mt-1">
                  {selectedItem.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(null);
                  setIsPhotoZoomed(false);
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Section with Zoom */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className={`w-full object-cover transition-all duration-300 ${
                  isPhotoZoomed ? 'h-[500px] object-contain bg-black' : 'h-72 sm:h-96'
                }`}
              />
              
              <button
                onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
              >
                <ZoomIn className="w-4 h-4 text-[#00FF41]" />
                {isPhotoZoomed ? 'Reduzir Foto' : 'Ampliar Imagem'}
              </button>
            </div>

            {/* Value & Edition Info Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00FF41]" />
                  <h4 className="text-xs font-black text-white uppercase">Uso na Gravação & Edição</h4>
                </div>
                <p className="text-[11px] text-zinc-300">
                  {selectedItem.priceDetails || (selectedItem.price && selectedItem.price > 0 ? 'Gravação multicanal com edição cirúrgica e alinhamento no Pro-Tools inclusos.' : 'Equipamento padrão do estúdio incluso em todas as sessões.')}
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-black/90 border border-[#00FF41]/60 text-right shrink-0">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">VALOR:</span>
                <span className="text-base font-black text-[#00FF41]">
                  {selectedItem.price !== undefined && selectedItem.price > 0 ? formatBRL(selectedItem.price) : 'INCLUSO'}
                </span>
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-black text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#00FF41]" /> Descrição & Aplicação no FPStudio
                </h4>
                <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                  {selectedItem.description}
                </p>
              </div>

              {selectedItem.fullSpecs && selectedItem.fullSpecs.length > 0 && (
                <div>
                  <h4 className="font-black text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#00FF41]" /> Especificações Técnicas & Recursos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.fullSpecs.map((spec, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2 text-zinc-300"
                      >
                        <Check className="w-3.5 h-3.5 text-[#00FF41] shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Acervo e Instrumentos • FPStudio Salvador
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT / ADD EQUIPMENT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 my-8 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-lg text-white">
                {editingItem.id ? 'Editar Item do Acervo & Valores' : 'Adicionar Novo Item ao Acervo'}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Título do Instrumento / Equipamento</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Ex: GUITARRAS ELÉTRICAS (IBANEZ STEVE VAI)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Tag Categoria</label>
                  <input
                    type="text"
                    required
                    value={editingItem.categoryTag || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryTag: e.target.value })}
                    placeholder="Ex: CORDAS"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Tag Modelo/Verd</label>
                  <input
                    type="text"
                    required
                    value={editingItem.modelTag || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, modelTag: e.target.value })}
                    placeholder="Ex: IBANEZ STEVE VAI"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              {/* Pricing & Edition fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Valor para Gravação (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={editingItem.price !== undefined ? editingItem.price : 0}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0 para Incluso"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">0 = Incluso na sessão</span>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Detalhes de Edição & Gravação</label>
                  <input
                    type="text"
                    value={editingItem.priceDetails || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, priceDetails: e.target.value })}
                    placeholder="Ex: Gravação + Edição e Alinhamento"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              {/* Foto do Equipamento com Abas Separadas */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold text-xs">
                    Foto do Equipamento / Instrumento:
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEquipImageTab('upload')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        equipImageTab === 'upload'
                          ? 'bg-[#00FF41] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      💻 Do seu PC / Celular
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipImageTab('url')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        equipImageTab === 'url'
                          ? 'bg-[#00FF41] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🌐 Link Web (Opcional)
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                {editingItem.imageUrl ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                    <img
                      src={editingItem.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-[#00FF41] bg-black/70 px-2.5 py-1 rounded-lg border border-[#00FF41]/40 backdrop-blur-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Foto Carregada
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                        className="text-[10px] bg-red-600/90 hover:bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg transition shadow cursor-pointer"
                      >
                        Remover Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs">
                    <ImageIcon className="w-7 h-7 mb-1 opacity-40" />
                    <span>Nenhuma imagem selecionada</span>
                  </div>
                )}

                {/* Tab: Upload do PC / Celular */}
                {equipImageTab === 'upload' && (
                  <div>
                    <label className="w-full px-4 py-3 bg-zinc-900 hover:bg-zinc-850 border-2 border-dashed border-[#00FF41]/60 hover:border-[#00FF41] rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm">
                      <Upload className={`w-5 h-5 text-[#00FF41] ${isCompressingEquipImage ? 'animate-bounce' : ''}`} />
                      <span>
                        {isCompressingEquipImage
                          ? 'OTIMIZANDO E ENVIANDO FOTO AO SERVIDOR...'
                          : editingItem.imageUrl
                          ? 'SUBSTITUIR POR OUTRA FOTO DO PC / CELULAR'
                          : 'ESCOLHER FOTO DO SEU COMPUTADOR OU CELULAR'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isCompressingEquipImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-zinc-400 mt-1 text-center">
                      ✓ A foto é salva diretamente no servidor, sem precisar de nenhum link externo.
                    </p>
                  </div>
                )}

                {/* Tab: Link Web (Opcional) */}
                {equipImageTab === 'url' && (
                  <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-300 font-bold block">
                      Cole a URL da Imagem na Internet (Opcional):
                    </span>
                    <input
                      type="url"
                      value={editingItem.imageUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41] text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Descrição do equipamento..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black font-black rounded-xl shadow-lg transition cursor-pointer"
                >
                  Salvar Item no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / ADD SERVICE MODAL (EDIÇÃO DE VALORES E IMAGENS)                   */}
      {/* ========================================================================= */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5 my-8 text-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00FF41] font-bold block">
                  FPStudio Gestão de Serviços
                </span>
                <h3 className="font-black text-lg text-white">
                  {editingService.id ? 'Editar Serviço, Valores e Imagem' : 'Cadastrar Novo Serviço'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setEditingService(null);
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              
              {/* Nome do Serviço */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Nome do Serviço / Pacote:
                </label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  placeholder="Ex: Música Autoral (Com Arranjo) ou Produção Musical Completa"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#00FF41] font-bold"
                />
              </div>

              {/* Valor (R$) e Duração (Horas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-900/60 space-y-1">
                  <label className="block text-emerald-400 font-black mb-1 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Valor do Serviço (R$):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={editingService.basePrice ?? 300}
                    onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-emerald-800 rounded-xl p-2.5 text-white font-black text-base focus:outline-none focus:border-[#00FF41]"
                  />
                  <span className="text-[10px] text-emerald-400/80">
                    Visualização: {formatBRL(editingService.basePrice || 0)}
                  </span>
                </div>

                <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 space-y-1">
                  <label className="block text-zinc-300 font-bold mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#00FF41]" /> Duração em Estúdio (Horas):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    required
                    value={editingService.durationHours ?? 2}
                    onChange={(e) => setEditingService({ ...editingService, durationHours: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#00FF41]"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Tempo estimado de gravação / edição
                  </span>
                </div>
              </div>

              {/* Categoria e Sala Padrão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Categoria:</label>
                  <select
                    value={editingService.category || 'gravação'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="gravação">Gravação</option>
                    <option value="produção">Produção Autoral</option>
                    <option value="mix_master">Mix & Master</option>
                    <option value="dublagem">Dublagem / Vinheta</option>
                  </select>
                </div>
              </div>

              {/* Foto / Imagem do Serviço */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-200 font-bold text-xs">
                    Foto de Capa do Serviço:
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setServiceImageTab('upload')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        serviceImageTab === 'upload'
                          ? 'bg-[#00FF41] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      💻 Do seu PC / Celular
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceImageTab('preset')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        serviceImageTab === 'preset'
                          ? 'bg-[#00FF41] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ⚡ Fotos Prontas
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceImageTab('url')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        serviceImageTab === 'url'
                          ? 'bg-[#00FF41] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🌐 Link Web (Opcional)
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                {editingService.imageUrl ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 group">
                    <img
                      src={editingService.imageUrl}
                      alt="Preview do Serviço"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-[#00FF41] bg-black/70 px-2.5 py-1 rounded-lg border border-[#00FF41]/40 backdrop-blur-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Foto Carregada
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingService({ ...editingService, imageUrl: '' })}
                        className="text-[10px] bg-red-600/90 hover:bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg transition shadow cursor-pointer"
                      >
                        Remover Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span>Nenhuma imagem selecionada</span>
                  </div>
                )}

                {/* TAB 1: Upload do PC / Celular */}
                {serviceImageTab === 'upload' && (
                  <div className="space-y-1.5">
                    <label className="w-full px-4 py-3.5 bg-zinc-900 hover:bg-zinc-850 border-2 border-dashed border-[#00FF41]/60 hover:border-[#00FF41] rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md">
                      <Upload className={`w-5 h-5 text-[#00FF41] ${isCompressingServiceImage ? 'animate-bounce' : ''}`} />
                      <span>
                        {isCompressingServiceImage
                          ? 'OTIMIZANDO E ENVIANDO FOTO AO SERVIDOR...'
                          : editingService.imageUrl
                          ? 'SUBSTITUIR POR OUTRA FOTO DO SEU PC'
                          : 'ESCOLHER FOTO DO SEU COMPUTADOR OU CELULAR'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isCompressingServiceImage}
                        onChange={handleServiceImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-zinc-400 text-center">
                      ✓ A foto é salva diretamente no servidor para este serviço, sem precisar de link externo.
                    </p>
                  </div>
                )}

                {/* TAB 2: Fotos Prontas do Estúdio */}
                {serviceImageTab === 'preset' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">
                      Clique em um tema para usar a foto correspondente:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Vocal / Mic', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80' },
                        { label: 'Mesa / Mix', url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&auto=format&fit=crop&q=80' },
                        { label: 'Instrumentos', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80' },
                        { label: 'Live Session', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingService({ ...editingService, imageUrl: preset.url })}
                          className={`text-[10px] p-2 rounded-xl border font-bold text-center truncate transition cursor-pointer ${
                            editingService.imageUrl === preset.url
                              ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Link Web (Opcional) */}
                {serviceImageTab === 'url' && (
                  <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-300 font-bold block">
                      Cole o link direto da imagem na internet (Opcional):
                    </span>
                    <input
                      type="url"
                      value={editingService.imageUrl || ''}
                      onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... ou link direto"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF41] text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Descrição Detalhada */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Descrição Completa do Serviço:
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Explique o que está incluso no pacote (captação, Pro-Tools, arranjos, etc.)..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Botões de Ação do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsServiceModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> SALVAR ALTERAÇÕES
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DO SERVIÇO (PARA CLIENTE) */}
      {selectedServiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 text-white animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-mono font-bold uppercase">
                    {selectedServiceDetail.durationHours}H DE ESTÚDIO
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-bold uppercase capitalize">
                    {selectedServiceDetail.category}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white uppercase mt-1">
                  {selectedServiceDetail.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem do Serviço */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 h-64">
              <img
                src={
                  selectedServiceDetail.imageUrl ||
                  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
                }
                alt={selectedServiceDetail.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent flex items-end p-4">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[#00FF41]/40">
                  <span className="text-xs text-zinc-400 font-bold block">VALOR OFICIAL:</span>
                  <span className="text-xl font-black text-[#00FF41]">
                    {formatBRL(selectedServiceDetail.basePrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-black text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#00FF41]" /> O que está incluso no pacote
                </h4>
                <p className="text-zinc-300 leading-relaxed bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800">
                  {selectedServiceDetail.description}
                </p>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Local:</span>
                  <span className="text-white font-bold text-sm">FPStudio Salvador</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Duração Estimada:</span>
                  <span className="text-[#00FF41] font-black text-sm">{selectedServiceDetail.durationHours} horas</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>

              {onNavigateToBooking && (
                <button
                  onClick={() => {
                    const id = selectedServiceDetail.id;
                    setSelectedServiceDetail(null);
                    onNavigateToBooking(id);
                  }}
                  className="px-6 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center gap-1.5 cursor-pointer uppercase"
                >
                  <Calendar className="w-4 h-4" /> Solicitar Agendamento
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE SERVIÇO */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-rose-900/60 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 text-white">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Excluir Serviço?</h3>
                <p className="text-xs text-zinc-400">Esta ação removerá o serviço da tabela pública.</p>
              </div>
            </div>

            <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-xs">
              <span className="font-bold text-white block">{serviceToDelete.name}</span>
              <span className="text-[#00FF41] font-mono">{formatBRL(serviceToDelete.basePrice)}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteServiceConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
