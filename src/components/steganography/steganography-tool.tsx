"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EyeOff,
  Eye,
  Upload,
  Download,
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Image as ImageIcon,
  ScanSearch,
  RefreshCw,
  Copy,
  Check,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  encodeMessage,
  decodeMessage,
  decodeMessageAuto,
  encryptMessage,
  decryptMessage,
  isEncrypted,
  analyzeEntropy,
  getCapacity,
  formatCapacity,
  type BitsPerChannel,
  type EntropyResult,
} from "@/lib/steganography";
import { useI18n } from "@/hooks/use-i18n";

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function useImageToCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImageFile = useCallback(
    (file: File): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas) return reject(new Error("Canvas not ready"));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));

        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(imageData);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load image."));
        };
        img.src = url;
      });
    },
    []
  );

  return { canvasRef, loadImageFile };
}

function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas context error"));
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image blob"));
      },
      "image/png"
    );
  });
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFile, file, accept = "image/*", label, sublabel, id,
}: {
  onFile: (f: File) => void;
  file: File | null;
  accept?: string;
  label: string;
  sublabel: string;
  id: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
        "flex flex-col items-center justify-center gap-3 p-8 text-center min-h-[160px]",
        dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/30",
        file && "border-primary/40 bg-primary/3"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {file ? (
        <>
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(file.size / 1024).toFixed(1)} KB — click to change
            </p>
          </div>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-muted-foreground/60" />
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Image Preview ─────────────────────────────────────────────────────────────

function ImagePreview({
  title, imageData, file, badge,
}: {
  title: string;
  imageData: ImageData | null;
  file: File | null;
  badge?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    canvasRef.current.width = imageData.width;
    canvasRef.current.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  if (!file && !imageData) {
    return (
      <div className="border border-dashed border-border rounded-xl flex items-center justify-center h-48 bg-muted/20">
        <div className="text-center text-muted-foreground/50">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-checkerboard">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-72 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      {imageData && (
        <p className="text-xs text-muted-foreground">
          {imageData.width} × {imageData.height}px
        </p>
      )}
    </div>
  );
}

// ─── Encode Tab ───────────────────────────────────────────────────────────────

function EncodeTab() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [encodedImageData, setEncodedImageData] = useState<ImageData | null>(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strengthIdx, setStrengthIdx] = useState(0);
  const [removeExif, setRemoveExif] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const { canvasRef, loadImageFile } = useImageToCanvas();

  const strengths = [
    { bpc: 1 as BitsPerChannel, color: "text-emerald-500" },
    { bpc: 2 as BitsPerChannel, color: "text-amber-500" },
    { bpc: 4 as BitsPerChannel, color: "text-rose-500" },
  ];
  const strengthKeys = ["Low", "Medium", "High"] as const;
  const selectedBpc = strengths[strengthIdx].bpc;

  const updateCapacity = (imgData: ImageData, idx: number) => {
    const bpc = strengths[idx].bpc;
    const cap = getCapacity(imgData.width, imgData.height, bpc);
    setCapacityInfo(
      t("steganography.encode.capacityInfo", {
        strength: t(`steganography.encode.strength${strengthKeys[idx]}`),
        size: formatCapacity(cap),
      })
    );
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setEncodedImageData(null);
    setDownloadUrl(null);
    setCapacityInfo(null);
    try {
      const imgData = await loadImageFile(f);
      setOriginalImageData(imgData);
      updateCapacity(imgData, strengthIdx);
      if (f.type === "image/jpeg" || f.name.toLowerCase().endsWith(".jpg")) {
        toast.warning(t("steganography.encode.jpegWarning"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  useEffect(() => {
    if (originalImageData) updateCapacity(originalImageData, strengthIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strengthIdx, originalImageData]);

  const handleEncode = async () => {
    if (!originalImageData) return toast.error(t("steganography.encode.errorNoImage"));
    if (!message.trim()) return toast.error(t("steganography.encode.errorNoMessage"));

    setIsProcessing(true);
    setEncodedImageData(null);
    setDownloadUrl(null);

    try {
      let payload = message;
      if (usePassword && password) {
        payload = await encryptMessage(message, password);
      }

      const { imageData: result, bytesUsed, bytesCapacity } = encodeMessage(
        originalImageData,
        payload,
        selectedBpc
      );

      setEncodedImageData(result);
      const blob = await imageDataToBlob(result);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast.success(`${t("common.success")} — ${formatCapacity(bytesUsed)} / ${formatCapacity(bytesCapacity)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Encoding failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    const baseName = file.name.replace(/\.[^.]+$/, "");
    a.href = downloadUrl;
    a.download = `${baseName}_steg.png`;
    a.click();
    toast.success(t("steganography.encode.downloadedAs"));
  };

  const handleReset = () => {
    setFile(null); setOriginalImageData(null); setEncodedImageData(null);
    setMessage(""); setPassword(""); setDownloadUrl(null); setCapacityInfo(null);
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-5">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-primary" />
              {t("steganography.encode.coverImage")}
            </Label>
            <DropZone
              id="encode-image-upload"
              onFile={handleFile}
              file={file}
              label={t("steganography.encode.dropLabel")}
              sublabel={t("steganography.encode.dropSublabel")}
            />
            {capacityInfo && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                {capacityInfo}
              </p>
            )}
          </div>

          {/* Secret Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <EyeOff className="h-4 w-4 text-primary" />
              {t("steganography.encode.secretMessage")}
            </Label>
            <Textarea
              id="encode-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("steganography.encode.secretMessagePlaceholder")}
              className="min-h-[120px] resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">
              {new TextEncoder().encode(message).length.toLocaleString()} {t("common.bytes")}
            </p>
          </div>

          {/* Password */}
          <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  {t("steganography.encode.password")}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("steganography.encode.passwordSubtitle")}
                </p>
              </div>
              <Switch id="use-password-toggle" checked={usePassword} onCheckedChange={setUsePassword} />
            </div>
            {usePassword && (
              <div className="relative">
                <Input
                  id="encode-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("steganography.encode.passwordPlaceholder")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Encoding Strength */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              {t("steganography.encode.strength")}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {strengthKeys.map((key, idx) => (
                <button
                  key={key}
                  id={`strength-${key.toLowerCase()}`}
                  type="button"
                  onClick={() => setStrengthIdx(idx)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    strengthIdx === idx
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border hover:border-primary/30 hover:bg-accent/30"
                  )}
                >
                  <p className={cn("text-sm font-semibold", strengths[idx].color)}>
                    {t(`steganography.encode.strength${key}`)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {t(`steganography.encode.strength${key}Desc`)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* EXIF Removal */}
          <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                {t("steganography.encode.stripExif")}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("steganography.encode.stripExifDesc")}
              </p>
            </div>
            <Switch id="remove-exif-toggle" checked={removeExif} onCheckedChange={setRemoveExif} />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              id="encode-button"
              onClick={handleEncode}
              disabled={isProcessing || !file || !message.trim()}
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <><RefreshCw className="h-4 w-4 animate-spin" />{t("steganography.encode.encoding")}</>
              ) : (
                <><EyeOff className="h-4 w-4" />{t("steganography.encode.encodeButton")}</>
              )}
            </Button>
            {encodedImageData && (
              <Button id="download-encoded-button" variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                {t("steganography.encode.downloadPng")}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleReset} title={t("common.reset")}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Preview</Label>
            <div className="grid grid-cols-1 gap-4">
              <ImagePreview title="Original" imageData={originalImageData} file={file} badge={file ? `${(file.size / 1024).toFixed(0)} KB` : undefined} />
              <ImagePreview title={t("steganography.encode.successTitle")} imageData={encodedImageData} file={encodedImageData ? file : null} badge={encodedImageData ? "Steganographic PNG" : undefined} />
            </div>
          </div>

          {encodedImageData && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{t("steganography.encode.successTitle")}</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• {t("steganography.encode.successLsb")}</li>
                {usePassword && password && <li>• {t("steganography.encode.successEncrypted")}</li>}
                <li>• {t("steganography.encode.successPng")}</li>
                {removeExif && <li>• {t("steganography.encode.successExif")}</li>}
                <li>• {t("steganography.encode.successLocal")}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Decode Tab ───────────────────────────────────────────────────────────────

function DecodeTab() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ message: string; bpc: BitsPerChannel; wasEncrypted: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualBpc, setManualBpc] = useState<BitsPerChannel | "auto">("auto");

  const { canvasRef, loadImageFile } = useImageToCanvas();

  const handleFile = async (f: File) => {
    setFile(f); setResult(null); setError(null);
    try {
      setImageData(await loadImageFile(f));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const handleDecode = async () => {
    if (!imageData) return toast.error(t("steganography.encode.errorNoImage"));
    setIsProcessing(true); setResult(null); setError(null);

    try {
      let rawMessage: string;
      let detectedBpc: BitsPerChannel;

      if (manualBpc === "auto") {
        const { message, bpc } = decodeMessageAuto(imageData);
        rawMessage = message; detectedBpc = bpc;
      } else {
        rawMessage = decodeMessage(imageData, manualBpc);
        detectedBpc = manualBpc;
      }

      const wasEncrypted = isEncrypted(rawMessage);
      let finalMessage = rawMessage;

      if (wasEncrypted) {
        if (!password) {
          setError(t("steganography.decode.needPassword"));
          setIsProcessing(false);
          return;
        }
        finalMessage = await decryptMessage(rawMessage, password);
      }

      setResult({ message: finalMessage, bpc: detectedBpc, wasEncrypted });
      toast.success(t("common.success"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Decoding failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result?.message) return;
    navigator.clipboard.writeText(result.message);
    setCopied(true);
    toast.success(t("common.copiedToClipboard"));
    setTimeout(() => setCopied(false), 2000);
  };

  const bpcOptions = (["auto", 1, 2, 4] as const);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-primary" />
              {t("steganography.decode.coverImage")}
            </Label>
            <DropZone
              id="decode-image-upload"
              onFile={handleFile}
              file={file}
              label={t("steganography.decode.dropLabel")}
              sublabel={t("steganography.decode.dropSublabel")}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" />
              {t("steganography.decode.password")}
            </Label>
            <div className="relative">
              <Input
                id="decode-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("steganography.decode.passwordPlaceholder")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              {t("steganography.decode.strengthLabel")}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {bpcOptions.map((v) => (
                <button
                  key={String(v)}
                  id={`decode-bpc-${v}`}
                  type="button"
                  onClick={() => setManualBpc(v)}
                  className={cn(
                    "rounded-lg border p-2.5 text-sm font-medium transition-all",
                    manualBpc === v
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v === "auto" ? t("steganography.decode.auto") : `${v} bpc`}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t("steganography.decode.autoDesc")}</p>
          </div>

          <Button id="decode-button" onClick={handleDecode} disabled={isProcessing || !file} className="w-full gap-2">
            {isProcessing ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />{t("steganography.decode.decoding")}</>
            ) : (
              <><Eye className="h-4 w-4" />{t("steganography.decode.decodeButton")}</>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <ImagePreview title={t("steganography.decode.coverImage")} imageData={imageData} file={file} />

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{t("steganography.decode.errorTitle")}</p>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">{t("steganography.decode.successTitle")}</p>
                  <div className="ml-auto flex gap-1.5">
                    <Badge variant="secondary" className="text-xs">{result.bpc} bpc</Badge>
                    {result.wasEncrypted && (
                      <Badge className="text-xs gap-1"><Lock className="h-2.5 w-2.5" />Encrypted</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t("steganography.decode.extractedMessage")}</Label>
                  <Button id="copy-decoded-message" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <Textarea readOnly value={result.message} className="min-h-[160px] font-mono text-sm resize-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Analyze Tab ──────────────────────────────────────────────────────────────

function AnalyzeTab() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [result, setResult] = useState<EntropyResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { canvasRef, loadImageFile } = useImageToCanvas();

  const handleFile = async (f: File) => {
    setFile(f); setResult(null);
    try { setImageData(await loadImageFile(f)); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load image"); }
  };

  const handleAnalyze = async () => {
    if (!imageData) return toast.error(t("steganography.encode.errorNoImage"));
    setIsProcessing(true); setResult(null);
    await new Promise((r) => setTimeout(r, 100));
    try { setResult(analyzeEntropy(imageData)); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Analysis failed"); }
    finally { setIsProcessing(false); }
  };

  const levelConfig = {
    low: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500", icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, key: "lowProbability" as const },
    medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", bar: "bg-amber-500", icon: <Zap className="h-5 w-5 text-amber-500" />, key: "mediumProbability" as const },
    high: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", bar: "bg-rose-500", icon: <Zap className="h-5 w-5 text-rose-500" />, key: "highProbability" as const },
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ScanSearch className="h-4 w-4 text-primary" />
              {t("steganography.analyze.imageTitle")}
            </Label>
            <DropZone
              id="analyze-image-upload"
              onFile={handleFile}
              file={file}
              label={t("steganography.analyze.dropLabel")}
              sublabel={t("steganography.analyze.dropSublabel")}
            />
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t("steganography.analyze.howTitle")}
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              {(["how1","how2","how3","how4","how5"] as const).map((k) => (
                <li key={k}>• {t(`steganography.analyze.${k}`)}</li>
              ))}
            </ul>
          </div>

          <Button id="analyze-button" onClick={handleAnalyze} disabled={isProcessing || !file} className="w-full gap-2">
            {isProcessing ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />{t("steganography.analyze.analyzing")}</>
            ) : (
              <><ScanSearch className="h-4 w-4" />{t("steganography.analyze.analyzeButton")}</>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <ImagePreview title={t("steganography.analyze.imageTitle")} imageData={imageData} file={file} />

          {result && (() => {
            const cfg = levelConfig[result.level];
            return (
              <div className="space-y-4">
                <div className={cn("rounded-xl border p-5 space-y-4", cfg.bg)}>
                  <div className="flex items-center gap-3">
                    {cfg.icon}
                    <div>
                      <p className={cn("font-semibold", cfg.color)}>
                        {t(`steganography.analyze.${cfg.key}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.probability}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("steganography.analyze.confidence")}</span>
                      <span>{result.score}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", cfg.bar)} style={{ width: `${result.score}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("steganography.analyze.chiSquare"), value: result.chiSquare.toFixed(2), hint: t("steganography.analyze.chiSquareHint") },
                    { label: t("steganography.analyze.maxCapacity"), value: formatCapacity(result.byteCapacity), hint: t("steganography.analyze.maxCapacityHint") },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-semibold tabular-nums">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium mb-1.5 text-muted-foreground">{t("steganography.analyze.technicalDetails")}</p>
                  <p className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">{result.details}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{t("steganography.analyze.disclaimer")}</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SteganographyTool() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <EyeOff className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{t("steganography.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("steganography.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t("steganography.privacyLabel")} </span>
          {t("steganography.privacyNotice")}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="encode" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger id="tab-encode" value="encode" className="gap-2 text-sm">
            <EyeOff className="h-4 w-4" />
            {t("steganography.tabs.encode")}
          </TabsTrigger>
          <TabsTrigger id="tab-decode" value="decode" className="gap-2 text-sm">
            <Eye className="h-4 w-4" />
            {t("steganography.tabs.decode")}
          </TabsTrigger>
          <TabsTrigger id="tab-analyze" value="analyze" className="gap-2 text-sm">
            <ScanSearch className="h-4 w-4" />
            {t("steganography.tabs.analyze")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-primary" />
                {t("steganography.encode.title")}
              </CardTitle>
            </CardHeader>
            <CardContent><EncodeTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decode">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {t("steganography.decode.title")}
              </CardTitle>
            </CardHeader>
            <CardContent><DecodeTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanSearch className="h-4 w-4 text-primary" />
                {t("steganography.analyze.title")}
              </CardTitle>
            </CardHeader>
            <CardContent><AnalyzeTab /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer legend */}
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {[
          { icon: <EyeOff className="h-4 w-4 text-primary" />, titleKey: "steganography.footer.lsbTitle", descKey: "steganography.footer.lsbDesc" },
          { icon: <Lock className="h-4 w-4 text-primary" />, titleKey: "steganography.footer.aesTitle", descKey: "steganography.footer.aesDesc" },
          { icon: <ScanSearch className="h-4 w-4 text-primary" />, titleKey: "steganography.footer.chiTitle", descKey: "steganography.footer.chiDesc" },
        ].map((item) => (
          <div key={item.titleKey} className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="font-medium text-xs">{t(item.titleKey)}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(item.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
