const db = require('../config/database');

const getAll = (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM doctor_visits WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (doctor_name LIKE ? OR hospital LIKE ? OR diagnosis LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY visit_date DESC';

    const visits = db.prepare(query).all(...params);
    res.json(visits);
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { doctor_name, hospital, diagnosis, prescription_notes, follow_up_date, visit_date } = req.body;

    const result = db
      .prepare(
        `INSERT INTO doctor_visits (user_id, doctor_name, hospital, diagnosis, prescription_notes, follow_up_date, visit_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.userId,
        doctor_name,
        hospital || null,
        diagnosis || null,
        prescription_notes || null,
        follow_up_date || null,
        visit_date || new Date().toISOString().split('T')[0]
      );

    const visit = db.prepare('SELECT * FROM doctor_visits WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Doctor visit recorded', visit });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db
      .prepare('SELECT * FROM doctor_visits WHERE id = ? AND user_id = ?')
      .get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Doctor visit not found.' });
    }

    const { doctor_name, hospital, diagnosis, prescription_notes, follow_up_date, visit_date } = req.body;

    db.prepare(
      `UPDATE doctor_visits SET doctor_name = ?, hospital = ?, diagnosis = ?, prescription_notes = ?,
       follow_up_date = ?, visit_date = ? WHERE id = ? AND user_id = ?`
    ).run(
      doctor_name ?? existing.doctor_name,
      hospital ?? existing.hospital,
      diagnosis ?? existing.diagnosis,
      prescription_notes ?? existing.prescription_notes,
      follow_up_date ?? existing.follow_up_date,
      visit_date ?? existing.visit_date,
      id,
      req.userId
    );

    const visit = db.prepare('SELECT * FROM doctor_visits WHERE id = ?').get(id);
    res.json({ message: 'Doctor visit updated', visit });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db
      .prepare('DELETE FROM doctor_visits WHERE id = ? AND user_id = ?')
      .run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Doctor visit not found.' });
    }

    res.json({ message: 'Doctor visit deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
