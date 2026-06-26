const db = require('../config/database');
const { getRiskDetails } = require('../utils/healthRisk');

const getAll = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.userId];

    if (startDate) {
      query += ' AND date(created_at) >= date(?)';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date(created_at) <= date(?)';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const vitals = db.prepare(query).all(...params);
    res.json(vitals);
  } catch (err) {
    next(err);
  }
};

const getLatest = (req, res, next) => {
  try {
    const vital = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(req.userId);

    if (!vital) {
      return res.json({ vital: null, risk: null });
    }

    res.json({ vital, risk: getRiskDetails(vital) });
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { systolic_bp, diastolic_bp, blood_sugar, temperature, weight, spo2 } = req.body;

    const result = db
      .prepare(
        `INSERT INTO vitals (user_id, systolic_bp, diastolic_bp, blood_sugar, temperature, weight, spo2)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.userId,
        systolic_bp ?? null,
        diastolic_bp ?? null,
        blood_sugar ?? null,
        temperature ?? null,
        weight ?? null,
        spo2 ?? null
      );

    const vital = db.prepare('SELECT * FROM vitals WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Vital recorded', vital, risk: getRiskDetails(vital) });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM vitals WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Vital entry not found.' });
    }

    const { systolic_bp, diastolic_bp, blood_sugar, temperature, weight, spo2 } = req.body;

    db.prepare(
      `UPDATE vitals SET systolic_bp = ?, diastolic_bp = ?, blood_sugar = ?, temperature = ?, weight = ?, spo2 = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      systolic_bp ?? existing.systolic_bp,
      diastolic_bp ?? existing.diastolic_bp,
      blood_sugar ?? existing.blood_sugar,
      temperature ?? existing.temperature,
      weight ?? existing.weight,
      spo2 ?? existing.spo2,
      id,
      req.userId
    );

    const vital = db.prepare('SELECT * FROM vitals WHERE id = ?').get(id);
    res.json({ message: 'Vital updated', vital, risk: getRiskDetails(vital) });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM vitals WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vital entry not found.' });
    }

    res.json({ message: 'Vital deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getLatest, create, update, remove };
