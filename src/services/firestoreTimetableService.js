// Firestore-enabled timetable service using v8 compat SDK
// This ensures compatibility with the existing auth service

class FirestoreTimetableService {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.cache = new Map(); // Local cache for better performance
        
        // Verify Firebase v8 compat SDK is available
        if (typeof window !== 'undefined' && window.firebase && window.firebase.firestore) {
            console.log('🔥 Using Firebase v8 compat SDK for Firestore');
        } else {
            console.warn('⚠️ Firebase v8 compat SDK not found, operations may fail');
        }
    }

    // Get user's timetable document reference
    getUserTimetableRef() {
        return this.db.collection('timetables').doc(this.userId);
    }

    // Get user's templates collection reference
    getUserTemplatesRef() {
        return this.db.collection('timetables').doc(this.userId).collection('templates');
    }

    /**
     * Save timetable data to Firestore
     */
    async saveTimetable(timetableData) {
        try {
            console.log('💾 Saving timetable to Firestore...');
            
            const timetableRef = this.getUserTimetableRef();
            const dataToSave = {
                timeSlots: timetableData.timeSlots || [],
                currentDay: timetableData.currentDay || 1,
                lastModified: window.firebase.firestore.FieldValue.serverTimestamp(),
                version: '1.0'
            };

            await timetableRef.set(dataToSave, { merge: true });
            
            // Update cache
            this.cache.set('timetable', dataToSave);
            
            console.log('✅ Timetable saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving timetable:', error);
            throw new Error(`Failed to save timetable: ${error.message}`);
        }
    }

    /**
     * Load timetable data from Firestore
     */
    async loadTimetable() {
        try {
            console.log('📥 Loading timetable from Firestore...');
            
            // Check cache first
            if (this.cache.has('timetable')) {
                console.log('📋 Returning cached timetable');
                return this.cache.get('timetable');
            }

            const timetableRef = this.getUserTimetableRef();
            const docSnap = await timetableRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                this.cache.set('timetable', data);
                console.log('✅ Timetable loaded successfully');
                return data;
            } else {
                console.log('📝 No timetable found, returning empty structure');
                return {
                    timeSlots: [],
                    currentDay: 1,
                    lastModified: null
                };
            }
        } catch (error) {
            console.error('❌ Error loading timetable:', error);
            throw new Error(`Failed to load timetable: ${error.message}`);
        }
    }

    /**
     * Save a template to Firestore
     */
    async saveTemplate(templateName, templateData) {
        try {
            console.log(`💾 Saving template "${templateName}" to Firestore...`);
            
            const templateRef = this.getUserTemplatesRef().doc(templateName);
            const dataToSave = {
                name: templateName,
                timeSlots: templateData,
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                lastModified: window.firebase.firestore.FieldValue.serverTimestamp()
            };

            await templateRef.set(dataToSave);
            
            console.log(`✅ Template "${templateName}" saved successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving template "${templateName}":`, error);
            throw new Error(`Failed to save template: ${error.message}`);
        }
    }

    /**
     * Load all user templates from Firestore
     */
    async loadTemplates() {
        try {
            console.log('📥 Loading templates from Firestore...');
            
            const templatesRef = this.getUserTemplatesRef();
            const querySnapshot = await templatesRef.get();
            
            const templates = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                templates[doc.id] = data.timeSlots;
            });

            console.log(`✅ Loaded ${Object.keys(templates).length} templates`);
            return templates;
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            throw new Error(`Failed to load templates: ${error.message}`);
        }
    }

    /**
     * Delete a template from Firestore
     */
    async deleteTemplate(templateName) {
        try {
            console.log(`🗑️ Deleting template "${templateName}" from Firestore...`);
            
            const templateRef = this.getUserTemplatesRef().doc(templateName);
            await templateRef.delete();
            
            console.log(`✅ Template "${templateName}" deleted successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting template "${templateName}":`, error);
            throw new Error(`Failed to delete template: ${error.message}`);
        }
    }

    /**
     * Update specific time slots without replacing entire timetable
     */
    async updateTimeSlots(timeSlots) {
        try {
            console.log('🔄 Updating time slots in Firestore...');
            
            const timetableRef = this.getUserTimetableRef();
            await timetableRef.update({
                timeSlots: timeSlots,
                lastModified: window.firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update cache
            const cached = this.cache.get('timetable') || {};
            cached.timeSlots = timeSlots;
            cached.lastModified = new Date();
            this.cache.set('timetable', cached);
            
            console.log('✅ Time slots updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Error updating time slots:', error);
            throw new Error(`Failed to update time slots: ${error.message}`);
        }
    }

    /**
     * Clear cache (useful when switching users)
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * Check if user has any timetable data
     */
    async hasTimetableData() {
        try {
            const timetableRef = this.getUserTimetableRef();
            const docSnap = await timetableRef.get();
            return docSnap.exists && docSnap.data().timeSlots?.length > 0;
        } catch (error) {
            console.error('❌ Error checking timetable data:', error);
            return false;
        }
    }

    /**
     * Migrate localStorage data to Firestore
     */
    async migrateFromLocalStorage() {
        try {
            console.log('🔄 Migrating data from localStorage to Firestore...');
            
            // Check if user already has Firestore data
            if (await this.hasTimetableData()) {
                console.log('⏭️ User already has Firestore data, skipping migration');
                return false;
            }

            // Get data from localStorage
            const savedTimetable = localStorage.getItem('timetable-data');
            const savedTemplates = localStorage.getItem('timetable-templates');

            let migrated = false;

            // Migrate timetable data
            if (savedTimetable) {
                try {
                    const timetableData = JSON.parse(savedTimetable);
                    await this.saveTimetable(timetableData);
                    migrated = true;
                    console.log('✅ Timetable data migrated');
                } catch (error) {
                    console.error('❌ Error migrating timetable data:', error);
                }
            }

            // Migrate templates
            if (savedTemplates) {
                try {
                    const templates = JSON.parse(savedTemplates);
                    for (const [name, data] of Object.entries(templates)) {
                        await this.saveTemplate(name, data);
                    }
                    migrated = true;
                    console.log('✅ Templates migrated');
                } catch (error) {
                    console.error('❌ Error migrating templates:', error);
                }
            }

            if (migrated) {
                console.log('🎉 Migration completed successfully!');
                // Optionally clear localStorage after successful migration
                // localStorage.removeItem('timetable-data');
                // localStorage.removeItem('timetable-templates');
            }

            return migrated;
        } catch (error) {
            console.error('❌ Error during migration:', error);
            return false;
        }
    }
}

export default FirestoreTimetableService;
