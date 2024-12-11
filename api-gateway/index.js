require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }));
// Proxy routes
app.use('/users', createProxyMiddleware({ target: 'http://user-management:3001', changeOrigin: true }));
app.use('/polls', createProxyMiddleware({ target: 'http://poll-management:3002', changeOrigin: true }));
app.use('/votes', createProxyMiddleware({ target: 'http://voting-service:3003', changeOrigin: true }));
app.use('/analytics', createProxyMiddleware({ target: 'http://analytics-service:3004', changeOrigin: true }));
app.use('/notifications', createProxyMiddleware({ target: 'http://notification-service:3005', changeOrigin: true }));

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
