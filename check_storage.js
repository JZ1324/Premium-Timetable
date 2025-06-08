// Quick check of current localStorage data
console.log("📋 Current localStorage contents:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('academic') || key.includes('Academic') || key.includes('planner') || key.includes('Planner') || key.includes('task') || key.includes('Task')) {
        console.log(`${key}:`, JSON.parse(localStorage.getItem(key) || 'null'));
    }
}
