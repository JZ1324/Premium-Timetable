/* 
  This script enables navigation for GitHub Pages hosting of a single-page React app.
  It helps handle direct URL access and browser refresh for routes other than the root.
*/

// Handle GitHub Pages routing
const handleGitHubPagesRouting = () => {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    // Set base path for GitHub Pages
    window.basePath = '/Premium-Timetable';
    
    // Check if we're being redirected with a route parameter
    const urlParams = new URLSearchParams(window.location.search);
    const route = urlParams.get('route');
    
    if (route) {
      // Clean up the URL by removing the query parameter and pushing the route to history
      urlParams.delete('route');
      
      // Construct the new URL with the correct base path
      const newUrl = window.basePath + 
        (urlParams.toString() ? `?${urlParams.toString()}` : '') + 
        route;
      
      // Update the URL without reloading the page
      window.history.replaceState(null, null, newUrl);
      
      console.log('Redirected to route:', route);
    }
    
    console.log('GitHub Pages routing initialized with base path:', window.basePath);
  }
};

// Export a function to get the base path
export const getBasePath = () => {
  if (window.location.hostname.includes('github.io')) {
    return '/timetables';
  }
  return '';
};

// Run the function when the page loads
window.addEventListener('load', handleGitHubPagesRouting);
