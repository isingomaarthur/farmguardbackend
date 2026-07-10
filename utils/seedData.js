import Sensor from '../models/Sensor.js';
import Alert from '../models/Alert.js';
import SensorReading from '../models/SensorReading.js';

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingSensors = await Sensor.countDocuments();
    if (existingSensors > 0) {
      console.log('✓ Database already seeded');
      return;
    }

    // Create sample sensors
    const sensors = await Sensor.insertMany([
      {
        nodeId: 'N1',
        zone: 'North Field',
        type: 'Soil Moisture',
        position: { x: 22, y: 28 },
        status: 'NORMAL',
        lastReading: { value: 44, unit: '%', timestamp: new Date() },
        thresholds: {
          critical: { min: 30, max: 70 },
          warning: { min: 35, max: 65 }
        },
        batteryLevel: 85,
        signalStrength: 95
      },
      {
        nodeId: 'N2',
        zone: 'East Field',
        type: 'Soil pH',
        position: { x: 68, y: 22 },
        status: 'WARNING',
        lastReading: { value: 6.3, unit: 'pH', timestamp: new Date() },
        thresholds: {
          critical: { min: 5.5, max: 8.5 },
          warning: { min: 6.0, max: 8.0 }
        },
        batteryLevel: 72,
        signalStrength: 88
      },
      {
        nodeId: 'N3',
        zone: 'South Field',
        type: 'Soil Moisture',
        position: { x: 40, y: 62 },
        status: 'CRITICAL',
        lastReading: { value: 35, unit: '%', timestamp: new Date() },
        thresholds: {
          critical: { min: 30, max: 70 },
          warning: { min: 35, max: 65 }
        },
        batteryLevel: 45,
        signalStrength: 72
      },
      {
        nodeId: 'N4',
        zone: 'West Field',
        type: 'Humidity',
        position: { x: 78, y: 70 },
        status: 'NORMAL',
        lastReading: { value: 62, unit: '%', timestamp: new Date() },
        thresholds: {
          critical: { min: 40, max: 95 },
          warning: { min: 45, max: 90 }
        },
        batteryLevel: 90,
        signalStrength: 92
      },
      {
        nodeId: 'N5',
        zone: 'Greenhouse',
        type: 'Humidity',
        position: { x: 15, y: 75 },
        status: 'NORMAL',
        lastReading: { value: 68, unit: '%', timestamp: new Date() },
        thresholds: {
          critical: { min: 40, max: 95 },
          warning: { min: 45, max: 90 }
        },
        batteryLevel: 88,
        signalStrength: 94
      }
    ]);

    // Create sample readings
    const now = new Date();
    const readings = [];
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      readings.push(
        { nodeId: 'N1', value: 44 + Math.random() * 5, unit: '%', sensorType: 'moisture', timestamp },
        { nodeId: 'N2', value: 62 + Math.random() * 3, unit: '%', sensorType: 'humidity', timestamp },
        { nodeId: 'N3', value: 6.5 + Math.random() * 0.3, unit: 'pH', sensorType: 'ph', timestamp }
      );
    }
    await SensorReading.insertMany(readings);

    // Create sample alerts
    await Alert.insertMany([
      {
        title: 'Low Soil Moisture',
        message: 'Soil moisture has dropped below 40%. Immediate irrigation recommended.',
        status: 'CRITICAL',
        type: 'low_moisture',
        nodeId: 'N3',
        isRead: false,
        createdAt: new Date()
      },
      {
        title: 'Soil pH Low',
        message: 'pH level is at 6.3. Consider adding lime to raise soil pH.',
        status: 'WARNING',
        type: 'low_ph',
        nodeId: 'N2',
        isRead: false,
        createdAt: new Date(now.getTime() - 12 * 60 * 1000)
      },
      {
        title: 'Low Humidity Alert',
        message: 'Humidity has dropped to 45%. Consider adjusting irrigation.',
        status: 'WARNING',
        type: 'low_humidity',
        nodeId: 'N1',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000)
      },
      {
        title: 'Humidity Levels Normal',
        message: 'Humidity levels have returned to optimal range.',
        status: 'INFO',
        type: 'humidity_alert',
        isRead: true,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000)
      }
    ]);

    console.log('✓ Database seeded with sample data');
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
  }
}
