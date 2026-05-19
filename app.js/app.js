const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Connect to MongoDB Localhost
mongoose.connect('mongodb://localhost:27017/electronicsStore')
  .then(() => console.log('Connected smoothly to MongoDB!'))
  .catch(err => console.log('DB Connection Error:', err));

// Set up template engine and static files folders
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); // If your images folder is separate
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Management Configuration
app.use(session({
  secret: 'estore_security_token_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/electronicsStore' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
}));

app.use(flash());

// Make session variables universally accessible in your HTML views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Link Authentication Routes
app.use('/', require('./routes/auth'));

// Base Home Route to render your webpage
app.get('/', (req, res) => {
  res.render('index');
});

// Dummy route hooks for Login and Register views
app.get('/login', (req, res) => res.send('Login Page Form View coming next...'));
app.get('/register', (req, res) => res.send('Registration Form View coming next...'));

// Secured Admin testing zone route
const { isLoggedIn, isAdmin } = require('./middleware/auth');
app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
  res.send('<h1>Welcome to the secure Admin Panel! Only admins can see this.</h1>');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server fired up beautifully on http://localhost:${PORT}`));