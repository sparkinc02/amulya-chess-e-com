import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export interface ImageFile extends File {
  preview: string;
  progress?: number;
  error?: string;
  isExisting?: boolean;
}

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  files: ImageFile[];
  setFiles: Dispatch<SetStateAction<ImageFile[]>>;
}

export const ImageUpload = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false,
  required = false,
  files = [],
  setFiles,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Create ImageFile objects while preserving File prototype
      const newFiles = acceptedFiles.map((file) => {
        const imageFile = file as ImageFile;
        imageFile.preview = URL.createObjectURL(file);
        imageFile.progress = 0;
        imageFile.isExisting = false;
        return imageFile;
      });

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);

      // Simulate upload progress
      setIsUploading(true);
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((file) => {
            if (file.progress === undefined || file.progress >= 100)
              return file;
            const increment = Math.floor(Math.random() * 15) + 10;
            const newProgress = Math.min(file.progress + increment, 100);

            // Create new ImageFile with updated progress
            const updatedFile = file as ImageFile;
            updatedFile.progress = newProgress;
            return updatedFile;
          }),
        );
      }, 200);

      // Simulate completion and update onChange
      setTimeout(() => {
        clearInterval(interval);
        setIsUploading(false);
        setFiles((prev) =>
          prev.map((file) => {
            const completedFile = file as ImageFile;
            completedFile.progress = 100;
            return completedFile;
          }),
        );

        // Update the form with new URLs (simulated)
        const newUrls = updatedFiles.map((file) => file.preview);
        onChange(newUrls);
      }, 1500);
    },
    [files, maxFiles, onChange, setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: maxFiles - files.length,
    maxSize,
    disabled: isUploading || disabled || files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const fileToRemove = files[index];

    // Cleanup blob URL if it exists
    if (fileToRemove.preview && fileToRemove.preview.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const newUrls = newFiles.map((file) => file.preview);
    onChange(newUrls);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
    const newUrls = newFiles.map((file) => file.preview);
    onChange(newUrls);
  };

  // Function to upload files to server
  // const uploadFilesToServer = async (filesToUpload: ImageFile[]) => {
  //     try {
  //         const formData = new FormData()

  //         // Add files to FormData (only the actual File objects, not mock ones)
  //         filesToUpload.forEach((file, index) => {
  //             // Check if it's a real File object (not a mock one for existing URLs)
  //             if (file.size > 0 && file instanceof File) {
  //                 formData.append('images', file)
  //             }
  //         })

  //         // Add additional metadata if needed
  //         formData.append('uploadType', 'product-images')
  //         formData.append('totalFiles', filesToUpload.length.toString())

  //         const response = await fetch('/api/upload', {
  //             method: 'POST',
  //             body: formData,
  //         })

  //         if (!response.ok) {
  //             throw new Error('Upload failed')
  //         }

  //         const result = await response.json()
  //         console.log('Upload successful:', result)

  //         return result
  //     } catch (error) {
  //         console.error('Upload error:', error)
  //         throw error
  //     }
  // }

  // // Manual upload trigger function
  // const handleManualUpload = async () => {
  //     const filesToUpload = files.filter(file => file.progress !== 100)

  //     if (filesToUpload.length === 0) {
  //         console.log('No files to upload')
  //         return
  //     }

  //     setIsUploading(true)

  //     try {
  //         await uploadFilesToServer(filesToUpload)

  //         // Update progress to 100% for uploaded files
  //         setFiles(prev => prev.map(file => ({
  //             ...file,
  //             progress: 100
  //         })))

  //         // Update onChange with all preview URLs
  //         const newUrls = files.map(file => file.preview)
  //         onChange(newUrls)

  //     } catch (error) {
  //         // Handle upload error
  //         setFiles(prev => prev.map(file => ({
  //             ...file,
  //             error: file.progress !== 100 ? 'Upload failed' : undefined
  //         })))
  //     } finally {
  //         setIsUploading(false)
  //     }
  // }

  useEffect(() => {
    // Cleanup previews on unmount
    return () => {
      files.forEach((file) => {
        if (file.preview && file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const canUploadMore = files.length < maxFiles && !isUploading && !disabled;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:bg-accent/50",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Drop images here"
                  : "Drag & drop images here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">
                Upload up to {maxFiles - files.length} more images (max{" "}
                {(maxSize / 1024 / 1024).toFixed(0)}MB each)
              </p>
              {required && files.length === 0 && (
                <p className="text-xs text-red-500">
                  At least one image is required
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Upload Button */}
      {/* {files.some(file => file.progress !== 100) && (
                <div className="flex justify-center">
                    <Button
                        onClick={handleManualUpload}
                        disabled={isUploading}
                        className="w-full sm:w-auto"
                    >
                        {isUploading ? "Uploading..." : "Upload Files"}
                    </Button>
                </div>
            )} */}

      {/* Image Grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Product Images ({files.length}/{maxFiles})
            </h4>
            {files.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Primary
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                  index === 0 && "ring-2 ring-primary ring-offset-2",
                )}
              >
                {/* Image */}
                <img
                  src={file.preview || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <Badge className="absolute left-1 top-1 bg-primary text-primary-foreground text-xs">
                    Primary
                  </Badge>
                )}

                {/* Progress Bar */}
                {file.progress !== undefined && file.progress < 100 && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                    <Progress value={file.progress} className="h-1" />
                    <p className="text-xs text-white mt-1">{file.progress}%</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <div className="relative aspect-square w-full">
                        <img
                          src={file.preview || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong>Name:</strong> {file.name}
                        </p>
                        <p>
                          <strong>Size:</strong> {(file.size / 1024).toFixed(1)}{" "}
                          KB
                        </p>
                        <p>
                          <strong>Type:</strong> {file.type}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Move Buttons */}
                {files.length > 1 && (
                  <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {index > 0 && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6 text-xs"
                        onClick={() => moveFile(index, index - 1)}
                        disabled={isUploading}
                        title="Move left"
                      >
                        ←
                      </Button>
                    )}
                    {index < files.length - 1 && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6 text-xs"
                        onClick={() => moveFile(index, index + 1)}
                        disabled={isUploading}
                        title="Move right"
                      >
                        →
                      </Button>
                    )}
                  </div>
                )}

                {/* Error State */}
                {/* {file.error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/90 text-white text-xs p-2 text-center">
                                        <div>
                                            <p className="font-medium">Upload Failed</p>
                                            <p className="mt-1">{file.error}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 h-6 text-xs"
                                                onClick={handleManualUpload}
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    </div>
                                )} */}

                {/* Upload Success Indicator */}
                {file.progress === 100 && !file.error && (
                  <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-500 text-white"
                    >
                      ✓
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>

          {files.length > 0 && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                The first image will be used as the primary product image. Drag
                to reorder.
              </p>
              <div className="flex gap-4">
                <p>
                  Total files: {files.length}/{maxFiles}
                </p>
                <p>
                  Total size:{" "}
                  {(
                    files.reduce((sum, file) => sum + file.size, 0) / 1024
                  ).toFixed(1)}{" "}
                  KB
                </p>
                <p>
                  Uploaded: {files.filter((f) => f.progress === 100).length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
