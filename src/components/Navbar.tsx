'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Bell, 
  Menu, 
  Sun, 
  Moon,
  Sliders,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  User,
  Download,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  profile: UserProfile;
  activeTab?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenNewTask: () => void;
  onOpenNewReminder: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal?: () => void;
  onToggleSidebarMobile: () => void;
  onOpenQuickAI: () => void;
  onSelectTab: (tab: string) => void;
  completionRate: number;
}

export default function Navbar({
  profile,
  activeTab = 'dashboard',
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenNewTask,
  onOpenNewReminder,
  onOpenSettings,
  onOpenInstallModal,
  onToggleSidebarMobile,
  onOpenQuickAI,
  onSelectTab,
  completionRate,
}: NavbarProps) {
  const [time, setTime] = useState<string>('');
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: '01 / DASHBOARD' },
    { id: 'tasks', label: '02 / TASKS' },
    { id: 'focus', label: '03 / FOCUS LAB' },
    { id: 'habits', label: '04 / HABITS' },
    { id: 'ai', label: 'THE COPILOT ↗' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f7f4eb] dark:bg-[#0e0f0e] border-b-[3px] border-black dark:border-white px-2 xs:px-4 sm:px-6 lg:px-8 py-2 sm:py-3 transition-colors duration-200 shadow-[0_4px_0_0_#000] dark:shadow-[0_4px_0_0_#fff]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 font-mono">
        {/* Left: Brand / Mountain Contour Logo */}
        <div className="flex items-center gap-1.5 xs:gap-3 shrink-0">
          {/* Universal Sidebar Toggle Button (Desktop & Mobile) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSidebar || onToggleSidebarMobile}
            className="p-1.5 xs:p-2 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-[#141514] dark:text-[#f4f3ef] cursor-pointer"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            title={isSidebarOpen ? 'Collapse sidebar (Ctrl+\\)' : 'Open sidebar (Ctrl+\\)'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 xs:w-5 xs:h-5 text-[#ff4d00]" />
            ) : (
              <PanelLeft className="w-4 h-4 xs:w-5 xs:h-5 text-[#141514] dark:text-[#f4f3ef]" />
            )}
          </motion.button>

          <button 
            onClick={() => onSelectTab('dashboard')}
            className="btn-raw flex items-center gap-1.5 xs:gap-2.5 group text-left cursor-pointer"
          >
            {/* Trailhead Mountain Peak Glyph with Hover Tilt */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -4 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className="p-1 xs:p-1.5 bg-[#ffe600] border-2 border-black shadow-[2px_2px_0px_#000] shrink-0"
            >
              <svg 
                className="w-4 h-4 xs:w-5 xs:h-5 text-black" 
                viewBox="0 0 32 28" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M2 24 L10 6 L16 16 L20 10 L30 24 Z" />
              </svg>
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs xs:text-sm sm:text-base tracking-tighter uppercase text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
                  TRAILHEAD
                </span>
              </div>
              <p className="font-bold text-[8px] xs:text-[9px] sm:text-[10px] tracking-widest text-[#141514] dark:text-[#f4f3ef] uppercase hidden 2xs:block">
                SUPPLY CO. / DENVER
              </p>
            </div>
          </button>
        </div>

        {/* Center: Technical Navigation with Neo-Brutalist Badges */}
        <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-3 shrink-0">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`btn-tab relative text-[11px] 2xl:text-xs tracking-wider uppercase px-2.5 2xl:px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] -rotate-1 scale-105'
                    : 'text-[#141514] dark:text-[#f4f3ef] border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#1a1b1a]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Technical Stats, Clock, Switcher, Action Button */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0">
          {/* Live MST Technical Clock Stamp */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-black border-2 border-black shadow-[2px_2px_0px_#000] bg-[#ffe600]">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
            <span className="tracking-widest font-black">{time ? `${time} MST` : 'DENVER'}</span>
          </div>

          {/* Search / Copilot Quick Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenQuickAI}
            className="p-1.5 xs:p-2 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-black dark:text-white cursor-pointer"
            title="Search or Dispatch Copilot"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
          </motion.button>

          {/* Dark / Light Mode Switcher with Smooth Rotation Motion */}
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            transition={{ duration: 0.25 }}
            onClick={toggleTheme}
            className="p-1.5 xs:p-2 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-black dark:text-white cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#ffe600] stroke-[2.5]" />
            ) : (
              <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#ff4d00] stroke-[2.5]" />
            )}
          </motion.button>

          {/* Quick Add Reminder */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenNewReminder}
            className="hidden sm:flex p-1.5 xs:p-2 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-black dark:text-white cursor-pointer"
            title="Add field reminder"
            aria-label="Add reminder"
          >
            <Bell className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
          </motion.button>

          {/* Download / Install Application Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 bg-[#ccff00] hover:bg-[#b8e600] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[10px] xs:text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
            title="Download & Install Trailhead as Desktop or Mobile App"
            aria-label="Install App"
          >
            <Download className="w-3.5 h-3.5 stroke-[3] animate-bounce shrink-0" />
            <span className="hidden xs:inline">INSTALL</span>
            <span className="hidden sm:inline">APP</span>
          </motion.button>

          {/* Settings / Configuration */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenSettings}
            className="p-1.5 xs:p-2 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-black dark:text-white cursor-pointer"
            title="Settings & Profile"
            aria-label="Settings"
          >
            <Sliders className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
          </motion.button>

          {/* Authenticated Explorer Callsign Badge & Sign Out */}
          {user && (
            <div className="hidden lg:flex items-center gap-1.5 pl-1 border-l-2 border-black/30 dark:border-white/30">
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-black uppercase tracking-wider"
                title={`Signed in as ${user.email}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse shrink-0" />
                <span className="max-w-[80px] xl:max-w-[110px] truncate">{user.name}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => signOut()}
                className="p-1.5 xs:p-2 bg-red-100 dark:bg-red-950/80 hover:bg-red-500 hover:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-red-700 dark:text-red-300 cursor-pointer"
                title="Sign out from Base Station"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
              </motion.button>
            </div>
          )}

          {/* Signature Burnt Orange Action Button with Spring Bounce */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenNewTask}
            className="flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono text-[10px] xs:text-xs uppercase tracking-wider font-extrabold transition cursor-pointer shrink-0"
            title="Create new task"
          >
            <Plus className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[3] shrink-0" />
            <span className="hidden xs:inline">NEW TASK</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
