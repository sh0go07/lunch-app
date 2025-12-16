import React from 'react';
import '../App.css';

export const Header: React.FC = () => {
    return (
        <header className="app-header">
            <img
                src="/Group 1.svg"
                alt="ロゴ"
                className="header-icon"
                style={{ width: '40px', height: 'auto' }}
            />

            
            コンビニご飯献立アプリ
        </header>
    )
}

