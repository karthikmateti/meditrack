const express = require('express');
const prescriptionsController = require('../controllers/prescriptionsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

router.get('/', prescriptionsController.getAll);
router.post('/upload', upload.single('file'), prescriptionsController.upload);
router.delete('/:id', prescriptionsController.remove);

module.exports = router;
