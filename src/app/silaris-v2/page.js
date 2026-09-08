"use client";

import dynamic from 'next/dynamic';

const SilarisV2Screen = dynamic(() => import('@/components/v2/silaris-v2/SilarisV2Screen'), { ssr: false });

export default function SilarisV2Page() {
  return <SilarisV2Screen />;
}
