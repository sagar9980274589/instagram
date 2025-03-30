from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import numpy as np
from app.services.deep_aging_service import DeepAgingModel

router = APIRouter()
deep_aging_model = DeepAgingModel()

# ✅ Enforce embeddings to be exactly 128 floats
class EmbeddingRequest(BaseModel):
    embeddings: List[float] = Field(..., min_items=128, max_items=128, description="128D facial embedding array")

@router.post("/transform")
def transform_embeddings(data: EmbeddingRequest):
    try:
        print("📩 Received API request for deep aging transformation...")

        # Convert list to numpy array
        original_embeddings = np.array(data.embeddings, dtype=np.float32)
        print(f"🔄 Converted to NumPy array: Shape = {original_embeddings.shape}, dtype = {original_embeddings.dtype}")

        # Validate embedding dimensions
        if original_embeddings.shape[0] != 128:
            raise HTTPException(status_code=400, detail="Embeddings must be a 128D vector.")

        # Process through deep aging model
        transformed_embeddings = deep_aging_model.transform(original_embeddings)
        
        # Check if transformation was successful
        if transformed_embeddings is None:
            raise HTTPException(status_code=500, detail="Deep aging model transformation failed.")

        # Validate output dimensions
        if transformed_embeddings.shape[0] != 512:
            raise HTTPException(status_code=500, detail="Deep aging model output is not 512D.")
        
        print("✅ Successfully transformed embeddings!")
        return {"success": True, "transformed_embeddings": transformed_embeddings.tolist()}

    except HTTPException as http_exc:
        print(f"❌ HTTPException: {http_exc.detail}")
        raise http_exc

    except ValueError as ve:
        print(f"❌ ValueError: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(ve)}")

    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
