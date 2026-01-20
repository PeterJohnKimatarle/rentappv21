# Block-Level Author Attribution Implementation

## Overview

Implemented a simple block-level author attribution system for collaborative notes in the property rental app. This MVP tracks the last editor of each note block without version history or complex ownership logic.

## Features Implemented

### Data Model
- **block_id**: Unique identifier for each block
- **content**: The text content of the block
- **last_editor_name**: Name of the person who last edited the block
- **last_edited_at**: Timestamp (ms) of the last edit

### Behavior
- Every edit (typing, paste, formatting, any change) updates:
  - `last_editor_name` to the current user
  - `last_edited_at` to the current timestamp
- No exceptions - all edits are tracked

### UI Features
- Attribution displayed below each block
- Styling:
  - Muted gray text (`text-gray-500`)
  - Small font size (`text-xs`)
  - Light font weight (`font-light`)
  - 8px spacing below block (`mt-2`)
- Attribution never appears inline with content

### Attribution Format by Note Type

1. **Staff Notes (Property Notes)**: **Full attribution with name and time**
   - Desktop: **— Peter · 2h ago**
   - Mobile: **— Peter · 2h**
   - Tracks who last edited for collaboration transparency

2. **User Notes (Behavior)**: **Time only (no name)**
   - Desktop: **— 2h ago**
   - Mobile: **— 2h**
   - Name hidden for privacy (multiple staff can view/edit)

3. **Private Notes**: **Time only (no name)**
   - Desktop: **— 2h ago**
   - Mobile: **— 2h**
   - Name unnecessary (single owner)

## Files Created/Modified

### New Files
- `src/utils/noteBlocks.ts` - Core block utilities and storage functions
- `src/components/NoteBlock.tsx` - Individual block component with attribution
- `src/components/NotesModal.tsx` - Modal for managing blocks

### Modified Files
- `src/app/property/[id]/page.tsx` - Integrated block-based notes system

## How to Use

### For Staff/Admin - Property Notes
1. Click "Follow-up notes" button on property page
2. Click "Add Block" to create a new note block
3. Double-click/tap any block to edit
4. Each block shows **who last edited it and when** (e.g., "— Peter · 2h ago")

### For Staff/Admin - User Behavior Notes
1. View a property owner's profile
2. Click "User notes (Behaviour)"
3. Add and edit blocks to track user behavior
4. Each block shows **only the time** (e.g., "— 2h ago") for privacy

### For Property Owners - Private Notes
1. View your own property
2. Click "Private Notes" button
3. Add blocks for personal notes (only visible to you)
4. Each block shows **only the time** (e.g., "— 2h ago")

## Technical Details

### Storage
- Blocks stored in localStorage as JSON
- Backward compatible with old plain-text notes
- Old notes automatically converted to single block on first load

### Attribution Format

**Staff Notes (Property Notes):**
- Desktop: "— Name · 2h ago" / "— Name · 3d ago"
- Mobile: "— Name · 2h" / "— Name · 3d"
- Just now: "— Name · just now" / "— Name · now"

**User Notes & Private Notes:**
- Desktop: "— 2h ago" / "— 3d ago"
- Mobile: "— 2h" / "— 3d"
- Just now: "— just now" / "— now"

### Privacy Design
- **Staff Notes**: Show editor name for transparency in team collaboration
- **User Notes**: Hide editor name to protect staff privacy when tracking user behavior
- **Private Notes**: Hide editor name (unnecessary, only one owner)

## What's NOT Implemented (By Design)
- ❌ Block history
- ❌ Track changes / diffs
- ❌ Color coding
- ❌ Avatars
- ❌ Hover interactions
- ❌ Filters
- ❌ Original author tracking (only last editor)

## Migration

Existing notes are automatically migrated:
- Old plain-text notes → Single block with "Unknown" as editor
- Old timestamped private notes → Single block with actual timestamp preserved
- All future edits will use the new block system

## Testing

Run TypeScript check:
```bash
npx tsc --noEmit
```

Start dev server:
```bash
npm run dev
```

Test scenarios:
1. Create new property note blocks
2. Edit existing blocks (verify attribution updates)
3. Add multiple blocks
4. Delete blocks (empty content)
5. Check mobile responsiveness
