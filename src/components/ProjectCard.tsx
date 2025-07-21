import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/layercake';
import { formatDistance } from 'date-fns';
import { FileText, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const createdAt = new Date(project.createdAt);
  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{project.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {timeAgo} • v{project.currentVersion}
              </p>
            </div>
          </div>
          <Link to={`/project/${project.id}`}>
            <Button variant="default" size="sm" className="text-xs">
              Open
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};