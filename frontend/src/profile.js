import { useState, useEffect } from 'react';
import { useStore } from './store';

export const ProfileModal = ({ isOpen, onClose }) => {
  const currentNodes = useStore((state) => state.nodes);
  const loadPipeline = useStore((state) => state.loadPipeline);
  
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [dialog, setDialog] = useState(null);
  
  const loadSavedWorkflows = () => {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('pipeline:')) {
        const name = key.replace('pipeline:', '');
        try {
          const dataStr = localStorage.getItem(key);
          const data = JSON.parse(dataStr);
          list.push({
            name,
            nodeCount: data.nodes ? data.nodes.length : 0,
            edgeCount: data.edges ? data.edges.length : 0,
            active: data.active !== false,
            lastSaved: 'Recently'
          });
        } catch (e) {
          list.push({ name, nodeCount: 0, edgeCount: 0, active: true, lastSaved: 'Unknown' });
        }
      }
    }
    setSavedWorkflows(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadSavedWorkflows();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('storage', loadSavedWorkflows);
    return () => window.removeEventListener('storage', loadSavedWorkflows);
  }, []);

  const handleOpenWorkflow = (name) => {
    const dataStr = localStorage.getItem(`pipeline:${name}`);
    if (dataStr) {
      const { nodes, edges } = JSON.parse(dataStr);
      loadPipeline(nodes, edges);
      onClose();
    }
  };

  const handleDeleteWorkflow = (name) => {
    setDialog({
      message: `Are you sure you want to stop active runs and delete the pipeline "${name}"?`,
      onConfirm: async () => {
        setDialog(null);
        // Read pipeline data from localStorage
        const dataStr = localStorage.getItem(`pipeline:${name}`);
        if (dataStr) {
          try {
            const { nodes } = JSON.parse(dataStr);
            // Tell backend to stop dynamic sheet polling triggers for this pipeline
            await fetch('http://localhost:8000/pipelines/stop', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ nodes: nodes || [] })
            });
          } catch (err) {
            console.error('Failed to notify backend to stop polling:', err);
          }
        }
        
        // Remove from localStorage
        localStorage.removeItem(`pipeline:${name}`);
        
        // Update state list
        setSavedWorkflows(savedWorkflows.filter((flow) => flow.name !== name));

        // Dispatch global storage event to keep other components (like Load Saved dropdown) updated
        window.dispatchEvent(new Event('storage'));
      },
      onCancel: () => {
        setDialog(null);
      }
    });
  };

  const handleToggleActive = async (name, currentActive) => {
    const dataStr = localStorage.getItem(`pipeline:${name}`);
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      const nextActive = !currentActive;
      
      if (nextActive) {
        // Start / Resume: parse on backend to re-enable polling
        const response = await fetch('http://localhost:8000/pipelines/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nodes: data.nodes || [], edges: data.edges || [] })
        });
        if (!response.ok) {
          throw new Error('Failed to register on backend');
        }
      } else {
        // Stop / Pause: remove triggers on backend to pause polling
        await fetch('http://localhost:8000/pipelines/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nodes: data.nodes || [] })
        });
      }
      
      // Update localStorage
      data.active = nextActive;
      localStorage.setItem(`pipeline:${name}`, JSON.stringify(data));
      
      // Update UI list
      setSavedWorkflows(savedWorkflows.map((flow) => {
        if (flow.name === name) {
          return { ...flow, active: nextActive };
        }
        return flow;
      }));
      
    } catch (err) {
      console.error('Failed to toggle pipeline active state:', err);
      setDialog({
        message: `Error toggling pipeline: ${err.message}`,
        onConfirm: () => setDialog(null)
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '680px', 
          maxHeight: '85vh',
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600 }}>User Profile & Stats</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
        </div>

        {/* Scrollable Container */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Profile card & Workspace card */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* User Info Card */}
            <div 
              style={{ 
                flex: 1.2,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                gap: '16px'
              }}
            >
              {/* Profile Avatar */}
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: 600,
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                }}
              >
                CM
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Chittatosha Mohanta</h4>
                <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 500, marginTop: '2px' }}>AI Workflow Engineer</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>chittatoshamohanta@gmail.com</div>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                  Building custom automation triggers, integrating Sheets & LLMs for instant agent processing.
                </p>
              </div>
            </div>

            {/* Workspace Card */}
            <div 
              style={{ 
                flex: 0.8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Space</div>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#fff' }}>Vector Workspace</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>Plan Tier:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Developer (Free)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>Member Since:</span>
                  <span style={{ color: '#cbd5e1' }}>Jan 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>Last Sync:</span>
                  <span style={{ color: '#cbd5e1' }}>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Stats Grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Pipeline Statistics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              
              {/* Stat 1 */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{savedWorkflows.length}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Pipelines Created</div>
              </div>

              {/* Stat 2 */}
              <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{currentNodes.length}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Active Nodes</div>
              </div>

              {/* Stat 3 */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>23</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Runs Completed</div>
              </div>

              {/* Stat 4 */}
              <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {savedWorkflows.length > 0 ? savedWorkflows[0].name : 'None'}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Last Edited Flow</div>
              </div>

            </div>
          </div>

          {/* Row 3: Saved Workflows / Recent Pipelines */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Saved Workflows / Recent Pipelines
            </div>
            
            <div 
              style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
            >
              {savedWorkflows.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                  No saved workflows found. Create and save a pipeline to view it here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {savedWorkflows.map((flow) => (
                    <div 
                      key={flow.name}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {flow.name}
                            <span 
                              style={{ 
                                display: 'inline-block', 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: flow.active ? '#10b981' : '#f59e0b',
                                boxShadow: flow.active ? '0 0 8px #10b981' : 'none'
                              }}
                              title={flow.active ? "Automation Active" : "Automation Paused/Stopped"}
                            ></span>
                          </div>
                          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                            {flow.nodeCount} nodes • {flow.edgeCount} connections • <span style={{ color: flow.active ? '#10b981' : '#f59e0b', fontWeight: 500 }}>{flow.active ? 'Active' : 'Stopped'}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="submit-button"
                          onClick={() => handleOpenWorkflow(flow.name)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8',
                            height: '24px'
                          }}
                        >
                          Quick Open
                        </button>

                        <button 
                          className="submit-button"
                          onClick={() => handleToggleActive(flow.name, flow.active)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            background: flow.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            border: flow.active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                            color: flow.active ? '#f59e0b' : '#10b981',
                            height: '24px'
                          }}
                        >
                          {flow.active ? 'Stop' : 'Start'}
                        </button>
                        
                        <button 
                          className="submit-button"
                          onClick={() => handleDeleteWorkflow(flow.name)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            height: '24px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      {dialog && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            e.stopPropagation();
            if (dialog.onCancel) dialog.onCancel();
            else setDialog(null);
          }} 
          style={{ zIndex: 100000 }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '360px' }}>
            <div className="modal-header">
              <h3>{dialog.onCancel ? 'Confirmation Required' : 'Notification'}</h3>
              <button 
                className="modal-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (dialog.onCancel) dialog.onCancel();
                  else setDialog(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {dialog.message}
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {dialog.onCancel && (
                <button 
                  className="submit-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    dialog.onCancel();
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    color: '#94a3b8',
                    padding: '8px 16px',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
              )}
              <button 
                className="submit-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (dialog.onConfirm) dialog.onConfirm();
                  else setDialog(null);
                }}
                style={{ 
                  background: dialog.onCancel ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                  border: dialog.onCancel ? '1px solid rgba(239, 68, 68, 0.4)' : 'none', 
                  color: dialog.onCancel ? '#f87171' : '#fff',
                  padding: '8px 16px',
                  fontSize: '12px'
                }}
              >
                {dialog.onCancel ? 'Delete' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
