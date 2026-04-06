const express = require('express');
const router = express.Router();
const TrendController = require('../controllers/trend.controller');

// GET /api/v1/trends
router.get('/', TrendController.getTrends);

module.exports = router;
