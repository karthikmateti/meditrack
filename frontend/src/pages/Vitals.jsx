import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { vitalsService } from '../services/healthService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RiskBadge from '../components/RiskBadge';
import { formatDateTime, classifyBP, classifyBloodSugar, classifySpO2 } from '../utils/healthRisk';

const emptyForm = {
  systolic_bp: '',
  diastolic_bp: '',
  blood_sugar: '',
  temperature: '',
  weight: '',
  spo2: '',
};

const Vitals = () => {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await vitalsService.getAll(params);
      setVitals(data);
    } catch {
      setError('Failed to load vitals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [filters.startDate, filters.endDate]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (vital) => {
    setEditingId(vital.id);
    setForm({
      systolic_bp: vital.systolic_bp ?? '',
      diastolic_bp: vital.diastolic_bp ?? '',
      blood_sugar: vital.blood_sugar ?? '',
      temperature: vital.temperature ?? '',
      weight: vital.weight ?? '',
      spo2: vital.spo2 ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : parseFloat(v)])
    );
    try {
      if (editingId) {
        await vitalsService.update(editingId, payload);
      } else {
        await vitalsService.create(payload);
      }
      setModalOpen(false);
      fetchVitals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vital.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vital entry?')) return;
    try {
      await vitalsService.delete(id);
      fetchVitals();
    } catch {
      setError('Failed to delete vital.');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Daily Vitals</h1>
          <p className="page-subtitle">Track and monitor your health metrics</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      <div className="card flex flex-wrap items-end gap-4">
        <FiFilter className="mb-2.5 h-5 w-5 text-gray-400" />
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            className="input-field"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            className="input-field"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <button
          onClick={() => setFilters({ startDate: '', endDate: '' })}
          className="btn-secondary mb-0.5"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : vitals.length === 0 ? (
        <EmptyState
          title="No vitals recorded"
          description="Start logging your daily vitals to track your health over time."
          action={
            <button onClick={openAdd} className="btn-primary">
              <FiPlus className="h-4 w-4" /> Add First Entry
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">BP</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Sugar</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Temp</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Weight</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">SpO2</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vitals.map((v) => (
                <tr key={v.id} className="bg-white dark:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{formatDateTime(v.created_at)}</td>
                  <td className="px-4 py-3">{v.systolic_bp}/{v.diastolic_bp}</td>
                  <td className="px-4 py-3">{v.blood_sugar ?? '—'}</td>
                  <td className="px-4 py-3">{v.temperature ?? '—'}°F</td>
                  <td className="px-4 py-3">{v.weight ?? '—'} kg</td>
                  <td className="px-4 py-3">{v.spo2 ?? '—'}%</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <RiskBadge status={classifyBP(v.systolic_bp, v.diastolic_bp)} />
                      {v.blood_sugar && <RiskBadge status={classifyBloodSugar(v.blood_sugar)} />}
                      {v.spo2 && <RiskBadge status={classifySpO2(v.spo2)} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-primary-600">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-600">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Vital Entry' : 'Add Vital Entry'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Systolic BP</label>
              <input type="number" className="input-field" placeholder="120" value={form.systolic_bp} onChange={(e) => setForm({ ...form, systolic_bp: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Diastolic BP</label>
              <input type="number" className="input-field" placeholder="80" value={form.diastolic_bp} onChange={(e) => setForm({ ...form, diastolic_bp: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Blood Sugar (mg/dL)</label>
              <input type="number" className="input-field" placeholder="100" value={form.blood_sugar} onChange={(e) => setForm({ ...form, blood_sugar: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Temperature (°F)</label>
              <input type="number" step="0.1" className="input-field" placeholder="98.6" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Weight (kg)</label>
              <input type="number" step="0.1" className="input-field" placeholder="70" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SpO2 (%)</label>
              <input type="number" className="input-field" placeholder="98" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vitals;
