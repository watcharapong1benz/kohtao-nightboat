# ✅ แก้ไข API URL แล้ว!

## 🔧 การเปลี่ยนแปลง:

### 1. **`client/src/utils/api.js`**
- เปลี่ยนจาก: `http://localhost:3001`
- เป็น: `/api` (relative path)
- Firebase Hosting จะ rewrite `/api` ไปยัง Cloud Functions อัตโนมัติ

### 2. **`client/src/pages/Login.jsx`**
- เปลี่ยนจาก: `axios.post('http://localhost:3001/api/login', ...)`
- เป็น: `api.post('/login', ...)` (ใช้ api utility)

### 3. **Client Rebuild**
- ✅ Build เสร็จแล้ว (dist/assets/index-BV3rZEC-.js)

---

## 🚀 ขั้นตอนถัดไป:

### Deploy ใหม่:
```bash
firebase deploy --only hosting
```

หรือ deploy ทั้งหมด:
```bash
firebase deploy
```

---

## 🌐 ทดสอบหลัง Deploy:

1. เปิด: `https://kohtao-nightboat.web.app`
2. Login ด้วย:
   - Username: `admin`
   - Password: `admin123`
3. ตรวจสอบ Console ว่าไม่มี error `ERR_CONNECTION_REFUSED` อีก

---

## 💡 วิธีการทำงาน:

### Production (Firebase):
```
User → https://kohtao-nightboat.web.app
     → Request to /api/login
     → Firebase Hosting rewrites to Cloud Functions
     → Cloud Functions API responds
```

### Local Development:
```
User → http://localhost:5173 (Vite dev server)
     → VITE_API_URL=http://localhost:3001 (from .env)
     → Local Express server responds
```

---

## 📝 สำหรับ Local Development:

ถ้าต้องการทดสอบ local ให้สร้างไฟล์ `client/.env`:

```env
VITE_API_URL=http://localhost:3001
```

แล้วรัน:
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

---

**พร้อม Deploy แล้ว! รัน `firebase deploy --only hosting` เลยครับ** 🚀
