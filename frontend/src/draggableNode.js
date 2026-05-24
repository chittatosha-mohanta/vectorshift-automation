// draggableNode.js

export const DraggableNode = ({ type, label }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType }
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodeLogo = (nodeType) => {
    switch (nodeType) {
      case 'customInput':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        );
      case 'customOutput':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        );
      case 'llm':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path fill="#a855f7" d="M12 2c-.83 0-1.5.67-1.5 1.5v.5h-1v-.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5v.5H5.75C4.78 4 4 4.78 4 5.75v12.5C4 19.22 4.78 20 5.75 20H8v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V20h2v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V20h2.25c.97 0 1.75-.78 1.75-1.75V5.75C20 4.78 19.22 4 18.25 4H16v-.5c0-.83-.67-1.5-1.5-1.5S13 2.67 13 3.5v.5h-1v-.5C12 2.67 11.33 2 12 2zm-4.5 5h9v10h-9V7z" />
          </svg>
        );
      case 'text':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        );
      case 'prompt':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'code':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        );
      case 'database':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
          </svg>
        );
      case 'apiRequest':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        );
      case 'jsonParse':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5M8 3H3v5M16 21h5v-5M8 21H3v-5"></path>
          </svg>
        );
      case 'sheetsTrigger':
        return (
          <svg viewBox="0 0 64 88" width="14" height="14">
            <path d="M 42,0 64,22 53,24 42,22 40,11 Z" fill="#188038" />
            <path d="M 42,22 V 0 H 6 C 2.685,0 0,2.685 0,6 v 76 c 0,3.315 2.685,6 6,6 h 52 c 3.315,0 6,-2.685 6,-6 V 22 Z" fill="#34a853" />
            <path d="M 12,34 V 63 H 52 V 34 Z M 29.5,58 H 17 v -7 h 12.5 z m 0,-12 H 17 V 39 H 29.5 Z M 47,58 H 34.5 V 51 H 47 Z M 47,46 H 34.5 V 39 H 47 Z" fill="#fff" />
          </svg>
        );
      case 'gmail':
        return (
          <svg viewBox="52 42 88 66" width="14" height="14">
            <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
            <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
            <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
            <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
            <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${type} draggable-node`}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      style={{ 
        cursor: 'grab'
      }} 
      draggable
    >
      <div className="draggable-node-logo-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '16px' }}>
        {getNodeLogo(type)}
      </div>
      <span className="draggable-node-label">{label}</span>
    </div>
  );
};