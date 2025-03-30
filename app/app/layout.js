// app/layout.js
export const metadata = {
    title: 'Grovillon Maison',
    description: 'Silent force, lasting influence',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  