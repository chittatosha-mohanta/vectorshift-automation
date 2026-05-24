import { useState, useEffect } from 'react';
import { useStore } from './store';

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const clearPipeline = useStore((state) => state.clearPipeline);
  const loadPipeline = useStore((state) => state.loadPipeline);

  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [savedPipelines, setSavedPipelines] = useState([]);
  const [selectedLoadName, setSelectedLoadName] = useState('');

  // Custom dialog state
  const [dialog, setDialog] = useState(null);
  const [dialogInput, setDialogInput] = useState('');

  // Sync dialogInput with defaultValue when prompt opens
  useEffect(() => {
    if (dialog && dialog.type === 'prompt') {
      setDialogInput(dialog.defaultValue || '');
    }
  }, [dialog]);

  // Promise-based wrappers for custom dialogs
  const showAlert = (message) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        message,
        onConfirm: () => {
          setDialog(null);
          resolve();
        }
      });
    });
  };

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  };

  const showPrompt = (message, defaultValue = '') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'prompt',
        message,
        defaultValue,
        onConfirm: (val) => {
          setDialog(null);
          resolve(val);
        },
        onCancel: () => {
          setDialog(null);
          resolve(null);
        }
      });
    });
  };

  // Load saved pipelines list on mount and keep in sync
  useEffect(() => {
    const loadList = () => {
      const list = [];
      let selectedStillExists = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('pipeline:')) {
          const name = key.replace('pipeline:', '');
          list.push(name);
          if (name === selectedLoadName) {
            selectedStillExists = true;
          }
        }
      }
      setSavedPipelines(list);
      if (selectedLoadName && !selectedStillExists) {
        setPipelineName('');
        setSelectedLoadName('');
      }
    };

    loadList();
    window.addEventListener('storage', loadList);
    return () => window.removeEventListener('storage', loadList);
  }, [selectedLoadName]);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error response');
      }

      const data = await response.json();
      
      // If we are currently editing a named pipeline, mark it as active in localStorage on submit
      if (pipelineName) {
        const dataStr = localStorage.getItem(`pipeline:${pipelineName}`);
        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          parsed.active = true;
          localStorage.setItem(`pipeline:${pipelineName}`, JSON.stringify(parsed));
          
          // Trigger global storage update to sync ProfileModal lists
          window.dispatchEvent(new Event('storage'));
        }
      }

      setModalData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error submitting pipeline:', error);
      showAlert('Error: Could not reach the backend server. Please verify uvicorn is running.');
    }
  };

  const handleSave = async () => {
    const name = await showPrompt("Enter a name for this pipeline:", pipelineName || "My Pipeline");
    if (name === null) return;
    
    const cleanName = name.trim();
    if (!cleanName) return;
    
    const payload = { nodes, edges };
    localStorage.setItem(`pipeline:${cleanName}`, JSON.stringify(payload));
    setPipelineName(cleanName);
    setSelectedLoadName(cleanName);
    
    // Update list
    if (!savedPipelines.includes(cleanName)) {
      setSavedPipelines([...savedPipelines, cleanName]);
    }
    
    // Trigger global storage update to sync dropdowns and profile lists
    window.dispatchEvent(new Event('storage'));
    showAlert(`Pipeline "${cleanName}" saved successfully!`);
  };

  const handleNew = async () => {
    const confirmed = await showConfirm("Are you sure you want to create a new pipeline? This will clear the current canvas.");
    if (confirmed) {
      clearPipeline();
      setPipelineName('');
      setSelectedLoadName('');
    }
  };

  const handleLoad = async (e) => {
    const name = e.target.value;
    setSelectedLoadName(name);
    if (!name) return;
    
    const dataStr = localStorage.getItem(`pipeline:${name}`);
    if (dataStr) {
      const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(dataStr);
      loadPipeline(loadedNodes, loadedEdges);
      setPipelineName(name);
      showAlert(`Pipeline "${name}" loaded successfully!`);
    }
  };

  return (
    <>
      <div className="submit-button-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        <button className="submit-button new-pipeline-btn" onClick={handleNew} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          Create New
        </button>

        <button className="submit-button save-pipeline-btn" onClick={handleSave} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: '#fff' }}>
          Save Pipeline {pipelineName ? `(${pipelineName})` : ''}
        </button>

        <select 
          value={selectedLoadName} 
          onChange={handleLoad} 
          className="connection-selector" 
          style={{ width: '160px', height: '40px', padding: '0 12px', fontSize: '12px' }}
        >
          <option value="">-- Load Saved --</option>
          {savedPipelines.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button className="submit-button" onClick={handleSubmit}>
          Submit Pipeline
        </button>
      </div>

      {isModalOpen && modalData && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pipeline Analysis</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-stat">
                <span className="stat-label">Total Nodes</span>
                <span className="stat-value">{modalData.num_nodes}</span>
              </div>
              <div className="modal-stat">
                <span className="stat-label">Total Connections</span>
                <span className="stat-value">{modalData.num_edges}</span>
              </div>
              <div className="modal-stat">
                <span className="stat-label">Flow Topology</span>
                <span className={`status-badge ${modalData.is_dag ? 'status-dag' : 'status-cycle'}`}>
                  {modalData.is_dag ? 'DAG (No Loops)' : 'Has Loop/Cycle'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setIsModalOpen(false)}>
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog && (
        <div className="modal-overlay" onClick={() => {
          if (dialog.type !== 'prompt' && dialog.type !== 'confirm') {
            dialog.onConfirm();
          } else if (dialog.onCancel) {
            dialog.onCancel();
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '360px' }}>
            <div className="modal-header">
              <h3>
                {dialog.type === 'prompt' && 'Save Pipeline'}
                {dialog.type === 'confirm' && 'Confirmation Required'}
                {dialog.type === 'alert' && 'Notification'}
              </h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  if (dialog.onCancel) dialog.onCancel();
                  else dialog.onConfirm();
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {dialog.message}
              </p>
              
              {dialog.type === 'prompt' && (
                <input
                  type="text"
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  placeholder="Pipeline name..."
                  autoFocus
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '8px',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm(dialogInput);
                    }
                  }}
                />
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {dialog.type !== 'alert' && (
                <button 
                  className="submit-button" 
                  onClick={dialog.onCancel}
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
                onClick={() => dialog.onConfirm(dialog.type === 'prompt' ? dialogInput : undefined)}
                style={{ 
                  background: dialog.type === 'confirm' ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                  border: dialog.type === 'confirm' ? '1px solid rgba(239, 68, 68, 0.4)' : 'none', 
                  color: dialog.type === 'confirm' ? '#f87171' : '#fff',
                  padding: '8px 16px',
                  fontSize: '12px'
                }}
              >
                {dialog.type === 'prompt' ? 'Save' : dialog.type === 'confirm' ? 'Proceed' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



