const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');
const redis = require('redis');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3005;
const prisma = new PrismaClient();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/notification-service.log' })
  ]
});

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect().catch(console.error);

// RabbitMQ connection
let channel;
const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    channel = await connection.createChannel();
    await channel.assertExchange('notification.events', 'topic', { durable: true });
    logger.info('Connected to RabbitMQ');
  } catch (error) {
    logger.error('RabbitMQ connection failed:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
};
connectRabbitMQ();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

/* ------------------ DASHBOARD ENDPOINTS ------------------ */

// Per STUDENT/INSTRUCTOR dashboard - notifiche utente
app.get('/notifications', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    // Mock notifiche
    const mockNotifications = [
      { 
        id: 1, 
        message: "La lezione di Hip Hop di domani è posticipata alle 19:00", 
        read: false, 
        timestamp: "1h fa",
        type: "SCHEDULE_CHANGE",
        priority: "HIGH"
      },
      { 
        id: 2, 
        message: "Nuovo corso di Salsa Cubana disponibile dal 25 settembre", 
        read: true, 
        timestamp: "ieri",
        type: "NEW_COURSE",
        priority: "MEDIUM"
      },
      { 
        id: 3, 
        message: "Ricorda: pagamento mensile in scadenza il 30 settembre", 
        read: false, 
        timestamp: "2 giorni fa",
        type: "PAYMENT_REMINDER",
        priority: "HIGH"
      },
      { 
        id: 4, 
        message: "Complimenti! Hai completato il corso di Bachata Base", 
        read: true, 
        timestamp: "1 settimana fa",
        type: "ACHIEVEMENT",
        priority: "LOW"
      }
    ];

    res.json(mockNotifications);
    logger.info(`Notifications fetched for user: ${userId}`);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/* ------------------ STANDARD NOTIFICATION ENDPOINTS ------------------ */

app.post('/notifications', async (req, res) => {
  try {
    const { userId, message, type, priority } = req.body;
    
    // TODO: Implementare logica di invio notifica reale
    const notification = {
      id: Date.now(),
      userId,
      message,
      type,
      priority,
      read: false,
      createdAt: new Date()
    };

    res.status(201).json(notification);
    logger.info(`Notification created: ${notification.id}`);
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.put('/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // TODO: Implementare logica di marcatura come letta
    res.json({ message: 'Notification marked as read' });
    logger.info(`Notification marked as read: ${notificationId}`);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service' });
});

app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Notification service running on port ${PORT}`);
});

module.exports = app;