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
  const [budget, setBudget] = useState<number>(500);
  const [targetProtein, setTargetProtein] = useState(15);
  const [optimizedResult, setOptimizedResult] = useState<LunchItem[] | null>(null);

  const handleOptimizeClick = () => {
    setOptimizedResult(null);
    setError(null);

    fetch('http://127.0.0.1:8000/optimize/lunch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budget: budget,
        target_protein: targetProtein,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("計算結果:", data);

      // バックエンドから返ってきた"result"をセット
      setOptimizedResult(data.result);
    })
    
    .catch(err => {
      console.error('最適化エラー:', err);
      setError('最適化の計算に失敗しました');
    });
  };  

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
      <h1>🍱 コンビニ最適化アプリ (QUBO Hackathon)</h1>
      <hr />

      <div className="control-panel">
        <h2>🔍 最適化の条件</h2>
        
        <div>
          <label>
            💰 予算 (円): 
            <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} min="100" />
          </label>
        </div>
        
        <div>
          <label>
            💪 欲しいタンパク質 (g): 
            <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(Number(e.target.value))} min="0" />
          </label>
        </div>
      </div>

      <button onClick={handleOptimizeClick}>
        最適なお弁当を計算！
      </button>
    
      <hr />
        
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}

      {optimizedResult && (
        <div className="result-panel">
          <h2>🎉 最適化結果</h2>
          <ul>
            {optimizedResult.map(item => (
              <li key={item.id}>
                {item.name} (¥{item.price}, P:{item.protein}g)
              </li>
            ))}
          </ul>
        </div>
      )}
        
      <h2>🛒 商品リスト ({items.length} 種類)</h2>
        
      <ul className="item-list">
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> 
            (¥{item.price}, {item.cal}kcal, P:{item.protein}g)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
