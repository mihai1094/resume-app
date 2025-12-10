# Data Synchronization Contract

## Overview

This document describes the data synchronization strategy across the ResumeForge application, explaining how data flows between different storage systems (localStorage, Firestore, sessionStorage) and when each system is used.

## Storage Systems

### 1. **localStorage** - Local Draft Storage
- **Scope**: Client-side only, persists across browser sessions
- **Lifespan**: Until user clears browser data
- **Capacity**: ~5-10MB per domain
- **Async**: False (synchronous API)
- **Clearing**: When user logs out or explicitly clears data

**Use Cases:**
- Temporary draft storage while user edits
- Quick resume access without network calls
- Offline editing support

**Implementation:** `useLocalStorage()` hook with debounced auto-save (500ms)

### 2. **Firestore** - Cloud Persistent Storage
- **Scope**: Cloud-based, synced across devices
- **Lifespan**: Until user deletes the document
- **Capacity**: Unlimited
- **Async**: True (requires network)
- **Access**: Requires authentication

**Use Cases:**
- Primary data persistence for saved resumes
- Multi-device sync
- Backup and recovery
- Shared access (future feature)

**Data Models:**
- `users/{userId}/resumes/{resumeId}` - Saved resume documents
- `users/{userId}/drafts/{resumeId}` - Draft documents with timestamps
- `users/{userId}/coverLetters/{letterId}` - Cover letter documents

### 3. **sessionStorage** - Cross-Tab Communication
- **Scope**: Single browser tab, cleared on tab close
- **Lifespan**: Duration of browser tab
- **Capacity**: ~5-10MB
- **Async**: False (synchronous API)
- **Use Case**: Passing data between pages during resume editing flow

**Implementation:** Used in "load resume for editing" flow
- Store resume data in sessionStorage on dashboard
- Retrieve on editor page
- Clear after loading

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Resume Editor                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Editor State (useResumeEditorContainer)             │   │
│  │  - resumeData (ResumeData)                           │   │
│  │  - isSaving (boolean)                                │   │
│  │  - lastSaved (timestamp)                             │   │
│  └───────────┬──────────────────────────────────────────┘   │
│              │                                                │
│              │ onChange (auto-save every 500ms)             │
│              ↓                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useLocalStorage Hook                                │   │
│  │  - Debounced writes (500ms delay)                   │   │
│  │  - Saves to browser localStorage                    │   │
│  │  - Shows "Saving...", "Saved [time]"                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴─────────────────┐
         │                                  │
         ↓                                  ↓
┌─────────────────────┐          ┌──────────────────┐
│   localStorage      │          │  Firestore       │
│  (Offline Draft)    │          │  (Cloud Backup)  │
│                     │          │                  │
│  Current Resume:    │          │  Current Resume: │
│  - Autosaved data   │          │  - Explicit save │
│  - Full fidelity    │          │  - Versioned     │
│  - Always available │          │  - Multi-device  │
└─────────────────────┘          └──────────────────┘
         │                                  ▲
         │                                  │
         │ Manual Export/Save               │ Manual Save
         │ (User clicks "Save")             │ (User clicks button)
         │                                  │
         └──────────────────┬───────────────┘
                            │
                     ┌──────┴────────┐
                     │               │
                     ↓               ↓
              ┌─────────────┐  ┌──────────────┐
              │   Resume    │  │  Dashboard   │
              │  Download   │  │  View/List   │
              │  (JSON/PDF) │  │  Edit Resume │
              └─────────────┘  └──────────────┘
```

## Key Synchronization Rules

### Rule 1: Auto-Save to localStorage
```typescript
// When: User changes any resume field
// Where: ResumeEditor component via useLocalStorage hook
// How: Debounced (500ms) automatic write
// Result: resumeData is persisted to browser storage

useEffect(() => {
  // Debounced save to localStorage
  saveToLocalStorage(resumeData);
}, [resumeData, saveToLocalStorage]);
```

### Rule 2: Auto-Save to Firestore (Authenticated Users)
```typescript
// When: User changes any resume field (authenticated users)
// Where: useResumeEditorContainer hook
// How: Debounced (600ms) automatic write with exponential backoff on failure
// Prerequisites: User must be authenticated
// Result: Resume persisted to cloud as "current resume" draft

// Implementation in useResumeEditorContainer:
useEffect(() => {
  if (!user?.id) return;
  if (isInitializing) return;
  if (navigator.onLine === false) {
    setCloudSaveError("Offline — will resume when you're back online.");
    return;
  }

  const baseDelay = 600;
  const retryDelay = Math.min(5000, baseDelay * Math.max(1, cloudRetryAttempt + 1));

  setIsCloudSaving(true);
  cloudSaveTimeoutRef.current = setTimeout(async () => {
    try {
      await firestoreService.saveCurrentResume(user.id!, resumeData);
      setLastCloudSaved(new Date());
      setCloudSaveError(null);
      setCloudRetryAttempt(0);
    } catch (error) {
      setCloudSaveError("Cloud save failed — retrying shortly.");
      setCloudRetryAttempt((prev) => Math.min(prev + 1, 5));
    } finally {
      setIsCloudSaving(false);
    }
  }, retryDelay);
}, [user?.id, resumeData, isInitializing, cloudRetryAttempt]);
```

### Rule 2b: Explicit Save to Firestore (Save & Exit)
```typescript
// When: User clicks "Save Resume" button
// Where: ResumeEditor's handleSave() function
// How: Async write with user feedback
// Prerequisites: User must be authenticated
// Result: Resume persisted to cloud with metadata

const handleSave = async () => {
  setIsSaving(true);
  try {
    await saveToDashboard(resumeData);
    toast.success("Resume saved successfully!");
    router.push("/dashboard");
  } finally {
    setIsSaving(false);
  }
};
```

### Rule 3: Load Resume for Editing
```typescript
// Flow:
// 1. User clicks "Edit" on resume card in dashboard
// 2. Resume data stored in sessionStorage
// 3. User navigated to editor page
// 4. Editor retrieves data from sessionStorage
// 5. sessionStorage cleared after loading

// Dashboard (handleEditResume)
sessionStorage.setItem("editResume", JSON.stringify(resume));
router.push("/editor");

// Editor (useResumeEditorContainer)
const saved = sessionStorage.getItem("editResume");
if (saved) {
  setResumeData(JSON.parse(saved));
  sessionStorage.removeItem("editResume");
}
```

### Rule 4: Import Resume
```typescript
// When: User imports JSON file or ResumeForge backup
// Where: Dashboard's import dialog or editor's import button
// How: Parse and validate import data
// Result: Data loaded into editor as new draft

const handleImport = async (file: File) => {
  const result = await importFromFile(file);
  if (result.success) {
    setResumeData(result.data);
    // Data is NOT auto-saved to Firestore
    // User must explicitly click "Save" to persist
  }
};
```

### Rule 5: Export Resume
```typescript
// When: User exports to JSON, PDF, or DOCX
// Where: ResumeEditor or Dashboard
// How: Create download blob/file
// Result: Client-side download, no server write
// Note: Export does NOT modify stored data

const handleExportJSON = (resume: ResumeData) => {
  const json = exportToJSON(resume);
  downloadString(json, `${resume.personalInfo.firstName}.json`, "application/json");
};
```

## Conflict Resolution

### Scenario 1: Offline Editing with Stale Cloud Data
**Problem:** User edits offline, makes changes, then goes online with newer data on cloud.

**Resolution:**
- localStorage draft takes precedence
- User is warned if cloud version is newer
- User can choose to merge or overwrite

```typescript
const cloudData = await loadFromFirestore(resumeId);
const localData = loadFromLocalStorage(resumeId);

if (cloudData.updatedAt > localData.updatedAt) {
  // Warn user about conflict
  showConflictDialog({
    local: localData,
    cloud: cloudData,
  });
}
```

### Scenario 2: Multi-Tab Editing
**Problem:** User edits same resume in two tabs.

**Solution:**
- Storage events listener syncs tabs
- Last write wins (based on timestamp)
- User sees "Refresh" notification if data changed elsewhere

```typescript
window.addEventListener("storage", (event) => {
  if (event.key === `resume_${resumeId}`) {
    showRefreshNotification();
    // User can manually refresh
  }
});
```

### Scenario 3: Save Fails (Network Error)
**Problem:** User clicks "Save" but network is down.

**Resolution:**
- Firestore write fails with error
- localStorage draft remains intact
- User sees error toast with retry option
- Data is NOT lost

```typescript
try {
  await saveToDashboard(resumeData);
} catch (error) {
  toast.error("Failed to save. Check connection and retry.", {
    action: { label: "Retry", onClick: handleSave },
  });
  // Local draft still safe in localStorage
}
```

## Mental Model for Users

### As a User, I Should Understand:

1. **Drafts vs Saved Documents**
   - **Draft**: Current work in localStorage, auto-saved, local only
   - **Saved**: Published to cloud, available across devices

2. **Save Behavior**
   - I edit → Auto-saves to browser (shows "Saved now")
   - I click "Save Resume" → Saves to cloud, appears in dashboard

3. **Recovery**
   - Closes tab without saving? Draft recovers on next visit
   - Clears browser data? Draft is lost (backup is in Firestore if saved)
   - Deletes saved document? Can't recover (unless version history exists)

4. **Multi-Device Sync**
   - Saved resumes sync to all devices
   - Drafts are local (different on each device)
   - Import/export for moving between devices

5. **Offline Access**
   - Can edit saved resumes while offline (localStorage draft)
   - Can't see cloud-only saved resumes while offline
   - Changes auto-save locally, sync when online

## Implementation Details

### useLocalStorage Hook
```typescript
// Auto-saves with debouncing
useLocalStorage(resumeData, {
  key: `resume_${resumeId}`,
  debounce: 500, // milliseconds
  onBeforeSave: (data) => validate(data),
  onError: (error) => showErrorToast(error),
});
```

### useSavedResumes Hook
```typescript
// Manages Firestore resume documents
const {
  resumes,        // Array of saved resumes from Firestore
  isLoading,      // Initial load state
  saveResume,     // Write to Firestore
  deleteResume,   // Delete from Firestore
  updateResume,   // Update existing Firestore document
} = useSavedResumes(userId);
```

### ResumeData Validation
```typescript
// Before saving to Firestore
const validation = resumeService.validate(data);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
}

// Prevents corrupted data from reaching cloud
```

## Testing Data Sync

### Unit Tests
- `lib/services/__tests__/import.test.ts` - Import validation and format detection
- `lib/services/__tests__/export.test.ts` - Export to JSON, PDF, TXT
- `lib/ai/__tests__/mock-analyzer.test.ts` - Resume analysis
- `hooks/__tests__/use-resume.test.ts` - Resume data mutations

### Integration Tests
- Resume editor auto-save flow
- Import + save workflow
- Export + download workflow
- Conflict resolution scenarios

### Manual Testing
1. **Offline Edit**: Edit resume, turn off network, verify changes persist
2. **Multi-Tab**: Open resume in two tabs, edit both, observe sync
3. **Import/Export**: Export JSON, modify in editor, import back
4. **Save Recovery**: Close without saving, reopen, verify draft recovers

## Future Improvements

1. **Version History**
   - Keep snapshots of saved resumes
   - Allow rollback to previous versions
   - Show "changed by" attribution

2. **Real-Time Collaboration**
   - Multiple users editing same resume
   - Operational transform for conflict resolution
   - Live cursor positions

3. **Smart Sync**
   - Detect when offline/online transitions
   - Proactive conflict detection
   - Automatic merge suggestions

4. **Backup & Archive**
   - Automatic daily backups
   - Archive old versions
   - Export history

5. **Cross-Device Clipboard**
   - Copy experience from one resume to another
   - Sync clipboard state across devices
   - Template sharing

## Glossary

- **Draft**: Temporary work-in-progress stored in localStorage
- **Saved Resume**: Published document in Firestore (permanent until deleted)
- **Auto-Save**: Automatic write to localStorage without user action
- **Explicit Save**: Manual write to Firestore via "Save" button
- **Sync**: Ensure all copies of data are up-to-date
- **Fidelity**: Preservation of all data without loss during transfer
- **Debounce**: Delaying action until after pauses in activity

## See Also

- [Resume Architecture](./resume-architecture.md)
- [Storage Service Documentation](../services/)
- [Testing Guide](../testing/)
