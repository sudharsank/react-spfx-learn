import Link from 'next/link';
import { DEPLOY_LABS } from '../../content/deployLabs';

export default function DeployLabsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Deploy Labs</h1>
      <p className="text-gray-500 mb-10">Step-by-step walkthroughs for deploying SPFx web parts to production.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {DEPLOY_LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`/deploy-labs/${lab.slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <h2 className="font-bold text-gray-800 mb-2">{lab.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{lab.description}</p>
            <p className="text-xs text-[var(--color-brand)] font-medium">
              {lab.steps.length} steps →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
