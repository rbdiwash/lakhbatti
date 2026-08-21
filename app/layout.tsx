import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { HideOnDashboard } from "./components/hide-on-dashboard";
import { Providers } from "./components/providers";
import { site } from "./lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <HideOnDashboard>
            <Footer />
          </HideOnDashboard>
        </Providers>
      </body>
    </html>
  );
}
