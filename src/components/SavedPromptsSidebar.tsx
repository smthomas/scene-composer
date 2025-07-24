import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Save, FolderOpen, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { promptStorage, SavedPrompt } from '@/lib/promptStorage';
import { MetadataFields, TimelineSequence } from './YamlGenerator';

interface SavedPromptsSidebarProps {
  metadata: MetadataFields;
  sequences: TimelineSequence[];
  onLoadPrompt: (metadata: MetadataFields, sequences: TimelineSequence[]) => void;
}

export const SavedPromptsSidebar: React.FC<SavedPromptsSidebarProps> = ({
  metadata,
  sequences,
  onLoadPrompt
}) => {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptName, setPromptName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSavedPrompts();
  }, []);

  const loadSavedPrompts = () => {
    setSavedPrompts(promptStorage.getAll());
  };

  const handleSavePrompt = () => {
    try {
      const savedPrompt = promptStorage.save(metadata, sequences, promptName);
      loadSavedPrompts();
      setSaveDialogOpen(false);
      // Don't clear the prompt name here, let onOpenChange handle it
      toast({
        title: "Prompt saved",
        description: `"${savedPrompt.name}" has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not save the prompt.",
        variant: "destructive"
      });
    }
  };

  const handleLoadPrompt = (prompt: SavedPrompt) => {
    onLoadPrompt(prompt.metadata, prompt.sequences);
    setSidebarOpen(false);
    toast({
      title: "Prompt loaded",
      description: `"${prompt.name}" has been loaded.`
    });
  };

  const handleDeletePrompt = (id: string, name: string) => {
    try {
      promptStorage.delete(id);
      loadSavedPrompts();
      toast({
        title: "Prompt deleted",
        description: `"${name}" has been deleted.`
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Could not delete the prompt.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex gap-2">
      {/* Save Button */}
      <Sheet open={saveDialogOpen} onOpenChange={(open) => {
        setSaveDialogOpen(open);
        if (open && metadata.prompt_name) {
          setPromptName(metadata.prompt_name);
        }
      }}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:shadow-elegant transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Prompt
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Save Prompt</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt Name</label>
              <Input
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                placeholder="Enter prompt name"
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSavePrompt}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                Save Prompt
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Saved Prompts Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:shadow-elegant transition-all duration-300"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Saved Prompts
            {savedPrompts.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {savedPrompts.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Saved Prompts</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="space-y-3">
              {savedPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No saved prompts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save your current prompt to get started
                  </p>
                </div>
              ) : (
                savedPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="p-4 hover:shadow-elegant transition-all duration-300 cursor-pointer group"
                    onClick={() => handleLoadPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-1">
                          {prompt.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(prompt.updatedAt)}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-muted-foreground truncate">
                            Style: {prompt.metadata.base_style}
                          </p>
                          <p className="text-muted-foreground">
                            Sequences: {prompt.sequences.length}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrompt(prompt.id, prompt.name);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};