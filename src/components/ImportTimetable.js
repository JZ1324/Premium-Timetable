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

const ImportTimetable = ({ onImport, onCancel }) => {
    const [importText, setImportText] = useState('');
    const [parseError, setParseError] = useState(null);
    const [parseSuccess, setParseSuccess] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('ai');
    const [aiParserResult, setAiParserResult] = useState(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
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
                return;
            }
            
            // Clear any previous errors and start the loading animation
            setIsAiProcessing(true);
            setParseError(null);
            
            // Call the advanced multi-model parser service with automatic fallback
            const response = await parseWithModelFallback(importText.trim());
            
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
                    
                    // Add special notice for school network issues if it might be a network restriction
                    if (diagnosisType === 'authorization' || 
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
            
            // First line contains the days
            const dayHeaderRow = lines[0];
            
            // Try different delimiters to detect day columns
            let days = [];
            
            // Try tab delimiter first
            const tabDelimitedDays = dayHeaderRow.split('\t').map(day => day.trim()).filter(day => day);
            if (tabDelimitedDays.length >= 2) {
                days = tabDelimitedDays;
            } else {
                // Try multiple spaces
                const spaceDelimitedDays = dayHeaderRow.split(/\s{2,}/).map(day => day.trim()).filter(day => day);
                if (spaceDelimitedDays.length >= 2) {
                    days = spaceDelimitedDays;
                } else {
                    // Last resort - try single spaces (less reliable)
                    const singleSpaceDelimitedDays = dayHeaderRow.split(' ').map(day => day.trim()).filter(day => day);
                    if (singleSpaceDelimitedDays.length >= 2) {
                        days = singleSpaceDelimitedDays;
                    } else {
                        setParseError('Could not detect day columns. Please ensure your data has tab or space separated columns.');
                        setIsProcessing(false);
                        return null;
                    }
                }
            }
            
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
            
            // Process remaining rows to extract periods and classes
            let currentPeriod = null;
            let rowIndex = 1;
            
            while (rowIndex < lines.length) {
                const line = lines[rowIndex].trim();
                
                // Skip empty lines
                if (!line) {
                    rowIndex++;
                    continue;
                }
                
                // Check if this is a period header
                const isPeriodHeader = line.match(/^(Period|Tutorial|After School)/i);
                
                if (isPeriodHeader) {
                    // This is a period header
                    const periodName = line;
                    
                    // Check if next line has time information
                    let startTime = null;
                    let endTime = null;
                    
                    if (rowIndex + 1 < lines.length) {
                        const timeLine = lines[rowIndex + 1].trim();
                        // Look for time format like 8:35am–9:35am or 8:35am-9:35am
                        const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                        
                        if (timeMatch) {
                            startTime = timeMatch[1];
                            endTime = timeMatch[2];
                            rowIndex++; // Skip the time line
                        }
                    }
                    
                    currentPeriod = {
                        name: periodName,
                        startTime,
                        endTime
                    };
                    
                    timetableData.periods.push(currentPeriod);
                    
                    // Initialize this period in each day
                    timetableData.days.forEach(day => {
                        if (!timetableData.classes[day][currentPeriod.name]) {
                            timetableData.classes[day][currentPeriod.name] = [];
                        }
                    });
                    
                    rowIndex++;
                    
                    // After a period header, we expect class data for each day
                    // Each day's data can span multiple lines
                    let currentDay = 0;
                    let classDataByDay = {};
                    
                    // Initialize class data storage for each day
                    for (const day of timetableData.days) {
                        classDataByDay[day] = [];
                    }
                    
                    // Process class data for this period
                    while (rowIndex < lines.length) {
                        const classLine = lines[rowIndex].trim();
                        
                        // Stop if we hit a new period header
                        if (classLine.match(/^(Period|Tutorial|After School)/i)) {
                            break;
                        }
                        
                        // Process sequential lines per day
                        for (let i = 0; i < timetableData.days.length && rowIndex < lines.length; i++) {
                            const dayClassLine = lines[rowIndex].trim();
                            
                            // Stop if we hit a new period header
                            if (dayClassLine.match(/^(Period|Tutorial|After School)/i)) {
                                break;
                            }
                            
                            // Add this line to the current day's class data
                            if (dayClassLine) {
                                const day = timetableData.days[i];
                                classDataByDay[day].push(dayClassLine);
                            }
                            
                            rowIndex++;
                        }
                        
                        // Check if we've processed enough class data for each day
                        let allDaysHaveData = true;
                        for (const day of timetableData.days) {
                            if (classDataByDay[day].length === 0) {
                                allDaysHaveData = false;
                            }
                        }
                        
                        // If we've collected data for all days or hit the end of input, process it
                        if (allDaysHaveData || rowIndex >= lines.length || 
                            (rowIndex < lines.length && lines[rowIndex].match(/^(Period|Tutorial|After School)/i))) {
                            
                            // Process the collected class data for each day
                            for (const day of timetableData.days) {
                                const dayLines = classDataByDay[day];
                                
                                if (dayLines.length > 0) {
                                    // Extract class information
                                    let subject = dayLines[0];
                                    let code = null;
                                    let room = null;
                                    let teacher = null;
                                    
                                    // Look for code in parentheses
                                    const codeMatch = dayLines.join(' ').match(/\(([\w\d]+)\)/);
                                    if (codeMatch) {
                                        code = codeMatch[1];
                                        subject = subject.replace(/\([\w\d]+\)/, '').trim();
                                    }
                                    
                                    // Enhance code detection - check for alphanumeric patterns that look like course codes
                                    if (!code) {
                                        const codePatterns = [
                                            /\b([A-Z0-9]{5,10})\b/, // Alphanumeric code like "10MAT101"
                                            /\b(\d{1,2}[A-Z]{2,4}\d{1,6})\b/, // Numeric-alpha-numeric like "10MAT101"
                                            /\b([A-Z]{2,4}\d{3,6})\b/ // Alpha-numeric like "MAT101"
                                        ];
                                        
                                        for (const pattern of codePatterns) {
                                            const match = dayLines.join(' ').match(pattern);
                                            if (match) {
                                                code = match[1];
                                                // Don't remove the code from the subject as it might be mentioned elsewhere
                                                break;
                                            }
                                        }
                                    }
                                    
                                    // Enhance room detection - more patterns for different formats
                                    if (!room) {
                                        const roomPatterns = [
                                            /\bRoom\s+([A-Z]\s*\d+)\b/i, // "Room A12" format
                                            /\b([A-Z][\-\s]?\d+)\b/ // "A-12" or "A12" format
                                        ];
                                        
                                        for (const pattern of roomPatterns) {
                                            const match = dayLines.join(' ').match(pattern);
                                            if (match) {
                                                room = match[1];
                                                break;
                                            }
                                        }
                                    }
                                    
                                    // Look for teacher (Mr, Ms, Mrs, Dr, Miss)
                                    const teacherPattern = /(Mr|Ms|Mrs|Dr|Miss)\s+[A-Za-z\s]+/;
                                    const teacherMatch = dayLines.join(' ').match(teacherPattern);
                                    if (teacherMatch) {
                                        teacher = teacherMatch[0];
                                    }
                                    
                                    // Add the class to the timetable
                                    timetableData.classes[day][currentPeriod.name].push({
                                        subject,
                                        code,
                                        room, 
                                        teacher,
                                        startTime: currentPeriod.startTime,
                                        endTime: currentPeriod.endTime
                                    });
                                }
                            }
                            
                            // Clear class data for next period
                            classDataByDay = {};
                            for (const day of timetableData.days) {
                                classDataByDay[day] = [];
                            }
                            
                            break;
                        }
                    }
                } else {
                    // Skip lines that don't match our expected format
                    rowIndex++;
                }
            }
            
            setIsProcessing(false);
            setParsedData(timetableData);
            return timetableData;
            
        } catch (error) {
            console.error('Error parsing timetable data:', error);
            setParseError('Failed to parse the timetable data: ' + error.message);
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
    {"name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm"},
    {"name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm"},
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
      "Period 2": [],
      "Period 3": [],
      "Period 4": [],
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
                <h2>Import Timetable</h2>
                
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
                            <strong>Example format:</strong><br/>
                            <pre className="format-example">
                                Day 1       Day 2       Day 3<br/>
                                Period 1<br/>
                                8:35am-9:35am<br/>
                                Mathematics  Physics     English<br/>
                                10MAT101     11PHY303    10ENG203<br/>
                                Room B12     Room S01     Room A08<br/>
                                Mr Smith     Mr Jones     Mrs Brown
                            </pre>
                            <strong>Note:</strong> Make sure to select all cells in your timetable before copying to maintain the structure.
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
                                    words={["timetable", "classes", "subjects", "periods", "days", "rooms", "teachers"]} 
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
        </div>
    );
};

export default ImportTimetable;
