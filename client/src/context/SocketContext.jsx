import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNotification } from './NotificationContext';

const SocketContext = createContext(null);

const ANIMALS = ['海豚','猎鹰','熊猫','白鹭','雪豹','飞鱼','云雀','银狐','火烈鸟','独角鲸'];
const MAX_HISTORY = 50;

function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Browser';
}

function getOrCreateDeviceId() {
    let id = localStorage.getItem('lan-device-id');
    if (!id) {
        id = Math.random().toString(36).slice(2, 10);
        localStorage.setItem('lan-device-id', id);
    }
    return id;
}

function getOrCreateName() {
    const stored = localStorage.getItem('lan-device-name');
    if (stored) return stored;
    const name = `${detectBrowser()}-${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`;
    localStorage.setItem('lan-device-name', name);
    return name;
}

function loadList(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

export function SocketProvider({ children }) {
    const [devices, setDevices] = useState([]);
    const [deviceName, setDeviceNameState] = useState(getOrCreateName);
    const [deviceId] = useState(getOrCreateDeviceId);
    const [receivedPastes, setReceivedPastes] = useState(() => loadList('lan-shared-received'));
    const [myPastes, setMyPastes] = useState(() => loadList('lan-my-pastes'));
    const socketRef = useRef(null);
    const { showNotification } = useNotification();

    const updateName = useCallback((name) => {
        const trimmed = name.trim().slice(0, 30);
        if (!trimmed) return;
        setDeviceNameState(trimmed);
        localStorage.setItem('lan-device-name', trimmed);
        if (socketRef.current) {
            socketRef.current.emit('set-name', trimmed);
        }
    }, []);

    const addMyPaste = useCallback((pasteId, title, language) => {
        setMyPastes(prev => {
            const next = [{ pasteId, title, language, time: Date.now() }, ...prev].slice(0, MAX_HISTORY);
            saveList('lan-my-pastes', next);
            return next;
        });
    }, []);

    const sharePaste = useCallback((pasteId, title, targetIds) => {
        if (socketRef.current) {
            socketRef.current.emit('share-paste', { pasteId, title, targetIds });
        }
    }, []);

    useEffect(() => {
        const socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            auth: { deviceId, deviceName }
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('set-name', deviceName);
        });

        socket.on('devices-update', (list) => {
            setDevices(list);
        });

        socket.on('paste-shared', ({ pasteId, title, from }) => {
            showNotification(`${from} 共享了: ${title}`, 'info', pasteId);
            setReceivedPastes(prev => {
                const next = [{ pasteId, title, from, time: Date.now() }, ...prev].slice(0, MAX_HISTORY);
                saveList('lan-shared-received', next);
                return next;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{
            devices, deviceName, deviceId, updateName,
            sharePaste, addMyPaste,
            receivedPastes, myPastes
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
