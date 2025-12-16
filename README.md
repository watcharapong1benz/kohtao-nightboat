# Ko Tao Night Boat - ระบบขายตั๋วเรือและฝากพัสดุ

ระบบจัดการขายตั๋วเรือและรับฝากพัสดุสำหรับเส้นทาง สุราษฎร์ธานี - เกาะเต่า

## ฟีเจอร์หลัก

### 1. ระบบขายตั๋วเรือ
- เลือกที่นั่งแบบ Interactive UI (50 ที่นั่ง / 30 ที่นั่ง)
- เส้นทาง: สุราษฎร์ธานี ↔ เกาะเต่า
- แสดงที่นั่งที่ถูกจองแล้ว
- บันทึกข้อมูลผู้โดยสาร
- พิมพ์ใบเสร็จตั๋วเรือ

### 2. ระบบรับฝากพัสดุ
- คำนวณราคาอัตโนมัติ (10 บาท/กก., ขั้นต่ำ 30 บาท)
- บันทึกข้อมูลผู้ส่ง-ผู้รับ
- ติดตามสถานะพัสดุ (รอส่ง/จัดส่งแล้ว)
- สถานะการชำระเงิน (ชำระแล้ว/ยังไม่ชำระ)
- พิมพ์ใบเสร็จพัสดุ

### 3. Dashboard
- สรุปยอดขายตั๋วรายวัน
- สรุปยอดพัสดุรายวัน
- รายได้รวมรายวัน
- จำนวนพัสดุที่รอจัดส่ง

### 4. ระบบ Authentication
- Login สำหรับ Admin และ Staff
- JWT Token Authentication
- Role-based Access Control

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Axios
- React Router
- Lucide Icons
- date-fns

### Backend
- Node.js + Express
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcryptjs

## การติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies สำหรับ server
cd server
npm install

# ติดตั้ง dependencies สำหรับ client
cd ../client
npm install
```

### 2. ตั้งค่า Database

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 3. สร้าง Admin User (ครั้งแรก)

```bash
# รัน server ก่อน
cd server
npm start

# จากนั้นใช้ API หรือสร้างผ่าน Prisma Studio
npx prisma studio
```

หรือใช้ API endpoint:
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

### 4. รันโปรเจกต์

```bash
# Terminal 1 - รัน Server
cd server
npm start

# Terminal 2 - รัน Client
cd client
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:5173

## Environment Variables

### Server (.env)
```
DATABASE_URL="file:./dev.db"
PORT=3001
SECRET_KEY="your_secret_key_here"
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001
```

## การ Deploy

### Deploy บน VPS/Server

1. **ติดตั้ง Node.js และ PM2**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

2. **Clone โปรเจกต์**
```bash
git clone <your-repo-url>
cd kohtao-nightboat
```

3. **ติดตั้งและ Build**
```bash
# Server
cd server
npm install
npx prisma generate
npx prisma migrate deploy

# Client
cd ../client
npm install
npm run build
```

4. **รัน Server ด้วย PM2**
```bash
cd server
pm2 start index.js --name kohtao-server
pm2 save
pm2 startup
```

5. **ตั้งค่า Nginx สำหรับ Client**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Client (React)
    location / {
        root /path/to/kohtao-nightboat/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Deploy บน Shared Hosting (cPanel)

1. Build client locally:
```bash
cd client
npm run build
```

2. Upload ไฟล์ใน `client/dist` ไปยัง public_html

3. สำหรับ Backend ต้องใช้ VPS หรือ Node.js hosting

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register new user

### Tickets
- `GET /api/tickets?date=YYYY-MM-DD` - Get tickets by date
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Parcels
- `GET /api/parcels?date=YYYY-MM-DD` - Get parcels by date
- `POST /api/parcels` - Create parcel
- `PUT /api/parcels/:id` - Update parcel
- `DELETE /api/parcels/:id` - Delete parcel

### Dashboard
- `GET /api/dashboard` - Get daily statistics

## Database Schema

### User
- id, username, password, name, role, createdAt

### Ticket
- id, passengerName, phone, route, seatNumber, seatLayout, price, travelDate, sellerId, createdAt

### Parcel
- id, senderName, senderPhone, receiverName, receiverPhone, weight, price, status, paymentStatus, depositDate, sellerId, createdAt

## Default Login

สร้าง admin user ตามขั้นตอนในส่วน "สร้าง Admin User"

## License

MIT

## Support

สำหรับการสนับสนุนหรือคำถาม กรุณาติดต่อ: [your-email@example.com]
