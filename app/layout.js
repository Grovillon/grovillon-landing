import { Hubot_Sans } from "next/font/google";
import "./globals.css";

// One family for every word: Hubot Sans, variable in weight and width.
const hubot = Hubot_Sans({
  variable: "--font-hubot",
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
// has loaded, script failed and the flag lapses, keeping the reader's place on
// the page as CinematicStage.setLayoutMode does: mapped if they have scrolled by
// hand (noted in __stageScrolled), left alone if the browser set it (a restored
// position, or a link's target, which is found again).
const STAGE_EARLY = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'WebGLRenderingContext' in window){d.dataset.stage='early';var s=function(){window.__stageScrolled=true};addEventListener('wheel',s,{passive:true,once:true});addEventListener('touchmove',s,{passive:true,once:true});addEventListener('keydown',s,{once:true});addEventListener('load',function(){setTimeout(function(){var c=document.querySelector('.cine');if(c&&c.dataset.cine)return;var r=c&&c.getBoundingClientRect(),y=scrollY,top=r?r.top+y:0,h=r?r.height:0;delete d.dataset.stage;if(!r)return;if(!window.__stageScrolled){var t=location.hash&&document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView();return}var a=c.getBoundingClientRect().height,to=y>=top+h?y+a-h:y>top?top+(y-top)/Math.max(h,1)*a:y;if(to!==y)scrollTo(0,Math.min(to,d.scrollHeight-innerHeight))},1500)})}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={hubot.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STAGE_EARLY }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
