'use client';

import dynamic from 'next/dynamic';

const StudioPage = dynamic(() => import('../../components/StudioPage'), { ssr: false });

export default function Studio() {
  return <StudioPage />;
}
