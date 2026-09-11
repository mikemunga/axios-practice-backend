import express from "express";
import { getItemsController } from "./authController.js";
import { getCartController, addToCartController, updateQuantityController, deleteCartItemController, getSignleItemController} from "./cartController.js";
const router = express.Router();
router.get('/items', getItemsController);
router.get('/cart', getCartController);
router.post('/cart',addToCartController);
router.put('/cart/:id', updateQuantityController);
router.delete('/cart/:id', deleteCartItemController);
router.get('/item/:id', getSignleItemController)

export default router;