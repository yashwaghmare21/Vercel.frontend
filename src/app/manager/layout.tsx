"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Extract session from cookie (mock implementation)
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('atomquest_session='));
    if (sessionCookie) {
      try {
        const raw = sessionCookie.substring(sessionCookie.indexOf('=') + 1);
        const session = JSON.parse(decodeURIComponent(raw));
        setUserName(session.name);
      } catch(e) {}
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "atomquest_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/manager/dashboard', label: 'Overview' },
    { href: '/manager/approvals', label: 'Pending Approvals' },
    { href: '/manager/team', label: 'Team Tracking' },
    { href: '/manager/comments', label: 'Feedback' },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xl font-bold text-zinc-900 dark:text-white">AtomQuest</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 font-bold uppercase tracking-widest">Mgr</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                pathname === link.href 
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-medium' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <span>{link.label}</span>
              {link.href === '/manager/approvals' && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
              {userName.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{userName || 'Manager'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Manager</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Cycle: FY 2025-26
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
