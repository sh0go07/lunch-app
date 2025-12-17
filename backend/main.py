from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import csv
import os
import random

# QUBO用のライブラリ
from pyqubo import Array, Constraint, LogEncInteger
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
    csv_path = os.path.join(os.path.dirname(__file__), "Items.csv")

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

@app.get("/items")
def get_items():
    return item_list

# QUBOで計算するAPI
@app.post("/optimize/lunch")

def fallback_selection(request: OptimizationRequest, plan: List[str]):
    print(f"🔄 セーフティネット発動！プラン: {plan}")
    
    cat_items = {cat: [] for cat in plan}
    for item in item_list:
        if item['category'] in cat_items:
            cat_items[item['category']].append(item)

    best_candidate = None
    best_price = -1

    for _ in range(500):
        selected = []
        current_price = 0
        possible = True
        
        for cat in plan:
            if not cat_items[cat]:
                possible = False
                break

            item = random.choice(cat_items[cat])
            selected.append(item)
            current_price += item['price']
        
        if possible and current_price <= request.budget:
            if current_price > best_price:
                best_price = current_price
                best_candidate = {
                    "result": selected,
                    "total_price": current_price,
                    "total_cal": sum(i['cal'] for i in selected),
                    "total_protein": sum(i['protein'] for i in selected),
                    "total_carbs": sum(i['carbs'] for i in selected),
                    "total_salt": sum(i['salt'] for i in selected),
                    "message": f"プラン適用(Fallback): {', '.join(plan)}"
                }
    
    return best_candidate

def optimize_lunch(request: OptimizationRequest):
    N = len(item_list)

    if N == 0:
        print(f"データが0件なので計算できません！")
        return {
            "result": [],
            "total_price": 0,
            "message": "商品データを読み込めませんでした"
        }

    all_categories = ['main', 'side', 'drink', 'dessert']
    cat_indices = {cat: [] for cat in all_categories}
    for i, item in enumerate(item_list):
        if item['category'] in cat_indices:
            cat_indices[item['category']].append(i)

    priority_plans = [
        ['main', 'side', 'drink', 'dessert'],
        ['main', 'side', 'drink'],
        ['main', 'side'],
        ['main']
    ]

    for plan in priority_plans:
        active_categories = plan

        x = Array.create('x', shape=N, vartype='BINARY')

        # 数式の定義
        total_price = sum(item_list[i]['price'] * x[i] for i in range(N))
        total_cal = sum(item_list[i]['cal'] * x[i] for i in range(N))
        total_protein = sum(item_list[i]['protein'] * x[i] for i in range(N))
        total_carbs = sum(item_list[i]['carbs'] * x[i] for i in range(N))
        total_salt = sum(item_list[i]['salt'] * x[i] for i in range(N))

        H = 0

        for cat in all_categories:
            indices = cat_indices[cat]
            if not indices: continue

            if cat in active_categories:
                H += 1000.0 * (sum(x[i] for i in indices) - 1) ** 2
            else:
                H += 1000.0 * (sum(x[i] for i in indices)) ** 2

        H += 10.0 * (total_price - request.budget * 0.9) ** 2

        rand = random.uniform(0.8, 1.2)
        H += 1.0 * rand * (total_cal - request.target_cal) ** 2
        H += 10.0 * rand * (total_protein - request.target_protein) ** 2
        
        if request.target_salt is not None:
             H += 10.0 * (total_salt - request.target_salt) ** 2

        model = H.compile()
        qubo, offset = model.to_qubo()
        sampler = oj.SASampler()
        response = sampler.sample_qubo(qubo, num_reads=10)

        best_sample = response.first.sample
        selected_items = [item_list[i] for i in range(N) if best_sample[f'x[{i}]'] == 1]
        
        current_price = sum(item['price'] for item in selected_items)

        is_plan_fulfilled = len(selected_items) == len(active_categories)

        if current_price <= request.budget and is_plan_fulfilled:
            return {
                "result": selected_items,
                "total_price": current_price,
                "total_cal": sum(item['cal'] for item in selected_items),
                "total_protein": sum(item['protein'] for item in selected_items),
                "total_carbs": sum(item['carbs'] for item in selected_items),
                "total_salt": sum(item['salt'] for item in selected_items),
                "message": f"プラン適用: {', '.join(active_categories)}"
            }
        
    return {
        "result": [],
        "total_price": 0,
        "message": "予算が少なすぎて、主食も買えませんでした..."
    }

@app.get("/optimize/lunch")
def optimize_lunch():
    return item_list

