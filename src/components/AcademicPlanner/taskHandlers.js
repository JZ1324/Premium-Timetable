// Task handlers and helpers for AcademicPlanner

export const showToast = (setToastMessage) => (message, type = 'success') => {
    setToastMessage({ message, type });
};

export const handleOpenAddTaskModal = (setShowAddTaskModal) => () => {
    setShowAddTaskModal(true);
};

export const handleOpenAddAssignmentModal = (setShowAddAssignmentModal) => () => {
    setShowAddAssignmentModal(true);
};

export const handleOpenTemplatesModal = (setShowTemplates) => () => {
    setShowTemplates(true);
};

export const handleOpenAdvancedSearchModal = (setShowAdvancedSearch) => () => {
    setShowAdvancedSearch(true);
};

export const handleOpenSmartStudySearchModal = (setShowSmartStudySearch) => () => {
    setShowSmartStudySearch(true);
};

export const handleOpenAnalyticsDashboard = (setShowDataVisualization) => () => {
    setShowDataVisualization(true);
};

// ...add more handlers as needed
