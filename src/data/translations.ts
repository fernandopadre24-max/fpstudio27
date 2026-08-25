export type Language = 'pt' | 'en';

export interface Translations {
  // Navigation
  nav_schedule: string;
  nav_my_orders: string;
  nav_services: string;
  nav_gear: string;
  nav_services_gear: string;
  nav_reviews: string;
  nav_chat: string;
  nav_profile: string;
  nav_admin_agenda: string;
  nav_admin_clients: string;
  nav_admin_finances: string;
  nav_admin_assistant: string;
  nav_signin: string;
  nav_signout: string;
  nav_admin: string;
  nav_customize: string;
  nav_notifications: string;
  nav_mark_read: string;
  nav_no_notifications: string;

  // Customization Modal
  custom_title: string;
  custom_subtitle: string;
  custom_tab_language: string;
  custom_tab_accent: string;
  custom_tab_background: string;
  custom_tab_font: string;
  custom_tab_fontsize: string;
  custom_language_title: string;
  custom_language_desc: string;
  custom_accent_title: string;
  custom_accent_desc: string;
  custom_bg_title: string;
  custom_bg_desc: string;
  custom_font_title: string;
  custom_font_desc: string;
  custom_size_title: string;
  custom_size_desc: string;
  custom_preview_title: string;
  custom_preview_sample_heading: string;
  custom_preview_sample_text: string;
  custom_preview_sample_badge: string;
  custom_btn_reset: string;
  custom_btn_apply: string;

  // Common UI
  btn_book_now: string;
  btn_request_quote: string;
  btn_cancel: string;
  btn_save: string;
  btn_edit: string;
  btn_delete: string;
  btn_close: string;
  btn_copy: string;
  btn_copied: string;
  btn_details: string;
  btn_view_on_map: string;
  
  // Statuses
  status_pending: string;
  status_confirmed: string;
  status_paid: string;
  status_completed: string;
  status_canceled: string;
  status_included: string;
  
  // Sections
  sec_quick_booking: string;
  sec_materials_title: string;
  sec_materials_subtitle: string;
  sec_services_title: string;
  sec_services_subtitle: string;
  sec_reviews_title: string;
  sec_reviews_subtitle: string;
  sec_location_title: string;

  // Producer & Studio
  producer_tagline: string;
  studio_location_desc: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Navigation
    nav_schedule: 'AGENDAR',
    nav_my_orders: 'MEUS PEDIDOS',
    nav_services: 'SERVIÇOS',
    nav_gear: '& MATERIAL',
    nav_services_gear: 'SERVIÇOS & MATERIAL',
    nav_reviews: 'DEPOIMENTOS ⭐',
    nav_chat: 'CHAT',
    nav_profile: 'Meu Cadastro',
    nav_admin_agenda: 'AGENDA',
    nav_admin_clients: 'CLIENTES',
    nav_admin_finances: 'FINANÇAS',
    nav_admin_assistant: 'ASSISTENTE',
    nav_signin: 'ENTRAR',
    nav_signout: 'Sair',
    nav_admin: 'ADM',
    nav_customize: 'Personalizar',
    nav_notifications: 'Notificações',
    nav_mark_read: 'Marcar lidas',
    nav_no_notifications: 'Nenhuma notificação recente.',

    // Customization Modal
    custom_title: 'Personalização & Idioma',
    custom_subtitle: 'Ajuste o visual, as cores de destaque, a tipografia, o tamanho das fontes e o idioma do FPStudio.',
    custom_tab_language: 'Idioma / Language',
    custom_tab_accent: 'Cor de Destaque',
    custom_tab_background: 'Estilo de Fundo',
    custom_tab_font: 'Tipografia & Fonte',
    custom_tab_fontsize: 'Tamanho da Fonte',
    custom_language_title: 'Selecione o Idioma do Sistema',
    custom_language_desc: 'Alterne instantaneamente todo o sistema entre Português e Inglês.',
    custom_accent_title: 'Paleta de Cores de Destaque',
    custom_accent_desc: 'Escolha a cor primária dos botões, badges, luzes de neon e contrastes.',
    custom_bg_title: 'Ambiente & Tema do Estúdio',
    custom_bg_desc: 'Selecione a atmosfera visual e o tom de fundo da interface.',
    custom_font_title: 'Família Tipográfica',
    custom_font_desc: 'Altere a fonte de exibição para títulos, cartões e textos.',
    custom_size_title: 'Escala de Tamanho do Texto',
    custom_size_desc: 'Aumente ou diminua o tamanho das letras para maior conforto visual.',
    custom_preview_title: 'Pré-Visualização em Tempo Real',
    custom_preview_sample_heading: 'FPSTUDIO SALVADOR • GRAVAÇÃO & PRODUÇÃO',
    custom_preview_sample_text: 'Produção Musical de Alto Padrão por Fernando Padre com equipamentos profissionais.',
    custom_preview_sample_badge: 'PRO-TOOLS INCLUSO',
    custom_btn_reset: 'Restaurar Padrão',
    custom_btn_apply: 'Concluído',

    // Common UI
    btn_book_now: 'Agendar Sessão',
    btn_request_quote: 'Solicitar Orçamento',
    btn_cancel: 'Cancelar',
    btn_save: 'Salvar',
    btn_edit: 'Editar',
    btn_delete: 'Excluir',
    btn_close: 'Fechar',
    btn_copy: 'Copiar',
    btn_copied: 'Copiado!',
    btn_details: 'Ver Detalhes',
    btn_view_on_map: 'Ver no Mapa',

    // Statuses
    status_pending: 'Pendente',
    status_confirmed: 'Confirmado',
    status_paid: 'Pago / Aprovado',
    status_completed: 'Concluído',
    status_canceled: 'Cancelado',
    status_included: 'INCLUSO',

    // Sections
    sec_quick_booking: 'Agendamento & Simulação Rápida',
    sec_materials_title: 'MATERIAL & INSTRUMENTOS PARA GRAVAÇÃO',
    sec_materials_subtitle: 'Fotos reais, valores de uso na gravação com edição inclusa e acervo de instrumentos operados por Fernando Padre.',
    sec_services_title: 'SERVIÇOS DE PRODUÇÃO MUSICAL',
    sec_services_subtitle: 'Gravação, Edição cirúrgica, Mixagem e Masterização de alta fidelidade em Salvador - BA.',
    sec_reviews_title: 'DEPOIMENTOS & AVALIAÇÕES DE CLIENTES',
    sec_reviews_subtitle: 'O que artistas e bandas dizem sobre gravar no FPStudio.',
    sec_location_title: 'LOCALIZAÇÃO & CONTATO',

    // Producer & Studio
    producer_tagline: 'Produção Musical & Estúdio de Gravação',
    studio_location_desc: 'Travessa Dois Leões, 19 - Pernambués, Salvador - BA',
  },
  en: {
    // Navigation
    nav_schedule: 'BOOK NOW',
    nav_my_orders: 'MY ORDERS',
    nav_services: 'SERVICES',
    nav_gear: '& GEAR',
    nav_services_gear: 'SERVICES & GEAR',
    nav_reviews: 'REVIEWS ⭐',
    nav_chat: 'CHAT',
    nav_profile: 'My Profile',
    nav_admin_agenda: 'SCHEDULE',
    nav_admin_clients: 'CLIENTS',
    nav_admin_finances: 'FINANCES',
    nav_admin_assistant: 'AI ASSISTANT',
    nav_signin: 'SIGN IN',
    nav_signout: 'Logout',
    nav_admin: 'ADMIN',
    nav_customize: 'Customize',
    nav_notifications: 'Notifications',
    nav_mark_read: 'Mark as read',
    nav_no_notifications: 'No recent notifications.',

    // Customization Modal
    custom_title: 'Customization & Language',
    custom_subtitle: 'Adjust appearance, accent colors, typography, font size scale, and language for FPStudio.',
    custom_tab_language: 'Language / Idioma',
    custom_tab_accent: 'Accent Color',
    custom_tab_background: 'Background Style',
    custom_tab_font: 'Typography & Font',
    custom_tab_fontsize: 'Font Size Scale',
    custom_language_title: 'Select System Language',
    custom_language_desc: 'Instantly toggle the entire interface between Portuguese and English.',
    custom_accent_title: 'Accent Color Palette',
    custom_accent_desc: 'Choose the primary neon accent color for buttons, badges, highlights, and borders.',
    custom_bg_title: 'Studio Atmosphere & Theme',
    custom_bg_desc: 'Select the background mood and deep canvas tone.',
    custom_font_title: 'Font Family',
    custom_font_desc: 'Change typography family for headings, cards, and body text.',
    custom_size_title: 'Font Size Scale',
    custom_size_desc: 'Increase or decrease text scaling for your visual comfort.',
    custom_preview_title: 'Live Preview',
    custom_preview_sample_heading: 'FPSTUDIO SALVADOR • RECORDING & PRODUCTION',
    custom_preview_sample_text: 'High-Standard Music Production by Fernando Padre with professional studio gear.',
    custom_preview_sample_badge: 'PRO-TOOLS INCLUDED',
    custom_btn_reset: 'Reset Defaults',
    custom_btn_apply: 'Done',

    // Common UI
    btn_book_now: 'Book Session',
    btn_request_quote: 'Request Quote',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_close: 'Close',
    btn_copy: 'Copy',
    btn_copied: 'Copied!',
    btn_details: 'View Details',
    btn_view_on_map: 'View on Map',

    // Statuses
    status_pending: 'Pending',
    status_confirmed: 'Confirmed',
    status_paid: 'Paid / Approved',
    status_completed: 'Completed',
    status_canceled: 'Canceled',
    status_included: 'INCLUDED',

    // Sections
    sec_quick_booking: 'Quick Booking & Session Simulator',
    sec_materials_title: 'GEAR & INSTRUMENTS FOR RECORDING',
    sec_materials_subtitle: 'Real studio pictures, recording session rates with editing included, and instruments operated by Fernando Padre.',
    sec_services_title: 'MUSIC PRODUCTION SERVICES',
    sec_services_subtitle: 'Recording, Surgical Editing, Mixing, and Mastering high-fidelity audio in Salvador - BA.',
    sec_reviews_title: 'CLIENT REVIEWS & TESTIMONIALS',
    sec_reviews_subtitle: 'What artists, bands, and musicians say about recording at FPStudio.',
    sec_location_title: 'LOCATION & CONTACT',

    // Producer & Studio
    producer_tagline: 'Music Production & Recording Studio',
    studio_location_desc: 'Travessa Dois Leões, 19 - Pernambués, Salvador - BA',
  },
};
