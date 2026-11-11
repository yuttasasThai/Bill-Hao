import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  AlertTriangle,
  Flame,
  Palette,
  Sliders,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { AppSettings, MonthlyBudgetConfig, DailyBudgetConfig } from '../types';
import {
  playDailyOverBudgetVoiceAlert,
  playMonthlyOverBudgetVoiceAlert,
} from '../services/soundAlert';

interface HeaderProps {
  settings: AppSettings;
  monthlyBudget: MonthlyBudgetConfig;
  monthlySpent: number;
  dailyBudget: DailyBudgetConfig;
  dailySpent: number;
  onOpenAdminAuth: () => void;
  onOpenUserSettings: () => void;
  onResetUserData?: () => void;
  onLockApp?: () => void;
  isAdmin: boolean;
  isUserView: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  monthlyBudget,
  monthlySpent,
  dailyBudget,
  dailySpent,
  onOpenAdminAuth,
  onOpenUserSettings,
  onResetUserData,
  onLockApp,
  isAdmin,
  isUserView,
}) => {
  const [imageExpanded, setImageExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const monthlyPercent = Math.min(
    Math.round((monthlySpent / (monthlyBudget.amount || 1)) * 100),
    999
  );
  const dailyPercent = Math.min(
    Math.round((dailySpent / (dailyBudget.amount || 1)) * 100),
    999
  );

  const isMonthlyOver = monthlyPercent >= monthlyBudget.warningThresholdPercent;
  const isDailyOver = dailyPercent >= dailyBudget.warningThresholdPercent;
  const isAnyOver = isMonthlyOver || isDailyOver;

  // Highest percentage determining severity
  const maxPercent = Math.max(monthlyPercent, dailyPercent);

  // 2.1) ไล่สีพื้นหลังจากสีขาวไปจนถึงสีแดงเข้ม ตามระดับความรุนแรง
  const getSeverityStyle = () => {
    if (maxPercent < 60) {
      return {
        bg: 'linear-gradient(to right, #ffffff, #f0fdf4)',
        borderColor: '#bbf7d0',
        textColor: '#166534',
        label: 'ปกติ',
        severityLevel: 0,
      };
    }
    if (maxPercent < 80) {
      // 60-79%: ขาว -> เหลืองส้มอ่อน
      return {
        bg: 'linear-gradient(to right, #ffffff 15%, #fef3c7 60%, #fde68a 100%)',
        borderColor: '#fcd34d',
        textColor: '#78350f',
        label: `เฝ้าระวัง (${maxPercent}%)`,
        severityLevel: 1,
      };
    }
    if (maxPercent < 100) {
      // 80-99%: ขาว -> ส้มแดง
      return {
        bg: 'linear-gradient(to right, #ffffff 10%, #ffedd5 45%, #fb923c 100%)',
        borderColor: '#f97316',
        textColor: '#7c2d12',
        label: `เตือนใกล้เต็มงบ (${maxPercent}%)`,
        severityLevel: 2,
      };
    }
    if (maxPercent <= 120) {
      // 100-120%: ขาว -> แดงสด
      return {
        bg: 'linear-gradient(to right, #ffffff 5%, #fee2e2 40%, #ef4444 100%)',
        borderColor: '#dc2626',
        textColor: '#7f1d1d',
        label: `เกินงบแล้ว (${maxPercent}%)`,
        severityLevel: 3,
      };
    }
    // > 120%: ขาว -> สีแดงเข้ม (Deep Crimson Red)
    return {
      bg: 'linear-gradient(to right, #ffffff 0%, #fecdd3 30%, #be123c 70%, #881337 100%)',
      borderColor: '#9f1239',
      textColor: '#4c0519',
      label: `วิกฤตเกินงบ (${maxPercent}%)`,
      severityLevel: 4,
    };
  };

  const severity = getSeverityStyle();

  const handlePlayVoice = () => {
    setIsSpeaking(true);
    if (isMonthlyOver && !isDailyOver) {
      playMonthlyOverBudgetVoiceAlert(2);
    } else {
      playDailyOverBudgetVoiceAlert(2);
    }
    setTimeout(() => setIsSpeaking(false), 6000);
  };

  const handleDirectReset = () => {
    if (
      window.confirm(
        'คุณต้องการเริ่มต้นระบบใหม่และล้างรายการค่าใช้จ่ายทั้งหมดของบัญชีนี้ใช่หรือไม่?\n\n(การกระทำนี้จะล้างรายการรายจ่ายประจำวันและประจำเดือนให้เป็น 0 เพื่อเริ่มบันทึกใหม่)'
      )
    ) {
      if (onResetUserData) {
        onResetUserData();
        alert('เริ่มต้นระบบใหม่เรียบร้อยแล้ว รายการรายจ่ายทั้งหมดถูกล้างเป็น 0');
      }
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
            บ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                {settings.appName}
              </h1>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md font-mono">
                {settings.revision}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {settings.slogan || 'ระบบเตือนและควบคุมรายจ่ายประจำวัน & เดือน'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* User Settings Button (Change cover, name, slogan, change password, reset) */}
          <button
            onClick={onOpenUserSettings}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100 transition-colors shadow-2xs"
            title="ตั้งค่าหน้าปก ชื่อบิล และเปลี่ยนรหัสผ่าน"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">ตั้งค่า / รหัสผ่าน</span>
            <span className="sm:hidden">ตั้งค่า</span>
          </button>

          {/* Direct Reset User Data Button */}
          {onResetUserData && (
            <button
              onClick={handleDirectReset}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/90 hover:bg-rose-100 transition-colors shadow-2xs"
              title="เริ่มต้นระบบใหม่ (ล้างข้อมูลรายการทั้งหมด)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">เริ่มต้นระบบใหม่</span>
              <span className="sm:hidden">เริ่มใหม่</span>
            </button>
          )}

          {/* Admin Access (Hidden if regular user link) */}
          {!isUserView && (
            <button
              onClick={onOpenAdminAuth}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isAdmin
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="เข้าสู่ระบบ Admin"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'แอดมิน' : 'แอดมิน'}</span>
            </button>
          )}

          {/* Lock Screen Button */}
          {onLockApp && (
            <button
              onClick={onLockApp}
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="ล็อกหน้าจอ / ใส่รหัสใหม่"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Cover Image Banner (Compact, space-saving) */}
      <div className="max-w-4xl mx-auto px-4 pb-2.5">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
          <div
            className={`relative w-full transition-all duration-300 ${
              imageExpanded ? 'h-36 sm:h-48' : 'h-24 sm:h-28'
            }`}
          >
            {!imgError && settings.coverImage ? (
              <img
                src={settings.coverImage}
                alt="หน้าปกบิล"
                className="w-full h-full object-cover object-center"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 flex items-center justify-center p-3">
                <div className="text-center text-white">
                  <p className="text-xs font-semibold tracking-wide flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    {settings.appName} - {settings.slogan || 'ระบบเตือนงบและรายจ่าย'}
                  </p>
                </div>
              </div>
            )}

            {/* Subtle Gradient Scrim & Info Overlay: Custom Name and Slogan */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent flex items-end justify-between p-2.5 sm:p-3">
              <div className="text-white min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-white drop-shadow-md truncate">
                    {settings.appName || 'บิลเฮา'}
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md font-mono shrink-0 shadow-2xs">
                    {settings.revision}
                  </span>
                </div>
                {settings.slogan && (
                  <p className="text-[11px] sm:text-xs text-emerald-200 font-medium drop-shadow-sm truncate mt-0.5">
                    {settings.slogan}
                  </p>
                )}
              </div>

              {/* Actions on Cover Banner */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenUserSettings}
                  className="px-2 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1 border border-emerald-400/40 shadow-xs transition-all active:scale-95"
                  title="ตั้งค่าหน้าปกและชื่อบิล"
                >
                  <Palette className="w-3 h-3" />
                  <span>แต่งหน้าปก</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageExpanded(!imageExpanded)}
                  className="px-2 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] text-white/90 backdrop-blur-xs flex items-center gap-1 border border-white/20 transition-colors"
                  title={imageExpanded ? 'ย่อรูปหน้าปก' : 'ขยายรูปหน้าปก'}
                >
                  {imageExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span>ย่อ</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span>ขยาย</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2) บริเวณโซนการแจ้งเตือน
            2.1) ปรับเปลี่ยนสีพื้นหลังไล่จากสีขาวไปจนถึงสีแดงเข้ม ตามระดับความรุนแรง
            2.2) เสียงเตือน "วันนี้รายจ่ายเกินงบพรุ่งนี้เริ่มใหม่นะครับสู้ๆครับ" (ดัง 2-3 รอบ)
            ======================================================== */}
        {/* ========================================================
            ช่องเตือน: แสดงเเค่ (% / ยอดที่ตั้ง) พื้นหลังไล่สีตามระดับความรุนแรง
            ======================================================== */}
        <div
          className="mt-2 py-2 px-3 rounded-2xl border shadow-xs transition-all duration-500 animate-fade-in flex items-center justify-between gap-2"
          style={{
            background: severity.bg,
            borderColor: severity.borderColor,
          }}
        >
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold min-w-0" style={{ color: severity.textColor }}>
            <span className="truncate">
              ({dailyPercent}% / ฿{new Intl.NumberFormat('th-TH').format(Math.round(dailyBudget.amount))}) · ({monthlyPercent}% / ฿{new Intl.NumberFormat('th-TH').format(Math.round(monthlyBudget.amount))})
            </span>
          </div>

          {/* Voice Alert Trigger */}
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`p-1.5 rounded-xl transition-all shrink-0 shadow-2xs ${
              dailyPercent > 100
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
            title="กดเพื่อฟังเสียงเตือน"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
