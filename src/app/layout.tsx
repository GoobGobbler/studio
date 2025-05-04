import type { Metadata } from 'next';
import { Pixelify_Sans } from 'next/font/google'; // Import Pixelify Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Configure Pixelify Sans font
const pixelFont = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixel', // CSS variable name
  weight: ['400', '700'] // Include weights if needed
});

export const metadata: Metadata = {
  title: 'RetroIDE',
  description: 'AI-Powered Retro IDE with Collaboration & DevOps', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the pixel font variable to the body */}
      <body className={`${pixelFont.variable} font-pixel antialiased bg-background text-foreground`}>
        {/* Optional: Add a wrapper if only specific parts need the font */}
        {/* <div className="font-pixel"> */}
          {children}
        {/* </div> */}
        <Toaster />
      </body>
    </html>
  );
}
