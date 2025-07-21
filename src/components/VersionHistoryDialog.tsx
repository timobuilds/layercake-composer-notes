import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectVersion } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { formatDistance } from 'date-fns';
import { History, RotateCcw, Calendar } from 'lucide-react';

interface VersionHistoryDialogProps {
  projectId: string;
  onVersionRestored: () => void;
}

export const VersionHistoryDialog = ({ projectId, onVersionRestored }: VersionHistoryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);

  const loadVersions = () => {
    setVersions(storage.getProjectVersions(projectId));
  };

  const handleRestore = (versionId: string) => {
    storage.restoreVersion(projectId, versionId);
    onVersionRestored();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) loadVersions();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <History className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-base">Version History</DialogTitle>
          <DialogDescription className="text-xs">
            View and restore previous versions of your project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No versions saved yet.</p>
            </div>
          ) : (
            versions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((version) => {
                const createdAt = new Date(version.createdAt);
                const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });
                
                return (
                  <Card key={version.id} className="border border-border/40">
                    <CardHeader className="pb-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">{version.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <span className="font-mono text-xs">v{version.version}</span>
                            <span className="text-xs">•</span>
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{timeAgo}</span>
                          </CardDescription>
                        </div>
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
                    </CardHeader>
                    {version.description && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{version.description}</p>
                      </CardContent>
                    )}
                  </Card>
                );
              })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};