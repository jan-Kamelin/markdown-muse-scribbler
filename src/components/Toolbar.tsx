
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered,
  Quote, 
  Code, 
  Link, 
  Image, 
  FileDown,
  Strikethrough,
  Minus
} from "lucide-react";

interface ToolbarProps {
  onAction: (action: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAction }) => {
  const tools = [
    { icon: <Bold size={18} />, action: 'bold', tooltip: 'Bold (Ctrl+B)' },
    { icon: <Italic size={18} />, action: 'italic', tooltip: 'Italic (Ctrl+I)' },
    { icon: <Strikethrough size={18} />, action: 'strikethrough', tooltip: 'Strikethrough' },
    { icon: <Heading1 size={18} />, action: 'heading1', tooltip: 'Heading 1' },
    { icon: <Heading2 size={18} />, action: 'heading2', tooltip: 'Heading 2' },
    { icon: <Heading3 size={18} />, action: 'heading3', tooltip: 'Heading 3' },
    { icon: <List size={18} />, action: 'unorderedList', tooltip: 'Bullet List' },
    { icon: <ListOrdered size={18} />, action: 'orderedList', tooltip: 'Numbered List' },
    { icon: <Quote size={18} />, action: 'quote', tooltip: 'Quote' },
    { icon: <Code size={18} />, action: 'code', tooltip: 'Inline Code' },
    { icon: <Code size={18} />, action: 'codeblock', tooltip: 'Code Block', className: "rotate-90" },
    { icon: <Link size={18} />, action: 'link', tooltip: 'Link' },
    { icon: <Image size={18} />, action: 'image', tooltip: 'Image' },
    { icon: <Minus size={18} />, action: 'horizontalRule', tooltip: 'Horizontal Line' },
    { icon: <FileDown size={18} />, action: 'export', tooltip: 'Export .md File' },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-secondary/50 rounded-t-md">
      {tools.map((tool) => (
        <Tooltip key={tool.action}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${tool.className || ''}`}
              onClick={() => onAction(tool.action)}
            >
              {tool.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tool.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default Toolbar;
