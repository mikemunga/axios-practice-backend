
import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import cookieParser from 'cookie-parser';
import router from './productRoutes.js';

const app = express()  
dotenv.config

app.use(cors({
  origin: 'https://my-react-app-six-ruby.vercel.app', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(cookieParser());  
                 
app.use('/api/auth', authRoutes);    
app.use('/api',router)    
     
const PORT=process.env.PORT || 5000;
app.listen (PORT,()=>{
    console.log(`Server running locally at http://localhost:${PORT}`)
    
})
       