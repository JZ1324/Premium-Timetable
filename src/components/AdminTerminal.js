import React, { useState, useEffect } from 'react';
import '../styles/components/Login.css'; // Reuse the existing terminal styles

const AdminTerminal = ({ onClose }) => {
  const [terminalPosition, setTerminalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  
  // Set initial welcome message
  useEffect(() => {
    setCommandHistory([
      { 
        type: 'output', 
        text: "Welcome to the Timetable Admin Terminal v1.0.0\n" +
              "Type 'help' to see available commands.\n" +
              "----------------------------------------------------------------\n" +
              "WARNING: This terminal provides administrative access.\n" +
              "All commands are logged and monitored.\n" +
              "----------------------------------------------------------------"
      }
    ]);
  }, []);

  // Function to handle mouse down for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - terminalPosition.x,
      y: e.clientY - terminalPosition.y
    });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      setTerminalPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Handle command execution
  const handleCommand = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    // Add command to history
    const newHistory = [...commandHistory, { type: 'input', text: commandInput }];
    
    // Process command
    let response = "Command not recognized. Type 'help' for available commands.";
    const cmd = commandInput.trim().toLowerCase();
    
    if (cmd === 'help') {
      response = "Available commands:\n" +
        "- help: Show this help message\n" +
        "- clear: Clear the terminal screen\n" +
        "- version: Show terminal version\n" +
        "- status: Show system status\n" +
        "- users: List registered users (future feature)\n" +
        "- grant-admin [username]: Grant admin privileges (future feature)\n" +
        "- revoke-admin [username]: Revoke admin privileges (future feature)\n" +
        "- export-data: Export all timetable data (future feature)\n" +
        "- restart: Simulate system restart\n" +
        "- exit: Close the terminal";
    } else if (cmd === 'clear') {
      setCommandHistory([]);
      setCommandInput('');
      return;
    } else if (cmd === 'version') {
      response = "Timetable Admin Terminal v1.0.0\nBuild: 20250514.1";
    } else if (cmd === 'status') {
      response = "System Status: Online\nUser Authentication: Active\nDatabase Connection: Connected\nLast Backup: 2025-05-14T08:30:00Z\nActive Users: 42";
    } else if (cmd === 'restart') {
      response = "Initiating system restart...\n" +
        "[====                ] 20%\n" +
        "[========            ] 40%\n" +
        "[============        ] 60%\n" +
        "[================    ] 80%\n" +
        "[====================] 100%\n" +
        "System restarted successfully!";
    } else if (cmd === 'exit') {
      onClose();
      return;
    } else if (cmd.startsWith('users')) {
      response = "Access to user database pending authentication. Please implement API in future update.";
    } else if (cmd.startsWith('grant-admin') || cmd.startsWith('revoke-admin')) {
      response = "User permission management will be available in the next update.";
    } else if (cmd === 'export-data') {
      response = "Data export feature will be available in a future update.";
    }
    
    // Add response to history
    setCommandHistory([...newHistory, { type: 'output', text: response }]);
    setCommandInput('');
  };

  return (
    <div 
      className="admin-terminal-container"
      style={{ 
        position: 'fixed',
        top: `calc(50% + ${terminalPosition.y}px)`, 
        left: `calc(50% + ${terminalPosition.x}px)`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'auto',
        zIndex: 1000,
        width: '500px',
        height: '350px'
      }}
    >
      <div 
        className="terminal_toolbar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'grab' }}
      >
        <div className="butt">
          <button 
            className="btn btn-color" 
            onClick={onClose}
          ></button>
          <button className="btn"></button>
          <button className="btn"></button>
        </div>
        <p className="user">Admin Terminal: ~</p>
        <div className="add_tab">+</div>
      </div>
      <div className="terminal_body" style={{ height: 'calc(100% - 30px)', overflow: 'auto' }}>
        {commandHistory.map((entry, index) => (
          <div key={index} className="terminal_line">
            {entry.type === 'input' ? (
              <div className="terminal_promt">
                <span className="terminal_user">Admin:</span>
                <span className="terminal_location">~</span>
                <span className="terminal_bling">$</span>
                <span className="terminal_command">{entry.text}</span>
              </div>
            ) : (
              <div className="terminal_output">{entry.text}</div>
            )}
          </div>
        ))}
        <form onSubmit={handleCommand} style={{ display: 'flex' }}>
          <div className="terminal_promt">
            <span className="terminal_user">Admin:</span>
            <span className="terminal_location">~</span>
            <span className="terminal_bling">$</span>
          </div>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              outline: 'none',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default AdminTerminal;
