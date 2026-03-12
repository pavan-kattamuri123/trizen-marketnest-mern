import Product from '../models/Product.js';

// @desc    Get all products (with pagination, search, category filter)
// @route   GET /api/products
// @access  Public (Customer & Brand)
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = 12; // 12 products per page
    const page = Number(req.query.pageNumber) || 1;
    
    // Search by product name
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Filter by category
    const category = req.query.category ? { category: req.query.category } : {};

    // Base query: Only published and not deleted products should be publicly visible 
    // Wait, brands might want to see their own drafts, but this is the public marketplace endpoint.
    // For brand dashboard, we'll have a separate endpoint.
    const query = { ...keyword, ...category, status: 'published', isDeleted: false };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('brand', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name email')
      .where({ isDeleted: false });

    if (product) {
      // If customer, ensure it's published. If not published, restrict.
      if (product.status !== 'published') {
        // Only brand owner can view draft/archived
        if (req.user && product.brand._id.equals(req.user._id)) {
           return res.json(product);
        }
        res.status(404);
        throw new Error('Product not found');
      }

      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private / Brand
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, status } = req.body;
    
    // Handle image URLs from S3 upload middleware (multer-s3 stores URL in file.location)
    const images = req.files ? req.files.map(file => file.location) : [];

    const product = new Product({
      name,
      description,
      price,
      category,
      status: status || 'draft',
      images,
      brand: req.user._id, // Add brand reference dynamically from logged-in user
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private / Brand
export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, status, existingImages } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check ownership
      if (product.brand.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to edit this product');
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.status = status || product.status;

      // Handle images update
      let updatedImages = [];
      // Combine existing images (if they kept some)
      if (existingImages) {
        updatedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      }
      // Add newly uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.location);
        updatedImages = [...updatedImages, ...newImages];
      }
      
      if (updatedImages.length > 0) {
        product.images = updatedImages;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a product
// @route   DELETE /api/products/:id
// @access  Private / Brand
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
       // Check ownership
      if (product.brand.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this product');
      }

      // Soft delete: set flag to true
      product.isDeleted = true;
      await product.save();

      res.json({ message: 'Product removed (soft deleted)' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get brand dashboard stats & products
// @route   GET /api/products/dashboard/stats
// @access  Private / Brand
export const getBrandDashboard = async (req, res, next) => {
  try {
    // Return all non-deleted products for this brand
    const products = await Product.find({ 
      brand: req.user._id, 
      isDeleted: false 
    }).sort({ createdAt: -1 });

    const total = products.length;
    const publishedCount = products.filter(p => p.status === 'published').length;
    const archivedCount = products.filter(p => p.status === 'archived').length;
    const draftCount = products.filter(p => p.status === 'draft').length;

    res.json({
      stats: {
        total,
        publishedCount,
        archivedCount,
        draftCount
      },
      products
    });
  } catch (error) {
    next(error);
  }
};
