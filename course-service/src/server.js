const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');
const redis = require('redis');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;
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
    new winston.transports.File({ filename: 'logs/course-service.log' })
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
    await channel.assertExchange('course.events', 'topic', { durable: true });
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

// Per INSTRUCTOR dashboard - corsi assegnati
app.get('/instructor/:id/courses', async (req, res) => {
  try {
    const instructorId = req.params.id;
    
    // Mock corsi dell'istruttore
    const mockCourses = [
      { 
        id: 1,
        name: "Hip Hop Principianti", 
        date: "2025-09-18T18:00:00Z", 
        duration: 90,
        level: "BEGINNER",
        studentsCount: 12,
        maxStudents: 15
      },
      { 
        id: 2,
        name: "Salsa Intermedio", 
        date: "2025-09-20T19:30:00Z", 
        duration: 75,
        level: "INTERMEDIATE",
        studentsCount: 8,
        maxStudents: 12
      },
      { 
        id: 3,
        name: "Tango Argentino", 
        date: "2025-09-22T20:00:00Z", 
        duration: 120,
        level: "ADVANCED",
        studentsCount: 6,
        maxStudents: 10
      }
    ];

    res.json(mockCourses);
    logger.info(`Courses fetched for instructor: ${instructorId}`);
  } catch (error) {
    logger.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Failed to fetch instructor courses' });
  }
});

/* ------------------ STANDARD COURSE ENDPOINTS ------------------ */

app.get('/courses', async (req, res) => {
  try {
    // Mock tutti i corsi disponibili
    const mockCourses = [
      { id: 1, name: "Hip Hop Principianti", instructor: "Marco Rossi", level: "BEGINNER" },
      { id: 2, name: "Salsa Intermedio", instructor: "Laura Bianchi", level: "INTERMEDIATE" },
      { id: 3, name: "Tango Argentino", instructor: "Carlos Martinez", level: "ADVANCED" },
      { id: 4, name: "Bachata Base", instructor: "Sofia Lopez", level: "BEGINNER" }
    ];

    res.json(mockCourses);
    logger.info('All courses fetched');
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/courses', async (req, res) => {
  try {
    const { name, instructorId, level, duration, maxStudents } = req.body;
    
    // TODO: Implementare logica di creazione corso reale
    const course = {
      id: Date.now(),
      name,
      instructorId,
      level,
      duration,
      maxStudents,
      createdAt: new Date()
    };

    res.status(201).json(course);
    logger.info(`Course created: ${course.id}`);
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'course-service' });
});

app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Course service running on port ${PORT}`);
});

module.exports = app;