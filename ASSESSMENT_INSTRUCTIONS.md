# Survey App - Developer Assessment

## Welcome!

Thank you for participating in this Angular development assessment. This exercise is designed to test your debugging and problem-solving skills in a real-world Angular application.

---

## 📋 Overview

You've been given an Angular Survey Application that has **5 bugs** introduced intentionally. Your task is to find and fix all of them. The application is a fully functional survey management system, but certain features are broken.

### Application Features
- **Survey List**: View all surveys with statistics
- **Survey Builder**: Create and edit surveys
- **Search**: Filter surveys by title or description
- **Question Types**: Text input, Radio buttons, Multiple choice
- **CRUD Operations**: Create, Read, Update, Delete surveys

---

## 🎯 Your Mission

### Find and Fix 5 Bugs

Each bug is marked with an `AssessmentToDo` comment in the codebase. Search for this keyword to locate all assessment tasks.

```bash
# Search for assessment tasks
grep -r "AssessmentToDo" src/
```

### Assessment Tasks

The 5 bugs are distributed across different layers of the application:

1. **Service Layer** - Data management issue
2. **Component Logic** - Business logic problem
3. **HTML Template** - View/binding issue
4. **Routing** - Navigation problem
5. **Data Model** - Type definition issue

---

## 🚀 Getting Started

### 1. Setup the Application

```bash
# Navigate to project directory
cd survey-app

# Install dependencies
npm install

# Start the development server
npm start
```

The app will run at `http://localhost:4200`

### 2. Explore the Application

Before debugging, familiarize yourself with:
- Creating a new survey
- Editing an existing survey
- Searching for surveys
- Deleting surveys
- The overall user flow

### 3. Find the Bugs

**Search for `AssessmentToDo` in the codebase:**

```bash
grep -rn "AssessmentToDo" src/app/
```

This will show you all 5 locations where bugs exist.

---

## 📝 Assessment Tasks

### Task #1: Service Layer Bug
**File:** `src/app/services/survey.service.ts`

**Symptom:** After deleting a survey, it disappears from the list temporarily but reappears when you navigate away and come back.

**Your Task:**
- Find the bug in the `deleteSurvey()` method
- Understand why the list doesn't refresh
- Fix the issue so deleted surveys stay deleted

**Hint:** Check what should happen after a successful deletion.

---

### Task #2: Component Validation Bug
**File:** `src/app/components/survey-builder/survey-builder.component.ts`

**Symptom:** You can save surveys without filling in required fields. Empty surveys, questions without text, and options without labels are being saved.

**Your Task:**
- Locate the `validateSurvey()` method
- Identify why validation is not working
- Fix the validation logic

**Hint:** The validation code exists but isn't being executed properly.

---

### Task #3: HTML Template Bug
**File:** `src/app/components/survey-list/survey-list.component.html`

**Symptom:** The search bar doesn't filter results as you type. You have to click outside the input or press Enter for the search to work.

**Your Task:**
- Find the search input field
- Identify the incorrect event binding
- Fix it for real-time search

**Hint:** Should search trigger on every keystroke or only on blur?

---

### Task #4: Routing Bug
**File:** `src/app/app.routes.ts`

**Symptom:** Clicking "Edit" on a survey opens the builder page, but the form is empty instead of showing the survey details.

**Your Task:**
- Examine the route configuration
- Find the missing route parameter
- Fix the edit route

**Hint:** How should the survey ID be passed to the component?

---

### Task #5: Data Model Bug
**File:** `src/app/models/survey.model.ts`

**Symptom:** Questions can be created without text, causing TypeScript to not catch potential null/undefined errors.

**Your Task:**
- Review the `Question` interface
- Identify the optional property that should be required
- Fix the type definition

**Hint:** Should question text be optional or required?

---

## ✅ Testing Your Fixes

After fixing each bug, test the following:

### Test #1: Delete Functionality
1. Go to Survey List
2. Delete a survey
3. Navigate to Survey Builder and back
4. **Expected:** Deleted survey should NOT reappear

### Test #2: Validation
1. Go to Survey Builder
2. Try to save without filling title
3. Try to save without adding questions
4. Try to add a question without text
5. **Expected:** Should show validation errors

### Test #3: Search Functionality
1. Go to Survey List
2. Start typing in the search box
3. **Expected:** Results should filter as you type

### Test #4: Edit Survey
1. Click "Edit" on any survey
2. **Expected:** Form should load with survey details
3. Questions should be visible
4. Title and description should be populated

### Test #5: TypeScript Compilation
1. Fix the Question interface
2. Run `npm start`
3. **Expected:** No TypeScript errors related to optional question text

---

## 📊 Submission Guidelines

### What to Submit

1. **Fixed Code Files:**
   - `src/app/services/survey.service.ts`
   - `src/app/components/survey-builder/survey-builder.component.ts`
   - `src/app/components/survey-list/survey-list.component.html`
   - `src/app/app.routes.ts`
   - `src/app/models/survey.model.ts`

2. **FIXES_SUMMARY.md** - Create this file with:
   ```markdown
   # Bug Fixes Summary

   ## Assessment Task #1: Service Layer
   **File:** survey.service.ts
   **Problem:** [Describe the issue]
   **Solution:** [Describe your fix]
   **Lines Changed:** [Line numbers]

   ## Assessment Task #2: Component Validation
   [Repeat for each task...]
   ```

3. **Screenshots** (Optional):
   - Working delete functionality
   - Validation errors showing
   - Real-time search
   - Edit mode loading correctly

### Evaluation Criteria

You will be evaluated on:

✅ **Bug Identification** (20 points)
- Did you find all 5 bugs?
- Did you understand the root cause?

✅ **Fix Quality** (40 points)
- Are the fixes correct?
- Do they follow best practices?
- Is the code clean?

✅ **Testing** (20 points)
- Did you test your fixes?
- Do all features work as expected?

✅ **Documentation** (20 points)
- Is your FIXES_SUMMARY.md clear?
- Did you explain your reasoning?

---

## 💡 Tips for Success

### 1. Read Error Messages
- Check the browser console for errors
- TypeScript errors in the terminal are helpful

### 2. Use Debugging Tools
- Angular DevTools (Chrome extension)
- Console.log() strategically
- Breakpoints in browser DevTools

### 3. Understand Before Fixing
- Read the surrounding code
- Understand the intended behavior
- Don't just comment out code

### 4. Test Thoroughly
- Test each fix individually
- Test the entire flow after all fixes
- Try edge cases

### 5. Keep It Simple
- The fixes are simple, not complex refactors
- Don't overcomplicate the solution
- Follow the existing code patterns

---

## 🔍 Code Search Commands

Helpful commands to navigate the codebase:

```bash
# Find all AssessmentToDo comments
grep -rn "AssessmentToDo" src/

# Find all TODO comments
grep -rn "TODO" src/

# Find all BUG comments
grep -rn "BUG" src/

# Search for specific methods
grep -rn "deleteSurvey" src/

# Search for specific components
grep -rn "validateSurvey" src/
```

---

## 📚 Resources

### Angular Documentation
- [Angular Official Docs](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Application Architecture
- Check `PROJECT_STRUCTURE.md` for file organization
- Read `DEVELOPMENT_GUIDE.md` for detailed docs
- Review `README.md` for overview

---

## ⏱️ Time Expectation

**Estimated Time:** 2-3 hours

- Setup & Exploration: 30 minutes
- Finding Bugs: 30 minutes
- Fixing Bugs: 60 minutes
- Testing: 30 minutes
- Documentation: 30 minutes

Take your time and focus on quality over speed!

---

## ❓ FAQs

### Q: Can I add new files?
**A:** No, all fixes should be made in existing files only.

### Q: Can I use external libraries?
**A:** No, use only the existing dependencies.

### Q: What if I can't find a bug?
**A:** Search for `AssessmentToDo` - all bugs are marked clearly.

### Q: Can I refactor the code?
**A:** Focus on fixing bugs, not refactoring. Keep changes minimal.

### Q: How do I know my fix is correct?
**A:** Test the specific feature - it should work as described in "Expected" sections.

---

## 🎓 Learning Objectives

By completing this assessment, you will demonstrate:

1. **Angular Fundamentals**
   - Understanding of Services and Dependency Injection
   - Component lifecycle and state management
   - Template syntax and event binding

2. **TypeScript Skills**
   - Interface definitions
   - Type safety
   - Optional vs required properties

3. **Debugging Skills**
   - Reading error messages
   - Using browser DevTools
   - Systematic problem solving

4. **Best Practices**
   - Code quality
   - Testing approach
   - Documentation

---

## 🚨 Common Pitfalls

### ❌ Don't Do This:
- Don't delete the `AssessmentToDo` comments
- Don't add console.log() without removing them later
- Don't change unrelated code
- Don't skip testing

### ✅ Do This:
- Read the hints carefully
- Test after each fix
- Keep changes minimal
- Document your changes

---

## 📞 Support

If you have questions about:
- **Setup issues:** Check `QUICKSTART.md`
- **Architecture questions:** Read `DEVELOPMENT_GUIDE.md`
- **Feature clarification:** Review the app behavior
- **TypeScript errors:** Check the TypeScript compiler output

---

## 🎉 Good Luck!

Remember:
- Take your time
- Test thoroughly
- Document clearly
- Ask questions if needed

**Happy debugging! We're excited to see your solutions!** 🚀

---

**Assessment Version:** 1.0
**Last Updated:** 2024
**Difficulty Level:** Intermediate
