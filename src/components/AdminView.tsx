import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Shield,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  Plus,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Key,
  Trash2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Upload,
  AlertTriangle,
  FileArchive,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, UserLink } from '../types';
import { generateSourceZip, downloadBlob } from '../services/zipExporter';

interface AdminViewProps {
  settings: AppSettings;
  userLinks: UserLink[];
  onBack: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveUserLinks: (links: UserLink[]) => void;
  onTestExpiredModal: () => void;
  onLogoutAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  settings,
  userLinks,
  onBack,
  onSaveSettings,
  onSaveUserLinks,
  onTestExpiredModal,
  onLogoutAdmin,
}) => {
  // Tabs: 1) Cover & App Settings, 2) User Links, 3) Source Code & Revisions
  const [activeTab, setActiveTab] = useState<'cover' | 'links' | 'source'>('cover');

  // Cover Image States
  const [currentCover, setCurrentCover] = useState<string>(settings.coverImage);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [coverSavedToast, setCoverSavedToast] = useState(false);
  const [coverVerifiedOk, setCoverVerifiedOk] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App Settings / Revision
  const [revision, setRevision] = useState(settings.revision || 'Rev. 1.1.8');
  const [appName, setAppName] = useState(settings.appName || 'บิลเฮา');
  const [adminPhone, setAdminPhone] = useState(settings.adminPhone || '099-225-6601');
  const [adminName, setAdminName] = useState(settings.adminName || 'ช่างหน่อยชุมแพ');

  // User Links Generator States
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDays, setNewUserDays] = useState(30);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Source Zip Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessToast, setExportSuccessToast] = useState(false);

  // Handle Cover File Upload (reads file as Base64 data URL)
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
      setCurrentCover(result);
      setCoverVerifiedOk(true);
    };
    reader.readAsDataURL(file);
  };

  // Save Cover Image & Settings
  const handleSaveCoverAndSettings = () => {
    const updated: AppSettings = {
      ...settings,
      appName: appName.trim() || 'บิลเฮา',
      revision: revision.trim() || 'Rev. 1.0.8',
      coverImage: currentCover,
      adminPhone: adminPhone.trim() || '099-225-6601',
      adminName: adminName.trim() || 'ช่างหน่อยชุมแพ',
    };
    onSaveSettings(updated);
    setCoverSavedToast(true);
    setTimeout(() => setCoverSavedToast(false), 3000);
  };

  // Preset Cover Photos
  const presetCovers = [
    {
      name: 'หน้าปกค่าเริ่มต้น AI Minimalist (บิลเฮา)',
      url: '/src/assets/images/cover_banner_1794189133145.jpg',
    },
    {
      name: 'ธีมสีเขียวการเงิน Emerald Wealth (เรขาคณิต)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="800" height="300" fill="url(%23g)"/><circle cx="100" cy="50" r="180" fill="%2310b981" opacity="0.15"/><circle cx="700" cy="250" r="150" fill="%2334d399" opacity="0.15"/><path d="M50 220 Q 250 80, 450 190 T 750 120" stroke="%2334d399" stroke-width="4" fill="none" opacity="0.4"/><text x="400" y="160" font-family="sans-serif" font-size="32" font-weight="bold" fill="%23ffffff" text-anchor="middle">บิลเฮา - ควบคุมงบและรายจ่าย</text></svg>',
    },
    {
      name: 'ธีมโทนน้ำเงินเข้ม Minimal Navy Vault',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="800" height="300" fill="url(%23g2)"/><path d="M0 200 C 200 100, 400 250, 800 150 L 800 300 L 0 300 Z" fill="%230ea5e9" opacity="0.2"/><text x="400" y="160" font-family="sans-serif" font-size="28" font-weight="bold" fill="%2338bdf8" text-anchor="middle">Bill Hao Dashboard</text></svg>',
    },
  ];

  // Increment Revision
  const handleIncrementRevision = () => {
    const match = revision.match(/(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const major = match[1];
      const minor = match[2];
      const patch = parseInt(match[3], 10) + 1;
      const newRev = `Rev. ${major}.${minor}.${patch}`;
      setRevision(newRev);
      const updated = { ...settings, revision: newRev };
      onSaveSettings(updated);
    } else {
      const newRev = `${revision}-updated`;
      setRevision(newRev);
      const updated = { ...settings, revision: newRev };
      onSaveSettings(updated);
    }
  };

  // Create User Link
  const handleCreateUserLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    const uniqueToken = `${newUserName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}-${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + newUserDays * 24 * 60 * 60 * 1000).toISOString();

    const newLink: UserLink = {
      id: `u-${Date.now()}`,
      token: uniqueToken,
      userName: newUserName.trim(),
      userPhone: newUserPhone.trim() || undefined,
      password: newUserPassword.trim() || '1234',
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true,
      notes: `สร้างให้สิทธิ์ ${newUserDays} วัน`,
    };

    const updatedLinks = [newLink, ...userLinks];
    onSaveUserLinks(updatedLinks);

    // Reset inputs
    setNewUserName('');
    setNewUserPhone('');
    setNewUserPassword('');
    alert(`สร้างลิงก์สำหรับ "${newLink.userName}" สำเร็จแล้ว!\nรหัสผ่านเริ่มต้น: ${newLink.password}\nสามารถกดส่งข้อมูลให้ผู้ใช้ได้ทันที`);
  };

  // Copy Full Message (Link + Password + Info)
  const handleCopyFullMessage = (link: UserLink) => {
    const url = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(link.token)}`;
    const pass = link.password || '1234';
    const text = `✨ ลิงก์เข้าใช้งานโปรแกรม ${settings.appName || 'บิลเฮา'}\n👤 บิลของคุณ: ${link.userName}\n🌐 ลิงก์เข้าใช้งาน: ${url}\n🔑 รหัสผ่านเข้าใช้งาน: ${pass}\n(คุณสามารถตั้งรหัสผ่านใหม่ได้ด้วยตัวเองในโปรแกรม)\n📞 สอบถามเพิ่มเติม ช่างหน่อยชุมแพ ${adminPhone}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToken(`full-${link.token}`);
      setTimeout(() => setCopiedToken(null), 2500);
    });
  };

  // Edit User Password directly by Admin
  const handleEditPassword = (id: string, userName: string, currentPassword?: string) => {
    const newPass = prompt(`แก้ไข/ตั้งรหัสผ่านใหม่สำหรับ คุณ "${userName}":`, currentPassword || '1234');
    if (newPass === null) return;
    const cleanPass = newPass.trim();
    if (!cleanPass) {
      alert('รหัสผ่านต้องไม่ว่างเปล่า');
      return;
    }
    const updated = userLinks.map((l) => (l.id === id ? { ...l, password: cleanPass } : l));
    onSaveUserLinks(updated);
  };

  // Renew User Link Expiration (+30, +90, +365 days)
  const handleRenewLink = (id: string, additionalDays: number) => {
    const updated = userLinks.map((link) => {
      if (link.id !== id) return link;
      const currentExpiryMs = new Date(link.expiresAt).getTime();
      // If already expired, renew from now, else add to existing expiration
      const baseMs = currentExpiryMs > Date.now() ? currentExpiryMs : Date.now();
      const newExpiresAt = new Date(baseMs + additionalDays * 24 * 60 * 60 * 1000).toISOString();
      return {
        ...link,
        expiresAt: newExpiresAt,
        isActive: true,
      };
    });
    onSaveUserLinks(updated);
  };

  // Delete User Link
  const handleDeleteLink = (id: string, name: string) => {
    if (confirm(`ต้องการลบลิงก์ของผู้ใช้ "${name}" ใช่หรือไม่?`)) {
      const updated = userLinks.filter((l) => l.id !== id);
      onSaveUserLinks(updated);
    }
  };

  // Copy Link Helper
  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    });
  };

  // Download Source Code Zip
  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateSourceZip({
        revision,
        appName,
      });
      const cleanRev = revision.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `BillHao_SourceCode_${cleanRev}.zip`;
      downloadBlob(blob, filename);
      setExportSuccessToast(true);
      setTimeout(() => setExportSuccessToast(false), 4000);
    } catch (err) {
      console.error('Export ZIP error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด ZIP กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-4 animate-fade-in pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
              ระบบตั้งค่าแอดมิน (Admin Control)
            </h2>
            <span className="text-[10px] text-emerald-700 font-semibold">
              เข้าสู่ระบบสำเร็จ (รหัสผ่าน 099-225-6601)
            </span>
          </div>
        </div>

        <button
          onClick={onLogoutAdmin}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-medium transition-colors"
          title="ออกจากระบบ Admin"
        >
          ออกจากแอดมิน
        </button>
      </div>

      {/* Admin Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('cover')}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'cover'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>เปลี่ยนรูปหน้าปก</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'links'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
          <span>จัดการลิงก์ผู้ใช้ ({userLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'source'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>ดาวน์โหลด .ZIP & Rev</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: เปลี่ยนรูปภาพหน้าปก และ ข้อมูลแอดมิน
          ======================================================== */}
      {activeTab === 'cover' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              จัดการรูปภาพหน้าปก (Cover Image Manager)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เปลี่ยนรูปภาพหน้าปกจริงได้ทันที โดยอัปโหลดไฟล์รูปจากมือถือ/คอม หรือเลือกภาพธีมสำเร็จรูป
            </p>
          </div>

          {/* Current Live Cover Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                ตัวอย่างหน้าปกปัจจุบัน (Live Preview):
              </span>
              {coverVerifiedOk && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ตรวจสอบรูปภาพ: ใช้งานได้จริง 100%
                </span>
              )}
            </div>

            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-slate-100 shadow-xs">
              <img
                src={currentCover}
                alt="หน้าปกที่กำลังตั้งค่า"
                className="w-full h-full object-cover object-center"
                onError={() => setCoverVerifiedOk(false)}
                onLoad={() => setCoverVerifiedOk(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                <p className="text-xs font-bold text-white drop-shadow-xs">
                  หน้าปก: {appName} ({revision})
                </p>
              </div>
            </div>
          </div>

          {/* Action 1: Upload File from Device */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  อัปโหลดรูปภาพใหม่จากอุปกรณ์ (มือถือ/คอม)
                </p>
                <p className="text-[11px] text-slate-500">
                  รองรับไฟล์รูปภาพ JPG, PNG, WEBP บันทึกลงระบบทันที
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกไฟล์รูป...</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Action 2: Choose Presets */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">
              หรือเลือกรูปภาพหน้าปกธีมการเงินสำเร็จรูป:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presetCovers.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentCover(p.url);
                    setCoverVerifiedOk(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentCover === p.url
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-14 rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 truncate">
                    {p.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Action 3: Custom Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หรือระบุ URL รูปภาพ (URL Link):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (customImageUrl.trim()) {
                    setCurrentCover(customImageUrl.trim());
                    setCustomImageUrl('');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                ปรับใช้
              </button>
            </div>
          </div>

          {/* Admin Info Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800">
              ข้อมูลผู้ดูแลและติดต่อ (Admin Contact)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  ชื่อแอดมิน
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  เบอร์โทรติดต่อ (สำหรับแจ้งเตือนต่ออายุ)
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            {coverSavedToast ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                บันทึกการเปลี่ยนรูปหน้าปกสำเร็จแล้ว!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                เมื่อกดบันทึก หน้าจอหลักจะแสดงรูปนี้ทันที
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveCoverAndSettings}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกและเปลี่ยนรูปภาพหน้าปกจริง</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: สร้างและจัดการลิงก์สำหรับผู้ใช้ (User Links)
          ======================================================== */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Create User Link Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-600" />
                สร้างลิงก์สำหรับผู้ใช้ใหม่ (Create User Link)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดชื่อผู้ใช้, รหัสผ่าน (ไม่บังคับ), และกำหนดวันหมดอายุของลิงก์
              </p>
            </div>

            <form onSubmit={handleCreateUserLink} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้ (User) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="เช่น สมชาย ชุมแพ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรผู้ใช้
                  </label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน (ถ้ามี)
                  </label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Expiration Days Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  กำหนดอายุของลิงก์ (วันหมดอายุ):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '7 วัน', days: 7 },
                    { label: '30 วัน (1 เดือน)', days: 30 },
                    { label: '90 วัน (3 เดือน)', days: 90 },
                    { label: '180 วัน (6 เดือน)', days: 180 },
                    { label: '365 วัน (1 ปี)', days: 365 },
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setNewUserDays(p.days)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        newUserDays === p.days
                          ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างลิงก์สำหรับผู้ใช้</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test Expired Alert Button */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ทดสอบหน้าต่างแจ้งเตือนลิงก์หมดอายุ
              </p>
              <p className="text-[11px] text-amber-800">
                เมื่อผู้ใช้เปิดลิงก์ที่หมดอายุ จะแสดงข้อความเตือนให้ติดต่อ admin {adminName} {adminPhone}
              </p>
            </div>
            <button
              type="button"
              onClick={onTestExpiredModal}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 shadow-2xs"
            >
              ทดสอบ Pop-up หมดอายุ
            </button>
          </div>

          {/* User Links List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                รายชื่อลิงก์ผู้ใช้ทั้งหมด ({userLinks.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                สามารถกดต่ออายุได้ตลอดเวลา
              </span>
            </div>

            <div className="space-y-3">
              {userLinks.map((link) => {
                const expiryDate = new Date(link.expiresAt);
                const isExpired = expiryDate.getTime() < Date.now();
                const expiryFormatted = expiryDate.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={link.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isExpired
                        ? 'border-rose-200 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/40'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {link.userName}
                        </span>
                        {link.userPhone && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({link.userPhone})
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isExpired
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExpired ? 'หมดอายุแล้ว ❌' : 'ใช้งานได้ปกติ ✓'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <Key className="w-3 h-3 text-teal-600" />
                          รหัสผ่าน: <strong className="text-slate-900">{link.password || '1234'}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          วันหมดอายุ: <strong>{expiryFormatted}</strong>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          Token: ?user={link.token}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Send Info (Link+Pass), Copy Link, Edit Pass, Renew (+30, +90d), Delete */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Copy Full Message (Link + Password + Info) */}
                      <button
                        type="button"
                        onClick={() => handleCopyFullMessage(link)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                          copiedToken === `full-${link.token}`
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
                        }`}
                        title="คัดลอกข้อความพร้อมรหัสผ่านส่งให้ผู้ใช้ทางแชท/ไลน์"
                      >
                        {copiedToken === `full-${link.token}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>คัดลอกแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>ส่งข้อมูล+รหัส</span>
                          </>
                        )}
                      </button>

                      {/* Copy Link Only */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link.token)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                          copiedToken === link.token
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title="คัดลอกเฉพาะลิงก์"
                      >
                        {copiedToken === link.token ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>คัดลอกแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>ลิงก์</span>
                          </>
                        )}
                      </button>

                      {/* Edit Password Button */}
                      <button
                        type="button"
                        onClick={() => handleEditPassword(link.id, link.userName, link.password)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 transition-colors"
                        title="แก้ไขรหัสผ่านของผู้ใช้นี้"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* Renew Buttons */}
                      <button
                        type="button"
                        onClick={() => handleRenewLink(link.id, 30)}
                        className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                        title="ต่ออายุเพิ่มอีก 30 วัน"
                      >
                        +30 วัน
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRenewLink(link.id, 90)}
                        className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                        title="ต่ออายุเพิ่มอีก 90 วัน"
                      >
                        +90 วัน
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.id, link.userName)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="ลบลิงก์นี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ดาวน์โหลด Source Code แท้ (.ZIP) และ จัดการ Revision
          ======================================================== */}
      {activeTab === 'source' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              ดาวน์โหลด Source Code แท้สำหรับ GitHub & Vercel (.ZIP)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ส่งออกไฟล์ระบบฉบับสมบูรณ์เป็นไฟล์ .zip สำหรับดาวน์โหลดผ่านมือถือหรือคอมพิวเตอร์
              พร้อมขึ้น GitHub และ Vercel ได้ทันที ไม่ติด Error
            </p>
          </div>

          {/* Revision Control Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  จัดการ Revision ประจำเวอร์ชัน (5)
                </p>
                <p className="text-[11px] text-indigo-800">
                  เพิ่ม Revision รันไปเรื่อยๆ เพื่อไม่ให้สับสนเวลาอัปเดตไฟล์ขึ้นระบบ
                </p>
              </div>
              <button
                type="button"
                onClick={handleIncrementRevision}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs active:scale-[0.98] transition-all"
              >
                + รัน Revision (+0.0.1)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                  เลข Revision ปัจจุบัน
                </label>
                <input
                  type="text"
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs font-mono font-bold text-indigo-950 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                  ชื่อโปรแกรมในระบบ
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-950 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Big ZIP Download Button */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  Vite + React 19 + Tailwind CSS 4 + TypeScript
                </span>
                <h4 className="text-base font-bold text-white">
                  ดาวน์โหลดโค้ดแท้ BillHao_SourceCode_{revision.replace(/[^a-zA-Z0-9._-]/g, '_')}.zip
                </h4>
                <p className="text-xs text-slate-300">
                  ไฟล์ .zip แท้ (ไม่ใช่ .html) แตกไฟล์แล้วรัน `npm install && npm run build` ผ่าน 100%
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isExporting}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังสร้างไฟล์ .ZIP...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" />
                    <span>ดาวน์โหลด .ZIP เดี๋ยวนี้</span>
                  </>
                )}
              </button>
            </div>

            {exportSuccessToast && (
              <p className="text-xs text-emerald-300 font-medium flex items-center gap-1.5 animate-fade-in pt-1 border-t border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                เริ่มดาวน์โหลดไฟล์ .ZIP เรียบร้อยแล้ว! สามารถเปิดไฟล์บนมือถือหรือคอมพิวเตอร์ได้ทันที
              </p>
            )}
          </div>

          {/* Deploy Instructions Guide for GitHub & Vercel */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900">
              📋 คำแนะนำการนำขึ้น GitHub และ Vercel:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>แตกไฟล์ .zip ที่โหลดมาลงในโฟลเดอร์ในเครื่อง</li>
              <li>สร้าง Repository ใหม่ใน GitHub (เช่น `bill-hao`) แล้วนำไฟล์ขึ้น</li>
              <li>เข้าสู่ระบบที่ Vercel (vercel.com) แล้วเลือก "Import Git Repository"</li>
              <li>Vercel จะตั้งค่า Build ให้เป็น `npm run build` และ Output `dist` โดยอัตโนมัติ</li>
              <li>กด Deploy เว็บไซต์จะออนไลน์ทันที!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
