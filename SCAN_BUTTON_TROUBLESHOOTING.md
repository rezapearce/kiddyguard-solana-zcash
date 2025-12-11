# Scan Button Troubleshooting Guide

## The Scan Button Should Be Visible

The Scan button is now implemented with inline styles (no CSS dependencies) and should appear as:
- A bright teal banner at the top of the Parent Dashboard
- White button with text "📱 SCAN QR CODE TO PAY"
- Full width on mobile devices

## If You Still Can't See It:

### 1. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

### 2. Hard Refresh Your Mobile Browser
- **Chrome/Android**: Long-press refresh → "Hard Reload"
- **Safari/iOS**: Settings → Safari → Clear History and Website Data
- Or close the tab completely and reopen

### 3. Verify You're Logged In as a Parent
- The button ONLY appears on the Parent Dashboard
- Make sure you're logged in with a user that has `role: 'parent'`
- The URL should be: `http://your-domain/` (home page)

### 4. Check Browser Console
- Open browser dev tools on mobile (if possible)
- Look for: "ParentDashboard rendering - Scan button should be visible"
- If you see this log, the component is rendering

### 5. Check the Page Source
- The button should be the FIRST element after the opening `<div>` tag
- Look for: `<div style="background-color: rgb(13, 148, 136)`

### 6. Try a Different Browser
- Sometimes browser cache can be persistent
- Try Chrome, Safari, or Firefox

## Current Implementation
- File: `src/components/dashboard/ParentDashboard.tsx`
- Button uses inline styles (no Tailwind dependencies)
- Position: First element in the component
- Styling: Bright teal background (#0d9488), white button

## Still Not Working?
Please check:
1. Are you on the home page (`/`)?
2. Are you logged in as a parent user?
3. Is the dev server running and showing no errors?
4. Can you see the "Parent Dashboard" heading?
