import React, { useState } from 'react';
import { QrCode, Copy, Check, Upload, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { PixQuote, BookingRequest } from '../types';
import { formatBRL } from '../utils/exportUtils';
import fpStudioLogo from '../assets/images/fpstudio_logo_1786495953533.jpg';

interface PIXModalProps {
  quote: PixQuote;
  booking: BookingRequest;
  onClose: () => void;
  onSendReceipt: (fileDataUrl: string, fileName: string) => void;
}

export const PIXModal: React.FC<PIXModalProps> = ({ quote, booking, onClose, onSendReceipt }) => {
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(quote.pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          url: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSendReceipt = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setTimeout(() => {
      onSendReceipt(selectedFile.url, selectedFile.name);
      setIsUploading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={fpStudioLogo}
              alt="FPStudio Logo"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/60 shadow-lg ring-2 ring-indigo-500/20 shrink-0"
            />
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                Pagamento via PIX <QrCode className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Reserva de Horário - FPStudio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Box */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                Valor Total do Agendamento
              </p>
              <h2 className="text-2xl font-black text-indigo-600">
                {formatBRL(quote.totalAmount)}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {booking.serviceName} • {booking.roomName}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> PIX Instantâneo
              </span>
            </div>
          </div>

          {/* QR Code Graphic & Instructions */}
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie a chave PIX:
            </p>
            
            <div className="inline-block p-4 bg-white border-2 border-indigo-500 rounded-2xl shadow-sm">
              {/* Generated QR Code Graphic SVG */}
              <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="white" />
                {/* Simulated QR Code matrix pattern */}
                <rect x="10" y="10" width="50" height="50" fill="#0f172a" />
                <rect x="20" y="20" width="30" height="30" fill="white" />
                <rect x="25" y="25" width="20" height="20" fill="#059669" />

                <rect x="140" y="10" width="50" height="50" fill="#0f172a" />
                <rect x="150" y="20" width="30" height="30" fill="white" />
                <rect x="155" y="25" width="20" height="20" fill="#059669" />

                <rect x="10" y="140" width="50" height="50" fill="#0f172a" />
                <rect x="20" y="150" width="30" height="30" fill="white" />
                <rect x="25" y="155" width="20" height="20" fill="#059669" />

                {/* Random Matrix Dots */}
                <rect x="70" y="15" width="15" height="15" fill="#0f172a" />
                <rect x="95" y="15" width="25" height="15" fill="#059669" />
                <rect x="70" y="40" width="30" height="10" fill="#0f172a" />

                <rect x="15" y="70" width="20" height="20" fill="#0f172a" />
                <rect x="45" y="70" width="30" height="15" fill="#059669" />
                <rect x="80" y="70" width="40" height="20" fill="#0f172a" />
                <rect x="130" y="70" width="25" height="25" fill="#059669" />
                <rect x="165" y="70" width="20" height="15" fill="#0f172a" />

                <rect x="20" y="100" width="35" height="15" fill="#059669" />
                <rect x="65" y="100" width="20" height="30" fill="#0f172a" />
                <rect x="95" y="100" width="40" height="20" fill="#059669" />
                <rect x="145" y="100" width="40" height="20" fill="#0f172a" />

                <rect x="70" y="140" width="20" height="40" fill="#0f172a" />
                <rect x="100" y="130" width="30" height="20" fill="#059669" />
                <rect x="140" y="140" width="45" height="45" fill="#0f172a" />
                <rect x="150" y="150" width="25" height="25" fill="white" />
                <rect x="158" y="158" width="10" height="10" fill="#059669" />
              </svg>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                Beneficiário: FPStudio - Nubank ({quote.pixKeyType || 'CPF/PIX'})
              </p>
            </div>
          </div>

          {/* PIX Copia e Cola Payload Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              PIX Copia e Cola:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={quote.pixPayload}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyPix}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Upload Comprovante Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" /> Anexar Comprovante do Pagamento:
              </label>
              <span className="text-[10px] text-slate-500">Formato: PNG, JPG ou PDF</span>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/50 relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                  <FileText className="w-5 h-5" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">Pronto</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Clique aqui ou arraste o arquivo do comprovante
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Ao enviar, o estúdio receberá o alerta no chat em tempo real
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <button
                onClick={handleConfirmSendReceipt}
                disabled={isUploading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm"
              >
                {isUploading ? (
                  <span>Enviando Comprovante...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Enviar Comprovante via Chat
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info footer */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              Após a confirmação do comprovante pela equipe do estúdio, a reserva será efetivada automaticamente e o comprovante PDF ficará disponível na sua conta.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
