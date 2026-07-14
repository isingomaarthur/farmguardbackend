import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import alertsRoutes from './routes/alerts.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import nodesRoutes from './routes/nodes.js';
import sensorsRoutes from './routes/sensors.js';
import sensorStatusRoutes from './routes/sensorStatus.js';
import { authenticateToken } from './middleware/auth.js';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

dotenv.config();

const app = express();

app.use(cors({
  // origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  origin:"*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/nodes', authenticateToken, nodesRoutes);
app.use('/api/sensors', authenticateToken, sensorsRoutes);
app.use('/api/sensor-status', sensorStatusRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FarmGuard backend is running' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = Number(process.env.PORT) || 5000;

initializeDatabase()
  .then(() => {
    const httpServer = http.createServer(app);
    const io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // attach io to app for controllers to emit events
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`🚀 FarmGuard backend running on http://localhost:${PORT}`);
    });

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using that port or set a different PORT in your environment.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
