import type { Metadata } from "next";
import "./globals.css";
import Providers from "../providers/Providers";

export const metadata: Metadata = {
  title: "Booking App",
  description: "MVP with Google Auth + Calendar sync",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
