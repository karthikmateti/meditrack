import { useEffect, useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiDownload, FiEye, FiFile } from 'react-icons/fi';
import { prescriptionsService } from '../services/healthService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatDateTime } from '../utils/healthRisk';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data } = await prescriptionsService.getAll();
      setPrescriptions(data);
    } catch {
      setError('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await prescriptionsService.upload(formData);
      fetchPrescriptions();
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await prescriptionsService.delete(id);
      fetchPrescriptions();
    } catch {
      setError('Failed to delete prescription.');
    }
  };

  const getFileUrl = (filePath) => `/uploads/${filePath}`;
  const isImage = (name) => /\.(jpg|jpeg|png)$/i.test(name);
  const isPdf = (name) => /\.pdf$/i.test(name);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">Upload and manage your prescription documents</p>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? <LoadingSpinner size="sm" /> : <><FiUpload className="h-4 w-4" /> Upload</>}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="card border-dashed border-2 border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10">
        <div className="flex flex-col items-center py-8 text-center">
          <FiUpload className="mb-3 h-10 w-10 text-primary-500" />
          <p className="font-medium text-gray-900 dark:text-white">Drag & drop or click Upload</p>
          <p className="mt-1 text-sm text-gray-500">Supports PDF, JPG, PNG (max 5MB)</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : prescriptions.length === 0 ? (
        <EmptyState title="No prescriptions uploaded" description="Upload your prescription documents for easy access." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
                  <FiFile className="h-6 w-6 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-white">{p.file_name}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(p.uploaded_at)}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setPreview(p)} className="btn-secondary flex-1 text-xs">
                  <FiEye className="h-3 w-3" /> Preview
                </button>
                <a href={getFileUrl(p.file_path)} download={p.file_name} className="btn-secondary flex-1 text-xs">
                  <FiDownload className="h-3 w-3" /> Download
                </a>
                <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs">
                  <FiTrash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.file_name || 'Preview'} size="xl">
        {preview && (
          <div className="flex justify-center">
            {isImage(preview.file_name) ? (
              <img src={getFileUrl(preview.file_path)} alt={preview.file_name} className="max-h-[70vh] rounded-lg" />
            ) : isPdf(preview.file_name) ? (
              <iframe src={getFileUrl(preview.file_path)} title={preview.file_name} className="h-[70vh] w-full rounded-lg" />
            ) : (
              <p className="text-gray-500">Preview not available for this file type.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
