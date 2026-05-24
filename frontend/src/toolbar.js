// toolbar.js

import { useState, useRef, useEffect } from 'react';
import { DraggableNode } from './draggableNode';
import { useStore } from './store';

export const PipelineToolbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

  const connectionType = useStore((state) => state.connectionType);
  const setConnectionType = useStore((state) => state.setConnectionType);

  const permanentNodes = [
    { type: 'customInput', label: 'Input' },
    { type: 'llm', label: 'LLM' },
    { type: 'customOutput', label: 'Output' },
    { type: 'text', label: 'Text' },
  ];

  const searchableNodes = [
    { type: 'prompt', label: 'Prompt Template' },
    { type: 'code', label: 'Code Executor' },
    { type: 'database', label: 'Database Query' },
    { type: 'apiRequest', label: 'API Request' },
    { type: 'jsonParse', label: 'JSON Parser' },
    { type: 'sheetsTrigger', label: 'Google Sheets Trigger' },
    { type: 'gmail', label: 'Gmail Send' },
  ];

  const filteredSearchNodes = searchableNodes.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="pipeline-toolbar-container">
      <div className="pipeline-toolbar-header">
        <div className="pipeline-toolbar-title">Drag & Drop Nodes</div>
      </div>
      
      <div className="pipeline-toolbar-nodes">
        <div className="pipeline-toolbar-nodes-left">
          {permanentNodes.map((node) => (
            <DraggableNode key={node.type} type={node.type} label={node.label} />
          ))}
        </div>

        <div className="pipeline-toolbar-controls">
          <div className="connection-selector-wrapper">
            <span className="selector-label">Line Style:</span>
            <select
              className="connection-selector"
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
            >
              <option value="smoothstep">Smooth Step</option>
              <option value="default">Bezier Curve</option>
              <option value="straight">Straight</option>
              <option value="step">Step</option>
            </select>
          </div>

          <div className="pipeline-toolbar-search-wrapper" ref={dropdownRef}>

          {isSearchOpen && (
            <input
              type="text"
              className="pipeline-toolbar-search-input"
              placeholder="Search custom nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          )}
          <button 
            className={`pipeline-toolbar-search-btn ${isSearchOpen ? 'active' : ''}`}
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
            title="Search Custom Nodes"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className="search-btn-label">Custom Nodes</span>
          </button>

          {isSearchOpen && (
            <div className="pipeline-toolbar-dropdown">
              <div className="dropdown-title">Custom Nodes</div>
              <div className="dropdown-nodes-list">
                {filteredSearchNodes.length > 0 ? (
                  filteredSearchNodes.map((node) => (
                    <DraggableNode key={node.type} type={node.type} label={node.label} />
                  ))
                ) : (
                  <div className="dropdown-no-results">
                    No custom nodes match
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};



