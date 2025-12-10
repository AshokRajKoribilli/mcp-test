"""
FastAPI REST API server for Flux image generation.
Provides HTTP endpoints to generate, list, serve, and manage images.
"""
import os
import base64
from datetime import datetime
from typing import Optional, List
from io import BytesIO

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from PIL import Image
from gradio_client import Client

# Initialize FastAPI app
app = FastAPI(
    title="Flux Image Generator API",
    description="REST API for generating images using Flux model",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure images folder exists
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Initialize Flux client
flux_client = Client("evalstate/flux1_schnell")


# Pydantic models for request/response validation
class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt for image generation")
    width: int = Field(512, ge=256, le=1024, description="Image width")
    height: int = Field(512, ge=256, le=1024, description="Image height")
    seed: int = Field(0, description="Random seed for reproducibility")
    randomize_seed: bool = Field(True, description="Randomize seed for each generation")
    num_inference_steps: int = Field(4, ge=1, le=50, description="Number of inference steps")


class ImageInfo(BaseModel):
    filename: str
    width: int
    height: int
    format: str
    size_bytes: int
    created_at: str
    base64: Optional[str] = None


class ImageGenerateResponse(BaseModel):
    success: bool
    filename: str
    filepath: str
    message: str
    image_info: ImageInfo


class ImageListResponse(BaseModel):
    success: bool
    count: int
    images: List[ImageInfo]


class DeleteResponse(BaseModel):
    success: bool
    message: str


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Flux Image Generator API",
        "version": "1.0.0",
        "endpoints": {
            "generate": "POST /api/generate",
            "list": "GET /api/images",
            "get_image": "GET /api/images/{filename}",
            "delete": "DELETE /api/images/{filename}",
            "info": "GET /api/images/{filename}/info"
        }
    }


@app.post("/api/generate", response_model=ImageGenerateResponse)
async def generate_image(request: ImageGenerateRequest):
    """
    Generate an image using the Flux model.
    Returns the generated image information with base64 encoded data.
    """
    try:
        # Generate image using Flux
        result = flux_client.predict(
            prompt=request.prompt,
            seed=request.seed,
            randomize_seed=request.randomize_seed,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            api_name="/infer",
        )

        # Open the generated image
        img = Image.open(result[0])

        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"flux_{timestamp}.png"
        filepath = os.path.join(IMAGES_DIR, filename)

        # Save image
        img.save(filepath, format="PNG")

        # Convert to base64 for frontend display
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        # Get file stats
        file_stats = os.stat(filepath)

        image_info = ImageInfo(
            filename=filename,
            width=img.width,
            height=img.height,
            format=img.format,
            size_bytes=file_stats.st_size,
            created_at=datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            base64=f"data:image/png;base64,{img_base64}"
        )

        return ImageGenerateResponse(
            success=True,
            filename=filename,
            filepath=filepath,
            message="Image generated successfully",
            image_info=image_info
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@app.get("/api/images", response_model=ImageListResponse)
async def list_images(include_base64: bool = False):
    """
    List all generated images.
    Set include_base64=true to include base64 encoded image data (slower).
    """
    try:
        images = []
        for filename in sorted(os.listdir(IMAGES_DIR), reverse=True):
            if filename.endswith('.png'):
                filepath = os.path.join(IMAGES_DIR, filename)
                file_stats = os.stat(filepath)
                
                img = Image.open(filepath)
                
                base64_data = None
                if include_base64:
                    buffered = BytesIO()
                    img.save(buffered, format="PNG")
                    img_base64 = base64.b64encode(buffered.getvalue()).decode()
                    base64_data = f"data:image/png;base64,{img_base64}"

                image_info = ImageInfo(
                    filename=filename,
                    width=img.width,
                    height=img.height,
                    format=img.format,
                    size_bytes=file_stats.st_size,
                    created_at=datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                    base64=base64_data
                )
                images.append(image_info)

        return ImageListResponse(
            success=True,
            count=len(images),
            images=images
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """
    Serve a specific image file.
    Returns the image file directly.
    """
    filepath = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
    
    if not filename.endswith('.png'):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    return FileResponse(filepath, media_type="image/png")


@app.delete("/api/images/{filename}", response_model=DeleteResponse)
async def delete_image(filename: str):
    """
    Delete a specific image.
    Returns confirmation message.
    """
    filepath = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
    
    try:
        os.remove(filepath)
        return DeleteResponse(
            success=True,
            message=f"Successfully deleted: {filename}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")


@app.get("/api/images/{filename}/info", response_model=ImageInfo)
async def get_image_info(filename: str, include_base64: bool = False):
    """
    Get metadata for a specific image.
    Set include_base64=true to include base64 encoded image data.
    """
    filepath = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
    
    try:
        img = Image.open(filepath)
        file_stats = os.stat(filepath)
        
        base64_data = None
        if include_base64:
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            base64_data = f"data:image/png;base64,{img_base64}"

        return ImageInfo(
            filename=filename,
            width=img.width,
            height=img.height,
            format=img.format,
            size_bytes=file_stats.st_size,
            created_at=datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            base64=base64_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get image info: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
