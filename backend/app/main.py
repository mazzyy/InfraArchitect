from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.index import router as index_router  # Ensure this is correct now
from app.AI import ai_router  # Import the router from AI.py

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this if necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index_router)
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
