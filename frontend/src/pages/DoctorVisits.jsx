import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { doctorVisitsService } from '../services/healthService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, todayISO } from '../utils/healthRisk';

const emptyForm = {
  doctor_name: '',
  hospital: '',
  diagnosis: '',
  prescription_notes: '',
  follow_up_date: '',
  visit_date: todayISO(),
};

const DoctorVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await doctorVisitsService.getAll(params);
      setVisits(data);
    } catch {
      setError('Failed to load doctor visits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchVisits, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (visit) => {
    setEditingId(visit.id);
    setForm({
      doctor_name: visit.doctor_name,
      hospital: visit.hospital || '',
      diagnosis: visit.diagnosis || '',
      prescription_notes: visit.prescription_notes || '',
      follow_up_date: visit.follow_up_date || '',
      visit_date: visit.visit_date,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, follow_up_date: form.follow_up_date || null };
      if (editingId) {
        await doctorVisitsService.update(editingId, payload);
      } else {
        await doctorVisitsService.create(payload);
      }
      setModalOpen(false);
      fetchVisits();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save visit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visit record?')) return;
    try {
      await doctorVisitsService.delete(id);
      fetchVisits();
    } catch {
      setError('Failed to delete visit.');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Doctor Visits</h1>
          <p className="page-subtitle">Maintain your medical visit history</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus className="h-4 w-4" /> Add Visit
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by doctor, hospital, or diagnosis..."
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : visits.length === 0 ? (
        <EmptyState
          title="No doctor visits recorded"
          description="Keep track of your appointments and diagnoses."
          action={<button onClick={openAdd} className="btn-primary"><FiPlus /> Add Visit</button>}
        />
      ) : (
        <div className="space-y-4">
          {visits.map((v) => (
            <div key={v.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dr. {v.doctor_name}</h3>
                  <p className="text-sm text-gray-500">{v.hospital || 'Hospital not specified'}</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Visit:</span> {formatDate(v.visit_date)}
                    {v.follow_up_date && (
                      <span className="ml-4"><span className="font-medium">Follow-up:</span> {formatDate(v.follow_up_date)}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-primary-600">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-600">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {v.diagnosis && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{v.diagnosis}</p>
                </div>
              )}
              {v.prescription_notes && (
                <div className="mt-2 rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-400">Prescription Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{v.prescription_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Visit' : 'Add Doctor Visit'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Doctor Name</label>
              <input required className="input-field" value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hospital</label>
              <input className="input-field" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Diagnosis</label>
            <textarea rows={2} className="input-field" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prescription Notes</label>
            <textarea rows={3} className="input-field" value={form.prescription_notes} onChange={(e) => setForm({ ...form, prescription_notes: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Visit Date</label>
              <input type="date" required className="input-field" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Follow-up Date</label>
              <input type="date" className="input-field" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
            </div>
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

export default DoctorVisits;
