import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true, // e.g., 'Shirts', 'Pants', 'Shoes', 'Accessories'
    },
    images: [
      {
        type: String, // Cloduinary URLs
        required: true,
      },
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Will automatically add createdAt and updatedAt fields
  }
);

// Add text index for search by product name
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
