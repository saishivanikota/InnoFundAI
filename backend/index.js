import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import fundingRoutes from './routes/funding.js';
import trendRoutes from './routes/trends.js';
import dashboardRoutes from './routes/dashboard.js';
import patentRoutes from './routes/patents.js';
import aiRoutes from './routes/ai.js';
import './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patents', patentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on port ${PORT}`);
});
