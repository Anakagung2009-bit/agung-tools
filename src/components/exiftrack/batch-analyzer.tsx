"use client";

import { useCallback, useState } from "react";
import { useAppStore, FileMetadata } from "@/store/exiftrack-store";
import { parseFileMetadata, formatFileSize } from "@/lib/exif-parser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileImage,
  X,
  MapPin,
  Camera,
  Download,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BatchAnalyzer() {
  const { batchFiles, addBatchFile, removeBatchFile, clearBatchFiles, addToHistory } =
    useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      setIsProcessing(true);
      setProgress(0);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const metadata: FileMetadata = await parseFileMetadata(file);
        addBatchFile(metadata);
        addToHistory({
          id: metadata.id,
          fileName: metadata.fileName,
          fileType: metadata.fileType,
          fileSize: metadata.fileSize,
          analyzedAt: Date.now(),
          hasGps: !!metadata.gps,
          camera: metadata.camera?.model,
        });
        setProgress(((i + 1) / fileArray.length) * 100);
      }

      setIsProcessing(false);
      setTimeout(() => setProgress(0), 500);
    },
    [addBatchFile, addToHistory]
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

  const exportToJson = () => {
    const jsonData = batchFiles.map((file) => ({
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      camera: file.camera,
      exposure: file.exposure,
      gps: file.gps,
      dateTime: file.dateTime,
      resolution: file.resolution,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exiftrack-batch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Batch Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Analyze multiple files and compare metadata
          </p>
        </div>
        <div className="flex gap-2">
          {batchFiles.length > 0 && (
            <>
              <Button variant="outline" className="gap-1" onClick={exportToJson}>
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                className="gap-1 text-destructive"
                onClick={clearBatchFiles}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload Zone */}
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
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isProcessing ? (
            <div className="w-full max-w-xs space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Processing files... {Math.round(progress)}%
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-lg font-medium mb-1">Drop files here</p>
              <p className="text-sm text-muted-foreground mb-3">
                or click to select multiple files
              </p>

              <label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
                <Button asChild variant="outline">
                  <span>Select Files</span>
                </Button>
              </label>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {batchFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Analyzed Files ({batchFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead>GPS</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {file.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {file.resolution || "-"}
                      </TableCell>
                      <TableCell>
                        {file.camera?.model ? (
                          <Badge variant="outline" className="gap-1">
                            <Camera className="h-3 w-3" />
                            {file.camera.model}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {file.gps ? (
                          <Badge variant="outline" className="gap-1 text-primary">
                            <MapPin className="h-3 w-3" />
                            Yes
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {file.dateTime?.original || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeBatchFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {batchFiles.length === 0 && !isProcessing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileImage className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-1">No files analyzed yet</p>
            <p className="text-sm text-muted-foreground">
              Upload multiple files to compare their metadata
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
