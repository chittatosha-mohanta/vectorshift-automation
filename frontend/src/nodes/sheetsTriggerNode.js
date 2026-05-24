import { useState } from 'react';
import { Position } from 'reactflow';
import { CustomNode } from './customNode';
import { useStore } from '../store';

const extractSheetId = (url) => {
  if (!url) return '';
  const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : url; // Fallback to raw text if no match
};

export const SheetsTriggerNode = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const initialFields = {
    sheetUrl: data?.sheetUrl || '',
    sheetId: data?.sheetId || '',
    sheetName: data?.sheetName || 'Sheet1'
  };

  const handleSync = async (e) => {
    if (e) e.stopPropagation();
    setIsSaving(true);
    try {
      const nodes = useStore.getState().nodes;
      const edges = useStore.getState().edges;
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
    setIsSaving(false);
  };

  const handleLogoClick = (e) => {
    e.stopPropagation(); // Prevent react-flow dragging triggers
    setIsExpanded(!isExpanded);
  };

  const sheetsIcon = (
    <div
      onClick={handleLogoClick}
      title="Click Sheets Logo to expand/collapse settings"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '6px',
        backgroundColor: isExpanded ? 'rgba(15, 157, 88, 0.15)' : 'rgba(15, 157, 88, 0.08)',
        border: '1px solid rgba(15, 157, 88, 0.25)',
        transition: 'all 0.2s ease',
      }}
      className="sync-logo-btn"
    >
      <svg viewBox="0 0 64 88" width="18" height="18">
        <path d="M 42,0 64,22 53,24 42,22 40,11 Z" fill="#188038" />
        <path d="M 42,22 V 0 H 6 C 2.685,0 0,2.685 0,6 v 76 c 0,3.315 2.685,6 6,6 h 52 c 3.315,0 6,-2.685 6,-6 V 22 Z" fill="#34a853" />
        <path d="M 12,34 V 63 H 52 V 34 Z M 29.5,58 H 17 v -7 h 12.5 z m 0,-12 H 17 V 39 H 29.5 Z M 47,58 H 34.5 V 51 H 47 Z M 47,46 H 34.5 V 39 H 47 Z" fill="#fff" />
      </svg>
    </div>
  );

  const handles = [
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-row`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title={isExpanded ? "Sheets Trigger" : ""}
      icon={sheetsIcon}
      initialFields={initialFields}
      handles={handles}
      className={`database-node ${isExpanded ? "" : "collapsed-node"}`}
      style={{
        width: isExpanded ? '230px' : '54px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      renderContent={(fields, handleChange) => {
        if (!isExpanded) return null;

        const onUrlChange = (e) => {
          const url = e.target.value;
          handleChange('sheetUrl', url);
          const extractedId = extractSheetId(url);
          handleChange('sheetId', extractedId);
        };

        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Sheet: <span style={{ color: '#fff', fontWeight: 500 }}>{fields.sheetName}</span>
              </div>
              <div
                onClick={handleLogoClick}
                style={{ fontSize: '9px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                Click logo to collapse
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <div className="node-field">
                <label>
                  Google Sheet Link:
                  <input
                    type="text"
                    value={fields.sheetUrl}
                    onChange={onUrlChange}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                  />
                </label>
              </div>

              {fields.sheetId && (
                <div style={{ fontSize: '9px', opacity: 0.7, color: '#10b981', wordBreak: 'break-all', marginTop: '-4px' }}>
                  <strong>Spreadsheet ID:</strong> {fields.sheetId}
                </div>
              )}

              <div className="node-field">
                <label>
                  Sheet Name:
                  <input
                    type="text"
                    value={fields.sheetName}
                    onChange={(e) => handleChange('sheetName', e.target.value)}
                    placeholder="Sheet1"
                  />
                </label>
              </div>

              <button
                className="submit-button"
                onClick={handleSync}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  background: '#0F9D58',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginTop: '4px'
                }}
              >
                {isSaving ? 'Syncing...' : 'Save & Sync'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
              <div className="node-info-text" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>
                Triggers on row updates
              </div>

              {isSaving && (
                <span style={{ fontSize: '8px', color: '#818cf8', animation: 'pulse 1.5s infinite' }}>
                  Saving...
                </span>
              )}
              {saveStatus === 'success' && (
                <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 600 }}>
                  ✓ Sync Success
                </span>
              )}
              {saveStatus === 'error' && (
                <span style={{ fontSize: '8px', color: '#ef4444', fontWeight: 600 }}>
                  ✗ Sync Failed
                </span>
              )}
            </div>
          </>
        );
      }}
    />
  );
};
