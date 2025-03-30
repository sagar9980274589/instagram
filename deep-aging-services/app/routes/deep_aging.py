from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from app.services.deep_aging_service import DeepAgingModel

router = APIRouter()
deep_aging_model = DeepAgingModel()

class EmbeddingRequest(BaseModel):
    embeddings: list

@router.post("/transform")
def transform_embeddings(data: EmbeddingRequest):
    try:
        original_embeddings = np.array(data.embeddings)
        transformed_embeddings = deep_aging_model.transform(original_embeddings)
        return {"success": True, "transformed_embeddings": transformed_embeddings.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
