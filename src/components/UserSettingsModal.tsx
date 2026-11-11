import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Upload,
  Check,
  RotateCcw,
  AlertTriangle,
  Save,
  Sparkles,
  Type,
  Quote,
  Lock,
  Key,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storage';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  isUserView: boolean;
  userToken?: string | null;
  onPasswordChanged?: (newPass: string) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  isUserView,
  userToken,
  onPasswordChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [appName, setAppName] = useState(settings.appName || 'บิลเฮา');
  const [slogan, setSlogan] = useState(settings.slogan || '');
  const [coverImage, setCoverImage] = useState(settings.coverImage || '');
  const [customUrl, setCustomUrl] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccessToast, setPassSuccessToast] = useState(false);

  if (!isOpen) return null;

  const presetCovers = [
    {
      name: 'AI Minimalist (บิลเฮา)',
      url: '/src/assets/images/cover_banner_1794189133145.jpg',
    },
    {
      name: 'Emerald Wealth (สีเขียวการเงิน)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="800" height="300" fill="url(%23g)"/><circle cx="100" cy="50" r="180" fill="%2310b981" opacity="0.15"/><circle cx="700" cy="250" r="150" fill="%2334d399" opacity="0.15"/><path d="M50 220 Q 250 80, 450 190 T 750 120" stroke="%2334d399" stroke-width="4" fill="none" opacity="0.4"/></svg>',
    },
    {
      name: 'Minimal Navy Vault (น้ำเงินเข้ม)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="800" height="300" fill="url(%23g2)"/><path d="M0 200 C 200 100, 400 250, 800 150 L 800 300 L 0 300 Z" fill="%230ea5e9" opacity="0.2"/></svg>',
    },
    {
      name: 'Sunset Glow (ส้มพาสเทลอบอุ่น)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c"/><stop offset="50%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23fbbf24"/></linearGradient></defs><rect width="800" height="300" fill="url(%23g3)"/><circle cx="200" cy="150" r="120" fill="%23ffffff" opacity="0.1"/><circle cx="650" cy="100" r="140" fill="%23ffffff" opacity="0.12"/></svg>',
    },
  ];

  // Handle local file upload (images from camera or gallery)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      appName: appName.trim() || 'บิลเฮา',
      slogan: slogan.trim(),
      coverImage: coverImage.trim() || settings.coverImage,
    };
    onSaveSettings(updated);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  const handleExecuteReset = () => {
    onResetData();
    setConfirmResetOpen(false);
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    const existingPassword = storageService.getUserPassword(userToken) || '1234';
    const cleanCurrent = currentPass.trim();

    // Check if current matches existing password or master password
    const isMaster =
      cleanCurrent.replace(/[^0-9]/g, '') === '0992256601' ||
      cleanCurrent === '099-225-6601';

    if (!isMaster && cleanCurrent !== existingPassword) {
      setPassError('รหัสผ่านเดิมไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านที่ได้รับจาก Admin');
      return;
    }

    const cleanNew = newPass.trim();
    if (cleanNew.length < 3) {
      setPassError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (cleanNew !== confirmPass.trim()) {
      setPassError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    storageService.saveUserPassword(cleanNew, userToken);
    if (onPasswordChanged) {
      onPasswordChanged(cleanNew);
    }

    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassSuccessToast(true);
    setTimeout(() => {
      setPassSuccessToast(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">ตั้งค่าโปรแกรม & ความปลอดภัย</h3>
              <p className="text-xs text-emerald-100">ปรับแต่งชื่อ สโลแกน หน้าปก และรหัสผ่านเข้าใช้งาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>หน้าปก & ข้อมูลบิล</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'security'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-teal-600" />
            <span>เปลี่ยนรหัสผ่าน</span>
          </button>
        </div>

        {/* Form Body - Tab 1: Profile & Cover */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto animate-fade-in">
            {/* Live Preview on Cover */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ตัวอย่างการแสดงผลบนหน้าปก
            </label>
            <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
              <img
                src={coverImage || settings.coverImage}
                alt="พรีวิวหน้าปก"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = presetCovers[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end justify-between p-3">
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-white drop-shadow-md truncate">
                    {appName || 'ชื่อบิลของคุณ'}
                  </h4>
                  {slogan && (
                    <p className="text-xs text-emerald-200 font-medium drop-shadow-sm truncate mt-0.5">
                      {slogan}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                  {settings.revision}
                </span>
              </div>
            </div>
          </div>

          {/* 1) ชื่อบิล */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>ชื่อบิลบนหน้าปก</span>
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="เช่น บิลบ้านเรา, บิลของฉัน สมชาย, บิลเฮา"
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-900 transition-all outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              จะแสดงเป็นชื่อหลักบนหน้าปก (สามารถกำหนดเป็นชื่อตัวเองหรือบ้านได้ตามต้องการ)
            </p>
          </div>

          {/* 2) สโลแกน */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-teal-600" />
              <span>สโลแกนประจำบิล</span>
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="เช่น ควบคุมรายจ่าย เพื่ออนาคตที่มั่นคง"
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-900 transition-all outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              แสดงใต้ชื่อบิลบนหน้าปก โดยไม่แสดงคำว่า &apos;สโลแกน&apos; รกหน้าจอ
            </p>
          </div>

          {/* 3) เลือกรูปภาพหน้าปก */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>เลือกภาพหน้าปก</span>
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetCovers.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`group relative h-16 rounded-xl overflow-hidden border-2 text-left transition-all ${
                    coverImage === preset.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 p-1.5 flex items-end justify-between">
                    <span className="text-[10px] font-bold text-white leading-tight drop-shadow-xs line-clamp-1">
                      {preset.name}
                    </span>
                    {coverImage === preset.url && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Upload from Device */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>อัปโหลดรูปจากโทรศัพท์ / เครื่อง</span>
              </button>
            </div>
          </div>

          {/* Section: ปุ่มเริ่มต้นระบบใหม่ (ล้างข้อมูลรายการทั้งหมด) */}
          <div className="pt-3 border-t border-slate-200">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-rose-900 leading-tight">
                    เริ่มต้นระบบใหม่ (ล้างข้อมูลทั้งหมด)
                  </h5>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    ล้างรายการรายจ่ายประจำวันและเดือนทั้งหมดให้เป็น 0 เพื่อเริ่มจดใหม่
                  </p>
                </div>
              </div>

              {!confirmResetOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-100/60 border border-rose-300 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>กดเพื่อเริ่มต้นระบบใหม่ (ล้างข้อมูล)</span>
                </button>
              ) : (
                <div className="bg-white rounded-xl p-3 border border-rose-300 space-y-2 animate-fade-in">
                  <p className="text-xs font-bold text-rose-900 text-center">
                    ยืนยันล้างข้อมูลรายการรายจ่ายทั้งหมดใช่หรือไม่?
                  </p>
                  <p className="text-[11px] text-slate-600 text-center">
                    (ยอดงบและรูปหน้าปกที่ตั้งไว้จะไม่หาย แต่รายการรายจ่ายทั้งหมดจะถูกล้างเป็น 0)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmResetOpen(false)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteReset}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                    >
                      ยืนยันล้างข้อมูล
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      )}

      {/* Form Body - Tab 2: Change Password (ตั้งรหัสผ่านใหม่ด้วยตัวเอง) */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-fade-in">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>ความปลอดภัยของบิลคุณ</span>
            </div>
            <p className="text-[11px] text-teal-700 leading-relaxed">
              คุณสามารถตั้งรหัสผ่านใหม่ได้ด้วยตนเอง เมื่อบันทึกแล้ว ทุกครั้งที่เปิดโปรแกรมหรือกดลิงค์บิลของคุณ ระบบจะใช้รหัสผ่านใหม่นี้ในการบูทเข้าใช้งาน
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-600" />
              <span>1. รหัสผ่านเดิม (ที่ได้รับจาก Admin หรือรหัสปัจจุบัน) *</span>
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPass}
              onChange={(e) => {
                setCurrentPass(e.target.value);
                if (passError) setPassError('');
              }}
              placeholder="กรอกรหัสผ่านเดิม..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. รหัสผ่านใหม่ที่คุณต้องการตั้ง *</span>
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
                if (passError) setPassError('');
              }}
              placeholder="เช่น 4-6 หลัก หรือคำที่คุณจำได้ง่าย"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. ยืนยันรหัสผ่านใหม่อีกครั้ง *</span>
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                if (passError) setPassError('');
              }}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้งเพื่อยืนยัน..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}</span>
            </button>
          </div>

          {passError && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 animate-shake">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{passError}</span>
            </p>
          )}

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกรหัสผ่านใหม่</span>
            </button>
          </div>
        </form>
      )}

      {/* Toasts */}
      {savedToast && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce z-50">
          <Check className="w-3.5 h-3.5" />
          <span>บันทึกการตั้งค่าสำเร็จ!</span>
        </div>
      )}

      {passSuccessToast && (
        <div className="absolute top-4 right-4 bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce z-50">
          <Check className="w-3.5 h-3.5" />
          <span>เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว!</span>
        </div>
      )}
    </div>
  </div>
);
};
