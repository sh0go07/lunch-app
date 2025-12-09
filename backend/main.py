from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

app = FastAPI()

origin = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

item_list: List[Dict[str, Any]] = [
    {"id": 1, "name": "鮭おにぎり", "price": 150, "cal": 180, "protein": 4.5},
    {"id": 2, "name": "サラダチキン", "price": 240, "cal": 120, "protein": 25.0},
    {"id": 3, "name": "野菜ジュース", "price": 110, "cal": 70, "protein": 0.8},
    {"id": 4, "name": "プリン", "price": 120, "cal": 150, "protein": 3.0},
    {"id": 5, "name": "からあげ棒", "price": 160, "cal": 220, "protein": 7.0},
]

@app.get("/")
def read_root():
    return {"message": "Hello World! This is the Quantum Lunch App!"}

@app.get("/optimize/lunch")
def optimize_lunch():
    return item_list

