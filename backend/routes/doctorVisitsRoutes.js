const express = require('express');
const { body } = require('express-validator');
const doctorVisitsController = require('../controllers/doctorVisitsController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

router.get('/', doctorVisitsController.getAll);
router.post(
  '/',
  [body('doctor_name').trim().notEmpty().withMessage('Doctor name is required')],
  validate,
  doctorVisitsController.create
);
router.put('/:id', doctorVisitsController.update);
router.delete('/:id', doctorVisitsController.remove);

module.exports = router;
