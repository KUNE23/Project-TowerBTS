# BTSense Backend

Backend API for BTSense, an IoT sensor monitoring dashboard simulation for BTS towers.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

Health check:

```bash
http://localhost:5000/api/health
```
