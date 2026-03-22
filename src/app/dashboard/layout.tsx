'use client';

import { Activity, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Activity className="w-8 h-8 text-primary mr-2" />
          <span className="font-bold text-lg">FitAnalyzer</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary text-secondary-foreground">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Overview
          </Link>
          <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 bg-background overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 flex items-center px-4 border-b border-border bg-card md:hidden">
          <Activity className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold">FitAnalyzer</span>
          <button onClick={handleLogout} className="ml-auto text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="h-full overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
