import { SteganographyTool } from "@/components/steganography/steganography-tool";

export const metadata = {
  title: "Image Steganography — Hide & Extract Secret Messages | Agung Tools",
  description:
    "Free online image steganography tool. Hide secret messages inside images using LSB steganography with optional AES-256-GCM encryption. Encode, decode, and detect hidden data — all locally in your browser. No data uploaded to server.",
  keywords: [
    "image steganography",
    "steganography online",
    "hide message in image",
    "LSB steganography",
    "AES encryption steganography",
    "decode hidden message",
    "steganalysis",
    "EXIF removal",
    "privacy image tool",
    "encode message in photo",
    "steganography detector",
    "secret message in image",
    "Agung Tools",
  ],
  openGraph: {
    title: "Image Steganography — Encode & Decode Hidden Messages | Agung Tools",
    description:
      "Hide secret messages inside images with optional AES-256-GCM encryption. Fully client-side — your data never leaves the browser.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Image Steganography Tool",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Hide and extract secret messages from images using LSB steganography and AES-256-GCM encryption, entirely in the browser.",
  url: "https://tools.agungdev.com/steganography",
  featureList: [
    "LSB Steganography",
    "AES-256-GCM Encryption",
    "Drag and Drop Image Upload",
    "EXIF Metadata Removal",
    "Hidden Data Detection (Chi-square)",
    "Offline / Client-side Processing",
  ],
};

export default function SteganographyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SteganographyTool />
    </>
  );
}
