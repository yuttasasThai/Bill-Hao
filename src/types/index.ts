export interface MonthlyBudgetConfig {
  amount: number;
  month: string; // YYYY-MM
  warningThresholdPercent: number;
  note: string;
}

export interface DailyBudgetConfig {
  amount: number;
  warningThresholdPercent: number;
  note: string;
}

export interface MonthlyExpense {
  id: string;
  name: string;
  amount: number; // ยอดชำระต่องวด
  currentInstallment: number; // งวดที่
  totalInstallments: number; // จำนวนงวดทั้งหมด (0 = ไม่มีกำหนดงวด / จ่ายประจำ)
  remainingBalance: number; // สรุปยอดคงเหลือหนี้สิน
  remainingInstallments: number; // งวดคงเหลือ
  dueDate: number; // วันที่ชำระประจำเดือน 1-31
  isPaid: boolean; // สถานะชำระรอบนี้แล้วหรือยัง
  paidAt?: string;
  category: string;
  createdAt: string;
}

export interface DailyExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  paymentMethod: 'เงินสด' | 'โอน/สแกน QR' | 'บัตรเครดิต/เดบิต' | 'พร้อมเพย์';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note?: string;
  createdAt: string;
}

export interface UserLink {
  id: string;
  token: string;
  userName: string;
  userPhone?: string;
  password?: string;
  expiresAt: string; // ISO date string
  createdAt: string;
  isActive: boolean;
  notes?: string;
}

export interface AppSettings {
  appName: string;
  slogan?: string;
  revision: string;
  coverImage: string;
  adminPhone: string;
  adminName: string;
}
