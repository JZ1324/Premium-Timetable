// apiErrorDiagnostics.js - Tool for diagnosing OpenRouter API errors

/**
 * Helper function to check if a string exists in an API error response
 * @param {string} errorResponse - The API error response
 * @param {Array} keywords - Array of keywords to check for
 * @returns {boolean} - True if any keyword is found in the error response
 */
function checkErrorContains(errorResponse, keywords) {
  if (!errorResponse || typeof errorResponse !== 'string') return false;
  
  const lowerCaseError = errorResponse.toLowerCase();
  return keywords.some(keyword => lowerCaseError.includes(keyword.toLowerCase()));
}

/**
 * Diagnoses OpenRouter API error responses and provides helpful insights
 * @param {Object} errorResponse - The error response from the API
 * @returns {Object} - Diagnostic information
 */
function diagnoseApiError(errorResponse) {
  // Initialize the diagnosis
  const diagnosis = {
    errorType: 'unknown',
    possibleCauses: [],
    recommendations: [],
    severity: 'unknown',
    rawError: errorResponse
  };
  
  // If we don't have a valid error response, return basic diagnosis
  if (!errorResponse) {
    diagnosis.errorType = 'empty_response';
    diagnosis.possibleCauses.push('No response received from the API');
    diagnosis.recommendations.push('Check your internet connection');
    diagnosis.recommendations.push('Verify the API endpoint URL is correct');
    diagnosis.severity = 'critical';
    return diagnosis;
  }
  
  // Convert the error response to a string if it's not already
  const errorString = typeof errorResponse === 'string' ? 
    errorResponse : JSON.stringify(errorResponse);
  
  // Check for authorization issues
  if (checkErrorContains(errorString, ['unauthorized', 'authentication', 'auth', 'invalid key', 'api key', 'No auth credentials', '401'])) {
    diagnosis.errorType = 'authorization';
    diagnosis.possibleCauses.push('Invalid or expired API key');
    diagnosis.possibleCauses.push('API key missing required permissions');
    diagnosis.possibleCauses.push('School or organizational network may be blocking access to this service');
    diagnosis.recommendations.push('Check if your OpenRouter API key is valid');
    diagnosis.recommendations.push('Try using a different AI model provider');
    diagnosis.recommendations.push('If using a school network, try from a different network (like home WiFi or mobile data)');
    diagnosis.severity = 'critical';
  }
  // Check for rate limiting
  else if (checkErrorContains(errorString, ['rate limit', 'too many requests', 'quota', '429', 'limit exceeded', 'free-models-per-day'])) {
    diagnosis.errorType = 'rate_limiting';
    diagnosis.possibleCauses.push('You\'ve reached your API usage quota for free models');
    diagnosis.possibleCauses.push('Daily free tier limit has been exceeded');
    diagnosis.recommendations.push('Wait until tomorrow when the free tier quota resets');
    diagnosis.recommendations.push('Consider adding credits to your OpenRouter account for more requests');
    diagnosis.recommendations.push('Switch to a different model that may have available quota');
    diagnosis.severity = 'medium';
  }
  // Check for token limit issues
  else if (checkErrorContains(errorString, ['token', 'too long', 'context length', 'input too long'])) {
    diagnosis.errorType = 'token_limit';
    diagnosis.possibleCauses.push('Input text is too long for the model');
    diagnosis.possibleCauses.push('Response exceeded token limit');
    diagnosis.recommendations.push('Reduce the size of your input text');
    diagnosis.recommendations.push('Split your request into smaller chunks');
    diagnosis.severity = 'medium';
  }
  // Check for provider-specific errors
  else if (checkErrorContains(errorString, ['provider returned error', 'provider error', 'model', 'unavailable', 'gemini', 'google'])) {
    diagnosis.errorType = 'provider_error';
    
    // Check if this is actually a rate limit masquerading as a provider error
    if (checkErrorContains(errorString, ['429', 'rate', 'limit', 'quota', 'free-models'])) {
      diagnosis.errorType = 'provider_rate_limit';
      diagnosis.possibleCauses.push('The underlying model provider (Google/Gemini) is rate-limiting requests');
      diagnosis.possibleCauses.push('Free tier usage limit for this model has been reached');
      diagnosis.recommendations.push('Try a different AI model that may have available quota');
      diagnosis.recommendations.push('Wait until tomorrow when quotas typically reset');
      diagnosis.recommendations.push('Add credits to your OpenRouter account to increase limits');
    } else {
      diagnosis.possibleCauses.push('The AI model provider (Google/Gemini) is experiencing issues');
      diagnosis.possibleCauses.push('The specific model may be temporarily unavailable');
      diagnosis.recommendations.push('Try a different AI model (Claude, GPT, etc.)');
      diagnosis.recommendations.push('Wait and try again later');
    }
    
    diagnosis.severity = 'high';
  }
  // Check for malformed requests
  else if (checkErrorContains(errorString, ['invalid request', 'bad request', 'malformed', 'invalid format', '400'])) {
    diagnosis.errorType = 'malformed_request';
    diagnosis.possibleCauses.push('Request body is not properly formatted');
    diagnosis.possibleCauses.push('Missing required parameters');
    diagnosis.recommendations.push('Check the structure of your API request');
    diagnosis.recommendations.push('Verify all required fields are included');
    diagnosis.severity = 'high';
  }
  // Check for server errors
  else if (checkErrorContains(errorString, ['server error', 'internal', '500', '502', '503'])) {
    diagnosis.errorType = 'server_error';
    diagnosis.possibleCauses.push('OpenRouter or the provider is experiencing server issues');
    diagnosis.possibleCauses.push('Temporary outage or maintenance');
    diagnosis.recommendations.push('Wait and try again later');
    diagnosis.recommendations.push('Check OpenRouter status page for outages');
    diagnosis.severity = 'high';
  }
  // Check for network restrictions (new category)
  else if (checkErrorContains(errorString, ['network', 'connection', 'timeout', 'cannot reach', 'failed to fetch', 'CORS', 'blocked', 'firewall', 'proxy', 'access denied'])) {
    diagnosis.errorType = 'network_restriction';
    diagnosis.possibleCauses.push('Your network (school, organization) may be blocking access to the AI service');
    diagnosis.possibleCauses.push('A firewall or proxy is preventing connections to external AI APIs');
    diagnosis.possibleCauses.push('DeepSeek services may be specifically restricted on your network');
    diagnosis.recommendations.push('Try using the app on a different network (home WiFi or mobile data)');
    diagnosis.recommendations.push('Try using different AI models that might not be blocked');
    diagnosis.recommendations.push('If you need to use DeepSeek models specifically, contact your network administrator');
    diagnosis.severity = 'high';
  }
  // Default case for unknown errors
  else {
    diagnosis.errorType = 'unclassified';
    diagnosis.possibleCauses.push('Unknown error occurred');
    diagnosis.recommendations.push('Check the raw error message for details');
    diagnosis.recommendations.push('Contact OpenRouter support if the issue persists');
    diagnosis.severity = 'medium';
  }
  
  return diagnosis;
}

/**
 * Generates a human-readable report from the error diagnosis
 * @param {Object} diagnosis - The error diagnosis
 * @returns {string} - A formatted report
 */
function generateErrorReport(diagnosis) {
  let report = `\n=== OpenRouter API ERROR DIAGNOSIS ===\n\n`;
  report += `Error Type: ${diagnosis.errorType.toUpperCase()}\n`;
  report += `Severity: ${diagnosis.severity.toUpperCase()}\n\n`;
  
  report += "Possible Causes:\n";
  diagnosis.possibleCauses.forEach(cause => {
    report += `• ${cause}\n`;
  });
  
  report += "\nRecommendations:\n";
  diagnosis.recommendations.forEach(rec => {
    report += `• ${rec}\n`;
  });
  
  if (diagnosis.rawError) {
    report += "\nRaw Error:\n";
    const errorString = typeof diagnosis.rawError === 'string' ? 
      diagnosis.rawError : JSON.stringify(diagnosis.rawError, null, 2);
    report += errorString.substring(0, 500) + (errorString.length > 500 ? '...' : '');
  }
  
  report += `\n=== END DIAGNOSIS ===\n`;
  
  return report;
}

module.exports = {
  diagnoseApiError,
  generateErrorReport
};
