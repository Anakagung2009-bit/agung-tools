"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileImage,
  MapPin,
  Camera,
  Clock,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import { formatFileSize } from "@/lib/exif-parser";
import { useRouter } from "next/navigation";

export function Dashboard() {
  const { history, setCurrentView, setCurrentFile } = useAppStore();
  const router = useRouter();

  const stats = {
    totalFiles: history.length,
    filesWithGps: history.filter((h) => h.hasGps).length,
    filesWithCamera: history.filter((h) => h.camera).length,
    totalSize: history.reduce((acc, h) => acc + h.fileSize, 0),
  };

  const recentFiles = history.slice(0, 5);

  const handleQuickUpload = () => {
    router.push("/upload");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome to Agung Tools. The ultimate platform for utilities.
          </p>
        </div>
        <Button onClick={handleQuickUpload} className="gap-2 w-full sm:w-auto">
          <Upload className="h-4 w-4" />
          Quick Upload
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Files
            </CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">Analyzed files</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              GPS Data
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {stats.filesWithGps}
            </div>
            <Progress
              value={stats.totalFiles ? (stats.filesWithGps / stats.totalFiles) * 100 : 0}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Camera Info
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {stats.filesWithCamera}
            </div>
            <Progress
              value={
                stats.totalFiles ? (stats.filesWithCamera / stats.totalFiles) * 100 : 0
              }
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatFileSize(stats.totalSize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processed data</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push("/upload")}
            >
              <Upload className="h-6 w-6" />
              <span>Upload File</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push("/batch")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Batch Analyze</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push("/tools")}
            >
              <HardDrive className="h-6 w-6" />
              <span>DevTools Lab</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          {recentFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No files analyzed yet</p>
              <p className="text-sm mt-1">
                Upload a file to inspect its hidden metadata
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row gap-3 sm:items-center p-4 rounded-xl border bg-card/50 shadow-sm hover:shadow hover:border-primary/40 cursor-pointer transition-all"
                    onClick={() => {
                      const metadata = {
                        ...file,
                        addedAt: file.analyzedAt,
                      } as unknown as Parameters<typeof setCurrentFile>[0];
                      setCurrentFile(metadata);
                      setCurrentView("upload");
                    }}
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold truncate text-sm sm:text-base text-foreground">
                          {file.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="tabular-nums font-medium">
                            {formatFileSize(file.fileSize)}
                          </span>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                          <span>
                            {new Date(file.analyzedAt).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pl-14 sm:pl-0 sm:justify-end">
                      {file.hasGps && (
                        <MapPin className="h-4 w-4 text-blue-500" />
                      )}
                      {file.camera && (
                        <Camera className="h-4 w-4 text-green-500" />
                      )}
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
