import React, { useState, useEffect } from 'react';
import './App.css';
import { InputForm } from './components/InputForm.tsx';
import { LunchList } from './components/LunchList.tsx';
import { ResultCard } from './components/ResultCard.tsx';

interface LunchItem {
  id: number;
  name: string;
  price: number;
  cal: number;
  protein: number;
  carbs: number;
  salt: number;
}

function App() {
  const [items, setItems] = useState<LunchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(500);
  const [targetProtein, setTargetProtein] = useState(15);
  const [targetCarbs, setTargetCarbs] = useState(50);
  const [targetSalt, setTargetSalt] = useState(2.0);
  const [result, setResult] = useState<LunchItem[] | null>(null);

  const handleOptimizeClick = () => {
    setResult(null);
    setError(null);

    fetch('http://127.0.0.1:8000/optimize/lunch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budget: budget,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_salt: targetSalt,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("計算結果:", data);

      // バックエンドから返ってきた"result"をセット
      setResult(data.result);
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

      <InputForm
        budget={budget}
        setBudget={setBudget}
        targetProtein={targetProtein}
        setTargetProtein={setTargetProtein}
        targetCarbs={targetCarbs}
        setTargetCarbs={setTargetCarbs}
        targetSalt={targetSalt}
        setTargetSalt={setTargetSalt}
        onOptimize={handleOptimizeClick}
      />
    
      <hr />
        
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}

      <ResultCard result={result} />

      <LunchList items={items} />
    </div>
  );
}

export default App;
