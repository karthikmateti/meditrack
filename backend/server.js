require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const medicinesRoutes = require('./routes/medicinesRoutes');
const symptomsRoutes = require('./routes/symptomsRoutes');
const doctorVisitsRoutes = require('./routes/doctorVisitsRoutes');
const prescriptionsRoutes = require('./routes/prescriptionsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const initDatabase = require('./database/init');
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediTrack API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/doctor-visits', doctorVisitsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`MediTrack API running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using that port or set a different PORT.`);
    process.exit(1);
  }

  console.error('Server error:', error);
  process.exit(1);
});

module.exports = app;
