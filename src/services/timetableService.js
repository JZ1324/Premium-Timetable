// This file contains the timetable service logic for managing timetable data, including adding, editing, and deleting time slots.

class TimetableService {
    constructor() {
        // Initialize with default templates
        this.timeSlots = [];
        this.templates = {
            school: this.getSchoolTemplate(),
            empty: []
        };
        
        // Default recess and lunch times
        this.defaultBreakTimes = {
            recess: { startTime: '10:55am', endTime: '11:25am' },
            lunch: { startTime: '1:30pm', endTime: '2:25pm' }
        };

        // Load saved templates from localStorage if they exist
        const savedTemplates = localStorage.getItem('timetable-templates');
        if (savedTemplates) {
            try {
                const parsedTemplates = JSON.parse(savedTemplates);
                // Merge the saved templates with the default ones (don't override defaults)
                this.templates = { ...this.templates, ...parsedTemplates };
            } catch (error) {
                console.error('Error loading templates from localStorage:', error);
            }
        }
    }

    // Ensure recess and lunch periods are preserved during imports
    preserveBreakPeriods() {
        // Get existing breaks to keep their custom times if they exist
        const existingRecess = this.timeSlots.filter(slot => slot.subject === 'Recess');
        const existingLunch = this.timeSlots.filter(slot => slot.subject === 'Lunch');
        
        // Get all days in the timetable
        const days = [...new Set(this.timeSlots.map(slot => slot.day))];
        
        days.forEach(day => {
            // Check if this day already has a recess period
            const hasRecess = existingRecess.some(slot => slot.day === day);
            if (!hasRecess) {
                // Add default recess for this day
                this.timeSlots.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    day: day,
                    period: 'Recess',
                    subject: 'Recess',
                    code: '',
                    room: '',
                    teacher: '',
                    startTime: this.defaultBreakTimes.recess.startTime,
                    endTime: this.defaultBreakTimes.recess.endTime,
                    isBreakPeriod: true
                });
            } else {
                // Mark existing recess periods
                existingRecess
                    .filter(slot => slot.day === day)
                    .forEach(slot => {
                        slot.isBreakPeriod = true;
                    });
            }
            
            // Check if this day already has a lunch period
            const hasLunch = existingLunch.some(slot => slot.day === day);
            if (!hasLunch) {
                // Add default lunch for this day
                this.timeSlots.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    day: day,
                    period: 'Lunch',
                    subject: 'Lunch',
                    code: '',
                    room: '',
                    teacher: '',
                    startTime: this.defaultBreakTimes.lunch.startTime,
                    endTime: this.defaultBreakTimes.lunch.endTime,
                    isBreakPeriod: true
                });
            } else {
                // Mark existing lunch periods
                existingLunch
                    .filter(slot => slot.day === day)
                    .forEach(slot => {
                        slot.isBreakPeriod = true;
                    });
            }
        });
    }

    addTimeSlot(timeSlot) {
        this.timeSlots.push(timeSlot);
    }

    editTimeSlot(index, updatedTimeSlot) {
        if (index >= 0 && index < this.timeSlots.length) {
            console.log('[TimetableService] Editing time slot at index:', index);
            console.log('[TimetableService] Old time slot:', this.timeSlots[index]);
            console.log('[TimetableService] New time slot:', updatedTimeSlot);
            
            // Create a new object with the updated values
            this.timeSlots[index] = {
                ...this.timeSlots[index],  // Preserve any existing properties
                ...updatedTimeSlot         // Override with new values
            };
            
            console.log('[TimetableService] Updated slot:', this.timeSlots[index]);
        } else {
            console.error('[TimetableService] Invalid index for editTimeSlot:', index);
        }
    }

    deleteTimeSlot(index) {
        if (index >= 0 && index < this.timeSlots.length) {
            this.timeSlots.splice(index, 1);
        }
    }

    getTimeSlots() {
        // Create a copy of the time slots to avoid modifying the original data
        return this.timeSlots.map(slot => {
            // Create a new object with all the same properties
            const newSlot = {...slot};
            
            // If subject is PST (case-insensitive), display it properly in UI
            // Note: This doesn't modify the stored data, just what's returned to the UI
            if (newSlot.subject && newSlot.subject.trim().toUpperCase() === 'PST') {
                newSlot.displaySubject = 'Private Study';
            }
            
            return newSlot;
        });
    }

    clearTimetable() {
        this.timeSlots = [];
    }

    loadTemplate(templateName) {
        if (this.templates[templateName]) {
            this.timeSlots = JSON.parse(JSON.stringify(this.templates[templateName]));
            // Ensure recess and lunch periods are preserved
            this.preserveBreakPeriods();
            return true;
        }
        return false;
    }

    // Save current timetable as a new template
    saveAsTemplate(templateName) {
        this.templates[templateName] = JSON.parse(JSON.stringify(this.timeSlots));
        
        // Save templates to localStorage (excluding built-in templates)
        const templatesToSave = { ...this.templates };
        delete templatesToSave.school; // Don't save built-in templates
        delete templatesToSave.empty;
        localStorage.setItem('timetable-templates', JSON.stringify(templatesToSave));
    }

    // Delete a template
    deleteTemplate(templateName) {
        // Don't allow deletion of the default "school" template
        if (templateName === 'school') {
            return false;
        }
        
        if (this.templates[templateName]) {
            delete this.templates[templateName];
            
            // Update localStorage after deletion
            const templatesToSave = { ...this.templates };
            delete templatesToSave.school; // Don't save built-in templates
            delete templatesToSave.empty;
            localStorage.setItem('timetable-templates', JSON.stringify(templatesToSave));
            return true;
        }
        return false;
    }

    // Get all available template names
    getTemplateNames() {
        return Object.keys(this.templates);
    }

    // Get the school template with your specific timetable data
    getSchoolTemplate() {
        return [
            // Day 1
            { 
                day: 1, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 1, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            { 
                day: 1, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 1, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 1, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },
            { 
                day: 1, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 1, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 1, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'M 07', 
                teacher: 'Mr Will Harper' 
            },

            // Day 2
            { 
                day: 2, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 2, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },
            { 
                day: 2, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 2, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 2, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Active and Able', 
                code: '10AAA252109', 
                room: 'M 08', 
                teacher: 'Mr James Beattie' 
            },
            { 
                day: 2, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 2, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 2, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },

            // Day 3
            { 
                day: 3, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            { 
                day: 3, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 3, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 3, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 3, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Active and Able', 
                code: '10AAA252109', 
                room: 'C 07', 
                teacher: 'Mr James Beattie' 
            },
            { 
                day: 3, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'C 04', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 3, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 3, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },

            // Day 4
            { 
                day: 4, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            { 
                day: 4, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 4, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 4, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 4, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            { 
                day: 4, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Active and Able', 
                code: '10AAA252109', 
                room: 'M 08', 
                teacher: 'Mr James Beattie' 
            },
            { 
                day: 4, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 4, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: '10ybad01', 
                code: '10ybad01', 
                room: '', 
                teacher: 'Mrs Lindy Dowell' 
            },
            
            // Day 5
            { 
                day: 5, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'L 10', 
                teacher: 'Ms Ashanie Perera' 
            },
            { 
                day: 5, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            { 
                day: 5, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 5, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 5, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            { 
                day: 5, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'L 07', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 5, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 5, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            
            // Day 6
            { 
                day: 6, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 6, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'C 04', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 6, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 6, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 6, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },
            { 
                day: 6, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 6, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 6, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            
            // Day 7
            { 
                day: 7, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'C 04', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 7, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 7, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 7, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 7, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Active and Able', 
                code: '10AAA252109', 
                room: 'I 05', 
                teacher: 'Mr James Beattie' 
            },
            { 
                day: 7, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },
            { 
                day: 7, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 7, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            
            // Day 8
            { 
                day: 8, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            { 
                day: 8, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'C 04', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 8, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 8, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 8, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Private Study', 
                code: '10PST251009', 
                room: 'S 04', 
                teacher: 'Miss Georgia Kellock' 
            },
            { 
                day: 8, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 8, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 8, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Chemistry', 
                code: '10CHM252105', 
                room: 'S 03', 
                teacher: 'Ms Ashanie Perera' 
            },
            
            // Day 9
            { 
                day: 9, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'C 07', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 9, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            },
            { 
                day: 9, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 9, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 9, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            { 
                day: 9, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Active and Able', 
                code: '10AAA252109', 
                room: 'C 06', 
                teacher: 'Mr James Beattie' 
            },
            { 
                day: 9, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 9, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: '10ybad01', 
                code: '10ybad01', 
                room: '', 
                teacher: 'Mrs Lindy Dowell' 
            },
            
            // Day 10
            { 
                day: 10, 
                period: 1, 
                startTime: '8:35am', 
                endTime: '9:35am', 
                subject: 'Biology Units 1 & 2', 
                code: '11BIO252101', 
                room: 'S 06', 
                teacher: 'Mr Andrew Savage' 
            },
            { 
                day: 10, 
                period: 2, 
                startTime: '9:40am', 
                endTime: '10:40am', 
                subject: 'English', 
                code: '10ENG252107', 
                room: 'C 04', 
                teacher: 'Mr Will Harper' 
            },
            { 
                day: 10, 
                period: 'Tutorial', 
                startTime: '10:45am', 
                endTime: '10:55am', 
                subject: 'Tutorial', 
                code: '10TUT252009', 
                room: 'S 01', 
                teacher: 'Mrs Sula Tyndall' 
            },
            { 
                day: 10, 
                period: 'Recess', 
                startTime: '10:55am', 
                endTime: '11:25am', 
                subject: 'Recess', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 10, 
                period: 3, 
                startTime: '11:25am', 
                endTime: '12:25pm', 
                subject: 'Literature', 
                code: '10LIT252101', 
                room: 'I 03', 
                teacher: 'Miss Olivia Berry' 
            },
            { 
                day: 10, 
                period: 4, 
                startTime: '12:30pm', 
                endTime: '1:30pm', 
                subject: 'Psychology', 
                code: '10PSY252103', 
                room: 'L 10', 
                teacher: 'Ms Dianne McKenzie' 
            },
            { 
                day: 10, 
                period: 'Lunch', 
                startTime: '1:30pm', 
                endTime: '2:25pm', 
                subject: 'Lunch', 
                code: '', 
                room: '', 
                teacher: '',
                isBreakPeriod: true
            },
            { 
                day: 10, 
                period: 5, 
                startTime: '2:25pm', 
                endTime: '3:25pm', 
                subject: 'Mathematics - Advanced', 
                code: '10MAA252103', 
                room: 'M 06', 
                teacher: 'Mrs Leah Manning' 
            }
        ];
    }
}

export default new TimetableService();