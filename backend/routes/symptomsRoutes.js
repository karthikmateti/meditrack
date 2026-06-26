const express = require('express');
const { body } = require('express-validator');
const symptomsController = require('../controllers/symptomsController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', symptomsController.getAll);
router.post(
  '/',
  [
    body('symptom_name').trim().notEmpty().withMessage('Symptom name is required'),
    body('severity').isInt({ min: 1, max: 10 }).withMessage('Severity must be 1-10'),
  ],
  validate,
  symptomsController.create
);
router.put('/:id', symptomsController.update);
router.delete('/:id', symptomsController.remove);

module.exports = router;
