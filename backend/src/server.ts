import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import './config/redis'; // Initialize Redis connection
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true,
}));
app.use(express.json());
import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
