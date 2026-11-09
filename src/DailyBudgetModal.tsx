import React, { useState } from 'react';
import { X, Clock, AlertCircle, Save } from 'lucide-react';
import { DailyBudgetConfig } from '../types';

interface DailyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: DailyBudgetConfig;
  onSave: (config: DailyBudgetConfig) => void;
}

export const DailyBudgetModal: React.FC<DailyBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(String(currentBudget.amount));
  const [warningThreshold, setWarningThreshold] = useState<number>(
    currentBudget.warningThresholdPercent
  );
  const [note, setNote] = useState<string>(currentBudget.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.max(0, parseFloat(amount) || 0);
    onSave({
      amount: parsedAmount,
      warningThresholdPercent: warningThreshold,
      note,
    });
    onClose();
  };

  const quickAmounts = [200, 300, 400, 500, 700, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ตั้งค่างบประมาณรายวัน (1.3.1)
              </h3>
              <p className="text-[11px] text-slate-500">
                กำหนดเป้าหมายค่าใช้จ่ายต่อวันเพื่อคุมวินัย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              งบประมาณรายวัน (บาท/วัน) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-lg font-bold text-slate-900"
                placeholder="500"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  ฿{q}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Threshold */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แจ้งเตือนเมื่อใช้เงินถึง (%)
            </label>
            <select
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value={70}>70% ของงบวัน</option>
              <option value={80}>80% ของงบวัน (แนะนำ)</option>
              <option value={90}>90% ของงบวัน</option>
              <option value={100}>100% (เมื่อใช้หมดงบพอดี)</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำแนะนำ / ข้อความเตือนใจ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น รวมค่าอาหารกลางวันและกาแฟ ไม่เกิน 500 บาท"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Explanation Tip */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 flex items-start gap-2 text-[11px] text-teal-900">
            <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              ระบบจะรีเซ็ตการคำนวณงบรายวันตามวันที่ปัจจุบันในเครื่องโทรศัพท์
              และเตือนสถานะเป็นสีส้ม/แดงทันทีเมื่อใช้จ่ายใกล้หรือเกินงบที่ตั้งไว้
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              บันทึกงบรายวัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
