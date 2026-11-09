import React, { useState } from 'react';
import { X, Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize input: accept with or without dashes
    const cleanInput = password.replace(/[^0-9]/g, '');
    const targetClean = '0992256601';

    if (cleanInput === targetClean || password.trim() === '099-225-6601') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            เข้าสู่ระบบผู้ดูแล (Admin Login)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบตั้งค่าแอดมิน
          </p>
        </div>

        {/* Password Form with type="password" (masked digits) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่านแอดมิน (Admin Password)
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="กรอกรหัสผ่าน (ตัวเลขถูกซ่อน)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-shake">
                <AlertCircle className="w-3.5 h-3.5" />
                รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <span>ยืนยันเข้าสู่ระบบ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
