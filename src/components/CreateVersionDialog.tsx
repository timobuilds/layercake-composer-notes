import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectVersion } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { GitBranch, Save } from 'lucide-react';

interface CreateVersionDialogProps {
  projectId: string;
  onVersionCreated: () => void;
}

export const CreateVersionDialog = ({ projectId, onVersionCreated }: CreateVersionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (version.trim() && name.trim()) {
      const nodes = storage.getProjectNodes(projectId);
      storage.createVersion(projectId, version.trim(), name.trim(), nodes, description.trim());
      onVersionCreated();
      setVersion('');
      setName('');
      setDescription('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <GitBranch className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Version</DialogTitle>
          <DialogDescription className="text-xs">
            Save the current state of your project as a new version.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              size="sm"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!version.trim() || !name.trim()} size="sm" className="text-xs">
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};