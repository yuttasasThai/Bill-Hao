import React from 'react';
import { Phone, ShieldAlert, ExternalLink, X } from 'lucide-react';

interface ExpiredUserModalProps {
  isOpen: boolean;
  onClose?: () => void;
  adminPhone: string;
  adminName: string;
  userName?: string;
  isTestMode?: boolean;
}

export const ExpiredUserModal: React.FC<ExpiredUserModalProps> = ({
  isOpen,
  onClose,
  adminPhone,
  adminName,
  userName,
  isTestMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-rose-100 flex flex-col text-center p-6 space-y-4">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Headline */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
            ลิงก์การใช้งานหมดอายุ
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            ขออภัย ลิงก์ของคุณหมดอายุแล้ว
          </h3>
          {userName && (
            <p className="text-xs text-slate-500 mt-0.5">
              ผู้ใช้งาน: <span className="font-semibold text-slate-700">{userName}</span>
            </p>
          )}
        </div>

        {/* Message required by user prompt */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed text-left">
          <p className="font-medium text-slate-900 mb-1">
            📢 แจ้งเตือนการต่ออายุ:
          </p>
          <p>
            หากต้องการใช้งานต่อ กรุณาติดต่อ{' '}
            <strong className="text-rose-600 font-bold">
              admin {adminName} {adminPhone}
            </strong>
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            (เบอร์สำรอง: 099-225-601 หรือ 099-225-6601)
          </p>
        </div>

        {/* Direct Call Button */}
        <div className="space-y-2 pt-1">
          <a
            href={`tel:${adminPhone.replace(/[^0-9]/g, '')}`}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>โทรหา {adminName} ({adminPhone})</span>
          </a>

          {/* Secondary backup tel */}
          <a
            href="tel:099225601"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>โทรเบอร์สำรอง (099-225-601)</span>
          </a>
        </div>

        {/* If test mode or allow close */}
        {isTestMode && onClose && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              ปิดหน้าต่างทดสอบนี้
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
