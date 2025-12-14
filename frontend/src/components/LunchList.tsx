import React from 'react';
import type { LunchItem } from '../api.ts';
import '../App.css';

interface Props {
    items: LunchItem[];
}

export const LunchList: React.FC<Props> = ({ items }) => {
  const categoryMap = new Map<string, string>();

  items.forEach(item => {
    if (item.category && item.category_label) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, item.category_label);
      }
    }
  });

  const categories = Array.from(categoryMap.entries()).map(([id, label]) => ({
    id,
    label,
  }));

  if (categories.length === 0 && items.length > 0) {
    return (
      <div className="lunch-list">
        <h2>🛒 商品リスト ({items.length} 種類)</h2>
        <ul className="item-list">
          {items.map((item) => <LunchItemRow key={item.id} item={item} />)}
        </ul>
      </div>
    );
  }

  return (
    <div className="lunch-list">
      <h2>🛒 商品リスト ({items.length} 種類)</h2>

      {categories.map((cat) => {
        const categoryItems = items.filter(item => item.category === cat.id);

        if (categoryItems.length === 0) return null;

        return (
          <div key={cat.id} className="category-section">
            <h3 className="category-title">{cat.label}</h3>
            
            <ul className="item-list">
              {categoryItems.map((item) => (
                <LunchItemRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  )

}

const LunchItemRow: React.FC<{ item: LunchItem }> = ({ item }) => {
  return (
    <li className="item-row">
      <span className="item-name">{item.name}</span>
      <span className="item-info">
        <span className="item-price">¥{item.price} / </span>
        <span className="item-details">
          {item.cal}kcal / P:{item.protein} / C:{item.carbs} / S:{item.salt}
        </span>
      </span>
    </li>
  )
}
