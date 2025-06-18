import "./globals.css";
import { Inter } from "next/font/google";
import Header from "./header/Header";



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BromaIA",
  description: "Bromas telefónicas con IA en tiempo real",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
