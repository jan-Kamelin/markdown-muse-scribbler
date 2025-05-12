import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, UserPlus, Trash2, Loader2 } from "lucide-react";

interface Collaborator {
  id: string;
  user_id: string;
  email: string;
  permission: string;
}

interface Document {
  id: string;
  title: string;
}

const ShareDocument = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchDocument(id);
      fetchCollaborators(id);
    }
  }, [id]);

  const fetchDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      
      setDocument(data);
    } catch (error: any) {
      toast({
        title: "Error fetching document",
        description: error.message,
        variant: "destructive",
      });
      navigate('/documents');
    }
  };

  const fetchCollaborators = async (documentId: string) => {
    try {
      // Get collaborators with their permissions
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          id,
          user_id,
          permission
        `)
        .eq('document_id', documentId);

      if (error) throw error;

      // We need to fetch user emails separately
      // For each collaborator, we can use the auth API to get user details
      const collaboratorsWithEmails = await Promise.all((data || []).map(async (collab) => {
        try {
          // Instead of directly trying to query users table (which isn't accessible),
          // we rely on a different approach - either ask user to provide email
          // or store emails in a separate table we create
          // For now, we'll just use a placeholder
          return {
            ...collab,
            email: `user-${collab.user_id.substring(0, 8)}@example.com` // Placeholder
          };
        } catch (error) {
          return {
            ...collab,
            email: 'Unknown user'
          };
        }
      }));
      
      setCollaborators(collaboratorsWithEmails as Collaborator[]);
    } catch (error: any) {
      toast({
        title: "Error fetching collaborators",
        description: "Could not load collaborator information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCollaborator = async () => {
    if (!email || !permission) return;
    
    setAddingCollaborator(true);
    try {
      // We need to find the user ID from their email
      // Since we can't query the auth.users table directly, we need an alternative approach
      // For now, let's implement a simplified version that assumes we have the user ID
      
      // In a real implementation, you might:
      // 1. Create a users/profiles table in public schema that maps emails to user IDs
      // 2. Use an edge function that has access to admin privileges
      // 3. Have a user search functionality
      
      // For this demo, we'll show an error message
      toast({
        title: "Feature limitation",
        description: "Adding collaborators by email requires additional setup. Please check the documentation.",
        variant: "destructive",
      });
      
    } catch (error: any) {
      toast({
        title: "Error adding collaborator",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingCollaborator(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/documents')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to documents
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Share "{document?.title}"</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={permission}
                onValueChange={setPermission}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={addCollaborator}
                disabled={!email || addingCollaborator}
              >
                {addingCollaborator ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Add
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Collaborators</h3>
              {collaborators.length === 0 ? (
                <p className="text-muted-foreground">No collaborators yet.</p>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                      <div>
                        <p className="font-medium">{collaborator.email}</p>
                        <p className="text-sm text-muted-foreground capitalize">{collaborator.permission}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCollaborator(collaborator.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareDocument;
