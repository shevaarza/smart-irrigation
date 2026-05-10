// src/types/index.ts

export interface SensorData {
  id: number;
  soil_moisture: number;
  soil_status: string;
  pump_status: string;
  created_at: string;
}

export interface SensorPayload {
  soil_moisture: number;
  soil_status: string;
  pump_status: string;
}

export type SoilStatus = 'Kering' | 'Lembap' | 'Basah';
export type PumpStatus = 'ON' | 'OFF';
