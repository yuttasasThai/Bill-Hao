import React from 'react';
import { LayoutGrid, Receipt, Wallet, Shield } from 'lucide-react';

export type ActivePage = 'dashboard' | 'monthly' | 'daily' | 'admin';

interface NavigationTabBarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  isAdmin: boolean;
  isUserView: boolean;
  monthlyCount: number;
  dailyCount: number;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activePage,
  onSelectPage,
  isAdmin,
  isUserView,
  monthlyCount,
  dailyCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-3 sm:grid-cols-4 items-center h-16 px-2">
        {/* Tab 1: หน้าหลัก 4 ช่อง */}
        <button
          type="button"
          onClick={() => onSelectPage('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activePage === 'dashboard'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activePage === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : ''
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">หน้าหลัก</span>
        </button>

        {/* Tab 2: ตารางรายเดือน */}
        <button
          type="button"
          onClick={() => onSelectPage('monthly')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative ${
            activePage === 'monthly'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activePage === 'monthly' ? 'bg-emerald-50 text-emerald-700' : ''
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">ตารางรายเดือน</span>
        </button>

        {/* Tab 3: ตารางรายวัน */}
        <button
          type="button"
          onClick={() => onSelectPage('daily')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative ${
            activePage === 'daily'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activePage === 'daily' ? 'bg-teal-50 text-teal-700' : ''
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">ตารางรายวัน</span>
        </button>

        {/* Tab 4: Admin Tab (Only when Admin is authenticated or not in restricted user view) */}
        {!isUserView && (
          <button
            type="button"
            onClick={() => onSelectPage('admin')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activePage === 'admin'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                activePage === 'admin' ? 'bg-emerald-50 text-emerald-700' : ''
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">แอดมิน</span>
          </button>
        )}
      </div>
    </nav>
  );
};
