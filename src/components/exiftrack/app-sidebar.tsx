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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "File Metadata", icon: Upload },
  { href: "/batch", label: "Batch Analyzer", icon: Files },
  { href: "/history", label: "History", icon: History },
  { href: "/tools", label: "Extra Tools", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { privacyMode, history } = useAppStore();
  const pathname = usePathname();

  return (
    <aside className="h-full w-full bg-sidebar flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-5 border-b border-border hover:bg-accent/50 transition-colors">
        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div> */}
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
                {item.label}
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
            {privacyMode ? "Privacy Mode Active" : "Privacy Mode Off"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          All processing happens locally
        </p>
      </div>
    </aside>
  );
}
