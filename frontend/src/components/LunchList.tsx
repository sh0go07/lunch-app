import React from 'react';
import type { LunchItem } from '../api.ts';

interface Props {
    items: LunchItem[];
}

export const LunchList: React.FC<Props> = ({ items}) => {
    return (
        <div className="lunch-list">
            <h2>🛒 商品リスト ({items.length} 種類)</h2>
            <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item-row">
            <span>{item.name}</span>
            <span>¥{item.price} / {item.cal}kcal</span>
          </li>
        ))}
      </ul>
    </div>
    )
}
