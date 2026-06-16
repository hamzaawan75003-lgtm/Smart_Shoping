const supabase = require('../config/supabase');

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, mode, role, created_at')
      .eq('id', req.user.id)
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, mode } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (mode !== undefined) updates.mode = mode;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, mode, role, created_at')
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMeasurements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMeasurements = async (req, res) => {
  try {
    const { measurements, sizes, skin_tone, colour_palette } = req.body;
    
    const dataToSave = {
      user_id: req.user.id,
      photo_url: measurements.photo_url,
      height_cm: measurements.height_cm,
      chest_inches: measurements.chest || measurements.chest_inches,
      waist_inches: measurements.waist || measurements.waist_inches,
      hips_inches: measurements.hips || measurements.hips_inches,
      shoulders_inches: measurements.shoulders || measurements.shoulders_inches,
      shirt_size: sizes.shirt_size,
      pant_size: sizes.pant_size,
      jacket_size: sizes.jacket_size,
      skin_tone: skin_tone,
      colour_palette: colour_palette || []
    };

    // Check if measurements already exist for this user
    const { data: records, error: fetchError } = await supabase
      .from('user_measurements')
      .select('user_id')
      .eq('user_id', req.user.id);

    if (fetchError) throw fetchError;

    let result;
    if (records && records.length > 0) {
      // Update existing
      const { data, error } = await supabase
        .from('user_measurements')
        .update(dataToSave)
        .eq('user_id', req.user.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('user_measurements')
        .insert(dataToSave)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(*)')
      .eq('user_id', req.user.id);
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // check if it exists
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .single();
      
    if (existing) {
       return res.status(400).json({ error: 'Item already in wishlist' });
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: req.user.id,
        product_id: productId
      })
      .select('*, products(*)')
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
