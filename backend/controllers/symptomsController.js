const db = require('../config/database');

const getAll = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM symptoms WHERE user_id = ?';
    const params = [req.userId];

    if (startDate) {
      query += ' AND date(date) >= date(?)';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date(date) <= date(?)';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    const symptoms = db.prepare(query).all(...params);
    res.json(symptoms);
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { symptom_name, severity, notes, date } = req.body;

    const result = db
      .prepare(
        `INSERT INTO symptoms (user_id, symptom_name, severity, notes, date)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(req.userId, symptom_name, severity, notes || null, date || new Date().toISOString().split('T')[0]);

    const symptom = db.prepare('SELECT * FROM symptoms WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Symptom recorded', symptom });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM symptoms WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Symptom not found.' });
    }

    const { symptom_name, severity, notes, date } = req.body;

    db.prepare(
      `UPDATE symptoms SET symptom_name = ?, severity = ?, notes = ?, date = ? WHERE id = ? AND user_id = ?`
    ).run(
      symptom_name ?? existing.symptom_name,
      severity ?? existing.severity,
      notes ?? existing.notes,
      date ?? existing.date,
      id,
      req.userId
    );

    const symptom = db.prepare('SELECT * FROM symptoms WHERE id = ?').get(id);
    res.json({ message: 'Symptom updated', symptom });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM symptoms WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Symptom not found.' });
    }

    res.json({ message: 'Symptom deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
