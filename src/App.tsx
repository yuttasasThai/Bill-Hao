import React, { useState, useEffect } from 'react';
import {
  MonthlyBudgetConfig,
  DailyBudgetConfig,
  MonthlyExpense,
  DailyExpense,
  UserLink,
  AppSettings,
} from './types';
import {
  storageService,
  DEFAULT_SETTINGS,
  DEFAULT_MONTHLY_BUDGET,
  DEFAULT_DAILY_BUDGET,
} from './services/storage';

import { Header } from './components/Header';
import { FourQuadrants } from './components/FourQuadrants';
import { MonthlyDetailsView } from './components/MonthlyDetailsView';
import { DailyDetailsView } from './components/DailyDetailsView';
import { AdminView } from './components/AdminView';
import { NavigationTabBar, ActivePage } from './components/NavigationTabBar';

import { MonthlyBudgetModal } from './components/MonthlyBudgetModal';
import { MonthlyExpenseModal } from './components/MonthlyExpenseModal';
import { DailyBudgetModal } from './components/DailyBudgetModal';
import { DailyExpenseModal } from './components/DailyExpenseModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ExpiredUserModal } from './components/ExpiredUserModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { playOverBudgetVoiceAlert } from './services/soundAlert';

export default function App() {
  // Current User Token (if accessing via user link ?user=xxx)
  const [currentUserToken, setCurrentUserToken] = useState<string | null>(null);

  // Application Data States
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetConfig>(DEFAULT_MONTHLY_BUDGET);
  const [dailyBudget, setDailyBudget] = useState<DailyBudgetConfig>(DEFAULT_DAILY_BUDGET);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [userLinks, setUserLinks] = useState<UserLink[]>([]);

  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  // Admin and User View States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserView, setIsUserView] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Expired User Modal States
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [expiredUserName, setExpiredUserName] = useState('');
  const [isTestExpiredModal, setIsTestExpiredModal] = useState(false);

  // Modals States
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [isMonthlyBudgetModalOpen, setIsMonthlyBudgetModalOpen] = useState(false);
  const [isMonthlyExpenseModalOpen, setIsMonthlyExpenseModalOpen] = useState(false);
  const [editingMonthlyExpense, setEditingMonthlyExpense] = useState<MonthlyExpense | null>(null);

  const [isDailyBudgetModalOpen, setIsDailyBudgetModalOpen] = useState(false);
  const [isDailyExpenseModalOpen, setIsDailyExpenseModalOpen] = useState(false);
  const [editingDailyExpense, setEditingDailyExpense] = useState<DailyExpense | null>(null);

  // Load Initial Data on Mount with User Scoping
  useEffect(() => {
    // Check URL parameters for User Token or Admin
    const searchParams = new URLSearchParams(window.location.search);
    const userParam = searchParams.get('user');
    const adminParam = searchParams.get('admin');

    const loadedUserLinks = storageService.getUserLinks();
    setUserLinks(loadedUserLinks);

    let activeToken: string | null = null;
    let foundUserName: string | undefined = undefined;

    if (userParam && userParam.trim()) {
      activeToken = userParam.trim();
      setCurrentUserToken(activeToken);
      setIsUserView(true);

      // Check if user token exists in registered user links
      const foundUser = loadedUserLinks.find((u) => u.token === activeToken);
      if (foundUser) {
        foundUserName = foundUser.userName;
        const isExpired = new Date(foundUser.expiresAt).getTime() < Date.now();
        if (isExpired) {
          setExpiredUserName(foundUser.userName);
          setIsExpiredModalOpen(true);
        }
      } else {
        // Fallback for mock expired user link
        if (userParam.includes('expired')) {
          setExpiredUserName('ผู้ใช้ทดสอบ');
          setIsExpiredModalOpen(true);
        }
      }
    }

    // Load data scoped to this specific user token
    // For a new user token, monthlyExpenses and dailyExpenses start 100% clean as []
    const loadedSettings = storageService.getAppSettings(activeToken, foundUserName);
    const loadedMonthlyBudget = storageService.getMonthlyBudget(activeToken);
    const loadedDailyBudget = storageService.getDailyBudget(activeToken);
    const loadedMonthlyExpenses = storageService.getMonthlyExpenses(activeToken);
    const loadedDailyExpenses = storageService.getDailyExpenses(activeToken);

    setSettings(loadedSettings);
    setMonthlyBudget(loadedMonthlyBudget);
    setDailyBudget(loadedDailyBudget);
    setMonthlyExpenses(loadedMonthlyExpenses);
    setDailyExpenses(loadedDailyExpenses);

    if (adminParam === 'true') {
      setIsAdminAuthOpen(true);
    }
  }, []);

  // Sync document title with current app name and revision
  useEffect(() => {
    document.title = `${settings.appName} (${settings.revision}) - ระบบจัดการงบและค่าใช้จ่าย`;
  }, [settings.appName, settings.revision]);

  // Save Handlers Scoped by currentUserToken
  const handleSaveMonthlyBudget = (newBudget: MonthlyBudgetConfig) => {
    setMonthlyBudget(newBudget);
    storageService.saveMonthlyBudget(newBudget, currentUserToken);
  };

  const handleSaveDailyBudget = (newBudget: DailyBudgetConfig) => {
    setDailyBudget(newBudget);
    storageService.saveDailyBudget(newBudget, currentUserToken);
  };

  const handleSaveMonthlyExpense = (
    expenseData: Omit<MonthlyExpense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: MonthlyExpense[];
    if (existingId) {
      updated = monthlyExpenses.map((item) =>
        item.id === existingId ? { ...item, ...expenseData } : item
      );
    } else {
      const newItem: MonthlyExpense = {
        ...expenseData,
        id: `m-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [newItem, ...monthlyExpenses];
    }
    setMonthlyExpenses(updated);
    storageService.saveMonthlyExpenses(updated, currentUserToken);
    setEditingMonthlyExpense(null);
  };

  const handleDeleteMonthlyExpense = (id: string) => {
    const updated = monthlyExpenses.filter((item) => item.id !== id);
    setMonthlyExpenses(updated);
    storageService.saveMonthlyExpenses(updated, currentUserToken);
  };

  const handleToggleMonthlyStatus = (id: string) => {
    const updated = monthlyExpenses.map((item) => {
      if (item.id !== id) return item;
      const nextIsPaid = !item.isPaid;
      return {
        ...item,
        isPaid: nextIsPaid,
        paidAt: nextIsPaid ? new Date().toISOString() : undefined,
      };
    });
    setMonthlyExpenses(updated);
    storageService.saveMonthlyExpenses(updated, currentUserToken);
  };

  const handleSaveDailyExpense = (
    expenseData: Omit<DailyExpense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: DailyExpense[];
    if (existingId) {
      updated = dailyExpenses.map((item) =>
        item.id === existingId ? { ...item, ...expenseData } : item
      );
    } else {
      const newItem: DailyExpense = {
        ...expenseData,
        id: `d-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [newItem, ...dailyExpenses];
    }
    setDailyExpenses(updated);
    storageService.saveDailyExpenses(updated, currentUserToken);
    setEditingDailyExpense(null);

    // Voice Alert when daily budget exceeded
    const currentToday = new Date().toISOString().split('T')[0];
    const totalTodayAfter = updated
      .filter((e) => e.date === currentToday)
      .reduce((sum, e) => sum + e.amount, 0);

    if (totalTodayAfter > (dailyBudget.amount || 0)) {
      playOverBudgetVoiceAlert(3);
    }
  };

  const handleDeleteDailyExpense = (id: string) => {
    const updated = dailyExpenses.filter((item) => item.id !== id);
    setDailyExpenses(updated);
    storageService.saveDailyExpenses(updated, currentUserToken);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveAppSettings(newSettings, currentUserToken);
  };

  // Reset user data (clears all expenses for this user to 0 items)
  const handleResetUserData = () => {
    setMonthlyExpenses([]);
    setDailyExpenses([]);
    storageService.resetUserExpenses(currentUserToken);
  };

  const handleSaveUserLinks = (newLinks: UserLink[]) => {
    setUserLinks(newLinks);
    storageService.saveUserLinks(newLinks);
  };

  // Calculations for budget percentages
  const monthlyTotalCommitted = monthlyExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDailySpent = dailyExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const currentMonthStr = todayStr.substring(0, 7);
  const monthDailyAccumulated = dailyExpenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMonthlySpentCombined = monthlyTotalCommitted + monthDailyAccumulated;

  const handleSelectPage = (page: ActivePage) => {
    if (page === 'admin' && !isAdmin) {
      setIsAdminAuthOpen(true);
      return;
    }
    setActivePage(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* 1) Top Header & Cover Photo */}
      <Header
        settings={settings}
        monthlyBudget={monthlyBudget}
        monthlySpent={totalMonthlySpentCombined}
        dailyBudget={dailyBudget}
        dailySpent={todayDailySpent}
        onOpenAdminAuth={() => {
          if (isAdmin) {
            setActivePage('admin');
          } else {
            setIsAdminAuthOpen(true);
          }
        }}
        onOpenUserSettings={() => setIsUserSettingsOpen(true)}
        onResetUserData={handleResetUserData}
        isAdmin={isAdmin}
        isUserView={isUserView}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* Page 1: Dashboard 4 Quadrants (หน้าหลัก) */}
        {activePage === 'dashboard' && (
          <FourQuadrants
            monthlyBudget={monthlyBudget}
            dailyBudget={dailyBudget}
            monthlyExpenses={monthlyExpenses}
            dailyExpenses={dailyExpenses}
            onOpenMonthlyBudgetModal={() => setIsMonthlyBudgetModalOpen(true)}
            onOpenMonthlyExpenseModal={() => {
              setEditingMonthlyExpense(null);
              setIsMonthlyExpenseModalOpen(true);
            }}
            onOpenDailyBudgetModal={() => setIsDailyBudgetModalOpen(true)}
            onOpenDailyExpenseModal={() => {
              setEditingDailyExpense(null);
              setIsDailyExpenseModalOpen(true);
            }}
          />
        )}

        {/* Page 2: Monthly Details Excel Table (หน้ารายละเอียดตารางรายจ่ายรายเดือน) */}
        {activePage === 'monthly' && (
          <MonthlyDetailsView
            expenses={monthlyExpenses}
            dailyExpenses={dailyExpenses}
            onBack={() => setActivePage('dashboard')}
            onOpenAddModal={() => {
              setEditingMonthlyExpense(null);
              setIsMonthlyExpenseModalOpen(true);
            }}
            onEditExpense={(item) => {
              setEditingMonthlyExpense(item);
              setIsMonthlyExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteMonthlyExpense}
            onToggleStatus={handleToggleMonthlyStatus}
          />
        )}

        {/* Page 3: Daily Details Table (หน้ารายละเอียดตารางรายจ่ายรายวัน) */}
        {activePage === 'daily' && (
          <DailyDetailsView
            expenses={dailyExpenses}
            onBack={() => setActivePage('dashboard')}
            onOpenAddModal={() => {
              setEditingDailyExpense(null);
              setIsDailyExpenseModalOpen(true);
            }}
            onEditExpense={(item) => {
              setEditingDailyExpense(item);
              setIsDailyExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteDailyExpense}
          />
        )}

        {/* Page 4: Admin Settings (ตั้งค่าแอดมิน) */}
        {activePage === 'admin' && (
          <AdminView
            settings={settings}
            userLinks={userLinks}
            onBack={() => setActivePage('dashboard')}
            onSaveSettings={handleSaveSettings}
            onSaveUserLinks={handleSaveUserLinks}
            onTestExpiredModal={() => {
              setIsTestExpiredModal(true);
              setIsExpiredModalOpen(true);
            }}
            onLogoutAdmin={() => {
              setIsAdmin(false);
              setActivePage('dashboard');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation Tab Bar for mobile thumb control */}
      <NavigationTabBar
        activePage={activePage}
        onSelectPage={handleSelectPage}
        isAdmin={isAdmin}
        isUserView={isUserView}
        monthlyCount={monthlyExpenses.length}
        dailyCount={dailyExpenses.length}
      />

      {/* ========================================================
          MODALS
          ======================================================== */}
      {/* User Settings Modal (Custom Cover, Bill Name, Slogan, Reset Data) */}
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetUserData}
        isUserView={isUserView}
      />

      {/* 1.1.1) Monthly Budget Modal */}
      <MonthlyBudgetModal
        isOpen={isMonthlyBudgetModalOpen}
        onClose={() => setIsMonthlyBudgetModalOpen(false)}
        currentBudget={monthlyBudget}
        onSave={handleSaveMonthlyBudget}
      />

      {/* 1.2.1) Monthly Expense / Installment Modal */}
      <MonthlyExpenseModal
        isOpen={isMonthlyExpenseModalOpen}
        onClose={() => {
          setIsMonthlyExpenseModalOpen(false);
          setEditingMonthlyExpense(null);
        }}
        onSave={handleSaveMonthlyExpense}
        onDelete={handleDeleteMonthlyExpense}
        initialData={editingMonthlyExpense}
      />

      {/* 1.3.1) Daily Budget Modal */}
      <DailyBudgetModal
        isOpen={isDailyBudgetModalOpen}
        onClose={() => setIsDailyBudgetModalOpen(false)}
        currentBudget={dailyBudget}
        onSave={handleSaveDailyBudget}
      />

      {/* 1.4.1) Daily Expense Modal */}
      <DailyExpenseModal
        isOpen={isDailyExpenseModalOpen}
        onClose={() => {
          setIsDailyExpenseModalOpen(false);
          setEditingDailyExpense(null);
        }}
        onSave={handleSaveDailyExpense}
        onDelete={handleDeleteDailyExpense}
        initialData={editingDailyExpense}
      />

      {/* Admin Auth Modal (Password 099-225-6601 masked) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setIsAdminAuthOpen(false);
          setActivePage('admin');
        }}
      />

      {/* Expired User Alert Modal */}
      <ExpiredUserModal
        isOpen={isExpiredModalOpen}
        onClose={() => {
          setIsExpiredModalOpen(false);
          setIsTestExpiredModal(false);
        }}
        adminPhone={settings.adminPhone || '099-225-6601'}
        adminName={settings.adminName || 'ช่างหน่อยชุมแพ'}
        userName={expiredUserName}
        isTestMode={isTestExpiredModal}
      />
    </div>
  );
}
