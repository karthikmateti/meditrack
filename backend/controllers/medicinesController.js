const db = require('../config/database');

const getAll = (req, res, next) => {
  try {
    const medicines = db
      .prepare('SELECT * FROM medicines WHERE user_id = ? ORDER BY start_date DESC')
      .all(req.userId);
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

const getToday = (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const medicines = db
      .prepare(
        `SELECT * FROM medicines WHERE user_id = ? AND status = 'active'
         AND date(start_date) <= date(?) AND (end_date IS NULL OR date(end_date) >= date(?))`
      )
      .all(req.userId, today, today);
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { medicine_name, dosage, frequency, time, start_date, end_date, status } = req.body;

    const result = db
      .prepare(
        `INSERT INTO medicines (user_id, medicine_name, dosage, frequency, time, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.userId,
        medicine_name,
        dosage || null,
        frequency || null,
        time || null,
        start_date || null,
        end_date || null,
        status || 'active'
      );

    const medicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Medicine added', medicine });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM medicines WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    const { medicine_name, dosage, frequency, time, start_date, end_date, status } = req.body;

    db.prepare(
      `UPDATE medicines SET medicine_name = ?, dosage = ?, frequency = ?, time = ?,
       start_date = ?, end_date = ?, status = ? WHERE id = ? AND user_id = ?`
    ).run(
      medicine_name ?? existing.medicine_name,
      dosage ?? existing.dosage,
      frequency ?? existing.frequency,
      time ?? existing.time,
      start_date ?? existing.start_date,
      end_date ?? existing.end_date,
      status ?? existing.status,
      id,
      req.userId
    );

    const medicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
    res.json({ message: 'Medicine updated', medicine });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM medicines WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getToday, create, update, remove };
