"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/exiftrack-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface HistogramData {
  range: string;
  count: number;
}

function calculateHistogram(imageData: ImageData): HistogramData[] {
  const data = imageData.data;
  
  // Calculate brightness histogram (luminance)
  const buckets: number[] = new Array(16).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const bucket = Math.min(15, Math.floor(luminance / 16));
    buckets[bucket]++;
  }

  // Normalize and format data
  const maxCount = Math.max(...buckets);
  return buckets.map((count, index) => ({
    range: `${index * 16}`,
    count: Math.round((count / maxCount) * 100),
  }));
}

export function Histogram() {
  const { currentFile } = useAppStore();
  const [histogramData, setHistogramData] = useState<HistogramData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewUrl = currentFile?.preview;

  useEffect(() => {
    // Skip if no preview
    if (!previewUrl) {
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      if (isCancelled) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const chartData = calculateHistogram(imageData);
        if (!isCancelled) {
          setHistogramData(chartData);
        }
      } catch {
        // CORS or security error - handled by empty state check
      }
    };

    img.onerror = () => {
      // Error handled by empty state check
    };

    img.src = previewUrl;

    return () => {
      isCancelled = true;
    };
  }, [previewUrl]);

  if (!previewUrl || histogramData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Brightness Histogram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <XAxis
                dataKey="range"
                tick={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value}%`, "Brightness"]}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          0 (Black) → 255 (White)
        </p>
      </CardContent>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
