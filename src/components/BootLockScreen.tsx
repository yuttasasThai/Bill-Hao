import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  Phone,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { AppSettings, UserLink } from '../types';
import { playAttentionChime } from '../services/soundAlert';
import { storageService } from '../services/storage';

interface BootLockScreenProps {
  settings: AppSettings;
  currentUserLink?: UserLink;
  isUserView: boolean;
  onUnlock: () => void;
  onPasswordChange?: (newPass: string) => void;
}

export const BootLockScreen: React.FC<BootLockScreenProps> = ({
  settings,
  currentUserLink,
  isUserView,
  onUnlock,
  onPasswordChange,
}) => {
  const [phase, setPhase] = useState<'passcode' | 'booting'>('passcode');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMessage, setBootMessage] = useState('กำลังบูทระบบ...');

  // Target passwords for this session:
  // 1. Password assigned by admin on the UserLink (or default 1234)
  // 2. Custom password set by user in the Settings menu (บันทึกจากเมนูตั้งค่า)
  // 3. User phone number (if registered)
  // 4. Master password '099-225-6601' / '0992256601' (Master override)
  // 5. Default '1234' if none configured
  const validatePassword = (input: string): boolean => {
    const cleanInput = input.trim();
    const cleanDigits = input.replace(/[^0-9]/g, '');

    // Master password always works
    if (cleanDigits === '0992256601' || cleanInput === '099-225-6601') {
      return true;
    }

    // 1. Check custom saved user password for this user link/device (set via Settings menu)
    const userStoredPassword = storageService.getUserPassword(currentUserLink?.token);
    if (userStoredPassword && cleanInput === userStoredPassword) {
      return true;
    }

    // 2. Check if admin configured a specific password on this UserLink
    if (currentUserLink?.password && currentUserLink.password.trim()) {
      if (cleanInput === currentUserLink.password.trim()) {
        return true;
      }
    }

    // 3. If user phone is registered on link, phone number also works as password
    if (currentUserLink?.userPhone) {
      const cleanPhone = currentUserLink.userPhone.replace(/[^0-9]/g, '');
      if (cleanDigits === cleanPhone && cleanDigits.length >= 8) {
        return true;
      }
    }

    // 4. Default universal passcode if no specific password was configured
    if (!currentUserLink?.password && !userStoredPassword && (cleanDigits === '1234' || cleanInput === '1234')) {
      return true;
    }

    return false;
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError(true);
      setErrorMessage('กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน');
      return;
    }

    if (validatePassword(password)) {
      setError(false);
      // Play chime and transition to Booting phase
      playAttentionChime();
      setPhase('booting');
    } else {
      setError(true);
      setErrorMessage('รหัสผ่านไม่ถูกต้อง กรุณากรอกรหัสที่ได้รับจาก Admin หรือรหัสที่คุณตั้งไว้');
    }
  };

  // Quick Keypad Press
  const handleKeypadPress = (val: string) => {
    if (error) setError(false);
    if (val === 'backspace') {
      setPassword((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPassword('');
    } else {
      setPassword((prev) => prev + val);
    }
  };

  // Booting Phase Timer (3.6 seconds smoothly loading 0% -> 100%)
  const fullCreatorText = 'สร้างสรรค์โดยช่างหน่อยชุมแพ0992256601';
  const [typedCreatorText, setTypedCreatorText] = useState('');

  useEffect(() => {
    if (phase !== 'booting') return;

    const startTime = Date.now();
    const duration = 3600; // 3.6 seconds (3-4 seconds as requested)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setBootProgress(progress);

      // Typewriter effect: type out letter-by-letter as boot progresses
      const typedLen = Math.min(
        Math.max(Math.floor(((progress - 5) / 80) * fullCreatorText.length), 0),
        fullCreatorText.length
      );
      setTypedCreatorText(fullCreatorText.slice(0, typedLen));

      if (progress < 25) {
        setBootMessage('⚙️ กำลังตรวจสอบความปลอดภัยและบูทระบบ...');
      } else if (progress < 60) {
        setBootMessage('📊 กำลังโหลดงบประมาณและข้อมูลรายจ่าย...');
      } else if (progress < 85) {
        setBootMessage('📱 กำลังเตรียมอินเทอร์เฟซ 4 ช่องควบคุม...');
      } else {
        setBootMessage('✨ เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        // Completed booting! Reveal main dashboard
        setTimeout(() => {
          onUnlock();
        }, 150);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [phase, onUnlock]);

  // =========================================================================
  // Phase 2: BOOTING SCREEN (3-4 วินาที โชว์ภาพหน้าปก + ชื่อโปรแกรม + พิมพ์ดีดชื่อผู้สร้าง)
  // =========================================================================
  if (phase === 'booting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 text-white animate-fade-in select-none">
        {/* Background Cover Photo with Ken Burns Zoom & Scrim */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={settings.coverImage}
            alt={settings.appName}
            className="w-full h-full object-cover object-center scale-110 animate-pulse duration-1000 opacity-40 filter blur-[1px]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/65" />
        </div>

        {/* Center Boot Content */}
        <div className="relative z-10 w-full max-w-sm px-5 flex flex-col items-center text-center space-y-4 animate-scale-in">
          {/* Logo Badge */}
          <div className="relative">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-teal-200">
                  บ
                </span>
              </div>
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-emerald-500/20 blur-lg -z-10 animate-ping duration-1000" />
          </div>

          {/* Program Name & Slogan (โชว์หน้าปกและชื่อโปรแกรมขณะบูท) */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {settings.appName || 'บิลเฮา'}
              </h1>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {settings.revision}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-xs drop-shadow-xs">
              {settings.slogan || 'ระบบเตือนและควบคุมรายจ่ายประจำวัน & เดือน'}
            </p>
          </div>

          {/* Typewriter Creator Name (ตัวหนังสือพิมพ์ดีดทีละตัว) */}
          <div className="w-full pt-1">
            <div className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl shadow-emerald-500/10 backdrop-blur-md flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="font-mono text-xs sm:text-sm font-bold text-emerald-300 tracking-wider flex items-center justify-center min-h-[1.5rem] break-all">
                <span>{typedCreatorText}</span>
                <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1 animate-pulse shrink-0" />
              </div>
            </div>
          </div>

          {/* Boot Progress Bar */}
          <div className="w-full space-y-2 pt-2">
            <div className="w-full h-2 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden p-0.5 backdrop-blur-md">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-75 shadow-sm shadow-emerald-400/50"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="truncate pr-2 text-emerald-300">{bootMessage}</span>
              <span className="font-bold text-white shrink-0">{bootProgress}%</span>
            </div>
          </div>
        </div>

        {/* Footer Subtitle */}
        <div className="absolute bottom-5 inset-x-0 text-center text-[11px] text-slate-500">
          <span>ระบบจัดการงบและค่าใช้จ่ายประจำวันและเดือน</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Phase 1: PASSCODE SCREEN (ต้องใส่รหัสทุกครั้งที่เปิดโปรแกรมหรือกดลิงค์)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-in">
        {/* Top Cover Banner */}
        <div className="relative h-24 sm:h-28 w-full bg-slate-900 overflow-hidden">
          <img
            src={settings.coverImage}
            alt="หน้าปก"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-3.5">
            <div className="text-white min-w-0 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-white drop-shadow-md truncate">
                  {settings.appName || 'บิลเฮา'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {settings.revision}
                </span>
              </div>
              {settings.slogan && (
                <p className="text-[11px] text-emerald-200 truncate mt-0.5 font-medium">
                  {settings.slogan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* User Welcome or Title */}
          <div className="text-center space-y-1">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {currentUserLink?.userName
                ? `ยินดีต้อนรับ คุณ${currentUserLink.userName}`
                : `ระบบความปลอดภัย ${settings.appName}`}
            </h2>
            <p className="text-xs text-slate-500">
              {currentUserLink?.password
                ? 'กรุณากรอกรหัสผ่านที่ได้รับจาก Admin เพื่อบูทเข้าใช้งานโปรแกรม'
                : 'กรุณากรอกรหัสผ่านเพื่อบูทเข้าใช้งานโปรแกรม'}
            </p>
          </div>

          {/* Password Input Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="กรอกรหัสผ่านเข้าใช้งาน..."
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 text-sm tracking-wider font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage || 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'}</span>
                </p>
              )}
            </div>

            {/* Quick Touch Keypad for Fast Mobile Entry */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
                (btn, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (btn === '⌫') handleKeypadPress('backspace');
                      else if (btn === 'C') handleKeypadPress('clear');
                      else handleKeypadPress(btn);
                    }}
                    className="h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm flex items-center justify-center transition-colors font-mono select-none"
                  >
                    {btn}
                  </button>
                )
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <span>ยืนยันรหัส & บูทเข้าโปรแกรม</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Helper hint: password change is inside Settings menu */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-[11px] text-slate-500">
              💡 เมื่อเข้าสู่โปรแกรมแล้ว สามารถไปที่เมนู <strong className="text-slate-700">"ตั้งค่า"</strong> เพื่อเปลี่ยนรหัสผ่านเป็นของตัวเองได้ตลอดเวลา
            </p>
          </div>

          {/* Footer Contact Help */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              ติดต่อขอรับรหัสผ่านหรือต่ออายุ:
            </p>
            <a
              href="tel:0992256601"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mt-0.5"
            >
              <Phone className="w-3 h-3" />
              <span>ช่างหน่อยชุมแพ 099-225-6601</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
