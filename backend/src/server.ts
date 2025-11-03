import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import requestsRouter from './routes/requests';
import adminRouter from './routes/admin';
import contractsRouter from './routes/contracts';
import tripsRouter from './routes/trips';
import driversRouter from './routes/drivers';
import vehiclesRouter from './routes/vehicles';
import companyRouter from './routes/company';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/company', companyRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(PORT, () => {
  console.log(`ASPA Backend running on http://localhost:${PORT}`);
});


