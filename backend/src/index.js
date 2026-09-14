import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import planRoutes from './routes/planRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import importRoutes from './routes/importRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/catalog', courseRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/import', importRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            status: 'ok',
            service: 'Study Plan Repository (SPR) Backend API',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Database connection test failed:', err.message);
        res.status(500).json({
            status: 'error',
            service: 'Study Plan Repository (SPR) Backend API',
            database: 'disconnected',
            error: err.message
        });
    }
});

// Root welcome route
app.get('/', (req, res) => {
    res.json({
        service: 'Study Plan Repository (SPR) Backend API',
        status: 'online',
        healthCheck: 'http://localhost:5000/api/health',
        frontendUI: 'http://localhost:3000'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 SPR Backend API running on port ${PORT}`);
});
