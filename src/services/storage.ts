import {
  MonthlyBudgetConfig,
  DailyBudgetConfig,
  MonthlyExpense,
  DailyExpense,
  UserLink,
  AppSettings,
} from '../types';

const STORAGE_KEYS = {
  MONTHLY_BUDGET: 'billhao_monthly_budget',
  DAILY_BUDGET: 'billhao_daily_budget',
  MONTHLY_EXPENSES: 'billhao_monthly_expenses',
  DAILY_EXPENSES: 'billhao_daily_expenses',
  USER_LINKS: 'billhao_user_links',
  APP_SETTINGS: 'billhao_app_settings',
  USER_PASSWORD: 'billhao_user_password',
};

const DEFAULT_COVER_IMAGE = '/src/assets/images/cover_banner_1794189133145.jpg';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'บิลเฮา',
  slogan: 'ระบบเตือนและควบคุมรายจ่ายประจำวัน & เดือน',
  revision: 'Rev. 1.2.0',
  coverImage: DEFAULT_COVER_IMAGE,
  adminPhone: '099-225-6601',
  adminName: 'ช่างหน่อยชุมแพ',
};

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const DEFAULT_MONTHLY_BUDGET: MonthlyBudgetConfig = {
  amount: 25000,
  month: getCurrentMonthString(),
  warningThresholdPercent: 80,
  note: 'งบใช้จ่ายและผ่อนชำระประจำเดือนนี้',
};

export const DEFAULT_DAILY_BUDGET: DailyBudgetConfig = {
  amount: 500,
  warningThresholdPercent: 80,
  note: 'งบค่ากินและของใช้ประจำวัน',
};

export const SEED_MONTHLY_EXPENSES: MonthlyExpense[] = [
  {
    id: 'm-1',
    name: 'ค่างวดรถยนต์ (กระบะ 4 ประตู)',
    amount: 8500,
    currentInstallment: 24,
    totalInstallments: 48,
    remainingBalance: 204000,
    remainingInstallments: 24,
    dueDate: 5,
    isPaid: true,
    paidAt: '2026-11-05',
    category: 'ยานพาหนะ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm-2',
    name: 'ค่าผ่อนบ้าน / ที่อยู่อาศัย',
    amount: 9200,
    currentInstallment: 36,
    totalInstallments: 240,
    remainingBalance: 1876800,
    remainingInstallments: 204,
    dueDate: 10,
    isPaid: false,
    category: 'ที่อยู่อาศัย',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm-3',
    name: 'ค่าอินเทอร์เน็ตบ้าน ไฟเบอร์',
    amount: 699,
    currentInstallment: 0,
    totalInstallments: 0,
    remainingBalance: 0,
    remainingInstallments: 0,
    dueDate: 15,
    isPaid: false,
    category: 'สาธารณูปโภค',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm-4',
    name: 'ประกันภัยอุบัติเหตุและสุขภาพ',
    amount: 1500,
    currentInstallment: 6,
    totalInstallments: 12,
    remainingBalance: 9000,
    remainingInstallments: 6,
    dueDate: 25,
    isPaid: false,
    category: 'ประกันภัย',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_DAILY_EXPENSES: DailyExpense[] = [
  {
    id: 'd-1',
    name: 'ข้าวกะเพราหมูกรอบ + ไข่ดาว',
    amount: 65,
    category: 'อาหาร',
    paymentMethod: 'โอน/สแกน QR',
    date: getTodayDateString(),
    time: '08:30',
    note: 'มื้อเช้า',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd-2',
    name: 'กาแฟอเมซอนเย็น หวานน้อย',
    amount: 60,
    category: 'อาหาร',
    paymentMethod: 'โอน/สแกน QR',
    date: getTodayDateString(),
    time: '10:15',
    note: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd-3',
    name: 'เติมน้ำมันรถมอเตอร์ไซค์',
    amount: 120,
    category: 'เดินทาง',
    paymentMethod: 'เงินสด',
    date: getTodayDateString(),
    time: '13:40',
    note: 'ปั๊ม ปตท.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd-4',
    name: 'ซื้อของใช้ในบ้านและน้ำดื่ม',
    amount: 85,
    category: 'ของใช้',
    paymentMethod: 'พร้อมเพย์',
    date: getTodayDateString(),
    time: '17:10',
    note: 'ร้านสะดวกซื้อ',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_USER_LINKS: UserLink[] = [
  {
    id: 'u-1',
    token: 'demo-somchai',
    userName: 'สมชาย รักดี',
    userPhone: '081-234-5678',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true,
    notes: 'ลูกค้าสมาชิกทั่วไป 30 วัน',
  },
  {
    id: 'u-2',
    token: 'vip-client01',
    userName: 'คุณวิภาวรรณ',
    userPhone: '089-987-6543',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true,
    notes: 'ต่ออายุแพ็กเกจ 3 เดือน',
  },
  {
    id: 'u-3',
    token: 'expired-sample',
    userName: 'คุณทดสอบ (ตัวอย่างหมดอายุ)',
    userPhone: '090-000-0000',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired 2 days ago
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    notes: 'สำหรับทดสอบหน้าต่างแจ้งเตือนหมดอายุ',
  },
];

// Helper to scope storage by user token for complete data isolation across devices and links
const getScopedKey = (baseKey: string, userToken?: string | null) => {
  if (userToken && userToken.trim()) {
    return `${baseKey}_u_${encodeURIComponent(userToken.trim().toLowerCase())}`;
  }
  return baseKey;
};

// Helper functions for LocalStorage with User Scoping
export const storageService = {
  getMonthlyBudget(userToken?: string | null): MonthlyBudgetConfig {
    const key = getScopedKey(STORAGE_KEYS.MONTHLY_BUDGET, userToken);
    const data = localStorage.getItem(key);
    if (!data) return DEFAULT_MONTHLY_BUDGET;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_MONTHLY_BUDGET;
    }
  },

  saveMonthlyBudget(budget: MonthlyBudgetConfig, userToken?: string | null): void {
    const key = getScopedKey(STORAGE_KEYS.MONTHLY_BUDGET, userToken);
    localStorage.setItem(key, JSON.stringify(budget));
  },

  getDailyBudget(userToken?: string | null): DailyBudgetConfig {
    const key = getScopedKey(STORAGE_KEYS.DAILY_BUDGET, userToken);
    const data = localStorage.getItem(key);
    if (!data) return DEFAULT_DAILY_BUDGET;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_DAILY_BUDGET;
    }
  },

  saveDailyBudget(budget: DailyBudgetConfig, userToken?: string | null): void {
    const key = getScopedKey(STORAGE_KEYS.DAILY_BUDGET, userToken);
    localStorage.setItem(key, JSON.stringify(budget));
  },

  getMonthlyExpenses(userToken?: string | null): MonthlyExpense[] {
    const key = getScopedKey(STORAGE_KEYS.MONTHLY_EXPENSES, userToken);
    const data = localStorage.getItem(key);
    if (!data) {
      // User links start completely clean with 0 items!
      if (userToken && userToken.trim()) {
        this.saveMonthlyExpenses([], userToken);
        return [];
      }
      this.saveMonthlyExpenses(SEED_MONTHLY_EXPENSES);
      return SEED_MONTHLY_EXPENSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMonthlyExpenses(expenses: MonthlyExpense[], userToken?: string | null): void {
    const key = getScopedKey(STORAGE_KEYS.MONTHLY_EXPENSES, userToken);
    localStorage.setItem(key, JSON.stringify(expenses));
  },

  getDailyExpenses(userToken?: string | null): DailyExpense[] {
    const key = getScopedKey(STORAGE_KEYS.DAILY_EXPENSES, userToken);
    const data = localStorage.getItem(key);
    if (!data) {
      // User links start completely clean with 0 items!
      if (userToken && userToken.trim()) {
        this.saveDailyExpenses([], userToken);
        return [];
      }
      this.saveDailyExpenses(SEED_DAILY_EXPENSES);
      return SEED_DAILY_EXPENSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveDailyExpenses(expenses: DailyExpense[], userToken?: string | null): void {
    const key = getScopedKey(STORAGE_KEYS.DAILY_EXPENSES, userToken);
    localStorage.setItem(key, JSON.stringify(expenses));
  },

  getUserLinks(): UserLink[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_LINKS);
    if (!data) {
      this.saveUserLinks(SEED_USER_LINKS);
      return SEED_USER_LINKS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USER_LINKS;
    }
  },

  saveUserLinks(links: UserLink[]): void {
    localStorage.setItem(STORAGE_KEYS.USER_LINKS, JSON.stringify(links));
  },

  getAppSettings(userToken?: string | null, userName?: string): AppSettings {
    const key = getScopedKey(STORAGE_KEYS.APP_SETTINGS, userToken);
    const data = localStorage.getItem(key);
    if (!data) {
      const initial: AppSettings = {
        ...DEFAULT_SETTINGS,
        appName: userName ? `บิลของฉัน ${userName}` : (userToken ? 'บิลของฉัน' : 'บิลเฮา'),
        slogan: userToken ? 'วางแผนการเงิน เพื่ออนาคตที่มั่นคง' : 'ระบบเตือนและควบคุมรายจ่ายประจำวัน & เดือน',
        revision: 'Rev. 1.2.0',
      };
      this.saveAppSettings(initial, userToken);
      return initial;
    }
    try {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        revision: 'Rev. 1.2.0', // Real-time revision sync on every deploy!
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveAppSettings(settings: AppSettings, userToken?: string | null): void {
    const key = getScopedKey(STORAGE_KEYS.APP_SETTINGS, userToken);
    localStorage.setItem(key, JSON.stringify(settings));
  },

  // Password Management: Get current password for a user link or app session
  getUserPassword(userToken?: string | null): string | null {
    // 1. Check user-specific custom saved password first
    const scopedKey = getScopedKey(STORAGE_KEYS.USER_PASSWORD, userToken);
    const customPass = localStorage.getItem(scopedKey);
    if (customPass && customPass.trim()) {
      return customPass.trim();
    }

    // 2. Check if this is a registered UserLink configured by Admin
    if (userToken && userToken.trim()) {
      const links = this.getUserLinks();
      const foundLink = links.find(
        (l) => l.token.toLowerCase() === userToken.trim().toLowerCase()
      );
      if (foundLink && foundLink.password && foundLink.password.trim()) {
        return foundLink.password.trim();
      }
    }

    return null;
  },

  // Save new password set by user or admin
  saveUserPassword(newPassword: string, userToken?: string | null): void {
    const cleanPass = newPassword.trim();
    const scopedKey = getScopedKey(STORAGE_KEYS.USER_PASSWORD, userToken);
    localStorage.setItem(scopedKey, cleanPass);

    // Also update corresponding UserLink if userToken matches
    if (userToken && userToken.trim()) {
      const links = this.getUserLinks();
      const updatedLinks = links.map((link) => {
        if (link.token.toLowerCase() === userToken.trim().toLowerCase()) {
          return { ...link, password: cleanPass };
        }
        return link;
      });
      this.saveUserLinks(updatedLinks);
    }
  },

  // Reset expenses for this specific user/device to 0 items
  resetUserExpenses(userToken?: string | null): void {
    this.saveMonthlyExpenses([], userToken);
    this.saveDailyExpenses([], userToken);
  },

  resetAllData(): void {
    localStorage.clear();
  },
};
