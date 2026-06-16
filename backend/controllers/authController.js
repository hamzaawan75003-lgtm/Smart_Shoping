const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 12;

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email: email.trim().toLowerCase(), password_hash, role: 'user', mode: 'simple' }])
      .select('id, name, email, role, mode, created_at')
      .single();

    if (error) throw error;

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    // Fetch user (include password_hash)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, mode, password_hash, created_at')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Never send password_hash to client
    const { password_hash: _, ...safeUser } = user;
    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// ─── GET ME (protected) ───────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, mode, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[getMe]', err.message);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ─── UPDATE MODE ──────────────────────────────────────────────────────────────
const updateMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['simple', 'smart'].includes(mode))
      return res.status(400).json({ error: 'mode must be "simple" or "smart"' });

    const { data: user, error } = await supabase
      .from('users')
      .update({ mode })
      .eq('id', req.user.id)
      .select('id, name, email, role, mode')
      .single();

    if (error) throw error;
    return res.json({ user });
  } catch (err) {
    console.error('[updateMode]', err.message);
    return res.status(500).json({ error: 'Failed to update mode' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Fetch user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (fetchError || !user)
      return res.status(404).json({ error: 'User not found' });

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('email', email.trim().toLowerCase());

    if (updateError) throw updateError;

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[resetPassword]', err.message);
    return res.status(500).json({ error: 'Password reset failed' });
  }
};

module.exports = { register, login, getMe, updateMode, resetPassword };
