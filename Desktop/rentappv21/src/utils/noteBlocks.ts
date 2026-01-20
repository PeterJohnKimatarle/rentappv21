// Block-level author attribution for collaborative notes

export interface NoteBlock {
  block_id: string;
  content: string;
  last_editor_name: string;
  last_edited_at: number; // timestamp in ms
}

export interface NotesData {
  blocks: NoteBlock[];
}

// Generate unique block ID
export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Format time ago (e.g., "2h ago")
export const formatTimeAgo = (timestamp: number, short: boolean = false): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) {
    return short ? `${days}d` : `${days}d ago`;
  }
  if (hours > 0) {
    return short ? `${hours}h` : `${hours}h ago`;
  }
  if (minutes > 0) {
    return short ? `${minutes}m` : `${minutes}m ago`;
  }
  return short ? 'now' : 'just now';
};

// Get staff notes as blocks
export const getStaffNotesBlocks = (propertyId: string): NoteBlock[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `rentapp_notes_staff_${propertyId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return [];
    
    // Try to parse as blocks format
    try {
      const parsed = JSON.parse(data) as NotesData;
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks;
      }
    } catch {
      // Old format (plain text) - convert to single block
      return [{
        block_id: generateBlockId(),
        content: data,
        last_editor_name: 'Unknown',
        last_edited_at: Date.now()
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting staff notes blocks:', error);
    return [];
  }
};

// Save staff notes as blocks
export const saveStaffNotesBlocks = (propertyId: string, blocks: NoteBlock[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = `rentapp_notes_staff_${propertyId}`;
    const data: NotesData = { blocks };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('notesChanged'));
    return true;
  } catch (error) {
    console.error('Error saving staff notes blocks:', error);
    return false;
  }
};

// Get user notes as blocks
export const getUserNotesBlocks = (userId: string): NoteBlock[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `rentapp_user_notes_staff_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return [];
    
    // Try to parse as blocks format
    try {
      const parsed = JSON.parse(data) as NotesData;
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks;
      }
    } catch {
      // Old format (plain text) - convert to single block
      return [{
        block_id: generateBlockId(),
        content: data,
        last_editor_name: 'Unknown',
        last_edited_at: Date.now()
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user notes blocks:', error);
    return [];
  }
};

// Save user notes as blocks
export const saveUserNotesBlocks = (userId: string, blocks: NoteBlock[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = `rentapp_user_notes_staff_${userId}`;
    const data: NotesData = { blocks };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('userNotesChanged'));
    return true;
  } catch (error) {
    console.error('Error saving user notes blocks:', error);
    return false;
  }
};

// Get private notes as blocks
export const getPrivateNotesBlocks = (propertyId: string, userId: string): NoteBlock[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `rentapp_notes_${userId}_${propertyId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return [];
    
    // Try to parse as new format with blocks
    try {
      const parsed = JSON.parse(data);
      
      // Check if it's blocks format
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks;
      }
      
      // Check if it's the timestamp format (notes + lastEdited)
      if (parsed.notes !== undefined) {
        return [{
          block_id: generateBlockId(),
          content: parsed.notes,
          last_editor_name: 'You',
          last_edited_at: parsed.lastEdited || Date.now()
        }];
      }
    } catch {
      // Old format (plain text) - convert to single block
      return [{
        block_id: generateBlockId(),
        content: data,
        last_editor_name: 'You',
        last_edited_at: Date.now()
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting private notes blocks:', error);
    return [];
  }
};

// Save private notes as blocks
export const savePrivateNotesBlocks = (propertyId: string, userId: string, blocks: NoteBlock[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = `rentapp_notes_${userId}_${propertyId}`;
    const data: NotesData = { blocks };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Update the property's updatedAt field when notes are edited
    try {
      const existingProperties = JSON.parse(
        localStorage.getItem('rentapp_properties') || '[]'
      );
      
      const propertyIndex = existingProperties.findIndex((p: any) => p.id === propertyId);
      
      if (propertyIndex !== -1) {
        const existingProperty = existingProperties[propertyIndex];
        // Only update if the user owns the property
        if (existingProperty.ownerId === userId) {
          existingProperties[propertyIndex] = {
            ...existingProperty,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('rentapp_properties', JSON.stringify(existingProperties));
        }
      }
    } catch (propertyError) {
      console.error('Error updating property updatedAt when saving notes:', propertyError);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('privateNotesChanged', { detail: { propertyId, userId } }));
    return true;
  } catch (error) {
    console.error('Error saving private notes blocks:', error);
    return false;
  }
};

// Check if there are any notes (for indicator dot)
export const hasAnyNotes = (blocks: NoteBlock[]): boolean => {
  return blocks.some(block => block.content.trim().length > 0);
};
