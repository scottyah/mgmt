import { useCallback, useRef, useState, type DragEvent } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File | null) => void;
  className?: string;
  maxSizeMb?: number;
}

export function FileUpload({
  accept,
  onFileSelect,
  className,
  maxSizeMb = 50,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
        setError(`File must be smaller than ${maxSizeMb}MB`);
        return;
      }
      setFile(f);
      onFileSelect(f);
    },
    [maxSizeMb, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer?.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  return (
    <div className={className}>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <FileIcon className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={removeFile}>
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
            isDragging
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          <Upload className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drop a file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {accept
                ? `Accepted: ${accept}`
                : `Max file size: ${maxSizeMb}MB`}
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFile(selected);
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
