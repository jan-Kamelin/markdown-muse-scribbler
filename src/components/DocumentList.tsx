
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, FileText, Trash2, Share2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  id: string;
  title: string;
  created_at: string;
}

const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, created_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    if (!newDocTitle.trim() || !user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          { 
            title: newDocTitle, 
            content: '# ' + newDocTitle + '\n\nStart writing here...', 
            user_id: user.id 
          }
        ])
        .select();

      if (error) throw error;
      
      setNewDocTitle('');
      setIsDialogOpen(false);
      fetchDocuments();
      
      if (data && data[0]) {
        navigate(`/editor/${data[0].id}`);
      }
      
    } catch (error: any) {
      toast({
        title: "Error creating document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenDocument = (id: string) => {
    navigate(`/editor/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Documents</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new document</DialogTitle>
              <DialogDescription>
                Enter a name for your new document.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="My awesome document"
              />
            </div>
            <DialogFooter>
              <Button onClick={createDocument} disabled={isCreating || !newDocTitle.trim()}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
          <p className="mt-2 text-muted-foreground">
            Create your first document to get started.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create a document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2 truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between mt-4 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenDocument(doc.id)}
                >
                  <FileText className="h-4 w-4 mr-1" /> Open
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate(`/share/${doc.id}`)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
