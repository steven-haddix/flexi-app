import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from '@/lib/auth/client';
import { NeonAuthUIProvider, UserButton } from '@neondatabase/neon-js/auth/react/ui';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flexi — AI Workout Companion",
  description: "Gym scanner and personalized workout generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/dashboard"
          social={{ providers: ["google"] }}
        >
          <header className='flex justify-end items-center p-4 gap-4 h-16'>
            <UserButton size="icon" />
          </header>
          {children}
        </NeonAuthUIProvider>
        <Toaster />
      </body>
    </html>
  );
}
