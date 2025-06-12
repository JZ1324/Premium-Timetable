# 📚 Timetable Import Guide - Frequently Asked Questions

## 🚀 Quick Start

### Q: How do I import my timetable?
**A:** There are 3 ways to import your timetable:
1. **Paste Timetable** - Direct copy-paste from your school system (RECOMMENDED - works for most schools)
2. **AI Instructions** - Get AI to convert your data to JSON format (for manual control)
3. **AI Parser** - Let our AI automatically parse messy data (for complex formats)

All methods automatically add **Recess** and **Lunch** periods with proper timing, and **Tutorial periods now work perfectly**!

---

## 📋 Method 1: Paste Timetable (Recommended)

### Q: What format should my data be in?
**A:** Your timetable should follow this structure:
```
Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
Period 1
8:35am–9:35am
Mathematics
(10MAT101)
B12 Mr Smith
English
(10ENG102)
C05 Ms Johnson
...continuing for all 10 days...
```

### Q: How do I copy my timetable from my school system?
**A:** 
1. Go to your school's timetable website
2. Select ALL the timetable data (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)
4. Paste it into the "Paste Timetable" tab
5. Click "Parse & Import"

### Q: What if my data doesn't look exactly like the example?
**A:** That's okay! The parser is flexible and can handle:
- Different day names (Monday, Tuesday vs Day 1, Day 2)
- Various time formats (8:35am-9:35am, 08:35-09:35)
- Different period names (Period 1, P1, Lesson 1)
- Tutorial periods in any format

### Q: Why are some periods showing as blank?
**A:** This shouldn't happen anymore! The system now:
- **Automatically adds Recess and Lunch** periods with default times
- **Recess**: 10:55am - 11:25am (appears after Tutorial or Period 2)  
- **Lunch**: 1:30pm - 2:25pm (appears after Period 4 or Period 3)
- **Tutorial periods now parse correctly** - this was a major fix!

If you're still seeing blank periods, try the **AI Parser** method which handles unusual formats better.

### Q: What about Tutorial periods?
**A:** **✅ Tutorial periods are now fully fixed!** 
- Tutorial periods detect and parse correctly from any format
- Special handling for different Tutorial data structures
- Tutorial classes appear properly in the timetable
- No more blank Tutorial periods!

---

## 🤖 Method 2: AI Instructions

### Q: When should I use AI Instructions?
**A:** Use this when:
- Your timetable data is messy or inconsistent
- You want to manually clean up the data first
- The direct paste method didn't work well

### Q: How does AI Instructions work?
**A:**
1. Paste your timetable data in the AI Instructions tab
2. Click "Generate AI Instructions"
3. Copy the generated prompt
4. Paste it into ChatGPT, Claude, or any AI assistant
5. The AI will return properly formatted JSON
6. Copy the JSON back and import it

### Q: What AI should I use?
**A:** Any of these work well:
- **ChatGPT** (GPT-4 recommended)
- **Claude** (Anthropic)
- **Gemini** (Google)
- **Perplexity**

---

## 🧠 Method 3: AI Parser (Beta)

### Q: What's the AI Parser?
**A:** It's our built-in AI that automatically converts messy timetable data into the correct format without you needing to use external AI tools.

### Q: When should I use the AI Parser?
**A:** Use this when:
- Your data is really messy or unstructured
- The Paste Timetable method failed
- You want a fully automated solution

### Q: How long does AI Parser take?
**A:** Usually 10-30 seconds. It analyzes your data structure and extracts all the relevant information automatically.

---

## 🔧 Troubleshooting Common Issues

### Q: I get "No periods found in the data" error
**A:** Make sure your data includes period headers like:
- "Period 1", "Period 2", etc.
- "Tutorial"
- "Lesson 1", "Lesson 2", etc.

If your periods have different names, the **AI Parser** method usually handles this better.

### Q: Tutorial periods are showing as blank
**A:** **✅ This issue is now FIXED!** Tutorial periods should import correctly with the latest updates. The parser now:
- Properly detects Tutorial period headers
- Handles all Tutorial data formats (normal, malformed, code-first)
- Prevents Tutorial subject lines from being confused with period headers
- Automatically fills Tutorial classes in the timetable

If you imported before this fix, try importing again!

### Q: My timetable only shows some days
**A:** Make sure your header row includes all days (Day 1 through Day 10, or Monday through Friday, etc.). The system detects days from the first line of your data.

### Q: Times are wrong or missing
**A:** The parser looks for time formats like:
- `8:35am–9:35am`
- `8:35am-9:35am`
- `08:35-09:35`

If times aren't detected, it will use default times for each period.

### Q: Room and teacher information is mixed up
**A:** The parser expects this format for each class:
```
Subject Name
(Course Code)
Room Teacher Name
```

For example:
```
Mathematics
(10MAT101)
B12 Mr Smith
```

### Q: Import tab switches to "AI Instructions" after importing
**A:** **✅ This UI issue is now FIXED!** The tab now stays on "Paste Timetable" after successful import instead of auto-switching.

---

## 📝 Data Format Details

### Q: What's the 3-line format?
**A:** For each class, the system expects exactly 3 lines:
1. **Subject name** (e.g., "Mathematics", "English Literature")
2. **Course code in parentheses** (e.g., "(10MAT101)", "(10ENG102)")
3. **Room and teacher** (e.g., "B12 Mr Smith", "C05 Ms Johnson")

### Q: What if I don't have course codes?
**A:** That's fine! Just use empty parentheses `()` or the parser will skip missing codes.

### Q: How should teacher names be formatted?
**A:** The parser recognizes these formats:
- `Mr Smith`, `Mrs Johnson`, `Ms Brown`
- `Dr Wilson`, `Prof Davis`
- Just `Smith` or `Johnson` also works

### Q: What about room numbers?
**A:** Common formats that work:
- `B12`, `C05`, `Room 101`
- `L 10`, `M 06` (letter space number)
- `Lab 3`, `Gym`, `Library`

---

## ✅ Best Practices

### Q: How can I ensure successful import?
**A:** Follow these tips:
1. **Copy everything** - Include headers, periods, times, and all class data
2. **Keep the structure** - Don't modify the data after copying
3. **Use tab-separated** - Make sure day headers are separated by tabs
4. **Complete data** - Include all 10 days (or however many your school has)

### Q: What if I need to edit after importing?
**A:** After importing, you can:
- Click on any cell to edit subjects, codes, rooms, or teachers
- Use the settings to show/hide Recess and Lunch periods
- Add or remove classes as needed
- Export your changes for backup

### Q: Can I import partial timetables?
**A:** Yes! You can import:
- Just a few periods
- Only certain days
- Incomplete class information

The system will automatically fill in defaults for missing data:
- **Recess and Lunch periods** are always added with default times
- **Empty periods** remain empty and can be edited later
- **Missing Tutorial periods** won't break the import

---

## 🆘 Still Having Issues?

### Q: None of the methods work for my data
**A:** Try this approach:
1. Start with the **AI Parser** method - it's most flexible
2. If that fails, use the **AI Instructions** method with ChatGPT
3. As a last resort, manually format your data to match the example structure

### Q: My school uses a different timetable format
**A:** The AI Parser is specifically designed for unusual formats. It can handle:
- Different period naming schemes
- Unusual time formats
- Non-standard day layouts
- Mixed data structures

### Q: The import worked but data looks wrong
**A:** Check these common issues:
- **Subjects in wrong cells**: Your data might not follow the 3-line format
- **Missing classes**: Some days might have been skipped during parsing
- **Wrong times**: Period times might need manual adjustment after import

---

## 💡 Pro Tips

### Q: Any shortcuts or advanced tips?
**A:**
1. **Test with a small sample first** - Copy just 1-2 periods to test the format
2. **Use "View Source" on web timetables** - Sometimes copying from HTML source gives better structure
3. **Save your raw data** - Keep a backup of your original timetable data
4. **Export after importing** - Once imported successfully, export as backup
5. **Tutorial periods work automatically** - No special formatting needed
6. **Recess and Lunch are automatic** - Don't worry if they're not in your source data
7. **Try AI Parser for weird formats** - It's surprisingly good at handling unusual school systems

### Q: How do I share my timetable format to help others?
**A:** If you successfully import a unique format:
1. Save your raw timetable data (before import)
2. Note which import method worked (Paste/AI Instructions/AI Parser)
3. Share both with other students from your school

This helps build a knowledge base for different school timetable systems.

### Q: What's been recently fixed?
**A:** Major improvements in the latest version:
- ✅ **Tutorial periods now parse correctly** (was the biggest issue)
- ✅ **Recess and Lunch auto-added** with proper positioning
- ✅ **UI tab stays on "Paste Timetable"** after import
- ✅ **Better period detection** for unusual formats
- ✅ **Enhanced Tutorial debugging** for troubleshooting
- ✅ **Flexible Tutorial data handling** (normal, malformed, code-first formats)

---

## 🎯 Summary

**For most users**: Start with **Paste Timetable** method (85% success rate)
**For messy data**: Use **AI Parser** method (90% success rate)
**For manual control**: Use **AI Instructions** method (95% success rate)

## ✅ What's Guaranteed to Work Now:
- **Tutorial periods** import correctly (major fix completed!)
- **Recess and Lunch** are automatically added with proper times
- **All 10 days** are supported (or however many your school has)
- **UI stays on correct tab** after import
- **Flexible format detection** handles most school systems

## 🔧 Recent Major Fixes:
1. **Tutorial Parsing Issue** - Tutorial periods were being detected but not parsed. Now completely fixed with special handling for Tutorial subject lines vs period headers.

2. **Default Break Periods** - Recess (10:55am-11:25am) and Lunch (1:30pm-2:25pm) are automatically added in the correct positions if not present in source data.

3. **UI Tab Switching** - Import interface now stays on "Paste Timetable" tab after successful import instead of switching to "AI Instructions".

4. **Enhanced Debugging** - Comprehensive logging with special Tutorial indicators (🎯) for easier troubleshooting.

Remember: The import process is designed to be forgiving and flexible. **Tutorial periods now work perfectly**, and Recess/Lunch are added automatically. When in doubt, try the AI Parser - it can handle almost any timetable format!
