import { ToolsGrid } from "@/components/tools/tools-grid";

export const metadata = {
  title: "Text to Binary, Base64, Hex & Morse Code Tools - DevTools Lab",
  description:
    "Free online developer tools: Text to Binary converter, Number to Binary, Base64 Encoder/Decoder, Text to Hex, Number to Hex, Octal converter, Morse Code translator, and Caesar Cipher — all running securely in your browser.",
  keywords: [
    "text to binary",
    "binary converter online",
    "text to binary converter",
    "number to binary",
    "binary to text",
    "binary to number",
    "base64 encoder",
    "base64 decoder",
    "base64 encode online",
    "base64 decode online",
    "text to hex",
    "hex to text",
    "number to hex",
    "hex converter",
    "hexadecimal converter",
    "text to octal",
    "octal converter",
    "number to octal",
    "morse code translator",
    "morse code converter online",
    "caesar cipher online",
    "caesar cipher encoder decoder",
    "devtools lab",
    "free online encoding tools",
  ],
  openGraph: {
    title: "Text to Binary, Base64, Hex & Morse Code Tools - Agung Tools",
    description:
      "Free online developer tools: Text to Binary, Base64 Encoder/Decoder, Hex & Octal converters, Morse Code translator, Caesar Cipher — all in your browser.",
  },
};

const toolsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Agung Tools - DevTools Lab",
  description: "A collection of free online developer encoding and conversion utilities.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "SoftwareApplication",
        name: "Text to Binary Converter",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Convert plain text to binary code and binary back to text, instantly in your browser.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "SoftwareApplication",
        name: "Number to Binary Converter",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Convert any number to its binary representation and vice versa.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "SoftwareApplication",
        name: "Base64 Encoder & Decoder",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Encode text to Base64 or decode Base64 strings back to plain text.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "SoftwareApplication",
        name: "Text to Hexadecimal Converter",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Convert text or numbers to hexadecimal (Hex) and back.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "SoftwareApplication",
        name: "Octal Converter",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Convert text or numbers to octal format and decode octal back.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 6,
      item: {
        "@type": "SoftwareApplication",
        name: "Morse Code Translator",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Translate text to Morse code and decode Morse code back to text, with audio playback.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
    {
      "@type": "ListItem",
      position: 7,
      item: {
        "@type": "SoftwareApplication",
        name: "Caesar Cipher Encoder & Decoder",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Encode and decode text using the Caesar Cipher with a custom shift value.",
        url: "https://agung-tools.vercel.app/tools",
      },
    },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
      />
      <ToolsGrid />
    </>
  );
}
