import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import AppContent from './AppContent';
import { getBasePath } from '../utils/githubPagesRouting';

/**
 * Router component that handles routing for the application
 * Uses HashRouter for GitHub Pages deployment to avoid 404 issues
 * Uses BrowserRouter for local development and other deployments
 */
const Router = () => {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Always use HashRouter for GitHub Pages to avoid 404 issues
  // For all other environments, use BrowserRouter
  const RouterComponent = isGitHubPages ? HashRouter : BrowserRouter;
  
  // Get the base path for GitHub Pages
  const basePath = getBasePath();
  
  return (
    <RouterComponent basename={basePath}>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </RouterComponent>
  );
};

export default Router;
