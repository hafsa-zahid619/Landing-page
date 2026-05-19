const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Reusing your Mongoose model from Assignment 3
const verifyToken = require('../middleware/verifyToken');

// ==========================================
// 1. AUTHENTICATION & JWT GENERATION ENDPOINT
// ==========================================
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate JWT encoding user metadata
    const token = jwt.sign(
      { user_id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Stream back raw JSON carrying the token authorization string
    return res.json({
      success: true,
      message: 'Authentication successful!',
      token: token
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// 2. PUBLIC CATALOG ENDPOINTS (No Token Needed)
// ==========================================

// GET: All Products list
router.get('/products', async (req, res) => {
  // Dummy product array payload representing database content
  const mockProducts = [
    { id: 1, name: "OLED Laptop", category: "Electronics", price: 1200 },
    { id: 2, name: "Wireless Headphones", category: "Audio", price: 250 }
  ];
  res.json({ count: mockProducts.length, data: mockProducts });
});

// GET: Single Product details
router.get('/products/:id', async (req, res) => {
  res.json({ id: req.params.id, name: "Sample Product", price: 150, description: "Detailed item look view" });
});

// ==========================================
// 3. SECURED ENDPOINTS (Protected via verifyToken)
// ==========================================

// GET: Currently Logged In Profile Information
router.get('/user/profile', verifyToken, async (req, res) => {
  try {
    // Locate the user using the identity payload injected by the verifyToken middleware
    const user = await User.findById(req.user.user_id).select('-password');
    res.json({ success: true, profile: user });
  } catch (err) {
    res.status(500).json({ error: 'Server data retrieval error.' });
  }
});

// POST: Submit Checkout Order
router.post('/orders', verifyToken, (req, res) => {
  const { cartItems, totalPaid } = req.body;
  res.json({
    success: true,
    message: 'Order recorded securely in the cloud!',
    orderDetails: {
      buyerId: req.user.user_id, // Read straight from the decoded token identity
      items: cartItems || [],
      total: totalPaid || 0,
      timestamp: new Date()
    }
  });
});

module.exports = router;