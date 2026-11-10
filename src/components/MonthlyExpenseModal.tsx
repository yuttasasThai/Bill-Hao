import React, { useState, useEffect } from 'react';
import { X, Receipt, Calculator, Save, Trash2 } from 'lucide-react';
import { MonthlyExpense } from '../types';

interface MonthlyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<MonthlyExpense, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialData?: MonthlyExpense | null;
}

const CATEGORIES = [
  'ยานพาหนะ',
  'ที่อยู่อาศัย',
  'สาธารณูปโภค (น้ำ/ไฟ/เน็ต)',
  'ประกันภัย',
  'บัตรเครดิต/สินเชื่อ',
  'การศึกษา/ครอบครัว',
  'อื่นๆ',
];

export const MonthlyExpenseModal: React.FC<MonthlyExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currentInstallment, setCurrentInstallment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [remainingInstallments, setRemainingInstallments] = useState('');
  const [dueDate, setDueDate] = useState('5');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isPaid, setIsPaid] = useState(false);
  const [hasInstallments, setHasInstallments] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setCurrentInstallment(
        initialData.currentInstallment > 0 ? String(initialData.currentInstallment) : ''
      );
      setTotalInstallments(
        initialData.totalInstallments > 0 ? String(initialData.totalInstallments) : ''
      );
      setRemainingBalance(
        initialData.remainingBalance > 0 ? String(initialData.remainingBalance) : ''
      );
      setRemainingInstallments(
        initialData.remainingInstallments > 0 ? String(initialData.remainingInstallments) : ''
      );
      setDueDate(String(initialData.dueDate || 5));
      setCategory(initialData.category || CATEGORIES[0]);
      setIsPaid(initialData.isPaid);
      setHasInstallments(initialData.totalInstallments > 0);
    } else {
      // Defaults for new item
      setName('');
      setAmount('');
      setCurrentInstallment('1');
      setTotalInstallments('12');
      setRemainingBalance('');
      setRemainingInstallments('12');
      setDueDate('5');
      setCategory(CATEGORIES[0]);
      setIsPaid(false);
      setHasInstallments(true);
    }
  }, [initialData, isOpen]);

  // Auto-calculate remaining installments and remaining balance when inputs change
  const handleAutoCalc = () => {
    const pAmount = parseFloat(amount) || 0;
    const curInst = parseInt(currentInstallment, 10) || 0;
    const totInst = parseInt(totalInstallments, 10) || 0;

    if (totInst > 0 && curInst > 0 && totInst >= curInst) {
      const remInst = totInst - curInst + 1; // including current one
      setRemainingInstallments(String(remInst));
      if (!remainingBalance || remainingBalance === '0') {
        setRemainingBalance(String(remInst * pAmount));
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pAmount = Math.max(0, parseFloat(amount) || 0);
    const curInst = hasInstallments ? Math.max(0, parseInt(currentInstallment, 10) || 0) : 0;
    const totInst = hasInstallments ? Math.max(0, parseInt(totalInstallments, 10) || 0) : 0;
    const remBal = Math.max(0, parseFloat(remainingBalance) || 0);
    const remInst = hasInstallments
      ? Math.max(0, parseInt(remainingInstallments, 10) || 0)
      : 0;

    onSave(
      {
        name: name.trim(),
        amount: pAmount,
        currentInstallment: curInst,
        totalInstallments: totInst,
        remainingBalance: remBal,
        remainingInstallments: remInst,
        dueDate: Math.min(31, Math.max(1, parseInt(dueDate, 10) || 1)),
        isPaid,
        category,
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialData ? 'แก้ไขรายการประจำเดือน' : 'เพิ่มรายการประจำเดือน / ค่างวด (1.2.1)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                บันทึกยอดชำระ, งวด, สรุปยอดคงเหลือ, งวดคงเหลือ
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
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อรายการประจำเดือน *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ค่างวดรถยนต์, ค่าผ่อนบ้าน, ค่าเน็ต, ประกันชีวิต"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยอดชำระ (บาท/เดือน) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ฿
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={handleAutoCalc}
                  placeholder="8,500"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Installment Switch */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  เป็นรายการผ่อนชำระแบบมีงวด
                </p>
                <p className="text-[11px] text-slate-500">
                  {hasInstallments
                    ? 'มีจำนวนงวดและยอดหนี้คงเหลือ'
                    : 'จ่ายประจำทุกเดือนไม่มีวันหมด (เช่น ค่าน้ำไฟ, ค่าเน็ต)'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInstallments}
                  onChange={(e) => setHasInstallments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Installment Details (If hasInstallments) */}
          {hasInstallments && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 font-semibold border-b border-slate-200 pb-1.5">
                <span>ข้อมูลงวดและการผ่อนชำระ</span>
                <button
                  type="button"
                  onClick={handleAutoCalc}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                >
                  <Calculator className="w-3 h-3" />
                  คำนวณอัตโนมัติ
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    งวดที่ปัจจุบัน (งวดที่)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
                    onBlur={handleAutoCalc}
                    placeholder="เช่น 24"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    จากทั้งหมด (จำนวนงวด)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    onBlur={handleAutoCalc}
                    placeholder="เช่น 48"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    งวดคงเหลือ (งวด) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    placeholder="เช่น 24"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    สรุปยอดคงเหลือ (บาท) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={remainingBalance}
                    onChange={(e) => setRemainingBalance(e.target.value)}
                    placeholder="เช่น 204,000"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-emerald-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Due date & Current payment status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันครบกำหนดชำระ (ของทุกเดือน)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">วันที่</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะเดือนนี้
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    !isPaid
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  รอชำระ
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  ชำระแล้ว ✓
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`ต้องการลบรายการ "${initialData.name}" ใช่หรือไม่?`)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบรายการ</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มรายการประจำเดือน'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
