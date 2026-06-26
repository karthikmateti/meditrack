import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { symptomsService } from '../services/healthService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, todayISO } from '../utils/healthRisk';

const emptyForm = { symptom_name: '', severity: 5, notes: '', date: todayISO() };

const Symptoms = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSymptoms = async () => {
    setLoading(true);
    try {
      const { data } = await symptomsService.getAll();
      setSymptoms(data);
    } catch {
      setError('Failed to load symptoms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const chartData = [...symptoms]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map((s) => ({
      date: formatDate(s.date),
      severity: s.severity,
      name: s.symptom_name,
    }));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (symptom) => {
    setEditingId(symptom.id);
    setForm({
      symptom_name: symptom.symptom_name,
      severity: symptom.severity,
      notes: symptom.notes || '',
      date: symptom.date,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, severity: parseInt(form.severity, 10) };
      if (editingId) {
        await symptomsService.update(editingId, payload);
      } else {
        await symptomsService.create(payload);
      }
      setModalOpen(false);
      fetchSymptoms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save symptom.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this symptom entry?')) return;
    try {
      await symptomsService.delete(id);
      fetchSymptoms();
    } catch {
      setError('Failed to delete symptom.');
    }
  };

  const severityColor = (s) => {
    if (s <= 3) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (s <= 6) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Symptom Tracker</h1>
          <p className="page-subtitle">Monitor symptoms and severity trends</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus className="h-4 w-4" /> Add Symptom
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Severity Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="severity" stroke="#059669" fill="#059669" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : symptoms.length === 0 ? (
        <EmptyState
          title="No symptoms logged"
          description="Track your symptoms to identify patterns over time."
          action={<button onClick={openAdd} className="btn-primary"><FiPlus /> Add Symptom</button>}
        />
      ) : (
        <div className="space-y-3">
          {symptoms.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.symptom_name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColor(s.severity)}`}>
                    {s.severity}/10
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatDate(s.date)}</p>
                {s.notes && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-primary-600">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-600">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Symptom' : 'Add Symptom'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Symptom Name</label>
            <input required className="input-field" value={form.symptom_name} onChange={(e) => setForm({ ...form, symptom_name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Severity: {form.severity}/10</label>
            <input type="range" min="1" max="10" className="w-full accent-primary-600" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input type="date" required className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea rows={3} className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Symptoms;
