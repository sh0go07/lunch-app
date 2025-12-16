const BASE_URL = "http://127.0.0.1:8000";

export interface LunchItem {
    id: number;
    name: string;
    category: string | null;
    category_label: string | null;
    price: number;
    cal: number;
    protein: number;
    carbs: number | null;
    salt: number | null;
}

export interface OptimizeRequest {
    budget: number;
    target_cal: number | null;
    target_protein: number;
    target_carbs: number | null;
    target_salt: number | null;
}

export const fetchLunchItems = async (): Promise<LunchItem[]> => {
    const response = await fetch(`${BASE_URL}/optimize/lunch`);

    if (!response.ok) throw new Error("データ取得エラー");
    
    return response.json();
}

export const calculateLunch = async (req: OptimizeRequest): Promise<{ result: LunchItem[], message?: string }> => {
    const response = await fetch(`${BASE_URL}/optimize/lunch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
    })

    if (!response.ok) throw new Error("計算エラー");
    
    return response.json();
}
