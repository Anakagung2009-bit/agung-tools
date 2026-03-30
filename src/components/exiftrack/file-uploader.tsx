"use client";

import { useCallback, useState } from "react";
import { useAppStore, FileMetadata } from "@/store/exiftrack-store";
import { parseFileMetadata, formatFileSize } from "@/lib/exif-parser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileImage,
  FileVideo,
  FileAudio,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "image/gif",
  "image/tiff",
  "image/bmp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
];

const ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".webp",
  ".gif",
  ".tiff",
  ".tif",
  ".bmp",
  ".mp4",
  ".mov",
  ".webm",
  ".mp3",
  ".wav",
];

export function FileUploader() {
  const { setCurrentFile, addToHistory, currentFile, setCurrentView } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
      });

      if (validFiles.length === 0) {
        setError(t("upload.invalidFile"));
        return;
      }

      setIsProcessing(true);
      setError(null);
      setProgress(0);

      try {
        // Process the first file
        const file = validFiles[0];
        setProgress(30);

        const metadata: FileMetadata = await parseFileMetadata(file);
        setProgress(70);

        setCurrentFile(metadata);
        addToHistory({
          id: metadata.id,
          fileName: metadata.fileName,
          fileType: metadata.fileType,
          fileSize: metadata.fileSize,
          analyzedAt: Date.now(),
          hasGps: !!metadata.gps,
          camera: metadata.camera?.model,
        });

        setProgress(100);
      } catch (err) {
        setError(t("upload.failedProcess"));
        console.error(err);
      } finally {
        setIsProcessing(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [setCurrentFile, addToHistory]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  // Register paste handler
  if (typeof window !== "undefined") {
    window.addEventListener("paste", handlePaste);
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />;
    if (type.startsWith("video/")) return <FileVideo className="h-5 w-5" />;
    if (type.startsWith("audio/")) return <FileAudio className="h-5 w-5" />;
    return <FileImage className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("upload.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("upload.subtitle")}
        </p>
      </div>

      {/* Upload Zone */}
      {!currentFile && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragging ? "bg-primary text-primary-foreground" : "bg-secondary"
              )}
            >
              <Upload className="h-8 w-8" />
            </div>

            {isProcessing ? (
              <div className="w-full max-w-xs space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  {t("upload.processingFile")}
                </p>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <>
                <p className="text-lg font-medium mb-1">
                  {t("upload.dropHere")}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("upload.supports")}
                </p>

                <label>
                  <input
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <Button asChild>
                    <span>{t("upload.browseFiles")}</span>
                  </Button>
                </label>

                <p className="text-xs text-muted-foreground mt-4">
                  {t("upload.pasteHint")}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing indicator */}
      {isProcessing && progress > 0 && progress < 100 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("upload.processing")}</p>
                <Progress value={progress} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
