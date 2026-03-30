"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Files,
  History,
  Wrench,
  Settings,
  Shield,
  Zap,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSelector } from "@/components/language-selector";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { privacyMode, history } = useAppStore();
  const pathname = usePathname();
  const { t } = useI18n();

  const menuItems = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/upload", labelKey: "nav.fileMetadata", icon: Upload },
    { href: "/batch", labelKey: "nav.batchAnalyzer", icon: Files },
    { href: "/history", labelKey: "nav.history", icon: History },
    { href: "/tools", labelKey: "nav.extraTools", icon: Wrench },
    { href: "/steganography", labelKey: "nav.steganography", icon: EyeOff },
    { href: "/settings", labelKey: "nav.settings", icon: Settings },
  ];

  return (
    <aside className="h-full w-full bg-sidebar flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-5 border-b border-border hover:bg-accent/50 transition-colors">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">Agung Tools</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link href={item.href} key={item.href} onClick={onNavigate}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 font-medium",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
                {item.href === "/history" && history.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {history.length}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Language Selector */}
      <div className="px-3 pt-3 pb-1">
        <LanguageSelector variant="compact" className="w-full" />
      </div>

      {/* Privacy indicator */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield
            className={cn(
              "h-4 w-4",
              privacyMode ? "text-success" : "text-muted-foreground"
            )}
          />
          <span>
            {privacyMode ? t("common.privacyOn") : t("common.privacyOff")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("common.processingLocal")}
        </p>
      </div>
    </aside>
  );
}
