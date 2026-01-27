import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="w-6 h-6" />
          RealEstate
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost">Projects</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
