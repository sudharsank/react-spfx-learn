// apps/react-portal/app/labs/[lab]/page.tsx
import { notFound } from 'next/navigation';
import { LABS, getLab } from '../../../content/labs';
import { GuidedLab } from '../../../components/GuidedLab';
import { ChallengeMode } from '../../../components/ChallengeMode';

export async function generateStaticParams() {
  return LABS.map((lab) => ({ lab: lab.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  return lab.type === 'guided'
    ? <GuidedLab lab={lab} />
    : <ChallengeMode lab={lab} />;
}
