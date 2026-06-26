const db = require('../config/database');
const { getRiskDetails, generateInsights } = require('../utils/healthRisk');

const getDashboard = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies FROM users WHERE id = ?')
      .get(req.userId);

    const latestVital = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(req.userId);

    const vitalsHistory = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 30')
      .all(req.userId);

    const today = new Date().toISOString().split('T')[0];
    const todayMedicines = db
      .prepare(
        `SELECT * FROM medicines WHERE user_id = ? AND status = 'active'
         AND date(start_date) <= date(?) AND (end_date IS NULL OR date(end_date) >= date(?))`
      )
      .all(req.userId, today, today);

    const allMedicines = db
      .prepare("SELECT * FROM medicines WHERE user_id = ? AND status = 'active'")
      .all(req.userId);

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const missedMedicines = todayMedicines.filter((med) => {
      if (!med.time) return false;
      const medTimes = med.time.split(',').map((t) => t.trim());
      return medTimes.some((t) => t < currentTime);
    });

    const risk = latestVital ? getRiskDetails(latestVital) : null;
    const insights = generateInsights(vitalsHistory.reverse());

    res.json({
      user,
      latestVital,
      risk,
      todayMedicines,
      missedMedicines,
      upcomingMedicines: todayMedicines.filter((m) => !missedMedicines.includes(m)),
      totalActiveMedicines: allMedicines.length,
      insights,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
