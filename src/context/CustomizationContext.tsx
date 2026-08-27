import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from '../data/translations';
import { safeStorage } from '../utils/safeStorage';

export type AccentColor =
  | 'neon_green'
  | 'cyber_cyan'
  | 'gold_amber'
  | 'crimson_red'
  | 'electric_purple'
  | 'arctic_white';

export type ColorMode = 'dark' | 'light';

export type ThemeStyle =
  | 'dark_studio'
  | 'midnight_blue'
  | 'charcoal_onyx'
  | 'matrix_black'
  | 'light_studio'
  | 'light_warm'
  | 'light_silver';

export type FontFamily =
  | 'sans'
  | 'montserrat'
  | 'syne'
  | 'outfit'
  | 'oswald'
  | 'mono';

export type FontSize =
  | 'compact'
  | 'normal'
  | 'large'
  | 'xlarge';

export interface AccentColorOption {
  id: AccentColor;
  namePt: string;
  nameEn: string;
  hex: string;
  rgb: string;
  glowClass: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  {
    id: 'neon_green',
    namePt: 'Verde Neon (Padrão Studio)',
    nameEn: 'Neon Green (Studio Standard)',
    hex: '#00FF41',
    rgb: '0, 255, 65',
    glowClass: 'shadow-[0_0_20px_rgba(0,255,65,0.4)]',
    tailwindBg: 'bg-[#00FF41]',
    tailwindText: 'text-[#00FF41]',
    tailwindBorder: 'border-[#00FF41]',
  },
  {
    id: 'cyber_cyan',
    namePt: 'Ciano Elétrico (Cyber)',
    nameEn: 'Electric Cyan (Cyber)',
    hex: '#06B6D4',
    rgb: '6, 182, 212',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    tailwindBg: 'bg-cyan-500',
    tailwindText: 'text-cyan-400',
    tailwindBorder: 'border-cyan-500',
  },
  {
    id: 'gold_amber',
    namePt: 'Ouro Studio (Gold)',
    nameEn: 'Studio Gold (Amber)',
    hex: '#F59E0B',
    rgb: '245, 158, 11',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    tailwindBg: 'bg-amber-500',
    tailwindText: 'text-amber-400',
    tailwindBorder: 'border-amber-500',
  },
  {
    id: 'crimson_red',
    namePt: 'Vermelho Sunset (Crimson)',
    nameEn: 'Crimson Red (Sunset)',
    hex: '#EF4444',
    rgb: '239, 68, 68',
    glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    tailwindBg: 'bg-rose-500',
    tailwindText: 'text-rose-400',
    tailwindBorder: 'border-rose-500',
  },
  {
    id: 'electric_purple',
    namePt: 'Roxo Ultravioleta',
    nameEn: 'Ultra Violet (Purple)',
    hex: '#A855F7',
    rgb: '168, 85, 247',
    glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    tailwindBg: 'bg-purple-500',
    tailwindText: 'text-purple-400',
    tailwindBorder: 'border-purple-500',
  },
  {
    id: 'arctic_white',
    namePt: 'Monocromático Prata',
    nameEn: 'Arctic Silver (Monochrome)',
    hex: '#F4F4F5',
    rgb: '244, 244, 245',
    glowClass: 'shadow-[0_0_20px_rgba(244,244,245,0.3)]',
    tailwindBg: 'bg-zinc-100',
    tailwindText: 'text-zinc-100',
    tailwindBorder: 'border-zinc-300',
  },
];

export interface ThemeStyleOption {
  id: ThemeStyle;
  mode: ColorMode;
  namePt: string;
  nameEn: string;
  bgHex: string;
  cardHex: string;
  descPt: string;
  descEn: string;
}

export const THEME_STYLE_OPTIONS: ThemeStyleOption[] = [
  {
    id: 'dark_studio',
    mode: 'dark',
    namePt: 'Deep Studio (Padrão Escuro)',
    nameEn: 'Deep Studio (Default Dark)',
    bgHex: '#09090B',
    cardHex: '#121216',
    descPt: 'Preto profundo e contrastes profissionais de estúdio.',
    descEn: 'Deep black & high contrast studio monitor atmosphere.',
  },
  {
    id: 'midnight_blue',
    mode: 'dark',
    namePt: 'Midnight Blue (Noturno)',
    nameEn: 'Midnight Blue (Night)',
    bgHex: '#0B0F19',
    cardHex: '#111827',
    descPt: 'Azul noturno suave para gravação noturna e elegância.',
    descEn: 'Soft night-sky navy tone for night recording sessions.',
  },
  {
    id: 'charcoal_onyx',
    mode: 'dark',
    namePt: 'Carvão Ônix (Grafite)',
    nameEn: 'Charcoal Onyx (Graphite)',
    bgHex: '#18181B',
    cardHex: '#27272A',
    descPt: 'Cinza grafite sofisticado e aveludado.',
    descEn: 'Sophisticated dark graphite with smooth matte depth.',
  },
  {
    id: 'matrix_black',
    mode: 'dark',
    namePt: 'Cyber Matrix (Escuro)',
    nameEn: 'Cyber Matrix (Dark)',
    bgHex: '#040d06',
    cardHex: '#081a0e',
    descPt: 'Estética com leve tom esmeralda escuro.',
    descEn: 'Emerald-tinted matrix darkness with high-tech vibes.',
  },
  {
    id: 'light_studio',
    mode: 'light',
    namePt: 'Studio Clean Light (Claro)',
    nameEn: 'Studio Clean Light (White)',
    bgHex: '#F8FAFC',
    cardHex: '#FFFFFF',
    descPt: 'Ambiente claro, luminoso e limpo com alta legibilidade diurna.',
    descEn: 'Bright, clean white environment with crisp daytime readability.',
  },
  {
    id: 'light_warm',
    mode: 'light',
    namePt: 'Warm Off-White (Papel Suave)',
    nameEn: 'Warm Off-White (Soft Paper)',
    bgHex: '#FBFBF9',
    cardHex: '#FFFFFF',
    descPt: 'Tons claros suaves e confortáveis aos olhos sem ofuscamento.',
    descEn: 'Soft warm light tones easy on the eyes without harsh glare.',
  },
  {
    id: 'light_silver',
    mode: 'light',
    namePt: 'Prata Platinum (Claro Moderno)',
    nameEn: 'Platinum Silver (Modern Light)',
    bgHex: '#F1F5F9',
    cardHex: '#FFFFFF',
    descPt: 'Estética prata e platina com acabamento executivo moderno.',
    descEn: 'Platinum silver aesthetic with modern executive finish.',
  },
];

export interface FontFamilyOption {
  id: FontFamily;
  namePt: string;
  nameEn: string;
  cssFamily: string;
  previewSample: string;
  descPt: string;
  descEn: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    id: 'sans',
    namePt: 'Plus Jakarta Sans (Padrão)',
    nameEn: 'Plus Jakarta Sans (Clean)',
    cssFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Moderna, limpa e de altíssima legibilidade em telas.',
    descEn: 'Modern, ultra-clean, and highly readable on all screens.',
  },
  {
    id: 'montserrat',
    namePt: 'Montserrat (Geométrica / Display)',
    nameEn: 'Montserrat (Geometric Display)',
    cssFamily: "'Montserrat', system-ui, sans-serif",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Títulos marcantes e estética visual imponente.',
    descEn: 'Bold typography with high visual stage presence.',
  },
  {
    id: 'syne',
    namePt: 'Syne (Artística / Produção)',
    nameEn: 'Syne (Artistic / Indie)',
    cssFamily: "'Syne', system-ui, sans-serif",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Tipografia artística estilosa e moderna.',
    descEn: 'Futuristic artistic typeface for creative music producers.',
  },
  {
    id: 'outfit',
    namePt: 'Outfit (Grotesque Suave)',
    nameEn: 'Outfit (Soft Grotesque)',
    cssFamily: "'Outfit', system-ui, sans-serif",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Arredondada, elegante e minimalista.',
    descEn: 'Smooth, elegant, and minimalist aesthetic.',
  },
  {
    id: 'oswald',
    namePt: 'Oswald (Condensada / Impacto)',
    nameEn: 'Oswald (Condensed Impact)',
    cssFamily: "'Oswald', system-ui, sans-serif",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Formato vertical compacto de cartaz musical.',
    descEn: 'Condensed poster-style punch with strong verticality.',
  },
  {
    id: 'mono',
    namePt: 'JetBrains Mono (Console Studio)',
    nameEn: 'JetBrains Mono (Studio Console)',
    cssFamily: "'JetBrains Mono', monospace",
    previewSample: 'FPSTUDIO 2026',
    descPt: 'Estética técnica de DAW, Pro-Tools e consoles de áudio.',
    descEn: 'Hardware mixer, DAW, and audio rack technical look.',
  },
];

export interface FontSizeOption {
  id: FontSize;
  namePt: string;
  nameEn: string;
  scalePercent: string;
  rootScaleClass: string;
  descPt: string;
  descEn: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  {
    id: 'compact',
    namePt: 'Compacto (90%)',
    nameEn: 'Compact (90%)',
    scalePercent: '90%',
    rootScaleClass: 'text-[92%]',
    descPt: 'Exibe mais informações simultaneamente na tela.',
    descEn: 'Displays more controls and items on the screen.',
  },
  {
    id: 'normal',
    namePt: 'Padrão (100%)',
    nameEn: 'Standard (100%)',
    scalePercent: '100%',
    rootScaleClass: 'text-[100%]',
    descPt: 'Equilíbrio padrão testado para todos os dispositivos.',
    descEn: 'Balanced default scale for all desktop and mobile devices.',
  },
  {
    id: 'large',
    namePt: 'Grande (110%)',
    nameEn: 'Large (110%)',
    scalePercent: '110%',
    rootScaleClass: 'text-[108%]',
    descPt: 'Maior conforto visual para leitura e detalhes.',
    descEn: 'Enhanced readability and comfortable visual sizes.',
  },
  {
    id: 'xlarge',
    namePt: 'Extra Grande (120%)',
    nameEn: 'Extra Large (120%)',
    scalePercent: '120%',
    rootScaleClass: 'text-[116%]',
    descPt: 'Tamanho expandido para visualização à distância.',
    descEn: 'Maximum magnification for easy studio distance viewing.',
  },
];

interface CustomizationSettings {
  colorMode: ColorMode;
  language: Language;
  accentColor: AccentColor;
  themeStyle: ThemeStyle;
  fontFamily: FontFamily;
  fontSize: FontSize;
}

const DEFAULT_SETTINGS: CustomizationSettings = {
  colorMode: 'dark',
  language: 'pt',
  accentColor: 'neon_green',
  themeStyle: 'dark_studio',
  fontFamily: 'sans',
  fontSize: 'normal',
};

interface CustomizationContextValue {
  colorMode: ColorMode;
  language: Language;
  accentColor: AccentColor;
  themeStyle: ThemeStyle;
  fontFamily: FontFamily;
  fontSize: FontSize;
  currentAccent: AccentColorOption;
  currentTheme: ThemeStyleOption;
  currentFont: FontFamilyOption;
  currentSize: FontSizeOption;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setLanguage: (lang: Language) => void;
  setAccentColor: (accent: AccentColor) => void;
  setThemeStyle: (theme: ThemeStyle) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  resetToDefaults: () => void;
  t: (key: keyof Translations) => string;
  isCustomModalOpen: boolean;
  setIsCustomModalOpen: (open: boolean) => void;
}

const CustomizationContext = createContext<CustomizationContextValue | undefined>(undefined);

const STORAGE_KEY = 'fpstudio_custom_settings_v1';

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Determine colorMode from parsed theme or property
        const mode = parsed.colorMode || (parsed.themeStyle?.startsWith('light_') ? 'light' : 'dark');
        return { ...DEFAULT_SETTINGS, ...parsed, colorMode: mode };
      }
    } catch (e) {
      console.error('Error parsing customization settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Find current options with strict fallbacks
  const currentAccent =
    (settings?.accentColor && ACCENT_COLOR_OPTIONS.find((a) => a.id === settings.accentColor)) ||
    ACCENT_COLOR_OPTIONS[0];
  const currentTheme =
    (settings?.themeStyle && THEME_STYLE_OPTIONS.find((t) => t.id === settings.themeStyle)) ||
    THEME_STYLE_OPTIONS[0];
  const currentFont =
    (settings?.fontFamily && FONT_FAMILY_OPTIONS.find((f) => f.id === settings.fontFamily)) ||
    FONT_FAMILY_OPTIONS[0];
  const currentSize =
    (settings?.fontSize && FONT_SIZE_OPTIONS.find((s) => s.id === settings.fontSize)) ||
    FONT_SIZE_OPTIONS[1];

  // Save to localStorage and apply CSS rules to DOM
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}

    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

    const isLight = settings?.colorMode === 'light' || currentTheme?.mode === 'light';

    try {
      // 1. Color Mode Class Toggle (Light / Dark)
      if (isLight) {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
      } else {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
      }

      // 2. Accent Color Custom Properties
      if (currentAccent?.hex) {
        root.style.setProperty('--brand-accent', currentAccent.hex);
        root.style.setProperty('--brand-accent-rgb', currentAccent.rgb || '0, 255, 65');
      }
      
      // 3. Font Family
      if (currentFont?.cssFamily) {
        root.style.setProperty('--font-custom', currentFont.cssFamily);
        body.style.fontFamily = currentFont.cssFamily;
      }

      // 4. Theme Backgrounds
      if (currentTheme?.bgHex) {
        root.style.setProperty('--bg-main', currentTheme.bgHex);
        root.style.setProperty('--bg-card', currentTheme.cardHex || '#121216');
        body.style.backgroundColor = currentTheme.bgHex;
      }

      // 5. Font Size Scale class on root
      root.classList.remove('text-scale-compact', 'text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
      root.classList.add(`text-scale-${settings?.fontSize || 'normal'}`);

      // Set font scale CSS property
      const scaleFactorMap: Record<FontSize, string> = {
        compact: '0.92',
        normal: '1',
        large: '1.08',
        xlarge: '1.16',
      };
      root.style.setProperty('--scale-factor', scaleFactorMap[settings?.fontSize as FontSize] || '1');
    } catch (err) {
      console.warn('[Customization] Error applying styles to DOM:', err);
    }

  }, [settings, currentAccent, currentTheme, currentFont, currentSize]);

  const setColorMode = (colorMode: ColorMode) => {
    setSettings((prev) => {
      let nextTheme = prev.themeStyle;
      if (colorMode === 'light' && !prev.themeStyle.startsWith('light_')) {
        nextTheme = 'light_studio';
      } else if (colorMode === 'dark' && prev.themeStyle.startsWith('light_')) {
        nextTheme = 'dark_studio';
      }
      return { ...prev, colorMode, themeStyle: nextTheme };
    });
  };

  const toggleColorMode = () => {
    setColorMode(settings.colorMode === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (language: Language) => {
    setSettings((prev) => ({ ...prev, language }));
  };

  const setAccentColor = (accentColor: AccentColor) => {
    setSettings((prev) => ({ ...prev, accentColor }));
  };

  const setThemeStyle = (themeStyle: ThemeStyle) => {
    const selectedTheme = THEME_STYLE_OPTIONS.find((t) => t.id === themeStyle);
    const mode = selectedTheme?.mode || (themeStyle.startsWith('light_') ? 'light' : 'dark');
    setSettings((prev) => ({ ...prev, themeStyle, colorMode: mode }));
  };

  const setFontFamily = (fontFamily: FontFamily) => {
    setSettings((prev) => ({ ...prev, fontFamily }));
  };

  const setFontSize = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Translation helper function
  const t = (key: keyof Translations): string => {
    const lang = settings?.language || 'pt';
    const dict = (translations && translations[lang]) || translations?.pt || ({} as any);
    return dict[key] || translations?.pt?.[key] || String(key);
  };

  return (
    <CustomizationContext.Provider
      value={{
        colorMode: settings?.colorMode || 'dark',
        language: settings?.language || 'pt',
        accentColor: settings?.accentColor || 'neon_green',
        themeStyle: settings?.themeStyle || 'dark_studio',
        fontFamily: settings?.fontFamily || 'sans',
        fontSize: settings?.fontSize || 'normal',
        currentAccent: currentAccent || ACCENT_COLOR_OPTIONS[0],
        currentTheme: currentTheme || THEME_STYLE_OPTIONS[0],
        currentFont: currentFont || FONT_FAMILY_OPTIONS[0],
        currentSize: currentSize || FONT_SIZE_OPTIONS[1],
        setColorMode,
        toggleColorMode,
        setLanguage,
        setAccentColor,
        setThemeStyle,
        setFontFamily,
        setFontSize,
        resetToDefaults,
        t,
        isCustomModalOpen,
        setIsCustomModalOpen,
      }}
    >
      <div
        className={`w-full min-h-screen transition-colors duration-300 ${currentSize?.rootScaleClass || 'text-scale-normal'} ${settings?.colorMode === 'light' ? 'light-mode' : 'dark-mode'}`}
        style={{
          fontFamily: currentFont?.cssFamily || 'inherit',
          backgroundColor: currentTheme?.bgHex || '#09090b',
        }}
      >
        {children}
      </div>
    </CustomizationContext.Provider>
  );
};

export const useCustomization = (): CustomizationContextValue => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};
