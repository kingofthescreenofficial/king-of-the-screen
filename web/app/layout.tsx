import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KING OF THE SCREEN | The $1,000,000 Global Live Canvas",
  description:
    "The world's most contested screen. Dethrone the King with crypto, hold the broadcast until someone outbids you, and fund the $1,000,000 digital monument.",
  openGraph: {
    title: "KING OF THE SCREEN | The $1,000,000 Global Live Canvas",
    description: "Hold the world's screen until you get dethroned.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#08080c] text-gray-100 selection:bg-yellow-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
