import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiBell } from 'react-icons/fi';
import { medicinesService } from '../services/healthService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { todayISO } from '../utils/healthRisk';

const frequencies = ['Once Daily', 'Twice Daily', 'Every 4 Hours', 'Every 6 Hours', 'Every 8 Hours', 'Every 12 Hours'];

const emptyForm = {
  medicine_name: '',
  dosage: '',
  frequency: 'Once Daily',
  time: '',
  start_date: todayISO(),
  end_date: '',
  status: 'active',
};

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [todayMeds, setTodayMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const [allRes, todayRes] = await Promise.all([
        medicinesService.getAll(),
        medicinesService.getToday(),
      ]);
      setMedicines(allRes.data);
      setTodayMeds(todayRes.data);
    } catch {
      setError('Failed to load medicines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
    requestNotificationPermission();
  };

  const openEdit = (med) => {
    setEditingId(med.id);
    setForm({
      medicine_name: med.medicine_name,
      dosage: med.dosage || '',
      frequency: med.frequency || 'Once Daily',
      time: med.time || '',
      start_date: med.start_date || todayISO(),
      end_date: med.end_date || '',
      status: med.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, end_date: form.end_date || null };
      if (editingId) {
        await medicinesService.update(editingId, payload);
      } else {
        await medicinesService.create(payload);
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await medicinesService.delete(id);
      fetchMedicines();
    } catch {
      setError('Failed to delete medicine.');
    }
  };

  const displayList = tab === 'today' ? todayMeds : medicines;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const missed = todayMeds.filter((m) => m.time && m.time.split(',').some((t) => t.trim() < currentTime));
  const upcoming = todayMeds.filter((m) => !missed.includes(m));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Medicine Reminders</h1>
          <p className="page-subtitle">Manage your medications and reminders</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <FiClock className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayMeds.length}</p>
              <p className="text-sm text-gray-500">Today&apos;s Medicines</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <FiBell className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcoming.length}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <FiBell className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{missed.length}</p>
              <p className="text-sm text-gray-500">Missed Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['all', 'today'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'all' ? 'All Medicines' : "Today's Schedule"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : displayList.length === 0 ? (
        <EmptyState
          title="No medicines found"
          description="Add your medications to receive timely reminders."
          action={<button onClick={openAdd} className="btn-primary"><FiPlus /> Add Medicine</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayList.map((med) => (
            <div key={med.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{med.medicine_name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{med.dosage}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  med.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {med.status}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><FiClock className="mr-1 inline h-4 w-4" />{med.time || 'No time set'}</p>
                <p>Frequency: {med.frequency}</p>
                <p>{med.start_date} → {med.end_date || 'Ongoing'}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(med)} className="btn-secondary flex-1 text-xs">
                  <FiEdit2 className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => handleDelete(med.id)} className="btn-danger flex-1 text-xs">
                  <FiTrash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Medicine' : 'Add Medicine'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Medicine Name</label>
            <input required className="input-field" value={form.medicine_name} onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Dosage</label>
            <input className="input-field" placeholder="e.g. 500mg" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Frequency</label>
            <select className="input-field" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {frequencies.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Time (comma-separated for multiple)</label>
            <input className="input-field" placeholder="08:00, 20:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Start Date</label>
              <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End Date</label>
              <input type="date" className="input-field" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

export default Medicines;
