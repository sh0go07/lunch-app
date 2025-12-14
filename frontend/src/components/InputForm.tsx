import React, { useState } from 'react';

interface Props {
    budget: number;
    setBudget: (value: number) => void;
    targetProtein: number;
    setTargetProtein: (value: number) => void;
    targetCarbs: number;
    setTargetCarbs: (value: number | null) => void;
    targetSalt: number;
    setTargetSalt: (value: number | null) => void;
    onOptimize: () => void;
    isLoading: boolean;
}

export const InputForm: React.FC<Props> = ({
    budget,
    setBudget, 
    targetProtein,
    setTargetProtein,
    targetCarbs,
    setTargetCarbs,
    targetSalt,
    setTargetSalt,
    onOptimize,
    isLoading,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const toggleAdvanced = () => {
        const nextState = !showAdvanced;
        setShowAdvanced(nextState);

        if (!nextState) {
            setTargetCarbs(null);
            setTargetSalt(null);
        } else {
            setTargetCarbs(30);
            setTargetSalt(2.0);
        }
    };

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

                <div className="advanced-toggle">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={showAdvanced}
                            onChange={toggleAdvanced}
                        />
                        <span>詳しい設定をする</span>
                    </label>
                </div>

                {showAdvanced && (
                    <div className="advanced-options">
                        <div className="input-group">
                            <label>
                                🍚 欲しい炭水化物 (g):
                                <input
                                    type="number"
                                    value={targetCarbs ?? ''}
                                    onChange={(e) => setTargetCarbs(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    min="0"
                                />
                            </label>
                        </div>

                        <div className="input-group">
                            <label>
                                🧂 欲しい塩分 (g):
                                <input
                                    type="number"
                                    value={targetSalt}
                                    onChange={(e) => setTargetSalt(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    min="0"
                                />
                            </label>
                        </div>
                    </div>
                )}
            
            </div>

            <button className="optimize-btn" onClick={onOptimize} disabled={isLoading}>
                {isLoading ? '計算中...' : '最適なお弁当を計算！'}
            </button>
        </div>
    )
}
