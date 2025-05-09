
import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { insertMarkdown } from '@/utils/markdownUtils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, onKeyDown, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      switch (e.key) {
        case 'b': // Bold
          e.preventDefault();
          const boldText = insertMarkdown(value, start, end, 'bold');
          onChange(boldText);
          break;
        case 'i': // Italic
          e.preventDefault();
          const italicText = insertMarkdown(value, start, end, 'italic');
          onChange(italicText);
          break;
        // Add more keyboard shortcuts if desired
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleTabKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert two spaces for tab
      const newText = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newText);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        handleKeyDown(e);
        handleTabKey(e);
      }}
      className={`h-full min-h-[500px] font-mono resize-none p-4 rounded-b-md rounded-tr-md focus-visible:ring-1 ${className}`}
      placeholder="Write your markdown here..."
      spellCheck="true"
    />
  );
};

export default Editor;
