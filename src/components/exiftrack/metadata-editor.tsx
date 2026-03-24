"use client";

import { useState } from "react";
import { useAppStore, FileMetadata } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Save, RotateCcw, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import * as piexif from "piexifjs";

// Helper for GPS Rational formatting
function degToDmsRational(deg: number): [[number, number], [number, number], [number, number]] {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  const secFloat = (minFloat - m) * 60;
  const s = Math.round(secFloat * 100);
  return [[d, 1], [m, 1], [s, 100]];
}

interface EditableFields {
  author: string;
  copyright: string;
  gpsLatitude: string;
  gpsLongitude: string;
  dateTimeOriginal: string;
}

export function MetadataEditor() {
  const { currentFile, setCurrentFile } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<EditableFields>({
    author: currentFile?.author || "",
    copyright: currentFile?.copyright || "",
    gpsLatitude: currentFile?.gps?.latitude?.toString() || "",
    gpsLongitude: currentFile?.gps?.longitude?.toString() || "",
    dateTimeOriginal: currentFile?.dateTime?.original || "",
  });

  if (!currentFile) return null;

  const handleOpen = () => {
    setEditedFields({
      author: currentFile.author || "",
      copyright: currentFile.copyright || "",
      gpsLatitude: currentFile.gps?.latitude?.toString() || "",
      gpsLongitude: currentFile.gps?.longitude?.toString() || "",
      dateTimeOriginal: currentFile.dateTime?.original || "",
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    const updatedFile: FileMetadata = {
      ...currentFile,
      author: editedFields.author || undefined,
      copyright: editedFields.copyright || undefined,
      gps: editedFields.gpsLatitude && editedFields.gpsLongitude
        ? {
            latitude: parseFloat(editedFields.gpsLatitude),
            longitude: parseFloat(editedFields.gpsLongitude),
          }
        : currentFile.gps,
      dateTime: {
        ...currentFile.dateTime,
        original: editedFields.dateTimeOriginal || undefined,
      },
    };

    setCurrentFile(updatedFile);
    setIsOpen(false);
    toast.success("Metadata updated (changes are local only)");
  };

  const handleExport = async () => {
    if (!currentFile || !currentFile.preview) return;
    if (currentFile.fileType !== "image/jpeg") {
      toast.error("EXIF export is currently only supported for JPEG images.");
      return;
    }

    try {
      const response = await fetch(currentFile.preview);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target?.result as string;
        try {
          // Load existing EXIF data so we don't overwrite tags the user didn't edit
          let exifObj: any;
          try {
            exifObj = piexif.load(dataUrl);
          } catch (loadErr) {
            // Start fresh if no existing EXIF or if it's malformed
            exifObj = { "0th": {}, "1st": {}, "Exif": {}, "GPS": {}, "Interop": {}, "thumbnail": null };
          }
          
          if (!exifObj["0th"]) exifObj["0th"] = {};
          if (!exifObj["Exif"]) exifObj["Exif"] = {};
          if (!exifObj["GPS"]) exifObj["GPS"] = {};

          if (editedFields.author) {
            exifObj["0th"][piexif.ImageIFD.Artist] = editedFields.author;
          } else {
            delete exifObj["0th"][piexif.ImageIFD.Artist];
          }

          if (editedFields.copyright) {
            exifObj["0th"][piexif.ImageIFD.Copyright] = editedFields.copyright;
          } else {
            delete exifObj["0th"][piexif.ImageIFD.Copyright];
          }

          if (editedFields.dateTimeOriginal) {
            exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = editedFields.dateTimeOriginal;
          } else {
            delete exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal];
          }

          if (editedFields.gpsLatitude && editedFields.gpsLongitude) {
            const lat = parseFloat(editedFields.gpsLatitude);
            const lng = parseFloat(editedFields.gpsLongitude);
            exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
            exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = degToDmsRational(Math.abs(lat));
            exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W";
            exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = degToDmsRational(Math.abs(lng));
          } else {
            delete exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef];
            delete exifObj["GPS"][piexif.GPSIFD.GPSLatitude];
            delete exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef];
            delete exifObj["GPS"][piexif.GPSIFD.GPSLongitude];
          }

          const exifBytes = piexif.dump(exifObj);
          const newJpegDataUrl = piexif.insert(exifBytes, dataUrl);
          
          const link = document.createElement("a");
          link.href = newJpegDataUrl;
          link.download = `exported_${currentFile.fileName}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success("File exported successfully with new EXIF data!");
          setIsOpen(false);
        } catch (err) {
          console.error(err);
          toast.error("Failed to inject EXIF data.");
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process EXIF export.");
    }
  };

  const handleReset = () => {
    setEditedFields({
      author: currentFile.author || "",
      copyright: currentFile.copyright || "",
      gpsLatitude: currentFile.gps?.latitude?.toString() || "",
      gpsLongitude: currentFile.gps?.longitude?.toString() || "",
      dateTimeOriginal: currentFile.dateTime?.original || "",
    });
  };

  const hasChanges = () => {
    return (
      editedFields.author !== (currentFile.author || "") ||
      editedFields.copyright !== (currentFile.copyright || "") ||
      editedFields.gpsLatitude !== (currentFile.gps?.latitude?.toString() || "") ||
      editedFields.gpsLongitude !== (currentFile.gps?.longitude?.toString() || "") ||
      editedFields.dateTimeOriginal !== (currentFile.dateTime?.original || "")
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Edit Metadata</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleOpen}>
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Metadata</DialogTitle>
              <DialogDescription>
                Modify selected metadata fields. Changes are local only.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can now export the file to permanently save these edited EXIF values into your image.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author / Artist</Label>
                  <Input
                    id="author"
                    value={editedFields.author}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, author: e.target.value })
                    }
                    placeholder="Enter author name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright</Label>
                  <Input
                    id="copyright"
                    value={editedFields.copyright}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, copyright: e.target.value })
                    }
                    placeholder="Enter copyright info"
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">GPS Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={editedFields.gpsLatitude}
                      onChange={(e) =>
                        setEditedFields({ ...editedFields, gpsLatitude: e.target.value })
                      }
                      placeholder="e.g., 37.774929"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">GPS Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={editedFields.gpsLongitude}
                      onChange={(e) =>
                        setEditedFields({ ...editedFields, gpsLongitude: e.target.value })
                      }
                      placeholder="e.g., -122.419418"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime">Date/Time Original</Label>
                  <Input
                    id="datetime"
                    value={editedFields.dateTimeOriginal}
                    onChange={(e) =>
                      setEditedFields({
                        ...editedFields,
                        dateTimeOriginal: e.target.value,
                      })
                    }
                    placeholder="YYYY:MM:DD HH:MM:SS"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4 sm:mt-0 flex-col sm:flex-row">
              <div className="flex flex-1 justify-start">
                <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row mt-2 sm:mt-0">
                <Button onClick={handleSave} disabled={!hasChanges()} variant="secondary" className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save to App
                </Button>
                <Button onClick={handleExport} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Image
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click Edit to modify Author, Copyright, GPS coordinates, and Date/Time fields.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Note: All changes are stored locally and do not modify the original file.
        </p>
      </CardContent>
    </Card>
  );
}
