import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import { Clock, Send } from 'lucide-react';

export default function HistoryPanel() {
    const { myPastes, receivedPastes } = useSocket();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tab, setTab] = useState('mine');

    const list = tab === 'mine' ? myPastes : receivedPastes;

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                    className={`btn ${tab === 'mine' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('mine')}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                >
                    <Send size={12} /> {t('my_pastes')}
                </button>
                <button
                    className={`btn ${tab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('received')}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                >
                    <Clock size={12} /> {t('received_shares')}
                    {receivedPastes.length > 0 && (
                        <span style={{
                            marginLeft: '0.3rem',
                            background: '#238636',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem'
                        }}>
                            {receivedPastes.length}
                        </span>
                    )}
                </button>
            </div>

            {list.length === 0 ? (
                <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: 0 }}>{t('no_history')}</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {list.map((item, i) => (
                        <div
                            key={`${item.pasteId}-${i}`}
                            onClick={() => navigate(`/${item.pasteId}`)}
                            style={{
                                padding: '0.4rem 0.6rem',
                                background: '#21262d',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.85rem'
                            }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                {item.title || item.pasteId}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
                                {tab === 'received' && item.from && <span style={{ marginRight: '0.5rem', color: '#58a6ff' }}>{item.from}</span>}
                                {new Date(item.time).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
