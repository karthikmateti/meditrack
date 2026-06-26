const classifyBP = (systolic, diastolic) => {
  if (systolic == null || diastolic == null) return 'unknown';
  if (systolic >= 140 || diastolic >= 90) return 'critical';
  if (systolic >= 120 || diastolic >= 80) return 'borderline';
  return 'normal';
};

const classifyBloodSugar = (value) => {
  if (value == null) return 'unknown';
  if (value >= 200) return 'critical';
  if (value >= 140) return 'borderline';
  return 'normal';
};

const classifySpO2 = (value) => {
  if (value == null) return 'unknown';
  if (value < 90) return 'critical';
  if (value < 95) return 'borderline';
  return 'normal';
};

const getOverallRisk = (vitals) => {
  if (!vitals) return 'unknown';
  const statuses = [
    classifyBP(vitals.systolic_bp, vitals.diastolic_bp),
    classifyBloodSugar(vitals.blood_sugar),
    classifySpO2(vitals.spo2),
  ].filter((s) => s !== 'unknown');

  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('borderline')) return 'borderline';
  if (statuses.length === 0) return 'unknown';
  return 'normal';
};

const getRiskDetails = (vitals) => ({
  bloodPressure: classifyBP(vitals?.systolic_bp, vitals?.diastolic_bp),
  bloodSugar: classifyBloodSugar(vitals?.blood_sugar),
  spo2: classifySpO2(vitals?.spo2),
  overall: getOverallRisk(vitals),
});

const generateInsights = (vitalsHistory) => {
  const insights = [];
  if (!vitalsHistory || vitalsHistory.length < 2) {
    return ['Log more vitals to receive personalized health insights.'];
  }

  const sorted = [...vitalsHistory].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  const recent = sorted.slice(-5);
  const older = sorted.slice(0, Math.min(5, sorted.length - 1));

  const avg = (arr, key) => {
    const vals = arr.map((v) => v[key]).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const recentSystolic = avg(recent, 'systolic_bp');
  const olderSystolic = avg(older, 'systolic_bp');
  if (recentSystolic != null && olderSystolic != null) {
    if (recentSystolic < olderSystolic - 5) {
      insights.push('Blood pressure appears to be improving over recent readings.');
    } else if (recentSystolic > olderSystolic + 5) {
      insights.push('Blood pressure has been trending higher. Consider consulting your doctor.');
    }
  }

  const recentSugar = avg(recent, 'blood_sugar');
  const olderSugar = avg(older, 'blood_sugar');
  if (recentSugar != null && olderSugar != null) {
    if (recentSugar > olderSugar + 15) {
      insights.push('Blood sugar levels are increasing. Monitor your diet and medication adherence.');
    } else if (recentSugar < olderSugar - 15) {
      insights.push('Blood sugar levels are improving. Keep up the good work!');
    }
  }

  const recentWeight = avg(recent, 'weight');
  const olderWeight = avg(older, 'weight');
  if (recentWeight != null && olderWeight != null) {
    const diff = recentWeight - olderWeight;
    if (Math.abs(diff) >= 2) {
      insights.push(
        diff > 0
          ? `Weight has increased by approximately ${diff.toFixed(1)} kg recently.`
          : `Weight has decreased by approximately ${Math.abs(diff).toFixed(1)} kg recently.`
      );
    }
  }

  if (insights.length === 0) {
    insights.push('Your vitals are stable. Continue regular monitoring.');
  }

  return insights;
};

module.exports = {
  classifyBP,
  classifyBloodSugar,
  classifySpO2,
  getOverallRisk,
  getRiskDetails,
  generateInsights,
};
