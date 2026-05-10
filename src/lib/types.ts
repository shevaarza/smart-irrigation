export interface SensorData {
  id: string;
  soil_moisture: number;
  soil_status: string;
  temperature: number;
  air_humidity: number;
  pump_status: boolean;
  device_time: string;
  device_ip: string;
  wifi_rssi: number;
  created_at: string;
}

export interface WateringSchedule {
  id: string;
  hour: number;
  minute: number;
  duration_sec: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  id: string;
  city: string;
  temperature: number;
  humidity: number;
  weather_condition: string;
  source: string;
  created_at: string;
}

export interface SystemIssue {
  id: string;
  type: 'error' | 'warning';
  source: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface DailySummary {
  date: string;
  avg_soil_moisture: number;
  avg_temperature: number;
  avg_air_humidity: number;
  pump_on_count: number;
  data_count: number;
}
