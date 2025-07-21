import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectVersion } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { formatDistance } from 'date-fns';
import { History, RotateCcw, Calendar, GitMerge, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VersionHistoryDialogProps {
  projectId: string;
  onVersionRestored: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const VersionHistoryDialog = ({ 
  projectId, 
  onVersionRestored,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}: VersionHistoryDialogProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const { toast } = useToast();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const loadVersions = () => {
    setVersions(storage.getProjectVersions(projectId));
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
      <DialogContent className="sm:max-w-[700px] max-h-[700px]">
        <DialogHeader>
          <DialogTitle className="text-base">Version History</DialogTitle>
          <DialogDescription className="text-xs">
            View, restore, and merge previous versions of your project.
          </DialogDescription>
        </DialogHeader>
        
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

        <div className="max-h-[500px] overflow-y-auto">
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
                  
                  return (
                    <div key={version.id} className="relative flex items-start gap-4 pb-4">
                      {/* Timeline node */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className={`w-3 h-3 rounded-full border-2 bg-background relative z-10 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-primary bg-primary' 
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
                        isSelected ? 'border-primary bg-primary/5' : 'border-border/40'
                      }`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm flex items-center gap-2">
                                {version.name}
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
      </DialogContent>
    </Dialog>
  );
};