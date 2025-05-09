
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
      // This is a join query that gets collaborator info along with user emails
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          id,
          user_id,
          permission,
          documents!inner(title)
        `)
        .eq('document_id', documentId);

      if (error) throw error;

      // We need to get emails separately since we can't directly join with auth.users
      const collaboratorsWithEmails = await Promise.all((data || []).map(async (collab) => {
        // For each collaborator, we can use the auth API to get user details
        const { data: userData } = await supabase.auth.admin.getUserById(collab.user_id);
        return {
          ...collab,
          email: userData?.user?.email || 'Unknown user'
        };
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
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')  // This would need to be replaced with an appropriate lookup method
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error("User with that email not found");
      }

      // Then add them as a collaborator
      const { error } = await supabase
        .from('collaborators')
        .insert([
          { document_id: id, user_id: userData.id, permission }
        ]);

      if (error) throw error;

      setEmail('');
      setPermission('viewer');
      toast({
        title: "Collaborator added",
        description: `${email} has been added as a ${permission}.`,
      });
      fetchCollaborators(id!);
      
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
