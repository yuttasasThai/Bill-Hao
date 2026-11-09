import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Wallet,
  Clock,
  Calendar,
  Search,
  FileSpreadsheet,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DailyExpense } from '../types';

interface DailyDetailsViewProps {
  expenses: DailyExpense[];
  onBack: () => void;
  onOpenAddModal: () => void;
  onEditExpense: (expense: DailyExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const DailyDetailsView: React.FC<DailyDetailsViewProps> = ({
  expenses,
  onBack,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
}) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const todayStr = getToday();

  const [dateFilterMode, setDateFilterMode] = useState<'today' | '7days' | 'month' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(todayStr);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const formatBaht = (num: number) =>
    new Intl.NumberFormat('th-TH').format(Math.round(num));

  // Current calculations
  // 5) ยอดรายจ่ายรายวันจะเริ่มต้นใหม่ทุกวัน (Today only)
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const currentMonthStr = todayStr.substring(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter calculations
  const nowMs = Date.now();
  const sevenDaysAgoStr = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filtered = expenses
    .filter((e) => {
      let dateMatch = true;
      if (dateFilterMode === 'today') dateMatch = e.date === todayStr;
      else if (dateFilterMode === '7days') dateMatch = e.date >= sevenDaysAgoStr && e.date <= todayStr;
      else if (dateFilterMode === 'month') dateMatch = e.date.startsWith(currentMonthStr);
      else if (dateFilterMode === 'custom') dateMatch = e.date === customDate;

      const searchMatch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = categoryFilter === 'all' ? true : e.category === categoryFilter;

      return dateMatch && searchMatch && categoryMatch;
    })
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const totalFilteredSum = filtered.reduce((sum, e) => sum + e.amount, 0);

  const categories = Array.from(new Set(expenses.map((e) => e.category)));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ลำดับ', 'วันที่', 'เวลา', 'รายการ', 'หมวดหมู่', 'วิธีชำระ', 'จำนวนเงิน(บาท)', 'หมายเหตุ'];
    const rows = filtered.map((e, idx) => [
      idx + 1,
      e.date,
      e.time || '-',
      `"${e.name.replace(/"/g, '""')}"`,
      e.category,
      e.paymentMethod,
      e.amount,
      `"${(e.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BillHao_Daily_${dateFilterMode}_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2.5 space-y-3 animate-fade-in pb-20">
      {/* Top Header & Excel Ribbon */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับ</span>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight flex items-center gap-1">
                ตาราง Excel รายจ่ายรายวัน
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Sheet: Daily_Journal_{todayStr}.xlsx
              </span>
            </div>
          </div>
        </div>

        {/* Actions: Export & Add */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="ส่งออกตารางรายวันเป็น Excel/CSV"
          >
            <Download className="w-3 h-3 text-orange-700" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>บันทึกจ่าย</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-orange-50/80 p-2.5 rounded-xl border border-orange-200 shadow-2xs">
          <span className="text-[10px] text-orange-800 font-medium block">
            รายจ่ายวันนี้ (เริ่มต้นใหม่ทุกวัน)
          </span>
          <span className="text-base font-extrabold text-orange-950 font-mono">
            ฿{formatBaht(todayTotal)}
          </span>
          <span className="text-[10px] text-orange-700 block mt-0.5">
            {todayExpenses.length} รายการวันนี้
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block">
            รวมเดือนนี้ ({currentMonthStr})
          </span>
          <span className="text-base font-bold text-slate-900 font-mono">
            ฿{formatBaht(monthTotal)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            สะสม {monthExpenses.length} ครั้ง
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block">
            ยอดรวมในตารางที่แสดง
          </span>
          <span className="text-base font-bold text-orange-900 font-mono">
            ฿{formatBaht(totalFilteredSum)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            จาก {filtered.length} รายการ
          </span>
        </div>

        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xs">
          <span className="text-[10px] text-slate-400 font-medium block">
            ข้อมูลในระบบทั้งหมด
          </span>
          <span className="text-base font-bold text-orange-400 font-mono">
            {expenses.length} รายการ
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            บันทึกประวัติย้อนหลังครบ
          </span>
        </div>
      </div>

      {/* Filter and Date Tabs Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5">
          <button
            onClick={() => setDateFilterMode('today')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              dateFilterMode === 'today'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            วันนี้ ({todayExpenses.length})
          </button>
          <button
            onClick={() => setDateFilterMode('7days')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              dateFilterMode === '7days'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setDateFilterMode('month')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              dateFilterMode === 'month'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            เดือนนี้ ({monthExpenses.length})
          </button>
          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              dateFilterMode === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({expenses.length})
          </button>
          <button
            onClick={() => setDateFilterMode('custom')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              dateFilterMode === 'custom'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            เลือกวัน 📅
          </button>

          {dateFilterMode === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-2 py-0.5 rounded border border-slate-300 text-xs text-slate-800"
            />
          )}
        </div>

        {/* Search & Category */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายจ่าย เช่น กาแฟ, ข้าวกลางวัน, เติมน้ำมัน..."
              className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ========================================================
          6) โครงสร้างตาราง EXCEL รายจ่ายรายวัน กะทัดรัด ไม่ต้องเลื่อนเยอะ
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        {/* Excel Formula Header Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-slate-600">
          <span className="font-bold text-slate-500">fx</span>
          <span className="text-slate-800 font-semibold truncate">
            =SUM(Daily_Expenses!F2:F{filtered.length + 1}) = ฿{formatBaht(totalFilteredSum)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold text-[11px]">
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200">#</th>
                <th className="py-2 px-2.5 border-r border-slate-200">วันที่ / เวลา</th>
                <th className="py-2 px-2.5 border-r border-slate-200">รายการค่าใช้จ่าย</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">หมวดหมู่</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">วิธีชำระ</th>
                <th className="py-2 px-2.5 border-r border-slate-200 text-right">จำนวนเงิน (บาท)</th>
                <th className="py-2 px-2 border-r border-slate-200">บันทึกย่อ</th>
                <th className="py-2 px-2 text-center w-16">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    ไม่พบรายการรายจ่ายตามเงื่อนไขที่เลือก (กด "บันทึกจ่าย" เพื่อเพิ่มรายการ)
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-orange-50/40 transition-colors ${
                      item.date === todayStr ? 'bg-orange-50/20' : 'bg-white'
                    }`}
                  >
                    <td className="py-1.5 px-2.5 text-center font-mono text-slate-400 border-r border-slate-200 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        {item.date === todayStr ? 'วันนี้' : item.date}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {item.time || '12:00'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 font-semibold text-slate-900 border-r border-slate-200">
                      {item.name}
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 text-[10px]">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 text-[10px]">
                      <span className="bg-teal-50 text-teal-800 font-medium px-1.5 py-0.5 rounded">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-orange-950 border-r border-slate-200">
                      -฿{formatBaht(item.amount)}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-[10px] text-slate-500 truncate max-w-[140px]">
                      {item.note || '-'}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditExpense(item)}
                          className="p-1 rounded text-slate-500 hover:text-orange-700 hover:bg-slate-100"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบรายการ "${item.name}" ใช่หรือไม่?`)) {
                              onDeleteExpense(item.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="ลบ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Excel Grand Total Row */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={5} className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-xs">
                  รวมรายจ่ายตามที่เลือกทั้งสิ้น (AutoSum):
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-base font-black text-orange-900 border-r border-slate-200">
                  ฿{formatBaht(totalFilteredSum)}
                </td>
                <td colSpan={2} className="py-2.5 px-2 text-center text-[10px] text-slate-500 font-medium">
                  {filtered.length} รายการ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
