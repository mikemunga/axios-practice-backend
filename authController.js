import bcrypt from 'bcrypt';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

// inserting into the db pd and username
export const signupController = async (req, res) => {
    const {email , password, first_name} = req.body;
    
    try{
        const hashedPassword = await bcrypt.hash(password ,12);

        const queryText = `
        INSERT INTO users (email, password_hash, first_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, first_name;
        `
        const values = [email, hashedPassword, first_name];
        const result = await pool.query(queryText, values)
        const newUser = result.rows[0]

        const token = jwt.sign(
            {id: newUser.id, email: newUser.email, name: newUser.first_name}, process.env.JWT_SECRET,
            {expiresIn : '1m'}
        )        
       //cookie configuration
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 60 * 1000
        }
        res.cookie('token', token, cookieOptions)
        return res.status(201).json({
            status :'success',
            message :`${email} registered successfully!`,
            data:{
                user:{
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.first_name
                }
            }  
        });       
 
    }catch(error){
        console.log(error)
        if(error.code === '23505'){
            return res.status(409).json({
                status: 'fail',
                message :'Email already registered.'
            });
        }
       return res.status(500).json({
        status: 'error',
        message : 'An internal server error occured.'
       })
    } 
}


export const getMeController = async (req, res) => {
    
    try{
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({
                success:false,
                user:null,
                message: 'No token provided. Please log in'
            })
        }
        const decodedClaims = jwt.verify(token, process.env.JWT_SECRET);
    
    
        const queryText =`
        SELECT id, email, first_name, is_active FROM users WHERE id=$1
        `;
        const result = await pool.query(queryText, [decodedClaims.id]);
        
        const user = result.rows[0];
        
        if(!user){
            res.clearCookie('token',{
                httpOnly: true,
                secure: process.env.NODEENV === 'production',
                sameSite : 'strict'
            })
            return res.status(404).json({
                success: false,
                user: null,
                message: 'Account is deactivated.'
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                id: decodedClaims.id,
                email :decodedClaims.email,
                name :decodedClaims.name
            }
        })
    }catch(error){
        console.log(error)
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        return res.status(401).json({
            success:false,
            user: null,
            message: 'Session expired or invalid token.'
        })
    }
}

export const loginController = async (req, res) => {
    try{
        
        const {email, password} = req.body;
        const queryText = 'SELECT id, email, password_hash, first_name FROM users WHERE email = $1';
        const result = await pool.query(queryText, [email]);

        if(!result.rows[0]){
            //401 unauthorized is standard for bad credentials
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password.'
            });
        }
        const user = result.rows[0];
            //verify password
        const isPassword = await bcrypt.compare(password, user.password_hash);
        if(!isPassword){
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password.'
            })
        }
        
        const token = jwt.sign(
            {id: user.id, email:user.email, name: user.firstt_name},process.env.JWT_SECRET, {expiresIn :'7d'}
        )

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
        res.cookie('token', token, cookieOptions);
        return res.status(200).json({
            status: 'success',
            message: `Welcome back! ${user.first_name}`,
            data: {
                user: {  
                    id: user.id, 
                    email: user.email,
                    name: user.first_name
                },     
            }
        })
    }catch(error){
        console.log('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An internal server error ocurred.'
        })
    }
}
        
export const logoutCtroller = async (req, res) => {
    try{
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.status(200).json({
        status: 'success',
        message: 'Logged out successfully!'
    })
    }catch(error){ 
        return res.status(500).json({status: 'error', message:'Internal server error'})
    }
}


export const getItemsController =async (req, res) =>{
 try{
    const {category, search, page} = req.query;
    const limit = 90;
    const currentPage = parseInt(page, 10) || 1;
    const offset = (currentPage - 1) * limit;

    let queryText = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if(category){
        queryText +=` AND category =$${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
    }
    if(search) {
        queryText +=` AND LOWER(title) ILIKE $${paramIndex}`;
        queryParams.push(`%${search.toLowerCase()}%`);
        paramIndex++;
    }
    queryText +=` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    const result = await pool.query(queryText, queryParams);
    return res.status(200).json(result.rows)
 }catch(error) {    
    console.error("Error inside getItems", error.message);
    res.status(500).json({message: 'Internal server Error'})
 }
}
  

