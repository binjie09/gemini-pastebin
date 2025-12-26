import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import Ansi from 'ansi-to-react';
import { Copy, Download, FileText, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config';

export default function PasteView() {
    const { id } = useParams();
    const [paste, setPaste] = useState(null);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const [isProtected, setIsProtected] = useState(false);
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchPaste = async () => {
            try {
                const response = await axios.get(`${API_URL}/${id}`);
                if (response.data.isProtected) {
                    setIsProtected(true);
                    setPaste(response.data); // Stores metadata
                } else {
                    setPaste(response.data);
                }
            } catch {
                setError(t('not_found'));
            }
        };
        fetchPaste();
    }, [id, t]);

    const copyToClipboard = () => {
        if (paste) {
            navigator.clipboard.writeText(paste.content);
            showNotification(t('copy') + '!', 'success');
        }
    };

    const downloadRaw = () => {
        if (!paste) return;
        const element = document.createElement("a");
        const file = new Blob([paste.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = paste.filename || `paste-${id}.${paste.language === 'text' ? 'txt' : paste.language}`;
        document.body.appendChild(element);
        element.click();
    };

    if (error) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--error-color)' }}>
                <h2>{t('error')}</h2>
                <p>{error}</p>
            </div>
        );
    }

    const handleUnlock = async () => {
        try {
            const response = await axios.post(`${API_URL}/verify/${id}`, { password });
            setPaste(response.data);
            setIsProtected(false);
        } catch {
            showNotification(t('invalid_password'), 'error');
        }
    };

    if (isProtected) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Lock size={24} /> {t('password_protected')}
                </h2>
                <p>{t('protected_note')}</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="glass-panel"
                        style={{ padding: '0.5rem', border: '1px solid #30363d', width: '200px' }}
                        placeholder={t('enter_password')}
                    />
                    <button className="btn btn-primary" onClick={handleUnlock}>{t('unlock')}</button>
                </div>
            </div>
        );
    }

    if (!paste) {
        return <div className="glass-panel">Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header / Meta */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', color: '#8b949e' }}>
                    {paste.filename && (
                        <>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                <FileText size={16} />
                                {paste.filename}
                            </span>
                            <span>•</span>
                        </>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!paste.filename && <FileText size={16} />}
                        {paste.language.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{(new Blob([paste.content]).size / 1024).toFixed(2)} KB</span>
                    <span>•</span>
                    <span>{new Date(paste.createdAt).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={copyToClipboard} title={t('copy')}>
                        <Copy size={16} /> {t('copy')}
                    </button>
                    <button className="btn btn-secondary" onClick={downloadRaw} title={t('download')}>
                        <Download size={16} /> {t('download')}
                    </button>
                    <a href={`${API_URL}/raw/${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        {t('raw')}
                    </a>
                </div>
            </div>

            {/* Content Viewer */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {(() => {
                    const mime = paste.mimetype || '';
                    const rawUrl = `${API_URL}/raw/${id}`;

                    if (mime.startsWith('image/')) {
                        return (
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: '#0d1117' }}>
                                <img src={rawUrl} alt={paste.filename} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '4px' }} />
                            </div>
                        );
                    }
                    if (mime.startsWith('video/')) {
                        return (
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: '#0d1117' }}>
                                <video src={rawUrl} controls style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '4px' }} />
                            </div>
                        );
                    }
                    if (mime.startsWith('audio/')) {
                        return (
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0d1117' }}>
                                <audio src={rawUrl} controls style={{ width: '100%' }} />
                            </div>
                        );
                    }

                    // Fallback to Code/Text View
                    if (paste.language === 'markdown') {
                        return (
                            <div style={{ padding: '2rem', color: 'var(--text-color)' }}>
                                <ReactMarkdown>{paste.content || ''}</ReactMarkdown>
                            </div>
                        );
                    }

                    if (/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/.test(paste.content || '')) {
                        return (
                            <div style={{ padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '14px', whiteSpace: 'pre-wrap', color: '#e6edf3', backgroundColor: '#1e1e1e' }}>
                                <Ansi>{paste.content}</Ansi>
                            </div>
                        );
                    }

                    // Default Code View
                    return (
                        <SyntaxHighlighter
                            language={paste.language === 'autodetect' ? 'text' : paste.language}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '14px' }}
                            showLineNumbers={true}
                        >
                            {paste.content || '(Binary file, please download to view)'}
                        </SyntaxHighlighter>
                    );
                })()}
            </div>
        </div>
    );
}
