import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Google_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/hooks/use-i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.agungdev.com"),
  title: {
    default: "Agung Tools - Ultimate Utility Platform",
    template: "%s | Agung Tools",
  },
  description:
    "Agung Tools is a free all-in-one web utility platform. Convert Text to Binary, encode Base64, decode Hex, translate Morse Code, apply Caesar Cipher, analyze EXIF metadata, and more — all locally in your browser.",
  keywords: [
    "Agung Tools",
    "text to binary",
    "binary converter",
    "text to binary converter",
    "number to binary",
    "binary to text",
    "base64 encoder",
    "base64 decoder",
    "base64 encode decode",
    "hex converter",
    "text to hex",
    "number to hex",
    "hexadecimal converter",
    "octal converter",
    "text to octal",
    "number to octal",
    "morse code translator",
    "morse code converter",
    "caesar cipher",
    "caesar cipher encoder",
    "EXIF metadata viewer",
    "EXIF reader",
    "GPS metadata extractor",
    "developer tools",
    "online encoding tools",
    "free online converter",
  ],
  authors: [{ name: "Agung Dev" }],
  creator: "Agung Dev",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Agung Tools",
    title: "Agung Tools - Free Online Developer Utilities",
    description:
      "Convert Text to Binary, encode Base64, decode Hex, translate Morse Code, Caesar Cipher, analyze EXIF metadata — all free and locally in your browser.",
    url: "https://tools.agungdev.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agung Tools - Free Online Developer Utilities",
    description:
      "Convert Text to Binary, encode Base64, decode Hex, translate Morse Code, Caesar Cipher, analyze EXIF metadata — all free and locally in your browser.",
    creator: "@agungdev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
