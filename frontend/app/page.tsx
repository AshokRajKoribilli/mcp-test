'use client';

import { useState, useEffect } from 'react';
import ImageGenerator from '@/components/ImageGenerator';
import ImageGallery from '@/components/ImageGallery';
import { listImages, type ImageInfo } from '@/lib/api';
import './globals.css';

export default function Home() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listImages(true);
      setImages(response.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGenerated = (newImage: ImageInfo) => {
    setImages((prev) => [newImage, ...prev]);
  };

  const handleImageDeleted = (filename: string) => {
    setImages((prev) => prev.filter((img) => img.filename !== filename));
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 className="fade-in">
              Transform Words Into Stunning Visuals
            </h1>
            <p className="text-lg text-light fade-in" style={{ animationDelay: '0.1s', maxWidth: '700px', margin: '0 auto var(--spacing-xl)' }}>
              Harness the power of AI to create breathtaking images from simple text descriptions. 
              Professional quality, instant results.
            </p>
            <a 
              href="#generator" 
              className="btn btn-primary fade-in" 
              style={{ 
                animationDelay: '0.2s',
                fontSize: '1.1rem',
                padding: '1.25rem 2.5rem'
              }}
            >
              Start Creating
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Why Choose Flux?</h2>
            <p className="text-lg text-light" style={{ maxWidth: '600px', margin: '0 auto' }}>
              State-of-the-art AI technology for professional image generation
            </p>
          </div>
          
          <div className="grid grid-cols-3">
            <div className="text-center fade-in" style={{ animationDelay: '0s' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚡</div>
              <h3>Lightning Fast</h3>
              <p className="text-light">
                Generate high-quality images in seconds with our optimized Flux model
              </p>
            </div>
            
            <div className="text-center fade-in" style={{ animationDelay: '0.1s' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🎨</div>
              <h3>Professional Quality</h3>
              <p className="text-light">
                Create stunning, detailed images suitable for any professional project
              </p>
            </div>
            
            <div className="text-center fade-in" style={{ animationDelay: '0.2s' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔧</div>
              <h3>Full Control</h3>
              <p className="text-light">
                Fine-tune dimensions, steps, and seeds for perfect results every time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator" className="section">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <ImageGenerator onImageGenerated={handleImageGenerated} />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>Your Gallery</h2>
              <p className="text-light">
                {images.length} {images.length === 1 ? 'image' : 'images'} created
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={loadImages}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Loading...
                </>
              ) : (
                <>
                  🔄 Refresh
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-lg">
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {isLoading && images.length === 0 ? (
            <div className="grid grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: 0 }}>
                  <div className="skeleton" style={{ paddingBottom: '100%' }} />
                  <div style={{ padding: 'var(--spacing-md)' }}>
                    <div className="skeleton" style={{ height: '20px', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ImageGallery images={images} onImageDeleted={handleImageDeleted} />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="section" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container text-center">
          <p className="text-light">
            Powered by <strong>Flux AI Model</strong>
          </p>
          <p className="text-sm text-light mt-sm">
            Create stunning images with artificial intelligence
          </p>
        </div>
      </footer>
    </main>
  );
}
