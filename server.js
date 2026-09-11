
import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import cookieParser from 'cookie-parser';
import router from './productRoutes.js';

const app = express()  
dotenv.config()
  app.use(cors({
        origin: process.env.CLIENT_URL ||'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        secure: true
    })); 
app.use(express.json());
app.use(cookieParser());
                 
app.use('/api/auth', authRoutes);   
app.use('/api',router)    
     
const PORT=process.env.PORT || 5000;
app.listen (PORT,()=>{
    console.log(`Server running locally at http://localhost:${PORT}`)
    
})
       