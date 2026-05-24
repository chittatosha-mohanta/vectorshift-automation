import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { CustomNode } from './customNode';
import { useStore } from '../store';

export const GmailNode = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialFields = {
    sender: data?.sender || localStorage.getItem('settings:gmailSender') || 'hr@company.com',
    appPassword: data?.appPassword || localStorage.getItem('settings:gmailAppPassword') || '',
    subject: data?.subject || 'Application Received',
    body: data?.body || 'Dear Candidate,\n\nWe have received your application. We will review it and connect with you shortly.\n\nBest regards,\nRecruitment Team'
  };

  // Sync with global settings when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (!data?.sender) {
        const globalSender = localStorage.getItem('settings:gmailSender');
        if (globalSender) {
          updateNodeField(id, 'sender', globalSender);
        }
      }
      if (!data?.appPassword) {
        const globalPassword = localStorage.getItem('settings:gmailAppPassword');
        if (globalPassword) {
          updateNodeField(id, 'appPassword', globalPassword);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [data?.sender, data?.appPassword, id, updateNodeField]);

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

  const gmailIcon = (
    <div
      onClick={handleLogoClick}
      title="Click Gmail Logo to expand/collapse settings"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '6px',
        backgroundColor: isExpanded ? 'rgba(234, 67, 53, 0.15)' : 'rgba(234, 67, 53, 0.08)',
        border: '1px solid rgba(234, 67, 53, 0.25)',
        transition: 'all 0.2s ease',
      }}
      className="sync-logo-btn"
    >
      <svg viewBox="52 42 88 66" width="18" height="18">
        <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
        <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
      </svg>
    </div>
  );

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-recipient`,
      style: { top: '25%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-body`,
      style: { top: '75%' }
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title={isExpanded ? "Gmail Send" : ""}
      icon={gmailIcon}
      initialFields={initialFields}
      handles={handles}
      className={`api-request-node ${isExpanded ? "" : "collapsed-node"}`}
      style={{
        width: isExpanded ? '230px' : '54px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      renderContent={(fields, handleChange) => {
        if (!isExpanded) return null;

        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                From: <span style={{ color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{fields.sender}</span>
              </div>
              <div
                onClick={handleLogoClick}
                style={{ fontSize: '9px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#818cf8' }}></span>
                Click logo to collapse
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <div className="node-field">
                <label>
                  From (Sender Email):
                  <input
                    type="email"
                    value={fields.sender}
                    onChange={(e) => handleChange('sender', e.target.value)}
                    placeholder="hr@company.com"
                  />
                </label>
              </div>

              <div className="node-field">
                <label>
                  Gmail App Password:
                  <input
                    type="password"
                    value={fields.appPassword}
                    onChange={(e) => handleChange('appPassword', e.target.value)}
                    placeholder="16-character app password..."
                  />
                </label>
              </div>

              <div className="node-field">
                <label>
                  Subject:
                  <input
                    type="text"
                    value={fields.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Email Subject..."
                  />
                </label>
              </div>

              <div className="node-field">
                <label>
                  Body:
                  <textarea
                    value={fields.body}
                    onChange={(e) => handleChange('body', e.target.value)}
                    placeholder="Write your email body here..."
                    rows={5}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </label>
              </div>

              <button
                className="submit-button"
                onClick={handleSync}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  background: '#EA4335',
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
              <div className="node-body-text" style={{ fontSize: '8px', opacity: 0.7 }}>
                Connect recipient & body handles.
              </div>

              {isSaving && (
                <span style={{ fontSize: '8px', color: '#818cf8', animation: 'pulse 1.5s infinite' }}>
                  Saving...
                </span>
              )}
              {saveStatus === 'success' && (
                <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 600 }}>
                  ✓ Saved & Sync'd
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
