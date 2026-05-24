import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { CustomNode } from './customNode';
import { useStore } from '../store';

const getGlobalKey = (modelName) => {
  if (!modelName) return '';
  if (modelName.includes('llama') || modelName.includes('groq')) {
    return localStorage.getItem('settings:groqApiKey') || '';
  } else if (modelName.includes('gpt')) {
    return localStorage.getItem('settings:openaiApiKey') || '';
  }
  return '';
};

const getLLMIcon = (selectedModel) => {
  if (!selectedModel) return null;
  const modelLower = selectedModel.toLowerCase();

  // 1. Google Gemini
  if (modelLower.includes('gemini')) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <defs>
          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#246BFD" />
            <stop offset="50%" stopColor="#8F51F2" />
            <stop offset="100%" stopColor="#FF4F6E" />
          </linearGradient>
        </defs>
        <path
          fill="url(#geminiGrad)"
          d="M9.5 2C9.5 6.14 6.14 9.5 2 9.5C6.14 9.5 9.5 12.86 9.5 17C9.5 12.86 12.86 9.5 17 9.5C12.86 9.5 9.5 6.14 9.5 2Z"
        />
        <path
          fill="url(#geminiGrad)"
          d="M19 13C19 15.21 17.21 17 15 17C17 17 19 18.79 19 21C19 18.79 20.79 17 23 17C20.79 17 19 15.21 19 13Z"
        />
      </svg>
    );
  }

  // 2. OpenAI GPT
  if (modelLower.includes('gpt')) {
    return (
      <svg viewBox="0 0 2406 2406" width="18" height="18" fill="none">
        <rect width="2406" height="2406" rx="400" fill="#10a37f" />
        <g fill="#fff">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              transform={`rotate(${deg} 1203 1203)`}
              d="M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z"
            />
          ))}
        </g>
      </svg>
    );
  }

  // 3. Anthropic Claude
  if (modelLower.includes('claude')) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          fill="#D97757"
          d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
      </svg>
    );
  }

  // 4. Grok (xAI)
  if (modelLower.includes('grok')) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <rect width="24" height="24" rx="4" fill="#000" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="monospace">
          g
        </text>
      </svg>
    );
  }

  // 5. Groq (Llama / Gemma models)
  if (modelLower.includes('llama') || modelLower.includes('groq')) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <defs>
          <linearGradient id="groqGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="4" fill="url(#groqGradient)" />
        <path fill="#fff" d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    );
  }

  // Fallback: Default brain/LLM logo
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path fill="#a855f7" d="M12 2c-.83 0-1.5.67-1.5 1.5v.5h-1v-.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5v.5H5.75C4.78 4 4 4.78 4 5.75v12.5C4 19.22 4.78 20 5.75 20H8v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V20h2v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V20h2.25c.97 0 1.75-.78 1.75-1.75V5.75C20 4.78 19.22 4 18.25 4H16v-.5c0-.83-.67-1.5-1.5-1.5S13 2.67 13 3.5v.5h-1v-.5C12 2.67 11.33 2 12 2zm-4.5 5h9v10h-9V7z" />
    </svg>
  );
};

const getIconContainerStyle = (selectedModel, isExpanded) => {
  if (!selectedModel) return {};
  const modelLower = selectedModel.toLowerCase();

  let baseColor = '168, 85, 247'; // Default purple
  if (modelLower.includes('gemini')) {
    baseColor = '36, 107, 253'; // Blue
  } else if (modelLower.includes('gpt')) {
    baseColor = '16, 163, 127'; // OpenAI green
  } else if (modelLower.includes('claude')) {
    baseColor = '217, 119, 87'; // Orange-brown
  } else if (modelLower.includes('grok')) {
    baseColor = '255, 255, 255'; // Grey/Black
  } else if (modelLower.includes('llama') || modelLower.includes('groq')) {
    baseColor = '249, 115, 22'; // Groq orange
  }

  return {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '6px',
    backgroundColor: isExpanded ? `rgba(${baseColor}, 0.2)` : `rgba(${baseColor}, 0.08)`,
    border: `1px solid rgba(${baseColor}, 0.25)`,
    transition: 'all 0.2s ease',
  };
};

export const LLMNode = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialFields = {
    model: data?.model || 'gpt-4o',
    apiKey: data?.apiKey || getGlobalKey(data?.model || 'gpt-4o'),
    prompt: data?.prompt || 'Write a warm, welcoming email for the new applicant using this form data: {{row_data}}'
  };

  // Sync with global settings when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (!data?.apiKey) {
        // We look at the model stored in Zustand, or fallback to default
        const currentModel = data?.model || 'gpt-4o';
        const globalKey = getGlobalKey(currentModel);
        if (globalKey) {
          updateNodeField(id, 'apiKey', globalKey);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [data?.model, data?.apiKey, id, updateNodeField]);

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

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-system`,
      style: { top: '30%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-prompt`,
      style: { top: '70%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-response`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title={isExpanded ? "LLM Model" : ""}
      initialFields={initialFields}
      handles={handles}
      className={`llm-node ${isExpanded ? "" : "collapsed-node"}`}
      style={{
        width: isExpanded ? '230px' : '54px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      icon={
        <div
          onClick={handleLogoClick}
          title="Click LLM Logo to expand/collapse settings"
          style={getIconContainerStyle(data?.model || initialFields.model, isExpanded)}
          className="sync-logo-btn"
        >
          {getLLMIcon(data?.model || initialFields.model)}
        </div>
      }
      renderContent={(fields, handleChange) => {
        if (!isExpanded) return null;

        const onModelChange = (e) => {
          const selectedModel = e.target.value;
          handleChange('model', selectedModel);

          // Auto-fill from global settings if model changes
          const globalKey = getGlobalKey(selectedModel);
          if (globalKey) {
            handleChange('apiKey', globalKey);
          }
        };

        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Model: <span style={{ color: '#fff', fontWeight: 500 }}>{fields.model}</span>
              </div>
              <div
                onClick={handleLogoClick}
                style={{ fontSize: '9px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#a855f7' }}></span>
                Click logo to collapse
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <div className="node-field">
                <label>
                  Model Type:
                  <select value={fields.model} onChange={onModelChange} className="connection-selector" style={{ width: '100%' }}>
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq - Free)</option>
                    <option value="llama-3.1-8b-instant">Llama 3.1 8B (Groq - Free)</option>
                    <option value="grok-2">Grok 2 (xAI)</option>
                    <option value="grok-beta">Grok Beta (xAI)</option>
                    <option value="grok-latest">Grok Latest (xAI)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5-Turbo (OpenAI)</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Google)</option>
                  </select>
                </label>
              </div>

              <div className="node-field">
                <label>
                  API Key:
                  <input
                    type="password"
                    value={fields.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    placeholder={
                      fields.model.includes('llama') || fields.model.includes('groq')
                        ? "gsk_..."
                        : fields.model.includes('grok')
                          ? "xai-..."
                          : "sk-..."
                    }
                  />
                </label>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {fields.model.includes('llama') || fields.model.includes('groq') ? (
                    <span>Get a <strong>Groq</strong> key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#a855f7' }}>console.groq.com</a></span>
                  ) : fields.model.includes('grok') ? (
                    <span>Get an <strong>xAI Grok</strong> key from <a href="https://console.x.ai/" target="_blank" rel="noreferrer" style={{ color: '#a855f7' }}>console.x.ai</a></span>
                  ) : (
                    <span>Get an OpenAI key from <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" style={{ color: '#a855f7' }}>platform.openai.com</a></span>
                  )}
                </div>
              </div>

              <div className="node-field">
                <label>
                  Prompt template:
                  <textarea
                    value={fields.prompt}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                    placeholder="Write prompt..."
                    rows={4}
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
                  background: '#a855f7',
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
                Config system & prompt inputs
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
