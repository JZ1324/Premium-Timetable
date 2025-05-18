# Timetable.js Changes

1. Add the import:
```javascript
import { getCurrentSchoolDay, getCurrentPeriod } from '../utils/dateUtils';
import '../styles/components/TimeSlot.css';
```

2. Add the currentPeriod state:
```javascript
const [currentPeriod, setCurrentPeriod] = useState('');
```

3. Add code to the useEffect to determine and update current day and period:
```javascript
// Set current day based on today's date
const todayDay = getCurrentSchoolDay();
setCurrentDay(todayDay);

// Set current period based on current time
const nowPeriod = getCurrentPeriod();
setCurrentPeriod(nowPeriod);

// Update current period every minute
const periodInterval = setInterval(() => {
    setCurrentPeriod(getCurrentPeriod());
}, 60000); // check every minute

// Clean up on unmount
return () => {
    clearInterval(periodInterval);
};
```

4. Add the isCurrentPeriod prop to TimeSlot:
```javascript
isCurrentPeriod={currentDay === slot.day && String(currentPeriod) === String(slot.period)}
```

# TimeSlot.js Changes

1. Add the isCurrentPeriod prop to the TimeSlot component parameters:
```javascript
const TimeSlot = ({ slot, onUpdate, onRemove, displaySettings, isEditing, onStartEditing, onCancelEditing, isCurrentPeriod }) => {
```

2. Add the current-period class to the time-slot div:
```javascript
<div 
    className={`time-slot ${isCurrentPeriod ? 'current-period' : ''}`}
    style={{
        backgroundColor: getSubjectColor(),
        color: getTextColor(),
        cursor: 'pointer'
    }}
```
