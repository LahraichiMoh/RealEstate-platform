import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string;
  coverImage: string | null;
  floorsCount: number;
}

async function getProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        location: true,
        coverImage: true,
        floorsCount: true,
      },
    });
    return projects;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export const metadata = {
  title: "Real Estate Projects",
  description: "Explore our premium residential projects",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Explore our premium residential developments and find your perfect home
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Projects Available</h2>
              <p className="text-muted-foreground">
                Check back soon for our upcoming projects
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: Project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {project.coverImage && (
                      <div className="w-full h-48 bg-slate-200 overflow-hidden">
                        <img
                          src={project.coverImage || "/placeholder.svg"}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {project.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {project.floorsCount} Floors
                        </span>
                        <Button variant="outline" size="sm">
                          View Project
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
