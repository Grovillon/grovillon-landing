import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const title = "Grovillon Project";
const description = "A system designed to support physiological stability in critical and high-demand conditions.";

export const metadata = {
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export const viewport = {
  themeColor: "#0a0b0c",
  colorScheme: "dark",
};

// Before first paint, choose the pinned stage when it can run (motion allowed,
// WebGL present), so the page keeps its shape when script arrives. CinematicStage
// confirms the choice or reverts it; if it has not started shortly after the page
// has loaded, script failed and the flag lapses.
const STAGE_EARLY = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'WebGLRenderingContext' in window){d.dataset.stage='early';addEventListener('load',function(){setTimeout(function(){var c=document.querySelector('.cine');if(!c||!c.dataset.cine)delete d.dataset.stage},1500)})}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STAGE_EARLY }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
