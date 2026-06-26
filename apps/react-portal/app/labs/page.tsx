// apps/react-portal/app/labs/page.tsx
import Link from 'next/link';
import { LABS } from '../../content/labs';

export default function LabsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Labs</h1>
      <p className="text-gray-500 mb-10">Hands-on exercises — guided walkthroughs and open challenges.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`/labs/${lab.slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
              </span>
              <span className="text-xs text-gray-400">{lab.duration}</span>
            </div>
            <h2 className="font-bold text-gray-800 mb-1">{lab.title}</h2>
            <p className="text-sm text-gray-500">{lab.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
