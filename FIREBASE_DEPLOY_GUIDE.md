# 🚀 Firebase Deployment Guide

## ✅ สิ่งที่เตรียมพร้อมแล้ว:

1. ✅ Firebase CLI ติดตั้งแล้ว
2. ✅ Client build เสร็จแล้ว (`client/dist/`)
3. ✅ Cloud Functions พร้อม deploy (`functions/`)
4. ✅ Firebase configuration files สร้างแล้ว
   - `firebase.json`
   - `firestore.rules`
   - `firestore.indexes.json`

---

## 📋 ขั้นตอนการ Deploy

### ขั้นตอนที่ 1: Login เข้า Firebase

เปิด Terminal และรันคำสั่ง:

```bash
firebase login
```

- เบราว์เซอร์จะเปิดขึ้นมา
- Login ด้วย Google Account ที่ใช้สร้าง Firebase Project
- อนุญาตให้ Firebase CLI เข้าถึง account ของคุณ

### ขั้นตอนที่ 2: เชื่อมต่อกับ Firebase Project

```bash
firebase use kohtao-nightboat
```

หรือถ้าไม่ได้ผล ให้รัน:

```bash
firebase use --add
```

แล้วเลือก project `kohtao-nightboat` จากรายการ

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

สำหรับ Cloud Functions ต้องตั้งค่า SECRET_KEY:

```bash
firebase functions:config:set app.secret_key="supersecretkey"
```

### ขั้นตอนที่ 4: Deploy ทั้งหมด

Deploy ทั้ง Hosting, Functions, และ Firestore Rules:

```bash
firebase deploy
```

**หรือ** deploy แยกส่วน:

```bash
# Deploy เฉพาะ Hosting (Frontend)
firebase deploy --only hosting

# Deploy เฉพาะ Functions (Backend API)
firebase deploy --only functions

# Deploy เฉพาะ Firestore Rules
firebase deploy --only firestore:rules
```

### ขั้นตอนที่ 5: รอให้ Deploy เสร็จ

การ deploy อาจใช้เวลา 3-5 นาที โดยเฉพาะ Cloud Functions

**ผลลัพธ์ที่ควรเห็น:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/kohtao-nightboat/overview
Hosting URL: https://kohtao-nightboat.web.app
Function URL (api): https://asia-southeast1-kohtao-nightboat.cloudfunctions.net/api
```

---

## 🌐 URL ที่ได้หลัง Deploy

### Frontend (Hosting):
- **Production URL:** `https://kohtao-nightboat.web.app`
- **Alternative URL:** `https://kohtao-nightboat.firebaseapp.com`

### Backend API (Cloud Functions):
- **API Base URL:** `https://asia-southeast1-kohtao-nightboat.cloudfunctions.net/api`
- **ตัวอย่าง:** 
  - Login: `POST https://asia-southeast1-kohtao-nightboat.cloudfunctions.net/api/api/login`
  - Get Tickets: `GET https://asia-southeast1-kohtao-nightboat.cloudfunctions.net/api/api/tickets`

---

## ⚙️ อัพเดท Client ให้ใช้ Production API

หลังจาก deploy แล้ว คุณต้องอัพเดท client ให้ชี้ไปที่ API บน Cloud Functions:

### วิธีที่ 1: ใช้ Relative Path (แนะนำ)

เนื่องจาก `firebase.json` มี rewrite rule แล้ว คุณสามารถใช้:

```javascript
// ใน client/src/ ไฟล์ที่เรียก API
const API_URL = '/api';  // จะ auto-route ไปที่ Cloud Functions
```

### วิธีที่ 2: ใช้ Environment Variable

สร้างไฟล์ `client/.env.production`:

```env
VITE_API_URL=/api
```

แล้วใช้ใน code:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

## 🔄 การ Deploy ครั้งถัดไป

เมื่อมีการแก้ไขโค้ด:

### 1. แก้ไข Client (Frontend)
```bash
cd client
npm run build
cd ..
firebase deploy --only hosting
```

### 2. แก้ไข Server (Backend API)
```bash
# แก้ไขไฟล์ functions/index.js
firebase deploy --only functions
```

### 3. Deploy ทั้งหมด
```bash
cd client
npm run build
cd ..
firebase deploy
```

---

## 🎯 ทดสอบหลัง Deploy

### 1. เปิดเว็บไซต์
```
https://kohtao-nightboat.web.app
```

### 2. ทดสอบ Login
- Username: `admin`
- Password: `admin123`

### 3. ตรวจสอบ API
ใช้ Postman หรือ curl:

```bash
curl https://asia-southeast1-kohtao-nightboat.cloudfunctions.net/api/api/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## ⚠️ Troubleshooting

### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Error: "Permission denied"
```bash
firebase login --reauth
```

### Error: "Functions deployment failed"
- ตรวจสอบว่า Billing เปิดใช้งานแล้ว (Cloud Functions ต้องใช้ Blaze Plan)
- ไปที่ Firebase Console > Upgrade to Blaze Plan

### Error: "CORS error" เมื่อเรียก API
- ตรวจสอบว่า `firebase.json` มี rewrite rules ถูกต้อง
- ตรวจสอบว่า client ใช้ relative path `/api` แทน full URL

### Functions ช้ามาก (Cold Start)
- Cloud Functions มี "cold start" ครั้งแรกอาจใช้เวลา 5-10 วินาที
- หลังจากนั้นจะเร็วขึ้น
- พิจารณาใช้ Firebase Hosting rewrites เพื่อลด latency

---

## 💰 ค่าใช้จ่าย

### Firebase Free Plan (Spark):
- ❌ **ไม่สามารถใช้ Cloud Functions ได้**
- ✅ Hosting: 10 GB/month
- ✅ Firestore: 1 GB storage, 50K reads/day

### Firebase Blaze Plan (Pay as you go):
- ✅ Cloud Functions: 2M invocations/month ฟรี
- ✅ Hosting: 10 GB/month ฟรี
- ✅ Firestore: 1 GB storage, 50K reads/day ฟรี
- 💳 เกินกว่านี้จะคิดตามการใช้งาน

**หมายเหตุ:** สำหรับ app ขนาดเล็ก-กลาง มักจะอยู่ใน free tier

---

## 📊 ตรวจสอบการใช้งาน

### Firebase Console:
1. ไปที่ https://console.firebase.google.com/
2. เลือก project `kohtao-nightboat`
3. ดูที่:
   - **Hosting:** ดู traffic และ bandwidth
   - **Functions:** ดู invocations และ errors
   - **Firestore:** ดู reads/writes

---

## 🔒 Security Checklist

หลัง deploy แล้ว ตรวจสอบ:

- [ ] Firestore Rules ถูกต้อง (`firestore.rules`)
- [ ] ไม่มี Service Account Key ใน Git
- [ ] SECRET_KEY ตั้งค่าใน Functions Config แล้ว
- [ ] CORS settings ถูกต้อง
- [ ] ทดสอบ authentication ทำงานได้

---

## 📝 คำสั่งที่ใช้บ่อย

```bash
# Login
firebase login

# ดู projects
firebase projects:list

# เลือก project
firebase use kohtao-nightboat

# Deploy ทั้งหมด
firebase deploy

# Deploy เฉพาะ hosting
firebase deploy --only hosting

# Deploy เฉพาะ functions
firebase deploy --only functions

# ดู logs ของ functions
firebase functions:log

# ทดสอบ locally
firebase emulators:start

# Logout
firebase logout
```

---

## 🎉 สำเร็จ!

หลังจาก deploy แล้ว คุณจะมี:
- ✅ Frontend ที่ `https://kohtao-nightboat.web.app`
- ✅ Backend API ที่ Cloud Functions
- ✅ Database ที่ Firestore
- ✅ ทุกอย่างทำงานบน Firebase!

---

**พร้อม Deploy แล้ว! รันคำสั่งด้านบนตามลำดับเลยครับ** 🚀
