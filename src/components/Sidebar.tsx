'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Flame, 
  Timer, 
  Bot, 
  X, 
  Sun, 
  Moon, 
  Compass,
  PanelLeftClose,
  LogOut,
  UserCheck,
  Download
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingTasksCount: number;
  upcomingRemindersCount: number;
  onOpenInstallModal?: () => void;
}

export default function Sidebar({
  isOpen = true,
  onToggle,
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  pendingTasksCount,
  onOpenInstallModal,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      index: '01',
      label: 'DASHBOARD',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      index: '02',
      label: 'FIELD TASKS',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
    },
    {
      id: 'calendar',
      index: '03',
      label: 'SCHEDULE & CALENDAR',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'habits',
      index: '04',
      label: 'HABIT MATRIX',
      icon: Flame,
      badge: 'STREAK',
    },
    {
      id: 'focus',
      index: '05',
      label: 'EXPEDITION TIMER',
      icon: Timer,
      badge: null,
    },
    {
      id: 'ai',
      index: '06',
      label: 'COPILOT INTELLIGENCE',
      icon: Bot,
      badge: 'AI ↗',
    },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto bg-[#f7f4eb] dark:bg-[#0e0f0e] border-r-[3px] border-black dark:border-white p-5 text-[#141514] dark:text-[#f4f3ef] transition-colors duration-200 font-mono">
      {/* Brand Header & Close Button */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b-[2.5px] border-black dark:border-white">
        <div className="flex items-center gap-3">
          {/* Stylized Mountain Peak Glyph with Hover Motion */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="p-1 bg-[#ffe600] border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            <svg 
              className="w-6 h-6 text-black" 
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
            <span className="font-extrabold text-base tracking-tighter uppercase text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
              TRAILHEAD
            </span>
            <p className="font-bold text-[10px] tracking-widest text-[#141514] dark:text-[#f4f3ef] uppercase">
              SUPPLY CO. / DENVER
            </p>
          </div>
        </div>

        {/* Desktop Close/Collapse Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-[#141514] dark:text-[#f4f3ef] transition cursor-pointer"
            title="Collapse sidebar (close)"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-[#ff4d00]" />
          </button>
        )}

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] text-[#141514] dark:text-[#f4f3ef] lg:hidden transition"
          aria-label="Close mobile menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 space-y-1.5">
        <p className="px-2 text-[11px] font-black uppercase tracking-widest text-[#141514] dark:text-[#f4f3ef] mb-3">
          // FIELD NAVIGATION
        </p>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] font-black'
                  : 'text-[#141514] dark:text-[#f4f3ef] border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#1c1e1c] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#fff]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="text-[11px] font-black text-inherit">{item.index}</span>
                <Icon className={`w-4 h-4 shrink-0 stroke-[2.5] ${isActive ? 'text-black' : 'text-inherit'}`} />
                <span className="tracking-wider uppercase truncate font-bold">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_#000] shrink-0 ${
                  isActive 
                    ? 'bg-[#ff4d00] text-white' 
                    : 'bg-[#00e5ff] text-black'
                }`}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Technical Expedition Coordinates Card with Motion Graphic Compass */}
      <div className="pt-4 border-t-[2.5px] border-black dark:border-white mt-4 space-y-3 text-[10px]">
        <div className="p-3 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] space-y-1.5 text-[#141514] dark:text-[#f4f3ef]">
          <div className="flex items-center justify-between text-[#141514] dark:text-[#f4f3ef] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-black">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <Compass className="w-4 h-4 text-[#ff4d00] stroke-[2.5]" />
              </motion.div>
              BASE STATION
            </span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.5 border border-black text-[9px] font-black">5,280 FT</span>
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase">
            DENVER, COLORADO
          </div>
          <div className="text-[10px] font-bold tracking-wider text-[#141514] dark:text-[#f4f3ef]">
            39.7392° N, 104.9903° W
          </div>
        </div>

        {/* Install Application Button in Sidebar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenInstallModal}
          className="w-full flex items-center justify-between p-2.5 bg-[#ccff00] hover:bg-[#b8e600] text-black border-2 border-black shadow-[3px_3px_0px_#000] font-black cursor-pointer uppercase text-[10px] tracking-wider transition hover:-translate-x-0.5 hover:-translate-y-0.5"
          title="Install Trailhead as Standalone App"
        >
          <span className="flex items-center gap-1.5 font-black">
            <Download className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
            <span>INSTALL AS APP</span>
          </span>
          <span className="text-[9px] bg-black text-[#ccff00] px-1.5 py-0.5 border border-black font-black">
            DOWNLOAD
          </span>
        </motion.button>

        {/* Mode Toggle Button with Flip Motion */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-[#1c1e1c] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] transition text-[#141514] dark:text-[#f4f3ef] font-black cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span className="tracking-wider uppercase text-[10px] font-black">
            {theme === 'dark' ? 'EXPEDITION NIGHT' : 'FIELD DAYLIGHT'}
          </span>
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#ffe600] stroke-[2.5]" />
            ) : (
              <Moon className="w-4 h-4 text-[#ff4d00] stroke-[2.5]" />
            )}
          </motion.div>
        </motion.button>

        {/* Authenticated Explorer Card & Sign Out */}
        {user && (
          <div className="pt-3 border-t-2 border-black/15 dark:border-white/15">
            <div className="flex items-center justify-between p-2 bg-[#f7f4eb] dark:bg-[#161816] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-black dark:text-white truncate">
                  <UserCheck className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                  <span className="truncate">{user.name}</span>
                </div>
                <div className="text-[9px] font-bold text-[#666] dark:text-[#999] truncate">
                  {user.title || 'Productivity Architect'}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="p-1.5 bg-red-100 dark:bg-red-950/80 hover:bg-red-500 hover:text-white border border-black dark:border-white text-red-700 dark:text-red-300 transition cursor-pointer shrink-0"
                title="Sign out from Base Station"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Expandable/Collapsible Animated Sidebar */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="hidden lg:block shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-hidden z-30"
          >
            <div className="w-64 h-full">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Slide-over Drawer with Fluid Motion */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={onCloseMobile} 
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
