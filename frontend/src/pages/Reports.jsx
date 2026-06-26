import { useState } from 'react';
import { FiDownload, FiFileText, FiTable } from 'react-icons/fi';
import { reportsService } from '../services/healthService';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadBlob } from '../utils/healthRisk';

const Reports = () => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownloadPDF = async () => {
    setLoadingPdf(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await reportsService.downloadPDF();
      downloadBlob(data, `MediTrack-Health-Report-${Date.now()}.pdf`);
      setSuccess('Health report downloaded successfully.');
    } catch {
      setError('Failed to generate PDF report.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExportCSV = async () => {
    setLoadingCsv(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await reportsService.exportCSV();
      downloadBlob(data, `MediTrack-Vitals-${Date.now()}.csv`);
      setSuccess('Vitals CSV exported successfully.');
    } catch {
      setError('Failed to export CSV.');
    } finally {
      setLoadingCsv(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Health Reports</h1>
        <p className="page-subtitle">Download professional health reports for your doctor</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20">{success}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <FiFileText className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Health Report</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Generate a comprehensive PDF report including patient information, latest vitals,
            medicine list, symptoms summary, doctor visits, risk assessment, and vitals history.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Patient Information</li>
            <li>• Latest Vitals & Risk Assessment</li>
            <li>• Active Medicines</li>
            <li>• Symptoms & Doctor Visits</li>
            <li>• AI Health Insights</li>
            <li>• Vitals History</li>
          </ul>
          <button onClick={handleDownloadPDF} disabled={loadingPdf} className="btn-primary mt-6 w-full">
            {loadingPdf ? <LoadingSpinner size="sm" /> : <><FiDownload className="h-4 w-4" /> Download Health Report</>}
          </button>
        </div>

        <div className="card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <FiTable className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Vitals CSV</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Export all your vitals data as a CSV file for use in spreadsheets or other health tools.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Blood Pressure readings</li>
            <li>• Blood Sugar levels</li>
            <li>• Temperature & Weight</li>
            <li>• SpO2 measurements</li>
            <li>• Timestamps included</li>
          </ul>
          <button onClick={handleExportCSV} disabled={loadingCsv} className="btn-secondary mt-6 w-full">
            {loadingCsv ? <LoadingSpinner size="sm" /> : <><FiDownload className="h-4 w-4" /> Export CSV</>}
          </button>
        </div>
      </div>

      <div className="card bg-primary-50 dark:bg-primary-900/20">
        <h3 className="font-semibold text-primary-800 dark:text-primary-300">Report Tips</h3>
        <p className="mt-2 text-sm text-primary-700 dark:text-primary-400">
          For the most comprehensive report, ensure you have logged vitals, medicines, symptoms,
          and doctor visits. Share the PDF with your healthcare provider during appointments.
        </p>
      </div>
    </div>
  );
};

export default Reports;
