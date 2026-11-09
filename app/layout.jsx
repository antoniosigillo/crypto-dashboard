import { Open_Sans } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Providers from '@/components/Providers';

const font = Open_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export const metadata = {
  title: 'Crypto Trading Dashboard',
  description: 'Live crypto prices, 24h charts and simulated trading.',
    icons: {
        icon: "/bison.svg",
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
