const BASE_URL = import.meta.env.BASE_URL;

export interface LunchItem {
    id: number;
    name: string;
    category: string;
    category_label: string;
    price: number;
    cal: number;
    protein: number;
    carbs: number;
    salt: number;
}

export const fetchLunchItems = async (): Promise<LunchItem[]> => {
    const response = await fetch(`${BASE_URL}/opttimize/lunch`, {
        method: `POST`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: 500, target_protein: 15, target_carbs: 50, target_salt: 2.0 }),
    });
    
    if (!response.ok) throw new Error("計算エラー");
    
    return response.json();
}