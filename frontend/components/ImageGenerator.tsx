'use client';

import { useState } from 'react';
import { generateImage, type ImageGenerateRequest, type ImageInfo } from '@/lib/api';

interface ImageGeneratorProps {
  onImageGenerated: (image: ImageInfo) => void;
}

export default function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(4);
  const [seed, setSeed] = useState(0);
  const [randomizeSeed, setRandomizeSeed] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: ImageGenerateRequest = {
        prompt: prompt.trim(),
        width,
        height,
        num_inference_steps: steps,
        seed,
        randomize_seed: randomizeSeed,
      };

      const response = await generateImage(request);
      onImageGenerated(response.image_info);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card fade-in">
      <h2>Create Your Image</h2>
      <p className="text-light mb-lg">
        Describe what you want to see and let AI bring it to life
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
        <div>
          <label htmlFor="prompt" className="block mb-sm font-medium">
            Image Description
          </label>
          <textarea
            id="prompt"
            className="textarea"
            placeholder="A serene mountain landscape at sunset, with vibrant orange and purple skies..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={4}
          />
          <div className="mt-sm text-sm text-light" style={{ textAlign: 'right' }}>
            {prompt.length} characters
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ alignSelf: 'flex-start' }}
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div 
            className="card" 
            style={{ 
              background: 'var(--color-off-white)', 
              padding: 'var(--spacing-lg)',
              boxShadow: 'none'
            }}
          >
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="width" className="block mb-sm font-medium text-sm">
                  Width: {width}px
                </label>
                <input
                  type="range"
                  id="width"
                  min="256"
                  max="1024"
                  step="64"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  disabled={isGenerating}
                  className="input"
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div>
                <label htmlFor="height" className="block mb-sm font-medium text-sm">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  id="height"
                  min="256"
                  max="1024"
                  step="64"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  disabled={isGenerating}
                  className="input"
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div>
                <label htmlFor="steps" className="block mb-sm font-medium text-sm">
                  Inference Steps: {steps}
                </label>
                <input
                  type="range"
                  id="steps"
                  min="1"
                  max="20"
                  step="1"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  disabled={isGenerating}
                  className="input"
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div>
                <label htmlFor="seed" className="block mb-sm font-medium text-sm">
                  Seed
                </label>
                <input
                  type="number"
                  id="seed"
                  className="input"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  disabled={isGenerating || randomizeSeed}
                />
              </div>
            </div>

            <div className="mt-md flex items-center gap-sm">
              <input
                type="checkbox"
                id="randomize"
                checked={randomizeSeed}
                onChange={(e) => setRandomizeSeed(e.target.checked)}
                disabled={isGenerating}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="randomize" className="font-medium text-sm" style={{ cursor: 'pointer' }}>
                Randomize seed for each generation
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isGenerating || !prompt.trim()}
          style={{
            padding: '1.25rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
          }}
        >
          {isGenerating ? (
            <>
              <div className="spinner" style={{ borderTopColor: 'var(--color-white)' }} />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </button>
      </form>
    </div>
  );
}
