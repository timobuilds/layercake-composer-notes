import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/layercake';
import { formatDistance } from 'date-fns';
import { Clock, GitFork, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { Node, NodeWithChildren } from '@/types/layercake';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const createdAt = new Date(project.createdAt);
  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });
  const { toast } = useToast();

  const buildNodeTree = (nodes: Node[], parentId: string | null = null): NodeWithChildren[] => {
    return nodes
      .filter(node => node.parentId === parentId)
      .map(node => ({
        ...node,
        children: buildNodeTree(nodes, node.id)
      }));
  };

  const generateMarkdown = (nodes: NodeWithChildren[], level: number = 0): string => {
    return nodes.map(node => {
      const indent = '#'.repeat(Math.max(1, level + 1));
      let markdown = `${indent} ${node.content}\n\n`;
      
      if (node.children && node.children.length > 0) {
        markdown += generateMarkdown(node.children, level + 1);
      }
      
      return markdown;
    }).join('');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get all nodes for this project
    const projectNodes = storage.getProjectNodes(project.id);
    const rootNodes = buildNodeTree(projectNodes);
    
    // Generate markdown content
    let markdownContent = `# ${project.name}\n\n`;
    markdownContent += generateMarkdown(rootNodes);
    
    navigator.clipboard.writeText(markdownContent);
    toast({
      description: "Project exported as markdown",
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get all nodes for this project
    const projectNodes = storage.getProjectNodes(project.id);
    const rootNodes = buildNodeTree(projectNodes);
    
    // Generate markdown content
    let markdownContent = `# ${project.name}\n\n`;
    markdownContent += generateMarkdown(rootNodes);
    
    // Create and download file
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: "Project downloaded as markdown file",
    });
  };

  return (
    <Link to={`/project/${project.id}`} className="block">
      <Card className="w-full hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">{project.name}</h3>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                v{project.currentVersion}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};