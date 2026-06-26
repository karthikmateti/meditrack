const express = require('express');
const { body } = require('express-validator');
const vitalsController = require('../controllers/vitalsController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', vitalsController.getAll);
router.get('/latest', vitalsController.getLatest);
router.post(
  '/',
  [
    body('systolic_bp').optional().isFloat({ min: 50, max: 300 }),
    body('diastolic_bp').optional().isFloat({ min: 30, max: 200 }),
    body('blood_sugar').optional().isFloat({ min: 20, max: 600 }),
    body('temperature').optional().isFloat({ min: 90, max: 110 }),
    body('weight').optional().isFloat({ min: 1, max: 500 }),
    body('spo2').optional().isFloat({ min: 50, max: 100 }),
  ],
  validate,
  vitalsController.create
);
router.put('/:id', vitalsController.update);
router.delete('/:id', vitalsController.remove);

module.exports = router;
