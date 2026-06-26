// apps/spfx-portal/app/labs/[lab]/page.tsx
import { notFound } from 'next/navigation';
import { SPFX_LABS, getSpfxLab } from '../../../content/labs';
import { SpfxLab } from '../../../components/SpfxLab';

export async function generateStaticParams() {
  return SPFX_LABS.map((lab) => ({ lab: lab.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = getSpfxLab(slug);
  if (!lab) notFound();
  return <SpfxLab lab={lab} />;
}
