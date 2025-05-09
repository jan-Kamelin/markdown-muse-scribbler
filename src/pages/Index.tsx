
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  insertMarkdown, 
  exportMarkdown 
} from '@/utils/markdownUtils';

const Index = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("write");
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Load markdown from localStorage on component mount
  useEffect(() => {
    const savedMarkdown = loadFromLocalStorage();
    setMarkdown(savedMarkdown);
  }, []);

  // Save markdown to localStorage whenever it changes
  useEffect(() => {
    if (markdown) {
      saveToLocalStorage(markdown);
    }
  }, [markdown]);

  const handleToolbarAction = (action: string) => {
    if (action === 'export') {
      exportMarkdown(markdown);
      toast({
        title: "Markdown Exported",
        description: "Your document has been exported as a .md file",
      });
      return;
    }

    // Handle formatting actions
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = insertMarkdown(markdown, start, end, action);
      setMarkdown(newText);
      
      // Focus back on textarea after formatting
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen max-w-7xl">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-center mb-1">Markdown Muse</h1>
          <p className="text-center text-muted-foreground">A simple markdown editor and preview tool</p>
        </header>

        {isMobile ? (
          // Mobile view with tabs
          <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <Card>
              <CardContent className="p-0">
                <Toolbar onAction={handleToolbarAction} />
                <TabsContent value="write" className="m-0">
                  <Editor 
                    value={markdown} 
                    onChange={setMarkdown}
                  />
                </TabsContent>
                <TabsContent value="preview" className="m-0">
                  <Preview markdown={markdown} className="min-h-[500px]" />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        ) : (
          // Desktop view with side-by-side panels
          <Card>
            <CardContent className="p-0">
              <Toolbar onAction={handleToolbarAction} />
              <div className="grid grid-cols-2 min-h-[600px]">
                <div className="border-r">
                  <Editor 
                    value={markdown} 
                    onChange={setMarkdown}
                    className="rounded-tr-none rounded-r-none border-r-0"
                  />
                </div>
                <Preview markdown={markdown} className="rounded-l-none" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
