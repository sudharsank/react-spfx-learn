import { DEPLOY_LABS } from '../../../content/deployLabs';
import DeployLab from '../../../components/DeployLab';

export function generateStaticParams() {
  return DEPLOY_LABS.map((l) => ({ lab: l.slug }));
}

export default async function DeployLabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = DEPLOY_LABS.find((l) => l.slug === slug);
  if (!lab) return <div className="p-8 text-gray-500">Lab not found.</div>;
  return <DeployLab lab={lab} />;
}
