const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
  // 1. Grab the Authorization header
  const authHeader = req.headers['authorization'];
  
  // 2. Check if the header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No authentication token provided.' });
  }

  // 3. Extract the clean token string from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // 4. Decode and verify the token payload against your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Inject the user identity data into the request object for later route controllers
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Authentication failed: Invalid or expired token.' });
  }
};
