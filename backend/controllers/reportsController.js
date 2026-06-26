const PDFDocument = require('pdfkit');
const db = require('../config/database');
const { getRiskDetails, generateInsights } = require('../utils/healthRisk');

const generateHealthReport = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, age, gender, blood_group, allergies, created_at FROM users WHERE id = ?')
      .get(req.userId);

    const latestVital = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(req.userId);

    const vitalsHistory = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
      .all(req.userId);

    const medicines = db
      .prepare("SELECT * FROM medicines WHERE user_id = ? AND status = 'active'")
      .all(req.userId);

    const symptoms = db
      .prepare('SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 10')
      .all(req.userId);

    const visits = db
      .prepare('SELECT * FROM doctor_visits WHERE user_id = ? ORDER BY visit_date DESC LIMIT 5')
      .all(req.userId);

    const risk = latestVital ? getRiskDetails(latestVital) : null;
    const insights = generateInsights(vitalsHistory.reverse());

    const doc = new PDFDocument({ margin: 50 });
    const filename = `MediTrack-Report-${user.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fillColor('#059669').fontSize(24).text('MediTrack Health Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#6b7280').fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Patient Information
    doc.fillColor('#059669').fontSize(16).text('Patient Information');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Age: ${user.age || 'N/A'} | Gender: ${user.gender || 'N/A'} | Blood Group: ${user.blood_group || 'N/A'}`);
    doc.text(`Allergies: ${user.allergies || 'None reported'}`);
    doc.moveDown(1);

    // Latest Vitals
    doc.fillColor('#059669').fontSize(16).text('Latest Vitals');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    if (latestVital) {
      doc.text(`Blood Pressure: ${latestVital.systolic_bp || 'N/A'}/${latestVital.diastolic_bp || 'N/A'} mmHg`);
      doc.text(`Blood Sugar: ${latestVital.blood_sugar || 'N/A'} mg/dL`);
      doc.text(`Temperature: ${latestVital.temperature || 'N/A'} °F`);
      doc.text(`Weight: ${latestVital.weight || 'N/A'} kg`);
      doc.text(`SpO2: ${latestVital.spo2 || 'N/A'}%`);
      doc.text(`Recorded: ${new Date(latestVital.created_at).toLocaleString()}`);
    } else {
      doc.text('No vitals recorded yet.');
    }
    doc.moveDown(1);

    // Risk Assessment
    doc.fillColor('#059669').fontSize(16).text('Risk Assessment');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    if (risk) {
      doc.text(`Overall Risk: ${risk.overall.toUpperCase()}`);
      doc.text(`Blood Pressure Status: ${risk.bloodPressure.toUpperCase()}`);
      doc.text(`Blood Sugar Status: ${risk.bloodSugar.toUpperCase()}`);
      doc.text(`SpO2 Status: ${risk.spo2.toUpperCase()}`);
    } else {
      doc.text('Insufficient data for risk assessment.');
    }
    doc.moveDown(1);

    // Health Insights
    doc.fillColor('#059669').fontSize(16).text('Health Insights');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    insights.forEach((insight) => {
      doc.text(`• ${insight}`);
    });
    doc.moveDown(1);

    // Active Medicines
    doc.fillColor('#059669').fontSize(16).text('Active Medicines');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    if (medicines.length === 0) {
      doc.text('No active medicines.');
    } else {
      medicines.forEach((med) => {
        doc.text(`• ${med.medicine_name} - ${med.dosage || 'N/A'} (${med.frequency || 'N/A'}) at ${med.time || 'N/A'}`);
      });
    }
    doc.moveDown(1);

    // Symptoms Summary
    doc.fillColor('#059669').fontSize(16).text('Recent Symptoms');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    if (symptoms.length === 0) {
      doc.text('No symptoms recorded.');
    } else {
      symptoms.forEach((s) => {
        doc.text(`• ${s.symptom_name} - Severity: ${s.severity}/10 (${s.date})`);
        if (s.notes) doc.text(`  Notes: ${s.notes}`);
      });
    }
    doc.moveDown(1);

    // Doctor Visits
    doc.fillColor('#059669').fontSize(16).text('Doctor Visit Summary');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11);
    if (visits.length === 0) {
      doc.text('No doctor visits recorded.');
    } else {
      visits.forEach((v) => {
        doc.text(`• Dr. ${v.doctor_name} - ${v.hospital || 'N/A'} (${v.visit_date})`);
        doc.text(`  Diagnosis: ${v.diagnosis || 'N/A'}`);
        if (v.follow_up_date) doc.text(`  Follow-up: ${v.follow_up_date}`);
      });
    }

    // Vitals History Table
    doc.addPage();
    doc.fillColor('#059669').fontSize(16).text('Vitals History (Last 10 Entries)');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(9);
    vitalsHistory.reverse().forEach((v) => {
      doc.text(
        `${new Date(v.created_at).toLocaleDateString()} | BP: ${v.systolic_bp || '-'}/${v.diastolic_bp || '-'} | Sugar: ${v.blood_sugar || '-'} | Weight: ${v.weight || '-'} | SpO2: ${v.spo2 || '-'}%`
      );
    });

    doc.moveDown(2);
    doc.fillColor('#6b7280').fontSize(8).text(
      'This report is generated by MediTrack for informational purposes only. Please consult a healthcare professional for medical advice.',
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    next(err);
  }
};

const exportCSV = (req, res, next) => {
  try {
    const vitals = db
      .prepare('SELECT * FROM vitals WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.userId);

    const headers = ['Date', 'Systolic BP', 'Diastolic BP', 'Blood Sugar', 'Temperature', 'Weight', 'SpO2'];
    const rows = vitals.map((v) =>
      [
        new Date(v.created_at).toISOString(),
        v.systolic_bp ?? '',
        v.diastolic_bp ?? '',
        v.blood_sugar ?? '',
        v.temperature ?? '',
        v.weight ?? '',
        v.spo2 ?? '',
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `MediTrack-Vitals-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateHealthReport, exportCSV };
