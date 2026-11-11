/**
 * Health Check Controller
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

const getHealthStatus = (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const state = mongoose.connection.readyState;
  const isHealthy = state === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    app: 'Thầy Giáo KDOL Backend API',
    slogan: '1 đơn hàng - 1 nụ cười',
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStates[state] || 'unknown',
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealthStatus
};

