const db = require('../config/database');

const getAll = (req, res, next) => {
  try {
    const contacts = db
      .prepare('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY id ASC')
      .all(req.userId);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const create = (req, res, next) => {
  try {
    const { contact_name, phone_number } = req.body;

    const result = db
      .prepare('INSERT INTO emergency_contacts (user_id, contact_name, phone_number) VALUES (?, ?, ?)')
      .run(req.userId, contact_name, phone_number);

    const contact = db.prepare('SELECT * FROM emergency_contacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Emergency contact added', contact });
  } catch (err) {
    next(err);
  }
};

const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db
      .prepare('SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?')
      .get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Emergency contact not found.' });
    }

    const { contact_name, phone_number } = req.body;

    db.prepare(
      'UPDATE emergency_contacts SET contact_name = ?, phone_number = ? WHERE id = ? AND user_id = ?'
    ).run(
      contact_name ?? existing.contact_name,
      phone_number ?? existing.phone_number,
      id,
      req.userId
    );

    const contact = db.prepare('SELECT * FROM emergency_contacts WHERE id = ?').get(id);
    res.json({ message: 'Emergency contact updated', contact });
  } catch (err) {
    next(err);
  }
};

const remove = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db
      .prepare('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?')
      .run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Emergency contact not found.' });
    }

    res.json({ message: 'Emergency contact deleted' });
  } catch (err) {
    next(err);
  }
};

const getEmergencySummary = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies FROM users WHERE id = ?')
      .get(req.userId);

    const latestVital = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(req.userId);

    const contacts = db
      .prepare('SELECT * FROM emergency_contacts WHERE user_id = ?')
      .all(req.userId);

    res.json({ user, latestVital, contacts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getEmergencySummary };
