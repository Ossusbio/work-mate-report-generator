import React, { useState, useRef, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import { Camera, Upload, Check, RefreshCw, Image as ImageIcon, Link as LinkIcon, Trash2, Plus } from 'lucide-react';
import { uploadPhoto } from '../services/api';

export default function CameraCapture({ onImageCaptured, currentImage, disabled = false, runId = null }) {
  // Normalize initial currentImage prop to array (up to 3)
  const getInitialImages = () => {
    if (!currentImage) return [];
    if (Array.isArray(currentImage)) return currentImage.slice(0, 3);
    return [currentImage];
  };

  const [images, setImages] = useState(getInitialImages);
  const [streamActive, setStreamActive] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Sync images whenever currentImage prop changes (e.g. when editing draft)
  useEffect(() => {
    const fresh = getInitialImages();
    setImages(fresh);
  }, [currentImage]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Attach stream to video element when DOM element mounts or stream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(err => console.warn('Video play error:', err));
    }
  }, [mediaStream, streamActive]);

  // Notify parent component whenever images list changes
  const updateImagesList = (newList) => {
    setImages(newList);
    onImageCaptured(newList);
  };

  // Start Webcam stream
  const startCamera = async () => {
    if (images.length >= 3) {
      alert('Maximum of 3 reference images allowed.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setMediaStream(stream);
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera environmental constraint failed, trying basic video:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(fallbackStream);
        setStreamActive(true);
      } catch (fallbackErr) {
        alert('Could not access camera: ' + (fallbackErr.message || err.message) + '. Please use File Upload instead.');
      }
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Capture frame from canvas
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      alert('Camera stream is still initializing. Please wait a second and try capturing again.');
      return;
    }

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();

    await handleUpload(base64Image);
  };

  // File Upload fallback
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('Maximum of 3 reference images allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      await handleUpload(formData);
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleUpload = async (payload) => {
    setUploading(true);
    try {
      const res = await uploadPhoto(payload, runId);
      const newImgObj = {
        url: res.imageUrl,
        filename: res.filename,
        description: ''
      };
      const updatedList = [...images, newImgObj].slice(0, 3);
      updateImagesList(updatedList);
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDescriptionChange = (index, val) => {
    const updated = images.map((img, i) => i === index ? { ...img, description: val } : img);
    updateImagesList(updated);
  };

  const handleRemoveImage = (index) => {
    setDeleteIdx(index);
  };

  const confirmRemoveImage = () => {
    if (deleteIdx !== null) {
      const updated = images.filter((_, i) => i !== deleteIdx);
      updateImagesList(updated);
      setDeleteIdx(null);
    }
  };

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} color="#06b6d4" />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Parameter 11: Reference Images & Notes ({images.length}/3)
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {images.map((_, i) => (
            <span key={i} className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <Check size={10} /> Image #{i + 1}
            </span>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Upload Buttons (Visible if less than 3 images attached) */}
      {!streamActive && images.length < 3 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button type="button" onClick={startCamera} className="btn btn-primary" style={{ flex: 1 }}>
            <Camera size={16} />
            <span>Click Real-Time Photo (#{images.length + 1})</span>
          </button>
          
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ flex: 1 }}>
            <Upload size={16} />
            <span>Upload Photo File (#{images.length + 1})</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {uploading && (
        <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
          Uploading to Cloud Storage...
        </div>
      )}

      {/* Live Webcam Stream */}
      {streamActive && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', maxHeight: '300px', borderRadius: '12px', background: '#000' }} 
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
            <button type="button" onClick={capturePhoto} className="btn btn-accent">
              <Camera size={16} />
              <span>Capture Photo #{images.length + 1} Now</span>
            </button>
            <button type="button" onClick={stopCamera} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Attached Images List (Up to 3) */}
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>
                  Image #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  title="Remove Image"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#000', textAlign: 'center', marginBottom: '8px' }}>
                <img src={img.url} alt={`Captured reference ${idx + 1}`} style={{ height: '140px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>

              {img.url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#06b6d4', marginBottom: '8px' }}>
                  <LinkIcon size={12} />
                  <a href={img.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    View Cloud Image #{idx + 1}
                  </a>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  <ImageIcon size={12} />
                  <span>Notes for Image #{idx + 1}</span>
                </label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  placeholder="Notes for this visual..."
                  value={img.description || ''}
                  onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length >= 3 && (
        <div style={{ fontSize: '0.8rem', color: '#10b981', textAlign: 'center', padding: '6px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          ✓ Maximum 3 reference images attached. Delete any image above to add a new one.
        </div>
      )}

      <ConfirmModal
        open={deleteIdx !== null}
        title="Remove Reference Image"
        message={`Are you sure you want to remove Image #${(deleteIdx || 0) + 1}? This action cannot be undone.`}
        confirmLabel="Remove Image"
        danger={true}
        onConfirm={confirmRemoveImage}
        onCancel={() => setDeleteIdx(null)}
      />
    </div>
  );
}
