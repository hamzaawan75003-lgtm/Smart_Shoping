const supabase = require('../config/supabase');

exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, review_text } = req.body;
    
    // Check if user already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .single();
      
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        product_id,
        rating,
        review_text
      })
      .select('*, users(name)')
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
