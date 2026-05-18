"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CycleProvider, useCycle } from '@/contexts/CycleContext';

function EmployeeLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const { cycle } = useCycle();

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
    { href: '/employee/dashboard', label: 'Dashboard' },
    { href: '/employee/goals', label: 'My Goals' },
    { href: '/employee/checkins', label: 'Quarterly Check-ins' },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xl font-bold text-zinc-900 dark:text-white">AtomQuest</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                pathname === link.href 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {userName.charAt(0) || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{userName || 'Employee'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Employee</p>
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
            <div className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Cycle: FY 2025-26
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell Placeholder */}
            <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
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

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CycleProvider>
      <EmployeeLayoutContent>{children}</EmployeeLayoutContent>
    </CycleProvider>
  );
}
