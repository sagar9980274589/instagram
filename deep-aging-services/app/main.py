from fastapi import FastAPI
from app.routes.deep_aging import router as deep_aging_router

app = FastAPI(title="Deep Aging Microservice")

# Include Deep Aging Route
app.include_router(deep_aging_router, prefix="/api/deep-aging", tags=["Deep Aging"])

@app.get("/")
def root():
    return {"message": "Deep Aging API is running!"}
