import type { Metadata } from "next";
import "./globals.css";
import { TelemetryTracker } from "../components/TelemetryTracker";

export const metadata: Metadata = {
  title: "KING OF THE SCREEN | Pre-Launch",
  description:
    "A public experiment in status, art, and competition. Payments, token activity, and NFT activity are paused.",
  openGraph: {
    title: "KING OF THE SCREEN | Pre-Launch",
    description: "The throne is being prepared. Payments are paused.",
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
        <TelemetryTracker />{children}
      </body>
    </html>
  );
}
