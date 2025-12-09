import React, { useState, useEffect } from 'react';
import './App.css';

interface LunchItem {
  id: number;
  name: string;
  price: number;
  cal: number;
  protein: number;
}

function App() {
  const [items, setItems] = useState<LunchItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/optimize/lunch')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: LunchItem[]) => {
        setItems(data);
        setError(null);
      })
      .catch((err: Error) => {
        console.error('Fetch error:', err);
        setError('Failed to fetch lunch items');
      });
  }, []);

  return (
    <div className="App">
      <h1>🍱 天才少女のコンビニ最適化アプリ (QUBO Hackathon)</h1>
      <hr />
      
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
      
      <h2>🛒 商品リスト ({items.length} 種類)</h2>
      
      <ul className="item-list">
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> 
            (¥{item.price}, {item.cal}kcal, P:{item.protein}g)
          </li>
        ))}
      </ul>
      
      {/* 今後、ここに予算設定や最適化ボタンが来るよ！ */}
      <hr />
      <p>...次は、ここに予算の入力欄を作るよ！</p>
    </div>
  );
}

export default App
