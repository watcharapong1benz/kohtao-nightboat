# 🎯 Quick Start: Deploy to Render.com

## ขั้นตอนสั้นๆ:

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Web Service on Render.com
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo

### 3. Configure:
- **Build Command:** `chmod +x build.sh && ./build.sh`
- **Start Command:** `cd server && node index.js`
- **Environment Variables:**
  - `FIREBASE_PROJECT_ID` = `kohtao-nightboat`
  - `SECRET_KEY` = `supersecretkey`
  - `FIREBASE_SERVICE_ACCOUNT` = (คัดลอกจาก `server/serviceAccountKey.json` แปลงเป็น 1 บรรทัด)

### 4. Deploy!

---

## 📝 วิธีแปลง serviceAccountKey.json เป็น 1 บรรทัด:

### Windows (PowerShell):
```powershell
Get-Content server\serviceAccountKey.json | ConvertTo-Json -Compress
```

### หรือ Manual:
1. เปิดไฟล์ `server/serviceAccountKey.json`
2. คัดลอกทั้งหมด
3. ลบ newlines ออก (ทำให้เป็นบรรทัดเดียว)
4. Paste ใน Render environment variable

---

## 🎉 เสร็จแล้ว!

URL: `https://kohtao-nightboat.onrender.com`

Login:
- Username: `admin`
- Password: `admin123`

---

**อ่านรายละเอียดเพิ่มเติมที่: `RENDER_DEPLOY_GUIDE.md`**
