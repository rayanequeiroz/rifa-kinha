import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import './globals.css';
import { campaign } from '../lib/campaign';

export const metadata: Metadata = {
  title: campaign.name,
  description: 'Uma campanha solidária para ajudar no tratamento contra o câncer da Kinha.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
