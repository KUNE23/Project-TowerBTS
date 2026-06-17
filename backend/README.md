# BTSense Backend

Backend API for BTSense, an IoT sensor monitoring dashboard simulation for BTS towers.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Seed akun default:

```txt
Teknisi: technician@btsense.com / password
Supervisor: supervisor@btsense.com / password
```

Health check:

```bash
http://localhost:5000/api/health
```
