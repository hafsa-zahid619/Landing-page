const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Helper function to calculate real-time analytics using Mongoose aggregation
async function getSalesStats() {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  // Fallback defaults if database collection is currently empty
  return stats[0] || { totalRevenue: 0, totalOrders: 0 };
}

// 1. SERVER-SIDE RENDERING (Initial Page Load View)
router.get('/sales', async (req, res) => {
  try {
    const data = await getSalesStats();
    // Render sales.ejs template and pass database values directly into it
    res.render('sales', { 
      totalRevenue: data.totalRevenue, 
      totalOrders: data.totalOrders 
    });
  } catch (err) {
    res.status(500).send("Error compiling dashboard layout.");
  }
});

// 2. LIVE UPDATE ENDPOINT (AJAX Polling Route)
router.get('/api/sales-data', async (req, res) => {
  try {
    const data = await getSalesStats();
    // Respond strictly with raw JSON payload data 
    res.json({
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to pull live metrics." });
  }
});

module.exports = router;