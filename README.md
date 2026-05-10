# 🌱 Smart Irrigation IoT Monitor

Web monitoring real-time untuk sistem penyiraman tanaman otomatis berbasis **ESP32/ESP8266**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Backend**: Next.js API Routes (REST API)
- **ORM**: Prisma
- **Database**: SQLite (mudah diganti ke MySQL)
- **Language**: TypeScript

---

## 🚀 Cara Menjalankan Project

### 1. Clone / Buat folder project

```bash
mkdir smart-irrigation-monitor
cd smart-irrigation-monitor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
```

Untuk MySQL, ganti dengan:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME"
```

Dan ubah `provider` di `prisma/schema.prisma` dari `"sqlite"` ke `"mysql"`.

### 4. Setup database

```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database (buat tabel)
npx prisma db push
```

### 5. (Opsional) Seed data dummy

```bash
npm run db:seed
```

### 6. Jalankan development server

```bash
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 📁 Struktur Folder

```
smart-irrigation-monitor/
├── prisma/
│   ├── schema.prisma          # Schema database
│   └── seed.ts                # Data dummy
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── sensor/
│   │   │       ├── route.ts          # POST /api/sensor
│   │   │       ├── latest/
│   │   │       │   └── route.ts      # GET /api/sensor/latest
│   │   │       └── history/
│   │   │           └── route.ts      # GET /api/sensor/history
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Halaman dashboard
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Redirect ke /dashboard
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── MoistureCard.tsx
│   │   ├── PumpCard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── LastUpdateCard.tsx
│   │   ├── SensorTable.tsx
│   │   └── RefreshButton.tsx
│   ├── lib/
│   │   └── prisma.ts               # Prisma client singleton
│   └── types/
│       └── index.ts                 # TypeScript types
├── .env
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔌 API Documentation

### POST `/api/sensor`

Endpoint untuk ESP32/ESP8266 mengirim data sensor.

**Request Body:**
```json
{
  "soil_moisture": 420,
  "soil_status": "Kering",
  "pump_status": "ON"
}
```

**soil_status valid values:** `Kering`, `Lembap`, `Basah`  
**pump_status valid values:** `ON`, `OFF`

**Response (201):**
```json
{
  "success": true,
  "message": "Sensor data saved successfully",
  "data": {
    "id": 1,
    "soil_moisture": 420,
    "soil_status": "Kering",
    "pump_status": "ON",
    "created_at": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### GET `/api/sensor/latest`

Mengambil data sensor terbaru.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "soil_moisture": 350,
    "soil_status": "Lembap",
    "pump_status": "OFF",
    "created_at": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### GET `/api/sensor/history?limit=50&page=1`

Mengambil riwayat data sensor.

**Query Parameters:**
- `limit` (default: 50) — jumlah data per halaman
- `page` (default: 1) — nomor halaman

---

## 📡 Kode ESP32/ESP8266

### Arduino/ESP32 (HTTPClient)

```cpp
#include <WiFi.h>           // ESP32
// #include <ESP8266WiFi.h> // ESP8266
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== KONFIGURASI =====
const char* ssid     = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";
const char* serverURL = "http://192.168.1.100:3000/api/sensor"; // Ganti IP

// Pin sensor
const int SOIL_SENSOR_PIN = 34;  // ADC Pin ESP32
const int PUMP_RELAY_PIN   = 26; // Relay pin

// Threshold
const int THRESHOLD_DRY   = 400; // ADC > 400 = Kering
const int THRESHOLD_MOIST = 250; // ADC 250-400 = Lembap
                                  // ADC < 250 = Basah
// =======================

bool pumpStatus = false;

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, HIGH); // Relay OFF (active LOW)

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());
}

String getSoilStatus(int adcValue) {
  if (adcValue >= THRESHOLD_DRY)   return "Kering";
  if (adcValue >= THRESHOLD_MOIST) return "Lembap";
  return "Basah";
}

void controlPump(String soilStatus) {
  if (soilStatus == "Kering") {
    digitalWrite(PUMP_RELAY_PIN, LOW);  // Aktifkan pompa
    pumpStatus = true;
  } else {
    digitalWrite(PUMP_RELAY_PIN, HIGH); // Matikan pompa
    pumpStatus = false;
  }
}

void sendDataToServer(int moisture, String soilStatus, String pumpStat) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected!");
    return;
  }

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // Build JSON
  StaticJsonDocument<200> doc;
  doc["soil_moisture"] = moisture;
  doc["soil_status"]   = soilStatus;
  doc["pump_status"]   = pumpStat;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("Sending: " + requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Response [" + String(httpCode) + "]: " + response);
  } else {
    Serial.println("HTTP Error: " + String(http.errorToString(httpCode)));
  }

  http.end();
}

void loop() {
  int rawValue   = analogRead(SOIL_SENSOR_PIN);
  String status  = getSoilStatus(rawValue);

  controlPump(status);
  String pumpStr = pumpStatus ? "ON" : "OFF";

  Serial.println("Moisture: " + String(rawValue) + " | Status: " + status + " | Pump: " + pumpStr);

  sendDataToServer(rawValue, status, pumpStr);

  delay(10000); // Kirim setiap 10 detik
}
```

### MicroPython (ESP32/ESP8266)

```python
import network
import urequests
import ujson
import machine
import time

# Konfigurasi
SSID     = "NAMA_WIFI"
PASSWORD = "PASSWORD_WIFI"
SERVER   = "http://192.168.1.100:3000/api/sensor"

SOIL_PIN  = machine.ADC(machine.Pin(34))
PUMP_PIN  = machine.Pin(26, machine.Pin.OUT)
PUMP_PIN.value(1)  # OFF (active LOW)

THRESHOLD_DRY   = 400
THRESHOLD_MOIST = 250

# Connect WiFi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(0.5)
    print(".", end="")

print("\nConnected:", wlan.ifconfig())

def get_soil_status(adc):
    if adc >= THRESHOLD_DRY:   return "Kering"
    if adc >= THRESHOLD_MOIST: return "Lembap"
    return "Basah"

while True:
    adc    = SOIL_PIN.read()
    status = get_soil_status(adc)
    pump   = "ON" if status == "Kering" else "OFF"

    PUMP_PIN.value(0 if pump == "ON" else 1)

    payload = ujson.dumps({
        "soil_moisture": adc,
        "soil_status":   status,
        "pump_status":   pump
    })

    try:
        r = urequests.post(SERVER,
                           data=payload,
                           headers={"Content-Type": "application/json"})
        print("Sent:", payload, "→", r.status_code)
        r.close()
    except Exception as e:
        print("Error:", e)

    time.sleep(10)
```

---

## 🗃️ Schema Database

```prisma
model SensorData {
  id            Int      @id @default(autoincrement())
  soil_moisture Int      // Nilai ADC dari sensor (0-1023)
  soil_status   String   // Kering / Lembap / Basah
  pump_status   String   // ON / OFF
  created_at    DateTime @default(now())

  @@map("sensor_data")
}
```

---

## 📊 Interpretasi Nilai ADC Sensor Tanah

| Nilai ADC | Status Tanah | Aksi Pompa |
|-----------|-------------|------------|
| 0 – 249   | Basah       | OFF        |
| 250 – 399 | Lembap      | OFF        |
| 400+      | Kering      | ON         |

> Nilai ADC berbeda-beda tergantung sensor. Kalibrasi sesuai kebutuhan.

---

## ✅ Perintah Berguna

```bash
npm run dev          # Jalankan development server
npm run build        # Build production
npm run start        # Jalankan production server
npx prisma studio    # Buka Prisma Studio (GUI database)
npx prisma db push   # Sinkronkan schema ke database
npm run db:seed      # Masukkan data dummy
```

---

## 🧪 Test API dengan cURL

```bash
# Kirim data sensor
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"soil_moisture": 420, "soil_status": "Kering", "pump_status": "ON"}'

# Ambil data terbaru
curl http://localhost:3000/api/sensor/latest

# Ambil riwayat
curl http://localhost:3000/api/sensor/history
```
