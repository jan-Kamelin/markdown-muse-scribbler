
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";

interface PreviewProps {
  markdown: string;
  className?: string;
}

const Preview: React.FC<PreviewProps> = ({ markdown, className }) => {
  return (
    <Card className={`p-6 overflow-auto h-full rounded-bl-md rounded-r-md ${className}`}>
      <div className="markdown-preview prose max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </Card>
  );
};

export default Preview;
