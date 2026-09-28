import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import cookieParser from 'cookie-parser';
import router from './productRoutes.js';

const app = express()  
dotenv.config(); 

const allowedOrigins = [
  "https://my-react-app-six-ruby.vercel.app",
  'https://vercel.app',
  'http://localhost:5173', 
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
 
app.options('{*splat}', cors()); 

app.use(express.json());
app.use(cookieParser());  
                 
app.use('/api/auth', authRoutes);    
app.use('/api', router);    
     
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`)
});
  