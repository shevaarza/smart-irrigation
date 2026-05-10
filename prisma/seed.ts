import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding data...")

  // 🌿 Sensor Data (dummy beberapa data)
  await prisma.sensorData.createMany({
    data: [
      {
        soil_moisture: 40,
        temperature: 28.5,
        air_humidity: 70.2,
        pump_status: false,
      },
      {
        soil_moisture: 25,
        temperature: 30.1,
        air_humidity: 65.8,
        pump_status: true,
      },
      {
        soil_moisture: 55,
        temperature: 27.3,
        air_humidity: 75.0,
        pump_status: false,
      }
    ]
  })

  // 🚿 Pump Log
  await prisma.pump_log.createMany({
    data: [
      {
        pump_status: true,
        trigger_by: "schedule",
      },
      {
        pump_status: false,
        trigger_by: "manual",
      }
    ]
  })

  // ⏰ Watering Schedule
  await prisma.watering_schedule.createMany({
    data: [
      {
        label: "Pagi",
        hour: 7,
        minute: 0,
        duration: 30,
        enabled: true,
      },
      {
        label: "Siang",
        hour: 12,
        minute: 0,
        duration: 20,
        enabled: false,
      },
      {
        label: "Sore",
        hour: 17,
        minute: 30,
        duration: 25,
        enabled: true,
      }
    ]
  })

  console.log("✅ Seeding selesai!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })