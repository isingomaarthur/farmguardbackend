import mongoose from 'mongoose';

const SensorSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  zone: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Soil Moisture', 'Soil pH', 'Humidity', 'Temperature', 'Pressure'],
    required: true
  },
  position: {
    x: Number,
    y: Number
  },
  status: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'CRITICAL'],
    default: 'NORMAL'
  },
  lastReading: {
    value: Number,
    unit: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  thresholds: {
    critical: {
      min: Number,
      max: Number
    },
    warning: {
      min: Number,
      max: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  batteryLevel: Number,
  signalStrength: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Sensor', SensorSchema);
