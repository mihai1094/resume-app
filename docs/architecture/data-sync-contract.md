# Data Synchronization Contract

## Overview

This document describes the data synchronization strategy across the ResumeForge application, explaining how data flows between different storage systems (sessionStorage, Firestore) and when each system is used.

## Storage Systems

### 1. **sessionStorage** - Session Draft Backup

- **Scope**: Single browser tab, cleared on tab close
- **Lifespan**: Duration of browser tab
- **Capacity**: ~5-10MB
- **Async**: False (synchronous API)
- **Clearing**: When tab closes, or explicitly cleared after Firestore sync

**Use Cases:**

- Immediate backup during editing (prevents data loss on refresh)
- Recovery prompt on page reload
- Cross-page data transfer during editing flow

**Implementation:** `useSessionDraft()` hook

- Keys: `resume_editor_draft` (data) and `resume_editor_draft_meta` (metadata)
- Saves on every state change (synchronous, no debounce)
- Clears dirty flag after successful Firestore save
- Recovery prompt shown on mount if dirty draft exists

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

- `users/{userId}/resumes/current` - Auto-saved current resume draft (debounced 600ms)
- `users/{userId}/savedResumes/{id}` - Named saved resumes (explicit save)
- `users/{userId}/savedCoverLetters/{id}` - Cover letter documents

### 3. **Source of Truth**

The source of truth hierarchy during editing:

1. **In-memory state** (React) - always reflects latest user input
2. **sessionStorage draft** - immediate backup, checked for recovery on mount
3. **Firestore current resume** - cloud backup, debounced auto-save
4. **Firestore savedResumes** - explicit save target (user clicks "Save")

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Resume Editor                                   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Editor State (useResumeEditorContainer)                           │  │
│  │  - resumeData (ResumeData) - in-memory state                       │  │
│  │  - isDirty (boolean)                                               │  │
│  │  - saveStatusText (string)                                         │  │
│  └─────────────────────────────┬──────────────────────────────────────┘  │
│                                │                                          │
│                    onChange (every state change)                          │
│                                │                                          │
│               ┌────────────────┴────────────────┐                        │
│               ↓                                 ↓                         │
│  ┌────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │  useSessionDraft           │   │  Firestore Auto-Save              │  │
│  │  - Immediate backup        │   │  - Debounced (600ms)              │  │
│  │  - sessionStorage          │   │  - users/{uid}/resumes/current    │  │
│  │  - Sync, no debounce       │   │  - Shows "Saving...", "Saved"     │  │
│  └────────────────────────────┘   └───────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                    User clicks "Save & Exit"
                                │
                                ↓
                ┌───────────────────────────────┐
                │  Firestore savedResumes       │
                │  - users/{uid}/savedResumes/  │
                │  - Explicit save with name    │
                │  - templateId persisted       │
                │  - Shows in Dashboard         │
                └───────────────────────────────┘
                                │
                   ┌────────────┴─────────────┐
                   ↓                          ↓
          ┌─────────────┐           ┌──────────────┐
          │   Export    │           │  Dashboard   │
          │  JSON/PDF   │           │  View/Edit   │
          └─────────────┘           └──────────────┘
```

## Key Synchronization Rules

### Rule 1: Immediate Backup to sessionStorage

```typescript
// When: User changes any resume field
// Where: useResumeEditorContainer via useSessionDraft hook
// How: Synchronous write on every state change (no debounce)
// Result: resumeData backed up immediately to sessionStorage

// Implementation in useResumeEditorContainer:
useEffect(() => {
  if (isInitializing) return;
  if (showRecoveryPrompt) return; // Don't overwrite while showing recovery

  saveDraft(resumeData); // Synchronous sessionStorage write
}, [resumeData, saveDraft, isInitializing, showRecoveryPrompt]);
```

### Rule 2: Auto-Save to Firestore (Authenticated Users)

```typescript
// When: User changes any resume field (authenticated users)
// Where: useResumeEditorContainer hook
// How: Debounced (600ms) automatic write with exponential backoff on failure
// Prerequisites: User must be authenticated
// Result: Resume persisted to cloud at users/{uid}/resumes/current

// Implementation in useResumeEditorContainer:
useEffect(() => {
  if (!user?.id) return;
  if (isInitializing) return;
  if (navigator.onLine === false) {
    setCloudSaveError("Offline — will resume when you're back online.");
    return;
  }

  const baseDelay = 600;
  const retryDelay = Math.min(
    5000,
    baseDelay * Math.max(1, cloudRetryAttempt + 1)
  );

  setIsCloudSaving(true);
  cloudSaveTimeoutRef.current = setTimeout(async () => {
    try {
      await firestoreService.saveCurrentResume(user.id!, resumeData);
      setLastCloudSaved(new Date());
      setCloudSaveError(null);
      setCloudRetryAttempt(0);
      clearDirtyFlag(); // Mark sessionStorage draft as synced
    } catch (error) {
      setCloudSaveError("Cloud save failed — retrying shortly.");
      setCloudRetryAttempt((prev) => Math.min(prev + 1, 5));
    } finally {
      setIsCloudSaving(false);
    }
  }, retryDelay);
}, [user?.id, resumeData, isInitializing, cloudRetryAttempt, clearDirtyFlag]);
```

### Rule 3: Explicit Save to savedResumes (Save & Exit)

```typescript
// When: User clicks "Save Resume" or "Save & Exit" button
// Where: ResumeEditor's handleSave() function
// How: Async write to savedResumes collection with templateId
// Prerequisites: User must be authenticated, firstName required
// Result: Resume persisted to users/{uid}/savedResumes/{id}

const handleSave = async () => {
  const result = await containerHandleSaveAndExit(selectedTemplateId);
  if (result?.success) {
    router.push("/dashboard");
  }
};
```

### Rule 4: Recovery on Page Reload

```typescript
// When: Editor mounts and finds dirty sessionStorage draft
// Where: useResumeEditorContainer hook
// How: Check sessionStorage for draft with isDirty=true
// Result: Show recovery prompt to user

useEffect(() => {
  if (hasCheckedForRecoveryRef.current) return;
  if (isInitializing) return;

  hasCheckedForRecoveryRef.current = true;
  const draft = loadDraft();
  if (draft) {
    setRecoveryDraft(draft);
    setShowRecoveryPrompt(true);
  }
}, [isInitializing, loadDraft]);
```

### Rule 5: Load Resume for Editing

```typescript
// When: User navigates to /editor/{id}
// Where: useResumeDataLoader hook
// How: Fetch from Firestore savedResumes collection
// Result: Resume loaded into editor with templateId

// useResumeDataLoader fetches from:
// - users/{userId}/savedResumes/{resumeId} for existing resumes
// - Returns templateId for template restoration
```

### Rule 6: Import Resume

```typescript
// When: User imports JSON file
// Where: Editor or onboarding flow
// How: Parse, validate, store in sessionStorage, redirect to editor
// Result: Data loaded into editor as new draft

// Import flow stores to sessionStorage:
sessionStorage.setItem("importedResumeData", JSON.stringify(parsedData));
router.push("/editor/new?import=true");

// Editor loads from sessionStorage on mount with isImporting flag
```

### Rule 7: Export Resume

```typescript
// When: User exports to JSON, PDF, or DOCX
// Where: ResumeEditor or Dashboard
// How: Create download blob/file
// Result: Client-side download, no server write
// Note: Export does NOT modify stored data
```

## Conflict Resolution

### Scenario 1: Offline Editing with Stale Cloud Data

**Problem:** User edits offline, makes changes, then goes online with newer data on cloud.

**Resolution:**

- sessionStorage draft takes precedence for current session
- Firestore auto-save resumes when back online
- User sees status indicator when sync completes

```typescript
// Online status is detected, auto-save resumes
useEffect(() => {
  if (navigator.onLine === false) {
    setCloudSaveError("Offline — will resume when you're back online.");
    return;
  }
  // Trigger debounced cloud save when back online
}, [resumeData, navigator.onLine]);
```

### Scenario 2: Multi-Tab Editing

**Problem:** User edits same resume in two tabs.

**Current Behavior:**

- sessionStorage is per-tab (no cross-tab sync)
- Each tab has its own independent draft
- Both tabs auto-save to Firestore (last write wins)
- Cloud auto-save uses the same Firestore location, so tabs compete

**Note:** Unlike localStorage, sessionStorage does NOT trigger storage events across tabs. Each tab operates independently.

```typescript
// Each tab has its own session draft
// Key: resume_editor_draft (per-tab, isolated)
// Tab 1: saves to sessionStorage (isolated)
// Tab 2: saves to sessionStorage (isolated)
// Both tabs: auto-save to Firestore (cloud sync, last write wins)
```

### Scenario 3: Save Fails (Network Error)

**Problem:** User clicks "Save" but network is down.

**Resolution:**

- Firestore write fails with error
- sessionStorage draft remains intact
- User sees error toast with retry option
- Data is NOT lost within the session

```typescript
try {
  await saveToDashboard(resumeData);
} catch (error) {
  toast.error("Failed to save. Check connection and retry.", {
    action: { label: "Retry", onClick: handleSave },
  });
  // Session draft still safe in sessionStorage (within this tab)
}
```

## Mental Model for Users

### As a User, I Should Understand:

1. **Auto-Save vs Explicit Save**

   - **Auto-save**: Changes sync to cloud automatically (shows "Saved just now")
   - **Explicit Save**: Click "Save & Exit" to save to dashboard with a name

2. **Save Behavior**

   - I edit → Auto-saves to cloud (debounced, shows status)
   - I refresh page → Recovery prompt if unsaved changes exist
   - I click "Save & Exit" → Saves to dashboard, navigates away

3. **Recovery**

   - Refreshes tab without saving? Recovery prompt on next load
   - Closes tab? sessionStorage draft lost, but Firestore auto-save may have recent version
   - Deletes saved document? Can't recover (unless version history enabled for premium)

4. **Multi-Device Sync**

   - Saved resumes sync to all devices via Firestore
   - "Current resume" draft is per-user, cloud-synced
   - sessionStorage draft is per-tab only

5. **Offline Access**
   - Offline editing works, changes saved to sessionStorage immediately
   - Firestore auto-save resumes when connection is restored
   - Shows "Offline — will resume when you're back online"
   - Note: sessionStorage is per-tab, so closing the tab loses the draft

## Implementation Details

### useSessionDraft Hook

```typescript
// Immediate backup to sessionStorage (no debounce)
const { saveDraft, loadDraft, clearDirtyFlag, clearDraft } =
  useSessionDraft(resumeId);

// saveDraft() - Called on every state change
// loadDraft() - Returns draft if exists and isDirty
// clearDirtyFlag() - Called after successful Firestore save
// clearDraft() - Called on explicit discard
```

### useSavedResumes Hook

```typescript
// Manages Firestore savedResumes collection
const {
  resumes, // Array of saved resumes from Firestore
  isLoading, // Initial load state
  saveResume, // Write to savedResumes (explicit save)
  deleteResume, // Delete from savedResumes
  updateResume, // Update existing resume
} = useSavedResumes(userId);
```

### useResumeEditorContainer Hook

```typescript
// Orchestrates all persistence concerns
const {
  resumeData, // Current in-memory state
  isDirty, // Has unsaved changes
  saveStatusText, // "Saving...", "Saved just now", etc.
  cloudSaveError, // Error message if save failed
  handleSaveAndExit, // Explicit save to savedResumes
  showRecoveryPrompt, // Show recovery dialog
  handleRecoverDraft, // Accept recovered draft
  handleDiscardDraft, // Discard recovered draft
} = useResumeEditorContainer({ resumeId });
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

- **Draft**: Temporary work-in-progress stored in sessionStorage (per-tab)
- **Saved Resume**: Published document in Firestore (permanent until deleted)
- **Auto-Save**: Automatic write to Firestore (debounced 600ms) and sessionStorage (immediate)
- **Explicit Save**: Manual write to Firestore savedResumes collection via "Save & Exit" button
- **Sync**: Ensure all copies of data are up-to-date
- **Fidelity**: Preservation of all data without loss during transfer
- **Debounce**: Delaying action until after pauses in activity
- **sessionStorage**: Browser storage scoped to a single tab, cleared when tab closes

## See Also

- [Resume Architecture](./resume-architecture.md)
- [Storage Service Documentation](../services/)
- [Testing Guide](../testing/)
