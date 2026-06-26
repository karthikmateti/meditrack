const express = require('express');
const { body } = require('express-validator');
const emergencyController = require('../controllers/emergencyController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', emergencyController.getAll);
router.get('/summary', emergencyController.getEmergencySummary);
router.post(
  '/',
  [
    body('contact_name').trim().notEmpty().withMessage('Contact name is required'),
    body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  emergencyController.create
);
router.put('/:id', emergencyController.update);
router.delete('/:id', emergencyController.remove);

module.exports = router;
