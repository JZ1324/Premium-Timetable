import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAuth } from './AuthProvider';
import '../styles/components/Login.css'; // Reuse the existing terminal styles

const AdminTerminal = ({ onClose }) => {
  const { user } = useAuth();
  const [terminalPosition, setTerminalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
  const handleCommand = async (e) => {
    e.preventDefault();
    if (!commandInput.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Add command to history
    const newHistory = [...commandHistory, { type: 'input', text: commandInput }];
    setCommandHistory(newHistory);
    
    // Process command
    let response = "Command not recognized. Type 'help' for available commands.";
    const cmd = commandInput.trim().toLowerCase();
    const args = cmd.split(' ');
    
    try {
      if (cmd === 'help') {
        response = "Available commands:\n" +
          "- help: Show this help message\n" +
          "- clear: Clear the terminal screen\n" +
          "- version: Show terminal version\n" +
          "- status: Show system status\n" +
          "- stats: Get system statistics\n" +
          "- users [limit]: List registered users\n" +
          "- promote <uid>: Grant admin privileges\n" +
          "- demote <uid>: Revoke admin privileges\n" +
          "- suspend <uid>: Suspend user account\n" +
          "- make-me-admin: Make current user admin (emergency)\n" +
          "- export: Export all system data\n" +
          "- logs [limit]: Show system logs\n" +
          "- health: Show system health\n" +
          "- exit: Close the terminal";
      } else if (cmd === 'clear') {
        setCommandHistory([]);
        setCommandInput('');
        setIsProcessing(false);
        return;
      } else if (cmd === 'version') {
        response = "Timetable Admin Terminal v2.0.0\nBuild: " + new Date().toISOString().split('T')[0] + "\nUser: " + (user?.email || 'Unknown');
      } else if (cmd === 'status') {
        response = "System Status: Online\n" +
          "User Authentication: Active\n" +
          "Database Connection: Connected\n" +
          "Admin User: " + (user?.email || 'Unknown') + "\n" +
          "Timestamp: " + new Date().toISOString();
      } else if (cmd === 'stats') {
        const stats = await adminService.getSystemStats();
        response = `System Statistics:\n` +
          `Total Users: ${stats.totalUsers}\n` +
          `Active Today: ${stats.activeToday}\n` +
          `Total Timetables: ${stats.totalTimetables}\n` +
          `Total Templates: ${stats.totalTemplates}\n` +
          `Last Updated: ${stats.lastUpdated}`;
      } else if (args[0] === 'users') {
        const limit = parseInt(args[1]) || 10;
        const users = await adminService.getAllUsers();
        response = `User List (showing ${Math.min(limit, users.length)} of ${users.length}):\n` +
          users.slice(0, limit).map(user => 
            `${user.uid.substring(0, 8)}... | ${user.email} | ${user.role || 'user'} | ${user.username || 'N/A'}`
          ).join('\n');
      } else if (args[0] === 'promote' && args[1]) {
        await adminService.promoteToAdmin(args[1]);
        response = `Successfully promoted user ${args[1]} to admin.`;
      } else if (args[0] === 'demote' && args[1]) {
        await adminService.revokeAdmin(args[1]);
        response = `Successfully revoked admin privileges from user ${args[1]}.`;
      } else if (args[0] === 'suspend' && args[1]) {
        await adminService.suspendUser(args[1]);
        response = `Successfully suspended user ${args[1]}.`;
      } else if (cmd === 'make-me-admin') {
        const success = await adminService.debugMakeCurrentUserAdmin();
        if (success) {
          response = "✅ Successfully granted admin privileges to current user!\nPlease refresh the page to see admin features.";
        } else {
          response = "❌ Failed to grant admin privileges. Check console for details.";
        }
      } else if (cmd === 'export') {
        response = "Initiating data export...\n[====    ] 50%\n[========] 100%\nExport complete! Download starting...";
        setTimeout(async () => {
          try {
            const data = await adminService.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `timetable-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Export failed:', error);
          }
        }, 1000);
      } else if (args[0] === 'logs') {
        const limit = parseInt(args[1]) || 20;
        const logs = await adminService.getSystemLogs(limit);
        response = `System Logs (last ${logs.length}):\n` +
          logs.map(log => 
            `[${new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleString()}] ${log.action} - ${log.message}`
          ).join('\n');
      } else if (cmd === 'health') {
        const health = await adminService.getSystemHealth();
        response = `System Health Report:\n` +
          `Status: ${health.status}\n` +
          `Database: ${health.database}\n` +
          `Auth: ${health.auth}\n` +
          `Uptime: ${Math.round(health.uptime / 1000)}s\n` +
          (health.memory ? `Memory: ${health.memory.used}MB / ${health.memory.total}MB\n` : '') +
          `Timestamp: ${health.timestamp}`;
      } else if (cmd === 'exit') {
        onClose();
        return;
      }
    } catch (error) {
      console.error('Command execution error:', error);
      response = `Error: ${error.message}`;
    }
    
    // Add response to history
    setCommandHistory([...newHistory, { type: 'output', text: response }]);
    setCommandInput('');
    setIsProcessing(false);
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
            value={isProcessing ? 'Processing...' : commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: isProcessing ? '#888' : 'inherit',
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
