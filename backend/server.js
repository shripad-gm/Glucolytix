import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/auth.routes.js';
import diabetesOprRoutes from './routes/diabetesOpr.routes.js';
import connectMongoDB from './db/connectMongoDB.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/diabetesOpr', diabetesOprRoutes );


app.listen(PORT, () => {
    connectMongoDB();
    console.log(`Server is running on port ${PORT}`);
});
