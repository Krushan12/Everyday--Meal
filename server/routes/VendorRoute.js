import express from 'express';


import { deleteMenu, getMenu, getMenuByEmail, isAuth, login, logout, register, saveMenu } from '../controllers/Vendorcontroller.js';
import authStudent from '../middlewares/authStudent.js';
import authVendor from '../middlewares/authVendor.js';

const VendorRouter = express.Router();

// Public routes
VendorRouter.post('/register', register);
VendorRouter.post('/login', login);
VendorRouter.get('/menu/:email', getMenuByEmail); // Public route for students to view menus


// Authenticated routes
VendorRouter.get('/is-auth', authVendor, isAuth);
VendorRouter.get('/logout', authVendor, logout);

// Menu operations (protected)
VendorRouter.post('/menu', authVendor, saveMenu);    // Create or update
VendorRouter.get('/menu', authVendor, getMenu);      // Get logged-in vendor's menu
VendorRouter.delete('/menu', authVendor, deleteMenu); // Delete menu of logged-in vendor
 


export default VendorRouter;
