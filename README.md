# Inventory Backend (NestJS + TypeORM + PostgreSQL)

---

## Setup

```bash
# Clone project
git clone https://github.com/yourusername/inventory-backend.git
cd inventory-backend

# Install dependencies
npm install

# สร้างไฟล์ .env (สามารถอ้างจาก .env.example)

# Set up database ด้วย Docker
docker compose up -d

# รัน migration และ seed ข้อมูลเบื้องต้น
npm run migration:run
npm run seed

# เริ่มเซิร์ฟเวอร์
npm run start:dev
```

## Test Account
Email : admin@example.com

Password : 123456
