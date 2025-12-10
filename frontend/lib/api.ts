const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ImageGenerateRequest {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  randomize_seed?: boolean;
  num_inference_steps?: number;
}

export interface ImageInfo {
  filename: string;
  width: number;
  height: number;
  format: string;
  size_bytes: number;
  created_at: string;
  base64?: string;
}

export interface ImageGenerateResponse {
  success: boolean;
  filename: string;
  filepath: string;
  message: string;
  image_info: ImageInfo;
}

export interface ImageListResponse {
  success: boolean;
  count: number;
  images: ImageInfo[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Generate a new image using the Flux model
 */
export async function generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate image');
  }

  return response.json();
}

/**
 * List all generated images
 */
export async function listImages(includeBase64: boolean = true): Promise<ImageListResponse> {
  const url = new URL(`${API_BASE_URL}/api/images`);
  url.searchParams.set('include_base64', includeBase64.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to list images');
  }

  return response.json();
}

/**
 * Get image URL for display
 */
export function getImageUrl(filename: string): string {
  return `${API_BASE_URL}/api/images/${filename}`;
}

/**
 * Delete an image
 */
export async function deleteImage(filename: string): Promise<DeleteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/images/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete image');
  }

  return response.json();
}

/**
 * Get image metadata
 */
export async function getImageInfo(filename: string, includeBase64: boolean = false): Promise<ImageInfo> {
  const url = new URL(`${API_BASE_URL}/api/images/${filename}/info`);
  url.searchParams.set('include_base64', includeBase64.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get image info');
  }

  return response.json();
}
