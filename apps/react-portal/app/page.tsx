import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-[var(--color-brand)] mb-4">
        React Learning Portal
      </h1>
      <p className="text-gray-600 max-w-md mb-8">
        Interactive, persona-adaptive React learning. Start with a quick quiz
        to personalise your journey.
      </p>
      <Link
        href="/quiz"
        className="px-8 py-3 bg-[var(--color-brand)] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        Find My Learning Path →
      </Link>
    </main>
  );
}
