const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');
const redis = require('redis');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3003;
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
    new winston.transports.File({ filename: 'logs/booking-service.log' })
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
    await channel.assertExchange('booking.events', 'topic', { durable: true });
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

// Per STUDENT dashboard
app.get('/bookings', async (req, res) => {
  try {
    const studentId = req.query.studentId;
    
    // Mock data per ora (sostituire con vera query Prisma)
    const mockBookings = [
      { 
        id: 1, 
        courseName: "Hip Hop Principianti", 
        date: "2025-09-20T18:00:00Z", 
        status: "BOOKED",
        instructor: "Marco Rossi",
        location: "Sala A"
      },
      { 
        id: 2, 
        courseName: "Salsa Intermedio", 
        date: "2025-09-10T17:00:00Z", 
        status: "DONE",
        instructor: "Laura Bianchi",
        location: "Sala B"
      },
      { 
        id: 3, 
        courseName: "Bachata Avanzato", 
        date: "2025-09-25T19:30:00Z", 
        status: "BOOKED",
        instructor: "Carlos Martinez",
        location: "Sala C"
      }
    ];

    res.json(mockBookings);
    logger.info(`Bookings fetched for student: ${studentId}`);
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Per INSTRUCTOR dashboard
app.get('/instructor/:id/bookings', async (req, res) => {
  try {
    const instructorId = req.params.id;
    
    // Mock studenti iscritti ai corsi dell'istruttore
    const mockInstructorBookings = [
      { 
        id: 10, 
        studentName: "Mario Rossi", 
        course: "Tango Argentino",
        date: "2025-09-18T20:00:00Z",
        status: "CONFIRMED"
      },
      { 
        id: 11, 
        studentName: "Giulia Verdi", 
        course: "Hip Hop Principianti",
        date: "2025-09-20T18:00:00Z",
        status: "CONFIRMED"
      },
      { 
        id: 12, 
        studentName: "Luca Bianchi", 
        course: "Salsa Intermedio",
        date: "2025-09-22T19:00:00Z",
        status: "PENDING"
      }
    ];

    res.json(mockInstructorBookings);
    logger.info(`Instructor bookings fetched for: ${instructorId}`);
  } catch (error) {
    logger.error('Error fetching instructor bookings:', error);
    res.status(500).json({ error: 'Failed to fetch instructor bookings' });
  }
});

/* ------------------ STANDARD BOOKING ENDPOINTS ------------------ */

app.post('/bookings', async (req, res) => {
  try {
    const { studentId, classId, date } = req.body;
    
    // TODO: Implementare logica di prenotazione reale
    const booking = {
      id: Date.now(),
      studentId,
      classId,
      date,
      status: 'BOOKED',
      createdAt: new Date()
    };

    res.status(201).json(booking);
    logger.info(`Booking created: ${booking.id}`);
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'booking-service' });
});

app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Booking service running on port ${PORT}`);
});

module.exports = app;