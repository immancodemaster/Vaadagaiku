'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Video, X, CheckCircle, Save, Home, Building2 } from 'lucide-react';
import { Property, PropertyType } from '@/types';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [form, setForm] = useState({
    title: '',
    description: '',
    rent: '',
    location: '',
    address: '',
    phone: '',
  });
  const [existingVideoUrl, setExistingVideoUrl] = useState('');
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreview, setNewVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocLoading(false); },
      () => { setError('Location access denied.'); setLocLoading(false); }
    );
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!id || !firebaseUser) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'properties', id));
      if (!snap.exists() || snap.data().userId !== firebaseUser.uid) {
        router.replace('/lender');
        return;
      }
      const data = snap.data() as Property;
      setPropertyType(data.propertyType ?? 'residential');
      setForm({
        title: data.title,
        description: data.description ?? '',
        rent: String(data.rent),
        location: data.location,
        address: data.address,
        phone: data.phone,
      });
      setExistingVideoUrl(data.videoUrl ?? '');
      if (data.lat) setLat(data.lat);
      if (data.lng) setLng(data.lng);
      setLoading(false);
    };
    load();
  }, [id, firebaseUser, router]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setError('Video must be under 100 MB'); return; }
    setNewVideoFile(file);
    setNewVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const clearNewVideo = () => {
    setNewVideoFile(null);
    setNewVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const validate = () => {
    if (!form.title.trim()) return 'Property title is required';
    if (!form.rent || Number(form.rent) <= 0) return 'Enter a valid rent amount';
    if (!form.location.trim()) return 'Location is required';
    if (!form.address.trim()) return 'Full address is required';
    if (!form.phone.trim() || form.phone.length < 10) return 'Enter a valid phone number';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (!firebaseUser) { router.replace('/login'); return; }

    setError('');
    setSaving(true);
    let videoUrl = existingVideoUrl;

    try {
      if (newVideoFile) {
        setUploading(true);
        const storageRef = ref(storage, `properties/${firebaseUser.uid}/${Date.now()}_${newVideoFile.name}`);
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, newVideoFile);
          task.on(
            'state_changed',
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            async () => { videoUrl = await getDownloadURL(task.snapshot.ref); resolve(); }
          );
        });
        setUploading(false);
      }

      await updateDoc(doc(db, 'properties', id), {
        propertyType,
        title: form.title.trim(),
        description: form.description.trim(),
        rent: Number(form.rent),
        location: form.location.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        videoUrl,
        ...(lat !== null && lng !== null ? { lat, lng } : {}),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => router.replace('/lender'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save. Try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <CheckCircle size={56} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Changes Saved!</h2>
        <p className="text-gray-500 mt-2">Redirecting to your listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 px-4 pt-12 pb-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-orange-400 hover:bg-orange-300 text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-bold text-lg">Edit Property</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">

        {/* Property Type */}
        <div className="card p-4">
          <label className="label mb-3 block">Property Purpose *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPropertyType('residential')}
              className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                propertyType === 'residential'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Home size={28} />
              <span className="font-semibold text-sm">Residential</span>
              <span className="text-xs text-gray-400 text-center">Home / Flat / PG</span>
            </button>

            <button
              type="button"
              onClick={() => setPropertyType('commercial')}
              className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                propertyType === 'commercial'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Building2 size={28} />
              <span className="font-semibold text-sm">Commercial</span>
              <span className="text-xs text-gray-400 text-center">Shop / Office / Godown</span>
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="card p-4">
          <label className="label">Property Video</label>
          {!newVideoPreview && existingVideoUrl && (
            <div className="mb-3">
              <video src={existingVideoUrl} controls className="w-full rounded-xl max-h-48 object-cover" />
              <p className="text-xs text-gray-400 mt-1 text-center">Current video</p>
            </div>
          )}
          {newVideoPreview ? (
            <div className="relative rounded-xl overflow-hidden mb-2">
              <video src={newVideoPreview} controls className="w-full rounded-xl max-h-48 object-cover" />
              <button onClick={clearNewVideo} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">New video</div>
            </div>
          ) : (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors text-sm"
            >
              <Video size={18} />
              {existingVideoUrl ? 'Replace video' : 'Upload video'}
            </button>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
          {uploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span><span>{uploadProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="card p-4">
          <label className="label mb-2 block">📍 Property Location <span className="text-gray-400 text-xs font-normal">(optional — for directions)</span></label>
          {lat && lng ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-green-700 font-semibold text-sm">✅ Location saved</p>
                <p className="text-green-600 text-xs">{lat.toFixed(5)}°N, {lng.toFixed(5)}°E</p>
              </div>
              <button onClick={() => { setLat(null); setLng(null); }} className="text-red-400 text-xs">Remove</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={captureLocation}
              disabled={locLoading}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors text-sm font-medium"
            >
              {locLoading ? '⏳ Getting location...' : '📍 Use My Current Location'}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="label">Property Title *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Monthly Rent (₹) *</label>
            <input type="number" inputMode="numeric" value={form.rent} onChange={(e) => update('rent', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Location / Area *</label>
            <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Full Address * <span className="text-gray-400 text-xs font-normal">(shown after unlock)</span></label>
            <textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Contact Phone * <span className="text-gray-400 text-xs font-normal">(shown after unlock)</span></label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <span className="px-3 py-3 text-gray-500 bg-gray-50 border-r border-gray-200 font-medium text-sm">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-3 focus:outline-none text-gray-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
        )}

        <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center justify-center gap-2">
          {saving
            ? <><LoadingSpinner size="sm" /> {uploading ? `Uploading ${uploadProgress}%...` : 'Saving...'}</>
            : <><Save size={16} /> Save Changes</>
          }
        </button>

        <div className="h-8" />
      </div>
    </div>
  );
}
