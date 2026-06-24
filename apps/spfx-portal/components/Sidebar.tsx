'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ModuleDefinition } from '@repo/content';

interface SidebarProps {
  modules: ModuleDefinition[];
}

export function Sidebar({ modules }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-100 min-h-screen p-4">
      {modules.map((mod) => (
        <div key={mod.slug} className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
            {mod.title}
          </p>
          <ul className="space-y-1">
            {mod.lessons.map((lesson) => {
              const href = `/learn/${mod.slug}/${lesson.slug}`;
              const active = pathname?.includes(href);
              return (
                <li key={lesson.slug}>
                  <Link
                    href={href}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-[oklch(0.95_0.03_250)] text-[var(--color-brand)] font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lesson.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
