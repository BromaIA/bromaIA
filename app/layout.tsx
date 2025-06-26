import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Header from "./header/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BromaIA",
  description: "Bromas telefónicas con IA en tiempo real",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <Script
          strategy="afterInteractive"
          data-domain="bromaia.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className={`${inter.className} relative overflow-visible min-h-screen bg-black`}>
        <header />
        {children}
      </body>
    </html>
  );
}

