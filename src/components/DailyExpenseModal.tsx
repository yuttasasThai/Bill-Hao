import React, { useState, useEffect } from 'react';
import { X, Wallet, Save, Trash2, Calendar, Clock } from 'lucide-react';
import { DailyExpense } from '../types';
import { getTodayDateString } from '../services/storage';

interface DailyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<DailyExpense, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialData?: DailyExpense | null;
}

const CATEGORIES = [
  'อาหาร',
  'เครื่องดื่ม',
  'เดินทาง',
  'ของใช้',
  'สุขภาพ/ยา',
  'บันเทิง/สังสรรค์',
  'ช้อปปิ้ง',
  'บิล/ค่าบริการ',
  'อื่นๆ',
];

const PAYMENT_METHODS: Array<'เงินสด' | 'โอน/สแกน QR' | 'บัตรเครดิต/เดบิต' | 'พร้อมเพย์'> = [
  'โอน/สแกน QR',
  'เงินสด',
  'พร้อมเพย์',
  'บัตรเครดิต/เดบิต',
];

export const DailyExpenseModal: React.FC<DailyExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const getToday = () => getTodayDateString();
  const getCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'เงินสด' | 'โอน/สแกน QR' | 'บัตรเครดิต/เดบิต' | 'พร้อมเพย์'>('โอน/สแกน QR');
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState(getCurrentTime());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setCategory(initialData.category || CATEGORIES[0]);
      setPaymentMethod(initialData.paymentMethod || 'โอน/สแกน QR');
      setDate(initialData.date || getToday());
      setTime(initialData.time || getCurrentTime());
      setNote(initialData.note || '');
    } else {
      setName('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setPaymentMethod('โอน/สแกน QR');
      setDate(getToday());
      setTime(getCurrentTime());
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pAmount = Math.max(0, parseFloat(amount) || 0);
    onSave(
      {
        name: name.trim(),
        amount: pAmount,
        category,
        paymentMethod,
        date,
        time,
        note: note.trim(),
      },
      initialData?.id
    );
    onClose();
  };

  const quickCommonItems = [
    { label: 'ข้าวกะเพรา', amount: 60, cat: 'อาหาร' },
    { label: 'กาแฟเย็น', amount: 55, cat: 'เครื่องดื่ม' },
    { label: 'เติมน้ำมัน', amount: 100, cat: 'เดินทาง' },
    { label: 'เซเว่น', amount: 80, cat: 'ของใช้' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialData ? 'แก้ไขรายจ่ายประจำวัน' : 'เพิ่มรายจ่ายประจำวัน (1.4.1)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                บันทึกค่าใช้จ่ายทันทีหลังจ่ายเงินเพื่อคุมงบ
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

        {/* Quick Picks for Fast Entry */}
        {!initialData && (
          <div className="px-5 pt-3 pb-1 border-b border-slate-100 bg-slate-50/40">
            <p className="text-[10px] text-slate-500 font-medium mb-1.5">
              เลือกด่วน:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickCommonItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setName(item.label);
                    setAmount(String(item.amount));
                    setCategory(item.cat);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-teal-500 hover:text-teal-700 transition-colors shadow-2xs"
                >
                  {item.label} ({item.amount}฿)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อรายการค่าใช้จ่าย *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ข้าวหมูกรอบ, ค่าน้ำมัน, ชาเขียว"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="60"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {/* Quick add buttons */}
            <div className="flex gap-1.5 mt-2">
              {[20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String((parseFloat(amount) || 0) + val))}
                  className="flex-1 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as 'เงินสด' | 'โอน/สแกน QR' | 'บัตรเครดิต/เดบิต' | 'พร้อมเพย์')
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                เวลา
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกเพิ่มเติม (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ร้านลุงหนวด, เลี้ยงเพื่อนร่วมงาน"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
            />
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
                <span>ลบ</span>
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
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายจ่าย'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
