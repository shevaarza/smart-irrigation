import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const issues = []

  // Check last sensor data
  const { data: latestSensor, error: sensorError } = await supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (sensorError && sensorError.code !== 'PGRST116') {
    issues.push({
      id: 'db-sensor',
      type: 'error',
      source: 'Database',
      message: 'Gagal mengambil data sensor dari database: ' + sensorError.message,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  if (latestSensor) {
    const lastSeen = new Date(latestSensor.created_at).getTime();
    const diffMin = (Date.now() - lastSeen) / 60000;

    if (diffMin > 10) {
      issues.push({
        id: 'esp32-offline',
        type: 'error',
        source: 'ESP32',
        message: `ESP32 tidak mengirim data selama ${Math.round(diffMin)} menit. Periksa koneksi WiFi dan power.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    if (latestSensor.soil_moisture < 0 || latestSensor.soil_moisture > 100) {
      issues.push({
        id: 'soil-sensor',
        type: 'error',
        source: 'Sensor Soil',
        message: `Nilai soil moisture tidak valid: ${latestSensor.soil_moisture}%. Periksa sensor kelembapan tanah.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    if (latestSensor.temperature < -10 || latestSensor.temperature > 60) {
      issues.push({
        id: 'dht22-temp',
        type: 'error',
        source: 'DHT22',
        message: `Nilai suhu tidak valid: ${latestSensor.temperature}°C. DHT22 mungkin gagal baca.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    if (latestSensor.air_humidity < 0 || latestSensor.air_humidity > 100) {
      issues.push({
        id: 'dht22-hum',
        type: 'error',
        source: 'DHT22',
        message: `Nilai kelembapan udara tidak valid: ${latestSensor.air_humidity}%. DHT22 mungkin gagal baca.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    if (latestSensor.wifi_rssi < -90) {
      issues.push({
        id: 'wifi-weak',
        type: 'warning',
        source: 'WiFi ESP32',
        message: `Sinyal WiFi ESP32 lemah: ${latestSensor.wifi_rssi} dBm. Pertimbangkan pindahkan router atau pasang extender.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }
  } else if (!sensorError) {
    issues.push({
      id: 'no-data',
      type: 'warning',
      source: 'ESP32',
      message: 'Belum ada data sensor masuk. Pastikan ESP32 sudah terhubung dan terprogram.',
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  // Check weather data
  const { data: latestWeather, error: weatherError } = await supabase
    .from('weather_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (weatherError && weatherError.code !== 'PGRST116') {
    issues.push({
      id: 'weather-api',
      type: 'warning',
      source: 'Weather API',
      message: 'Gagal mengambil data cuaca: ' + weatherError.message,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  } else if (latestWeather) {
    const lastWeather = new Date(latestWeather.created_at).getTime();
    const diffMin = (Date.now() - lastWeather) / 60000;
    if (diffMin > 60) {
      issues.push({
        id: 'weather-stale',
        type: 'warning',
        source: 'Weather API',
        message: `Data cuaca terakhir ${Math.round(diffMin)} menit yang lalu. Cek apakah API weather masih aktif.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  return NextResponse.json({ success: true, data: issues, count: issues.length });
}
