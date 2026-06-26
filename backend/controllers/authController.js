const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, blood_group, allergies } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        `INSERT INTO users (name, email, password, age, gender, blood_group, allergies)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(name, email, hashedPassword, age || null, gender || null, blood_group || null, allergies || null);

    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    const token = generateToken(user.id);

    res.status(201).json({ message: 'Registration successful', token, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

const getProfile = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies, created_at FROM users WHERE id = ?')
      .get(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, blood_group, allergies } = req.body;

    db.prepare(
      `UPDATE users SET name = ?, age = ?, gender = ?, blood_group = ?, allergies = ? WHERE id = ?`
    ).run(name, age || null, gender || null, blood_group || null, allergies || null, req.userId);

    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies, created_at FROM users WHERE id = ?')
      .get(req.userId);

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };
