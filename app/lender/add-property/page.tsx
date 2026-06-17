'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Video, Upload, X, CheckCircle, Home, Building2 } from 'lucide-react';
import { PropertyType } from '@/types';
import { compressVideo } from '@/lib/compressVideo';

export default function AddPropertyPage() {
  const { firebaseUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [form, setForm] = useState({
    title: '', description: '', rent: '', location: '', address: '',
    phone: userProfile?.phone?.replace('+91', '') ?? '',
  });
  const [videoFile, setVideoFile]         = useState<File | null>(null);
  const [videoPreview, setVideoPreview]   = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]         = useState(false);
  const [compressing, setCompressing]     = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const [lat, setLat]                     = useState<number | null>(null);
  const [lng, setLng]                     = useState<number | null>(null);
  const [locLoading, setLocLoading]       = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocLoading(false); },
      () => { setError(t('location_denied')); setLocLoading(false); }
    );
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setError('Video must be under 100 MB'); return; }
    setError('');

    if (file.size > 15 * 1024 * 1024) {
      setCompressing(true);
      try {
        const compressed = await compressVideo(file);
        setVideoFile(compressed);
        setVideoPreview(URL.createObjectURL(compressed));
      } catch {
        // fallback: use original if compression fails
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      } finally {
        setCompressing(false);
      }
    } else {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const clearVideo = () => {
    setVideoFile(null); setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const validate = () => {
    if (!form.title.trim()) return t('property_title');
    if (!form.rent || Number(form.rent) <= 0) return t('monthly_rent');
    if (!form.location.trim()) return t('location_area');
    if (!form.address.trim()) return t('full_address');
    if (!form.phone.trim() || form.phone.length < 10) return t('valid_phone');
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (!firebaseUser || !userProfile) { router.replace('/login'); return; }
    setError(''); setSaving(true);
    let videoUrl = '';
    try {
      if (videoFile) {
        setUploading(true);
        const storageRef = ref(storage, `properties/${firebaseUser.uid}/${Date.now()}_${videoFile.name}`);
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, videoFile);
          task.on('state_changed',
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            async () => { videoUrl = await getDownloadURL(task.snapshot.ref); resolve(); }
          );
        });
        setUploading(false);
      }
      await addDoc(collection(db, 'properties'), {
        userId: firebaseUser.uid, lenderName: userProfile.name, propertyType,
        title: form.title.trim(), description: form.description.trim(),
        rent: Number(form.rent), location: form.location.trim(),
        address: form.address.trim(), phone: form.phone.trim(),
        videoUrl, views: 0, likesCount: 0, savesCount: 0,
        featured: false, available: true, verified: false,
        ...(lat !== null && lng !== null ? { lat, lng } : {}),
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => router.replace('/lender'), 1500);
    } catch (err: any) {
      setError(err.message || t('failed_save'));
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <CheckCircle size={56} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">{t('property_added')}</h2>
        <p className="text-gray-500 mt-2">{t('redirecting')}</p>
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
          <h1 className="text-white font-bold text-lg">{t('add_property_title')}</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">

        {/* Property Type */}
        <div className="card p-4">
          <label className="label mb-3 block">{t('property_purpose')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPropertyType('residential')}
              className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all gap-2 ${propertyType === 'residential' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'}`}>
              <Home size={28} />
              <span className="font-semibold text-sm">{t('residential_label')}</span>
              <span className="text-xs text-gray-400 text-center">{t('residential_desc')}</span>
            </button>
            <button type="button" onClick={() => setPropertyType('commercial')}
              className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all gap-2 ${propertyType === 'commercial' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500'}`}>
              <Building2 size={28} />
              <span className="font-semibold text-sm">{t('commercial_label')}</span>
              <span className="text-xs text-gray-400 text-center">{t('commercial_desc')}</span>
            </button>
          </div>
        </div>

        {/* Video Upload */}
        <div className="card p-4">
          <label className="label">{t('property_video')}</label>
          {compressing ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-orange-700 text-sm font-medium">{t('optimizing_video')}</span>
            </div>
          ) : !videoPreview ? (
            <button onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors">
              <Video size={32} />
              <span className="text-sm font-medium">{t('tap_upload_video')}</span>
              <span className="text-xs">{t('video_size_hint')}</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              <video src={videoPreview} controls className="w-full rounded-xl max-h-48 object-cover" />
              <button onClick={clearVideo} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                <X size={14} />
              </button>
            </div>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
          {uploading && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('uploading')}...</span><span>{uploadProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="card p-4">
          <label className="label mb-2 block">{t('property_location')} <span className="text-gray-400 text-xs font-normal">{t('location_optional')}</span></label>
          {lat && lng ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-green-700 font-semibold text-sm">{t('location_saved')}</p>
                <p className="text-green-600 text-xs">{lat.toFixed(5)}°N, {lng.toFixed(5)}°E</p>
              </div>
              <button onClick={() => { setLat(null); setLng(null); }} className="text-red-400 text-xs">{t('location_remove')}</button>
            </div>
          ) : (
            <button type="button" onClick={captureLocation} disabled={locLoading}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors text-sm font-medium">
              {locLoading ? t('getting_location') : t('use_my_location')}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="label">{t('property_title')}</label>
            <input type="text" placeholder={propertyType === 'residential' ? 'e.g. 2 BHK Near Bus Stand' : 'e.g. Ground Floor Shop, Main Road'}
              value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('description')}</label>
            <textarea placeholder={t('describe_property')} value={form.description}
              onChange={(e) => update('description', e.target.value)} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">{t('monthly_rent')}</label>
            <input type="number" inputMode="numeric" placeholder={t('rent_placeholder')}
              value={form.rent} onChange={(e) => update('rent', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('location_area')}</label>
            <input type="text" placeholder={t('location_placeholder')}
              value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('full_address')} <span className="text-gray-400 text-xs font-normal">{t('full_address_hint')}</span></label>
            <textarea placeholder={t('address_placeholder')} value={form.address}
              onChange={(e) => update('address', e.target.value)} rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">{t('contact_phone')} <span className="text-gray-400 text-xs font-normal">{t('contact_phone_hint')}</span></label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <span className="px-3 py-3 text-gray-500 bg-gray-50 border-r border-gray-200 font-medium text-sm">+91</span>
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
                value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-3 focus:outline-none text-gray-900" />
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}

        <button onClick={handleSubmit} disabled={saving || compressing} className="btn-primary flex items-center justify-center gap-2">
          {saving
            ? <><LoadingSpinner size="sm" /> {uploading ? `${t('uploading')} ${uploadProgress}%...` : t('saving')}</>
            : <><Upload size={16} /> {t('publish_property')}</>
          }
        </button>
        <div className="h-8" />
      </div>
    </div>
  );
}
