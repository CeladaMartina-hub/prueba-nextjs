'use client';

import { usePathname } from 'next/navigation';
import WhatsappFloat from '@/app/ui/whatsapp-float';
import Footer from './Footer';

export default function PublicChrome() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) return null;

  return (
    <>
      <Footer />
      <WhatsappFloat />
    </>
  );
}