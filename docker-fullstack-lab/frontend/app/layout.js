import "./globals.css";

export const metadata = {
  title: "Docker Notes Lab",
  description: "A small full-stack application for learning Docker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
