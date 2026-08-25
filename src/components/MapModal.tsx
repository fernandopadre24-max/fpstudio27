import React from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Building2,
  Share2,
} from 'lucide-react';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose }) => {
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  if (!isOpen) return null;

  const addressText = "Travessa Dois Leões, 19 - Pernambués, Salvador - BA, CEP 41110-050";
  const mapEmbedUrl = "https://maps.google.com/maps?q=Travessa+Dois+Leoes+19+Pernambues+Salvador+BA+41110-050&t=&z=16&ie=UTF8&iwloc=&output=embed";
  const googleMapsRouteUrl = "https://www.google.com/maps/dir/?api=1&destination=Travessa+Dois+Leoes+19+Pernambues+Salvador+BA+41110-050";
  const wazeUrl = "https://waze.com/ul?q=Travessa+Dois+Leoes+19+Pernambues+Salvador";
  const whatsappUrl = "https://wa.me/5571981184589?text=Ol%C3%A1%20FPStudio!%20Pode%20me%20enviar%20a%20localiza%C3%A7%C3%A3o%20pelo%20WhatsApp%3F";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(addressText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <img
              src={fpStudioLogo}
              alt="FPStudio Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover border border-indigo-400/50 shadow-md ring-2 ring-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Mapa & Localização</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                  Pernambués • Salvador BA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                FPStudio • Travessa Dois Leões, 19 - CEP 41110-050
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Fechar mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Map + Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Embedded Google Map Frame */}
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl group bg-slate-950">
            <iframe
              title="FPStudio Localização no Mapa"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[20%] contrast-[110%] invert-[85%] hue-rotate-[180deg]"
            />

            {/* Custom Overlay Pin Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-xl flex items-center gap-2.5 z-10 pointer-events-none">
              <div className="p-2 bg-indigo-600 text-white rounded-lg animate-bounce">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-white">FPStudio</p>
                <p className="text-[10px] text-slate-300 font-semibold">Trav. Dois Leões, 19</p>
              </div>
            </div>
          </div>

          {/* Quick Route Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/60 hover:border-indigo-500 text-white transition shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
                  <Navigation className="w-5 h-5 transition group-hover:rotate-12" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Google Maps</p>
                  <p className="text-[11px] text-indigo-300 font-medium">Abrir rota direta de GPS</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-800/60 hover:border-blue-500 text-white transition shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
                  <Compass className="w-5 h-5 transition group-hover:rotate-45" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Waze GPS</p>
                  <p className="text-[11px] text-blue-300 font-medium">Navegar com alertas de trânsito</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800/60 hover:border-emerald-500 text-white transition shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">WhatsApp Studio</p>
                  <p className="text-[11px] text-emerald-300 font-medium">(71) 9 8118-4589</p>
                </div>
              </div>
              <Share2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            </a>
          </div>

          {/* Full Address Card */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">Endereço de Chegada</p>
                <p className="text-sm font-extrabold text-white">
                  Travessa Dois Leões, nº 19 - Bairro Pernambués
                </p>
                <p className="text-xs text-slate-300">
                  Salvador - Bahia • CEP: 41110-050
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700/80 shrink-0"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Endereço Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copiar Endereço</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
