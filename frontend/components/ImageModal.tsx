'use client';

import { useEffect } from 'react';
import { type ImageInfo } from '@/lib/api';

interface ImageModalProps {
  image: ImageInfo;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleDownload = () => {
    if (image.base64) {
      const link = document.createElement('a');
      link.href = image.base64;
      link.download = image.filename;
      link.click();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-lg)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="btn-secondary"
          style={{
            position: 'absolute',
            top: '-60px',
            right: 0,
            padding: '0.75rem 1.5rem',
            fontSize: '1.2rem',
            zIndex: 10,
            background: 'var(--color-white)',
          }}
          onClick={onClose}
        >
          ✕ Close
        </button>

        {/* Download Button */}
        <button
          className="btn-primary"
          style={{
            position: 'absolute',
            top: '-60px',
            right: '120px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            zIndex: 10,
          }}
          onClick={handleDownload}
        >
          ⬇ Download
        </button>

        {/* Image */}
        <div 
          className="card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {image.base64 && (
            <img
              src={image.base64}
              alt={image.filename}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </div>

        {/* Image Info */}
        <div 
          className="card mt-md" 
          style={{ 
            background: 'var(--color-white)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="grid grid-cols-2 gap-md" style={{ fontSize: '0.95rem' }}>
            <div>
              <span className="text-light text-sm">Filename</span>
              <div className="font-medium mt-xs">{image.filename}</div>
            </div>
            <div>
              <span className="text-light text-sm">Dimensions</span>
              <div className="font-medium mt-xs">
                {image.width} × {image.height}
              </div>
            </div>
            <div>
              <span className="text-light text-sm">Format</span>
              <div className="font-medium mt-xs">{image.format}</div>
            </div>
            <div>
              <span className="text-light text-sm">Size</span>
              <div className="font-medium mt-xs">
                {(image.size_bytes / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
