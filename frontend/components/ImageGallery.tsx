'use client';

import { useState } from 'react';
import { deleteImage, type ImageInfo } from '@/lib/api';
import ImageModal from './ImageModal';

interface ImageGalleryProps {
  images: ImageInfo[];
  onImageDeleted: (filename: string) => void;
}

export default function ImageGallery({ images, onImageDeleted }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const handleDelete = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeletingImage(filename);
    try {
      await deleteImage(filename);
      onImageDeleted(filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setDeletingImage(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (images.length === 0) {
    return (
      <div 
        className="card text-center fade-in" 
        style={{ 
          minHeight: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--color-off-white)'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)', opacity: 0.3 }}>🖼️</div>
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No images yet</h3>
        <p className="text-light">Generate your first image to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.filename}
            className="image-card fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
            onClick={() => setSelectedImage(image)}
          >
            {/* Image */}
            <div style={{ position: 'relative', paddingBottom: '100%', background: 'var(--color-light-gray)' }}>
              {image.base64 ? (
                <img
                  src={image.base64}
                  alt={image.filename}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div className="skeleton" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              )}
            </div>

            {/* Info Overlay */}
            <div style={{ padding: 'var(--spacing-md)' }}>
              <div className="flex justify-between items-center mb-sm">
                <span className="text-sm text-light">
                  {image.width} × {image.height}
                </span>
                <span className="text-sm text-light">
                  {formatFileSize(image.size_bytes)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-light">
                  {formatDate(image.created_at)}
                </span>
                
                <button
                  className="btn-secondary"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    border: '1px solid var(--color-border)',
                  }}
                  onClick={(e) => handleDelete(image.filename, e)}
                  disabled={deletingImage === image.filename}
                >
                  {deletingImage === image.filename ? (
                    <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  ) : (
                    '🗑️ Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
