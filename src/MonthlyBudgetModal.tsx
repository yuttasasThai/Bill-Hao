import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Save } from 'lucide-react';
import { MonthlyBudgetConfig } from '../types';

interface MonthlyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: MonthlyBudgetConfig;
  onSave: (config: MonthlyBudgetConfig) => void;
}

export const MonthlyBudgetModal: React.FC<MonthlyBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(String(currentBudget.amount));
  const [month, setMonth] = useState<string>(currentBudget.month);
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
      month,
      warningThresholdPercent: warningThreshold,
      note,
    });
    onClose();
  };

  const quickAmounts = [15000, 20000, 25000, 30000, 40000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ตั้งค่างบประมาณรายเดือน (1.1.1)
              </h3>
              <p className="text-[11px] text-slate-500">
                กำหนดงบเพื่อเตือนเมื่อใช้จ่ายใกล้หรือเกินเกณฑ์
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
              งบประมาณรายเดือน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-lg font-bold text-slate-900"
                placeholder="25,000"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  +{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Month selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รอบเดือน (ปี-เดือน)
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Warning Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เตือนเมื่อใช้ถึง (%)
              </label>
              <select
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value={70}>70% ของงบ</option>
                <option value={75}>75% ของงบ</option>
                <option value={80}>80% ของงบ (แนะนำ)</option>
                <option value={85}>85% ของงบ</option>
                <option value={90}>90% ของงบ</option>
                <option value={95}>95% ของงบ</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / เป้าหมายการออม
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น พยายามคุมค่ากิน เพื่อเก็บเงินผ่อนรถ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Explanation Tip */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              ระบบจะคำนวณรายจ่ายประจำเดือนรวมกับค่าใช้จ่ายรายวันที่บันทึกในเดือนนี้
              และแสดงเป็นเปอร์เซ็นต์แจ้งเตือนที่มุมบนซ้ายของหน้าหลักทันที
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              บันทึกงบประมาณ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
