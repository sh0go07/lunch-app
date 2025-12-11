import React from 'react';
import type { LunchItem } from '../api.ts';

interface Props {
    result: LunchItem[] | null;
}

export const ResultCard: React.FC<Props> = ({ result }) => {
    if (!result) return null;

    const totalCost = result.reduce((sum, item) => sum + item.price, 0);
    const totalProtein = result.reduce((sum, item) => sum + item.protein, 0);

    return (
    <div className="result-card">
      <h2>🎉 おすすめの最強ランチ！</h2>
      
      <div className="result-summary">
        <span>💰 合計: ¥{totalCost}</span>
        <span>💪 P: {totalProtein.toFixed(1)}g</span>
      </div>

      <ul className="result-list">
        {result.map(item => (
          <li key={item.id} className="result-item">
            <span>{item.name}</span>
            <span style={{ color: '#666' }}>¥{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
