const supabase = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const { MOCK_PRODUCTS } = require('../config/mockProducts');

// ─── GET PRODUCTS ─────────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { 
      category, colour, size, minPrice, maxPrice, sort, page = 1, limit = 12 
    } = req.query;

    let data, count;
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Filters
      if (category) query = query.eq('category', category);
      if (colour) query = query.contains('colours_available', [colour]);
      if (size) query = query.contains('sizes_available', [size]);
      if (minPrice) query = query.gte('price', minPrice);
      if (maxPrice) query = query.lte('price', maxPrice);

      // Sorting
      if (sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (sort === 'newest') query = query.order('created_at', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const result = await query;
      if (result.error) throw result.error;
      data = result.data;
      count = result.count;
      
      if (!data || data.length === 0) {
        throw new Error("No data in database, fall back to mock data");
      }
    } catch (dbError) {
      console.warn('[getProducts] Supabase connection failed, using local mock fallback:', dbError.message);
      
      // Fallback local filtering
      let filtered = [...MOCK_PRODUCTS];
      if (category) {
        filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (colour) {
        filtered = filtered.filter(p => 
          p.colours_available?.some(c => c.hex === colour || c.name.toLowerCase() === colour.toLowerCase())
        );
      }
      if (size) {
        filtered = filtered.filter(p => p.sizes_available?.includes(size));
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
      }

      // Sort
      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      }

      count = filtered.length;
      const from = (page - 1) * limit;
      data = filtered.slice(from, from + parseInt(limit));
    }

    return res.json({
      products: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('[getProducts]', err.message);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    let product;
    try {
      // Fetch product
      const { data, error } = await supabase
        .from('products')
        .select('*, reviews(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      product = data;
    } catch (dbError) {
      console.warn(`[getProductById] Supabase failed for ID ${id}, using local mock fallback:`, dbError.message);
      product = MOCK_PRODUCTS.find(p => p.id === id);
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });

    return res.json(product);
  } catch (err) {
    console.error('[getProductById]', err.message);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// ─── CREATE PRODUCT (ADMIN) ──────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, category, sizes_available, colours_available 
    } = req.body;

    // Handle file uploads (images and hover_video)
    // Assuming multer is used and files are in req.files
    const imageUrls = [];
    let hoverVideoUrl = '';

    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'styleai/products' });
        imageUrls.push(result.secure_url);
      }
    }

    if (req.files && req.files.hover_video) {
      const result = await cloudinary.uploader.upload(req.files.hover_video[0].path, { 
        resource_type: 'video',
        folder: 'styleai/videos' 
      });
      hoverVideoUrl = result.secure_url;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price,
        category,
        sizes_available: Array.isArray(sizes_available) ? sizes_available : JSON.parse(sizes_available),
        colours_available: Array.isArray(colours_available) ? colours_available : JSON.parse(colours_available),
        image_urls: imageUrls,
        hover_video_url: hoverVideoUrl
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (err) {
    console.error('[createProduct]', err.message);
    return res.status(500).json({ error: 'Failed to create product' });
  }
};

// ─── UPDATE PRODUCT (ADMIN) ──────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle new uploads if any
    if (req.files && req.files.images) {
      const imageUrls = [];
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'styleai/products' });
        imageUrls.push(result.secure_url);
      }
      updates.image_urls = imageUrls;
    }

    if (req.files && req.files.hover_video) {
      const result = await cloudinary.uploader.upload(req.files.hover_video[0].path, { 
        resource_type: 'video',
        folder: 'styleai/videos' 
      });
      updates.hover_video_url = result.secure_url;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('[updateProduct]', err.message);
    return res.status(500).json({ error: 'Failed to update product' });
  }
};

// ─── DELETE PRODUCT (ADMIN) ──────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[deleteProduct]', err.message);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
