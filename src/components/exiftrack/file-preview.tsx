"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { formatFileSize } from "@/lib/exif-parser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileImage,
  MapPin,
  Camera,
  Clock,
  HardDrive,
  Maximize,
  X,
  ExternalLink,
} from "lucide-react";

export function FilePreview() {
  const { currentFile, setCurrentFile, setCurrentView, history } = useAppStore();

  if (!currentFile) return null;

  const handleClose = () => {
    setCurrentFile(null);
    setCurrentView("upload");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate">{currentFile.fileName}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{currentFile.fileFormat}</Badge>
            {currentFile.gps && (
              <Badge variant="outline" className="gap-1 text-primary">
                <MapPin className="h-3 w-3" /> GPS
              </Badge>
            )}
            {currentFile.camera?.model && (
              <Badge variant="outline" className="gap-1 text-primary">
                <Camera className="h-3 w-3" /> {currentFile.camera.model}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        {/* Image Preview */}
        {currentFile.preview && (
          <div className="mb-4 rounded-lg overflow-hidden bg-secondary">
            <img
              src={currentFile.preview}
              alt={currentFile.fileName}
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        )}

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium tabular-nums">
              {formatFileSize(currentFile.fileSize)}
            </span>
          </div>

          {currentFile.resolution && (
            <div className="flex items-center gap-2 text-sm">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Resolution:</span>
              <span className="font-medium tabular-nums">{currentFile.resolution}</span>
            </div>
          )}

          {currentFile.dateTime?.original && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{currentFile.dateTime.original}</span>
            </div>
          )}

          {currentFile.camera?.model && (
            <div className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Camera:</span>
              <span className="font-medium">{currentFile.camera.model}</span>
            </div>
          )}
        </div>

        {/* Exposure Info */}
        {currentFile.exposure && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Exposure Settings
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {currentFile.exposure.iso && (
                <Badge variant="outline" className="justify-center">
                  ISO {currentFile.exposure.iso}
                </Badge>
              )}
              {currentFile.exposure.aperture && (
                <Badge variant="outline" className="justify-center">
                  f/{currentFile.exposure.aperture}
                </Badge>
              )}
              {currentFile.exposure.shutterSpeed && (
                <Badge variant="outline" className="justify-center">
                  {currentFile.exposure.shutterSpeed}
                </Badge>
              )}
              {currentFile.exposure.focalLength && (
                <Badge variant="outline" className="justify-center">
                  {currentFile.exposure.focalLength}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* GPS Info */}
        {currentFile.gps && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              GPS Location
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-mono tabular-nums">
                  {currentFile.gps.latitude.toFixed(6)}, {currentFile.gps.longitude.toFixed(6)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${currentFile.gps?.latitude},${currentFile.gps?.longitude}`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="h-3 w-3" />
                View on Map
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
