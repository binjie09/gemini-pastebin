import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Copy, FoldVertical, UnfoldVertical } from 'lucide-react';

const THEME = {
    string: '#ce9178',
    number: '#b5cea8',
    boolean: '#569cd6',
    null: '#569cd6',
    key: '#9cdcfe',
    bracket: '#d4d4d4',
    colon: '#d4d4d4',
    comma: '#d4d4d4',
    count: '#6a9955',
    bg: '#1e1e1e',
};

function JsonValue({ value, indent, isLast, rootKey }) {
    if (value === null) return <span style={{ color: THEME.null }}>null{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    if (typeof value === 'boolean') return <span style={{ color: THEME.boolean }}>{String(value)}{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    if (typeof value === 'number') return <span style={{ color: THEME.number }}>{String(value)}{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    if (typeof value === 'string') return <span style={{ color: THEME.string }}>&quot;{value}&quot;{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    if (Array.isArray(value)) return <JsonArray arr={value} indent={indent} isLast={isLast} />;
    if (typeof value === 'object') return <JsonObject obj={value} indent={indent} isLast={isLast} />;
    return String(value);
}

function CollapsedPreview({ value }) {
    if (Array.isArray(value)) {
        const preview = value.slice(0, 3).map((v, i) => {
            if (v === null) return 'null';
            if (typeof v === 'string') return `"${v.length > 15 ? v.slice(0, 15) + '…' : v}"`;
            return String(v);
        }).join(', ');
        const suffix = value.length > 3 ? ', …' : '';
        return <span style={{ color: THEME.count }}>{`[${preview}${suffix}]`}</span>;
    }
    const keys = Object.keys(value);
    const preview = keys.slice(0, 3).join(', ');
    const suffix = keys.length > 3 ? ', …' : '';
    return <span style={{ color: THEME.count }}>{`{${preview}${suffix}}`}</span>;
}

function ToggleIcon({ collapsed }) {
    return collapsed
        ? <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
        : <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />;
}

function JsonObject({ obj, indent, isLast }) {
    const [collapsed, setCollapsed] = useState(indent >= 2);
    const keys = Object.keys(obj);
    const isEmpty = keys.length === 0;

    if (isEmpty) {
        return <span style={{ color: THEME.bracket }}>{'{}'}{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    }

    const nextIndent = indent + 1;
    const pad = '  '.repeat(nextIndent);

    return (
        <span>
            <span
                onClick={() => setCollapsed(c => !c)}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
                <ToggleIcon collapsed={collapsed} />
                <span style={{ color: THEME.bracket }}>{'{'}</span>
            </span>
            {collapsed ? (
                <span>
                    <CollapsedPreview value={obj} />
                    <span style={{ color: THEME.bracket }}>{'}'}</span>
                    {!isLast && <span style={{ color: THEME.comma }}>,</span>}
                    <span style={{ color: THEME.count, fontSize: '0.85em', marginLeft: 4 }}>{keys.length} keys</span>
                </span>
            ) : (
                <span>
                    {'\n'}
                    {keys.map((key, i) => (
                        <span key={key}>
                            {pad}<span style={{ color: THEME.key }}>&quot;{key}&quot;</span>
                            <span style={{ color: THEME.colon }}>: </span>
                            <JsonValue value={obj[key]} indent={nextIndent} isLast={i === keys.length - 1} rootKey={key} />
                            {'\n'}
                        </span>
                    ))}
                    {'  '.repeat(indent)}<span style={{ color: THEME.bracket }}>{'}'}</span>
                    {!isLast && <span style={{ color: THEME.comma }}>,</span>}
                </span>
            )}
        </span>
    );
}

function JsonArray({ arr, indent, isLast }) {
    const [collapsed, setCollapsed] = useState(indent >= 2);
    const isEmpty = arr.length === 0;

    if (isEmpty) {
        return <span style={{ color: THEME.bracket }}>{'[]'}{!isLast && <span style={{ color: THEME.comma }}>,</span>}</span>;
    }

    const nextIndent = indent + 1;
    const pad = '  '.repeat(nextIndent);

    return (
        <span>
            <span
                onClick={() => setCollapsed(c => !c)}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
                <ToggleIcon collapsed={collapsed} />
                <span style={{ color: THEME.bracket }}>{'['}</span>
            </span>
            {collapsed ? (
                <span>
                    <CollapsedPreview value={arr} />
                    <span style={{ color: THEME.bracket }}>{']'}</span>
                    {!isLast && <span style={{ color: THEME.comma }}>,</span>}
                    <span style={{ color: THEME.count, fontSize: '0.85em', marginLeft: 4 }}>{arr.length} items</span>
                </span>
            ) : (
                <span>
                    {'\n'}
                    {arr.map((item, i) => (
                        <span key={i}>
                            {pad}<JsonValue value={item} indent={nextIndent} isLast={i === arr.length - 1} />
                            {'\n'}
                        </span>
                    ))}
                    {'  '.repeat(indent)}<span style={{ color: THEME.bracket }}>{']'}</span>
                    {!isLast && <span style={{ color: THEME.comma }}>,</span>}
                </span>
            )}
        </span>
    );
}

function countNodes(value) {
    if (value === null || typeof value !== 'object') return 0;
    let count = 1;
    const entries = Array.isArray(value) ? value : Object.values(value);
    for (const v of entries) count += countNodes(v);
    return count;
}

export default function JsonViewer({ data }) {
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [copyLabel, setCopyLabel] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopyLabel(true);
        setTimeout(() => setCopyLabel(false), 1500);
    }, [data]);

    const nodeCount = countNodes(data);
    const hasDeepNodes = nodeCount > 0;

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute', top: 8, right: 8,
                display: 'flex', gap: 6, zIndex: 10,
            }}>
                {hasDeepNodes && (
                    <button
                        onClick={() => setAllCollapsed(c => !c)}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 4,
                            color: '#ccc',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                        title={allCollapsed ? 'Expand all' : 'Collapse all'}
                    >
                        {allCollapsed ? <UnfoldVertical size={14} /> : <FoldVertical size={14} />}
                        {allCollapsed ? 'Expand' : 'Collapse'}
                    </button>
                )}
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        color: '#ccc',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}
                    title="Copy JSON"
                >
                    <Copy size={14} />
                    {copyLabel ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre
                key={allCollapsed ? 'collapsed' : 'expanded'}
                style={{
                    margin: 0,
                    padding: '1.5rem',
                    background: THEME.bg,
                    fontSize: '14px',
                    fontFamily: 'var(--font-mono, monospace)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                    overflow: 'auto',
                    maxHeight: '80vh',
                    color: '#d4d4d4',
                }}
            >
                <JsonValue value={data} indent={0} isLast={true} />
            </pre>
        </div>
    );
}
