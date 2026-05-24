import { useState, useEffect } from 'react';

export const SettingsModal = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState('integrations');

  // Integrations Settings State
  const [gmailSender, setGmailSender] = useState(localStorage.getItem('settings:gmailSender') || '');
  const [gmailAppPassword, setGmailAppPassword] = useState(localStorage.getItem('settings:gmailAppPassword') || '');
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('settings:groqApiKey') || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(localStorage.getItem('settings:openaiApiKey') || '');

  // Preferences Settings State
  const [darkMode, setDarkMode] = useState(localStorage.getItem('settings:darkMode') !== 'false'); // default true
  const [notifications, setNotifications] = useState(localStorage.getItem('settings:notifications') !== 'false');
  const [language, setLanguage] = useState(localStorage.getItem('settings:language') || 'en');
  const [autoSave, setAutoSave] = useState(localStorage.getItem('settings:autoSave') !== 'false');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFA, setTwoFA] = useState(localStorage.getItem('settings:2fa') === 'true');
  const [securityMessage, setSecurityMessage] = useState(null);
  const [dialog, setDialog] = useState(null);

  // Apply dark mode on settings change
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleSaveIntegrations = () => {
    localStorage.setItem('settings:gmailSender', gmailSender);
    localStorage.setItem('settings:gmailAppPassword', gmailAppPassword);
    localStorage.setItem('settings:groqApiKey', groqApiKey);
    localStorage.setItem('settings:openaiApiKey', openaiApiKey);
    
    // Broadcast storage event to notify other nodes to reload defaults
    window.dispatchEvent(new Event('storage'));
    
    setDialog({ message: 'Integrations saved successfully!' });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('settings:darkMode', darkMode);
    localStorage.setItem('settings:notifications', notifications);
    localStorage.setItem('settings:language', language);
    localStorage.setItem('settings:autoSave', autoSave);
    
    setDialog({ message: 'Preferences saved successfully!' });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSecurityMessage({ type: 'success', text: 'Password changed successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFA;
    setTwoFA(nextVal);
    localStorage.setItem('settings:2fa', nextVal);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '580px', 
          height: '420px', 
          display: 'flex', 
          flexDirection: 'row', 
          borderRadius: '16px' 
        }}
      >
        {/* Sidebar Nav */}
        <div 
          style={{ 
            width: '180px', 
            backgroundColor: 'rgba(15, 19, 34, 0.95)', 
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 0'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ padding: '0 16px 12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Settings Menu
            </div>
            
            <button 
              onClick={() => setActiveTab('integrations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: activeTab === 'integrations' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'integrations' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: activeTab === 'integrations' ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                borderLeft: activeTab === 'integrations' ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Credentials
            </button>

            <button 
              onClick={() => setActiveTab('preferences')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: activeTab === 'preferences' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'preferences' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: activeTab === 'preferences' ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                borderLeft: activeTab === 'preferences' ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Preferences
            </button>

            <button 
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: activeTab === 'security' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'security' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: activeTab === 'security' ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                borderLeft: activeTab === 'security' ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Security
            </button>

            <button 
              onClick={() => setActiveTab('about')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: activeTab === 'about' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'about' ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: activeTab === 'about' ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                borderLeft: activeTab === 'about' ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Developer Info
            </button>
          </div>

          <div style={{ padding: '0 16px' }}>
            <button 
              className="submit-button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '11px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f1322' }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600 }}>
              {activeTab === 'integrations' && 'API & Integration Credentials'}
              {activeTab === 'preferences' && 'SaaS Preferences'}
              {activeTab === 'security' && 'Security & Account'}
              {activeTab === 'about' && 'Social & Developer Links'}
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
              <>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                  Configure your credentials globally. Newly placed LLM and Gmail nodes will auto-fill with these values.
                </p>
                <div className="node-field">
                  <label style={{ fontSize: '11px', fontWeight: 500 }}>Gmail Sender Email</label>
                  <input 
                    type="email" 
                    value={gmailSender} 
                    onChange={(e) => setGmailSender(e.target.value)} 
                    placeholder="e.g. hr@company.com" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div className="node-field">
                  <label style={{ fontSize: '11px', fontWeight: 500 }}>Gmail App Password</label>
                  <input 
                    type="password" 
                    value={gmailAppPassword} 
                    onChange={(e) => setGmailAppPassword(e.target.value)} 
                    placeholder="16-character SMTP pass" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div className="node-field">
                  <label style={{ fontSize: '11px', fontWeight: 500 }}>Groq API Key (starts with gsk_)</label>
                  <input 
                    type="password" 
                    value={groqApiKey} 
                    onChange={(e) => setGroqApiKey(e.target.value)} 
                    placeholder="gsk_..." 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div className="node-field">
                  <label style={{ fontSize: '11px', fontWeight: 500 }}>OpenAI API Key (starts with sk-)</label>
                  <input 
                    type="password" 
                    value={openaiApiKey} 
                    onChange={(e) => setOpenaiApiKey(e.target.value)} 
                    placeholder="sk-..." 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <button 
                  className="submit-button"
                  onClick={handleSaveIntegrations}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '11px',
                    marginTop: '8px'
                  }}
                >
                  Save Credentials
                </button>
              </>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <>
                {/* Dark Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>Dark Mode</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Toggle application visual theme.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={(e) => setDarkMode(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {/* Email Notifications */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>Notification Alerts</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Send email alerts on automation trigger events.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={(e) => setNotifications(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {/* Auto Save */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>Auto-Save Layouts</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Automatically preserve layout configuration.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoSave} 
                    onChange={(e) => setAutoSave(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {/* Language Select */}
                <div className="node-field" style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 500 }}>System Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    className="connection-selector"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                  </select>
                </div>

                <button 
                  className="submit-button"
                  onClick={handleSavePreferences}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '11px',
                    marginTop: '8px'
                  }}
                >
                  Save Preferences
                </button>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <>
                {/* 2FA Placeholder */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Secure your developer portal.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={twoFA} 
                    onChange={handleToggle2FA} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', marginBottom: '4px' }}>Change Account Password</div>
                  
                  {securityMessage && (
                    <div style={{ fontSize: '10px', color: securityMessage.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                      {securityMessage.text}
                    </div>
                  )}

                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Current Password" 
                    className="connection-selector"
                    style={{ padding: '8px 12px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  />
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="New Password" 
                    className="connection-selector"
                    style={{ padding: '8px 12px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm New Password" 
                    className="connection-selector"
                    style={{ padding: '8px 12px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button 
                      type="submit"
                      className="submit-button"
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#818cf8',
                        padding: '6px 12px',
                        fontSize: '11px'
                      }}
                    >
                      Update Password
                    </button>

                    <button 
                      type="button"
                      className="submit-button"
                      onClick={onLogout}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '6px 12px',
                        fontSize: '11px'
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ABOUT / SOCIAL TAB */}
            {activeTab === 'about' && (
              <>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Connect with the developer, read documentation, or contribute to the VectorShift Automation studio suite.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {/* GitHub */}
                  <a 
                    href="https://github.com/chittatosha-mohanta" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>Follow on GitHub</span>
                  </a >

                  {/* LinkedIn */}
                  <a 
                    href="https://linkedin.com/in/chittatosha-mohanta" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a >

                  {/* Portfolio */}
                  <a 
                    href="https://chittatosha-mohanta.github.io" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Explore Portfolio Website</span>
                  </a >
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      {dialog && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            e.stopPropagation();
            setDialog(null);
          }} 
          style={{ zIndex: 100000 }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '360px' }}>
            <div className="modal-header">
              <h3>Notification</h3>
              <button 
                className="modal-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  setDialog(null);
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
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                className="submit-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setDialog(null);
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                  border: 'none', 
                  color: '#fff',
                  padding: '8px 16px',
                  fontSize: '12px'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
