'use client';

import { useState, useEffect } from 'react';
import NoteBlock from './NoteBlock';
import { NoteBlock as NoteBlockType, generateBlockId } from '@/utils/noteBlocks';

interface NotesModalProps {
  title: string;
  blocks: NoteBlockType[];
  onSave: (blocks: NoteBlockType[]) => void;
  onClose: () => void;
  currentUserName: string;
  keyboardInset: number;
  isMobile?: boolean;
  showEditorName?: boolean;
}

export default function NotesModal({
  title,
  blocks: initialBlocks,
  onSave,
  onClose,
  currentUserName,
  keyboardInset,
  isMobile = false,
  showEditorName = true
}: NotesModalProps) {
  const [blocks, setBlocks] = useState<NoteBlockType[]>(initialBlocks);

  const handleUpdateBlock = (blockId: string, newContent: string) => {
    setBlocks(prev => prev.map(block => 
      block.block_id === blockId
        ? {
            ...block,
            content: newContent,
            last_editor_name: currentUserName,
            last_edited_at: Date.now()
          }
        : block
    ));
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.block_id !== blockId));
  };

  const handleAddBlock = () => {
    const newBlock: NoteBlockType = {
      block_id: generateBlockId(),
      content: '',
      last_editor_name: currentUserName,
      last_edited_at: Date.now()
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleSave = () => {
    // Filter out empty blocks before saving
    const nonEmptyBlocks = blocks.filter(block => block.content.trim().length > 0);
    onSave(nonEmptyBlocks);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        touchAction: 'none',
        minHeight: '100vh',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div
        className="bg-white rounded-xl px-4 py-4 sm:px-6 max-w-sm md:max-w-[500px] w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: keyboardInset > 0 ? `translateY(-${keyboardInset}px)` : 'translateY(0)',
          transition: 'transform 0.2s ease-out'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black flex-1 text-center">
            {title}
          </h3>
        </div>
        
        <div className="mb-4">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notes yet. Click &quot;Add Block&quot; to start.</p>
            </div>
          ) : (
            blocks.map(block => (
              <NoteBlock
                key={block.block_id}
                block={block}
                onUpdate={handleUpdateBlock}
                onDelete={handleDeleteBlock}
                isMobile={isMobile}
                showEditorName={showEditorName}
              />
            ))
          )}
        </div>

        <button
          onClick={handleAddBlock}
          className="w-full px-4 py-2 mb-3 rounded-lg font-medium border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Block
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-white select-none"
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none',
              outline: 'none'
            }}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-white select-none"
            style={{ 
              backgroundColor: '#ef4444',
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none',
              outline: 'none'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
