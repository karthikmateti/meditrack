const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const getAll = (req, res, next) => {
  try {
    const prescriptions = db
      .prepare('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY uploaded_at DESC')
      .all(req.userId);
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
};

const upload = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const result = db
      .prepare('INSERT INTO prescriptions (user_id, file_name, file_path) VALUES (?, ?, ?)')
      .run(req.userId, req.file.originalname, req.file.filename);

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Prescription uploaded', prescription });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = db
      .prepare('SELECT * FROM prescriptions WHERE id = ? AND user_id = ?')
      .get(id, req.userId);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', prescription.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare('DELETE FROM prescriptions WHERE id = ?').run(id);
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, upload, remove };
