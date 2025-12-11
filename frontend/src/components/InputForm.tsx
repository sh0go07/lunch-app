import React from 'react';

interface Props {
    budget: number;
    setBudget: (value: number) => void;
    targetProtein: number;
    setTargetProtein: (value: number) => void;
    onOptimize: () => void;
}

export const InputForm: React.FC<Props> = ({
    budget,
    setBudget, 
    targetProtein,
    setTargetProtein,
    onOptimize
}) => {
    return (
        <div className="control-panel">
            <h2>🔍 最適化の条件</h2>

            <div style={{ marginBottom: '10px' }}>
                <label>
                    💰 予算 (円): 
                    <input 
                        type="number" 
                        value={budget} 
                        onChange={(e) => setBudget(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        min="100"
                    />
                </label>
            </div>

            <div className="input-group">
                <label>
                    💪 欲しいタンパク質 (g): 
                    <input 
                        type="number" 
                        value={targetProtein} 
                        onChange={(e) => setTargetProtein(Number(e.target.value))} 
                        onFocus={(e) => e.target.select()}
                        min="0" 
                    />
                </label>
            </div>

            <button className="optimize-btn" onClick={onOptimize}>
                最適なお弁当を計算！
            </button>
        </div>
    )
}
