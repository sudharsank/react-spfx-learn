import Link from 'next/link';
import { MODULES } from '../../content/modules';

export default function LearnPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your SPFx Learning Path</h1>
      <p className="text-gray-500 mb-10">Pick a module to start learning.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {MODULES.map((mod) => (
          <Link
            key={mod.slug}
            href={`/learn/${mod.slug}/${mod.lessons[0].slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">
              Module {mod.order}
            </p>
            <h2 className="font-bold text-gray-800 mb-2">{mod.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{mod.description}</p>
            <p className="text-xs text-[var(--color-brand)] font-medium">
              {mod.lessons.length} lessons →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
