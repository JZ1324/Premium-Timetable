import React, { useState, useEffect } from 'react';
import { isNotificationSupported, requestNotificationPermission, sendTestNotification } from '../services/notificationService';

const NotificationTester = () => {
    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);
    const [testResult, setTestResult] = useState('');

    useEffect(() => {
        setIsSupported(isNotificationSupported());
        if (isNotificationSupported()) {
            setPermission(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        try {
            const granted = await requestNotificationPermission();
            setPermission(granted ? 'granted' : 'denied');
            setTestResult(granted ? 'Permission granted!' : 'Permission denied. Please enable in browser settings.');
        } catch (error) {
            setTestResult(`Error: ${error.message}`);
        }
    };

    const handleTestNotification = async () => {
        if (permission !== 'granted') {
            setTestResult('Please grant notification permission first.');
            return;
        }

        try {
            await sendTestNotification();
            setTestResult('Test notification sent! Check if you received it.');
        } catch (error) {
            setTestResult(`Failed to send test notification: ${error.message}`);
        }
    };

    const getStatusColor = () => {
        switch (permission) {
            case 'granted': return '#10b981';
            case 'denied': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getStatusIcon = () => {
        switch (permission) {
            case 'granted': return '✅';
            case 'denied': return '❌';
            default: return '⚠️';
        }
    };

    return (
        <div style={{
            padding: '20px',
            margin: '10px 0',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
            <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                🔔 Notification System Test
            </h3>

            <div style={{ marginBottom: '15px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px'
                }}>
                    <span style={{ 
                        fontSize: '18px',
                        color: getStatusColor()
                    }}>
                        {getStatusIcon()}
                    </span>
                    <strong>Browser Support:</strong> 
                    <span style={{ color: isSupported ? '#10b981' : '#ef4444' }}>
                        {isSupported ? 'Supported' : 'Not Supported'}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px'
                }}>
                    <span style={{ 
                        fontSize: '18px',
                        color: getStatusColor()
                    }}>
                        {getStatusIcon()}
                    </span>
                    <strong>Permission Status:</strong> 
                    <span style={{ 
                        color: getStatusColor(),
                        textTransform: 'capitalize'
                    }}>
                        {permission}
                    </span>
                </div>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '15px',
                flexWrap: 'wrap'
            }}>
                {permission !== 'granted' && (
                    <button
                        onClick={handleRequestPermission}
                        disabled={!isSupported}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: isSupported ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            opacity: isSupported ? 1 : 0.5
                        }}
                    >
                        Request Permission
                    </button>
                )}

                {permission === 'granted' && (
                    <button
                        onClick={handleTestNotification}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Send Test Notification
                    </button>
                )}
            </div>

            {testResult && (
                <div style={{
                    padding: '10px',
                    background: testResult.includes('Error') || testResult.includes('Failed') || testResult.includes('denied')
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: testResult.includes('Error') || testResult.includes('Failed') || testResult.includes('denied')
                        ? '#dc2626'
                        : '#059669'
                }}>
                    {testResult}
                </div>
            )}

            <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#1e40af'
            }}>
                <strong>💡 Tips:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Enable notifications in your browser settings for the best experience</li>
                    <li>On mobile, add this app to your home screen for better notification support</li>
                    <li>Check your device's notification settings if you don't receive notifications</li>
                </ul>
            </div>
        </div>
    );
};

export default NotificationTester;
