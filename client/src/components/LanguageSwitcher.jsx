import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Languages size={16} color="#8b949e" />
            <select
                value={i18n.language.startsWith('zh') ? 'zh' : 'en'}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                    background: 'transparent',
                    color: '#8b949e',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '0.9rem'
                }}
            >
                <option value="en">English</option>
                <option value="zh">中文</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
