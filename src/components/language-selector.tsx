"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";
import { type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

interface LanguageSelectorProps {
  /** compact = icon + short label only (for sidebar); full = full dropdown */
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageSelector({
  variant = "compact",
  className,
}: LanguageSelectorProps) {
  const { locale, setLocale, t } = useI18n();

  const current = LOCALE_OPTIONS.find((o) => o.value === locale);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {variant === "full" && (
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <Select
        value={locale}
        onValueChange={(v) => setLocale(v as Locale)}
      >
        <SelectTrigger
          id="language-selector"
          className={cn(
            "border-border bg-background focus:ring-1 focus:ring-primary",
            variant === "compact" ? "h-8 w-full text-xs gap-1.5 px-2" : "h-9 w-full text-sm"
          )}
          aria-label={t("language.select")}
        >
          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <span>{current?.flag}</span>
              <span className={variant === "compact" ? "truncate max-w-[90px]" : ""}>
                {current?.label}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LOCALE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-sm">
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">{opt.flag}</span>
                <span>{opt.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
