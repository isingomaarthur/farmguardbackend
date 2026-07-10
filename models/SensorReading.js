import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: String,
  sensorType: {
    type: String,
    enum: ['humidity', 'moisture', 'ph', 'temperature', 'pressure'],
    required: true
  },
  status: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'CRITICAL'],
    default: 'NORMAL'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: false });

// TTL index to auto-delete old readings after 90 days
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('SensorReading', SensorReadingSchema);
