from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import csv
import os

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 商品データの定義
def load_items_from_csv():
    items = []
    csv_path = os.path.join(os.path.dirname(__file__), "items.csv")

    print(f"CSVファイルのパスを確認中: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"CSVファイルが見つかりません！")
        return []

    try:
        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    items.append({
                        "id": int(row["id"]),
                        "name": row["name"],
                        "category": row["category"],
                        "category_label": row["category_label"],
                        "price": int(row["price"]),
                        "cal": float(row["cal"]),
                        "protein": float(row["protein"]),
                        "carbs": float(row["carbs"]),
                        "salt": float(row["salt"]),
                    })
                except ValueError as e:
                    print(f"データの変換エラー: {row['name']} ({e})")
        
        print(f"CSVから {len(items)} 個の商品を読み込みました")
        return items

    except Exception as e:
        print(f"CSVファイルの読み込み中にエラーが発生しました: {e}")
        return []

item_list = load_items_from_csv()

# フロントから送られてくるデータの形
class OptimizationRequest(BaseModel):
    budget: int
    target_cal: int
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

    if N == 0:
        print(f"データが0件なので計算できません！")
        return {
            "result": [],
            "total_price": 0,
            "message": "商品データを読み込めませんでした"
        }

    # 変数の定義
    x = Array.create('x', shape=N, vartype='BINARY')

    # 数式の定義
    total_price = sum(item_list[i]['price'] * x[i] for i in range(N))
    total_cal = sum(item_list[i]['cal'] * x[i] for i in range(N))
    total_protein = sum(item_list[i]['protein'] * x[i] for i in range(N))
    total_carbs = sum(item_list[i]['carbs'] * x[i] for i in range(N))
    total_salt = sum(item_list[i]['salt'] * x[i] for i in range(N))

    # 目的関数と制約条件
    H_price = Constraint(
        (total_price - request.budget) ** 2,
        label="budget_constraint"
    )
    H = H_price

    H_cal = (total_cal - request.target_cal) ** 2
    H += 10.0 * H_cal

    H_protein = (total_protein - request.target_protein) ** 2
    H += 10.0 * H_protein

    if request.target_carbs is not None:
        H_carbs = (total_carbs - request.target_carbs) ** 2
        H += 5.0 * H_carbs
    
    if request.target_salt is not None:
        H_salt = (total_salt - request.target_salt) ** 2
        H += 10.0 * H_salt

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
        "total_cal": sum(item['cal'] for item in selected_items),
        "total_protein": sum(item['protein'] for item in selected_items),
        "total_carbs": sum(item['carbs'] for item in selected_items),
        "total_salt": sum(item['salt'] for item in selected_items),
    }


@app.get("/optimize/lunch")
def optimize_lunch():
    return item_list

