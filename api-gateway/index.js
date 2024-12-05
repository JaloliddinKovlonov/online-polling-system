require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Proxy routes
app.use('/users', createProxyMiddleware({ target: 'http://user-management:3000', changeOrigin: true }));
app.use('/polls', createProxyMiddleware({ target: 'http://poll-management:3000', changeOrigin: true }));
app.use('/votes', createProxyMiddleware({ target: 'http://voting-service:3000', changeOrigin: true }));
app.use('/analytics', createProxyMiddleware({ target: 'http://analytics-service:3000', changeOrigin: true }));
app.use('/notifications', createProxyMiddleware({ target: 'http://notification-service:3000', changeOrigin: true }));

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
