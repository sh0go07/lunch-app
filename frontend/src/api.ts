const BASE_URL = "http://127.0.0.1:8000";

export interface LunchItem {
    id: number;
    name: string;
    price: number;
    cal: number;
    protein: number;
}

export const fetchLunchItems = async (): Promise<LunchItem[]> => {
    const response = await fetch(`${BASE_URL}/opttimize/lunch`, {
        method: `POST`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: 500, target_protein: 15 }),
    });
    
    if (!response.ok) throw new Error("計算エラー");
    
    return response.json();
}