import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiCopy, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { emergencyService } from '../services/healthService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const emptyContact = { contact_name: '', phone_number: '' };

const SOS = () => {
  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyContact);
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, summaryRes] = await Promise.all([
        emergencyService.getAll(),
        emergencyService.getSummary(),
      ]);
      setContacts(contactsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError('Failed to load emergency data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateAlert = async () => {
    setLocating(true);
    setError('');

    let loc = { latitude: 'N/A', longitude: 'N/A', address: 'Location unavailable' };

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        loc = {
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        };
        setLocation(loc);
      } catch {
        setError('Could not get location. Alert will be sent without coordinates.');
      }
    }

    const user = summary?.user;
    const vital = summary?.latestVital;

    const message = `🚨 EMERGENCY ALERT 🚨

Patient Name: ${user?.name || 'Unknown'}
Location: ${loc.address}
Latitude: ${loc.latitude}
Longitude: ${loc.longitude}

Latest BP: ${vital ? `${vital.systolic_bp}/${vital.diastolic_bp} mmHg` : 'N/A'}
Latest Sugar: ${vital?.blood_sugar ?? 'N/A'} mg/dL
Latest SpO2: ${vital?.spo2 ?? 'N/A'}%

Blood Group: ${user?.blood_group || 'N/A'}
Allergies: ${user?.allergies || 'None reported'}

Immediate assistance required.`;

    setAlertMessage(message);
    setLocating(false);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(alertMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy message.');
    }
  };

  const shareWhatsApp = () => {
    const phone = contacts[0]?.phone_number?.replace(/\D/g, '') || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(alertMessage)}`;
    window.open(url, '_blank');
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyContact);
    setModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditingId(contact.id);
    setForm({ contact_name: contact.contact_name, phone_number: contact.phone_number });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await emergencyService.update(editingId, form);
      } else {
        await emergencyService.create(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await emergencyService.delete(id);
      fetchData();
    } catch {
      setError('Failed to delete contact.');
    }
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
      <div>
        <h1 className="page-title">SOS Emergency</h1>
        <p className="page-subtitle">Quick emergency alerts with your health summary</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}

      <div className="card border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex flex-col items-center py-8 text-center">
          <button
            onClick={generateAlert}
            disabled={locating}
            className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 hover:shadow-xl active:scale-95"
          >
            {locating ? (
              <LoadingSpinner size="lg" className="border-white border-t-red-200" />
            ) : (
              <>
                <FiAlertTriangle className="h-12 w-12" />
                <span className="absolute -bottom-8 text-sm font-bold text-red-600 dark:text-red-400">SOS</span>
              </>
            )}
          </button>
          <p className="mt-10 text-sm text-red-700 dark:text-red-300">
            Tap to generate emergency alert with your location and health data
          </p>
        </div>
      </div>

      {alertMessage && (
        <div className="card animate-fade-in">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Emergency Alert Message</h2>
          {location && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiMapPin className="h-4 w-4 text-red-500" />
              Location captured: {location.latitude}, {location.longitude}
            </div>
          )}
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {alertMessage}
          </pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={copyMessage} className="btn-secondary">
              <FiCopy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
            {contacts.length > 0 && (
              <button onClick={shareWhatsApp} className="btn-primary bg-green-600 hover:bg-green-700">
                <FaWhatsapp className="h-4 w-4" /> Share via WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contacts</h2>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No emergency contacts"
          description="Add at least one emergency contact for SOS alerts."
          action={<button onClick={openAdd} className="btn-primary"><FiPlus /> Add Contact</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{c.contact_name}</p>
                <p className="text-sm text-gray-500">{c.phone_number}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-primary-600">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Contact' : 'Add Emergency Contact'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Contact Name</label>
            <input required className="input-field" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <input required type="tel" className="input-field" placeholder="+1234567890" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
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

export default SOS;
