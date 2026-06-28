import Link from 'next/link';
import { SPFX_PROJECTS } from '../../content/projects';

export default function ProjectsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Builder</h1>
      <p className="text-gray-500 mb-10">Build complete SPFx web parts step by step.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {SPFX_PROJECTS.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {p.difficulty}
            </span>
            <h2 className="font-bold text-gray-800 mt-1 mb-2">{p.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{p.description}</p>
            <p className="text-xs text-[var(--color-brand)] font-medium">
              {p.steps.length} steps →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
