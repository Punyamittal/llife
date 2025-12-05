import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onNewPost: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ onNewPost, searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src="/favicon.jpg" 
            alt="Vhisper Logo" 
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-lg leading-tight">
              <span className="text-white">V</span>
              <span className="text-red-500">hisper</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Campus Forum
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, topics, Conffesions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* New Post Button */}
        <button
          onClick={onNewPost}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/20"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">New Post</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
