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
  Upload,
  Info,
} from "lucide-react";
import { toast } from "sonner";

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

  const exportSettings = () => {
    const settings = {
      darkMode,
      showRawView,
      privacyMode,
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
    toast.success("Settings exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure Agung Tools to your preferences
        </p>
      </div>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
          </div>
          <CardDescription>
            All file processing happens locally in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-mode">Privacy Mode</Label>
              <p className="text-sm text-muted-foreground">
                Shows a visual indicator that processing is local-only
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
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme for better visibility in low light
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

      {/* Metadata View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <CardTitle className="text-lg">Metadata View</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="raw-view">Default to Raw View</Label>
              <p className="text-sm text-muted-foreground">
                Show raw JSON metadata instead of structured view
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
          <CardTitle className="text-lg">Data Management</CardTitle>
          <CardDescription>
            Manage your local data and export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>History</Label>
              <p className="text-sm text-muted-foreground">
                {history.length} files in history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive"
              onClick={() => {
                clearHistory();
                toast.success("History cleared");
              }}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1 flex-1" onClick={exportSettings}>
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <CardTitle className="text-lg">About Agung Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Agung Tools is a powerful utility platform designed to help
            developers, photographers, and internet users accomplish
            their daily tasks seamlessly.
          </p>
          <Separator className="my-4" />
        </CardContent>
      </Card>
    </div>
  );
}
