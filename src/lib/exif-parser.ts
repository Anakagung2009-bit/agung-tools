import EXIF from "exif-js";
import { FileMetadata, GPSLocation } from "@/store/exiftrack-store";

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Convert DM (degrees minutes) to decimal degrees
function convertDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    dd = dd * -1;
  }
  return dd;
}

// Parse EXIF GPS data
function parseGPS(exifData: EXIF.IFDTags): GPSLocation | undefined {
  const lat = exifData.GPSLatitude;
  const latRef = exifData.GPSLatitudeRef;
  const lon = exifData.GPSLongitude;
  const lonRef = exifData.GPSLongitudeRef;

  if (lat && lon && latRef && lonRef) {
    const latitude = convertDMSToDD(
      lat[0] as number,
      lat[1] as number,
      lat[2] as number,
      latRef as string
    );
    const longitude = convertDMSToDD(
      lon[0] as number,
      lon[1] as number,
      lon[2] as number,
      lonRef as string
    );
    return { latitude, longitude };
  }
  return undefined;
}

// Format aperture value
function formatAperture(aperture: number | undefined): number | undefined {
  if (aperture === undefined) return undefined;
  return Math.round(aperture * 10) / 10;
}

// Format shutter speed
function formatShutterSpeed(exposureTime: number | undefined): string | undefined {
  if (exposureTime === undefined) return undefined;
  if (exposureTime >= 1) {
    return `${exposureTime}s`;
  }
  return `1/${Math.round(1 / exposureTime)}s`;
}

// Format focal length
function formatFocalLength(focalLength: number | undefined): string | undefined {
  if (focalLength === undefined) return undefined;
  return `${focalLength}mm`;
}

// Get file format from MIME type
function getFileFormat(mimeType: string): string {
  const formats: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/heic": "HEIC",
    "image/heif": "HEIF",
    "image/webp": "WebP",
    "image/gif": "GIF",
    "image/tiff": "TIFF",
    "image/bmp": "BMP",
    "video/mp4": "MP4",
    "video/quicktime": "MOV",
    "video/webm": "WebM",
    "audio/mpeg": "MP3",
    "audio/wav": "WAV",
  };
  return formats[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "Unknown";
}

// Parse metadata from file
export async function parseFileMetadata(file: File): Promise<FileMetadata> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const dataUrl = URL.createObjectURL(file);

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = dataUrl;
      }

      const baseMetadata: FileMetadata = {
        id: generateId(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileFormat: getFileFormat(file.type),
        preview,
        addedAt: Date.now(),
      };

      // For images, extract EXIF data
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          baseMetadata.width = img.naturalWidth;
          baseMetadata.height = img.naturalHeight;
          baseMetadata.resolution = `${img.naturalWidth} × ${img.naturalHeight}`;

          // Extract EXIF
          EXIF.getData(img as unknown as HTMLImageElement, function (this: unknown) {
            const allData = EXIF.getAllTags(this as HTMLImageElement);
            const exifData = this as EXIF.IFDTags;

            const metadata: FileMetadata = {
              ...baseMetadata,
              camera: {
                make: (exifData.Make as string)?.trim(),
                model: (exifData.Model as string)?.trim(),
                lens: (exifData.LensModel as string)?.trim(),
                serialNumber: (exifData.SerialNumber as string)?.toString(),
              },
              exposure: {
                iso: exifData.ISOSpeedRatings as number,
                aperture: formatAperture(exifData.FNumber as number),
                shutterSpeed: formatShutterSpeed(exifData.ExposureTime as number),
                focalLength: formatFocalLength(exifData.FocalLength as number),
                exposureMode: exifData.ExposureMode?.toString(),
                meteringMode: exifData.MeteringMode?.toString(),
                flash: exifData.Flash?.toString(),
                whiteBalance: exifData.WhiteBalance?.toString(),
              },
              gps: parseGPS(exifData),
              dateTime: {
                original: exifData.DateTimeOriginal as string,
                modified: exifData.DateTime as string,
                digitized: exifData.DateTimeDigitized as string,
              },
              author: (exifData.Artist as string)?.trim(),
              copyright: (exifData.Copyright as string)?.trim(),
              software: (exifData.Software as string)?.trim(),
              colorSpace: exifData.ColorSpace?.toString(),
              rawExif: allData as Record<string, unknown>,
            };

            // Remove undefined values from nested objects
            Object.keys(metadata).forEach((key) => {
              const value = metadata[key as keyof FileMetadata];
              if (value && typeof value === "object") {
                const cleaned = Object.fromEntries(
                  Object.entries(value).filter(([, v]) => v !== undefined)
                );
                if (Object.keys(cleaned).length === 0) {
                  delete metadata[key as keyof FileMetadata];
                } else {
                  (metadata as Record<string, unknown>)[key] = cleaned;
                }
              }
            });

            resolve(metadata);
          });
        };

        img.onerror = () => {
          resolve(baseMetadata);
        };

        img.src = dataUrl;
      } else {
        // For non-image files, return basic metadata
        resolve(baseMetadata);
      }
    };

    reader.onerror = () => {
      resolve({
        id: generateId(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileFormat: getFileFormat(file.type),
        addedAt: Date.now(),
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Format date string
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    // EXIF date format: YYYY:MM:DD HH:MM:SS
    const cleaned = dateString.replace(/:/g, "-").replace(/-/g, ":", 2);
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}
