'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { playTick } from '@/lib/audio';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  category: 'Navigation' | 'Quick Actions';
  action: () => void;
}

const COMMAND_EVENT = 'fitai:open-command-palette';

export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMAND_EVENT));
  }
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: ActionItem[] = [
    {
      id: 'dash',
      title: 'Go to Dashboard',
      subtitle: 'Overview of calories, workout & current progress',
      icon: 'dashboard',
      category: 'Navigation',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'coach',
      title: 'Ask Nova (AI Coach)',
      subtitle: 'Personalized advice from your workout and meal data',
      icon: 'sparkle',
      category: 'Navigation',
      action: () => router.push('/coach'),
    },
    {
      id: 'workout-start',
      title: "Start Today's Workout",
      subtitle: 'Open Chest & Triceps details and launch timer',
      icon: 'play',
      category: 'Quick Actions',
      action: () => router.push('/workouts/details'),
    },
    {
      id: 'food-log',
      title: 'Log Food / Search Food',
      subtitle: 'Search Indian & whole foods database or add custom',
      icon: 'nutrition',
      category: 'Quick Actions',
      action: () => router.push('/nutrition/add'),
    },
    {
      id: 'weight-log',
      title: "Log Today's Weight",
      subtitle: 'Record morning weigh-in and update 30d trend',
      icon: 'scale',
      category: 'Quick Actions',
      action: () => router.push('/progress?focus=weight'),
    },
    {
      id: 'workouts',
      title: 'My Workouts & Planner',
      subtitle: 'Weekly schedule and custom routines',
      icon: 'dumbbell',
      category: 'Navigation',
      action: () => router.push('/workouts'),
    },
    {
      id: 'nutrition',
      title: 'Nutrition Overview',
      subtitle: 'Macro distribution and meal breakdown',
      icon: 'nutrition',
      category: 'Navigation',
      action: () => router.push('/nutrition'),
    },
    {
      id: 'progress',
      title: 'Progress & Strength History',
      subtitle: 'Weight trend and progressive overload on main lifts',
      icon: 'trend',
      category: 'Navigation',
      action: () => router.push('/progress'),
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      subtitle: 'Targets, fitness goal, dietary preferences & account',
      icon: 'user',
      category: 'Navigation',
      action: () => router.push('/profile'),
    },
  ];

  const filtered = actions.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery('');
            setSelectedIndex(0);
            return true;
          }
          return false;
        });
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleOpen = () => {
      setQuery('');
      setSelectedIndex(0);
      setOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(COMMAND_EVENT, handleOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(COMMAND_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const handleSelect = (item: ActionItem) => {
    playTick();
    setOpen(false);
    item.action();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24"
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] border border-line bg-card shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Icon name="search" size={20} className="text-muted flex-none" />
          <input
            ref={inputRef}
            type="text"
            data-testid="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or jump to screen... (Esc to close)"
            className="flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-placeholder"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-line-chip bg-sidebar px-2 py-0.5 text-[11px] font-bold text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2" data-testid="command-palette-list">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-muted">No commands found for &ldquo;{query}&rdquo;</div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-3.5 rounded-[14px] px-3.5 py-3 text-left transition-colors duration-150',
                    isSelected ? 'border border-lime-line bg-lime-tint text-lime' : 'border border-transparent text-fg hover:bg-row',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border',
                      isSelected ? 'border-lime-line bg-lime/10 text-lime' : 'border-line bg-sidebar text-muted',
                    )}
                  >
                    <Icon name={item.icon} size={18} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[14px] font-semibold leading-tight', isSelected ? 'text-lime' : 'text-fg')}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted">{item.subtitle}</p>
                  </div>
                  <span className="text-[12px] text-muted">↵</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
