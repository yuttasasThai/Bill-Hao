import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Receipt,
  CheckCircle2,
  Edit2,
  Trash2,
  Search,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { MonthlyExpense, DailyExpense } from '../types';

interface MonthlyDetailsViewProps {
  expenses: MonthlyExpense[];
  dailyExpenses: DailyExpense[];
  onBack: () => void;
  onOpenAddModal: () => void;
  onEditExpense: (expense: MonthlyExpense) => void;
  onDeleteExpense: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const MonthlyDetailsView: React.FC<MonthlyDetailsViewProps> = ({
  expenses,
  dailyExpenses,
  onBack,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.substring(0, 7));

  const formatBaht = (num: number) =>
    new Intl.NumberFormat('th-TH').format(Math.round(num));

  // 4) รายการของรายเดือนประกอบด้วย:
  // 1. รายจ่ายประจำเดือนที่สร้างเอง
  // 2. ยอดรายจ่ายประจำวันสะสมของเดือนนี้
  // 3. ยอดรายจ่ายประจำวันสะสมจะหายไปเมื่อเริ่มต้นเดือนใหม่
  const monthDailyExpenses = dailyExpenses.filter((e) =>
    e.date.startsWith(selectedMonth)
  );
  const monthDailyAccumulatedTotal = monthDailyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // Calculations for custom monthly expenses
  const totalCommitted = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidItems = expenses.filter((e) => e.isPaid);
  const paidAmount = paidItems.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = totalCommitted - paidAmount;
  const totalRemainingDebt = expenses.reduce((sum, e) => sum + e.remainingBalance, 0);

  // Grand Total of this Month = Monthly expenses + Accumulated Daily expenses
  const grandTotalMonthSpent = totalCommitted + monthDailyAccumulatedTotal;

  // Filtered expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'paid'
        ? e.isPaid
        : !e.isPaid;
    return matchesSearch && matchesStatus;
  });

  // Export as CSV helper
  const handleExportCSV = () => {
    const headers = ['ลำดับ', 'รายการ', 'หมวดหมู่', 'ยอดชำระ(บาท)', 'งวด', 'งวดคงเหลือ', 'ยอดหนี้คงเหลือ', 'วันครบกำหนด', 'สถานะ'];
    const rows = expenses.map((e, idx) => [
      idx + 1,
      `"${e.name.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.totalInstallments > 0 ? `${e.currentInstallment}/${e.totalInstallments}` : 'จ่ายประจำ',
      e.remainingInstallments,
      e.remainingBalance,
      `วันที่ ${e.dueDate}`,
      e.isPaid ? 'ชำระแล้ว' : 'รอชำระ',
    ]);
    rows.push([
      expenses.length + 1,
      `"ยอดรายจ่ายประจำวันสะสมเดือน ${selectedMonth}"`,
      'รายวันสะสม',
      monthDailyAccumulatedTotal,
      '-',
      '-',
      '-',
      '-',
      'ตามยอดจริง',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BillHao_Monthly_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2.5 space-y-3 animate-fade-in pb-20">
      {/* Top Navigation & Excel Ribbon Header */}
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
            <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight flex items-center gap-1">
                ตาราง Excel รายจ่ายรายเดือน
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Sheet: Monthly_Ledger_{selectedMonth}.xlsx
              </span>
            </div>
          </div>
        </div>

        {/* Actions: Month Picker, CSV, + Add */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium text-slate-700 bg-slate-50"
          />
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="ส่งออกเป็นไฟล์ Excel/CSV"
          >
            <Download className="w-3 h-3 text-emerald-700" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มค่างวด</span>
          </button>
        </div>
      </div>

      {/* Excel Formula Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block">
            1. รายจ่ายประจำเดือน
          </span>
          <span className="text-base font-bold text-blue-900 font-mono">
            ฿{formatBaht(totalCommitted)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {expenses.length} รายการที่สร้างเอง
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block">
            2. รายจ่ายประจำวันสะสม
          </span>
          <span className="text-base font-bold text-orange-900 font-mono">
            ฿{formatBaht(monthDailyAccumulatedTotal)}
          </span>
          <span className="text-[10px] text-orange-600 font-medium block mt-0.5 truncate">
            {monthDailyExpenses.length} ครั้ง (รีเซ็ตเมื่อขึ้นเดือนใหม่)
          </span>
        </div>

        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[10px] text-emerald-800 font-medium block">
            ชำระแล้ว / รอชำระ
          </span>
          <div className="flex items-center gap-1.5 font-bold font-mono text-xs mt-0.5">
            <span className="text-emerald-700">฿{formatBaht(paidAmount)}</span>
            <span>/</span>
            <span className="text-amber-700">฿{formatBaht(pendingAmount)}</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5">
            จ่ายแล้ว {paidItems.length} | รอ {expenses.length - paidItems.length}
          </span>
        </div>

        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xs">
          <span className="text-[10px] text-slate-300 font-medium block">
            3. รวมจ่ายทั้งสิ้น (Grand Total)
          </span>
          <span className="text-base font-extrabold text-emerald-400 font-mono">
            ฿{formatBaht(grandTotalMonthSpent)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ภาระหนี้คงค้าง ฿{formatBaht(totalRemainingDebt)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อรายการ เช่น งวดรถ, ผ่อนบ้าน..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            รอชำระ
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ชำระแล้ว
          </button>
        </div>
      </div>

      {/* ========================================================
          6) โครงสร้างตาราง EXCEL ชัดเจน กะทัดรัด ไม่ต้องเลื่อนเยอะ
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        {/* Excel Formula Header Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-slate-600">
          <span className="font-bold text-slate-500">fx</span>
          <span className="text-slate-800 font-semibold truncate">
            =SUM(ค่างวดประจำเดือน:฿{formatBaht(totalCommitted)} + รายวันสะสม:฿{formatBaht(monthDailyAccumulatedTotal)})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold text-[11px]">
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200">#</th>
                <th className="py-2 px-2.5 border-r border-slate-200">รายการประจำเดือน</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">งวด</th>
                <th className="py-2 px-2.5 border-r border-slate-200 text-right">ยอดชำระ (บาท)</th>
                <th className="py-2 px-2.5 border-r border-slate-200 text-right">หนี้คงเหลือ</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">กำหนด</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">สถานะ</th>
                <th className="py-2 px-2 text-center w-16">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    item.isPaid ? 'bg-emerald-50/20' : 'bg-white'
                  }`}
                >
                  <td className="py-1.5 px-2.5 text-center font-mono text-slate-400 border-r border-slate-200 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-2.5 font-semibold text-slate-900 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className={item.isPaid ? 'line-through text-slate-500' : ''}>
                        {item.name}
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-normal">
                        {item.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono text-[11px]">
                    {item.totalInstallments > 0 ? (
                      <span className="text-blue-900 font-medium">
                        {item.currentInstallment}/{item.totalInstallments}
                      </span>
                    ) : (
                      <span className="text-slate-400">ประจำ</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                    ฿{formatBaht(item.amount)}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-600 border-r border-slate-200 text-[11px]">
                    ฿{formatBaht(item.remainingBalance)}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 text-[10px] text-slate-500">
                    ทุกวันที่ {item.dueDate}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(item.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        item.isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                      title="กดเพื่อสลับสถานะชำระแล้ว/รอชำระ"
                    >
                      {item.isPaid ? 'ชำระแล้ว ✓' : 'รอชำระ'}
                    </button>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditExpense(item)}
                        className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100"
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
              ))}

              {/* 4.2) [แถวพิเศษ Excel] ยอดรายจ่ายประจำวันสะสมประจำเดือนนี้ */}
              <tr className="bg-orange-50/70 border-t-2 border-orange-200 font-medium text-orange-950">
                <td className="py-2 px-2.5 text-center font-mono text-orange-800 border-r border-slate-200 font-bold">
                  ★
                </td>
                <td className="py-2 px-2.5 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-orange-900">
                      2. ยอดรายจ่ายประจำวันสะสม (เดือน {selectedMonth})
                    </span>
                    <span className="text-[9px] bg-orange-200/90 text-orange-900 px-1 py-0.2 rounded font-semibold">
                      Auto-Daily
                    </span>
                  </div>
                  <p className="text-[10px] text-orange-800/80 font-normal mt-0.5">
                    สะสมจากบันทึกรายวันทั้งหมดในเดือนนี้ (จะหายไปและเริ่มต้นใหม่เมื่อขึ้นเดือนใหม่)
                  </p>
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-orange-800">
                  {monthDailyExpenses.length} ครั้ง
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-extrabold text-orange-900 border-r border-slate-200 text-sm">
                  ฿{formatBaht(monthDailyAccumulatedTotal)}
                </td>
                <td className="py-2 px-2.5 text-right font-mono text-orange-700 border-r border-slate-200 text-[11px]">
                  -
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-200 text-[10px] text-orange-800">
                  ตามวันจริง
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-200">
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded">
                    จ่ายแล้วจริง
                  </span>
                </td>
                <td className="py-2 px-2 text-center text-slate-400 text-[10px]">
                  ระบบรวม
                </td>
              </tr>
            </tbody>

            {/* Excel Grand Total Row (AutoSum) */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-xs">
                  รวมรายจ่ายประจำเดือนทั้งสิ้น (Grand Total):
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-base font-black text-emerald-800 border-r border-slate-200">
                  ฿{formatBaht(grandTotalMonthSpent)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-xs text-slate-700 border-r border-slate-200">
                  ฿{formatBaht(totalRemainingDebt)}
                </td>
                <td colSpan={3} className="py-2.5 px-2 text-center text-[10px] text-slate-500 font-medium">
                  {expenses.length} ค่างวด + รายวันสะสม
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
