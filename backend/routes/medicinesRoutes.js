const express = require('express');
const { body } = require('express-validator');
const medicinesController = require('../controllers/medicinesController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', medicinesController.getAll);
router.get('/today', medicinesController.getToday);
router.post(
  '/',
  [body('medicine_name').trim().notEmpty().withMessage('Medicine name is required')],
  validate,
  medicinesController.create
);
router.put('/:id', medicinesController.update);
router.delete('/:id', medicinesController.remove);

module.exports = router;
