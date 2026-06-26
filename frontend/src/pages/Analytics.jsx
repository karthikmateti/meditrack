import { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { vitalsService, symptomsService } from '../services/healthService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/healthRisk';

const filterOptions = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Custom Range', days: null },
];

const Analytics = () => {
  const [vitals, setVitals] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(7);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filter === 'custom' && customRange.start) {
          params.startDate = customRange.start;
          params.endDate = customRange.end;
        } else if (typeof filter === 'number') {
          const start = new Date();
          start.setDate(start.getDate() - filter);
          params.startDate = start.toISOString().split('T')[0];
        }

        const [vitalsRes, symptomsRes] = await Promise.all([
          vitalsService.getAll(params),
          symptomsService.getAll(params),
        ]);
        setVitals(vitalsRes.data.reverse());
        setSymptoms(symptomsRes.data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, customRange.start, customRange.end]);

  const chartData = useMemo(
    () =>
      vitals.map((v) => ({
        date: formatDate(v.created_at),
        systolic: v.systolic_bp,
        diastolic: v.diastolic_bp,
        bloodSugar: v.blood_sugar,
        weight: v.weight,
        spo2: v.spo2,
      })),
    [vitals]
  );

  const symptomData = useMemo(
    () =>
      [...symptoms]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((s) => ({
          date: formatDate(s.date),
          severity: s.severity,
          name: s.symptom_name,
        })),
    [symptoms]
  );

  const chartProps = {
    margin: { top: 5, right: 20, left: 0, bottom: 5 },
  };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--tw-bg-opacity, 1)',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Health Analytics</h1>
          <p className="page-subtitle">Visualize your health trends over time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setFilter(opt.days ?? 'custom')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                (opt.days === filter || (opt.days === null && filter === 'custom'))
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'custom' && (
        <div className="card flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Start</label>
            <input type="date" className="input-field" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">End</label>
            <input type="date" className="input-field" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
          </div>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">
          No vitals data available for the selected period. Log vitals to see analytics.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Blood Pressure Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#059669" strokeWidth={2} dot={false} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={false} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Blood Sugar Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="bloodSugar" stroke="#f59e0b" strokeWidth={2} dot={false} name="Blood Sugar" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Weight Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">SpO2 Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="spo2" stroke="#ef4444" strokeWidth={2} dot={false} name="SpO2 (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {symptomData.length > 0 && (
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Symptom Severity Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={symptomData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="severity" stroke="#059669" fill="#059669" fillOpacity={0.3} name="Severity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
