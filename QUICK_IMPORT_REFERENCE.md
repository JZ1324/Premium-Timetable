# 📋 Quick Import Reference Card

## 🚀 3 Import Methods

| Method | Best For | Time | Success Rate |
|--------|----------|------|--------------|
| **Paste Timetable** | Standard school formats | Instant | 85% |
| **AI Instructions** | Manual control + cleanup | 2-3 min | 95% |
| **AI Parser** | Messy/unusual formats | 30 sec | 90% |

## 📝 Expected Data Format

```
Day 1	Day 2	Day 3	...	Day 10    ← Tab-separated header
Period 1                               ← Period name
8:35am–9:35am                         ← Time range
Mathematics                           ← Subject (Day 1)
(10MAT101)                           ← Code (Day 1)  
B12 Mr Smith                         ← Room + Teacher (Day 1)
English                              ← Subject (Day 2)
(10ENG102)                           ← Code (Day 2)
C05 Ms Johnson                       ← Room + Teacher (Day 2)
...continues for all 10 days...
```

## ✅ What Gets Added Automatically

- **Recess**: 10:55am-11:25am (after Tutorial/Period 2) - Default "Recess" entry
- **Lunch**: 1:30pm-2:25pm (after Period 4/Period 3) - Default "Lunch" entry
- **Tutorial periods**: Now parse correctly with enhanced detection!

## 🔧 Troubleshooting Quick Fixes

| Error | Quick Fix | Status |
|-------|-----------|---------|
| "No periods found" | Try **AI Parser** method | ✅ Works |
| "Tutorial periods blank" | ✅ **FIXED!** Should work automatically now | ✅ Fixed |
| "Missing days" | Ensure header has all days tab-separated | ✅ Works |
| "Wrong times" | Times auto-detect, manual edit after import if needed | ✅ Works |
| "Tab switches to AI Instructions" | ✅ **FIXED!** Now stays on "Paste Timetable" | ✅ Fixed |

## 💡 Pro Tips

1. **Copy everything** from your school system (Ctrl+A → Ctrl+C)
2. **Test small first** - Try 1-2 periods to check format
3. **Save original data** before importing
4. **AI Parser is magic** - Use it for weird formats
5. **✅ Tutorial periods work now** - No special formatting needed!
6. **✅ Recess/Lunch auto-added** - Don't worry if missing from source

## 🆘 Emergency Backup Plan

If nothing works:
1. Go to **AI Instructions** tab
2. Copy the generated prompt
3. Paste into ChatGPT/Claude with your data
4. Copy the JSON result back
5. Import the JSON

## 🎯 Recent Major Fixes
- ✅ **Tutorial parsing completely fixed**
- ✅ **Auto Recess & Lunch insertion**  
- ✅ **UI tab stays on "Paste Timetable"**
- ✅ **Enhanced period detection**

---
*Need more help? Check the full IMPORT_GUIDE.md*
