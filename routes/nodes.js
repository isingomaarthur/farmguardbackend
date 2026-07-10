import express from 'express';
import Sensor from '../models/Sensor.js';

const router = express.Router();

// Get all nodes (sensor nodes map)
router.get('/', async (req, res) => {
  try {
    try {
      const nodes = await Sensor.find({ isActive: true }).select(
        'nodeId zone type position status lastReading'
      );

      const formattedNodes = nodes.map(node => ({
        id: node.nodeId,
        zone: node.zone,
        type: node.type,
        x: node.position?.x || 0,
        y: node.position?.y || 0,
        status: node.status,
        currentValue: node.lastReading?.value,
        unit: node.lastReading?.unit
      }));

      return res.json(formattedNodes);
    } catch (dbError) {
      // Return mock nodes if database fails
      console.log('Database unavailable, returning mock nodes data');
      return res.json([
        { id: "N1", zone: "North Field", type: "Soil Moisture", x: 22, y: 28, status: "NORMAL", currentValue: 44, unit: "%" },
        { id: "N2", zone: "East Field", type: "Soil pH", x: 68, y: 22, status: "WARNING", currentValue: 6.3, unit: "pH" },
        { id: "N3", zone: "South Field", type: "Soil Moisture", x: 40, y: 62, status: "CRITICAL", currentValue: 35, unit: "%" },
        { id: "N4", zone: "West Field", type: "Humidity", x: 78, y: 70, status: "NORMAL", currentValue: 62, unit: "%" },
        { id: "N5", zone: "Greenhouse", type: "Humidity", x: 15, y: 75, status: "NORMAL", currentValue: 68, unit: "%" }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get node by ID
router.get('/:nodeId', async (req, res) => {
  try {
    const node = await Sensor.findOne({ nodeId: req.params.nodeId });
    
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({
      id: node.nodeId,
      zone: node.zone,
      type: node.type,
      x: node.position?.x,
      y: node.position?.y,
      status: node.status,
      currentValue: node.lastReading?.value,
      unit: node.lastReading?.unit,
      batteryLevel: node.batteryLevel,
      signalStrength: node.signalStrength
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new node
router.post('/', async (req, res) => {
  try {
    const { nodeId, zone, type, x, y, thresholds } = req.body;

    const node = new Sensor({
      nodeId,
      zone,
      type,
      position: { x, y },
      thresholds
    });

    await node.save();
    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update node position
router.patch('/:nodeId/position', async (req, res) => {
  try {
    const { x, y } = req.body;

    const node = await Sensor.findOneAndUpdate(
      { nodeId: req.params.nodeId },
      { position: { x, y } },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update node status
router.patch('/:nodeId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const node = await Sensor.findOneAndUpdate(
      { nodeId: req.params.nodeId },
      { status, isActive: status !== 'INACTIVE' },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
