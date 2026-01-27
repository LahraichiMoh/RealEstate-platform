import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Home, Zap } from "lucide-react";

export const metadata = {
  title: "Real Estate Platform - Premium Residential Projects",
  description: "Explore premium residential developments and find your perfect home",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                Find Your Dream Home
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Explore our premium residential developments with interactive 3D building views
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/projects">
                <Button size="lg" className="gap-2">
                  Explore Projects
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 md:h-full bg-gradient-to-b from-blue-100 to-purple-100 rounded-lg overflow-hidden flex items-center justify-center">
            <Building2 className="w-48 h-48 text-blue-400 opacity-50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of real estate with our innovative platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Interactive 3D Views",
                description: "Explore buildings in stunning 3D with interactive floor selection",
              },
              {
                icon: Building2,
                title: "Premium Projects",
                description: "Handpicked residential developments in prime locations",
              },
              {
                icon: Home,
                title: "Easy Reservation",
                description: "Simple and transparent reservation process for serious buyers",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-lg border border-border space-y-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground">
              Browse our collection of premium residential projects and find your perfect home today
            </p>
          </div>
          <Link href="/projects">
            <Button size="lg" className="gap-2">
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
