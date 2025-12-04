# flux_server.py
import os
import base64
from datetime import datetime
from io import BytesIO

from gradio_client import Client
from PIL import Image
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("flux-image-server")

# Ensure images folder exists
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

class FluxMCPTool:
    def __init__(self):
        self.client = Client("evalstate/flux1_schnell")

    def generate_image(
        self,
        prompt: str,
        width: int = 512,
        height: int = 512,
        seed: int = 0,
        randomize_seed: bool = True,
        num_inference_steps: int = 4,
    ) -> Image.Image:
        result = self.client.predict(
            prompt=prompt,
            seed=seed,
            randomize_seed=randomize_seed,
            width=width,
            height=height,
            num_inference_steps=num_inference_steps,
            api_name="/infer",
        )

        img = Image.open(result[0])
        return img


flux_tool = FluxMCPTool()


@mcp.tool()
def generate_flux_image(
    prompt: str,
    width: int = 512,
    height: int = 512,
    seed: int = 0,
    randomize_seed: bool = True,
    num_inference_steps: int = 4,
) -> str:
    """
    Generate an image using the Flux model and save it to ./images folder.
    Returns the saved file path.
    """
    img = flux_tool.generate_image(
        prompt=prompt,
        width=width,
        height=height,
        seed=seed,
        randomize_seed=randomize_seed,
        num_inference_steps=num_inference_steps,
    )

    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"flux_{timestamp}.png"
    filepath = os.path.join(IMAGES_DIR, filename)

    # Save PNG
    img.save(filepath, format="PNG")

    # Return file path (agent can respond to user)
    return f"Image saved to: {filepath}"

@mcp.tool()
def list_generated_images() -> list[str]:
    """
    List all images that have been generated and saved in the images folder.
    Returns a list of image file paths.
    """
    images = []
    for filename in os.listdir(IMAGES_DIR):
        if filename.endswith('.png'):
            filepath = os.path.join(IMAGES_DIR, filename)
            images.append(filepath)
    return images


@mcp.tool()
def delete_image(filename: str) -> str:
    """
    Delete a specific image from the images folder.
    Returns a confirmation message.
    """
    filepath = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return f"Deleted: {filename}"
    else:
        return f"File not found: {filename}"


@mcp.tool()
def get_image_info(filename: str) -> dict:
    """
    Get information about a specific image (size, dimensions, etc.).
    Returns a dictionary with image metadata.
    """
    filepath = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(filepath):
        img = Image.open(filepath)
        return {
            "filename": filename,
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "mode": img.mode,
            "size_bytes": os.path.getsize(filepath)
        }
    else:
        return {"error": f"File not found: {filename}"}


if __name__ == "__main__":
    mcp.run(transport="stdio")
