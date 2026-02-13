'use client';

import { TerminalIcon, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@progy/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export const Navbar = () => {
  const { session, signIn, isPro, isLifetime } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    signIn();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 bg-background/60 backdrop-blur-xl border border-white/5 px-6 h-16 rounded-full flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-2.5 cursor-pointer group shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
          <TerminalIcon className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">progy</span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 italic">
        <a
          href="#how-it-works"
          className="hover:text-primary transition-colors"
        >
          Workflow
        </a>
        <a href="#features" className="hover:text-primary transition-colors">
          Features
        </a>
        <a href="#pricing" className="hover:text-primary transition-colors">
          Pricing
        </a>
        <Link href="/courses" className="hover:text-primary transition-colors">
          Registry
        </Link>
        <a href="/docs" className="hover:text-primary transition-colors">
          Docs
        </a>
      </div>

      <div className="flex items-center gap-3">
        {session ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-1 pr-4 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase italic tracking-widest text-foreground group-hover:text-primary transition-colors">
                {session.user.name?.split(' ')[0]}
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/70">
                {isLifetime ? 'LIFETIME' : isPro ? 'PRO' : 'COMMUNITY'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Button
              onClick={handleSignIn}
              size="sm"
              variant="ghost"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground h-9 italic"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignIn}
              size="sm"
              className="bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 font-black px-6 h-9 rounded-full text-[10px] tracking-widest uppercase"
            >
              Join Now
            </Button>
          </div>
        )}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-2xl border border-white/5 rounded-3xl py-8 px-6 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-widest italic">
            <a
              href="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Workflow
            </a>
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMenuOpen(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/courses"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Registry
            </Link>
            <a
              href="/docs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Docs
            </a>
            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-black uppercase italic tracking-widest text-foreground">
                      {session.user.name}
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/70 mt-1">
                      {isLifetime ? 'LIFETIME' : isPro ? 'PRO' : 'COMMUNITY'}
                    </span>
                  </div>
                </Link>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    variant="ghost"
                    className="justify-start px-0 text-[10px] font-black tracking-widest h-10 italic"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleSignIn}
                    className="bg-primary text-primary-foreground w-full h-12 text-[10px] font-black tracking-widest rounded-full uppercase"
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
