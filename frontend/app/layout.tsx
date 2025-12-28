import type { Metadata } from "next";
import "../styles/theme.css";
import "./globals.css";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "DentaCare Pro - Clinic Management System",
  description: "Professional dental clinic management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthInitializer />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
