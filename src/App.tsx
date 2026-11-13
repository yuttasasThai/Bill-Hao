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
  getTodayDateString,
  getCurrentMonthString,
  decodeUserLinkPayload,
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
import { BootLockScreen } from './components/BootLockScreen';
import {
  playDailyOverBudgetVoiceAlert,
  playMonthlyOverBudgetVoiceAlert,
  subscribeVoiceAlertBanner,
  AlertType,
} from './services/soundAlert';
import { Volume2, X } from 'lucide-react';

export default function App() {
  // App Unlocked / Passcode Boot Gate
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [currentUserLink, setCurrentUserLink] = useState<UserLink | undefined>(undefined);

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

  // Visual Voice Alert Banner State
  const [voiceAlertBanner, setVoiceAlertBanner] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);

  useEffect(() => {
    return subscribeVoiceAlertBanner((info) => {
      setVoiceAlertBanner(info);
    });
  }, []);

  // Load Initial Data on Mount with User Scoping
  useEffect(() => {
    // Check URL parameters for User Token, Encoded Link Payload, or Admin
    const searchParams = new URLSearchParams(window.location.search);
    const userParam = searchParams.get('user');
    const codeParam = searchParams.get('c');
    const adminParam = searchParams.get('admin');

    const loadedUserLinks = storageService.getUserLinks();
    setUserLinks(loadedUserLinks);

    let activeToken: string | null = null;
    let foundUserName: string | undefined = undefined;

    if (userParam && userParam.trim()) {
      activeToken = userParam.trim();
      setCurrentUserToken(activeToken);
      setIsUserView(true);

      const decodedFromUrl = codeParam ? decodeUserLinkPayload(codeParam) : null;
      const foundInStorage = loadedUserLinks.find((u) => u.token === activeToken);

      if (decodedFromUrl && decodedFromUrl.token === activeToken) {
        const resolvedUser: UserLink = {
          id: foundInStorage?.id || `u-${activeToken}`,
          token: activeToken,
          userName: decodedFromUrl.userName || foundInStorage?.userName || 'ผู้ใช้งาน',
          userPhone: decodedFromUrl.userPhone ?? foundInStorage?.userPhone,
          password: decodedFromUrl.password || foundInStorage?.password || '1234',
          expiresAt:
            decodedFromUrl.expiresAt ||
            foundInStorage?.expiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: foundInStorage?.createdAt || new Date().toISOString(),
          isActive: foundInStorage?.isActive ?? true,
          notes: foundInStorage?.notes,
        };

        // Sync decoded link into localStorage on this device so password/expiry persists cleanly
        const updatedLinks = foundInStorage
          ? loadedUserLinks.map((u) => (u.token === activeToken ? resolvedUser : u))
          : [resolvedUser, ...loadedUserLinks];
        storageService.saveUserLinks(updatedLinks);
        setUserLinks(updatedLinks);

        setCurrentUserLink(resolvedUser);
        foundUserName = resolvedUser.userName;
        const isExpired = new Date(resolvedUser.expiresAt).getTime() < Date.now();
        if (isExpired) {
          setExpiredUserName(resolvedUser.userName);
          setIsExpiredModalOpen(true);
        }
      } else if (foundInStorage) {
        setCurrentUserLink(foundInStorage);
        foundUserName = foundInStorage.userName;
        const isExpired = new Date(foundInStorage.expiresAt).getTime() < Date.now();
        if (isExpired) {
          setExpiredUserName(foundInStorage.userName);
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
    if (totalMonthlySpentCombined > (newBudget.amount || 0)) {
      playMonthlyOverBudgetVoiceAlert(2);
    }
  };

  const handleSaveDailyBudget = (newBudget: DailyBudgetConfig) => {
    setDailyBudget(newBudget);
    storageService.saveDailyBudget(newBudget, currentUserToken);
    if (todayDailySpent > (newBudget.amount || 0)) {
      playDailyOverBudgetVoiceAlert(2);
    }
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

    // Voice Alert when monthly expenses exceed budget:
    // "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
    const totalCommittedAfter = updated.reduce((sum, item) => sum + item.amount, 0);
    const totalMonthAfter = totalCommittedAfter + monthDailyAccumulated;
    if (totalMonthAfter > (monthlyBudget.amount || 0)) {
      playMonthlyOverBudgetVoiceAlert(2);
    }
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

    // Voice Alert when daily budget exceeded:
    // "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
    const targetDate = expenseData.date || getTodayDateString();
    const totalTodayAfter = updated
      .filter((e) => e.date === targetDate || e.date === getTodayDateString())
      .reduce((sum, e) => sum + e.amount, 0);

    if (totalTodayAfter > (dailyBudget.amount || 0)) {
      playDailyOverBudgetVoiceAlert(2);
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
  const todayStr = getTodayDateString();
  const todayDailySpent = dailyExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const currentMonthStr = getCurrentMonthString();
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

  // Passcode Gate & Booting Screen (3-4s showing cover image, app name, and typewriter creator)
  if (!isAppUnlocked) {
    return (
      <BootLockScreen
        settings={settings}
        currentUserLink={currentUserLink}
        currentUserToken={currentUserToken}
        isUserView={isUserView}
        onUnlock={() => setIsAppUnlocked(true)}
        onPasswordChange={(newPass) => {
          if (currentUserLink) {
            setCurrentUserLink({ ...currentUserLink, password: newPass });
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* Floating Voice Alert Toast Banner */}
      {voiceAlertBanner && (
        <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-3 pointer-events-none animate-fade-in">
          <div className="pointer-events-auto max-w-md w-full rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-3 shadow-2xl border border-rose-400/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-100">
                {voiceAlertBanner.type === 'daily'
                  ? '⚠️ แจ้งเตือนรายจ่ายประจำวันเกินงบ'
                  : '⚠️ แจ้งเตือนรายจ่ายประจำเดือนเกินงบ'}
              </p>
              <p className="text-xs sm:text-sm font-bold leading-snug mt-0.5">
                &ldquo;{voiceAlertBanner.message}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVoiceAlertBanner(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white shrink-0"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
        onLockApp={() => setIsAppUnlocked(false)}
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
      {/* User Settings Modal (Custom Cover, Bill Name, Slogan, Change Password, Reset Data) */}
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetUserData}
        isUserView={isUserView}
        userToken={currentUserToken}
        onPasswordChanged={(newPass) => {
          if (currentUserLink) {
            setCurrentUserLink({ ...currentUserLink, password: newPass });
          }
        }}
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
