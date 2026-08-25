import React, { useState, useMemo, useRef } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  CheckCircle2,
  Music,
  Sliders,
  Mic2,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Tag,
  CornerDownRight,
  Send,
  Trash2,
  Radio,
  Share2,
  Heart,
  ZoomIn,
  Maximize2,
  Eye,
  X,
  Camera,
  Image as ImageIcon,
  Upload,
  UploadCloud,
  FileImage,
  Laptop,
  Check,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  FolderUp,
  Edit3,
  Clock,
  ShieldCheck,
  MessageCircle,
  Mic,
  Smile,
  Type,
  Wand2,
} from 'lucide-react';
import { ClientReview, StudioService, UserProfile, Role } from '../types';
import { safeStorage } from '../utils/safeStorage';

interface ReviewsViewProps {
  currentRole?: Role;
  isStudio?: boolean;
  reviews: ClientReview[];
  services: StudioService[];
  activeClient: UserProfile | null;
  isClientLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  onCreateReview: (reviewData: Partial<ClientReview>) => Promise<void>;
  onReplyReview?: (reviewId: string, replyText: string) => Promise<void>;
  onLikeReview?: (reviewId: string) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onNavigateToBooking?: (serviceId?: string) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  currentRole,
  isStudio = false,
  reviews = [],
  services = [],
  activeClient,
  isClientLoggedIn,
  onOpenAuthModal,
  onCreateReview,
  onReplyReview,
  onLikeReview,
  onDeleteReview,
  onNavigateToBooking,
}) => {
  // Mode detection: either through currentRole or isStudio or quick producer switch
  const isStudioUser = currentRole === 'studio' || isStudio;
  const [producerModeActive, setProducerModeActive] = useState<boolean>(isStudioUser);

  // Sync if prop changes
  React.useEffect(() => {
    if (isStudioUser) {
      setProducerModeActive(true);
    }
  }, [isStudioUser]);

  // Filters and Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [replyFilter, setReplyFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'rating'>('recent');

  // Modal States & Inline Reply
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [replyingReview, setReplyingReview] = useState<ClientReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [inlineReplyId, setInlineReplyId] = useState<string | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [replyComposerMode, setReplyComposerMode] = useState<'custom' | 'templates' | 'voice'>('custom');
  const [selectedSignature, setSelectedSignature] = useState<string>('Fernando Padre (Produtor Oficial)');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    genre?: string;
    rating?: number;
    comment?: string;
  } | null>(null);

  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>(() => {
    try {
      const saved = safeStorage.getItem('fpstudio_liked_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // New Review Form State
  const [newClientName, setNewClientName] = useState(
    activeClient?.name || ''
  );
  const [newBandName, setNewBandName] = useState(
    activeClient?.bandOrArtistName || ''
  );
  const [newServiceId, setNewServiceId] = useState(
    services[0]?.id || 'srv-autoral-com-arranjo'
  );
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newAudioGenre, setNewAudioGenre] = useState('Música Brasileira / Pop');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoSourceTab, setPhotoSourceTab] = useState<'computer' | 'url' | 'presets'>('computer');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState<ClientReview['feedbackCategory']>('produção');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Pro Tools',
    'Excelente Acústica',
    'Fernando Padre Nota 10',
  ]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Function to process photo uploaded from computer
  const processImageFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp|heic|svg)$/i)) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP, GIF).');
      return;
    }

    setUploadError(null);
    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    const sizeInMb = file.size / (1024 * 1024);
    setUploadedFileSize(sizeInMb >= 1 ? `${sizeInMb.toFixed(2)} MB` : `${Math.round(file.size / 1024)} KB`);

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Falha ao ler o arquivo selecionado.');
      setIsProcessingFile(false);
    };

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        setIsProcessingFile(false);
        return;
      }

      // Optimize and compress large images using canvas
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxHeight(height, maxDim);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            setNewPhotoUrl(optimized);
          } else {
            setNewPhotoUrl(rawDataUrl);
          }
        } catch (err) {
          setNewPhotoUrl(rawDataUrl);
        } finally {
          setIsProcessingFile(false);
        }
      };
      img.onerror = () => {
        setNewPhotoUrl(rawDataUrl);
        setIsProcessingFile(false);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const maxHeight = (curr: number, max: number) => {
    return curr > max ? max : curr;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setNewPhotoUrl('');
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Available tag suggestions for new review
  const availableTagSuggestions = [
    'Pro Tools',
    'Arranjo Exclusivo',
    'Melodyne / Afinação',
    'Kadosh 412',
    'Placa M-Audio',
    'Caixas TOMATO',
    'Edição de Bateria',
    'Guitarras Ibanez',
    'Baixo 6 Cordas',
    'Violão Aço/Nylon',
    'Sanfona',
    'Vinheta Comercial',
    'Pontualidade & Café',
  ];

  // Sync active client info if modal opens
  const handleOpenNewReviewModal = () => {
    if (activeClient) {
      setNewClientName(activeClient.name || '');
      setNewBandName(activeClient.bandOrArtistName || activeClient.name || '');
    }
    setIsNewReviewModalOpen(true);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLike = async (reviewId: string) => {
    if (likedReviews[reviewId]) return;
    const nextLikes = { ...likedReviews, [reviewId]: true };
    setLikedReviews(nextLikes);
    try {
      safeStorage.setItem('fpstudio_liked_reviews', JSON.stringify(nextLikes));
    } catch (e) {}
    if (onLikeReview) {
      await onLikeReview(reviewId);
    }
  };

  const handleCopyReview = (review: ClientReview) => {
    const textToCopy = `"${review.comment}" — ${review.bandOrArtistName || review.clientName} sobre o FPStudio Salvador ⭐ ${review.rating}/5.0`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(review.id);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  const handleSubmitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const selectedSrv = services.find((s) => s.id === newServiceId);

    const chosenPhoto =
      newPhotoUrl.trim() ||
      activeClient?.avatarUrl ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80';

    const reviewPayload: Partial<ClientReview> = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      clientId: activeClient?.id || `client-${Date.now()}`,
      clientName: newClientName.trim() || 'Artista Convidado',
      bandOrArtistName: newBandName.trim() || newClientName.trim() || 'Artista Convidado',
      avatarUrl: chosenPhoto,
      photoUrl: chosenPhoto,
      sessionPhotoUrl: chosenPhoto,
      serviceId: newServiceId,
      serviceName: selectedSrv?.name || 'Produção Musical no FPStudio',
      rating: newRating,
      comment: newComment.trim(),
      projectTitle: newProjectTitle.trim() || 'Gravação & Produção no FPStudio',
      feedbackCategory: newCategory,
      audioGenre: newAudioGenre.trim() || 'Música Brasileira',
      tags: selectedTags.length > 0 ? selectedTags : ['FPStudio', 'Pro Tools', 'Salvador'],
      verifiedService: true,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    try {
      await onCreateReview(reviewPayload);
      setIsNewReviewModalOpen(false);
      showToast(`⭐ Depoimento de ${reviewPayload.bandOrArtistName || reviewPayload.clientName} armazenado e publicado com sucesso!`);
      setNewComment('');
      setNewProjectTitle('');
      setNewPhotoUrl('');
      setUploadedFileName(null);
      setUploadedFileSize(null);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      showToast('❌ Erro ao salvar depoimento no servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Preset Reply Templates for Studio/Fernando Padre
  const replyTemplates = [
    {
      label: '🔥 Agradecimento Geral',
      text: 'Valeu demais, irmão! É sempre uma honra gravar e produzir essa sonzera aqui no FPStudio Salvador. O som ficou de primeira qualidade e com peso!',
    },
    {
      label: '🎙️ Elogio Vocal & Arranjo',
      text: 'Interpretação e afinação de altíssimo nível! O arranjo vocal casou perfeitamente com a harmonia e o timbre da voz.',
    },
    {
      label: '🎸 Produção & Instrumentos',
      text: 'Guitarras e baixos com pegada de verdade e captação cristalina no Pro Tools com nossos pré-amplificadores. Até a próxima sessão!',
    },
    {
      label: '🥁 Bateria & Pressão',
      text: 'Bateria com dinâmica incrível, bumbo encorpado e mixagem com muito punch nos nossos monitores. Que energia na sessão!',
    },
    {
      label: '🏆 Arranjo Exclusivo & Mix',
      text: 'Arranjo exclusivo e muito bom gosto! O projeto está 100% finalizado e pronto para estourar nas rádios e plataformas digitais.',
    },
  ];

  // Studio Emojis for 1-click insertion
  const studioEmojis = ['🎙️', '🎸', '🎹', '🥁', '🎧', '🎛️', '🔊', '🔥', '🏆', '⚡', '🤘', '🎶', '👏', '👊', '🚀', '🇧🇷', '✨', '🙏'];

  // Quick phrase snippets from Fernando Padre
  const studioSnippets = [
    { label: '👊 Tmj irmão!', text: 'Tmj demais, irmão! 👊' },
    { label: '🔥 Pressão em Salvador!', text: 'FPStudio Salvador sempre na pressão total! 🔥' },
    { label: '🎙️ Voz e arranjo nota 10!', text: 'Voz afinadíssima e arranjo de alto nível! 🎙️' },
    { label: '🥁 Bateria com punch!', text: 'Bateria com dinâmica e muito peso na mix! 🥁' },
    { label: '🎛️ Pro Tools & Pré-amps!', text: 'Captação cristalina nos nossos pré-amplificadores e Pro Tools! 🎛️' },
    { label: '🚀 Pronto pras plataformas!', text: 'Projeto pronto para estourar nas rádios e plataformas digitais! 🚀' },
    { label: '🎧 Abraço de Fernando Padre!', text: 'Forte abraço do produtor Fernando Padre! 🎧' },
  ];

  // Voice Dictation (Speech to Text)
  const handleVoiceDictation = (
    setText: (updater: (prev: string) => string) => void
  ) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('O reconhecimento de voz não é suportado pelo seu navegador atual. Você pode digitar normalmente.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        showToast('🎙️ Ouvindo... Pode falar a sua resposta!');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText((prev) => (prev && prev.trim().length > 0 ? `${prev} ${transcript}` : transcript));
          showToast('✅ Fala convertida em texto com sucesso!');
        }
        setIsListeningVoice(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListeningVoice(false);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim() || !onReplyReview) return;

    setIsSubmitting(true);
    try {
      await onReplyReview(replyingReview.id, replyText.trim());
      showToast('Resposta oficial de Fernando Padre publicada com sucesso!');
      setReplyingReview(null);
      setReplyText('');
    } catch (err) {
      console.error('Erro ao responder avaliação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineSubmitReply = async (reviewId: string) => {
    if (!inlineReplyText.trim() || !onReplyReview) return;

    setIsSubmitting(true);
    try {
      await onReplyReview(reviewId, inlineReplyText.trim());
      showToast('Resposta oficial publicada com sucesso!');
      setInlineReplyId(null);
      setInlineReplyText('');
    } catch (err) {
      console.error('Erro ao responder inline:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!onReplyReview) return;
    setIsSubmitting(true);
    try {
      await onReplyReview(reviewId, '');
      showToast('🗑️ Resposta do estúdio removida com sucesso!');
      if (inlineReplyId === reviewId) {
        setInlineReplyId(null);
        setInlineReplyText('');
      }
      if (replyingReview?.id === reviewId) {
        setReplyingReview(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Erro ao remover resposta:', err);
      showToast('❌ Erro ao remover resposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats Calculations
  const totalReviewsCount = reviews.length;
  const pendingRepliesCount = useMemo(() => {
    return reviews.filter((r) => !r.studioReply || !r.studioReply.trim()).length;
  }, [reviews]);

  const answeredRepliesCount = useMemo(() => {
    return reviews.filter((r) => r.studioReply && r.studioReply.trim().length > 0).length;
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (totalReviewsCount === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / totalReviewsCount).toFixed(1);
  }, [reviews, totalReviewsCount]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[rounded as keyof typeof counts] = (counts[rounded as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        !searchTerm.trim() ||
        r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.bandOrArtistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studioReply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' || r.feedbackCategory === categoryFilter;

      const matchesRating =
        ratingFilter === 'all' || Math.round(r.rating) === ratingFilter;

      const matchesReplyStatus =
        replyFilter === 'all' ||
        (replyFilter === 'pending' && (!r.studioReply || !r.studioReply.trim())) ||
        (replyFilter === 'replied' && (r.studioReply && r.studioReply.trim().length > 0));

      return matchesSearch && matchesCategory && matchesRating && matchesReplyStatus;
    }).sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, searchTerm, categoryFilter, ratingFilter, replyFilter, sortBy]);

  // Render Stars Helper
  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'text-zinc-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (score: number) => {
    if (score >= 5) return 'Excelente! Superou todas as expectativas 🏆';
    if (score >= 4) return 'Muito Bom! Ótimo som e estrutura ✨';
    if (score >= 3) return 'Bom! Atendeu ao projeto 👍';
    if (score >= 2) return 'Regular';
    return 'Insatisfeito';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* ================= HERO HEADER & OVERALL SCORE ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#121217] via-[#0d0d12] to-[#08080a] border border-zinc-800/90 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Pill & Title */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>DEPOIMENTOS & AVALIAÇÕES VERIFICADAS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                USUÁRIOS & ARTISTAS QUE GRAVARAM NO FPSTUDIO
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                Opinião real, notas em estrelas e depoimentos de cantores, bandas, bateristas, instrumentistas e agências que produziram músicas, vinhetas e arranjos com o produtor Fernando Padre.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenNewReviewModal}
                className="px-5 py-3 rounded-2xl bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs shadow-[0_0_25px_rgba(0,255,65,0.4)] hover:scale-105 transition flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-black" />
                <span>DEIXAR MEU DEPOIMENTO</span>
              </button>

              {onNavigateToBooking && (
                <button
                  onClick={() => onNavigateToBooking()}
                  className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs border border-zinc-700 hover:border-[#00FF41] transition flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#00FF41]" />
                  <span>AGENDAR MINHA GRAVAÇÃO</span>
                </button>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-zinc-800/80">
            
            {/* Big Score Card */}
            <div className="md:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                MÉDIA GERAL DAS AVALIAÇÕES
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {averageRating}
                </span>
                <span className="text-xl font-bold text-zinc-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-[11px] font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% dos artistas recomendam</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Baseado em <strong className="text-white">{totalReviewsCount}</strong> avaliações registradas de clientes reais.
              </p>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="md:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center space-y-2.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                DISTRIBUIÇÃO DE NOTAS
              </span>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
                const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-zinc-300 font-bold flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#00FF41] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-zinc-400 text-[10px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quality Pillars */}
            <div className="md:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                DESTAQUES TÉCNICOS & ESTRUTURA
              </span>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#00FF41]" /> Qualidade de Captação & DAW
                  </span>
                  <span className="font-mono font-black text-[#00FF41]">5.0 / 5.0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Mic2 className="w-3.5 h-3.5 text-[#00FF41]" /> Microfone Kadosh & Acústica
                  </span>
                  <span className="font-mono font-black text-[#00FF41]">4.9 / 5.0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#00FF41]" /> Afinação Vocal & Melodyne
                  </span>
                  <span className="font-mono font-black text-[#00FF41]">5.0 / 5.0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#00FF41]" /> Atendimento Fernando Padre
                  </span>
                  <span className="font-mono font-black text-[#00FF41]">5.0 / 5.0</span>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00FF41]" />
                <span>Padrão profissional para rádio, Spotify e YouTube</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#00FF41] text-black px-5 py-3 rounded-2xl font-black text-xs shadow-[0_0_30px_rgba(0,255,65,0.6)] flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ================= PRODUCER REPLY HUB / PAINEL DO PRODUTOR FERNANDO PADRE ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121218] via-[#0e0e14] to-[#15151c] border-2 border-[#00FF41]/30 p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PAINEL DO PRODUTOR • FERNANDO PADRE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800">
                FPStudio Salvador
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Central de Respostas aos Depoimentos
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl">
              Responda diretamente aos depoimentos dos seus artistas e clientes. As respostas oficiais aparecem destacadas com o selo verificado do produtor Fernando Padre.
            </p>
          </div>

          {/* Producer Mode Toggle & Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setProducerModeActive(!producerModeActive);
                showToast(
                  !producerModeActive
                    ? 'Modo Produtor Fernando Padre ATIVADO! Agora você pode responder a qualquer depoimento.'
                    : 'Modo Produtor desativado.'
                );
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg ${
                producerModeActive
                  ? 'bg-[#00FF41] text-black shadow-[0_0_20px_rgba(0,255,65,0.4)]'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-[#00FF41]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{producerModeActive ? '✓ Modo Produtor Ativo (Responder)' : 'Ativar Modo Produtor'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards & Fast Reply Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          
          {/* Card 1: Total */}
          <button
            onClick={() => setReplyFilter('all')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              replyFilter === 'all'
                ? 'bg-zinc-900 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total de Depoimentos
              </span>
              <span className="text-2xl font-black text-white">{totalReviewsCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <MessageSquare className="w-5 h-5 text-[#00FF41]" />
            </div>
          </button>

          {/* Card 2: Pending */}
          <button
            onClick={() => setReplyFilter('pending')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              replyFilter === 'pending'
                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/50'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Aguardando Resposta
              </span>
              <span className="text-2xl font-black text-amber-400">{pendingRepliesCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="text-xs font-black">{pendingRepliesCount > 0 ? '⚠️' : '✓'}</span>
            </div>
          </button>

          {/* Card 3: Replied */}
          <button
            onClick={() => setReplyFilter('replied')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              replyFilter === 'replied'
                ? 'bg-[#00FF41]/10 border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-[#00FF41]/50'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-[#00FF41] uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Respondidos pelo Produtor
              </span>
              <span className="text-2xl font-black text-[#00FF41]">{answeredRepliesCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
              <CornerDownRight className="w-5 h-5" />
            </div>
          </button>

        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="bg-[#0f0f13] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por artista, banda, resposta de Fernando Padre..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF41] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Reply Status Tabs + Rating Filter & Sort */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Fast Reply Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setReplyFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                  replyFilter === 'all'
                    ? 'bg-[#00FF41] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({totalReviewsCount})
              </button>

              <button
                onClick={() => setReplyFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  replyFilter === 'pending'
                    ? 'bg-amber-400 text-black font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Pendentes ({pendingRepliesCount})</span>
              </button>

              <button
                onClick={() => setReplyFilter('replied')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  replyFilter === 'replied'
                    ? 'bg-[#00FF41]/30 text-[#00FF41] font-black border border-[#00FF41]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Respondidos ({answeredRepliesCount})</span>
              </button>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-zinc-900">Mais Recentes</option>
                <option value="likes" className="bg-zinc-900">Mais Curtidos</option>
                <option value="rating" className="bg-zinc-900">Maior Nota</option>
              </select>
            </div>

          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-zinc-400 whitespace-nowrap mr-1">
            Categoria:
          </span>
          {[
            { id: 'all', label: 'Todas as Categorias' },
            { id: 'produção', label: 'Produção com Arranjo' },
            { id: 'gravação', label: 'Gravação & Captação' },
            { id: 'mix_master', label: 'Edição & Afinação' },
            { id: 'dublagem', label: 'Vinhetas & Locução' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                categoryFilter === cat.id
                  ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= REVIEWS LIST / GRID ================= */}
      {filteredReviews.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-600">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">Nenhum depoimento encontrado com os filtros selecionados</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Tente remover a busca ou alterar a categoria para ver todos os depoimentos dos artistas.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setRatingFilter('all');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredReviews.map((review) => {
            const hasLiked = likedReviews[review.id];
            const isCopying = copySuccess === review.id;
            const displayPhoto = review.photoUrl || review.sessionPhotoUrl || review.avatarUrl;

            return (
              <div
                key={review.id}
                className="bg-[#111116] border border-zinc-800/90 hover:border-zinc-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6 transition duration-300 hover:shadow-2xl hover:shadow-[#00FF41]/5 group relative overflow-hidden"
              >
                {/* Subtle Glow Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Top Section: Client Info & Rating */}
                <div className="space-y-4">
                  
                  {/* Large Artist Avatar & Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Enormous Avatar with Zoom Icon */}
                      <div
                        onClick={() =>
                          setZoomedPhoto({
                            url: review.avatarUrl || displayPhoto || '',
                            title: review.bandOrArtistName || review.clientName,
                            subtitle: `Artista / Cliente: ${review.clientName}`,
                            genre: review.audioGenre,
                            rating: review.rating,
                            comment: review.comment,
                          })
                        }
                        className="relative group/avatar cursor-pointer shrink-0"
                        title="Clique para ampliar a foto do artista"
                      >
                        <img
                          src={
                            review.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={review.clientName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-zinc-700 group-hover/avatar:border-[#00FF41] shadow-xl group-hover/avatar:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-6 h-6 text-[#00FF41]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00FF41] transition">
                            {review.bandOrArtistName || review.clientName}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="font-bold text-zinc-300">{review.clientName}</span>
                          {review.audioGenre && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-[11px]">
                                {review.audioGenre}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 bg-zinc-950/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-zinc-800/80 sm:border-0">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating, 'w-4 h-4 sm:w-5 sm:h-5')}
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400">
                        {review.rating.toFixed(1)} / 5.0 ⭐
                      </span>
                    </div>
                  </div>

                  {/* HIGH RESOLUTION LARGE SESSION / ARTWORK PHOTO */}
                  {displayPhoto && (
                    <div
                      onClick={() =>
                        setZoomedPhoto({
                          url: displayPhoto,
                          title: review.projectTitle || review.bandOrArtistName || review.clientName,
                          subtitle: `${review.clientName} • ${review.serviceName}`,
                          genre: review.audioGenre,
                          rating: review.rating,
                          comment: review.comment,
                        })
                      }
                      className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/90 cursor-pointer group/photo shadow-xl"
                      title="Clique para ver a foto da sessão em alta definição"
                    >
                      <img
                        src={displayPhoto}
                        alt={review.projectTitle || review.clientName}
                        className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Top Badges over photo */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#00FF41]/40 text-[#00FF41] text-[11px] font-black uppercase flex items-center gap-1.5 shadow-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Gravação Oficial FPStudio</span>
                        </span>

                        <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
                          {review.serviceName}
                        </span>
                      </div>

                      {/* Bottom Banner on Photo */}
                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 truncate pr-2">
                          <p className="text-xs sm:text-sm font-black text-white drop-shadow truncate">
                            {review.projectTitle || review.bandOrArtistName}
                          </p>
                          <p className="text-[11px] text-zinc-300 drop-shadow">
                            Salvador, BA • FPStudio
                          </p>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl bg-black/80 group-hover/photo:bg-[#00FF41] group-hover/photo:text-black border border-white/20 group-hover/photo:border-[#00FF41] text-[#00FF41] text-xs font-black flex items-center gap-1.5 transition-all shadow-xl shrink-0">
                          <ZoomIn className="w-4 h-4" />
                          <span>Ver Foto HD</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Project Title & Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 text-xs font-black uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sessão Concluída</span>
                    </span>

                    {review.serviceName && (
                      <span className="px-3 py-1 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-bold">
                        {review.serviceName}
                      </span>
                    )}

                    {review.projectTitle && (
                      <span className="px-3 py-1 rounded-xl bg-zinc-900 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        <span>{review.projectTitle}</span>
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <div className="pt-2 text-xs sm:text-sm text-zinc-200 leading-relaxed italic bg-zinc-950/70 p-4 sm:p-5 rounded-2xl border border-zinc-800/80">
                    "{review.comment}"
                  </div>

                  {/* Tags Badges */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {review.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 text-xs font-semibold border border-zinc-800 flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3 text-zinc-500" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Studio / Fernando Padre Official Reply or Inline Reply Box */}
                  {review.studioReply && (
                    <div className="mt-3.5 p-4.5 sm:p-5 rounded-2xl bg-[#00FF41]/8 border border-[#00FF41]/30 space-y-3 relative shadow-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-4 h-4 text-[#00FF41]" />
                          <span className="text-xs font-black text-[#00FF41] uppercase tracking-wide flex items-center gap-1.5">
                            <span>Fernando Padre</span>
                            <span className="px-2 py-0.5 rounded bg-[#00FF41] text-black text-[10px] font-black tracking-wider shadow-[0_0_10px_rgba(0,255,65,0.4)]">
                              PRODUTOR OFICIAL
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.studioReplyAt && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {new Date(review.studioReplyAt).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-100 pl-6 leading-relaxed font-medium">
                        "{review.studioReply}"
                      </p>

                      {/* Quick Edit/Delete for Producer (Do Meu Jeito) */}
                      {producerModeActive && (
                        <div className="pt-2 pl-6 flex flex-wrap items-center gap-2 border-t border-[#00FF41]/15">
                          <button
                            onClick={() => {
                              setInlineReplyId(review.id);
                              setInlineReplyText(review.studioReply || '');
                              setReplyComposerMode('custom');
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-[#00FF41] text-[#00FF41] hover:text-black text-xs font-black rounded-xl border border-[#00FF41]/40 hover:border-[#00FF41] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar do Meu Jeito</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReply(review.id)}
                            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/40 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover Resposta</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If No Reply and Producer Mode is active: Status reminder */}
                  {!review.studioReply && producerModeActive && inlineReplyId !== review.id && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Aguardando resposta do produtor Fernando Padre</span>
                      </div>
                      <button
                        onClick={() => {
                          setInlineReplyId(review.id);
                          setInlineReplyText('');
                          setReplyComposerMode('custom');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00FF41] hover:bg-[#00e038] text-black text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,65,0.4)] cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Responder do Meu Jeito</span>
                      </button>
                    </div>
                  )}

                  {/* INLINE CUSTOM REPLY COMPOSER (RESPONDER DO MEU JEITO) */}
                  {inlineReplyId === review.id && (
                    <div className="mt-3.5 p-4 sm:p-6 rounded-3xl bg-[#0c0c10] border-2 border-[#00FF41] space-y-4 animate-fadeIn shadow-[0_0_30px_rgba(0,255,65,0.2)]">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#00FF41] text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            FERNANDO PADRE • PRODUTOR OFICIAL
                          </span>
                          <span className="text-xs font-bold text-zinc-300">
                            {review.studioReply ? 'Editar resposta do seu jeito' : 'Responder do seu jeito'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setInlineReplyId(null);
                            setInlineReplyText('');
                          }}
                          className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition cursor-pointer"
                        >
                          ✕ Fechar
                        </button>
                      </div>

                      {/* Mode Switcher Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setReplyComposerMode('custom')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                            replyComposerMode === 'custom'
                              ? 'bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>✍️ Do Meu Jeito (Livre)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReplyComposerMode('templates')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                            replyComposerMode === 'templates'
                              ? 'bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>⚡ Sugestões Prontas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplyComposerMode('voice');
                            handleVoiceDictation((updater) => {
                              setInlineReplyText(updater);
                            });
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                            isListeningVoice
                              ? 'bg-rose-500 text-white animate-pulse'
                              : replyComposerMode === 'voice'
                              ? 'bg-[#00FF41] text-black'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isListeningVoice ? '🎙️ Ouvindo Voz...' : '🎙️ Ditar por Voz'}</span>
                        </button>
                      </div>

                      {/* If Templates Tab is selected: Show clickable preset chips */}
                      {replyComposerMode === 'templates' && (
                        <div className="space-y-2 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                          <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                            Clique em uma ideia para preencher e edite do seu jeito:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {replyTemplates.map((tmpl, idx) => (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => {
                                  setInlineReplyText(tmpl.text);
                                  setReplyComposerMode('custom');
                                  showToast('Sugestão inserida! Agora você pode personalizar à vontade.');
                                }}
                                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#00FF41]/15 border border-zinc-800 hover:border-[#00FF41] text-left transition cursor-pointer group"
                              >
                                <span className="text-xs font-bold text-[#00FF41] block group-hover:underline">
                                  {tmpl.label}
                                </span>
                                <span className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                                  {tmpl.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 1-Click Studio Emojis Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Smile className="w-3 h-3 text-[#00FF41]" />
                            <span>Adicionar Emojis de Estúdio (Clique para inserir):</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                          {studioEmojis.map((emoji, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                setInlineReplyText((prev) => (prev ? prev + ' ' + emoji : emoji));
                              }}
                              className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-[#00FF41]/20 border border-zinc-800 hover:border-[#00FF41] text-sm flex items-center justify-center transition cursor-pointer hover:scale-110"
                              title={`Inserir ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick phrase snippets of Fernando Padre */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Frases Rápidas do Produtor (Clique para anexar ao texto):</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {studioSnippets.map((snip, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                setInlineReplyText((prev) =>
                                  prev && prev.trim().length > 0 ? `${prev} ${snip.text}` : snip.text
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-[#00FF41]/15 border border-zinc-800 hover:border-[#00FF41] text-zinc-300 hover:text-[#00FF41] text-[11px] font-bold transition cursor-pointer"
                            >
                              {snip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Main Textarea: 100% Free Custom Response */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black text-zinc-200">
                          Sua Mensagem Personalizada:
                        </label>
                        <textarea
                          rows={4}
                          value={inlineReplyText}
                          onChange={(e) => setInlineReplyText(e.target.value)}
                          placeholder="Escreva livremente aqui a sua resposta do seu jeito como produtor (ex: elogio à afinação, arranjos de violão/guitarra, energia na bateria, masterização...)"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] transition leading-relaxed"
                        />
                      </div>

                      {/* Live Preview Box of the Official Reply */}
                      {inlineReplyText.trim() && (
                        <div className="p-3.5 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 space-y-1.5 animate-fadeIn">
                          <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-wider block flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Prévia de como os artistas verão sua resposta oficial:
                          </span>
                          <div className="pl-3 border-l-2 border-[#00FF41] text-xs text-zinc-200 italic">
                            "{inlineReplyText}"
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {inlineReplyText.length} caracteres
                          </span>
                          {inlineReplyText.trim().length > 0 && (
                            <button
                              type="button"
                              onClick={() => setInlineReplyText('')}
                              className="text-[11px] text-zinc-500 hover:text-rose-400 underline cursor-pointer"
                            >
                              Limpar texto
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInlineReplyId(null);
                              setInlineReplyText('');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={!inlineReplyText.trim() || isSubmitting}
                            onClick={() => handleInlineSubmitReply(review.id)}
                            className="px-5 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-50 text-black text-xs font-black shadow-[0_0_20px_rgba(0,255,65,0.5)] transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Salvando...' : 'Publicar Minha Resposta'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Bar: Likes, Date, & Actions */}
                <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Left: Date */}
                  <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    
                    {/* Share / Copy Button */}
                    <button
                      onClick={() => handleCopyReview(review)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Copiar Depoimento"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isCopying ? 'Copiado!' : 'Compartilhar'}</span>
                    </button>

                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        hasLiked
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          hasLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                        }`}
                      />
                      <span>{(review.likesCount || 0) + (hasLiked && !review.likesCount ? 1 : 0)}</span>
                    </button>

                    {/* Studio Reply Action */}
                    {producerModeActive && (
                      <button
                        onClick={() => {
                          setReplyingReview(review);
                          setReplyText(review.studioReply || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#00FF41]/10 hover:bg-[#00FF41] hover:text-black text-[#00FF41] border border-[#00FF41]/30 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{review.studioReply ? 'Editar Resposta' : 'Responder'}</span>
                      </button>
                    )}

                    {/* Studio Delete Action */}
                    {producerModeActive && onDeleteReview && (
                      <button
                        onClick={() => {
                          onDeleteReview(review.id);
                          showToast('🗑️ Depoimento excluído com sucesso.');
                        }}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-800/60 transition cursor-pointer"
                        title="Excluir Depoimento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= HALL DOS ARTISTAS & CLIENTES (GALLERY COM FOTOS GRANDES) ================= */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#101015] to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#00FF41] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>⭐ GALERIA DE ARTISTAS & SESSÕES DE SUCESSO</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              GRAVAÇÕES REALIZADAS NO FPSTUDIO
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clique em qualquer foto para abrir em alta resolução (HD).
            </p>
          </div>

          <button
            onClick={handleOpenNewReviewModal}
            className="px-5 py-2.5 bg-[#00FF41] hover:bg-[#00e038] text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fez Serviço? Deixe sua Avaliação com Foto</span>
          </button>
        </div>

        {/* Big Photos Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((rev) => {
            const photoSrc = rev.photoUrl || rev.sessionPhotoUrl || rev.avatarUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={rev.id}
                onClick={() =>
                  setZoomedPhoto({
                    url: photoSrc,
                    title: rev.bandOrArtistName || rev.clientName,
                    subtitle: `${rev.clientName} • ${rev.serviceName}`,
                    genre: rev.audioGenre,
                    rating: rev.rating,
                    comment: rev.comment,
                  })
                }
                className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-[#00FF41] rounded-3xl overflow-hidden shadow-2xl transition duration-300 cursor-pointer group flex flex-col justify-between"
              >
                {/* Large Photo Cover */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={photoSrc}
                    alt={rev.bandOrArtistName || rev.clientName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#00FF41]/40 text-[#00FF41] text-[11px] font-black uppercase flex items-center gap-1 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-[#00FF41]" />
                      <span>{rev.rating.toFixed(1)} Estrelas</span>
                    </span>

                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
                      {rev.audioGenre || 'Música'}
                    </span>
                  </div>

                  {/* Bottom Zoom Prompt */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1.5 rounded-xl bg-black/80 group-hover:bg-[#00FF41] group-hover:text-black text-[#00FF41] text-xs font-black flex items-center gap-1.5 transition shadow-xl">
                      <ZoomIn className="w-4 h-4" />
                      <span>Ampliar Foto</span>
                    </span>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatarUrl || photoSrc}
                      alt={rev.clientName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-700 group-hover:border-[#00FF41] transition shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-[#00FF41] transition">
                        {rev.bandOrArtistName || rev.clientName}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {rev.projectTitle || rev.serviceName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= LIGHTBOX MODAL (FOTOS EM ALTA RESOLUÇÃO) ================= */}
      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121217] border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl space-y-0 cursor-default animate-scaleUp"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#00FF41]/20 text-[#00FF41] text-[10px] font-black uppercase">
                    FOTO EM ALTA RESOLUÇÃO
                  </span>
                  {zoomedPhoto.genre && (
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                      {zoomedPhoto.genre}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {zoomedPhoto.title}
                </h3>
                {zoomedPhoto.subtitle && (
                  <p className="text-xs text-zinc-400">{zoomedPhoto.subtitle}</p>
                )}
              </div>

              <button
                onClick={() => setZoomedPhoto(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition cursor-pointer"
                title="Fechar Visualização"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Giant Photo Container */}
            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Footer with Details */}
            {zoomedPhoto.comment && (
              <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    DEPOIMENTO DO ARTISTA
                  </span>
                  <p className="text-zinc-300 italic line-clamp-2">
                    "{zoomedPhoto.comment}"
                  </p>
                </div>

                <button
                  onClick={() => setZoomedPhoto(null)}
                  className="px-5 py-2 bg-zinc-800 hover:bg-[#00FF41] hover:text-black text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: DEIXAR NOVO DEPOIMENTO ================= */}
      {isNewReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121217] border border-zinc-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 text-[10px] font-black uppercase">
                  <Star className="w-3 h-3 fill-[#00FF41]" />
                  <span>Sua Opinião no FPStudio</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  AVALIAR SERVIÇO & DEIXAR DEPOIMENTO
                </h3>
              </div>
              <button
                onClick={() => setIsNewReviewModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewReview} className="space-y-5">
              
              {/* Client / Artist identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Nome da Banda ou Projeto Artístico
                  </label>
                  <input
                    type="text"
                    value={newBandName}
                    onChange={(e) => setNewBandName(e.target.value)}
                    placeholder="Ex: Banda Axé Bahia Groove"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              {/* Service & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Serviço Realizado no Estúdio *
                  </label>
                  <select
                    value={newServiceId}
                    onChange={(e) => {
                      setNewServiceId(e.target.value);
                      const s = services.find((srv) => srv.id === e.target.value);
                      if (s?.category) {
                        setNewCategory(s.category as any);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41] cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (R$ {s.basePrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Título da Faixa / Projeto
                  </label>
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Ex: Single Autoral 'Luz da Bahia'"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
              </div>

              {/* Musical Genre */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Gênero Musical / Estilo
                </label>
                <input
                  type="text"
                  value={newAudioGenre}
                  onChange={(e) => setNewAudioGenre(e.target.value)}
                  placeholder="Ex: Axé, Pop Rock, MPB, Forró, Gospel, Trap, Comercial..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Photo / Session Image Input */}
              <div className="space-y-3 bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00FF41]" />
                    <span>FOTO DA SESSÃO OU DO ARTISTA</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold">
                    Opcional (Exibição em Alta Definição)
                  </span>
                </div>

                {/* Source Selection Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('computer')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      photoSourceTab === 'computer'
                        ? 'bg-[#00FF41] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Do Computador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('url')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      photoSourceTab === 'url'
                        ? 'bg-[#00FF41] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link / URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab('presets')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      photoSourceTab === 'presets'
                        ? 'bg-[#00FF41] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exemplos</span>
                  </button>
                </div>

                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* TAB 1: COMPUTER FILE UPLOAD & DRAG/DROP */}
                {photoSourceTab === 'computer' && (
                  <div className="space-y-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                        isDragging
                          ? 'border-[#00FF41] bg-[#00FF41]/10 scale-[1.01]'
                          : 'border-zinc-700/80 hover:border-[#00FF41]/60 bg-zinc-900/50 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#00FF41] group-hover:scale-110 transition">
                        <UploadCloud className="w-6 h-6" />
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">
                          Clique para escolher foto do computador ou arraste aqui
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Formatos aceitos: JPG, PNG, WEBP, GIF (Otimização automática HD)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-[#00FF41] hover:text-black text-[#00FF41] border border-zinc-700 hover:border-[#00FF41] text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <FolderUp className="w-3.5 h-3.5" />
                        <span>Selecionar Arquivo</span>
                      </button>
                    </div>

                    {isProcessingFile && (
                      <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-zinc-900 text-xs text-[#00FF41] font-semibold animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processando e otimizando imagem em alta resolução...</span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: URL INPUT */}
                {photoSourceTab === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="url"
                        value={newPhotoUrl.startsWith('data:') ? '' : newPhotoUrl}
                        onChange={(e) => {
                          setNewPhotoUrl(e.target.value);
                          setUploadedFileName(null);
                        }}
                        placeholder="https://exemplo.com/sua-foto-no-estudio.jpg"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                      />
                      <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Cole um link direto de foto do Instagram, Google Fotos, Imgur, etc.
                    </p>
                  </div>
                )}

                {/* TAB 3: PRESETS */}
                {photoSourceTab === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-400">
                      Selecione uma foto de estúdio correspondente à sua sessão:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          label: 'Microfone & Voz',
                          url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
                        },
                        {
                          label: 'Guitarras & Baixos',
                          url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
                        },
                        {
                          label: 'Mesa de Som FPStudio',
                          url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1200&auto=format&fit=crop&q=80',
                        },
                        {
                          label: 'Bateria & Percussão',
                          url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1200&auto=format&fit=crop&q=80',
                        },
                        {
                          label: 'Acústico Violão MPB',
                          url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&auto=format&fit=crop&q=80',
                        },
                        {
                          label: 'Produção em Pro Tools',
                          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
                        },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewPhotoUrl(preset.url);
                            setUploadedFileName(preset.label);
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            newPhotoUrl === preset.url
                              ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="text-[11px] font-bold truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* LIVE PHOTO PREVIEW CONTAINER WITH DETAILS & DELETE BUTTON */}
                {newPhotoUrl && (
                  <div className="mt-2 bg-zinc-900 border border-zinc-700/90 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-white">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                        <span>Foto Carregada com Sucesso</span>
                        {uploadedFileName && (
                          <span className="text-[11px] font-normal text-zinc-400 truncate max-w-[180px]">
                            ({uploadedFileName} {uploadedFileSize ? `• ${uploadedFileSize}` : ''})
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-600 border border-rose-800 text-rose-300 hover:text-white rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer"
                        title="Remover foto selecionada"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover Foto</span>
                      </button>
                    </div>

                    <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                      <img
                        src={newPhotoUrl}
                        alt="Prévia da foto carregada"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white drop-shadow">
                        <span className="font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[#00FF41]" />
                          <span>Prévia da exibição em tela cheia</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/70 border border-white/20 text-[#00FF41] font-mono text-[10px] font-bold">
                          HD 1080p
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Star Rating Selector */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-center">
                <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider">
                  SUA NOTA EM ESTRELAS (1 A 5) *
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                            : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-400">
                  {getRatingLabel(newRating)}
                </p>
              </div>

              {/* Comment / Review Textarea */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Seu Comentário / Depoimento Completo *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Conte como foi sua experiência: o que achou da acústica, dos instrumentos (Ibanez, Memphis, violões, baixos), da captação no Pro Tools, da afinação vocal e do atendimento do Fernando Padre..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              {/* Tags Suggestions */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-400">
                  Destaques da Sessão (Clique para adicionar tags):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTagSuggestions.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewReviewModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publicando...' : 'PUBLICAR DEPOIMENTO'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: RESPONDER DEPOIMENTO (STUDIO ADMIN) ================= */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121217] border-2 border-[#00FF41]/40 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  FERNANDO PADRE • PRODUTOR OFICIAL
                </span>
                <h3 className="text-base font-black text-white">
                  Responder ao Artista: {replyingReview.bandOrArtistName || replyingReview.clientName}
                </h3>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Review excerpt */}
            <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-300 italic">
              "{replyingReview.comment}"
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              
              {/* Mode Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setReplyComposerMode('custom')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    replyComposerMode === 'custom'
                      ? 'bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>✍️ Do Meu Jeito (Livre)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyComposerMode('templates')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    replyComposerMode === 'templates'
                      ? 'bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>⚡ Sugestões Prontas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyComposerMode('voice');
                    handleVoiceDictation((updater) => {
                      setReplyText(updater);
                    });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    isListeningVoice
                      ? 'bg-rose-500 text-white animate-pulse'
                      : replyComposerMode === 'voice'
                      ? 'bg-[#00FF41] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListeningVoice ? '🎙️ Ouvindo Voz...' : '🎙️ Ditar por Voz'}</span>
                </button>
              </div>

              {/* If Templates Tab is active */}
              {replyComposerMode === 'templates' && (
                <div className="space-y-2 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                    Modelos de Respostas Rápidas (Clique para usar e edite como quiser):
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {replyTemplates.map((tmpl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setReplyText(tmpl.text);
                          setReplyComposerMode('custom');
                          showToast('Sugestão aplicada! Personalize à vontade.');
                        }}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#00FF41]/15 border border-zinc-800 hover:border-[#00FF41] text-left transition cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-[#00FF41] block group-hover:underline">
                          {tmpl.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                          {tmpl.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Studio Emojis Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Smile className="w-3 h-3 text-[#00FF41]" />
                    <span>Emojis de Estúdio:</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  {studioEmojis.map((emoji, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setReplyText((prev) => (prev ? prev + ' ' + emoji : emoji));
                      }}
                      className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-[#00FF41]/20 border border-zinc-800 hover:border-[#00FF41] text-sm flex items-center justify-center transition cursor-pointer hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick phrase snippets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Frases Rápidas do Produtor:</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {studioSnippets.map((snip, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setReplyText((prev) =>
                          prev && prev.trim().length > 0 ? `${prev} ${snip.text}` : snip.text
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-[#00FF41]/15 border border-zinc-800 hover:border-[#00FF41] text-zinc-300 hover:text-[#00FF41] text-[11px] font-bold transition cursor-pointer"
                    >
                      {snip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Textarea */}
              <div>
                <label className="block text-xs font-black text-zinc-200 mb-1">
                  Mensagem de Resposta Oficial de Fernando Padre:
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva livremente aqui a sua resposta do seu jeito..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] transition leading-relaxed"
                />
              </div>

              {/* Live Preview */}
              {replyText.trim() && (
                <div className="p-3.5 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 space-y-1.5 animate-fadeIn">
                  <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-wider block flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Prévia da resposta oficial:
                  </span>
                  <div className="pl-3 border-l-2 border-[#00FF41] text-xs text-zinc-200 italic">
                    "{replyText}"
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {replyText.length} caracteres
                  </span>
                  {replyText.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setReplyText('')}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {replyingReview.studioReply && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDeleteReply(replyingReview.id)}
                      className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover Resposta</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !replyText.trim()}
                    className="px-5 py-2 bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Salvando...' : 'Publicar Resposta'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
