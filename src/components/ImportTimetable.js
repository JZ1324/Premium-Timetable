import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/ImportTimetable.css';
import '../styles/components/AIParser.css';
import '../styles/components/LoadingUI.css';
// Import the advanced multi-model parser with fallback
import { parseWithModelFallback, MODELS } from '../services/multiModelParser';
import { getTogetherApiKey } from '../utils/apiKeyManager';
import parseJsonTimetable from './parseJsonTimetable';
import { enhanceTimetableData } from '../utils/classDataEnhancer';
import LoadingUI from './LoadingUI';
import ImportTutorialPopup from './ImportTutorialPopup';

const ImportTimetable = ({ onImport, onCancel }) => {
    const [importText, setImportText] = useState('');
    const [parseError, setParseError] = useState(null);
    const [parseSuccess, setParseSuccess] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('paste');
    const [aiParserResult, setAiParserResult] = useState(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const modalRef = useRef(null);
    
    // Helper function to handle timetable data import
    const importData = (data) => {
        if (!data) return;
        
        // Apply smooth animation before importing
        if (modalRef.current) {
            const isMobile = window.innerWidth < 768;
            const animationDuration = isMobile ? 0.25 : 0.3;
            const timeoutDuration = isMobile ? 240 : 280;
            
            // Animate modal and content
            modalRef.current.style.animation = `importFadeOut ${animationDuration}s ease forwards`;
            const contentDiv = modalRef.current.querySelector('.import-timetable-content');
            if (contentDiv) {
                contentDiv.style.animation = `importSlideDown ${animationDuration}s ease forwards`;
            }
            
            // After animation completes, call the onImport callback
            setTimeout(() => onImport(data), timeoutDuration);
        } else {
            onImport(data);
        }
    };
    
    // Function to ensure modal is optimally positioned in viewport, accounting for header
    const adjustModalPosition = (forceScroll = false) => {
        if (!modalRef.current) return;
        
        // Get the modal's bounding rectangle
        const modalRect = modalRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Get header height - find the header element and get its height
        const headerElement = document.querySelector('.header');
        const headerHeight = headerElement ? headerElement.offsetHeight : 0;
        
        // Check if we're on mobile (narrower viewport)
        const isMobile = viewportWidth < 768;
        
        // Calculate the available space (viewport minus header)
        const availableHeight = viewportHeight - headerHeight;
        const availableTop = headerHeight;
        
        // Logic to determine ideal position
        if (modalRect.height > availableHeight) {
            // If modal is taller than available space, position just below header
            window.scrollTo({
                top: window.scrollY + modalRect.top - headerHeight - (isMobile ? 10 : 20) + 150,
                behavior: 'smooth'
            });
        } else {
            // Try to center the modal in the available space (between header and bottom of viewport)
            const idealTop = Math.max(headerHeight + (availableHeight - modalRect.height) / 2, headerHeight + 20) - 120;
            const currentTop = modalRect.top;
            
            // Determine if scrolling is needed
            const isOutOfView = 
                modalRect.bottom > viewportHeight || 
                modalRect.top < headerHeight ||
                Math.abs(currentTop - idealTop) > (isMobile ? 30 : 50);
            
            // Only scroll if needed or if forceScroll is true
            if (isOutOfView || forceScroll) {
                window.scrollTo({
                    top: window.scrollY + (currentTop - idealTop) - 120,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    useEffect(() => {
        // Prevent scrolling on the body when modal is open
        document.body.style.overflowY = 'hidden';
        document.body.classList.add('modal-open');
        
        // Get the header element and its height
        const headerElement = document.querySelector('.header');
        const headerHeight = headerElement ? headerElement.offsetHeight : 0;
        
        // Update the CSS variable to match the actual header height for better positioning
        if (modalRef.current && headerHeight > 0) {
            modalRef.current.style.setProperty('--actual-header-height', `${headerHeight}px`);
        }
        
        // Auto-scroll to ensure modal is completely visible after a slight delay for rendering
        // Force scroll when first opening the modal
        setTimeout(() => adjustModalPosition(true), 100);
        
        // Also adjust position on window resize and scroll (for dynamic header size changes)
        window.addEventListener('resize', adjustModalPosition);
        window.addEventListener('scroll', handleScroll);

        
        // Function to handle scroll events, which might affect header height
        function handleScroll() {
            // Only adjust if the header might have changed
            const currentHeaderElement = document.querySelector('.header');
            const currentHeaderHeight = currentHeaderElement ? currentHeaderElement.offsetHeight : 0;
            
            if (Math.abs(currentHeaderHeight - headerHeight) > 5) {
                // Header height has changed significantly, update and adjust
                if (modalRef.current) {
                    modalRef.current.style.setProperty('--actual-header-height', `${currentHeaderHeight}px`);
                }
                adjustModalPosition(false);
            }
        }
        
        return () => {
            // Restore scrolling when modal is closed
            document.body.style.overflow = '';
            document.body.style.overflowY = '';
            document.body.style.height = '';
            document.body.style.minHeight = '';
            document.body.style.position = '';
            document.body.classList.remove('modal-open');
            window.removeEventListener('resize', adjustModalPosition);
            window.removeEventListener('scroll', handleScroll);
            
            // Reset any animations
            if (modalRef.current) {
                modalRef.current.style.animation = '';
                const contentDiv = modalRef.current.querySelector('.import-timetable-content');
                if (contentDiv) {
                    contentDiv.style.animation = '';
                }
            }
        };
    }, []);

    // Check if it's the user's first time importing and show tutorial
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('import-tutorial-seen');
        if (!hasSeenTutorial) {
            // Small delay to let the modal render first
            setTimeout(() => {
                setShowTutorial(true);
            }, 500);
        }
    }, []);

    // Tutorial event handlers
    const handleCloseTutorial = () => {
        console.log('handleCloseTutorial called');
        setShowTutorial(false);
    };

    const handleDontShowTutorialAgain = () => {
        console.log('handleDontShowTutorialAgain called');
        localStorage.setItem('import-tutorial-seen', 'true');
        setShowTutorial(false);
    };

    const handleTextChange = (e) => {
        const newText = e.target.value;
        const textLengthChanged = Math.abs(newText.length - importText.length) > 100;
        
        setImportText(newText);
        setParseError(null);
        setParseSuccess(null);
        setParsedData(null);
        
        // If text length changed significantly (like pasting large content), 
        // adjust the modal position after a small delay and force scroll
        if (textLengthChanged) {
            setTimeout(() => adjustModalPosition(true), 1000);
        }
    };
    
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setParseError(null);
        setParseSuccess(null);
        setParsedData(null);
        setAiParserResult(null);
        
        // Re-adjust scroll position after tab change with slight delay for rendering
        // Force scroll since we're changing tabs
        setTimeout(() => adjustModalPosition(true), 100);
    };
    
    // Function to handle AI parsing using OpenRouter API with multi-model fallback
    const handleAiParse = async () => {
        try {
            if (!importText.trim()) {
                setParseError('Please enter timetable data to parse.');
                setIsAiProcessing(false); // Clear loading state
                return;
            }
            
            // Clear any previous errors and start the loading animation
            setIsAiProcessing(true);
            setParseError(null);
            setParseSuccess(null); // Clear any previous success messages
            
            // Get the preferred AI model from localStorage settings
            let preferredAIModel = 'auto'; // Default to auto
            try {
                const savedSettings = localStorage.getItem('timetable-settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    if (settings.preferredAIModel) {
                        preferredAIModel = settings.preferredAIModel;
                    }
                }
            } catch (err) {
                console.error('Error retrieving AI model settings:', err);
            }
            
            console.log(`Using preferred AI model provider: ${preferredAIModel}`);
            
            // Call the advanced multi-model parser service with automatic fallback and preferred provider
            const response = await parseWithModelFallback(importText.trim(), preferredAIModel);
            
            console.log("API Response:", response);
            
            // Process the result
            if (response.success && response.data) {
                // The parser function returns the parsed JSON directly
                const rawResult = response.data;
                
                if (rawResult && rawResult.days && rawResult.periods && rawResult.classes) {
                    // Enhance the raw data to convert class strings to structured objects
                    const enhancedResult = enhanceTimetableData(rawResult);
                    setAiParserResult(enhancedResult);
                    setParsedData(enhancedResult);
                    setParseError(null);
                    
                    // Format the JSON nicely for display
                    const formattedJson = JSON.stringify(enhancedResult, null, 2);
                    setImportText(formattedJson); // Replace the textarea content with the formatted JSON
                    
                    // Show which model was used in a small notification
                    const usedModel = response.usedModel || response.model || "Unknown model";
                    const modelName = usedModel.includes('/') ? usedModel.split('/')[1] : usedModel;
                    
                    // Add a success message with model info using the parseSuccess state
                    setParseError(null); // Clear any existing error
                    setParseSuccess(`✅ Successfully parsed using ${modelName}`);
                    
                    // Clear the success message after a few seconds
                    setTimeout(() => setParseSuccess(null), 3000);
                } else {
                    // Display the raw API response for debugging
                    setParseError(`API returned invalid data structure. Raw response: ${JSON.stringify(response.rawResponse).substring(0, 200)}...`);
                }
            } else {
                // Show the diagnostic error for debugging
                const errorMessage = response.error || 'Unknown error occurred';
                
                // If we have a diagnosis, use it to provide a more helpful message
                if (response.diagnosis) {
                    const diagnosisType = response.diagnosis.errorType;
                    const possibleCauses = response.diagnosis.possibleCauses || [];
                    const recommendations = response.diagnosis.recommendations || [];
                    
                    let errorDisplay = `AI parsing failed: ${errorMessage}\n\n`;
                    errorDisplay += `Diagnosis: ${diagnosisType}\n\n`;
                    
                    if (possibleCauses.length > 0) {
                        errorDisplay += "Possible causes:\n";
                        possibleCauses.forEach(cause => {
                            errorDisplay += `• ${cause}\n`;
                        });
                        errorDisplay += "\n";
                    }
                    
                    if (recommendations.length > 0) {
                        errorDisplay += "Recommendations:\n";
                        recommendations.forEach(rec => {
                            errorDisplay += `• ${rec}\n`;
                        });
                    }
                    
                    // Add information about model attempts if available
                    if (response.model || response.usedModel) {
                        const modelAttempted = response.model || response.usedModel;
                        errorDisplay += `\nModel attempted: ${modelAttempted}`;
                    }
                    
                    // Add special notice for authentication issues
                    if (diagnosisType === 'authentication') {
                        errorDisplay += '\n\n🔑 API KEY SETUP REQUIRED:\n';
                        errorDisplay += 'The AI parsing feature requires a valid OpenRouter API key.\n\n';
                        errorDisplay += 'Quick Setup:\n';
                        errorDisplay += '1. Visit https://openrouter.ai/ and create a free account\n';
                        errorDisplay += '2. Generate an API key in your dashboard\n';
                        errorDisplay += '3. Contact the app developer to update the API key\n';
                        errorDisplay += '4. Free tier includes access to multiple AI models\n\n';
                        errorDisplay += 'Alternative: You can manually format your timetable as JSON using the "Manual JSON" tab.\n\n';
                        errorDisplay += 'See AI_SETUP_GUIDE.md for detailed instructions.';
                    }
                    // Add special notice for school network issues if it might be a network restriction
                    else if (diagnosisType === 'authorization' || 
                        diagnosisType === 'network_restriction' || 
                        (errorMessage && errorMessage.includes('deepseek'))) {
                        errorDisplay += '\n\n⚠️ NETWORK RESTRICTION NOTICE: Your school network may be blocking access to certain AI services. ' +
                                       'If you need to use this feature, try using the app on a different network (home WiFi or mobile data).';
                    }
                    
                    setParseError(errorDisplay);
                } else {
                    // Fallback to basic error message with raw response
                    const rawResponse = response.rawResponse ? 
                        `\n\nRaw API Response: ${response.rawResponse.substring(0, 300)}...` : '';
                    
                    setParseError(`AI parsing failed: ${errorMessage}${rawResponse}`);
                }
                
                console.error('Invalid AI parser response:', response);
                setAiParserResult(null);
                setParsedData(null);
            }
        } catch (error) {
            console.error('Error parsing with OpenRouter API:', error);
            setParseError(`AI parsing error: ${error.message || 'Unknown error'}\n\nCheck the console for full details.`);
            setAiParserResult(null);
            setParsedData(null);
        } finally {
            setIsAiProcessing(false);
            setTimeout(() => adjustModalPosition(true), 100);
        }
    };

    const parseTimetableText = (text) => {
        try {
            setIsProcessing(true);
            
            // Split the text into lines and clean up any whitespace issues
            const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);
            
            // Check if we have enough lines to process
            if (lines.length < 3) {
                setParseError('Not enough data to parse. Please check your input format.');
                setIsProcessing(false);
                return null;
            }
            
            // First line contains the days (tab-separated)
            const dayHeaderRow = lines[0];
            
            // Extract days from tab-delimited header
            const days = dayHeaderRow.split('\t').map(day => day.trim()).filter(day => day);
            
            if (days.length < 2) {
                setParseError('Could not detect day columns. Please ensure your data has tab-separated day headers (Day 1, Day 2, etc.).');
                setIsProcessing(false);
                return null;
            }
            
            console.log(`Found ${days.length} days:`, days);
            
            // Validate that we have at least one period in the data
            const periodCount = lines.filter(line => line.match(/^(Period\s+\d+|Tutorial)$/i)).length;
            if (periodCount === 0) {
                setParseError('No periods found in the data. Please ensure your timetable includes period headers like "Period 1", "Period 2", "Tutorial", etc.');
                setIsProcessing(false);
                return null;
            }
            
            console.log(`Found ${periodCount} periods in the input data`);
            
            // DEBUG: Show all lines that match period patterns
            console.log('\n=== ALL PERIOD LINES DETECTED ===');
            lines.forEach((line, index) => {
                const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
                if (periodMatch) {
                    console.log(`Line ${index}: "${line}" - MATCHED as period`);
                }
            });
            console.log('=== END PERIOD LINES ===\n');
            
            // Initialize timetable data structure
            const timetableData = {
                days: days,
                periods: [],
                classes: {}
            };
            
            // Initialize days in classes object
            timetableData.days.forEach(day => {
                timetableData.classes[day] = {};
            });
            
            // Process remaining lines to extract periods and classes
            let rowIndex = 1;
            
            console.log(`\n=== STARTING MAIN PARSING LOOP ===`);
            console.log(`Total lines to process: ${lines.length}`);
            console.log(`Starting at rowIndex: ${rowIndex}`);
            
            while (rowIndex < lines.length) {
                const line = lines[rowIndex].trim();
                
                // Skip empty lines
                if (!line) {
                    console.log(`Skipping empty line at ${rowIndex}`);
                    rowIndex++;
                    continue;
                }
                
                console.log(`\n--- Processing line ${rowIndex}/${lines.length - 1}: "${line}" ---`);
                
                // Check if this is a period header (Period 1, Period 2, Tutorial, etc.)
                const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
                
                // DEBUG: Log every line check for period detection
                if (line.toLowerCase().includes('period') || line.toLowerCase().includes('tutorial')) {
                    console.log(`DEBUG: Checking potential period line ${rowIndex}: "${line}" - Match: ${!!periodMatch}`);
                    // Additional debug for Tutorial specifically
                    if (line.toLowerCase().includes('tutorial')) {
                        console.log(`🔍 TUTORIAL DEBUG: Line "${line}" - Exact match test: ${/^Tutorial$/i.test(line)}`);
                        console.log(`🔍 TUTORIAL DEBUG: Line length: ${line.length}, trimmed: "${line.trim()}"`);
                    }
                }
                
                if (periodMatch) {
                    const periodName = line;
                    console.log(`✅ FOUND PERIOD: ${periodName} at line ${rowIndex}`);
                    
                    // Special handling for Tutorial periods to ensure they're detected
                    if (periodName.toLowerCase().includes('tutorial')) {
                        console.log(`🎯 TUTORIAL PERIOD CONFIRMED: "${periodName}"`);
                    }
                    
                    // Skip duplicate Tutorial periods - only process the first one
                    const existingPeriod = timetableData.periods.find(p => p.name === periodName);
                    if (existingPeriod) {
                        console.log(`⚠️ Duplicate period detected: ${periodName} already exists, skipping...`);
                        rowIndex++;
                        continue;
                    }
                    
                    // Next line should contain the time range
                    let startTime = null;
                    let endTime = null;
                    
                    if (rowIndex + 1 < lines.length) {
                        const timeLine = lines[rowIndex + 1].trim();
                        console.log(`Checking time line: "${timeLine}"`);
                        // Look for time format like 8:35am–9:35am
                        const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                        
                        if (timeMatch) {
                            startTime = timeMatch[1];
                            endTime = timeMatch[2];
                            rowIndex++; // Skip the time line
                            console.log(`Found time range: ${startTime} - ${endTime}`);
                        } else {
                            console.log(`No time range found in "${timeLine}", checking if next line might be time...`);
                            // Special handling for Period 3: check if line after next is time
                            if (periodName === 'Period 3' && rowIndex + 2 < lines.length) {
                                const nextTimeLine = lines[rowIndex + 2]?.trim();
                                const nextTimeMatch = nextTimeLine?.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                                if (nextTimeMatch) {
                                    console.log(`Found Period 3 time on line ${rowIndex + 2}: "${nextTimeLine}"`);
                                    startTime = nextTimeMatch[1];
                                    endTime = nextTimeMatch[2];
                                    rowIndex += 2; // Skip both lines
                                } else {
                                    // Fallback to default times
                                    startTime = '11:25am';
                                    endTime = '12:25pm';
                                    console.log(`Using default time range for Period 3: ${startTime} - ${endTime}`);
                                }
                            }
                        }
                    }
                    
                    // Create period object
                    const currentPeriod = {
                        name: periodName,
                        startTime: startTime || '',
                        endTime: endTime || ''
                    };
                    
                    timetableData.periods.push(currentPeriod);
                    
                    // Initialize this period in each day's classes
                    timetableData.days.forEach(day => {
                        timetableData.classes[day][currentPeriod.name] = [];
                    });
                    
                    rowIndex++; // Move to the line after period/time
                    console.log(`Starting class data processing at line ${rowIndex} for ${periodName}`);
                    
                    // Now process class data for each day sequentially
                    // Each day has a 3-line cycle: subject, code, room/teacher
                    // Process all days for this period
                    
                    let dayIndex = 0;
                    
                    console.log(`📚 STARTING CLASS PROCESSING for ${periodName}`);
                    console.log(`  Expected days: ${days.length}`);
                    console.log(`  Current rowIndex: ${rowIndex}`);
                    console.log(`  Next few lines:`, lines.slice(rowIndex, rowIndex + 6));
                    
                    while (dayIndex < days.length && rowIndex + 2 < lines.length) {
                        // Check if we've hit the next period
                        // BUT: Don't treat "Tutorial" as a period header when we're already processing Tutorial period
                        const currentLine = lines[rowIndex];
                        const nextPeriodCheck = currentLine.match(/^(Period\s+\d+|Tutorial)$/i);
                        
                        // Special logic: If we're processing Tutorial period and see "Tutorial" subject line, that's normal
                        const isValidTutorialSubject = (
                            periodName.toLowerCase() === 'tutorial' && 
                            currentLine.toLowerCase() === 'tutorial'
                        );
                        
                        if (nextPeriodCheck && !isValidTutorialSubject) {
                            console.log(`  Hit next period at line ${rowIndex}: "${lines[rowIndex]}"`);
                            break;
                        }
                        
                        // Ensure we have enough lines for a complete 3-line entry
                        if (rowIndex + 2 >= lines.length) {
                            console.warn(`  Not enough lines remaining for day ${dayIndex + 1} (${days[dayIndex]}). Breaking.`);
                            break;
                        }
                        
                        const dayName = days[dayIndex];
                        const subjectLine = lines[rowIndex]?.trim() || '';
                        const codeLine = lines[rowIndex + 1]?.trim() || '';
                        const roomTeacherLine = lines[rowIndex + 2]?.trim() || '';
                        
                        console.log(`Processing ${periodName} for ${dayName}: (lines ${rowIndex}-${rowIndex + 2})`);
                        console.log(`Subject: "${subjectLine}"`);
                        console.log(`Code: "${codeLine}"`);
                        console.log(`Room/Teacher: "${roomTeacherLine}"`);
                        
                        // CRITICAL DEBUG: Check if we're accidentally hitting a period name in the subject line
                        // BUT allow "Tutorial" as subject name when we're processing a Tutorial period
                        if (subjectLine.match(/^(Period\s+\d+)$/i) || 
                           (subjectLine.match(/^Tutorial$/i) && periodName.toLowerCase() !== 'tutorial')) {
                            console.error(`🚨 CRITICAL: Found period name "${subjectLine}" in subject line at position ${rowIndex}! This should not happen during class processing.`);
                            console.error(`Current context: Processing ${periodName}, Day ${dayIndex + 1} (${dayName})`);
                            console.error(`This suggests the parser is out of sync. Breaking to prevent infinite loop.`);
                            break;
                        }
                        
                        // SPECIAL HANDLING FOR TUTORIAL PERIODS
                        if (periodName.toLowerCase() === 'tutorial') {
                            console.log(`🎯 Processing Tutorial period for ${dayName} (Day ${dayIndex + 1})`);
                            console.log(`  Current rowIndex: ${rowIndex}`);
                            console.log(`  SubjectLine: "${subjectLine}"`);
                            console.log(`  CodeLine: "${codeLine}"`);
                            console.log(`  RoomTeacherLine: "${roomTeacherLine}"`);
                            
                            // Check if we have malformed Tutorial data where course code appears first
                            if (subjectLine.match(/^\([^)]+\)$/)) {
                                // This looks like course code format - treat it as subject "Tutorial" with this code
                                console.log(`🔧 TUTORIAL FIX: Converting malformed "${subjectLine}" format to proper Tutorial entry`);
                                const tutorialSubject = 'Tutorial';
                                const tutorialCode = subjectLine.match(/\(([^)]+)\)/)?.[1] || '';
                                const tutorialRoomTeacher = codeLine; // The "code" line is actually room/teacher for tutorials
                                
                                // Parse room and teacher
                                let room = '';
                                let teacher = '';
                                if (tutorialRoomTeacher) {
                                    const roomMatch = tutorialRoomTeacher.match(/^([A-Z]\s+\d+)/);
                                    if (roomMatch) {
                                        room = roomMatch[1];
                                        const teacherText = tutorialRoomTeacher.replace(roomMatch[0], '').trim();
                                        const teacherMatch = teacherText.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                                        if (teacherMatch) {
                                            teacher = teacherMatch[0].trim();
                                        } else if (teacherText.length > 0) {
                                            teacher = teacherText;
                                        }
                                    } else {
                                        teacher = tutorialRoomTeacher;
                                    }
                                }
                                
                                const classEntry = {
                                    subject: tutorialSubject,
                                    code: tutorialCode,
                                    room: room,
                                    teacher: teacher,
                                    startTime: currentPeriod.startTime,
                                    endTime: currentPeriod.endTime
                                };
                                
                                timetableData.classes[dayName][currentPeriod.name].push(classEntry);
                                console.log(`Added FIXED Tutorial class for ${dayName}: ${tutorialSubject} (${tutorialCode}) - ${room} ${teacher}`);
                                
                                // Move to next day (only advance 2 lines since we used subjectLine and codeLine)
                                dayIndex++;
                                rowIndex += 2;
                                continue;
                            } else if (subjectLine.toLowerCase() === 'tutorial') {
                                // Normal Tutorial format: "Tutorial" subject, "(10TUT252009)" code, "S 01 Mrs Sula Tyndall" room/teacher
                                console.log(`✅ TUTORIAL NORMAL FORMAT: Processing standard Tutorial entry for ${dayName}`);
                                console.log(`  Subject: "${subjectLine}" (will be kept as "Tutorial")`);
                                console.log(`  Code: "${codeLine}"`);
                                console.log(`  Room/Teacher: "${roomTeacherLine}"`);
                                
                                // Continue with normal processing - don't skip or special-case this
                            } else {
                                // Other tutorial format: subject name, then code, then room/teacher
                                console.log(`📝 TUTORIAL CUSTOM FORMAT: Processing Tutorial with subject "${subjectLine}" for ${dayName}`);
                            }
                        }
                        
                        // Skip if no subject data for this day
                        if (!subjectLine) {
                            console.log(`No subject for ${dayName}, skipping...`);
                            dayIndex++;
                            rowIndex += 3;
                            continue;
                        }
                        
                        // Extract course code from parentheses like "(10PSY252103)"
                        let code = '';
                        const codeMatch = codeLine.match(/\(([^)]+)\)/);
                        if (codeMatch) {
                            code = codeMatch[1];
                            console.log(`  Extracted code: "${code}" from "${codeLine}"`);
                        } else {
                            console.log(`  No code found in: "${codeLine}"`);
                        }
                        
                        // Parse room and teacher from format like "C 07 Ms Dianne McKenzie" or "S 01 Mrs Sula Tyndall"
                        let room = '';
                        let teacher = '';
                        
                        if (roomTeacherLine) {
                            // Look for room pattern at the start (letter + number like "C 07", "S 01", "L 10", "M 06")
                            const roomMatch = roomTeacherLine.match(/^([A-Z]\s+\d+)/);
                            if (roomMatch) {
                                room = roomMatch[1];
                                // Extract teacher from the remainder
                                const teacherText = roomTeacherLine.replace(roomMatch[0], '').trim();
                                // More flexible teacher matching to handle variations
                                const teacherMatch = teacherText.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                                if (teacherMatch) {
                                    teacher = teacherMatch[0].trim();
                                } else if (teacherText.length > 0) {
                                    // Fallback: if there's text after room but no title, it might still be a teacher
                                    teacher = teacherText;
                                }
                            } else {
                                // If no room found, try to extract just the teacher
                                const teacherMatch = roomTeacherLine.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                                if (teacherMatch) {
                                    teacher = teacherMatch[0].trim();
                                } else {
                                    // If the whole line might be just a teacher name without title
                                    teacher = roomTeacherLine;
                                }
                            }
                        }
                        
                        // Create and add the class entry
                        const classEntry = {
                            subject: subjectLine,
                            code: code,
                            room: room,
                            teacher: teacher,
                            startTime: currentPeriod.startTime,
                            endTime: currentPeriod.endTime
                        };
                        
                        timetableData.classes[dayName][currentPeriod.name].push(classEntry);
                        
                        // Enhanced logging with period type indication
                        const logPrefix = periodName.toLowerCase() === 'tutorial' ? '🎯 TUTORIAL' : '📝';
                        console.log(`${logPrefix} Added class for ${dayName}: ${subjectLine} (${code}) - ${room} ${teacher}`);
                        
                        // Special confirmation for Tutorial classes
                        if (periodName.toLowerCase() === 'tutorial') {
                            console.log(`✅ TUTORIAL CLASS SUCCESSFULLY ADDED to ${dayName} ${periodName}`);
                        }
                        
                        // Move to next day
                        dayIndex++;
                        rowIndex += 3;
                    }
                    
                    // After processing all days for this period, log completion
                    console.log(`Completed processing ${periodName}, processed ${dayIndex} days`);
                    
                    // If we didn't process all days, there might be an issue
                    if (dayIndex < days.length) {
                        console.warn(`Warning: Only processed ${dayIndex} out of ${days.length} days for ${periodName}`);
                        console.warn(`Remaining line at rowIndex ${rowIndex}: "${lines[rowIndex] || 'END OF DATA'}"`);
                    }
                    
                    // Debug: Show current period's classes count
                    let periodClassCount = 0;
                    timetableData.days.forEach(day => {
                        periodClassCount += timetableData.classes[day][periodName].length;
                    });
                    console.log(`${periodName} total classes added: ${periodClassCount}`);
                } else {
                    // Skip lines that don't match expected format
                    rowIndex++;
                }
            }
            
            console.log(`Parsing complete. Found ${timetableData.periods.length} periods for ${timetableData.days.length} days.`);
            console.log(`Periods found:`, timetableData.periods.map(p => p.name));
            
            // ADD DEFAULT RECESS AND LUNCH PERIODS IF NOT PRESENT
            console.log('\n=== ADDING DEFAULT RECESS AND LUNCH PERIODS ===');
            console.log(`Current periods before adding defaults:`, timetableData.periods.map(p => p.name));
            
            // Always add Recess if not present - positioned after Tutorial or Period 2
            const hasRecess = timetableData.periods.some(p => p.name.toLowerCase().includes('recess'));
            if (!hasRecess) {
                const recessPeriod = {
                    name: 'Recess',
                    startTime: '10:55am',
                    endTime: '11:25am'
                };
                
                // Find the best position for Recess
                let insertIndex = -1;
                
                // First try: after Tutorial
                const tutorialIndex = timetableData.periods.findIndex(p => p.name.toLowerCase().includes('tutorial'));
                if (tutorialIndex !== -1) {
                    insertIndex = tutorialIndex + 1;
                    console.log(`📍 Found Tutorial at index ${tutorialIndex}, inserting Recess at index ${insertIndex}`);
                } else {
                    // Second try: after Period 2
                    const period2Index = timetableData.periods.findIndex(p => /period\s*2/i.test(p.name));
                    if (period2Index !== -1) {
                        insertIndex = period2Index + 1;
                        console.log(`📍 Found Period 2 at index ${period2Index}, inserting Recess at index ${insertIndex}`);
                    } else {
                        // Third try: before Period 3
                        const period3Index = timetableData.periods.findIndex(p => /period\s*3/i.test(p.name));
                        if (period3Index !== -1) {
                            insertIndex = period3Index;
                            console.log(`📍 Found Period 3 at index ${period3Index}, inserting Recess before it at index ${insertIndex}`);
                        } else {
                            // Fallback: add at the end
                            insertIndex = timetableData.periods.length;
                            console.log(`📍 No specific position found, adding Recess at end (index ${insertIndex})`);
                        }
                    }
                }
                
                // Insert the Recess period
                timetableData.periods.splice(insertIndex, 0, recessPeriod);
                console.log(`✅ Added default Recess period at position ${insertIndex}`);
                
                // Initialize Recess in each day's classes with default "Recess" entry
                timetableData.days.forEach(day => {
                    timetableData.classes[day]['Recess'] = [
                        {
                            subject: 'Recess',
                            code: '',
                            room: '',
                            teacher: '',
                            startTime: recessPeriod.startTime,
                            endTime: recessPeriod.endTime
                        }
                    ];
                });
                console.log(`✅ Added default Recess classes for all ${timetableData.days.length} days`);
            } else {
                console.log(`ℹ️ Recess period already exists, skipping default creation`);
            }
            
            // Always add Lunch if not present - positioned after Period 4 or Period 3
            const hasLunch = timetableData.periods.some(p => p.name.toLowerCase().includes('lunch'));
            if (!hasLunch) {
                const lunchPeriod = {
                    name: 'Lunch',
                    startTime: '1:30pm',
                    endTime: '2:25pm'
                };
                
                // Find the best position for Lunch
                let insertIndex = -1;
                
                // First try: after Period 4
                const period4Index = timetableData.periods.findIndex(p => /period\s*4/i.test(p.name));
                if (period4Index !== -1) {
                    insertIndex = period4Index + 1;
                    console.log(`📍 Found Period 4 at index ${period4Index}, inserting Lunch at index ${insertIndex}`);
                } else {
                    // Second try: after Period 3
                    const period3Index = timetableData.periods.findIndex(p => /period\s*3/i.test(p.name));
                    if (period3Index !== -1) {
                        insertIndex = period3Index + 1;
                        console.log(`📍 Found Period 3 at index ${period3Index}, inserting Lunch at index ${insertIndex}`);
                    } else {
                        // Third try: before Period 5
                        const period5Index = timetableData.periods.findIndex(p => /period\s*5/i.test(p.name));
                        if (period5Index !== -1) {
                            insertIndex = period5Index;
                            console.log(`📍 Found Period 5 at index ${period5Index}, inserting Lunch before it at index ${insertIndex}`);
                        } else {
                            // Fallback: add at the end
                            insertIndex = timetableData.periods.length;
                            console.log(`📍 No specific position found, adding Lunch at end (index ${insertIndex})`);
                        }
                    }
                }
                
                // Insert the Lunch period
                timetableData.periods.splice(insertIndex, 0, lunchPeriod);
                console.log(`✅ Added default Lunch period at position ${insertIndex}`);
                
                // Initialize Lunch in each day's classes with default "Lunch" entry
                timetableData.days.forEach(day => {
                    timetableData.classes[day]['Lunch'] = [
                        {
                            subject: 'Lunch',
                            code: '',
                            room: '',
                            teacher: '',
                            startTime: lunchPeriod.startTime,
                            endTime: lunchPeriod.endTime
                        }
                    ];
                });
                console.log(`✅ Added default Lunch classes for all ${timetableData.days.length} days`);
            } else {
                console.log(`ℹ️ Lunch period already exists, skipping default creation`);
            }
            
            console.log(`Updated periods list:`, timetableData.periods.map(p => `${p.name} (${p.startTime}-${p.endTime})`));
            
            // SPECIAL CHECK FOR TUTORIAL PERIODS
            const tutorialPeriods = timetableData.periods.filter(p => p.name.toLowerCase().includes('tutorial'));
            if (tutorialPeriods.length > 0) {
                console.log(`🎯 TUTORIAL PERIODS DETECTED: ${tutorialPeriods.length}`);
                tutorialPeriods.forEach(period => {
                    console.log(`  - ${period.name}: ${period.startTime} - ${period.endTime}`);
                });
            } else {
                console.log(`⚠️ NO TUTORIAL PERIODS FOUND IN PARSED DATA`);
            }
            
            // Debug: Show detailed class breakdown by period and day
            console.log('\n=== DETAILED CLASS BREAKDOWN ===');
            timetableData.periods.forEach(period => {
                console.log(`\n${period.name} (${period.startTime} - ${period.endTime}):`);
                
                // Special highlighting for Tutorial periods
                if (period.name.toLowerCase().includes('tutorial')) {
                    console.log(`🎯 TUTORIAL PERIOD BREAKDOWN:`);
                }
                
                timetableData.days.forEach(day => {
                    const dayClasses = timetableData.classes[day][period.name];
                    if (dayClasses.length > 0) {
                        dayClasses.forEach(cls => {
                            console.log(`  ${day}: ${cls.subject} (${cls.code}) - ${cls.room} ${cls.teacher}`);
                        });
                    } else {
                        console.log(`  ${day}: NO CLASSES`);
                    }
                });
            });
            
            // Count total classes
            let totalClasses = 0;
            timetableData.days.forEach(day => {
                timetableData.periods.forEach(period => {
                    const classCount = timetableData.classes[day][period.name].length;
                    totalClasses += classCount;
                    if (classCount > 0) {
                        console.log(`${day} ${period.name}: ${classCount} classes`);
                    }
                });
            });
            
            console.log(`Total classes parsed: ${totalClasses}`);
            
            // FINAL VALIDATION: Ensure Tutorial periods are present
            const finalTutorialCheck = timetableData.periods.find(p => p.name.toLowerCase().includes('tutorial'));
            if (finalTutorialCheck) {
                console.log(`✅ FINAL CHECK: Tutorial period "${finalTutorialCheck.name}" is present in final data`);
                
                // Count Tutorial classes
                let tutorialClassCount = 0;
                timetableData.days.forEach(day => {
                    tutorialClassCount += (timetableData.classes[day][finalTutorialCheck.name] || []).length;
                });
                console.log(`✅ Tutorial period has ${tutorialClassCount} total classes across all days`);
            } else {
                console.log(`❌ FINAL CHECK: NO Tutorial period found in final parsed data!`);
                console.log(`Available periods:`, timetableData.periods.map(p => p.name));
            }
            
            setIsProcessing(false);
            setParsedData(timetableData);
            
            // Ensure we stay on the current tab (don't auto-switch to AI Instructions)
            if (activeTab !== 'paste') {
                setActiveTab('paste');
            }
            
            return timetableData;
            
        } catch (error) {
            console.error('Error parsing timetable data:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                inputLength: text?.length || 0,
                inputPreview: text?.substring(0, 200) || 'No input'
            });
            setParseError(`Failed to parse the timetable data: ${error.message}\n\nPlease check the console for more details and ensure your data follows the correct format.`);
            setIsProcessing(false);
            return null;
        }
    };
    
    // Function to parse JSON timetable data (from AI output)
    // We're now using the imported parseJsonTimetable function from a separate file
    // This helps with code organization and allows easier maintenance

    // Function to copy AI instructions to clipboard
    const copyToClipboard = () => {
        const aiInstructions = `Please convert my school timetable data into a structured JSON format and return it as a copypastable JSON

I need a copy pastable text to follow this exact structure:

{
  "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],

  "periods": [
    {"name": "Period 1", "startTime": "8:35am", "endTime": "9:35am"},
    {"name": "Period 2", "startTime": "9:40am", "endTime": "10:40am"},
    {"name": "Tutorial", "startTime": "10:45am", "endTime": "10:55am"},
    {"name": "Recess", "startTime": "10:55am", "endTime": "11:25am"},
    {"name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm"},
    {"name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm"},
    {"name": "Lunch", "startTime": "1:30pm", "endTime": "2:25pm"},
    {"name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm"}
  ],

  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "10MAT101",
          "room": "B12",
          "teacher": "Mr Smith",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Tutorial": [
        {
          "subject": "Tutorial",
          "code": "10TUT251009",
          "room": "S 01",
          "teacher": "Mrs Sula Tyndall",
          "startTime": "10:45am",
          "endTime": "10:55am"
        }
      ],
      "Recess": [
        {
          "subject": "Recess",
          "code": "",
          "room": "",
          "teacher": "",
          "startTime": "10:55am",
          "endTime": "11:25am"
        }
      ],
      "Period 3": [],
      "Period 4": [],
      "Lunch": [
        {
          "subject": "Lunch",
          "code": "",
          "room": "",
          "teacher": "",
          "startTime": "1:30pm",
          "endTime": "2:25pm"
        }
      ],
      "Period 5": []
    },
    "Day 2": {
      "Period 1": [],
      "Period 2": [],
      "Tutorial": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    },
    "Day 3": { /* Same structure as above */ },
    "Day 4": { /* Same structure as above */ },
    "Day 5": { /* Same structure as above */ },
    "Day 6": { /* Same structure as above */ },
    "Day 7": { /* Same structure as above */ },
    "Day 8": { /* Same structure as above */ },
    "Day 9": { /* Same structure as above */ },
    "Day 10": { /* Same structure as above */ }
  }
}

Important notes:
- Remember PST is Private Study not anything else
- Keep all fields, even if some are empty (use "" for empty strings)
- Maintain the exact format of times (e.g., "8:35am", "2:25pm")
- Each period must be present, even if it has an empty array []
- Include Tutorial periods exactly as shown above
- ALWAYS include Recess and Lunch periods with default entries as shown above
- Recess and Lunch should have default subject entries (not empty arrays)
- You MUST include ALL 10 DAYS (Day 1 through Day 10) in the classes object
- Return the result as valid JSON only
- There are 10 days total (Day 1 through Day 10)
- Must include Tutorial periods
- You must do all this in one go
- Must give me Days 1-10 in one go as copy pastable JSON

Here's my timetable data:

${importText}`;

        navigator.clipboard.writeText(aiInstructions)
            .then(() => {
                // Show temporary success message
                const promptElement = document.querySelector('.ai-prompt');
                if (promptElement) {
                    const originalContent = promptElement.innerHTML;
                    promptElement.innerHTML = '<div class="copy-success">✓ Instructions and timetable copied to clipboard!</div>';
                    setTimeout(() => {
                        promptElement.innerHTML = originalContent;
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleImport = () => {
        if (!importText.trim()) {
            setParseError('Please paste your timetable data first.');
            // Adjust position when error appears, force scroll to make error visible
            setTimeout(() => adjustModalPosition(true), 50);
            return;
        }
        
        let data;
        
        try {
            if (activeTab === 'paste') {
                // Note: parseTimetableText is a local function that manually parses the timetable
                setIsProcessing(true);
                // We'll handle this asynchronously
                const result = parseTimetableText(importText);
                if (result) importData(result);
                setIsProcessing(false);
                return; // Return early
            } else if (activeTab === 'ai') {
                // Use our imported robust JSON parser
                const result = parseJsonTimetable(importText, setIsProcessing, setParseError);
                if (result) {
                    data = result;
                    setParsedData(result);
                } else {
                    // Error already set inside the function
                    setTimeout(() => adjustModalPosition(true), 50);
                    return;
                }
            } else if (activeTab === 'aiparser') {
                if (aiParserResult) {
                    // Use the AI-parsed result if available
                    data = aiParserResult;
                } else {
                    // Try to parse with AI first
                    setIsAiProcessing(true);
                    handleAiParse()
                        .then(() => {
                            if (aiParserResult) {
                                importData(aiParserResult);
                            }
                        })
                        .catch(error => {
                            setParseError(`AI parsing failed: ${error.message}. Please try again or use another import method.`);
                        })
                        .finally(() => {
                            setIsAiProcessing(false);
                        });
                    return; // Return early since we'll call importData after async parsing
                }
            }
        } catch (e) {
            console.error("Error in import process:", e);
            setParseError(`Import error: ${e.message || 'Unknown error'}`);
            setTimeout(() => adjustModalPosition(true), 50);
            return;
        }
        
        console.log("Import data prepared:", data);
        
        if (data) {
            // Apply a smooth fade-out animation before closing
            if (modalRef.current) {
                // Check if we're on mobile for faster animation timing
                const isMobile = window.innerWidth < 768;
                const animationDuration = isMobile ? 0.25 : 0.3;
                const timeoutDuration = isMobile ? 240 : 280;
                
                // Check header height before closing to adjust scroll
                const headerElement = document.querySelector('.header');
                const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                const scrollPosition = window.scrollY;
                
                // Get the backdrop pseudo-element (::before) by applying animation to the modal
                modalRef.current.style.animation = `importFadeOut ${animationDuration}s ease forwards`;
                
                // Find the content div to animate it separately
                const contentDiv = modalRef.current.querySelector('.import-timetable-content');
                if (contentDiv) {
                    contentDiv.style.animation = `importSlideDown ${animationDuration}s ease forwards`;
                }
                
                // If the user has scrolled down less than the header height, smooth scroll back to top
                // This ensures the timetable will be visible when it updates
                if (scrollPosition < headerHeight) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
                
                setTimeout(() => onImport(data), timeoutDuration);
            } else {
                onImport(data);
            }
        } else {
            // If there was an error parsing, adjust the modal position and force scroll
            setTimeout(() => adjustModalPosition(true), 50);
        }
    };
    
    const handleCancel = () => {
        // Apply a smooth fade-out animation before closing
        if (modalRef.current) {
            // Check if we're on mobile for faster animation timing
            const isMobile = window.innerWidth < 768;
            const animationDuration = isMobile ? 0.25 : 0.3;
            const timeoutDuration = isMobile ? 240 : 280;
            
            // Check header height before closing to adjust scroll
            const headerElement = document.querySelector('.header');
            const headerHeight = headerElement ? headerElement.offsetHeight : 0;
            const scrollPosition = window.scrollY;
            
            // Animate the backdrop fade-out with the dedicated animation
            modalRef.current.style.animation = `importFadeOut ${animationDuration}s ease forwards`;
            
            // Find the content div to animate it separately with the slide down animation
            const contentDiv = modalRef.current.querySelector('.import-timetable-content');
            if (contentDiv) {
                contentDiv.style.animation = `importSlideDown ${animationDuration}s ease forwards`;
            }
            
            // If the user has scrolled down less than the header height, smooth scroll back to top
            // This ensures the timetable will be visible when modal closes
            if (scrollPosition < headerHeight) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            setTimeout(() => onCancel(), timeoutDuration);
        } else {
            onCancel();
        }
    };

    return (
        <div className="import-timetable-modal" ref={modalRef}>
            <div className="import-timetable-content">
                <div className="import-header">
                    <h2>Import Timetable</h2>
                    <button 
                        className="tutorial-help-button"
                        onClick={() => setShowTutorial(true)}
                        title="Show import tutorial"
                        type="button"
                    >
                        ?
                    </button>
                </div>
                
                <div className="import-tabs">
                    <button 
                        className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`} 
                        onClick={() => handleTabChange('paste')}
                    >
                        Paste Timetable
                    </button>
                    <button 
                        className={`import-tab ${activeTab === 'ai' ? 'active' : ''}`}
                        onClick={() => handleTabChange('ai')}
                    >
                        AI Instructions
                    </button>
                    <button 
                        className={`import-tab ${activeTab === 'aiparser' ? 'active' : ''}`}
                        onClick={() => handleTabChange('aiparser')}
                    >
                        AI Parser
                    </button>
                </div>
                
                <div className={`import-tab-content ${activeTab === 'paste' ? 'active' : ''}`}>
                    <div className="import-instructions">
                        <p>Copy and paste your timetable data directly from your school's timetable system.</p>
                        <p>Your data should have this structure:</p>
                        <ul>
                            <li>First line with day labels (Day 1, Day 2, Monday, Tuesday, etc.)</li>
                            <li>Period headers (like "Period 1" or "Tutorial")</li>
                            <li>Time information (like "8:35am-9:35am")</li>
                            <li>Class details including subject, code, room, and teacher</li>
                        </ul>
                        
                        <div className="import-format-note">
                            <strong>Expected format (sequential 3-line pattern):</strong><br/>
                            <pre className="format-example">
Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10<br/>
Period 1<br/>
8:35am–9:35am<br/>
Psychology<br/>
(10PSY252103)<br/>
C 07 Ms Dianne McKenzie<br/>
Literature<br/>
(10LIT252101)<br/>
I 03 Miss Olivia Berry<br/>
Mathematics - Advanced<br/>
(10MAA252103)<br/>
M 06 Mrs Leah Manning<br/>
...continuing for all 10 days...
                            </pre>
                            <strong>Format notes:</strong>
                            <ul>
                                <li>Header row: Day 1 through Day 10 separated by tabs</li>
                                <li>Period headers: "Period 1", "Period 2", "Tutorial", etc.</li>
                                <li>Time ranges: Format like "8:35am–9:35am"</li>
                                <li>For each period, class data follows sequentially for each day:
                                    <ol>
                                        <li>Day 1: Subject name → Course code → Room and teacher</li>
                                        <li>Day 2: Subject name → Course code → Room and teacher</li>
                                        <li>Day 3: Subject name → Course code → Room and teacher</li>
                                        <li>...and so on for all 10 days</li>
                                    </ol>
                                </li>
                                <li>Each class uses exactly 3 lines (subject, code in parentheses, room + teacher)</li>
                            </ul>
                            <strong>Note:</strong> Make sure to copy the entire timetable to preserve the exact line structure.
                        </div>
                    </div>
                    
                    <textarea
                        className="import-textarea"
                        placeholder="Paste your timetable data here..."
                        value={importText}
                        onChange={handleTextChange}
                        rows={15}
                    />
                    
                    {parseError && (
                        <div className="parse-error">
                            {parseError}
                        </div>
                    )}
                    
                    {parseSuccess && (
                        <div className="parse-success">
                            {parseSuccess}
                        </div>
                    )}
                    
                    {parsedData && !parseSuccess && (
                        <div className="parse-success">
                            ✓ Timetable data parsed successfully. Click "Import" to apply.
                        </div>
                    )}
                </div>

                <div className={`import-tab-content ${activeTab === 'ai' ? 'active' : ''}`}>
                    <div className="ai-instructions">
                        <h3 style={{ display: 'flex', alignItems: 'center' }}>
                            AI Assistant Import Instructions
                            {parsedData && (
                                <button 
                                    className="copy-button" 
                                    onClick={copyToClipboard} 
                                    style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '0.9rem' }}
                                >
                                    Copy Instructions
                                </button>
                            )}
                        </h3>
                        {parsedData ? (
                            <div>
                                <p>Below are the generated instructions along with your timetable data, ready to be copied:</p>
                                <div className="ai-prompt">
                                    <pre>
{`Please convert my school timetable data into a structured JSON format and return it as a copypastable JSON

I need a copy pastable text to follow this exact structure:

{
  "days": ["Day 1", "Day 2", ...],  // List all days in my timetable (e.g., "Day 1", "Day 2", etc.)

  "periods": [
    {"name": "Period 1", "startTime": "8:35am", "endTime": "9:35am"},
    {"name": "Period 2", "startTime": "9:40am", "endTime": "10:40am"},
    {"name": "Tutorial", "startTime": "10:45am", "endTime": "10:55am"},
    {"name": "Recess", "startTime": "10:55am", "endTime": "11:25am"},
    {"name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm"},
    {"name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm"},
    {"name": "Lunch", "startTime": "1:30pm", "endTime": "2:25pm"},
    {"name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm"}
  ],

  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "10MAT101",
          "room": "B12",
          "teacher": "Mr Smith",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Tutorial": [
        {
          "subject": "Tutorial",
          "code": "10TUT251009",
          "room": "S 01",
          "teacher": "Mrs Sula Tyndall",
          "startTime": "10:45am",
          "endTime": "10:55am"
        }
      ],
      // Other periods for Day 1
    },
    // Other days follow the same structure
  }
}

Important notes:
- Remember PST is Private Study not anything else
- Keep all fields, even if some are empty (use "" for empty strings)
- Maintain the exact format of times (e.g., "8:35am", "2:25pm")
- Each period must be present, even if it has an empty array []
- Include Tutorial, Recess, and Lunch periods exactly as shown above
- Recess and Lunch periods will be automatically preserved during imports
- Return the result as a downloadable JSON file
-there are 10 days
-must include tute
-you must do all this in one go
-must give me 1-10 in one go copy pastable

Here's my timetable data:
${importText}`}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>Paste your timetable data below and click "Generate AI Instructions" to proceed:</p>
                                <textarea
                                    className="import-textarea"
                                    placeholder="Paste your timetable data here..."
                                    value={importText}
                                    onChange={handleTextChange}
                                    rows={15}
                                />
                                <button className="generate-button" onClick={() => setParsedData(true)}>Generate AI Instructions</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`import-tab-content ${activeTab === 'aiparser' ? 'active' : ''}`}>
                    <div className="ai-parser-content">
                        <h3>AI Timetable Parser</h3>
                        <p>Paste your messy timetable data below and our AI will automatically format it into a properly structured timetable.</p>
                        <div className="parse-success" style={{ marginBottom: '15px' }}>
                            ✅ AI Parser is ready to use. Just paste your timetable data and click "Parse with AI".
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="import-textarea"
                                placeholder="Paste your timetable data here..."
                                value={importText}
                                onChange={handleTextChange}
                                rows={15}
                                disabled={isAiProcessing}
                            />
                            
                            {isAiProcessing && (
                                <LoadingUI 
                                    message="Parsing" 
                                    words={["timetable", "classes", "periods"]} 
                                    status="This may take up to 30 seconds. Our AI is analyzing your timetable structure and extracting information about classes, periods, and days."
                                />
                            )}
                        </div>
                        
                        <div className="ai-parser-controls">
                            <button 
                                className="parse-with-ai-button" 
                                onClick={handleAiParse}
                                disabled={isAiProcessing || !importText.trim()}
                            >
                                {isAiProcessing ? 'Processing with AI...' : 'Parse with AI'}
                            </button>
                            
                            {parseError && (
                                <div className="parse-error">
                                    {parseError}
                                </div>
                            )}
                            
                            {parseSuccess && (
                                <div className="parse-success">
                                    {parseSuccess}
                                </div>
                            )}
                            
                            {aiParserResult && !parseSuccess && (
                                <div className="parse-success">
                                    ✓ Timetable data parsed successfully with AI. Click "Import" to apply.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="import-actions">
                    <button 
                        className="import-cancel-button" 
                        onClick={handleCancel}
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button 
                        className="import-submit-button" 
                        onClick={handleImport}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : parsedData ? 'Import' : 'Parse & Import'}
                    </button>
                </div>
            </div>
            
            {/* Tutorial popup for first-time users */}
            <ImportTutorialPopup 
                isVisible={showTutorial}
                onClose={handleCloseTutorial}
                onDontShowAgain={handleDontShowTutorialAgain}
            />
        </div>
    );
};

export default ImportTimetable;
