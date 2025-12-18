# 🔄 แก้ไขอีกครั้ง - เปลี่ยนกลับมาใช้ /api prefix

## 🔍 **ปัญหาที่พบ:**

Firebase Hosting rewrite:
```json
{
  "source": "/api/**",
  "function": "api"
}
```

เมื่อ user เรียก `/api/login`:
1. Firebase Hosting ส่ง **path ทั้งหมด** (`/api/login`) ไปยัง function
2. Function ต้องมี route `/api/login` ไม่ใช่ `/login`

## ✅ **วิธีแก้:**

เปลี่ยนกลับให้ทุก routes ใน `functions/index.js` มี `/api` prefix:

```javascript
app.post('/api/login', ...)
app.get('/api/tickets', ...)
app.get('/api/dashboard', ...)
```

## 🚀 **กำลัง Deploy...**

```bash
firebase deploy --only functions
```

รอสักครู่ (3-5 นาที)

---

## 🎯 **หลัง Deploy เสร็จ:**

1. เปิด `https://kohtao-nightboat.web.app`
2. Login ด้วย admin/admin123
3. ระบบจะทำงานได้!

---

**กำลัง deploy... รอสักครู่นะครับ** 🚀
