import { useState, useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';
import Avatar, { GRADIENTS } from './Avatar';

export default function AvatarPicker({ name = 'User', currentPhoto, currentGradient, onSelectGradient, onSelectPhoto, onRemovePhoto }) {
  const [preview, setPreview] = useState(currentPhoto);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Image must be under 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      onSelectPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4 animate-slide-up stagger-1">
        <Avatar name={name} photo={preview} size={72} />
        <div className="space-y-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:bg-primary-500/5 hover:border-primary-500/30 active:scale-95"
            style={{ borderColor: 'var(--border-solid)' }}
          >
            <Camera size={16} />
            Upload Photo
          </button>
          {preview && (
            <button
              onClick={() => { setPreview(null); onRemovePhoto(); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-500/20 transition-all duration-200 hover:bg-red-500/5 active:scale-95"
            >
              <X size={16} />
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      <div className="animate-slide-up stagger-2">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Or pick a gradient</p>
        <div className="grid grid-cols-6 gap-2">
          {GRADIENTS.map(([c1, c2], i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onSelectGradient(`${c1},${c2}`); setPreview(null); }}
              className="animate-scale-in w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border-2"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                borderColor: currentGradient === `${c1},${c2}` ? 'var(--text)' : 'transparent',
                boxShadow: currentGradient === `${c1},${c2}` ? `0 0 12px ${c1}40` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
