# 🚀 Quick Start - Firestore Setup

## ขั้นตอนที่ต้องทำต่อ:

### 1. สร้าง Firebase Project
1. ไปที่ https://console.firebase.google.com/
2. คลิก "Add project"
3. ตั้งชื่อโปรเจกต์ เช่น "kohtao-nightboat"
4. เปิดใช้งาน Firestore Database (เลือก location: asia-southeast1)

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `server/.env` (ดูตัวอย่างจาก `server/.env.example`):

```env
FIREBASE_PROJECT_ID=your-project-id-here
SECRET_KEY=supersecretkey
PORT=3001
```

**หมายเหตุ**: แทนที่ `your-project-id-here` ด้วย Project ID จริงจาก Firebase Console

### 3. Seed Database
```bash
cd server
npm run seed
```

### 4. เริ่มต้น Server
```bash
npm run dev
```

## 📖 เอกสารเพิ่มเติม
อ่านรายละเอียดทั้งหมดได้ที่: `FIRESTORE_MIGRATION.md`

## ✅ สิ่งที่เสร็จแล้ว
- ✅ ติดตั้ง firebase-admin
- ✅ ลบ Prisma dependencies
- ✅ แปลง API ทั้งหมดให้ใช้ Firestore
- ✅ สร้าง seed script ใหม่
- ✅ อัพเดท package.json

## 🎯 Login Credentials (หลัง seed)
- Admin: `username: admin, password: admin123`
- Staff: `username: staff, password: staff123`
