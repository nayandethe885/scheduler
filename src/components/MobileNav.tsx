'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  Timer, 
  Bot 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingTasksCount: number;
}

export default function MobileNav({
  activeTab,
  onSelectTab,
  pendingTasksCount,
}: MobileNavProps) {
  const items = [
    {
      id: 'dashboard',
      label: 'HOME',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'TASKS',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
    {
      id: 'habits',
      label: 'HABITS',
      icon: Flame,
      badge: null,
    },
    {
      id: 'focus',
      label: 'FOCUS',
      icon: Timer,
      badge: null,
    },
    {
      id: 'ai',
      label: 'COPILOT',
      icon: Bot,
      badge: null,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#fffdf0] dark:bg-[#121312] border-t-[3px] border-black dark:border-white shadow-[0_-4px_0_0_#000] dark:shadow-[0_-4px_0_0_#fff] px-1.5 xs:px-2 py-1.5 xs:py-2 pb-safe transition-colors duration-200 font-mono">
      <div className="flex items-center justify-around max-w-lg mx-auto gap-0.5 xs:gap-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 xs:py-1.5 px-0.5 xs:px-1 transition-all cursor-pointer min-w-0 ${
                isActive
                  ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-1 font-black'
                  : 'text-[#666] dark:text-[#aaa] hover:text-black dark:hover:text-white font-bold'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]" />
                {item.badge !== null && (
                  <span className="absolute -top-2 -right-2.5 min-w-[15px] h-3.5 xs:h-4 px-1 bg-[#ff4d00] border border-black text-[8px] xs:text-[9px] font-black text-white flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[8px] xs:text-[9px] mt-0.5 tracking-wider uppercase truncate font-black w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
