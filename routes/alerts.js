import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, skip = 0, isRead } = req.query;

    try {
      const query = {};
      if (status) query.status = status;
      if (isRead !== undefined) query.isRead = isRead === 'true';

      const alerts = await Alert.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Alert.countDocuments(query);

      return res.json({
        alerts,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      });
    } catch (dbError) {
      // Return mock alerts if database fails
      console.log('Database unavailable, returning mock alerts data');
      return res.json({
        alerts: [
          {
            _id: "1",
            title: "Low Soil Moisture",
            message: "Soil moisture has dropped below 40%. Immediate irrigation recommended.",
            status: "CRITICAL",
            type: "low_moisture",
            nodeId: "N3",
            isRead: false,
            createdAt: new Date(),
          },
          {
            _id: "2",
            title: "Soil pH Low",
            message: "pH level is at 6.3. Consider adding lime to raise soil pH.",
            status: "WARNING",
            type: "low_ph",
            nodeId: "N2",
            isRead: false,
            createdAt: new Date(Date.now() - 12 * 60 * 1000),
          },
          {
            _id: "3",
            title: "Low Humidity Alert",
            message: "Humidity has dropped to 45%. Consider adjusting irrigation.",
            status: "WARNING",
            type: "low_humidity",
            nodeId: "N1",
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
          }
        ],
        total: 3,
        limit: parseInt(limit),
        skip: parseInt(skip)
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread alerts count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Alert.countDocuments({ isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create alert
router.post('/', async (req, res) => {
  try {
    const { title, message, status, type, nodeId } = req.body;

    const alert = new Alert({
      title,
      message,
      status,
      type,
      nodeId
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all alerts as read
router.patch('/read/all', async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve alert
router.patch('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
