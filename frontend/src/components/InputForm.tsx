import React, { useState } from 'react';
import '../App.css';

interface Props {
    onCalculate: (
        budget: number,
        targetCal: number,
        targetProtein: number,
        targetCarbs: number,
        targetSalt: number,
    ) => void;
}

export const InputForm: React.FC<Props> = ({ onCalculate }) => {
    const [budget, setBudget] = useState<number>(800);
    const [targetCal, setTargetCal] = useState<number>(500);
    const [targetProtein, setTargetProtein] = useState<number>(20);
    const [targetCarbs, setTargetCarbs] = useState<string>();
    const [targetSalt, setTargetSalt] = useState<string>();

    const applyMode = (mode:'normal' | 'muscle' | 'diet' | 'health') => {
        if (mode === 'normal') {
            setTargetProtein(20);
            setTargetCarbs('');
            setTargetSalt('');
        } else if (mode === 'muscle') {
            setTargetProtein(40);
            setTargetCarbs('');
            setTargetSalt('');
        } else if (mode === 'diet') {
            setTargetCal(500);
            setTargetProtein(20);
            setTargetCarbs('30');
            setTargetSalt('');
        } else if (mode === 'health') {
            setTargetCal(500);
            setTargetProtein(15);
            setTargetCarbs('');
            setTargetSalt('2.0');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(
            budget,
            targetCal,
            targetProtein,
            targetCarbs ? Number(targetCarbs) : null,
            targetSalt ? Number(targetSalt) : null,
        );
    };

    return (
        <div className="input-form">
            <h3>今日のご飯はどんな気分？</h3>

            <div className="mode-buttons">
                <button type="button" onClick={() => applyMode('normal')} className="mode-btn normal">
                    ノーマル
                </button>
                <button type="button" onClick={() => applyMode('muscle')} className="mode-btn muscle">
                    💪 筋肉
                </button>
                <button type="button" onClick={() => applyMode('diet')} className="mode-btn diet">
                    🥗 糖質OFF
                </button>
                <button type="button" onClick={() => applyMode('health')} className="mode-btn health">
                    🩺 塩分ケア
                </button>
            </div>

            <hr />

            <form onSubmit={handleSubmit}>
                <div className="control-panel">
                    <h2>🔍 最適化の条件</h2>

                    <div className="input-group">
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

                        <label>
                            🔥 欲しいカロリー (kcal):
                            <input
                                type="number"
                                value={targetCal}
                                onChange={(e) => setTargetCal(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                min='0'
                            />
                        </label>

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

                        <label>
                            🍚 欲しい炭水化物 (g):
                            <input
                            type="number"
                                value={targetCarbs ?? ''}
                                onChange={(e) => setTargetCarbs(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                min="0"
                            />
                        </label>

                        <label>
                            🧂 欲しい塩分 (g):
                            <input
                                type="number"
                                value={targetSalt}
                                onChange={(e) => setTargetSalt(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                min="0"
                            />
                        </label>
                    </div>

                    <button type="submit" className="optimize-btn">
                        最適なお弁当を計算！
                    </button>
                </div>
            </form>
        </div>
    );
};
