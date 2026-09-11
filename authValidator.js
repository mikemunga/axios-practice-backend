import {body, validationResult} from 'express-validator';
import pool from './db.js';

export const signUpValidationRules = [
    body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail()
    .bail()
    .custom(async (value)=> {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [value]);
        if(result.rows.length > 0){
            
            throw new Error (`This email already exists`)
        }
        return true
    }),

    body('password')
     .notEmpty().withMessage('Password is required.')
    .isLength({min: 8, max:128}).withMessage('password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must include atleast one uppercase letter.')
    .matches(/\d/).withMessage('Password must include at least one number.')
];

export const loginValidationRules = [
    
    body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .bail()

    .custom(async (value) => {
        const result = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [value]);

        if(result.rows.length === 0){
            throw new Error('Invalid email or password.')
        }
        return true;
    }),

    body('password')
    .notEmpty().withMessage('Please enter a password')    
]

export const checkValidationResult = (req, res , next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      const formattedErrors = {};
      errors.array().forEach(err => {
        if(err.path && !formattedErrors[err.path]){
            formattedErrors[err.path] = err.msg;
        }
      })

      return res.status(400).json({
        status :'fail',
        errors :formattedErrors
      })
    }
    next();
}

