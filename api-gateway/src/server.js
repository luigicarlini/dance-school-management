const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const winston = require('winston');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/gateway.log' })
  ]
});

// Redis client for caching and token invalidation
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect().catch(err => {
  logger.error('Redis connection error:', err);
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token is invalid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Service discovery and target URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  course: process.env.COURSE_SERVICE_URL || 'http://course-service:3002',
  booking: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'
};

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ DASHBOARD endpoint con chiamate ai microservizi
app.get('/api/dashboard', async (req, res) => {
  const role = (req.query.role || 'STUDENT').toUpperCase();

  try {
    if (role === 'STUDENT') {
      const [bookings, notifications, payments] = await Promise.all([
        axios.get(`${services.booking}/bookings?studentId=123`),
        axios.get(`${services.notification}/notifications?userId=123`),
        axios.get(`${services.payment}/credits?studentId=123`)
      ]);

      return res.json({
        greeting: "Ciao Studente!",
        bookedClasses: bookings.data.filter(b => b.status === "BOOKED").length,
        completedClasses: bookings.data.filter(b => b.status === "DONE").length,
        remainingCredits: payments.data.credits,
        upcomingClasses: bookings.data
          .filter(b => b.status === "BOOKED")
          .map(b => ({
            id: b.id,
            title: b.courseName,
            date: b.date
          })),
        unreadNotifications: notifications.data.filter(n => !n.read).length,
        notifications: notifications.data,
        recentActivity: []
      });
    }

    if (role === 'INSTRUCTOR') {
      const [courses, bookings] = await Promise.all([
        axios.get(`${services.course}/instructor/123/courses`),
        axios.get(`${services.booking}/instructor/123/bookings`)
      ]);

      return res.json({
        greeting: "Ciao Istruttore!",
        todayClasses: courses.data.filter(c => c.date.startsWith(new Date().toISOString().split("T")[0])).length,
        totalStudents: bookings.data.length,
        hoursThisMonth: courses.data.reduce((sum, c) => sum + (c.duration || 0), 0),
        upcomingClasses: courses.data,
        notifications: [],
        unreadNotifications: 0,
        recentActivity: []
      });
    }

    if (role === 'ADMIN') {
      const [users, revenue] = await Promise.all([
        axios.get(`${services.user}/students/count`),
        axios.get(`${services.payment}/revenue/monthly`)
      ]);

      return res.json({
        greeting: "Ciao Admin!",
        activeStudents: users.data.count,
        monthlyRevenue: revenue.data.amount,
        todayClasses: 0,
        recentActivity: [],
        upcomingClasses: []
      });
    }

    if (role === 'STAFF') {
      return res.json({
        greeting: "Ciao Staff!",
        todayClasses: 0,
        monthlyRevenue: 0,
        activeStudents: 0,
        notifications: [],
        upcomingClasses: []
      });
    }

    res.status(400).json({ error: "Ruolo non riconosciuto" });
  } catch (err) {
    logger.error("Errore fetch servizi dashboard:", err.message);
    return res.status(500).json({ error: "Errore recupero dati da microservizi" });
  }
});

// ✅ Public routes (no auth)
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  onError: (err, req, res) => {
    logger.error('Proxy error (auth):', err);
    res.status(500).json({ error: 'User service unavailable' });
  }
}));

// ✅ Protected routes (auth middleware)
app.use('/api/users', authenticateToken, createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/users' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-User-ID', req.user.id);
    proxyReq.setHeader('X-User-Role', req.user.role);
  }
}));

app.use('/api/courses', authenticateToken, createProxyMiddleware({
  target: services.course,
  changeOrigin: true,
  pathRewrite: { '^/api/courses': '/courses' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-User-ID', req.user.id);
    proxyReq.setHeader('X-User-Role', req.user.role);
  }
}));

app.use('/api/bookings', authenticateToken, createProxyMiddleware({
  target: services.booking,
  changeOrigin: true,
  pathRewrite: { '^/api/bookings': '/bookings' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-User-ID', req.user.id);
    proxyReq.setHeader('X-User-Role', req.user.role);
  }
}));

app.use('/api/payments', authenticateToken, createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '/payments' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-User-ID', req.user.id);
    proxyReq.setHeader('X-User-Role', req.user.role);
  }
}));

// ✅ Error handler
app.use((error, req, res, next) => {
  logger.error('Gateway error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;