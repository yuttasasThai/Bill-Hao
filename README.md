# บิลเฮา (Rev. 1.1.3)

โปรแกรมค่าใช้จ่ายประจำวันและเดือน เพื่อเตือนควบคุมรายจ่าย
ออกแบบสำหรับใช้งานผ่านมือถือและคอมพิวเตอร์อย่างสะดวกและสวยงาม

## วิธีการติดตั้งและรันในเครื่อง (Local Setup)

1. แตกไฟล์ .zip นี้
2. เปิด Terminal หรือ Command Prompt ในโฟลเดอร์นี้
3. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
4. เริ่มต้น Development Server:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` (หรือพอร์ตที่ Vite แสดง)

## วิธีการ Deploy ขึ้น GitHub และ Vercel

1. สร้าง GitHub Repository ใหม่ (เช่น `bill-hao-app`)
2. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub
3. เข้าสู่ระบบ https://vercel.com
4. กด **Add New Project** -> เลือก Repository จาก GitHub
5. Vercel จะตรวจจับการตั้งค่า Vite อัตโนมัติ:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. กด **Deploy** ใช้งานได้ทันที ไม่ติด error!
