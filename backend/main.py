from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World! This is the Quantum Lunch App!"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id, "q_value": "mock_value"}

