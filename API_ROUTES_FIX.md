# ✅ แก้ไข API Routes แล้ว!

## 🔧 **ปัญหา:**

URL ที่เรียก: `/api/api/dashboard` (ซ้ำ `/api` 2 ครั้ง)

**สาเหตุ:**
1. Firebase Hosting rewrite `/api` → Cloud Function `api`
2. Cloud Function มี routes ที่ขึ้นต้นด้วย `/api` อีกที
3. เลยได้ `/api` + `/api/dashboard` = `/api/api/dashboard`

## ✅ **วิธีแก้:**

เอา `/api` prefix ออกจากทุก routes ใน `functions/index.js`:

**จาก:**
```javascript
app.post('/api/login', ...)
app.get('/api/tickets', ...)
app.get('/api/dashboard', ...)
```

**เป็น:**
```javascript
app.post('/login', ...)
app.get('/tickets', ...)
app.get('/dashboard', ...)
```

## 🔄 **วิธีการทำงานที่ถูกต้อง:**

```
User Request → /api/login
           ↓
Firebase Hosting rewrite → Cloud Function 'api'
           ↓
Express app.post('/login') ← ไม่มี /api prefix
           ↓
Response
```

## 🚀 **กำลัง Deploy Functions...**

```bash
firebase deploy --only functions
```

รอสักครู่ (3-5 นาที) เพื่อให้ Cloud Functions อัพเดท

---

## 🎯 **หลัง Deploy เสร็จ:**

1. เปิด `https://kohtao-nightboat.web.app`
2. Login ด้วย admin/admin123
3. ตรวจสอบ Network tab ว่า:
   - ✅ `/api/login` → 200 OK
   - ✅ `/api/dashboard` → 200 OK (ไม่ใช่ `/api/api/dashboard`)
   - ✅ `/api/tickets` → 200 OK
   - ✅ ทุกอย่างทำงานได้!

---

**กำลัง deploy... รอสักครู่นะครับ** 🚀
