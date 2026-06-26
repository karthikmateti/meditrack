import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiDroplet,
  FiTrendingUp,
  FiHeart,
  FiPackage,
  FiAlertCircle,
  FiPlus,
} from 'react-icons/fi';
import { dashboardService } from '../services/healthService';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { classifyBP, classifyBloodSugar, classifySpO2 } from '../utils/healthRisk';

const quickActions = [
  { to: '/vitals', label: 'Log Vitals', icon: FiActivity, color: 'bg-blue-500' },
  { to: '/medicines', label: 'Add Medicine', icon: FiPackage, color: 'bg-purple-500' },
  { to: '/symptoms', label: 'Track Symptom', icon: FiHeart, color: 'bg-orange-500' },
  { to: '/sos', label: 'SOS Emergency', icon: FiAlertCircle, color: 'bg-red-500' },
];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: dashData } = await dashboardService.getDashboard();
        setData(dashData);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  const { user, latestVital, risk, todayMedicines, missedMedicines, insights } = data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here&apos;s your health overview for today</p>
        </div>
        {risk && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Overall Risk:</span>
            <RiskBadge status={risk.overall} size="lg" />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Blood Pressure"
          value={latestVital ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}` : null}
          unit="mmHg"
          icon={FiActivity}
          badge={
            latestVital && (
              <RiskBadge status={classifyBP(latestVital.systolic_bp, latestVital.diastolic_bp)} />
            )
          }
        />
        <StatCard
          title="Blood Sugar"
          value={latestVital?.blood_sugar}
          unit="mg/dL"
          icon={FiDroplet}
          badge={latestVital && <RiskBadge status={classifyBloodSugar(latestVital.blood_sugar)} />}
        />
        <StatCard
          title="Weight"
          value={latestVital?.weight}
          unit="kg"
          icon={FiTrendingUp}
        />
        <StatCard
          title="SpO2"
          value={latestVital?.spo2}
          unit="%"
          icon={FiHeart}
          badge={latestVital && <RiskBadge status={classifySpO2(latestVital.spo2)} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today&apos;s Medicines
            </h2>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {todayMedicines?.length || 0} scheduled
            </span>
          </div>
          {todayMedicines?.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No medicines scheduled for today.</p>
          ) : (
            <ul className="space-y-3">
              {todayMedicines?.map((med) => (
                <li
                  key={med.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{med.medicine_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {med.dosage} • {med.time || 'No time set'}
                    </p>
                  </div>
                  <span className="text-xs text-primary-600 dark:text-primary-400">{med.frequency}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Missed Medicines
            </h2>
            {(missedMedicines?.length || 0) > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {missedMedicines.length} missed
              </span>
            )}
          </div>
          {missedMedicines?.length === 0 ? (
            <p className="text-sm text-green-600 dark:text-green-400">All caught up! No missed doses.</p>
          ) : (
            <ul className="space-y-3">
              {missedMedicines?.map((med) => (
                <li
                  key={med.id}
                  className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/10"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{med.medicine_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Was due at {med.time}</p>
                  </div>
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {insights?.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            AI Health Insights
          </h2>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="card flex flex-col items-center gap-3 text-center transition hover:shadow-md"
            >
              <div className={`rounded-xl p-3 text-white ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {!latestVital && (
        <div className="card border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900/40">
              <FiPlus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Start tracking your health</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Log your first vitals entry to see personalized insights.
              </p>
              <Link to="/vitals" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
                Log Vitals →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
