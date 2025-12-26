import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);



    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`glass-panel notification-${n.type}`}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: '#0d1117',
                            border: '1px solid #30363d',
                            borderLeft: `4px solid ${n.type === 'success' ? '#238636' :
                                n.type === 'error' ? '#da3633' :
                                    '#2f81f7'
                                }`,
                            minWidth: '250px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            animation: 'slideIn 0.3s ease-out',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {n.type === 'success' && <CheckCircle size={18} color="#238636" />}
                            {n.type === 'error' && <AlertCircle size={18} color="#da3633" />}
                            {n.type === 'info' && <Info size={18} color="#2f81f7" />}
                            <span style={{ fontSize: '0.9rem', color: '#e6edf3' }}>{n.message}</span>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#8b949e',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </NotificationContext.Provider>
    );
};
