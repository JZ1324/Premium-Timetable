// Fixed handleAiParse function for the ImportTimetable component
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
