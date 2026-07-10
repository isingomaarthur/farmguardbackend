import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['CRITICAL', 'WARNING', 'INFO', 'NORMAL'],
    required: true
  },
  type: {
    type: String,
    enum: ['low_moisture', 'high_moisture', 'low_ph', 'high_ph', 'low_humidity', 'high_humidity', 'temperature_alert', 'system_alert'],
    required: true
  },
  nodeId: String,
  isRead: {
    type: Boolean,
    default: false
  },
  userId: String,
  actions: [{
    type: String
  }],
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

export default mongoose.model('Alert', AlertSchema);
