# 🚀 Render.com Deployment Guide

## ✅ ไฟล์ที่เตรียมพร้อมแล้ว:
- `build.sh` - Build script สำหรับ Render
- `server/index.js` - พร้อม serve static files
- `client/dist/` - Build output

---

## 📋 ขั้นตอนการ Deploy

### 1. Push Code ขึ้น GitHub

```bash
# ใน root directory
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

**หมายเหตุ:** ถ้ายังไม่มี Git repository ให้สร้างก่อน:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

---

### 2. สร้าง Web Service บน Render.com

1. ไปที่ https://render.com และ Sign up/Login
2. คลิก **"New +"** → **"Web Service"**
3. เชื่อมต่อ GitHub repository ของคุณ
4. เลือก repository `kohtao-nightboat`

---

### 3. ตั้งค่า Web Service

#### **Basic Settings:**
- **Name:** `kohtao-nightboat` (หรือชื่ออื่นที่ต้องการ)
- **Region:** Singapore (ใกล้ไทยที่สุด)
- **Branch:** `main`
- **Root Directory:** (ว่างไว้)

#### **Build & Deploy:**
- **Runtime:** `Node`
- **Build Command:** 
  ```
  chmod +x build.sh && ./build.sh
  ```
- **Start Command:**
  ```
  cd server && node index.js
  ```

#### **Instance Type:**
- เลือก **Free** (ฟรี แต่จะ sleep หลัง 15 นาทีไม่ใช้งาน)

---

### 4. ตั้งค่า Environment Variables

คลิกที่ **"Advanced"** → **"Add Environment Variable"**

เพิ่ม variables เหล่านี้:

| Key | Value |
|-----|-------|
| `GOOGLE_APPLICATION_CREDENTIALS` | (ไม่ต้องใส่ - จะใช้วิธีอื่น) |
| `FIREBASE_PROJECT_ID` | `kohtao-nightboat` |
| `SECRET_KEY` | `supersecretkey` |
| `PORT` | `3001` |

**สำหรับ Firebase Service Account:**

คุณต้องคัดลอกเนื้อหาจากไฟล์ `server/serviceAccountKey.json` แล้วแปลงเป็น string บรรทัดเดียว:

1. เปิดไฟล์ `server/serviceAccountKey.json`
2. คัดลอกเนื้อหาทั้งหมด
3. ลบ newlines ออก (ทำให้เป็น 1 บรรทัด)
4. เพิ่ม environment variable:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** `{"type":"service_account","project_id":"kohtao-nightboat",...}` (JSON ทั้งหมดในบรรทัดเดียว)

---

### 5. Deploy!

คลิก **"Create Web Service"**

Render จะ:
1. Clone repository
2. รัน build script
3. Start server
4. ให้ URL เช่น `https://kohtao-nightboat.onrender.com`

---

## 🎯 หลัง Deploy สำเร็จ

### ทดสอบ:
1. เปิด URL ที่ได้ เช่น `https://kohtao-nightboat.onrender.com`
2. Login ด้วย:
   - Username: `admin`
   - Password: `admin123`
3. ทดสอบสร้าง ticket/parcel

---

## 🔄 การ Deploy ครั้งถัดไป

เมื่อแก้ไขโค้ด:

```bash
git add .
git commit -m "Update code"
git push origin main
```

Render จะ auto-deploy ให้อัตโนมัติ!

---

## ⚠️ สิ่งสำคัญ

### Free Tier Limitations:
- ✅ ฟรี 750 ชั่วโมง/เดือน
- ⚠️ Sleep หลัง 15 นาทีไม่ใช้งาน
- ⚠️ ครั้งแรกที่เข้าหลัง sleep จะใช้เวลา 30-60 วินาที

### ถ้าต้องการไม่ให้ sleep:
- อัพเกรดเป็น Paid plan ($7/month)
- หรือใช้ service อย่าง UptimeRobot ping ทุก 5 นาที

---

## 🆘 Troubleshooting

### Build ล้มเหลว:
- ตรวจสอบ logs ใน Render dashboard
- ตรวจสอบว่า `build.sh` มี execute permission

### Server ไม่ start:
- ตรวจสอบ environment variables
- ตรวจสอบว่า `FIREBASE_SERVICE_ACCOUNT` ถูกต้อง

### ไม่สามารถเชื่อมต่อ Firestore:
- ตรวจสอบ `FIREBASE_PROJECT_ID`
- ตรวจสอบ `FIREBASE_SERVICE_ACCOUNT` (ต้องเป็น JSON string ที่ valid)

---

## 📝 Next Steps

1. Push code ขึ้น GitHub
2. สร้าง Web Service บน Render
3. ตั้งค่า environment variables
4. Deploy!

**พร้อมแล้ว! มาเริ่มกันเลยครับ** 🚀
