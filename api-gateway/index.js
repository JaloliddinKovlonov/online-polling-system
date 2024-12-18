require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Services mapping
const services = {
    'user-management': ['http://user-management:3001', 'http://user-management-2:3001'],
    'poll-management': ['http://poll-management:3002', 'http://poll-management-2:3002'],
    'voting-service': ['http://voting-service:3003', 'http://voting-service-2:3003'],
    'analytics-service': ['http://analytics-service:3004', 'http://analytics-service-2:3004'],
    'notification-service': ['http://notification-service:3005', 'http://notification-service-2:3005']
};

const instanceCounters = {};

function getNextInstance(serviceName) {
    if (!instanceCounters[serviceName]) {
        instanceCounters[serviceName] = 0;
    }
    const instances = services[serviceName];
    const nextInstance = instances[instanceCounters[serviceName]];
    instanceCounters[serviceName] = (instanceCounters[serviceName] + 1) % instances.length;
    return nextInstance;
}

// Authorization Middleware
function authorize(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (err) {
        console.error('Authorization error:', err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

// Routes with authorization middleware
app.use('/users', (req, res, next) => {
    const target = getNextInstance('user-management');
    createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
});

app.use('/polls', authorize, (req, res, next) => {
    const target = getNextInstance('poll-management');
    createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
});

app.use('/votes', authorize, (req, res, next) => {
    const target = getNextInstance('voting-service');
    createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
});

app.use('/analytics', authorize, (req, res, next) => {
    const target = getNextInstance('analytics-service');
    createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
});

app.use('/notifications', authorize, (req, res, next) => {
    const target = getNextInstance('notification-service');
    createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway with authorization and load balancing running on port ${PORT}`));
