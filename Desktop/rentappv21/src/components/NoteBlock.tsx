'use client';

import { useState, useRef, useEffect } from 'react';
import { NoteBlock as NoteBlockType, formatTimeAgo } from '@/utils/noteBlocks';

interface NoteBlockProps {
  block: NoteBlockType;
  onUpdate: (blockId: string, newContent: string) => void;
  onDelete: (blockId: string) => void;
  isMobile?: boolean;
  showEditorName?: boolean;
}

export default function NoteBlock({ block, onUpdate, onDelete, isMobile = false, showEditorName = true }: NoteBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content, isEditing]);

  const handleSave = () => {
    if (content.trim()) {
      onUpdate(block.block_id, content.trim());
      setIsEditing(false);
    } else {
      // Empty content, delete the block
      onDelete(block.block_id);
    }
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditing) {
      const target = e.currentTarget as any;
      const now = Date.now();
      const lastTap = target.lastTap || 0;
      
      if (now - lastTap < 300) {
        // Double tap detected
        e.preventDefault();
        setIsEditing(true);
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              const length = textareaRef.current.value.length;
              textareaRef.current.setSelectionRange(length, length);
            }
          }, 0);
        });
      }
      target.lastTap = now;
    }
  };

  return (
    <div className="mb-4">
      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            className="w-full px-3 py-2 rounded-lg border-2 border-blue-400 text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1.5 rounded-lg font-medium text-white text-sm"
              style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.9)',
                outline: 'none'
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-1.5 rounded-lg font-medium text-white text-sm"
              style={{ 
                backgroundColor: '#ef4444',
                outline: 'none'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
          >
            <p className="text-gray-800 whitespace-pre-wrap">{block.content}</p>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-light">
            {showEditorName ? (
              <>— {block.last_editor_name} · {formatTimeAgo(block.last_edited_at, isMobile)}</>
            ) : (
              <>— {formatTimeAgo(block.last_edited_at, isMobile)}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
