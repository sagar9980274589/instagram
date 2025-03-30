from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import cv2
import insightface
from insightface.app import FaceAnalysis
import tempfile

# Initialize FaceAnalysis for ArcFace
face_app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0, det_size=(640, 640))

router = APIRouter()

@router.post("/extract")
async def extract_embeddings(image: UploadFile = File(...)):
    try:
        # Save the uploaded image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(await image.read())
            temp_file_path = temp_file.name

        # Read image using OpenCV
        img = cv2.imread(temp_file_path)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")

        # Convert to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect face and extract embeddings
        faces = face_app.get(img)

        if len(faces) == 0:
            raise HTTPException(status_code=404, detail="No face detected in the image.")

        # Get the embeddings of the first detected face
        embeddings = faces[0].normed_embedding

        return {"success": True, "embeddings": embeddings.tolist()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
