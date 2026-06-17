# BTSense - Project Tower BTS

BTSense adalah sistem monitoring sensor Tower BTS berbasis IoT yang dibuat untuk memantau kondisi rak/perangkat BTS secara realtime melalui website dashboard. Sistem ini menggunakan ESP32 sebagai perangkat IoT untuk membaca data sensor, backend API untuk menyimpan dan memproses data, serta frontend dashboard untuk menampilkan status monitoring.

Project ini dibuat sebagai prototype sistem monitoring yang dapat membantu teknisi atau supervisor melihat kondisi penting seperti suhu perangkat, status fan, kabel, pintu, dan alert sistem.

## Fitur Utama

* Monitoring suhu perangkat menggunakan sensor DS18B20
* Monitoring status fan pendingin
* Monitoring kondisi kabel tersambung atau putus
* Monitoring status pintu terbuka atau tertutup
* LED indikator untuk status kabel
* Pengiriman data sensor dari ESP32 ke backend API
* Penyimpanan data sensor ke database PostgreSQL
* Dashboard website untuk melihat data monitoring
* Alert berdasarkan kondisi sensor
* Export laporan PDF untuk supervisor
* Role pengguna: teknisi dan supervisor

## Teknologi yang Digunakan

### IoT

* ESP32
* DS18B20 Temperature Sensor
* Reed Switch / simulasi jumper untuk sensor pintu
* Jumper cable untuk simulasi kabel putus
* LED indikator
* PlatformIO
* Arduino C++

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod Validation
* Socket.IO
* PDF Export

### Frontend

* Vue 3
* Vite
* Tailwind CSS
* Axios
* Vue Router
* Chart.js
* lucide-vue-next

## Alur Sistem

```text
Sensor ESP32
    ↓
ESP32 membaca suhu, kabel, pintu, dan status fan
    ↓
ESP32 mengirim data ke backend API
    ↓
Backend menyimpan data ke PostgreSQL
    ↓
Dashboard mengambil data dari backend
    ↓
User melihat status monitoring dan alert
```

## Data yang Dimonitor

| Sensor / Komponen | Status yang Ditampilkan   |
| ----------------- | ------------------------- |
| Suhu              | normal, warning, critical |
| Fan               | running, stopped          |
| Kabel             | connected, cut            |
| Pintu             | closed, open              |
| Overall Status    | normal, warning, critical |

## Struktur Data Sensor

Contoh data yang dikirim ESP32 ke backend:

```json
{
  "device_code": "BTS-DEMO-001",
  "temperature": 36.5,
  "temperature_status": "normal",
  "fan_status": "running",
  "fan_rpm": 0,
  "cable_status": "connected",
  "door_status": "closed",
  "overall_status": "normal"
}
```

## Rangkaian ESP32

Mapping pin yang digunakan:

| Komponen           | Pin ESP32 |
| ------------------ | --------- |
| DS18B20 DATA       | GPIO 4    |
| Sensor pintu       | GPIO 32   |
| Sensor kabel putus | GPIO 33   |
| LED kabel normal   | GPIO 25   |
| LED kabel putus    | GPIO 26   |

Catatan: Pada prototype ini, fan pendingin dibuat menyala terus sebagai pendingin perangkat. Status fan tetap dikirim ke sistem sebagai `running`.

## Instalasi Backend

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://btsense_user:btsense_password@localhost:5432/btsense_db?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
DEVICE_API_KEY="btsense_device_secret"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration:

```bash
npx prisma migrate dev
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di:

```text
http://localhost:5000
```

## Instalasi Frontend

Masuk ke folder frontend:

```bash
cd frontend
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

## Instalasi ESP32

Masuk ke folder firmware atau project PlatformIO:

```bash
pio run
```

Upload program ke ESP32:

```bash
pio run --target upload
```

Buka serial monitor:

```bash
pio device monitor
```

Pastikan ESP32 dan laptop/server berada pada jaringan WiFi yang sama.

Contoh konfigurasi penting di kode ESP32:

```cpp
const char* WIFI_SSID = "Nama_WiFi";
const char* WIFI_PASSWORD = "Password_WiFi";

const char* API_URL = "http://IP_LAPTOP:5000/api/sensor-logs";
const char* DEVICE_API_KEY = "btsense_device_secret";
const char* DEVICE_CODE = "BTS-DEMO-001";
```

Catatan: Jangan gunakan `localhost` pada ESP32. Gunakan IP laptop/server, misalnya:

```text
http://192.168.1.16:5000/api/sensor-logs
```

## Endpoint Utama

| Method | Endpoint                  | Keterangan                       |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/api/health`             | Mengecek status API              |
| POST   | `/api/sensor-logs`        | Menerima data sensor dari ESP32  |
| GET    | `/api/sensor-logs`        | Menampilkan riwayat data sensor  |
| GET    | `/api/dashboard/latest`   | Mengambil data terbaru dashboard |
| GET    | `/api/alerts/latest`      | Mengambil alert terbaru          |
| GET    | `/api/export-reports/pdf` | Export laporan PDF               |

## Testing API

Contoh request menggunakan Thunder Client atau Postman:

```http
POST http://localhost:5000/api/sensor-logs
Content-Type: application/json
x-device-api-key: btsense_device_secret
```

Body:

```json
{
  "device_code": "BTS-DEMO-001",
  "temperature": 36.5,
  "temperature_status": "normal",
  "fan_status": "running",
  "fan_rpm": 0,
  "cable_status": "connected",
  "door_status": "closed",
  "overall_status": "normal"
}
```

Jika berhasil, response akan menampilkan status `201 Created`.

## Status Prototype

Project ini masih berupa prototype untuk monitoring Tower BTS. Beberapa komponen disimulasikan agar cocok untuk kebutuhan demo dan pengujian:

* Sensor kabel putus menggunakan jumper sebagai simulasi kabel tersambung/terputus.
* Sensor pintu dapat menggunakan reed switch atau jumper sebagai simulasi pintu terbuka/tertutup.
* Fan pendingin berjalan terus sebagai pendingin, sementara status fan dikirim sebagai `running`.

## Pengembangan Selanjutnya

* Kontrol fan otomatis menggunakan relay 3.3V trigger atau MOSFET driver
* Integrasi notifikasi realtime
* Pengembangan dashboard analytics
* Export laporan lebih lengkap
* Deployment backend dan frontend
* Penggunaan sensor pintu casing MC-38 agar lebih kuat
* Peningkatan sistem alert dan riwayat monitoring

## Author

Project dibuat oleh KUNE23 sebagai prototype sistem monitoring Tower BTS berbasis IoT.

GitHub: [KUNE23](https://github.com/KUNE23)
