import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">WaterWise</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
          <Link to="/services" className="hover:text-white">
            Services
          </Link>
          <Link to="/about" className="hover:text-white">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="bg-white text-primary hover:bg-white/90">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
