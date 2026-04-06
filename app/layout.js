import { Geist, Geist_Mono, Lora, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const oswald = Oswald({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Grovillon Project",
  description: "An invitation-only initiative for frontier tech with dignity, silence, and purpose.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${oswald.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}