from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.deep_aging import router as deep_aging_router
# from app.routes.face_embedding import router as face_embedding_router  # Import face embedding route

app = FastAPI(title="Deep Aging & Face Embedding API")

# Enable CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include Routes
app.include_router(deep_aging_router, prefix="/api/deep-aging", tags=["Deep Aging"])
# app.include_router(face_embedding_router, prefix="/api/face-embedding", tags=["Face Embedding"])  # New Route

@app.get("/")
def root():
    return {"message": "Deep Aging & Face Embedding API is running!"}
