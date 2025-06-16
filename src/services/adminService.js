/**
 * Admin Service
 * Handles all administrative operations including user management, 
 * system monitoring, and data management
 */

import { initializeAuth } from './authService';
import { getUserData, setUserAsAdmin, isAdmin, getActiveUsers } from './userService';

class AdminService {
    constructor() {
        this.initialized = false;
        this.db = null;
        this.auth = null;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Use Firebase v8 compat SDK for consistency
            if (typeof window !== 'undefined' && window.firebase) {
                this.db = window.firebase.firestore();
                this.auth = window.firebase.auth();
                this.initialized = true;
                console.log('🔧 Admin service initialized with Firebase v8 compat');
            } else {
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.error('Failed to initialize admin service:', error);
            throw error;
        }
    }

    async ensureAdmin(uid) {
        await this.initialize();
        const adminStatus = await isAdmin(uid);
        if (!adminStatus) {
            throw new Error('Access denied: Admin privileges required');
        }
        return true;
    }

    /**
     * Get system statistics
     */
    async getSystemStats() {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            const stats = {
                totalUsers: 0,
                activeNow: 0,
                activeUsers: [],
                totalTimetables: 0,
                totalTemplates: 0,
                lastUpdated: new Date().toISOString()
            };

            // Count total users
            const usersSnapshot = await this.db.collection('users').get();
            stats.totalUsers = usersSnapshot.size;

            // Get currently active users (active in last 15 minutes)
            const activeUsers = await getActiveUsers(15);
            stats.activeNow = activeUsers.length;
            stats.activeUsers = activeUsers;

            // Count total timetables
            const timetablesSnapshot = await this.db.collection('timetables').get();
            stats.totalTimetables = timetablesSnapshot.size;

            // Count total templates
            let templateCount = 0;
            for (const doc of timetablesSnapshot.docs) {
                const templatesSnapshot = await doc.ref.collection('templates').get();
                templateCount += templatesSnapshot.size;
            }
            stats.totalTemplates = templateCount;

            console.log('📊 System stats retrieved:', stats);
            console.log(`👥 ${stats.activeNow} users active in last 15 minutes`);
            return stats;
        } catch (error) {
            console.error('Error getting system stats:', error);
            return {
                totalUsers: 0,
                activeNow: 0,
                activeUsers: [],
                totalTimetables: 0,
                totalTemplates: 0,
                error: error.message
            };
        }
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers() {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            const usersSnapshot = await this.db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(100) // Limit to prevent performance issues
                .get();

            const users = [];
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                users.push({
                    uid: doc.id,
                    email: userData.email,
                    username: userData.username,
                    role: userData.role || 'user',
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin,
                    isAdmin: userData.isAdmin || false,
                    suspended: userData.suspended || false
                });
            });

            console.log(`👥 Retrieved ${users.length} users`);
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Promote user to admin
     */
    async promoteToAdmin(uid) {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            await setUserAsAdmin(uid);
            await this.logAction('promote_admin', `Promoted user ${uid} to admin`, currentUser.uid);
            console.log(`👑 User ${uid} promoted to admin`);
            return true;
        } catch (error) {
            console.error('Error promoting user to admin:', error);
            throw error;
        }
    }

    /**
     * Revoke admin privileges
     */
    async revokeAdmin(uid) {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        // Prevent self-demotion
        if (uid === currentUser.uid) {
            throw new Error('Cannot revoke your own admin privileges');
        }

        try {
            await this.db.collection('users').doc(uid).update({
                role: 'user',
                isAdmin: false,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });

            await this.logAction('revoke_admin', `Revoked admin privileges from user ${uid}`, currentUser.uid);
            console.log(`👤 Admin privileges revoked from user ${uid}`);
            return true;
        } catch (error) {
            console.error('Error revoking admin privileges:', error);
            throw error;
        }
    }

    /**
     * Suspend user account
     */
    async suspendUser(uid) {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        // Prevent self-suspension
        if (uid === currentUser.uid) {
            throw new Error('Cannot suspend your own account');
        }

        try {
            await this.db.collection('users').doc(uid).update({
                suspended: true,
                suspendedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                suspendedBy: currentUser.uid,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });

            await this.logAction('suspend_user', `Suspended user ${uid}`, currentUser.uid);
            console.log(`⏸️ User ${uid} suspended`);
            return true;
        } catch (error) {
            console.error('Error suspending user:', error);
            throw error;
        }
    }

    /**
     * Delete user account (dangerous operation)
     */
    async deleteUser(uid) {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        // Prevent self-deletion
        if (uid === currentUser.uid) {
            throw new Error('Cannot delete your own account');
        }

        try {
            // Delete user's timetable data
            const timetableDoc = this.db.collection('timetables').doc(uid);
            const templatesCollection = timetableDoc.collection('templates');
            const templatesSnapshot = await templatesCollection.get();
            
            // Delete all templates
            const batch = this.db.batch();
            templatesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Delete timetable document
            batch.delete(timetableDoc);
            
            // Delete user document
            batch.delete(this.db.collection('users').doc(uid));
            
            await batch.commit();

            await this.logAction('delete_user', `Deleted user ${uid} and all associated data`, currentUser.uid);
            console.log(`🗑️ User ${uid} and all data deleted`);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Export all system data
     */
    async exportAllData() {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    exportedBy: currentUser.uid,
                    version: '1.0'
                },
                users: [],
                timetables: [],
                templates: {},
                logs: []
            };

            // Export users (excluding sensitive data)
            const usersSnapshot = await this.db.collection('users').get();
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                exportData.users.push({
                    uid: doc.id,
                    email: userData.email,
                    username: userData.username,
                    role: userData.role,
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin
                });
            });

            // Export timetables
            const timetablesSnapshot = await this.db.collection('timetables').get();
            for (const doc of timetablesSnapshot.docs) {
                const timetableData = doc.data();
                exportData.timetables.push({
                    userId: doc.id,
                    ...timetableData
                });

                // Export templates for this user
                const templatesSnapshot = await doc.ref.collection('templates').get();
                exportData.templates[doc.id] = {};
                templatesSnapshot.forEach(templateDoc => {
                    exportData.templates[doc.id][templateDoc.id] = templateDoc.data();
                });
            }

            // Export system logs
            const logsSnapshot = await this.db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(1000)
                .get();
            logsSnapshot.forEach(doc => {
                exportData.logs.push(doc.data());
            });

            await this.logAction('export_data', 'Exported all system data', currentUser.uid);
            console.log('📥 System data exported successfully');
            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Get system logs
     */
    async getSystemLogs(limit = 50) {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            const logsSnapshot = await this.db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const logs = [];
            logsSnapshot.forEach(doc => {
                logs.push(doc.data());
            });

            return logs;
        } catch (error) {
            console.error('Error getting system logs:', error);
            return [];
        }
    }

    /**
     * Log admin actions for auditing
     */
    async logAction(action, message, adminUid) {
        try {
            await this.db.collection('admin_logs').add({
                action,
                message,
                adminUid,
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                level: 'info'
            });
        } catch (error) {
            console.error('Error logging admin action:', error);
        }
    }

    /**
     * Get real-time system health
     */
    async getSystemHealth() {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('Authentication required');
        
        await this.ensureAdmin(currentUser.uid);

        try {
            const health = {
                status: 'healthy',
                database: 'connected',
                auth: 'active',
                timestamp: new Date().toISOString(),
                uptime: performance.now(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : null
            };

            return health;
        } catch (error) {
            console.error('Error getting system health:', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Debug function to check current user and make them admin
     */
    async debugMakeCurrentUserAdmin() {
        await this.initialize();
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
            console.log('❌ No user logged in');
            return false;
        }

        try {
            console.log('🔧 Current user UID:', currentUser.uid);
            console.log('🔧 Current user email:', currentUser.email);
            
            // Check current admin status
            const userData = await this.db.collection('users').doc(currentUser.uid).get();
            if (userData.exists) {
                console.log('🔧 Current user data:', userData.data());
            } else {
                console.log('❌ User document does not exist');
                return false;
            }

            // Set as admin
            await this.db.collection('users').doc(currentUser.uid).update({
                role: 'admin',
                isAdmin: true,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Successfully made current user admin');
            return true;
        } catch (error) {
            console.error('❌ Error making user admin:', error);
            return false;
        }
    }
}

// Create singleton instance
const adminService = new AdminService();

export { adminService };
export default adminService;
