/**
 * Smart Irrigation System - ESP32 Code
 * 
 * Kode untuk ESP32 mengirim data sensor kelembapan tanah
 * ke backend Next.js via HTTP POST.
 * 
 * Library yang dibutuhkan (install via Arduino Library Manager):
 * - ArduinoJson by Benoit Blanchon (versi 6.x)
 * 
 * Wiring:
 * - Soil Moisture Sensor (analog) → GPIO 34 (ADC1)
 * - Relay Module → GPIO 26
 * - VCC Sensor → 3.3V / 5V
 * - GND → GND
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============================================
//   KONFIGURASI - SESUAIKAN DI SINI
// ============================================
const char* WIFI_SSID     = "NAMA_WIFI_KAMU";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_KAMU";

// Ganti dengan IP komputer yang menjalankan Next.js
// Pastikan ESP32 dan komputer dalam jaringan yang sama
const char* SERVER_URL = "http://192.168.1.100:3000/api/sensor";

const int SOIL_SENSOR_PIN = 34;   // ADC pin (GPIO 34)
const int PUMP_RELAY_PIN  = 26;   // Relay pin (GPIO 26)

// Threshold nilai ADC (kalibrasi sesuai sensor)
const int THRESHOLD_KERING = *-400; // ADC >= 400 = Kering
const int THRESHOLD_LEMBAP = 250; // ADC 250-399 = Lembap
                                   // ADC < 250 = Basah

const unsigned long SEND_INTERVAL = 10000; // Interval kirim data (ms)
// ============================================

bool pumpIsOn = false;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Setup relay pin
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, HIGH); // HIGH = OFF (relay active LOW)

  Serial.println("\n========================================");
  Serial.println("   Smart Irrigation - ESP32 Monitor");
  Serial.println("========================================");

  // Connect WiFi
  connectWiFi();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED && attempt < 30) {
    delay(500);
    Serial.print(".");
    attempt++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed! Restarting...");
    delay(3000);
    ESP.restart();
  }
}

String getSoilStatus(int adcValue) {
  if (adcValue >= THRESHOLD_KERING) return "Kering";
  if (adcValue >= THRESHOLD_LEMBAP) return "Lembap";
  return "Basah";
}

void controlPump(String soilStatus) {
  if (soilStatus == "Kering" && !pumpIsOn) {
    digitalWrite(PUMP_RELAY_PIN, LOW);  // Aktifkan relay (pompa ON)
    pumpIsOn = true;
    Serial.println("🚿 Pompa AKTIF");
  } else if (soilStatus != "Kering" && pumpIsOn) {
    digitalWrite(PUMP_RELAY_PIN, HIGH); // Matikan relay (pompa OFF)
    pumpIsOn = false;
    Serial.println("⏹  Pompa MATI");
  }
}

bool sendDataToServer(int moisture, String soilStatus, String pumpStat) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi terputus, mencoba reconnect...");
    connectWiFi();
    return false;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 detik timeout

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["soil_moisture"] = moisture;
  doc["soil_status"]   = soilStatus;
  doc["pump_status"]   = pumpStat;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("→ Sending: " + requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("← Response [%d]: %s\n", httpCode, response.c_str());
    http.end();
    return (httpCode == 200 || httpCode == 201);
  } else {
    Serial.printf("✗ HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}

void printSensorInfo(int rawValue, String status, String pump) {
  Serial.println("----------------------------------------");
  Serial.printf("ADC Value   : %d\n", rawValue);
  Serial.printf("Soil Status : %s\n", status.c_str());
  Serial.printf("Pump Status : %s\n", pump.c_str());
  Serial.printf("WiFi RSSI   : %d dBm\n", WiFi.RSSI());
  Serial.println("----------------------------------------");
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= SEND_INTERVAL || lastSendTime == 0) {
    lastSendTime = currentTime;

    // Baca sensor
    int rawValue   = analogRead(SOIL_SENSOR_PIN);
    String status  = getSoilStatus(rawValue);

    // Kontrol pompa
    controlPump(status);
    String pumpStr = pumpIsOn ? "ON" : "OFF";

    // Print info
    printSensorInfo(rawValue, status, pumpStr);

    // Kirim ke server
    bool success = sendDataToServer(rawValue, status, pumpStr);
    if (success) {
      Serial.println("✓ Data berhasil dikirim!");
    } else {
      Serial.println("✗ Gagal mengirim data.");
    }
  }

  delay(100);
}
