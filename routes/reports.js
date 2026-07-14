import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

const statusColors = {
  CRITICAL: '#DC2626',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  NORMAL: '#22C55E'
};

const toNumber = (value) => (value !== null && value !== undefined ? Number(value) : 0);

router.get('/weekly-summary', async (req, res) => {
  try {
    const weeklyStart = new Date();
    weeklyStart.setDate(weeklyStart.getDate() - 7);
    weeklyStart.setHours(0, 0, 0, 0);

    const [humidityResult] = await query(
      "SELECT AVG(value) AS avg, MIN(value) AS min, MAX(value) AS max FROM sensor_readings WHERE sensor_type = 'humidity' AND timestamp >= ?",
      [weeklyStart]
    );
    const [moistureResult] = await query(
      "SELECT AVG(value) AS avg, MIN(value) AS min, MAX(value) AS max FROM sensor_readings WHERE sensor_type = 'moisture' AND timestamp >= ?",
      [weeklyStart]
    );
    const [phResult] = await query(
      "SELECT AVG(value) AS avg, MIN(value) AS min, MAX(value) AS max FROM sensor_readings WHERE sensor_type = 'ph' AND timestamp >= ?",
      [weeklyStart]
    );
    const readings = await query(
      "SELECT node_id, sensor_type, value, unit, status, timestamp FROM sensor_readings WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 20",
      [weeklyStart]
    );

    return res.json({
      period: 'Last Week',
      humidity: {
        avg: Number(humidityResult.avg || 0).toFixed(1),
        min: toNumber(humidityResult.min),
        max: toNumber(humidityResult.max)
      },
      moisture: {
        avg: Number(moistureResult.avg || 0).toFixed(1),
        min: toNumber(moistureResult.min),
        max: toNumber(moistureResult.max)
      },
      ph: {
        avg: Number(phResult.avg || 0).toFixed(1),
        min: toNumber(phResult.min),
        max: toNumber(phResult.max)
      },
      readings
    });
  } catch (error) {
    console.error('weekly-summary error', error);
    return res.status(500).json({ success: false, message: 'Unable to load weekly summary' });
  }
});

router.get('/data/:period', async (req, res) => {
  try {
    const { period } = req.params;
    let daysBack = 7;
    if (period === 'month') daysBack = 30;
    if (period === 'quarter') daysBack = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const [humidityResult] = await query(
      "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'humidity' AND timestamp >= ?",
      [startDate]
    );
    const [moistureResult] = await query(
      "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'moisture' AND timestamp >= ?",
      [startDate]
    );
    const [phResult] = await query(
      "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'ph' AND timestamp >= ?",
      [startDate]
    );
    const alertCounts = await query(
      'SELECT status, COUNT(*) AS count FROM alerts WHERE created_at >= ? GROUP BY status',
      [startDate]
    );

    const summaryCards = [
      {
        label: 'Average Humidity',
        value: Number(humidityResult.avg || 0).toFixed(1),
        tone: 'text-green-700',
        bg: 'bg-green-600/10'
      },
      {
        label: 'Average Soil Moisture',
        value: Number(moistureResult.avg || 0).toFixed(1),
        tone: 'text-blue-700',
        bg: 'bg-blue-600/10'
      },
      {
        label: 'Average pH Level',
        value: Number(phResult.avg || 0).toFixed(1),
        tone: 'text-purple-700',
        bg: 'bg-purple-600/10'
      },
      {
        label: 'Total Alerts',
        value: alertCounts.reduce((sum, item) => sum + Number(item.count || 0), 0),
        tone: 'text-fg-warning',
        bg: 'bg-fg-warning/10'
      }
    ];

    return res.json({ success: true, summaryCards, alertCounts });
  } catch (error) {
    console.error('data report error', error);
    return res.status(500).json({ success: false, message: 'Unable to load report data' });
  }
});

router.get('/alerts/distribution', async (req, res) => {
  try {
    const distribution = await query(
      'SELECT status, COUNT(*) AS value FROM alerts GROUP BY status'
    );

    const data = distribution.map((item) => ({
      name: item.status,
      value: Number(item.value || 0),
      color: statusColors[item.status] || '#A3A3A3'
    }));

    return res.json(data);
  } catch (error) {
    console.error('alert distribution error', error);
    return res.status(500).json({ success: false, message: 'Unable to load alert distribution' });
  }
});

router.get('/trends/daily', async (req, res) => {
  try {
    const days = 7;
    const dateLabels = [];
    const trendPromises = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      dateLabels.push({ label, start: date, end: nextDate });
    }

    for (const { start, end } of dateLabels) {
      trendPromises.push(
        Promise.all([
          query(
            "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'humidity' AND timestamp >= ? AND timestamp < ?",
            [start, end]
          ),
          query(
            "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'moisture' AND timestamp >= ? AND timestamp < ?",
            [start, end]
          ),
          query(
            "SELECT AVG(value) AS avg FROM sensor_readings WHERE sensor_type = 'ph' AND timestamp >= ? AND timestamp < ?",
            [start, end]
          )
        ])
      );
    }

    const results = await Promise.all(trendPromises);
    const trends = results.map(([humidityRows, moistureRows, phRows], index) => ({
      day: dateLabels[index].label,
      humidity: Math.round(Number(humidityRows[0]?.avg || 0)),
      moisture: Math.round(Number(moistureRows[0]?.avg || 0)),
      ph: Number((Number(phRows[0]?.avg || 0)).toFixed(1))
    }));

    return res.json({ success: true, trends });
  } catch (error) {
    console.error('daily trends error', error);
    return res.status(500).json({ success: false, message: 'Unable to load daily trends' });
  }
});

export default router;
