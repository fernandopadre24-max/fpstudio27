import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AdminCredentials } from '../types';
import { AdminSecurityPanel } from './AdminSecurityPanel';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminCredentials: AdminCredentials;
  onUpdateAdminCredentials: (
    data: Partial<AdminCredentials> & {
      currentPassword?: string;
      currentPin?: string;
      newPassword?: string;
      newPin?: string;
      newEmail?: string;
    }
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  adminCredentials,
  onUpdateAdminCredentials,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0B0F19] border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer z-20"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Content */}
        <div className="relative z-10">
          <AdminSecurityPanel
            adminCredentials={adminCredentials}
            onUpdateAdminCredentials={onUpdateAdminCredentials}
          />
        </div>
      </div>
    </div>
  );
};
