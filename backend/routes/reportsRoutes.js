const express = require('express');
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/pdf', reportsController.generateHealthReport);
router.get('/csv', reportsController.exportCSV);

module.exports = router;
