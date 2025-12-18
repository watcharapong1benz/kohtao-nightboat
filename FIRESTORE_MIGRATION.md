# Migration จาก Prisma ไปยัง Cloud Firestore

## ✅ สิ่งที่เปลี่ยนแปลง

### 1. Dependencies
- **ลบออก**: `@prisma/client`, `prisma`, `pg` (PostgreSQL)
- **เพิ่มเข้ามา**: `firebase-admin`

### 2. ไฟล์ที่สร้างใหม่
- `firebaseConfig.js` - Configuration สำหรับ Firebase Admin SDK
- `.env.example` - ตัวอย่างการตั้งค่า environment variables

### 3. ไฟล์ที่แก้ไข
- `package.json` - อัพเดท dependencies และ scripts
- `index.js` - แปลงทุก API endpoints ให้ใช้ Firestore
- `seed.js` - สร้าง seed script ใหม่สำหรับ Firestore

### 4. ไฟล์ที่สามารถลบได้
- `prisma/` - โฟลเดอร์ Prisma ทั้งหมด (schema.prisma, dev.db)

## 🔧 การตั้งค่า Firebase

### ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" หรือ "Create a project"
3. ตั้งชื่อโปรเจกต์ เช่น "kohtao-nightboat"
4. เลือกการตั้งค่าตามต้องการ (Google Analytics เป็นต้น)
5. คลิก "Create project"

### ขั้นตอนที่ 2: เปิดใช้งาน Firestore

1. ในเมนูด้านซ้าย เลือก "Build" > "Firestore Database"
2. คลิก "Create database"
3. เลือก mode:
   - **Production mode**: สำหรับใช้งานจริง (ต้องตั้งค่า security rules)
   - **Test mode**: สำหรับทดสอบ (อนุญาตทุก request - ไม่แนะนำสำหรับ production)
4. เลือก location ที่ใกล้ที่สุด (เช่น `asia-southeast1` สำหรับประเทศไทย)
5. คลิก "Enable"

### ขั้นตอนที่ 3: สร้าง Service Account (สำหรับ Production)

1. ไปที่ Project Settings (คลิกไอคอนเฟืองข้างชื่อโปรเจกต์)
2. เลือกแท็บ "Service accounts"
3. คลิก "Generate new private key"
4. คลิก "Generate key" - ไฟล์ JSON จะถูกดาวน์โหลด
5. **เก็บไฟล์นี้ไว้อย่างปลอดภัย!**

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`:

#### สำหรับ Development (แนะนำ):
```env
FIREBASE_PROJECT_ID=your-project-id
SECRET_KEY=your-secret-key-here
PORT=3001
```

#### สำหรับ Production:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
SECRET_KEY=your-secret-key-here
PORT=3001
```

**หมายเหตุ**: สำหรับ production ให้คัดลอกเนื้อหาทั้งหมดจากไฟล์ JSON ที่ดาวน์โหลดมาใส่ในบรรทัดเดียว

## 🚀 การใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd server
npm install
```

### 2. Seed Database
```bash
npm run seed
```

สิ่งที่จะถูกสร้าง:
- ผู้ใช้ Admin: `username: admin, password: admin123`
- ผู้ใช้ Staff: `username: staff, password: staff123`
- ตัวอย่างตั๋ว 1 ใบ
- ตัวอย่างพัสดุ 1 ชิ้น

### 3. เริ่มต้น Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📊 โครงสร้าง Firestore Collections

### Collection: `users`
```javascript
{
  id: "auto-generated-id",
  username: "string",
  password: "hashed-string",
  name: "string",
  role: "ADMIN" | "STAFF" | "AGENT",
  createdAt: "ISO-8601-string"
}
```

### Collection: `tickets`
```javascript
{
  id: "auto-generated-id",
  passengerName: "string",
  phone: "string",
  route: "SURAT_TO_KOHTAO" | "KOHTAO_TO_SURAT",
  seatNumber: "string",
  seatLayout: "LAYOUT_50" | "LAYOUT_30",
  price: number,
  travelDate: "ISO-8601-string",
  sellerId: "user-id",
  sellerName: "string",
  createdAt: "ISO-8601-string"
}
```

### Collection: `parcels`
```javascript
{
  id: "auto-generated-id",
  senderName: "string",
  senderPhone: "string",
  receiverName: "string",
  receiverPhone: "string",
  weight: number,
  price: number,
  status: "WAITING" | "DELIVERED",
  paymentStatus: "UNPAID" | "PAID",
  depositDate: "ISO-8601-string",
  sellerId: "user-id",
  sellerName: "string",
  createdAt: "ISO-8601-string"
}
```

### Collection: `maintenances`
```javascript
{
  id: "auto-generated-id",
  date: "ISO-8601-string",
  details: "string",
  imageUrl: "string" | null,
  status: "WAITING" | "REPAIRED",
  repairDate: "ISO-8601-string" | null,
  technician: "string" | null,
  createdAt: "ISO-8601-string",
  updatedAt: "ISO-8601-string"
}
```

## 🔒 Firestore Security Rules (แนะนำ)

ไปที่ Firestore Console > Rules และใส่:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**หมายเหตุ**: นี่เป็น rules พื้นฐาน ควรปรับแต่งให้เหมาะสมกับความต้องการด้านความปลอดภัยของคุณ

## 🔄 ความแตกต่างหลักจาก Prisma

| Feature | Prisma | Firestore |
|---------|--------|-----------|
| Database Type | SQL (PostgreSQL, SQLite) | NoSQL (Document) |
| Schema | Defined in schema.prisma | Flexible, no schema |
| IDs | Auto-increment integers | Auto-generated strings |
| Queries | SQL-like with Prisma Client | NoSQL queries |
| Relations | Foreign keys | Denormalized data |
| Dates | JavaScript Date objects | ISO-8601 strings |
| Transactions | Full ACID support | Limited transactions |

## ⚠️ สิ่งที่ต้องระวัง

1. **IDs เปลี่ยนจาก integer เป็น string** - อาจต้องอัพเดท client code ที่ใช้ `parseInt(id)`
2. **Dates เป็น ISO strings** - ต้องแปลงเป็น Date object เมื่อใช้งาน
3. **No auto-increment** - ใช้ Firestore auto-generated IDs แทน
4. **Denormalized data** - เก็บ `sellerName` ใน tickets/parcels แทนการ join
5. **Query limitations** - Firestore มีข้อจำกัดในการ query (เช่น ต้องสร้าง composite index สำหรับบาง queries)

## 🎯 การ Deploy

### Render.com
อัพเดทไฟล์ `render.yaml` ให้เพิ่ม environment variable:
```yaml
envVars:
  - key: FIREBASE_SERVICE_ACCOUNT
    sync: false  # Set manually in Render dashboard
  - key: SECRET_KEY
    generateValue: true
```

### อื่นๆ
ตั้งค่า environment variables ตามที่แพลตฟอร์มกำหนด

## 📝 การทดสอบ

1. เริ่ม server: `npm run dev`
2. ทดสอบ login ด้วย Postman หรือ client
3. ตรวจสอบข้อมูลใน Firestore Console

## 🆘 Troubleshooting

### Error: "Could not load the default credentials"
- ตรวจสอบว่าตั้งค่า `FIREBASE_PROJECT_ID` หรือ `FIREBASE_SERVICE_ACCOUNT` ใน `.env` แล้ว

### Error: "Missing or insufficient permissions"
- ตรวจสอบ Firestore Security Rules
- ตรวจสอบว่า Service Account มีสิทธิ์เพียงพอ

### Error: "The query requires an index"
- Firestore จะแสดง link ให้สร้าง index ใน error message
- คลิก link และสร้าง index ตามที่แนะนำ

## 📚 Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
