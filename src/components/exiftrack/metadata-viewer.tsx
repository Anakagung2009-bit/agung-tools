"use client";

import { useState } from "react";
import { useAppStore } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  Aperture,
  MapPin,
  FileText,
  Clock,
  User,
  Copy,
  Check,
  Code,
  Table,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MetadataSection {
  title: string;
  icon: React.ElementType;
  data: Record<string, string | number | undefined>;
}

export function MetadataViewer() {
  const { currentFile, showRawView, toggleRawView } = useAppStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!currentFile) return null;

  const sections: MetadataSection[] = [];

  // Camera section
  if (currentFile.camera) {
    sections.push({
      title: "Camera",
      icon: Camera,
      data: {
        Make: currentFile.camera.make,
        Model: currentFile.camera.model,
        Lens: currentFile.camera.lens,
        "Serial Number": currentFile.camera.serialNumber,
      },
    });
  }

  // Exposure section
  if (currentFile.exposure) {
    sections.push({
      title: "Exposure",
      icon: Aperture,
      data: {
        ISO: currentFile.exposure.iso,
        Aperture: currentFile.exposure.aperture ? `f/${currentFile.exposure.aperture}` : undefined,
        "Shutter Speed": currentFile.exposure.shutterSpeed,
        "Focal Length": currentFile.exposure.focalLength,
        "Exposure Mode": currentFile.exposure.exposureMode,
        "Metering Mode": currentFile.exposure.meteringMode,
        Flash: currentFile.exposure.flash,
        "White Balance": currentFile.exposure.whiteBalance,
      },
    });
  }

  // GPS section
  if (currentFile.gps) {
    sections.push({
      title: "GPS",
      icon: MapPin,
      data: {
        Latitude: currentFile.gps.latitude.toFixed(6),
        Longitude: currentFile.gps.longitude.toFixed(6),
      },
    });
  }

  // DateTime section
  if (currentFile.dateTime) {
    sections.push({
      title: "Date & Time",
      icon: Clock,
      data: {
        Original: currentFile.dateTime.original,
        Modified: currentFile.dateTime.modified,
        Digitized: currentFile.dateTime.digitized,
      },
    });
  }

  // File info section
  sections.push({
    title: "File Info",
    icon: FileText,
    data: {
      "File Name": currentFile.fileName,
      "File Type": currentFile.fileType,
      "File Format": currentFile.fileFormat,
      "File Size": `${currentFile.fileSize} bytes`,
      Width: currentFile.width,
      Height: currentFile.height,
      Resolution: currentFile.resolution,
      "Bit Depth": currentFile.bitDepth,
      "Color Space": currentFile.colorSpace,
    },
  });

  // Author/Copyright section
  if (currentFile.author || currentFile.copyright || currentFile.software) {
    sections.push({
      title: "Author & Copyright",
      icon: User,
      data: {
        Author: currentFile.author,
        Copyright: currentFile.copyright,
        Software: currentFile.software,
      },
    });
  }

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllMetadata = () => {
    const json = JSON.stringify(currentFile.rawExif || currentFile, null, 2);
    navigator.clipboard.writeText(json);
    toast.success("All metadata copied to clipboard");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Metadata</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="raw-view" className="text-sm text-muted-foreground">
              Raw View
            </Label>
            <Switch id="raw-view" checked={showRawView} onCheckedChange={toggleRawView} />
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={copyAllMetadata}>
            <Copy className="h-3 w-3" />
            Copy All
          </Button>
        </div>
      </CardHeader>

      {showRawView ? (
        <CardContent>
          <div className="relative">
            <ScrollArea className="h-96 rounded-lg bg-secondary/50">
              <pre className="p-4 text-sm font-mono tabular-nums overflow-x-auto">
                {JSON.stringify(currentFile.rawExif || currentFile, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <Tabs defaultValue={sections[0]?.title.toLowerCase().replace(/\s/g, "-")}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.title}
                  value={section.title.toLowerCase().replace(/\s/g, "-")}
                  className="gap-1"
                >
                  <section.icon className="h-3 w-3" />
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((section) => (
              <TabsContent
                key={section.title}
                value={section.title.toLowerCase().replace(/\s/g, "-")}
              >
                <div className="space-y-1">
                  {Object.entries(section.data)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => {
                      const entryKey = `${section.title}-${key}`;
                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center justify-between py-2 px-3 rounded-lg",
                            "hover:bg-accent transition-colors group"
                          )}
                        >
                          <span className="text-sm text-muted-foreground">{key}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium font-mono tabular-nums">
                              {value}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(entryKey, String(value))}
                            >
                              {copiedKey === entryKey ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
