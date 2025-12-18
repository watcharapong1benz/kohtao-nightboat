# ✅ แก้ไข Environment Variables แล้ว!

## 🔧 **ปัญหา:**
Client ยังใช้ `VITE_API_URL=http://localhost:3001` เมื่อ build → เรียก localhost แทน Cloud Functions

## ✅ **แก้ไข:**
สร้างไฟล์ `client/.env.production`:
```env
VITE_API_URL=/api
```

Vite จะใช้ไฟล์นี้เมื่อรัน `npm run build` (production mode)

## ✅ **Build เสร็จแล้ว:**
- ไฟล์ใหม่: `dist/assets/index-Dt48CDKM.js`
- ใช้ API URL: `/api` (relative path)

---

## 🚀 **Deploy ตอนนี้:**

```bash
firebase deploy --only hosting
```

---

## 📝 **Environment Files:**

### `.env.production` (สำหรับ production build)
```env
VITE_API_URL=/api
```
→ ใช้เมื่อรัน `npm run build`

### `.env` (สำหรับ local development)
```env
VITE_API_URL=http://localhost:3001
```
→ ใช้เมื่อรัน `npm run dev`

---

## 🎯 **หลัง Deploy:**

1. เปิด `https://kohtao-nightboat.web.app`
2. เปิด DevTools (F12) → Network tab
3. Login และดูว่า request ไปที่:
   - ✅ `/api/login` (ไม่ใช่ localhost)
   - ✅ Status: 200 OK
4. Login สำเร็จ!

---

**พร้อมแล้ว! รัน `firebase deploy --only hosting` เลยครับ** 🚀
