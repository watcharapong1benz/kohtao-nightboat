# 🔥 Firebase Setup Guide - ขั้นตอนละเอียด

## ⚠️ ปัญหาที่เจอ:
1. ✅ **nodemon ไม่ได้ติดตั้ง** - แก้ไขแล้ว!
2. ⏳ **Firebase credentials ยังไม่ได้ตั้งค่า** - ต้องทำตามขั้นตอนด้านล่าง

---

## 📋 ขั้นตอนการตั้งค่า Firebase (ทำตามลำดับ)

### ขั้นตอนที่ 1: เข้า Firebase Console
1. เปิดเบราว์เซอร์ไปที่: **https://console.firebase.google.com/**
2. Login ด้วย Google Account ของคุณ

### ขั้นตอนที่ 2: สร้าง Firebase Project
1. คลิกปุ่ม **"Add project"** หรือ **"Create a project"**
2. ตั้งชื่อโปรเจกต์: `kohtao-nightboat` (หรือชื่ออื่นที่ต้องการ)
3. คลิก **Continue**
4. (Optional) เลือกว่าจะเปิด Google Analytics หรือไม่
5. คลิก **Create project**
6. รอสักครู่จนกว่าโปรเจกต์จะถูกสร้างเสร็จ
7. คลิก **Continue** เพื่อเข้าสู่ Dashboard

### ขั้นตอนที่ 3: เปิดใช้งาน Firestore Database
1. ในเมนูด้านซ้าย คลิก **"Build"** > **"Firestore Database"**
2. คลิกปุ่ม **"Create database"**
3. เลือก **"Start in test mode"** (สำหรับการทดสอบ)
   - ⚠️ Test mode จะอนุญาตให้ทุกคนเข้าถึงได้ 30 วัน
   - สำหรับ production ควรใช้ Production mode และตั้งค่า Security Rules
4. เลือก **Location**: `asia-southeast1 (Singapore)` หรือ `asia-east1 (Taiwan)`
   - เลือกที่ใกล้ประเทศไทยที่สุด
5. คลิก **Enable**
6. รอสักครู่จนกว่า Firestore จะถูกสร้างเสร็จ

### ขั้นตอนที่ 4: คัดลอก Project ID
1. คลิกไอคอน **⚙️ (Settings)** ข้างชื่อโปรเจกต์ด้านบนซ้าย
2. เลือก **"Project settings"**
3. ในหน้า General คุณจะเห็น:
   ```
   Project name: kohtao-nightboat
   Project ID: kohtao-nightboat-xxxxx  ← คัดลอกตัวนี้
   ```
4. **คัดลอก Project ID** (จะมีรูปแบบคล้าย `kohtao-nightboat-xxxxx`)

### ขั้นตอนที่ 5: อัพเดทไฟล์ .env
1. เปิดไฟล์ `server/.env`
2. แก้ไขบรรทัดที่ 2:
   ```env
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```
   เป็น:
   ```env
   FIREBASE_PROJECT_ID=kohtao-nightboat-xxxxx
   ```
   (แทนที่ `kohtao-nightboat-xxxxx` ด้วย Project ID ที่คัดลอกมา)

3. บันทึกไฟล์

---

## ✅ ทดสอบว่าตั้งค่าถูกต้อง

### 1. Seed Database
```bash
npm run seed
```

**ผลลัพธ์ที่ควรเห็น:**
```
✅ Firebase initialized successfully
🌱 Starting Firestore database seed...
✅ Created admin user: admin
✅ Created staff user: staff
✅ Created sample ticket: xxxxx
✅ Created sample parcel: xxxxx
🎉 Firestore database seeded successfully!

📝 Login credentials:
Admin - username: admin, password: admin123
Staff - username: staff, password: staff123
```

### 2. เริ่มต้น Server
```bash
npm run dev
```

**ผลลัพธ์ที่ควรเห็น:**
```
✅ Firebase initialized successfully
Server running on port 3001
```

---

## 🔍 ตรวจสอบข้อมูลใน Firestore

1. กลับไปที่ Firebase Console
2. คลิก **Firestore Database** ในเมนูซ้าย
3. คุณจะเห็น Collections:
   - `users` (2 documents: admin, staff)
   - `tickets` (1 document)
   - `parcels` (1 document)

---

## ⚠️ Troubleshooting

### Error: "Could not load the default credentials"
**สาเหตุ:** ไม่ได้ตั้งค่า `FIREBASE_PROJECT_ID` ใน `.env`

**วิธีแก้:**
1. ตรวจสอบว่าไฟล์ `.env` มีบรรทัด `FIREBASE_PROJECT_ID=...`
2. ตรวจสอบว่า Project ID ถูกต้อง (ไม่มีช่องว่างหรืออักขระพิเศษ)
3. ลอง restart terminal และรัน `npm run seed` อีกครั้ง

### Error: "Missing or insufficient permissions"
**สาเหตุ:** Firestore Security Rules ไม่อนุญาต

**วิธีแก้:**
1. ไปที่ Firebase Console > Firestore Database > Rules
2. เปลี่ยนเป็น:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // อนุญาตทุกคน (ใช้สำหรับทดสอบเท่านั้น!)
       }
     }
   }
   ```
3. คลิก **Publish**

### Error: "The query requires an index"
**สาเหตุ:** Firestore ต้องการ composite index สำหรับ query บางตัว

**วิธีแก้:**
1. Firestore จะแสดง link ใน error message
2. คลิก link นั้นเพื่อสร้าง index อัตโนมัติ
3. รอสักครู่จนกว่า index จะถูกสร้างเสร็จ (สถานะเป็น "Enabled")
4. ลองรัน query อีกครั้ง

---

## 🎯 สรุป

หลังจากทำตามขั้นตอนทั้งหมดแล้ว คุณจะสามารถ:
- ✅ รัน `npm run seed` ได้สำเร็จ
- ✅ รัน `npm run dev` ได้สำเร็จ
- ✅ เห็นข้อมูลใน Firestore Console
- ✅ Login เข้าระบบด้วย admin/admin123 หรือ staff/staff123

---

## 📞 ต้องการความช่วยเหลือ?

ถ้ายังมีปัญหา ให้ส่ง:
1. Screenshot ของ error message
2. เนื้อหาในไฟล์ `.env` (ซ่อน sensitive data)
3. Output จากคำสั่ง `npm run seed`
