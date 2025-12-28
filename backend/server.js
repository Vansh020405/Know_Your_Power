import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Request logger (Moved up to capture everything)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// CORS Configuration - Explicitly allow everything for dev
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// DB Config
const db = process.env.MONGO_URI;

if (!db) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
}

// Connect to Mongo
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
