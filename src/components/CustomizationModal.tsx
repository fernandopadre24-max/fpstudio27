import React, { useState } from 'react';
import {
  X,
  Palette,
  Type,
  Maximize,
  Globe,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Moon,
  Eye,
  Layers,
} from 'lucide-react';
import {
  useCustomization,
  ACCENT_COLOR_OPTIONS,
  THEME_STYLE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  AccentColor,
  ThemeStyle,
  FontFamily,
  FontSize,
} from '../context/CustomizationContext';
import { Language } from '../data/translations';
import { FlagIcon } from './FlagIcon';

export const CustomizationModal: React.FC = () => {
  const {
    language,
    accentColor,
    themeStyle,
    fontFamily,
    fontSize,
    currentAccent,
    currentTheme,
    currentFont,
    currentSize,
    setLanguage,
    setAccentColor,
    setThemeStyle,
    setFontFamily,
    setFontSize,
    resetToDefaults,
    t,
    isCustomModalOpen,
    setIsCustomModalOpen,
  } = useCustomization();

  type TabKey = 'language' | 'accent' | 'theme' | 'font' | 'size';
  const [activeTab, setActiveTab] = useState<TabKey>('language');

  if (!isCustomModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="border border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 space-y-6 my-6 text-white max-h-[92vh] overflow-y-auto transition-all"
        style={{
          backgroundColor: currentTheme.cardHex,
          fontFamily: currentFont.cssFamily,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-900 border border-zinc-700">
              <Palette className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
              <span style={{ color: currentAccent.hex }}>{t('custom_title')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {t('custom_title')}
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
              {t('custom_subtitle')}
            </p>
          </div>

          <button
            onClick={() => setIsCustomModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition cursor-pointer shrink-0"
            title={t('btn_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('language')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'language'
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            style={{
              backgroundColor: activeTab === 'language' ? currentAccent.hex : 'transparent',
            }}
          >
            <FlagIcon language={language} size="sm" className="rounded-sm" />
            <span>{t('custom_tab_language')}</span>
          </button>

          <button
            onClick={() => setActiveTab('accent')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'accent'
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            style={{
              backgroundColor: activeTab === 'accent' ? currentAccent.hex : 'transparent',
            }}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span>{t('custom_tab_accent')}</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'theme'
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            style={{
              backgroundColor: activeTab === 'theme' ? currentAccent.hex : 'transparent',
            }}
          >
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span>{t('custom_tab_background')}</span>
          </button>

          <button
            onClick={() => setActiveTab('font')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'font'
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            style={{
              backgroundColor: activeTab === 'font' ? currentAccent.hex : 'transparent',
            }}
          >
            <Type className="w-3.5 h-3.5 shrink-0" />
            <span>{t('custom_tab_font')}</span>
          </button>

          <button
            onClick={() => setActiveTab('size')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'size'
                ? 'text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            style={{
              backgroundColor: activeTab === 'size' ? currentAccent.hex : 'transparent',
            }}
          >
            <Maximize className="w-3.5 h-3.5 shrink-0" />
            <span>{t('custom_tab_fontsize')}</span>
          </button>
        </div>

        {/* Tab 1: LANGUAGE */}
        {activeTab === 'language' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <FlagIcon language={language} size="md" className="rounded-sm" />
                {t('custom_language_title')}
              </h3>
              <p className="text-xs text-zinc-400">{t('custom_language_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Portuguese (PT-BR) */}
              <button
                onClick={() => setLanguage('pt')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                  language === 'pt'
                    ? 'bg-zinc-900 border-2 shadow-xl'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
                style={{
                  borderColor: language === 'pt' ? currentAccent.hex : undefined,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <FlagIcon language="pt" size="xl" className="rounded-md shadow-md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-white">Português (Brasil)</h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        PT-BR
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Padrão Nacional • FPStudio Salvador</p>
                  </div>
                </div>
                {language === 'pt' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-black font-black shrink-0 ml-2"
                    style={{ backgroundColor: currentAccent.hex }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* English (EN-US) */}
              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                  language === 'en'
                    ? 'bg-zinc-900 border-2 shadow-xl'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
                style={{
                  borderColor: language === 'en' ? currentAccent.hex : undefined,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <FlagIcon language="en" size="xl" className="rounded-md shadow-md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-white">English (US)</h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        EN-US
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">International Production Mode</p>
                  </div>
                </div>
                {language === 'en' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-black font-black shrink-0 ml-2"
                    style={{ backgroundColor: currentAccent.hex }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: ACCENT COLOR */}
        {activeTab === 'accent' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: currentAccent.hex }} />
                {t('custom_accent_title')}
              </h3>
              <p className="text-xs text-zinc-400">{t('custom_accent_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {ACCENT_COLOR_OPTIONS.map((opt) => {
                const isSelected = accentColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAccentColor(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-2 shadow-xl'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{
                      borderColor: isSelected ? opt.hex : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full shadow-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: opt.hex,
                          boxShadow: `0 0 14px ${opt.hex}60`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-black font-bold" />}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-white">
                          {language === 'en' ? opt.nameEn : opt.namePt}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">{opt.hex}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: THEME BACKGROUND */}
        {activeTab === 'theme' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <Moon className="w-4 h-4" style={{ color: currentAccent.hex }} />
                {t('custom_bg_title')}
              </h3>
              <p className="text-xs text-zinc-400">{t('custom_bg_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {THEME_STYLE_OPTIONS.map((opt) => {
                const isSelected = themeStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setThemeStyle(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? 'border-2 shadow-2xl'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{
                      backgroundColor: opt.cardHex,
                      borderColor: isSelected ? currentAccent.hex : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-lg border border-zinc-700"
                          style={{ backgroundColor: opt.bgHex }}
                        />
                        <h4 className="font-black text-xs text-white">
                          {language === 'en' ? opt.nameEn : opt.namePt}
                        </h4>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                          style={{ backgroundColor: currentAccent.hex }}
                        >
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {language === 'en' ? opt.descEn : opt.descPt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: FONT FAMILY */}
        {activeTab === 'font' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <Type className="w-4 h-4" style={{ color: currentAccent.hex }} />
                {t('custom_font_title')}
              </h3>
              <p className="text-xs text-zinc-400">{t('custom_font_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {FONT_FAMILY_OPTIONS.map((opt) => {
                const isSelected = fontFamily === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFontFamily(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-2 shadow-xl'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{
                      borderColor: isSelected ? currentAccent.hex : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-white">
                        {language === 'en' ? opt.nameEn : opt.namePt}
                      </h4>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                          style={{ backgroundColor: currentAccent.hex }}
                        >
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      )}
                    </div>
                    {/* Visual Font Sample */}
                    <div
                      className="text-base sm:text-lg font-black text-zinc-200 tracking-tight"
                      style={{ fontFamily: opt.cssFamily }}
                    >
                      FPStudio Salvador
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {language === 'en' ? opt.descEn : opt.descPt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: FONT SIZE SCALE */}
        {activeTab === 'size' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <Maximize className="w-4 h-4" style={{ color: currentAccent.hex }} />
                {t('custom_size_title')}
              </h3>
              <p className="text-xs text-zinc-400">{t('custom_size_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {FONT_SIZE_OPTIONS.map((opt) => {
                const isSelected = fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-2 shadow-xl'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{
                      borderColor: isSelected ? currentAccent.hex : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-black px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${currentAccent.hex}25`,
                            color: currentAccent.hex,
                          }}
                        >
                          {opt.scalePercent}
                        </span>
                        <h4 className="font-black text-xs text-white">
                          {language === 'en' ? opt.nameEn : opt.namePt}
                        </h4>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                          style={{ backgroundColor: currentAccent.hex }}
                        >
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {language === 'en' ? opt.descEn : opt.descPt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Interactive Preview Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
              <span className="text-xs font-black uppercase text-zinc-300">
                {t('custom_preview_title')}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {currentFont.namePt} • {currentSize.scalePercent} • {language.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                style={{
                  backgroundColor: `${currentAccent.hex}18`,
                  color: currentAccent.hex,
                  borderColor: `${currentAccent.hex}40`,
                }}
              >
                {t('custom_preview_sample_badge')}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                {currentAccent.namePt}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              {t('custom_preview_sample_heading')}
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('custom_preview_sample_text')}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                className="px-4 py-2 rounded-xl text-black font-black text-xs transition shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: currentAccent.hex,
                  boxShadow: `0 0 18px ${currentAccent.hex}40`,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('btn_book_now')}</span>
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold text-xs hover:border-zinc-500 transition"
              >
                {t('btn_request_quote')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('custom_btn_reset')}</span>
          </button>

          <button
            onClick={() => setIsCustomModalOpen(false)}
            className="px-6 py-2.5 rounded-xl text-black font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg"
            style={{
              backgroundColor: currentAccent.hex,
              boxShadow: `0 0 16px ${currentAccent.hex}45`,
            }}
          >
            <Check className="w-4 h-4 font-bold" />
            <span>{t('custom_btn_apply')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
