import type { Metadata } from 'next';
// Placeholder for a pixel font - Replace 'PixelFont' with the actual font name after importing
// import { Pixelify_Sans } from 'next/font/google'; // Example using Google Fonts
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Example: const pixelFont = Pixelify_Sans({ subsets: ['latin'], variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'RetroIDE', // Updated App Name
  description: 'AI-Powered Retro IDE',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the pixel font variable if using one */}
      {/* <body className={`${pixelFont.variable} font-pixel antialiased`}> */}
      <body className={`antialiased bg-background text-foreground`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
