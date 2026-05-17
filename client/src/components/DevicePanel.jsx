import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import { Wifi, Edit2, Check } from 'lucide-react';

export default function DevicePanel({ selectedDevices, setSelectedDevices }) {
    const { devices, deviceName, updateName, deviceId } = useSocket();
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState(deviceName);

    const otherDevices = devices.filter(d => d.id !== deviceId);

    const toggleDevice = (id) => {
        setSelectedDevices(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSaveName = () => {
        updateName(nameInput);
        setEditing(false);
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wifi size={16} /> {t('lan_devices')}
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>({devices.length} {t('online')})</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {editing ? (
                        <>
                            <input
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                style={{
                                    background: '#21262d',
                                    border: '1px solid #30363d',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    width: '120px'
                                }}
                                autoFocus
                            />
                            <button className="btn btn-secondary" onClick={handleSaveName} style={{ padding: '0.2rem 0.4rem' }}>
                                <Check size={12} />
                            </button>
                        </>
                    ) : (
                        <>
                            <span style={{ color: '#58a6ff' }}>{deviceName}</span>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setNameInput(deviceName); setEditing(true); }}
                                style={{ padding: '0.2rem 0.4rem' }}
                            >
                                <Edit2 size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {otherDevices.length === 0 ? (
                <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: 0 }}>{t('lan_no_devices')}</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {otherDevices.map(d => (
                        <label
                            key={d.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.6rem',
                                background: selectedDevices.includes(d.id) ? '#1f3a5f' : '#21262d',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedDevices.includes(d.id)}
                                onChange={() => toggleDevice(d.id)}
                            />
                            <span>{d.name || d.id}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
