// Helper to integrate Firestore timetable service with existing code
export class TimetableManager {
    constructor(firestoreService, localService) {
        this.firestoreService = firestoreService;
        this.localService = localService;
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncToFirestore();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Save timetable with fallback to localStorage when offline
     */
    async saveTimetable(timetableData) {
        if (this.isOnline) {
            try {
                await this.firestoreService.saveTimetable(timetableData);
                // Also save locally as backup
                this.localService.saveTimetableToLocalStorage(timetableData);
                return true;
            } catch (error) {
                console.warn('Firestore save failed, falling back to localStorage:', error);
                this.localService.saveTimetableToLocalStorage(timetableData);
                return false;
            }
        } else {
            // Offline: save to localStorage
            this.localService.saveTimetableToLocalStorage(timetableData);
            return false;
        }
    }

    /**
     * Load timetable with fallback to localStorage
     */
    async loadTimetable() {
        if (this.isOnline) {
            try {
                return await this.firestoreService.loadTimetable();
            } catch (error) {
                console.warn('Firestore load failed, falling back to localStorage:', error);
                return this.localService.loadTimetableFromLocalStorage();
            }
        } else {
            return this.localService.loadTimetableFromLocalStorage();
        }
    }

    /**
     * Sync localStorage data to Firestore when online
     */
    async syncToFirestore() {
        if (!this.isOnline) return;

        try {
            // Check if there's newer data in localStorage that needs syncing
            const localData = this.localService.loadTimetableFromLocalStorage();
            if (localData && localData.timeSlots && localData.timeSlots.length > 0) {
                await this.firestoreService.saveTimetable(localData);
                console.log('✅ Local data synced to Firestore');
            }
        } catch (error) {
            console.error('❌ Error syncing to Firestore:', error);
        }
    }

    /**
     * Perform initial migration from localStorage to Firestore
     */
    async migrate() {
        if (this.isOnline) {
            return await this.firestoreService.migrateFromLocalStorage();
        }
        return false;
    }
}
