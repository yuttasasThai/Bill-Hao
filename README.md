# บิลเฮา (Rev. 1.1.5)

โปรแกรมค่าใช้จ่ายประจำวันและเดือน เพื่อเตือนควบคุมรายจ่าย
พัฒนาด้วย React 19 + TypeScript + Vite 8 + Tailwind CSS v4

---

## 🚀 วิธีการรันในเครื่อง (Local Development)

1. แตกไฟล์ .zip นี้ลงในโฟลเดอร์ที่ต้องการ
2. เปิด Terminal หรือ VS Code ในโฟลเดอร์นั้น
3. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
4. เริ่มต้น Development Server:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

## 🌐 วิธีการ Deploy ขึ้น GitHub และ Vercel (ผ่าน 100% ไม่มี Error)

1. **สร้าง Git Repository ใหม่**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Bill Hao App Rev. 1.1.5"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main --force
   ```

2. **Deploy บน Vercel (https://vercel.com)**:
   - เข้าหน้า Vercel Dashboard
   - กดปุ่ม **Add New...** -> **Project**
   - นำเข้า (Import) Repository จาก GitHub ที่เพิ่ง Push ขึ้นไป
   - Vercel จะตรวจพบการตั้งค่าอัตโนมัติ:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - กดปุ่ม **Deploy**
   - รอประมาณ 30-45 วินาที ระบบจะ Deploy สำเร็จ 100% พร้อมลิงก์ใช้งานทันที!

---

## 🔑 ข้อมูลสิทธิ์ผู้ดูแลระบบ (Admin)
- **รหัสผ่านเข้า Admin**: `099-225-6601`
- **ติดต่อผู้ดูแล**: ช่างหน่อยชุมแพ โทร `099-225-6601`
