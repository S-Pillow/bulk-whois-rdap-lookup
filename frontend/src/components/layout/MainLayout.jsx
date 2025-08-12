import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, TableProperties as Tools, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";

function MainLayout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark');
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 transition-colors duration-300">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            {location.pathname !== "/" && (
              <Link to="/" className="mr-2">
                <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div className="flex gap-6 text-sm font-medium">
              <Link 
                to="/" 
                className={`flex items-center gap-2 transition-colors hover:text-primary ${
                  location.pathname === "/" ? "text-primary" : "text-foreground/60"
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                to="/tools" 
                className={`flex items-center gap-2 transition-colors hover:text-primary ${
                  location.pathname.startsWith("/tools") ? "text-primary" : "text-foreground/60"
                }`}
              >
                <Tools className="h-4 w-4" />
                Tools
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-secondary/80"
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Forge Forward. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
