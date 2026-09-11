import express from 'express';
import rateLimit from 'express-rate-limit';

import { signUpValidationRules, 
    loginValidationRules, 
    checkValidationResult, 
} from './authValidator.js';


import { loginController, signupController , getMeController, logoutCtroller} from './authController.js';
const router = express.Router();

const authLimiter = rateLimit({
   // windowMs: 15* 60 * 1000, //15 minutes
    max: 10,
    message: {message: 'Too many requests from this Ip. Please try again in 15 minutes.'},
    standardHeaders: true,
    legacyHeaders: false
})
router.post('/signup',authLimiter, signUpValidationRules, checkValidationResult, signupController);

router.post('/login', authLimiter, loginValidationRules,checkValidationResult, loginController)

router.get('/me', getMeController)
router.post('/logout', logoutCtroller)





export default router;  