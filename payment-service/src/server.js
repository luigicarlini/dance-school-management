const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');
const redis = require('redis');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3004;
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
    new winston.transports.File({ filename: 'logs/payment-service.log' })
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
    await channel.assertExchange('payment.events', 'topic', { durable: true });
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

// Per STUDENT dashboard - crediti rimasti
app.get('/credits', async (req, res) => {
  try {
    const studentId = req.query.studentId;
    
    // Mock crediti studente
    const mockCredits = {
      credits: 8,
      totalPurchased: 20,
      totalUsed: 12,
      lastPurchase: "2025-09-01T10:00:00Z",
      expiryDate: "2025-12-31T23:59:59Z"
    };

    res.json(mockCredits);
    logger.info(`Credits fetched for student: ${studentId}`);
  } catch (error) {
    logger.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// Per ADMIN dashboard - entrate mensili
app.get('/revenue/monthly', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Mock entrate mensili
    const mockRevenue = {
      amount: 3200,
      month: currentMonth,
      year: currentYear,
      transactions: 45,
      averageTransaction: 71.11,
      growth: "+12.5%"
    };

    res.json(mockRevenue);
    logger.info(`Monthly revenue fetched: ${mockRevenue.amount}`);
  } catch (error) {
    logger.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

/* ------------------ STANDARD PAYMENT ENDPOINTS ------------------ */

app.post('/payments', async (req, res) => {
  try {
    const { studentId, amount, method } = req.body;
    
    // TODO: Implementare logica di pagamento reale (Stripe/PayPal)
    const payment = {
      id: Date.now(),
      studentId,
      amount,
      method,
      status: 'COMPLETED',
      createdAt: new Date()
    };

    res.status(201).json(payment);
    logger.info(`Payment processed: ${payment.id}`);
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'payment-service' });
});

app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Payment service running on port ${PORT}`);
});

module.exports = app;