import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectVersion } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { formatDistance } from 'date-fns';
import { History, RotateCcw, Calendar, GitMerge, GitBranch, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VersionHistoryDialogProps {
  projectId: string;
  onVersionRestored: () => void;
  onVersionCreated?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const VersionHistoryDialog = ({ 
  projectId, 
  onVersionRestored,
  onVersionCreated,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}: VersionHistoryDialogProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [version, setVersion] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (version.trim() && name.trim()) {
      const nodes = storage.getProjectNodes(projectId);
      storage.createVersion(projectId, version.trim(), name.trim(), nodes, description.trim());
      loadVersions();
      onVersionCreated?.();
      setVersion('');
      setName('');
      setDescription('');
      toast({
        title: "Version Created",
        description: `Version ${version.trim()} has been created successfully.`,
      });
    }
  };

  const loadVersions = () => {
    setVersions(storage.getProjectVersions(projectId));
    setCurrentProject(storage.getProject(projectId));
  };

  const handleRestore = (versionId: string) => {
    storage.restoreVersion(projectId, versionId);
    onVersionRestored();
    toast({
      title: "Version Restored",
      description: "Project has been restored to the selected version.",
    });
    setIsOpen(false);
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  const handleMerge = (destructive: boolean = false) => {
    if (selectedVersions.length !== 2) return;
    
    try {
      storage.mergeVersions(projectId, selectedVersions[0], selectedVersions[1], destructive);
      loadVersions();
      setSelectedVersions([]);
      toast({
        title: "Versions Merged",
        description: `${destructive ? 'Destructive' : 'Non-destructive'} merge completed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "Failed to merge versions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) loadVersions();
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[700px]">
        <DialogHeader>
          <DialogTitle className="text-base">Version Manager</DialogTitle>
          <DialogDescription className="text-xs">
            Create new versions, view history, and merge previous versions of your project.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="text-xs">Version History</TabsTrigger>
            <TabsTrigger value="create" className="text-xs">Create Version</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateVersion} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="version" className="text-xs">Version Number</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.1.0"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Version Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Initial structure"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What changed in this version?"
                  className="text-xs min-h-[60px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={!version.trim() || !name.trim()} size="sm" className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Create Version
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
        
        {selectedVersions.length === 2 && (
          <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border">
            <div className="text-xs text-muted-foreground flex-1">
              Selected {selectedVersions.length} versions for merge
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleMerge(false)}
              className="text-xs"
            >
              <GitMerge className="h-3 w-3 mr-1" />
              Non-destructive Merge
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => handleMerge(true)}
              className="text-xs"
            >
              <GitMerge className="h-3 w-3 mr-1" />
              Destructive Merge
            </Button>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No versions saved yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {versions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((version, index) => {
                  const createdAt = new Date(version.createdAt);
                  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });
                  const isSelected = selectedVersions.includes(version.id);
                  const isMergeVersion = version.name.startsWith('Merge:');
                  const isCurrentVersion = currentProject && version.version === currentProject.currentVersion;
                  
                  return (
                    <div key={version.id} className="relative flex items-start gap-4 pb-4">
                      {/* Timeline node */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className={`w-3 h-3 rounded-full border-2 bg-background relative z-10 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : isCurrentVersion
                                ? 'border-green-500 bg-green-500 ring-2 ring-green-200'
                                : isMergeVersion
                                  ? 'border-orange-500 bg-orange-500'
                                  : 'border-muted-foreground hover:border-primary'
                          }`}
                          onClick={() => handleVersionSelect(version.id)}
                        >
                          {isMergeVersion && (
                            <GitMerge className="h-2 w-2 text-white absolute top-0.5 left-0.5" />
                          )}
                        </div>
                        
                        {/* Branch indicator for merge versions */}
                        {isMergeVersion && index < versions.length - 1 && (
                          <div className="absolute left-1.5 top-3 w-8 h-8">
                            <div className="absolute top-0 left-0 w-0.5 h-4 bg-border transform rotate-45 origin-bottom"></div>
                            <div className="absolute top-2 left-2 w-0.5 h-4 bg-border transform -rotate-45 origin-top"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Version card */}
                      <Card className={`flex-1 border transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : isCurrentVersion
                            ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                            : 'border-border/40'
                      }`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm flex items-center gap-2">
                                {version.name}
                                {isCurrentVersion && (
                                  <span className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                    CURRENT
                                  </span>
                                )}
                                {isMergeVersion && (
                                  <GitBranch className="h-3 w-3 text-orange-500" />
                                )}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <span className="font-mono text-xs">v{version.version}</span>
                                <span className="text-xs">•</span>
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{timeAgo}</span>
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVersionSelect(version.id)}
                                className={`text-xs ${isSelected ? 'bg-primary/10' : ''}`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(version.id)}
                                className="text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {version.description && (
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">{version.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};