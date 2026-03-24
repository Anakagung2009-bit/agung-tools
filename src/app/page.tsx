import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Shield, FileSearch, Smartphone } from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Agung Tools",
      url: "https://tools.agungdev.com",
      description:
        "Free all-in-one web utility platform: Text to Binary, Base64, Hex, Octal, Morse Code, Caesar Cipher, EXIF Metadata viewer.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://tools.agungdev.com/tools?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      name: "Agung Tools",
      url: "https://tools.agungdev.com",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free all-in-one web utility platform: Text to Binary, Base64, Hex, Octal, Morse Code, Caesar Cipher, EXIF Metadata viewer.",
      featureList: [
        "Text to Binary Converter",
        "Number to Binary Converter",
        "Base64 Encoder Decoder",
        "Text to Hexadecimal Converter",
        "Number to Hex Converter",
        "Octal Converter",
        "Morse Code Translator",
        "Caesar Cipher Encoder Decoder",
        "EXIF Metadata Viewer",
        "GPS Metadata Extractor",
      ],
    },
  ],
};

export const metadata = {
  title: "Agung Tools - Free Text to Binary, Base64, Hex & EXIF Online Tools",
  description:
    "Agung Tools is a free all-in-one web utility platform. Convert Text to Binary, encode Base64, decode Hex, translate Morse Code, apply Caesar Cipher, and analyze EXIF metadata — all locally in your browser.",
  keywords: [
    "text to binary",
    "binary converter",
    "base64 encoder",
    "base64 decoder",
    "hex converter",
    "morse code translator",
    "caesar cipher",
    "EXIF viewer",
    "online dev tools",
    "Agung Tools",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation */}
      <header className="w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Zap className="h-5 w-5" />
            </div> */}
            <span className="font-bold text-xl tracking-tight">Agung Tools</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-black/[0.02] bg-[size:50px_50px]" />
        <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              The Ultimate Web Application for Utilities
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Agung Tools is a powerful all-in-one web application designed for developers and creatives. Instantly convert text/numbers to binary, encode to Base64/Hex, and deeply analyze EXIF metadata right in your browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                  Get Started For Free
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  Browse Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-24 border-t border-border/40">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Metadata & EXIF</h3>
              <p className="text-muted-foreground leading-relaxed">
                Extract hidden EXIF GPS coordinates, camera models, and deep file properties from your images. Fully local and private.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">DevTools Lab</h3>
              <p className="text-muted-foreground leading-relaxed">
                Convert Text to Binary, Number to Binary, Base64 encode/decode, Hex converters, and even translate Morse Code in a blazing-fast UI.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">100% Local Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Security by design. No files or conversions are ever uploaded to a server. Everything runs efficiently in your browser.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Agung Dev.</p>
      </footer>
    </div>
  );
}
