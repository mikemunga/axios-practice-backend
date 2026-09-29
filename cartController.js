import pool from "./db.js";
import jwt from 'jsonwebtoken';


export const getCartController = async (req, res) => {
  
  try {
  const token = req.cookies.token;

  if(!token) {
    return res.status(200).json([])
  }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const queryText = `
      SELECT
        c.id AS cart_item_id,
        c.quantity,
        c.created_at,
        p.id,
        p.title,
        p.price, 
        p.image,
        p.category
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;  
    `; 

    const result = await pool.query(queryText, [userId]);
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error inside getCart:", error.message);
    if (error.name === 'jsonWebTokenError' || error.name === 'TokenExpiredError'){
      return res.status(200).json([]);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const addToCartController = async (req, res) => {
  
  try {
    const token = req.cookies.token;
    
    if(!token){
      return res.status(401).json({message: 'Authorization required no token found'})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { item_id } = req.body;

    if (!item_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

  
    const checkQuery = "SELECT * FROM cart_items WHERE product_id = $1 AND user_id = $2";
    const checkResult = await pool.query(checkQuery, [item_id, userId]);

    if (checkResult.rows.length > 0) {
    
      const updateQuery = "UPDATE cart_items SET quantity = quantity + 1 WHERE product_id = $1 AND user_id = $2  RETURNING *;";
      const result = await pool.query(updateQuery, [item_id, userId]);
  
    } else {

      const insertQuery = "INSERT INTO cart_items (product_id, quantity, user_id) VALUES ($1, 1, $2) RETURNING *";
      await pool.query(insertQuery, [item_id, userId]); 
    }
    const finalCartItems = 'SELECT * FROM cart_items where user_id =$1'
    const results = await pool.query(finalCartItems, [userId]);
    return res.status(200).json(results.rows)

    } catch (error) {
    console.error("Error inside addToCart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }  
};

  


export const updateQuantityController = async (req, res) => {
  try {
    const { id } = req.params; 
    const { quantity } = req.body;


    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: "Quantity value parameter is required" });
    }

    const queryText = "UPDATE cart_items SET quantity = $1 WHERE id= $2 RETURNING *";
    const queryParams = [quantity, id];

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({message: 'Cart sucessful upadated!', data: result.rows[0]});

  } catch (error) {
    console.error("Error inside updateQuantity:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteCartItemController = async (req, res) => {
      
  try {
    const { id } = req.params;
    const queryText = "DELETE FROM cart_items WHERE id = $1 RETURNING *";
    const result = await pool.query(queryText, [id]);
    return res.status(200).json({ message: "Item successfully removed from basket." });

  } catch (error) {
    console.error("Error inside deleteCartItem:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getProductDetailsController = async(req, res) => {
  try {
    const {id} = req.params;

    const queryText = `SELECT * FROM products WHERE id = $1`;
    const result = await pool.query(queryText, [id])

    if(result.rows.length === 0) {
      return res.status(404).json({message: 'Product not found'});
    }

    return res.status(200).json(result.rows[0]);
  } catch(error) {
    console.log('Error inside getProductById', error.message);
    return res.status(500).json({message: 'Internal Server Error'})
  }
}
