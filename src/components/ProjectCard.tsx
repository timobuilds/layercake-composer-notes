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
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-creative/10 border border-primary/20">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                Created {timeAgo}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link to={`/project/${project.id}`}>
          <Button variant="soft" className="w-full group-hover:bg-primary/10 group-hover:text-primary">
            Open Project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};