import type { Metadata } from "next";
import "./globals.css";
import { TelemetryTracker } from "../components/TelemetryTracker";

export const metadata: Metadata = {
  title: "KING OF THE SCREEN | Coming Soon",
  description:
    "King of the Screen is preparing for public launch.",
  openGraph: {
    title: "KING OF THE SCREEN | Coming Soon",
    description: "The throne is being prepared.",
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
