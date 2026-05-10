-- ============================================================
--  SUPABASE SQL SCHEMA — Smart Plant Monitor
--  Jalankan ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel data sensor
CREATE TABLE IF NOT EXISTS sensor_data (
  id             BIGSERIAL PRIMARY KEY,
  soil_moisture  INTEGER       NOT NULL CHECK (soil_moisture BETWEEN 0 AND 100),
  temperature    NUMERIC(5,2)  NOT NULL,
  air_humidity   NUMERIC(5,2)  NOT NULL CHECK (air_humidity BETWEEN 0 AND 100),
  pump_status    BOOLEAN       NOT NULL DEFAULT false,
  recorded_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. Tabel log pompa
CREATE TABLE IF NOT EXISTS pump_log (
  id          BIGSERIAL PRIMARY KEY,
  pump_status BOOLEAN      NOT NULL,
  trigger_by  TEXT         NOT NULL DEFAULT 'schedule',
  logged_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 3. Tabel jadwal penyiraman
CREATE TABLE IF NOT EXISTS watering_schedule (
  id       BIGSERIAL PRIMARY KEY,
  label    TEXT     NOT NULL,
  hour     SMALLINT NOT NULL CHECK (hour BETWEEN 0 AND 23),
  minute   SMALLINT NOT NULL DEFAULT 0 CHECK (minute BETWEEN 0 AND 59),
  duration INTEGER  NOT NULL DEFAULT 30,  -- detik
  enabled  BOOLEAN  NOT NULL DEFAULT true
);

-- Data jadwal default
INSERT INTO watering_schedule (label, hour, minute, duration, enabled) VALUES
  ('Pagi',  6,  0, 30, true),
  ('Sore', 15,  0, 30, true);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE sensor_data        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pump_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_schedule  ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan insert dari service_role (ESP32 via API Route)
CREATE POLICY "service_insert_sensor" ON sensor_data
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service_insert_pump" ON pump_log
  FOR INSERT TO service_role WITH CHECK (true);

-- Policy: izinkan select dari anon/authenticated (untuk dashboard)
CREATE POLICY "public_read_sensor" ON sensor_data
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_pump" ON pump_log
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_schedule" ON watering_schedule
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "service_update_schedule" ON watering_schedule
  FOR UPDATE TO service_role USING (true);

-- ============================================================
--  REALTIME — aktifkan untuk sensor_data & pump_log
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
ALTER PUBLICATION supabase_realtime ADD TABLE pump_log;
