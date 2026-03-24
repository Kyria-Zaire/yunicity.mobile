import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yunicity — Ta ville connectée',
  description:
    'Le réseau social local qui reconnecte les habitants à leur ville.',
  openGraph: {
    title: 'Yunicity',
    description:
      'Le réseau social local qui reconnecte les habitants à leur ville.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
