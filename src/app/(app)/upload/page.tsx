"use client";

import { useAppStore } from "@/store/exiftrack-store";
import { FileUploader } from "@/components/exiftrack/file-uploader";
import { FilePreview } from "@/components/exiftrack/file-preview";
import { MetadataViewer } from "@/components/exiftrack/metadata-viewer";
import { MetadataEditor } from "@/components/exiftrack/metadata-editor";
import { Histogram } from "@/components/exiftrack/histogram";

export default function UploadPage() {
  const { currentFile } = useAppStore();

  return (
    <div className="space-y-6">
      <FileUploader />
      {currentFile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FilePreview />
            <Histogram />
            <MetadataEditor />
          </div>
          <div>
            <MetadataViewer />
          </div>
        </div>
      )}
    </div>
  );
}
