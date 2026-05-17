import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, HelpCircle, Terminal, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config';
import DevicePanel from '../components/DevicePanel';
import HistoryPanel from '../components/HistoryPanel';

import { jsonrepair } from 'jsonrepair';
import hljs from 'highlight.js';

const LANGUAGES = [
    'text', 'javascript', 'python', 'html', 'css', 'json', 'markdown', 'rust', 'go', 'java', 'cpp'
];

export default function Home() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [language, setLanguage] = useState('text');
    const [expiration, setExpiration] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showCLI, setShowCLI] = useState(true);
    const [cliOS, setCliOS] = useState('linux');
    const [localPath, setLocalPath] = useState('filename.txt');
    const [showHelp, setShowHelp] = useState(false);
    const [showFixConfirm, setShowFixConfirm] = useState(false);
    const [showDevices, setShowDevices] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const fileInputRef = useRef(null);
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { devices, deviceId, sharePaste, addMyPaste } = useSocket();
    const navigate = useNavigate();

    const onlineCount = devices.length;

    const getCLICommand = () => {
        const url = `${window.location.origin}${API_URL}/upload`;
        if (cliOS === 'win') {
            return `curl.exe -F "f=@${localPath}" ${url}`;
        }
        return `curl -F 'f=@${localPath}' ${url}`;
    };

    const handleFormatAndDetect = () => {
        try {
            const parsed = JSON.parse(content);
            setContent(JSON.stringify(parsed, null, 2));
            setLanguage('json');
            return;
        } catch {}

        try {
            const repaired = jsonrepair(content);
            JSON.parse(repaired);
            setShowFixConfirm(true);
            return;
        } catch {}

        if (content.trim()) {
            const result = hljs.highlightAuto(content);
            if (result.language && LANGUAGES.includes(result.language)) {
                setLanguage(result.language);
                showNotification(t('detected_language') + ': ' + result.language, 'info');
            } else if (result.language) {
                showNotification(t('detected_language') + ': ' + result.language, 'info');
            }
        }
    };

    const handleFixJSON = () => {
        try {
            const repaired = jsonrepair(content);
            const parsed = JSON.parse(repaired);
            setContent(JSON.stringify(parsed, null, 2));
            setLanguage('json');
            setShowFixConfirm(false);
            showNotification(t('success'), 'success');
        } catch (e) {
            showNotification('Could not fix JSON automatically.', 'error');
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const expiresAt = expiration ? new Date(Date.now() + parseInt(expiration)).toISOString() : null;
            const response = await axios.post(API_URL, {
                title,
                content,
                language,
                expiresAt
            });
            const pasteId = response.data._id;

            addMyPaste(pasteId, title || language, language);

            if (selectedDevices.length > 0) {
                sharePaste(pasteId, title || language, selectedDevices);
                showNotification(t('shared_to_devices', { count: selectedDevices.length }), 'success');
            }

            navigate(`/${pasteId}`);
        } catch (error) {
            console.error('Failed to save paste', error);
            showNotification(t('error') + ': Failed to save paste', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('f', file);
            const response = await axios.post(`${API_URL}/upload`, formData);
            const pasteId = response.data._id;

            addMyPaste(pasteId, file.name, 'file');

            if (selectedDevices.length > 0) {
                sharePaste(pasteId, file.name, selectedDevices);
                showNotification(t('shared_to_devices', { count: selectedDevices.length }), 'success');
            }

            showNotification(t('upload_success'), 'success');
            navigate(`/${pasteId}`);
        } catch (error) {
            console.error('Upload Error:', error);
            showNotification(t('error') + ': ' + (error.response?.data?.error || 'Upload failed'), 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 100px)' }}>
            {/* Toolbar */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                    <button className="btn btn-secondary" onClick={handleFixJSON} title={t('fix_json')} style={{ fontSize: '0.8rem' }}>
                        {t('fix_json')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowCLI(!showCLI)} title={t('cli_generator')} style={{ fontSize: '0.8rem' }}>
                        <Terminal size={14} /> CLI
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowDevices(!showDevices)}
                        style={{ fontSize: '0.8rem', position: 'relative' }}
                    >
                        <Wifi size={14} /> LAN
                        {onlineCount > 1 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: '#238636',
                                color: 'white',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                fontSize: '0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {onlineCount}
                            </span>
                        )}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowHelp(!showHelp)} title={t('usage_guide')} style={{ fontSize: '0.8rem' }}>
                        <HelpCircle size={14} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ fontSize: '0.8rem' }}
                    >
                        {uploading ? t('uploading') : t('upload_file')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        <Save size={16} />
                        {loading ? t('saving') : t('save_paste')}
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                />
            </div>

            {/* Device Panel */}
            {showDevices && (
                <>
                    <DevicePanel selectedDevices={selectedDevices} setSelectedDevices={setSelectedDevices} />
                    <HistoryPanel />
                </>
            )}

            {/* Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder={t('paste_title')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        color: 'white',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('type_here')}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                        flex: 1,
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        color: '#e6edf3',
                        padding: '1rem',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        resize: 'none',
                        borderRadius: '4px',
                        outline: 'none'
                    }}
                />
                <p style={{ fontSize: '0.75rem', color: '#8b949e', margin: 0, textAlign: 'center' }}>
                    {t('drag_drop_hint')}
                </p>
            </div>

            {/* Help Panel */}
            {showHelp && (
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#8b949e' }}>{t('help_text')}</p>
                </div>
            )}

            {/* CLI Panel */}
            {showCLI && (
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
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

            {/* Fix Confirm Modal */}
            {showFixConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '400px', maxWidth: '90%', textAlign: 'center', background: '#0d1117' }}>
                        <h3 style={{ marginTop: 0 }}>{t('json_fix_title')}</h3>
                        <p>{t('json_fix_confirm')}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <button className="btn btn-primary" onClick={handleFixJSON}>{t('yes')}</button>
                            <button className="btn btn-secondary" onClick={() => setShowFixConfirm(false)}>{t('no')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
