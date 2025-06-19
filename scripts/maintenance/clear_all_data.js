// Complete Academic Planner Data Clearing Script

console.log("🧹 Starting complete data cleanup...");

// 1. Clear all tasks
localStorage.removeItem('academicPlannerTasks');
console.log("✅ Cleared all tasks");

// 2. Clear task templates
localStorage.removeItem('academicPlannerTemplates');
console.log("✅ Cleared task templates");

// 3. Clear filters
localStorage.removeItem('academicPlannerFilters');
console.log("✅ Cleared filters");

// 4. Clear custom subjects
localStorage.removeItem('customSubjects');
console.log("✅ Cleared custom subjects");

// 5. Clear custom types
localStorage.removeItem('customTypes');
console.log("✅ Cleared custom types");

// 6. Clear any study timer data
localStorage.removeItem('academicPlannerTimer');
console.log("✅ Cleared timer data");

// 7. Clear any analytics data
localStorage.removeItem('academicPlannerAnalytics');
console.log("✅ Cleared analytics data");

// 8. Clear any backup data
localStorage.removeItem('academicPlannerBackup');
console.log("✅ Cleared backup data");

// 9. Clear all keys that might be related to Academic Planner
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('academic') || key.includes('Academic') || key.includes('planner') || key.includes('Planner') || key.includes('task') || key.includes('Task'))) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
});

// 10. Show what's left in localStorage
console.log("\n📋 Remaining localStorage keys:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`- ${key}`);
}

// 11. Force a page reload to ensure all state is reset
console.log("\n🔄 Data cleared! The page will reload in 2 seconds to reset all state...");
setTimeout(() => {
    window.location.reload();
}, 2000);
