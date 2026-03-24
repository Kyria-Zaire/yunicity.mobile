import type { Metadata } from 'next';
import './globals.css';
import { AdminShell } from './shell';

export const metadata: Metadata = {
  title: 'Yunicity Admin — Dashboard',
  description: 'Dashboard interne Yunicity — Review KYC & gestion',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
