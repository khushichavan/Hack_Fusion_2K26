import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-background px-6 text-center">
      <div className="grid-bg absolute inset-0 opacity-20" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative">
        <Logo />
      </div>
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative text-8xl font-black gradient-text"
      >
        404
      </motion.h1>
      <div className="relative space-y-2">
        <h2 className="text-2xl font-bold">Route not found</h2>
        <p className="max-w-md text-muted-foreground">
          Looks like this road doesn't exist on our map. Let's get you back on
          track.
        </p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Button asChild variant="gradient" size="lg">
          <Link to="/">
            <Home className="h-4 w-4" /> Back home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/app/map">
            <MapPinned className="h-4 w-4" /> Open live map
          </Link>
        </Button>
      </div>
    </div>
  );
}
