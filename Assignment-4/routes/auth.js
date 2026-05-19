const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST: Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email already exists.');
      return res.redirect('/register');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    req.flash('success_msg', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Server Error during registration.');
  }
});

// POST: Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Save user data into session state
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect(user.role === 'admin' ? '/admin' : '/');
  } catch (err) {
    res.status(500).send('Server error during login.');
  }
});

// GET: Logout User
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;