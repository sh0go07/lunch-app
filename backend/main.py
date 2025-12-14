from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np

# QUBO用のライブラリ
from pyqubo import Array, Constraint, Placeholder
import openjij as oj

app = FastAPI()

# CORS設定
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

# 商品データの定義
item_list: List[Dict[str, Any]] = [
    {"id": 1, "name": "鮭おにぎり", "price": 150, "cal": 180, "protein": 4.5, "carbs": 35.0, "salt": 0.9},
    {"id": 2, "name": "サラダチキン", "price": 240, "cal": 120, "protein": 25.0, "carbs": 1.0, "salt":1.5},
    {"id": 3, "name": "野菜ジュース", "price": 110, "cal": 70, "protein": 0.8, "carbs": 15.0, "salt": 0.2},
    {"id": 4, "name": "プリン", "price": 120, "cal": 150, "protein": 3.0, "carbs": 20.0, "salt": 0.1},
    {"id": 5, "name": "からあげ棒", "price": 160, "cal": 220, "protein": 7.0, "carbs": 10.0, "salt": 1.0},
]

# フロントから送られてくるデータの形
class OptimizationRequest(BaseModel):
    budget: int
    target_protein: float
    target_carbs: Optional[float]
    target_salt: Optional[float]

@app.get("/")
def read_root():
    return {"message": "Hello World! This is the Quantum Lunch App!"}

# QUBOで計算するAPI
@app.post("/optimize/lunch")
def optimize_lunch(request: OptimizationRequest):
    N = len(item_list)

    # 変数の定義
    x = Array.create('x', shape=N, vartype='BINARY')

    # 数式の定義
    total_protein = sum(item_list[i]['protein'] * x[i] for i in range(N))
    total_carbs = sum(item_list[i]['carbs'] * x[i] for i in range(N))
    total_salt = sum(item_list[i]['salt'] * x[i] for i in range(N))
    total_price = sum(item_list[i]['price'] * x[i] for i in range(N))

    # 目的関数と制約条件
    H_protein = (total_protein - request.target_protein) ** 2
    H = H_protein

    H_price = Constraint(
        (total_price - request.budget) ** 2,
        label="budget_constraint"
    )
    H += 10.0 * H_price

    if request.target_carbs is not None:
        H_carbs = (total_carbs - request.target_carbs) ** 2
        H += H_carbs
    
    if request.target_salt is not None:
        H_salt = (total_salt - request.target_salt) ** 2
        H += H_salt

    # QUBOモデルのコンパイル
    model = H.compile()

    # ソルバで計算
    qubo, offset = model.to_qubo()

    sampler = oj.SASampler()
    response = sampler.sample_qubo(qubo, num_reads=10)

    # 最良解の取得
    best_sample = response.first.sample

    selected_items = []
    for i in range(N):
        if best_sample[f'x[{i}]'] == 1:
            selected_items.append(item_list[i])
    
    total_p = sum(item['price'] for item in selected_items)

    return {
        "result": selected_items,
        "total_price": total_p,
        "total_protein": sum(item['protein'] for item in selected_items),
        "total_carbs": sum(item['carbs'] for item in selected_items),
        "total_salt": sum(item['salt'] for item in selected_items),
    }


@app.get("/optimize/lunch")
def optimize_lunch():
    return item_list

