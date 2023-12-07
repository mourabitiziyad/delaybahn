import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Delay Bahn",
  description: "A TUM Web Development Project",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-100 font-sans ${inter.variable}`}>
        <TRPCReactProvider headers={headers()}>
          <NavBar />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
