"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileImage,
  MapPin,
  Camera,
  Clock,
  Trash2,
} from "lucide-react";
import { formatFileSize } from "@/lib/exif-parser";
import { useI18n } from "@/hooks/use-i18n";

export function HistoryView() {
  const { history, clearHistory } = useAppStore();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("history.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t("history.subtitle")}
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            className="gap-1 text-destructive w-full sm:w-auto"
            onClick={clearHistory}
          >
            <Trash2 className="h-4 w-4" />
            {t("history.clearHistory")}
          </Button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-1">{t("history.noHistory")}</p>
            <p className="text-sm text-muted-foreground">{t("history.noHistoryHint")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("history.recentFiles")} ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-3 sm:items-center p-4 rounded-xl border bg-card/50 shadow-sm hover:shadow hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold truncate text-sm sm:text-base text-foreground">
                          {item.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="tabular-nums font-medium">
                            {formatFileSize(item.fileSize)}
                          </span>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>
                            {new Date(item.analyzedAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pl-14 sm:pl-0 sm:justify-end">
                      {item.hasGps && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-transparent">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS
                        </Badge>
                      )}
                      {item.camera && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-transparent max-w-[130px] truncate">
                          <Camera className="h-3 w-3 mr-1" />
                          <span className="truncate">{item.camera}</span>
                        </Badge>
                      )}
                      <Badge variant="default" className="font-mono text-[10px] sm:text-xs">
                        {item.fileType.split("/")[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
