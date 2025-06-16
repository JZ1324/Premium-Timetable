// Hook to provide sync status for Firestore integration
import { useState, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import FirestoreTimetableService from './firestoreTimetableService';
import { TimetableManager } from './timetableManager';
import timetableService from './timetableService';

export const useSyncStatus = () => {
    const { user } = useAuth();
    const [isFirestoreReady, setIsFirestoreReady] = useState(false);
    const [firestoreService, setFirestoreService] = useState(null);
    const [timetableManager, setTimetableManager] = useState(null);

    useEffect(() => {
        const initializeServices = async () => {
            if (user) {
                try {
                    console.log('🔥 Initializing sync status services...');
                    const db = getFirestore();
                    const firestoreService = new FirestoreTimetableService(db, user.uid);
                    const manager = new TimetableManager(firestoreService, timetableService);
                    
                    setFirestoreService(firestoreService);
                    setTimetableManager(manager);
                    
                    // Perform migration from localStorage to Firestore if needed
                    await manager.migrate();
                    
                    setIsFirestoreReady(true);
                    
                    console.log('✅ Sync status services initialized');
                } catch (error) {
                    console.error('❌ Error initializing sync status services:', error);
                    setIsFirestoreReady(false);
                }
            } else {
                // User logged out, reset services
                setFirestoreService(null);
                setTimetableManager(null);
                setIsFirestoreReady(false);
            }
        };

        initializeServices();
    }, [user]);

    return {
        isFirestoreReady,
        firestoreService,
        timetableManager
    };
};
