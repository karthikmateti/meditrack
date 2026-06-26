export const classifyBP = (systolic, diastolic) => {
  if (systolic == null || diastolic == null) return 'unknown';
  if (systolic >= 140 || diastolic >= 90) return 'critical';
  if (systolic >= 120 || diastolic >= 80) return 'borderline';
  return 'normal';
};

export const classifyBloodSugar = (value) => {
  if (value == null) return 'unknown';
  if (value >= 200) return 'critical';
  if (value >= 140) return 'borderline';
  return 'normal';
};

export const classifySpO2 = (value) => {
  if (value == null) return 'unknown';
  if (value < 90) return 'critical';
  if (value < 95) return 'borderline';
  return 'normal';
};

export const getOverallRisk = (vitals) => {
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

export const riskColors = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  borderline: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const riskLabels = {
  normal: 'Normal',
  borderline: 'Borderline',
  critical: 'Critical',
  unknown: 'Unknown',
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const todayISO = () => new Date().toISOString().split('T')[0];

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
