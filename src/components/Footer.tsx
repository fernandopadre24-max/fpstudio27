import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Mail,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Compass,
  Music,
  Video,
  ShieldCheck,
  Building2,
  Maximize2,
} from 'lucide-react';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';
import { MapModal } from './MapModal';
import { useCustomization } from '../context/CustomizationContext';

export const Footer: React.FC = () => {
  const { language, currentAccent, currentTheme, currentFont } = useCustomization();
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const pixKey = "36790486534";
  const addressText = "Travessa Dois Leões, 19 - Pernambués, Salvador - BA, CEP 41110-050";
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Travessa+Dois+Leoes+19+Pernambues+Salvador+BA+41110-050";
  const wazeUrl = "https://waze.com/ul?q=Travessa+Dois+Leoes+19+Pernambues+Salvador";
  const whatsappUrl = "https://wa.me/5571981184589?text=Ol%C3%A1%20FPStudio!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20grava%C3%A7%C3%B5es%20e%20produ%C3%A7%C3%A3o.";
  const mapEmbedUrl = "https://maps.google.com/maps?q=Travessa+Dois+Leoes+19+Pernambues+Salvador+BA+41110-050&t=&z=16&ie=UTF8&iwloc=&output=embed";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(addressText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <footer
      className="text-zinc-300 border-t border-zinc-800/90 mt-16 pt-12 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors"
      style={{
        backgroundColor: currentTheme?.cardHex || '#121216',
        fontFamily: currentFont?.cssFamily || 'inherit',
      }}
    >
      {/* Background Accent Glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ backgroundColor: currentAccent?.hex || '#00FF41' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-zinc-800/80">
          
          {/* Column 1: Brand & Logo (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={fpStudioLogo}
                alt="FPStudio Logo"
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 shadow-2xl ring-4 shrink-0"
                style={{
                  borderColor: currentAccent?.hex || '#00FF41',
                  boxShadow: `0 0 25px ${currentAccent?.hex || '#00FF41'}35`,
                  outlineColor: `${currentAccent?.hex || '#00FF41'}25`,
                }}
              />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  FP<span style={{ color: currentAccent?.hex || '#00FF41' }}>STUDIO</span>
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: currentAccent?.hex || '#00FF41' }}>
                  {language === 'en' ? '(Music Production)' : '(Produção Musical)'}
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-zinc-400 border border-zinc-800 uppercase tracking-wider">
                  SALVADOR - BA
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {language === 'en'
                ? 'High-end music and audio recording studio in Salvador - BA. Specializing in vocal pitch correction, multitrack drum recording & editing, mixing, mastering, and 4K video production operated directly by Fernando Padre.'
                : 'Estúdio profissional de alta tecnologia em Salvador - BA. Especializado em gravação e afinação de voz, edição de bateria, mixagem, masterização e produção audiovisual em 4K operado diretamente por Fernando Padre.'}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border font-bold"
                style={{
                  color: currentAccent.hex,
                  borderColor: `${currentAccent.hex}40`,
                }}
              >
                <Music className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                Áudio Pro Tools
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-zinc-200 border border-zinc-700 font-bold">
                <Video className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                {language === 'en' ? '4K Video' : 'Edição 4K'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-zinc-200 border border-zinc-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                {language === 'en' ? 'VIP Service' : 'Atendimento VIP'}
              </span>
            </div>
          </div>

          {/* Column 2: Modo de Chegar / GPS & Endereço (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: `${currentAccent.hex}15`,
                    borderColor: `${currentAccent.hex}30`,
                    color: currentAccent.hex,
                  }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black tracking-tight">
                  {language === 'en' ? 'How to Get Here (GPS)' : 'Modo de Chegar (GPS)'}
                </h3>
              </div>

              <button
                onClick={() => setIsMapModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title={language === 'en' ? 'Expand Map' : 'Ampliar Mapa'}
              >
                <Maximize2 className="w-3 h-3" />
                <span>{language === 'en' ? 'Expand' : 'Ampliar'}</span>
              </button>
            </div>

            <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 space-y-3 shadow-inner">
              
              {/* Live Interactive Map Frame Preview */}
              <div
                onClick={() => setIsMapModalOpen(true)}
                className="relative w-full h-36 rounded-xl overflow-hidden border border-zinc-700/80 cursor-pointer group shadow-md bg-zinc-950"
              >
                <iframe
                  title="FPStudio Mapa Pequeno"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  loading="lazy"
                  className="w-full h-full grayscale-[30%] contrast-[110%] invert-[85%] hue-rotate-[180deg] group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-md text-white border border-zinc-700 text-xs font-black shadow-lg flex items-center gap-1.5 group-hover:scale-105 transition">
                    <MapPin className="w-3.5 h-3.5 animate-pulse" style={{ color: currentAccent.hex }} />
                    <span>{language === 'en' ? 'View Expanded Map' : 'Ver Mapa Ampliado'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: currentAccent.hex }} />
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {language === 'en' ? 'Full Address' : 'Endereço Completo'}
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Travessa Dois Leões, 19
                  </p>
                  <p className="text-xs text-zinc-300">
                    Pernambués, Salvador - BA
                  </p>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: currentAccent.hex }}>
                    CEP: 41110-050
                  </p>
                </div>
              </div>

              {/* GPS Direct Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 rounded-xl text-black font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md group"
                  style={{
                    backgroundColor: currentAccent.hex,
                  }}
                >
                  <Navigation className="w-3.5 h-3.5 transition group-hover:scale-110" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-black/70" />
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md group"
                >
                  <Compass className="w-3.5 h-3.5 transition group-hover:scale-110" />
                  <span>Waze</span>
                  <ExternalLink className="w-3 h-3 text-blue-200" />
                </a>
              </div>

              <button
                onClick={handleCopyAddress}
                className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700/60 cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">
                      {language === 'en' ? 'Address Copied!' : 'Endereço Copiado!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{language === 'en' ? 'Copy Full Address' : 'Copiar Endereço Completo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 3: Contatos & Chave PIX (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: `${currentAccent.hex}15`,
                  borderColor: `${currentAccent.hex}30`,
                  color: currentAccent.hex,
                }}
              >
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black tracking-tight">
                {language === 'en' ? 'Contact & Payments' : 'Contato & Pagamentos'}
              </h3>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Contact Box */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-zinc-900/90 hover:bg-zinc-850 p-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: `${currentAccent.hex}15`,
                        borderColor: `${currentAccent.hex}30`,
                        color: currentAccent.hex,
                      }}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {language === 'en' ? 'WhatsApp & Phone' : 'WhatsApp & Telefone'}
                      </p>
                      <p className="text-sm font-black text-white transition" style={{ color: currentAccent.hex }}>
                        (71) 9 8118-4589
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold border px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${currentAccent.hex}15`,
                      color: currentAccent.hex,
                      borderColor: `${currentAccent.hex}40`,
                    }}
                  >
                    WhatsApp
                  </span>
                </div>
              </a>

              {/* Email Box */}
              <a
                href="mailto:fpstudio2027@gmail.com"
                className="block bg-zinc-900/90 hover:bg-zinc-850 p-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {language === 'en' ? 'Official Email' : 'E-mail Oficial'}
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white transition truncate">
                      fpstudio2027@gmail.com
                    </p>
                  </div>
                </div>
              </a>

              {/* Chave PIX Nubank Box */}
              <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" style={{ color: currentAccent.hex }} />
                    <span className="text-xs font-black text-white">
                      {language === 'en' ? 'PIX Studio Key' : 'Chave PIX Studio'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Nubank
                  </span>
                </div>

                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <code className="text-xs font-mono font-bold tracking-wider" style={{ color: currentAccent.hex }}>
                    36790486534
                  </code>
                  <button
                    onClick={handleCopyPix}
                    className="px-2.5 py-1 text-black rounded-lg text-[11px] font-black transition flex items-center gap-1 shadow-sm cursor-pointer"
                    style={{ backgroundColor: currentAccent.hex }}
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>{language === 'en' ? 'Copied!' : 'Copiada!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-black" />
                        <span>{language === 'en' ? 'Copy' : 'Copiar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-400">FPStudio © 2026</span>
            <span>•</span>
            <span>
              {language === 'en'
                ? 'Recording, Music Production & Video Editing'
                : 'Gravações, Produção Musical & Edição de Vídeo'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
              <span>{language === 'en' ? 'Mon - Sat: 08:00 AM - 10:00 PM' : 'Seg - Sáb: 08:00 - 22:00'}</span>
            </div>
            <span>•</span>
            <span>Salvador - BA</span>
          </div>
        </div>

      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />
    </footer>
  );
};

