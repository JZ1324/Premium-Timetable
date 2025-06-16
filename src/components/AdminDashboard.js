import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import AdminTerminal from './AdminTerminal';
import { adminService } from '../services/adminService';
import '../styles/components/AdminDashboard.css';

const AdminDashboard = ({ onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [showTerminal, setShowTerminal] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [systemLogs, setSystemLogs] = useState([]);

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [statsData, usersData, logsData] = await Promise.all([
                adminService.getSystemStats(),
                adminService.getAllUsers(),
                adminService.getSystemLogs()
            ]);
            
            setStats(statsData);
            setUsers(usersData);
            setSystemLogs(logsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        try {
            switch (action) {
                case 'promote':
                    await adminService.promoteToAdmin(userId);
                    break;
                case 'demote':
                    await adminService.revokeAdmin(userId);
                    break;
                case 'suspend':
                    await adminService.suspendUser(userId);
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                        await adminService.deleteUser(userId);
                    }
                    break;
                default:
                    break;
            }
            await loadAdminData(); // Refresh data
        } catch (error) {
            console.error(`Error performing ${action} on user:`, error);
            alert(`Failed to ${action} user: ${error.message}`);
        }
    };

    const exportData = async () => {
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
            console.error('Error exporting data:', error);
            alert('Failed to export data');
        }
    };

    const renderOverview = () => (
        <div className="admin-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="stat-number">{stats.totalUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Active Now</h3>
                    <div className="stat-number">{stats.activeNow || 0}</div>
                    <div className="stat-subtitle">Last 15 minutes</div>
                </div>
                <div className="stat-card">
                    <h3>Timetables Created</h3>
                    <div className="stat-number">{stats.totalTimetables || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Templates Shared</h3>
                    <div className="stat-number">{stats.totalTemplates || 0}</div>
                </div>
            </div>
            
            <div className="dashboard-sections">
                <div className="recent-activity">
                    <h3>Currently Active Users</h3>
                    <div className="activity-list">
                        {stats.activeUsers && stats.activeUsers.length > 0 ? (
                            stats.activeUsers.map((user, index) => (
                                <div key={index} className="activity-item active-user">
                                    <span className="activity-user">{user.email}</span>
                                    <span className="activity-username">@{user.username || 'N/A'}</span>
                                    <span className="activity-time">
                                        {user.minutesAgo === 0 ? 'Just now' : 
                                         user.minutesAgo === 1 ? '1 min ago' : 
                                         user.minutesAgo < 60 ? `${user.minutesAgo} mins ago` :
                                         `${Math.floor(user.minutesAgo / 60)}h ${user.minutesAgo % 60}m ago`}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-activity">No users currently active</div>
                        )}
                    </div>
                </div>
                
                <div className="recent-activity">
                    <h3>Recent System Activity</h3>
                    <div className="activity-list">
                        {systemLogs.slice(0, 8).map((log, index) => (
                            <div key={index} className="activity-item">
                                <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                                <span className="activity-action">{log.action}</span>
                                <span className="activity-user">{log.userId}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="admin-users">
            <div className="users-header">
                <h3>User Management</h3>
                <button onClick={loadAdminData} className="refresh-btn">🔄 Refresh</button>
            </div>
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.uid}>
                                <td>{user.email}</td>
                                <td>{user.username || 'N/A'}</td>
                                <td>
                                    <span className={`role-badge ${user.role || 'user'}`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <div className="user-actions">
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleUserAction(user.uid, 'promote')}
                                                className="action-btn promote"
                                                title="Promote to Admin"
                                            >
                                                👑
                                            </button>
                                        )}
                                        {user.role === 'admin' && user.uid !== user.uid && (
                                            <button 
                                                onClick={() => handleUserAction(user.uid, 'demote')}
                                                className="action-btn demote"
                                                title="Remove Admin"
                                            >
                                                👤
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleUserAction(user.uid, 'suspend')}
                                            className="action-btn suspend"
                                            title="Suspend User"
                                        >
                                            ⏸️
                                        </button>
                                        <button 
                                            onClick={() => handleUserAction(user.uid, 'delete')}
                                            className="action-btn delete"
                                            title="Delete User"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSystem = () => (
        <div className="admin-system">
            <div className="system-actions">
                <h3>System Management</h3>
                <div className="action-buttons">
                    <button onClick={exportData} className="system-btn export">
                        📥 Export All Data
                    </button>
                    <button onClick={() => setShowTerminal(true)} className="system-btn terminal">
                        💻 Open Terminal
                    </button>
                    <button onClick={loadAdminData} className="system-btn refresh">
                        🔄 Refresh Data
                    </button>
                </div>
            </div>
            
            <div className="system-logs">
                <h3>System Logs</h3>
                <div className="logs-container">
                    {systemLogs.map((log, index) => (
                        <div key={index} className={`log-entry ${log.level || 'info'}`}>
                            <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="log-level">[{log.level?.toUpperCase() || 'INFO'}]</span>
                            <span className="log-message">{log.message || log.action}</span>
                            {log.userId && <span className="log-user">User: {log.userId}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-dashboard loading">
                <div className="loading-spinner">⏳ Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>🛠️ Admin Dashboard</h2>
                <div className="admin-user-info">
                    <span>Logged in as: {user?.email}</span>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`tab ${selectedTab === 'users' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('users')}
                >
                    👥 Users
                </button>
                <button 
                    className={`tab ${selectedTab === 'system' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('system')}
                >
                    ⚙️ System
                </button>
            </div>

            <div className="admin-content">
                {selectedTab === 'overview' && renderOverview()}
                {selectedTab === 'users' && renderUsers()}
                {selectedTab === 'system' && renderSystem()}
            </div>

            {showTerminal && (
                <AdminTerminal onClose={() => setShowTerminal(false)} />
            )}
        </div>
    );
};

export default AdminDashboard;
