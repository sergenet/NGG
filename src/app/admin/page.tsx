import type { Metadata } from 'next';
import { AdminLaunchpadClient } from '@/components/AdminLaunchpadClient';

export const metadata: Metadata = {
  title: 'Admin Launchpad | NewGiftsAndGadgets',
  description: 'Restricted operations launchpad for NewGiftsAndGadgets.com.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLaunchpadPage() {
  return (
    <main id="main-content" className="site-container py-6 sm:py-12 md:py-16">
      <AdminLaunchpadClient />
    </main>
  );
}
