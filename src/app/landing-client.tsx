"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Shield, FileSearch } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSelector } from "@/components/language-selector";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Navigation */}
      <header className="w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">Agung Tools</span>
          </div>
          <nav className="flex items-center gap-3">
            <LanguageSelector variant="compact" className="hidden sm:flex" />
            <Link href="/dashboard">
              <Button>{t("landing.goToDashboard")}</Button>
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
              {t("landing.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("landing.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                  {t("landing.cta")}
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  {t("landing.browse")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-24 border-t border-border/40">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <FileSearch className="h-6 w-6 text-primary" />, title: t("landing.feat1Title"), desc: t("landing.feat1Desc") },
              { icon: <Zap className="h-6 w-6 text-primary" />, title: t("landing.feat2Title"), desc: t("landing.feat2Desc") },
              { icon: <Shield className="h-6 w-6 text-primary" />, title: t("landing.feat3Title"), desc: t("landing.feat3Desc") },
            ].map((feat) => (
              <div key={feat.title} className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
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
