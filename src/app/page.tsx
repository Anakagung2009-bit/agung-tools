import type { Metadata } from "next";
import LandingPage from "./landing-client";

export const metadata: Metadata = {
  title: "Agung Tools - Free Text to Binary, Base64, Hex & EXIF Online Tools",
  description:
    "Agung Tools is a free all-in-one web utility platform. Convert Text to Binary, encode Base64, decode Hex, translate Morse Code, apply Caesar Cipher, and analyze EXIF metadata — all locally in your browser.",
  keywords: [
    "text to binary", "binary converter", "base64 encoder", "base64 decoder",
    "hex converter", "morse code translator", "caesar cipher", "EXIF viewer",
    "online dev tools", "Agung Tools", "steganography", "image steganography",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Agung Tools",
      url: "https://tools.agungdev.com",
      description: "Free all-in-one web utility platform: Text to Binary, Base64, Hex, Octal, Morse Code, Caesar Cipher, EXIF Metadata viewer, Image Steganography.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://tools.agungdev.com/tools?q={search_term_string}" },
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
      description: "Free all-in-one web utility platform with encoding, decoding, and steganography tools.",
      featureList: [
        "Text to Binary Converter", "Number to Binary Converter",
        "Base64 Encoder Decoder", "Text to Hexadecimal Converter",
        "Number to Hex Converter", "Octal Converter",
        "Morse Code Translator", "Caesar Cipher Encoder Decoder",
        "EXIF Metadata Viewer", "GPS Metadata Extractor",
        "Image Steganography", "AES-256-GCM Encryption",
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
