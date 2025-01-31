import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LawyersProvider } from './contexts/LawyersContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from './client-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'LawBud',
  description: 'Find and connect with lawyers',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=1'
      ></meta>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <UserProvider>
            <LawyersProvider>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </LawyersProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
