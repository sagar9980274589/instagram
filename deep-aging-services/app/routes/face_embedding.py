from fastapi import APIRouter, UploadFile, File
from insightface.app import FaceAnalysis
import os

router = APIRouter()

# Define model path (update this if needed)
custom_model_path = "C:/Users/sagar/OneDrive/Desktop/instagram/deep-aging-services/models"

# Ensure model path exists
if not os.path.exists(custom_model_path):
    os.makedirs(custom_model_path)

try:
    # Load FaceAnalysis with explicit model path
    face_app = FaceAnalysis(name="buffalo_l", root=custom_model_path, providers=['CPUExecutionProvider'])
    face_app.prepare(ctx_id=0)
    print("✅ FaceAnalysis model loaded successfully!")
    print("Available models:", face_app.models.keys())  # Debugging: Check available models
except AssertionError as e:
    print("❌ Model loading failed! Ensure that 'detection' model is available.")
    print(str(e))
    face_app = None

@router.post("/extract-face-embeddings")
async def extract_face_embeddings(file: UploadFile = File(...)):
    if not face_app:
        return {"error": "FaceAnalysis model not loaded. Check logs for details."}
    
    # Read the uploaded image
    image_data = await file.read()
    
    # Process image (implement image loading and embedding extraction)
    return {"message": "Processing image..."}
