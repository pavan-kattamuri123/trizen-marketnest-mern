import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrandDashboard
} from '../controllers/productController.js';
import { protect, authorizeRole } from '../middlewares/authMiddleware.js';
import { upload } from '../config/s3.js';

const router = express.Router();

// Public route for marketplace
router.route('/').get(getProducts);

// Brand Dashboard route (must be before /:id to avoid mistaking 'dashboard' for an ID)
router.route('/dashboard/stats')
  .get(protect, authorizeRole('Brand'), getBrandDashboard);

// Brand routes to create products (with image upload)
router.route('/')
  .post(protect, authorizeRole('Brand'), upload.array('images', 5), createProduct);

// Routes for specific product ID
router.route('/:id')
  .get(getProductById) // Read details (Public)
  .put(protect, authorizeRole('Brand'), upload.array('images', 5), updateProduct) // Update
  .delete(protect, authorizeRole('Brand'), deleteProduct); // Soft delete

export default router;
