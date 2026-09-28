import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import cookieParser from 'cookie-parser';
import router from './productRoutes.js';
dotenv.config()
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const isLocal = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
    
    const isVercel = origin && origin.endsWith('.vercel.app');
    if (!origin || isLocal || isVercel) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`); 
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));




app.use(express.json());
app.use(cookieParser());  
                 
app.use('/api/auth', authRoutes);    
app.use('/api', router);    
     
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`)
});
  