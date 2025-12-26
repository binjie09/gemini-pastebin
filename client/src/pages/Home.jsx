import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, FileText, Settings, HelpCircle, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

import { jsonrepair } from 'jsonrepair';
import hljs from 'highlight.js';

const LANGUAGES = [
    'text', 'javascript', 'python', 'html', 'css', 'json', 'markdown', 'rust', 'go', 'java', 'cpp'
];

export default function Home() {
    const [content, setContent] = useState('');
    const [language, setLanguage] = useState('text');
    const [expiration, setExpiration] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCLI, setShowCLI] = useState(true);
    const [cliOS, setCliOS] = useState('linux'); // linux, mac, win
    const [localPath, setLocalPath] = useState('filename.txt');
    const [showHelp, setShowHelp] = useState(false);
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const getCLICommand = () => {
        const url = `${window.location.origin}${API_URL}/upload`;
        if (cliOS === 'win') {
            return `curl -F "f=@${localPath}" ${url}`;
        }
        return `curl -F 'f=@${localPath}' ${url}`;
    };

    const handleFormatAndDetect = () => {
        // 1. Try JSON Formatting
        try {
            const parsed = JSON.parse(content);
            setContent(JSON.stringify(parsed, null, 2));
            setLanguage('json');
            return;
        } catch {
            // Not JSON, continue to other repairs or detection
        }

        // 2. Try JSON Repair
        try {
            const repaired = jsonrepair(content);
            const parsed = JSON.parse(repaired);
            setContent(JSON.stringify(parsed, null, 2));
            setLanguage('json');
            return;
        } catch (e) {
            // Not repairable JSON
        }

        // 3. Auto-detect language
        if (content.trim()) {
            const result = hljs.highlightAuto(content);
            if (result.language && LANGUAGES.includes(result.language)) {
                setLanguage(result.language);
                showNotification(t('detected_language') + ': ' + result.language, 'info');
            } else if (result.language) {
                // Map similar languages if needed, or just notify
                showNotification(t('detected_language') + ': ' + result.language, 'info');
            }
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const expiresAt = expiration ? new Date(Date.now() + parseInt(expiration)).toISOString() : null;
            const response = await axios.post(API_URL, {
                content,
                language,
                expiresAt
            });
            navigate(`/${response.data._id}`);
            navigate(`/${response.data._id}`);
        } catch (error) {
            console.error('Failed to save paste', error);
            showNotification(t('error') + ': Failed to save paste', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 100px)' }}>
            {/* Toolbar */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            background: '#0d1117',
                            color: 'inherit',
                            border: '1px solid #30363d',
                            padding: '0.4rem',
                            borderRadius: '4px'
                        }}
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
                    </select>

                    <select
                        value={expiration}
                        onChange={(e) => setExpiration(e.target.value)}
                        style={{
                            background: '#0d1117',
                            color: 'inherit',
                            border: '1px solid #30363d',
                            padding: '0.4rem',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">{t('never_expire')}</option>
                        <option value={3600 * 1000}>{t('1_hour')}</option>
                        <option value={86400 * 1000}>{t('1_day')}</option>
                        <option value={604800 * 1000}>{t('1_week')}</option>
                    </select>
                    <button className="btn btn-secondary" onClick={handleFormatAndDetect} title={t('format_detect')} style={{ fontSize: '0.8rem' }}>
                        {t('format')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowCLI(!showCLI)} title={t('cli_generator')} style={{ fontSize: '0.8rem' }}>
                        <Terminal size={14} /> CLI
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowHelp(!showHelp)} title={t('usage_guide')} style={{ fontSize: '0.8rem' }}>
                        <HelpCircle size={14} />
                    </button>
                </div>

                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    <Save size={16} />
                    {loading ? t('saving') : t('save_paste')}
                </button>
            </div>

            {showHelp && (
                <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(47, 129, 247, 0.1)', borderColor: 'var(--primary-color)' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={18} /> {t('usage_guide')}
                    </h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        {t('help_text')}
                    </p>
                </div>
            )}

            {/* Editor Area */}
            <textarea
                className="glass-panel"
                style={{
                    flex: 1,
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    resize: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    outline: 'none',
                    padding: '1rem',
                    boxSizing: 'border-box'
                }}
                placeholder={t('type_here')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck="false"
            />
            {showCLI && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: '#0d1117', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>{t('cli_generator')}</h3>
                        <button onClick={() => setShowCLI(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
                        <label>
                            <input type="radio" checked={cliOS === 'linux'} onChange={() => setCliOS('linux')} /> Linux
                        </label>
                        <label>
                            <input type="radio" checked={cliOS === 'mac'} onChange={() => setCliOS('mac')} /> macOS
                        </label>
                        <label>
                            <input type="radio" checked={cliOS === 'win'} onChange={() => setCliOS('win')} /> Windows
                        </label>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('local_path')}</label>
                        <input
                            type="text"
                            value={localPath}
                            onChange={(e) => setLocalPath(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#21262d',
                                border: '1px solid #30363d',
                                color: 'white',
                                padding: '0.5rem',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#8b949e' }}>{t('run_command')}</p>
                    <code style={{ background: '#21262d', padding: '0.8rem', display: 'block', borderRadius: '4px', overflowX: 'auto', fontFamily: 'monospace' }}>
                        {getCLICommand()}
                    </code>
                    <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.5rem' }}>
                        {t('cli_note')}
                    </p>
                </div>
            )}
        </div>
    );
}
