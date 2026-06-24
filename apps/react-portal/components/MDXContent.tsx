'use client';

import type { ComponentType } from 'react';

interface MDXContentProps {
  Component: ComponentType;
}

export function MDXContent({ Component }: MDXContentProps) {
  return <Component />;
}
