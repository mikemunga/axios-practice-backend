
import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import cookieParser from 'cookie-parser';
import router from './productRoutes.js';

const app = express()  
dotenv.config
 app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());  
                 
app.use('/api/auth', authRoutes);    
app.use('/api',router)    
     
const PORT=process.env.PORT || 5000;
app.listen (PORT,()=>{
    console.log(`Server running locally at http://localhost:${PORT}`)
    
})
       