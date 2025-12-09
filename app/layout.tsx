import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastProvider from '@/components/ToastProvider';
import { activeFont } from '@/lib/fonts';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Total Scrap',
  description: 'Dashboard Total Scrap para monitorear precios con Next.js + Firebase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${activeFont.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1 flex flex-col">{children}</div>
              <Footer />
            </div>
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
