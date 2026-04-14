import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { submitComplaint } from '../api/complaintAPI';
import LocationMap from '../components/LocationMap';
import toast from 'react-hot-toast';
import './SubmitComplaint.css';

const CATEGORIES = ['Pothole', 'Garbage Overflow', 'Drainage Blockage', 'Street Light', 'Water Supply', 'Road Damage', 'Illegal Dumping', 'Noise Pollution', 'Encroachment', 'Other'];

const INITIAL = { title: '', description: '', category: '', address: '', city: '', pincode: '' };

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(INITIAL);
  const [files, setFiles]       = useState([]);
  const [coords, setCoords]     = useState({ lat: null, lng: null });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1); // 1=details, 2=location+photos

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted].slice(0, 5)),
    onDropRejected: () => toast.error('Only images up to 5MB allowed (max 5 files)'),
  });

  const removeFile = (i) => setFiles((f) => f.filter((_, idx) => idx !== i));

  const onMapClick = useCallback((latlng) => {
    setCoords({ lat: latlng.lat, lng: latlng.lng });
    toast.success('📍 Location pinned on map!');
  }, []);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)       e.title       = 'Title must be at least 5 characters';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.category)                                      e.category    = 'Please select a category';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.address.trim()) e.address = 'Address is required';
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (coords.lat) formData.append('lat', coords.lat);
      if (coords.lng) formData.append('lng', coords.lng);
      files.forEach((f) => formData.append('images', f));

      const { data } = await submitComplaint(formData);
      toast.success(data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div className="sc-wrapper fade-in">
          <div className="page-header">
            <h2>Report a Civic Issue</h2>
            <p>Help your city improve by reporting issues in your area</p>
          </div>

          {/* Progress indicator */}
          <div className="sc-steps">
            {['Issue Details', 'Location & Photos'].map((s, i) => (
              <div key={s} className={`sc-step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                <div className="sc-step-num">{step > i + 1 ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="sc-card card">
            {/* Step 1: Issue Details */}
            {step === 1 && (
              <div className="sc-step-content fade-in">
                <div className="form-group">
                  <label className="form-label">Complaint Title <span className="required">*</span></label>
                  <input name="title" className={`form-input ${errors.title ? 'error' : ''}`} placeholder="e.g. Large pothole near main signal" value={form.title} onChange={onChange} />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Category <span className="required">*</span></label>
                  <select name="category" className={`form-select ${errors.category ? 'error' : ''}`} value={form.category} onChange={onChange}>
                    <option value="">Select a category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Describe the issue in detail — size, impact, when it started…"
                    value={form.description}
                    onChange={onChange}
                    rows={5}
                  />
                  <span className="form-hint">{form.description.length}/1000</span>
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>

                <div className="sc-actions">
                  <button className="btn btn-primary" onClick={handleNext} id="sc-next-btn">
                    Next: Location & Photos →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Photos */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="sc-step-content fade-in">
                <div className="form-group">
                  <label className="form-label">Street Address <span className="required">*</span></label>
                  <input name="address" className={`form-input ${errors.address ? 'error' : ''}`} placeholder="e.g. Near MG Road Signal, Bengaluru" value={form.address} onChange={onChange} />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" placeholder="City name" value={form.city} onChange={onChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input name="pincode" className="form-input" placeholder="6-digit pincode" value={form.pincode} onChange={onChange} />
                  </div>
                </div>

                {/* Map */}
                <div className="form-group">
                  <label className="form-label">
                    📍 Pin on Map <span className="form-hint">(optional — click to place marker)</span>
                  </label>
                  <LocationMap lat={coords.lat} lng={coords.lng} onLocationSelect={onMapClick} interactive height="280px" />
                  {coords.lat && (
                    <span className="form-hint">Pinned: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                  )}
                </div>

                {/* Drag & Drop */}
                <div className="form-group">
                  <label className="form-label">Photos (max 5)</label>
                  <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} id="complaint-images" />
                    <div className="dropzone-content">
                      <span className="dropzone-icon">📸</span>
                      <p>{isDragActive ? 'Drop images here…' : 'Drag & drop images, or click to browse'}</p>
                      <span className="form-hint">PNG, JPG, WEBP up to 5MB each</span>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="file-previews">
                      {files.map((f, i) => (
                        <div key={i} className="file-preview">
                          <img src={URL.createObjectURL(f)} alt={f.name} />
                          <button type="button" className="file-remove" onClick={() => removeFile(i)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sc-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading} id="sc-submit-btn">
                    {loading ? '⏳ Submitting…' : '🚀 Submit Complaint'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
