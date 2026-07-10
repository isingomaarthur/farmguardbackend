import mongoose from 'mongoose';

const DailyReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  userId: String,
  metrics: {
    averageHumidity: Number,
    averageMoisture: Number,
    averagePH: Number,
    temperatureRange: {
      min: Number,
      max: Number
    }
  },
  alerts: {
    critical: Number,
    warning: Number,
    info: Number,
    total: Number
  },
  readings: {
    count: Number,
    activeNodes: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('DailyReport', DailyReportSchema);
