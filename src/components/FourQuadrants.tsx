import React from 'react';
import {
  Calendar,
  Clock,
  PlusCircle,
  Settings2,
  Receipt,
  Wallet,
  Phone,
} from 'lucide-react';
import {
  MonthlyBudgetConfig,
  DailyBudgetConfig,
  MonthlyExpense,
  DailyExpense,
} from '../types';

interface FourQuadrantsProps {
  monthlyBudget: MonthlyBudgetConfig;
  dailyBudget: DailyBudgetConfig;
  monthlyExpenses: MonthlyExpense[];
  dailyExpenses: DailyExpense[];
  onOpenMonthlyBudgetModal: () => void;
  onOpenMonthlyExpenseModal: () => void;
  onOpenDailyBudgetModal: () => void;
  onOpenDailyExpenseModal: () => void;
}

export const FourQuadrants: React.FC<FourQuadrantsProps> = ({
  monthlyBudget,
  dailyBudget,
  monthlyExpenses,
  dailyExpenses,
  onOpenMonthlyBudgetModal,
  onOpenMonthlyExpenseModal,
  onOpenDailyBudgetModal,
  onOpenDailyExpenseModal,
}) => {
  // 4) รายการของรายเดือนประกอบไปด้วย:
  // 1. รายจ่ายประจำเดือนที่สร้างขึ้นเอง
  // 2. ยอดรายจ่ายประจำวันสะสมของเดือนนี้
  // 3. ยอดรายจ่ายประจำวันสะสมจะหายไปเมื่อเริ่มต้นเดือนใหม่
  // 5) ยอดรายจ่ายรายวันจะเริ่มต้นใหม่ทุกวัน
  const totalMonthlyCommitted = monthlyExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const paidMonthlyAmount = monthlyExpenses
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);

  // Today string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = dailyExpenses.filter((item) => item.date === todayStr);
  const totalDailySpent = todayExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Current Month string YYYY-MM
  const currentMonthStr = todayStr.substring(0, 7);
  // Accumulated daily expenses ONLY for current month (resets automatically in new month)
  const monthDailyExpenses = dailyExpenses.filter((item) =>
    item.date.startsWith(currentMonthStr)
  );
  const monthDailyAccumulated = monthDailyExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Combined month spending: committed monthly + accumulated daily for this month
  const totalMonthCombinedSpent = totalMonthlyCommitted + monthDailyAccumulated;

  // Percentages
  const monthlyPercent = Math.round(
    (totalMonthCombinedSpent / (monthlyBudget.amount || 1)) * 100
  );
  const dailyPercent = Math.round(
    (totalDailySpent / (dailyBudget.amount || 1)) * 100
  );

  const formatBaht = (num: number) =>
    new Intl.NumberFormat('th-TH').format(Math.round(num));

  // Circular gauge rendering inside 3D card
  const renderCircularGauge = (
    percent: number,
    colorClass: string,
    strokeColor: string,
    size: number = 60,
    strokeWidth: number = 6
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPct = Math.min(Math.max(percent, 0), 100);
    const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-white/60 stroke-current opacity-40"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-xs sm:text-sm font-extrabold font-mono tracking-tight ${colorClass}`}>
            {percent}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      {/* ========================================================
          4 ช่องสี่เหลี่ยม 3D ทรงพลัง กระชับ พอดีหน้าจอมือถือ
          ฝั่งซ้าย = สีฟ้า (รายเดือน) | ฝั่งขวา = สีส้ม (รายวัน)
          ======================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* ========================================================
            1.1) มุมบนซ้าย: งบรายเดือนที่ตั้งไว้ เป็น% (พื้นหลังสีฟ้า 3D)
            ======================================================== */}
        {/* ========================================================
            1.1) มุมบนซ้าย: งบรายเดือนที่ตั้งไว้ (พื้นหลังสีฟ้า 3D)
            มีแค่ เปอร์เซ็นต์ และ ยอดที่ตั้ง (ตัดคำว่า ใช้, เหลือ, ตั้งค่า ออก)
            ======================================================== */}
        <div
          onClick={onOpenMonthlyBudgetModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenMonthlyBudgetModal();
          }}
          className="relative cursor-pointer transition-all duration-300 active:scale-[0.98] group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100/80 border border-blue-200 shadow-md shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 min-h-[175px] sm:min-h-[195px]"
        >
          {/* 3D Glass Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                งบรายเดือนที่ตั้งไว้
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {monthlyBudget.month || currentMonthStr}
              </p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-blue-100/90 text-blue-800 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Settings2 className="w-3 h-3" />
            </div>
          </div>

          {/* Center Metric & Circular Gauge (เปอร์เซ็นต์ และ ยอดที่ตั้ง) */}
          <div className="my-auto flex items-center justify-between gap-1.5 relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    monthlyPercent > 100 ? 'text-rose-600' : 'text-blue-950'
                  }`}
                >
                  {monthlyPercent}%
                </span>
                {monthlyPercent > 100 && (
                  <span className="text-[9px] bg-rose-500 text-white px-1 py-0.5 rounded-full font-bold">
                    เกิน
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-blue-900 font-mono mt-0.5">
                ฿{formatBaht(monthlyBudget.amount)}
              </p>
            </div>

            {renderCircularGauge(
              monthlyPercent,
              monthlyPercent > 100 ? 'text-rose-600' : 'text-blue-900',
              monthlyPercent > 100 ? '#e11d48' : '#2563eb',
              56,
              5.5
            )}
          </div>
        </div>

        {/* ========================================================
            1.3) มุมบนขวา: งบรายวันที่ตั้งไว้ (พื้นหลังสีส้ม 3D)
            มีแค่ เปอร์เซ็นต์ และ ยอดที่ตั้ง (ตัดคำว่า จ่าย, เหลือ, ตั้งค่า ออก)
            ======================================================== */}
        <div
          onClick={onOpenDailyBudgetModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenDailyBudgetModal();
          }}
          className="relative cursor-pointer transition-all duration-300 active:scale-[0.98] group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100/80 border border-orange-200 shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 min-h-[175px] sm:min-h-[195px]"
        >
          {/* 3D Glass Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-400/20 blur-xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-semibold text-orange-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                งบรายวันที่ตั้งไว้
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                เป้าหมายวันนี้
              </p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-orange-100/90 text-orange-800 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Settings2 className="w-3 h-3" />
            </div>
          </div>

          {/* Center Metric & Circular Gauge (เปอร์เซ็นต์ และ ยอดที่ตั้ง) */}
          <div className="my-auto flex items-center justify-between gap-1.5 relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    dailyPercent > 100 ? 'text-rose-600' : 'text-orange-950'
                  }`}
                >
                  {dailyPercent}%
                </span>
                {dailyPercent > 100 && (
                  <span className="text-[9px] bg-rose-500 text-white px-1 py-0.5 rounded-full font-bold">
                    เกิน
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-950 font-mono mt-0.5">
                ฿{formatBaht(dailyBudget.amount)}
              </p>
            </div>

            {renderCircularGauge(
              dailyPercent,
              dailyPercent > 100 ? 'text-rose-600' : 'text-orange-950',
              dailyPercent > 100 ? '#e11d48' : '#ea580c',
              56,
              5.5
            )}
          </div>
        </div>

        {/* ========================================================
            1.2) มุมล่างซ้าย: ยอดรายจ่ายรายเดือนที่ตั้งไว้ (พื้นหลังสีฟ้า 3D)
            ปุ่มเขียนเเค่:
            "กรอกรายจ่าย
            รายเดือน"
            ======================================================== */}
        {/* ========================================================
            1.2) มุมล่างซ้าย: ช่องกรอกรายจ่ายรายเดือน (พื้นหลังสีฟ้า 3D)
            นำตัวเลขออกทั้งหมด คงไว้เฉพาะข้อความ "กรอกรายจ่ายรายเดือน"
            ======================================================== */}
        <div
          onClick={onOpenMonthlyExpenseModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenMonthlyExpenseModal();
          }}
          className="relative cursor-pointer transition-all duration-300 active:scale-[0.98] group flex flex-col items-center justify-center text-center overflow-hidden rounded-2xl sm:rounded-3xl p-4 bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-blue-100/80 border border-blue-200 shadow-md shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 min-h-[175px] sm:min-h-[195px]"
        >
          {/* 3D Glass Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/40 pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
              <div>กรอกรายจ่าย</div>
              <div className="text-blue-700">รายเดือน</div>
            </div>
          </div>
        </div>

        {/* ========================================================
            1.4) มุมล่างขวา: ช่องกรอกรายจ่ายรายวัน (พื้นหลังสีส้ม 3D)
            นำตัวเลขออกทั้งหมด คงไว้เฉพาะข้อความ "กรอกรายจ่ายรายวัน"
            ======================================================== */}
        <div
          onClick={onOpenDailyExpenseModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenDailyExpenseModal();
          }}
          className="relative cursor-pointer transition-all duration-300 active:scale-[0.98] group flex flex-col items-center justify-center text-center overflow-hidden rounded-2xl sm:rounded-3xl p-4 bg-gradient-to-br from-orange-50/90 via-amber-50/70 to-orange-100/80 border border-orange-200 shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 min-h-[175px] sm:min-h-[195px]"
        >
          {/* 3D Glass Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/40 pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-orange-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
              <div>กรอกรายจ่าย</div>
              <div className="text-orange-700">รายวัน</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4) ชื่อคนออกแบบโปรแกรมดูด้านล่างของหน้าแรก */}
      <footer className="mt-5 pt-3 pb-8 text-center">
        <div className="inline-flex items-center justify-center gap-1.5 flex-wrap px-4 py-1.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-xs">
          <span className="text-xs font-semibold text-slate-700">
            สร้างสรรค์โดยช่างหน่อยชุมแพ
          </span>
          <a
            href="tel:0992256601"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors shadow-2xs"
          >
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>099-225-6601</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
