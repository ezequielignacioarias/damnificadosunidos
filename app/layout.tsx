import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.damnificadosunidos.org"),
  title: "Damnificados Unidos | Página Oficial",
  description:
    "Registro de compradores afectados por Grupo Roma.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Damnificados Unidos | Página Oficial",
    description:
      "Registro de compradores afectados por Grupo Roma.",
    url: "https://www.damnificadosunidos.org",
    siteName: "Damnificados Unidos",
    images: [
      {
        url: "https://www.damnificadosunidos.org/logo-damnificados-unidos.png",
        width: 1024,
        height: 1024,
        alt: "Damnificados Unidos",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Damnificados Unidos | Página Oficial",
    description:
      "Registro de compradores afectados por Grupo Roma.",
    images: ["https://www.damnificadosunidos.org/logo-damnificados-unidos.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}