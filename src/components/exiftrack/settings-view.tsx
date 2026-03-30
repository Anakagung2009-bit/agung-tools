"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Moon,
  Code,
  Trash2,
  Download,
  Info,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSelector } from "@/components/language-selector";
import { detectBrowserLocale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function SettingsView() {
  const {
    darkMode,
    toggleDarkMode,
    showRawView,
    toggleRawView,
    privacyMode,
    togglePrivacyMode,
    history,
    clearHistory,
  } = useAppStore();

  const { t, locale, detectedLocale } = useI18n();

  const exportSettings = () => {
    const settings = {
      darkMode,
      showRawView,
      privacyMode,
      locale,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agung-tools-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.data.settingsExported"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("settings.privacy.title")}</CardTitle>
          </div>
          <CardDescription>{t("settings.privacy.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-mode">{t("settings.privacy.privacyMode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.privacy.privacyModeDesc")}
              </p>
            </div>
            <Switch
              id="privacy-mode"
              checked={privacyMode}
              onCheckedChange={togglePrivacyMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <CardTitle className="text-lg">{t("settings.appearance.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">{t("settings.appearance.darkMode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.appearance.darkModeDesc")}
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("settings.language.title")}</CardTitle>
          </div>
          <CardDescription>{t("settings.language.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label>{t("settings.language.label")}</Label>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {t("settings.language.autoDetected")}:
                <Badge variant="secondary" className="text-xs font-mono">
                  {detectedLocale === "id" ? "🇮🇩 id" : "🇬🇧 en"}
                </Badge>
              </p>
            </div>
            <LanguageSelector variant="full" className="w-48 shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Metadata View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <CardTitle className="text-lg">{t("settings.metadata.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="raw-view">{t("settings.metadata.rawView")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.metadata.rawViewDesc")}
              </p>
            </div>
            <Switch
              id="raw-view"
              checked={showRawView}
              onCheckedChange={toggleRawView}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("settings.data.title")}</CardTitle>
          <CardDescription>{t("settings.data.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.data.history")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.data.historyCount", { count: history.length })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive"
              onClick={() => {
                clearHistory();
                toast.success(t("settings.data.historyCleared"));
              }}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              {t("settings.data.clearHistory")}
            </Button>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1 flex-1" onClick={exportSettings}>
              <Download className="h-4 w-4" />
              {t("settings.data.exportSettings")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <CardTitle className="text-lg">{t("settings.about.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{t("settings.about.desc")}</p>
          <Separator className="my-4" />
        </CardContent>
      </Card>
    </div>
  );
}
