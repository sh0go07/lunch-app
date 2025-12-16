import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header.tsx';
import { InputForm } from './components/InputForm.tsx';
import { LunchList } from './components/LunchList.tsx';
import { ResultCard } from './components/ResultCard.tsx';
import type { LunchItem } from './api';
import { calculateLunch, fetchLunchItems } from './api';

function App() {
  const [items, setItems] = useState<LunchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LunchItem[] | null>(null);

  const handleCalculate = async (
    budget: number,
    targetCal: number,
    targetProtein: number,
    targetCarbs: number,
    targetSalt: number,
  ) => {
    setResult(null);
    setError(null);

    try {
      const data = await calculateLunch({
        budget,
        target_cal: targetCal,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_salt: targetSalt,
      });

      console.log("計算結果:", data);
      if (data.message) {
        setError(data.message)
      } else {
        setResult(data.result);
      }
    } catch (err) {
      console.error('最適化エラー:', err);
      setError('最適化の計算に失敗しました');
    }
  }

  useEffect(() => {
    fetchLunchItems()
      .then(data => {
        setItems(data);
        setError(null);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to fetch lunch items');
      })
  }, []);

  return (
    <div className="App">
      <Header />

      <InputForm onCalculate={handleCalculate} />
    
      <hr />
        
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}

      <ResultCard result={result} />

      <LunchList items={items} />
    </div>
  );
}

export default App;
