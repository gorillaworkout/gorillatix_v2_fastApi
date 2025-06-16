// app/admin/events/[eventId]/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const EditEventPage = dynamic(() => import('./EditEventPage'), {
  ssr: false,
});

interface Props {
  params: Promise<{ eventId: string }>; // <- penting!
}

export default function EditEventPageWrapper({ params }: Props) {
  const { eventId } = use(params); // <- inilah cara yang benar di Next.js 15
  return <EditEventPage eventId={eventId} />;
}
