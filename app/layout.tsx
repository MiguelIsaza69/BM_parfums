import type { Metadata } from "next";
import { Playfair_Display, Space_Mono, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sileo";
import "sileo/styles.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BM parfums | Esencia de Élite",
  description: "Redefining olfactory perfection for the avant-garde.",
  icons: {
    icon: "https://res.cloudinary.com/dbeaem1xr/image/upload/v1771865096/WhatsApp_Image_2026-02-11_at_3.37.42_PM-removebg-preview_lz7whv.png",
    apple: "https://res.cloudinary.com/dbeaem1xr/image/upload/v1771865096/WhatsApp_Image_2026-02-11_at_3.37.42_PM-removebg-preview_lz7whv.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} antialiased bg-black text-white`}
      >
        <CartProvider>
          {children}
          <Toaster
            position="bottom-right"
            options={{
              fill: "#171717",
              styles: {
                title: "font-mono font-bold uppercase text-white tracking-widest text-sm",
                description: "text-neutral-400 font-sans text-xs",
              }
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
