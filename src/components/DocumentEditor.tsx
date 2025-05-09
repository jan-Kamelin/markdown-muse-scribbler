
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, ArrowLeft, Share2 } from "lucide-react";
import Editor from './Editor';
import Preview from './Preview';
import Toolbar from './Toolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<{ title: string, content: string } | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("write");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  const fetchDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('title, content')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      
      setDocument(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (error: any) {
      toast({
        title: "Error fetching document",
        description: error.message,
        variant: "destructive",
      });
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setDocument({ title, content });
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToolbarAction = (action: string) => {
    if (action === 'export') {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'document'}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
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
      const newText = insertMarkdown(content, start, end, action);
      setContent(newText);
      
      // Focus back on textarea after formatting
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
        }
      }, 0);
    }
  };

  // Inserting markdown function - copied from your utility
  const insertMarkdown = (
    content: string, 
    selectionStart: number, 
    selectionEnd: number,
    markdownType: string
  ): string => {
    const selectedText = content.substring(selectionStart, selectionEnd);
    let modifiedText = '';
    
    switch (markdownType) {
      case 'bold':
        modifiedText = `**${selectedText}**`;
        break;
      case 'italic':
        modifiedText = `*${selectedText}*`;
        break;
      case 'heading1':
        modifiedText = `# ${selectedText}`;
        break;
      case 'heading2':
        modifiedText = `## ${selectedText}`;
        break;
      case 'heading3':
        modifiedText = `### ${selectedText}`;
        break;
      case 'link':
        modifiedText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        modifiedText = `![${selectedText || 'alt text'}](image-url)`;
        break;
      case 'code':
        modifiedText = `\`${selectedText}\``;
        break;
      case 'codeblock':
        modifiedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case 'quote':
        modifiedText = `> ${selectedText}`;
        break;
      case 'orderedList':
        modifiedText = `1. ${selectedText}`;
        break;
      case 'unorderedList':
        modifiedText = `- ${selectedText}`;
        break;
      case 'horizontalRule':
        modifiedText = `\n---\n${selectedText}`;
        break;
      case 'strikethrough':
        modifiedText = `~~${selectedText}~~`;
        break;
      default:
        modifiedText = selectedText;
        break;
    }

    // Replace selected text with modified text
    return content.substring(0, selectionStart) + modifiedText + content.substring(selectionEnd);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen max-w-7xl">
      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/documents')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Documents
            </Button>
            <Input
              className="text-xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 max-w-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/share/${id}`)}
              className="hidden sm:flex"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={saveDocument} 
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </header>

        {isMobile ? (
          // Mobile view with tabs
          <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <Card>
              <Toolbar onAction={handleToolbarAction} />
              <TabsContent value="write" className="m-0">
                <Editor 
                  value={content} 
                  onChange={setContent}
                />
              </TabsContent>
              <TabsContent value="preview" className="m-0">
                <Preview markdown={content} className="min-h-[500px]" />
              </TabsContent>
            </Card>
          </Tabs>
        ) : (
          // Desktop view with side-by-side panels
          <Card>
            <Toolbar onAction={handleToolbarAction} />
            <div className="grid grid-cols-2 min-h-[600px]">
              <div className="border-r">
                <Editor 
                  value={content} 
                  onChange={setContent}
                  className="rounded-tr-none rounded-r-none border-r-0"
                />
              </div>
              <Preview markdown={content} className="rounded-l-none" />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor;
