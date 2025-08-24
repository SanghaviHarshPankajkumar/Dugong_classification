/* eslint-disable @typescript-eslint/no-unused-vars */
//imageUploadDialog.tsx
import { useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useUploadStore } from "@/store/upload";
import axios from "axios";

interface ImageFile {
  url: string;
  name: string;
  status: string;
  file: File;
}

interface ImageUploadDialogProps {
  onImageUploaded?: (response: unknown) => void;
  children: ReactNode;
}

const ImageUploadDialog = ({
  onImageUploaded,
  children,
}: ImageUploadDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { resetSessionTimer } = useUploadStore();
  const { sessionId } = useAuthStore(); // Use auth store session ID
  const navigate = useNavigate();

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        // Check file size (25MB limit)
        const maxSizeInBytes = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSizeInBytes) {
          alert(`${file.name} exceeds the 25MB size limit.`);
          return; // Skip this file
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          setUploadedImages((prev) => [
            ...prev,
            {
              url: e.target?.result as string,
              name: file.name,
              status: "completed",
              file: file, // Store the actual file object
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = [...e.target.files];
      handleFiles(files);
    }
  };

  const handleConfirm = async () => {
    if (uploadedImages.length === 0) return;
    if (!sessionId) {
      alert("Session ID not found. Please log in again.");
      return;
    }
    setIsUploading(true);
    resetSessionTimer();
    try {
      // Create FormData and append files
      const formData = new FormData();
      uploadedImages.forEach((image) => {
        formData.append("files", image.file);
      });
      formData.append("session_id", sessionId);

      // Use axios instead of fetch to use the configured base URL
      const response = await axios.post("/api/upload-multiple/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const apiResponse = response.data;
      // Pass the API response to parent component
      onImageUploaded?.(apiResponse);
      // Preserve existing session if backend doesn't return one
      if (apiResponse && apiResponse.sessionId) {
        // setSessionId(apiResponse.sessionId as string); // This line is removed as per the edit hint
      } else {
        resetSessionTimer();
      }
      setIsOpen(false);
      setUploadedImages([]);
      // Ensure user lands on dashboard after upload
      navigate("/dashboard", { replace: false });
    } catch (error) {
      // console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isUploading) setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto  backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            Choose Dugong Images
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Choose your dugong monitoring images for AI-powered analysis.
            Supported formats: JPEG, PNG (max 25MB each)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-teal-50 scale-105"
              : "border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#0077B6] rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CloudUpload className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Drag & drop your images here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse your files
                </p>
              </div>

              <Button
                className="gap-2 bg-[#0077B6] text-white shadow-lg"
                disabled={isUploading}
              >
                <CloudUpload className="w-4 h-4" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CloudUpload className="w-5 h-5" />
                Choosen Images ({uploadedImages.length})
              </h3>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 ">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index: number) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {!isUploading && (
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center  hover:bg-blue-600 shadow-lg cursor-pointer"
                        >
                          ×
                        </button>
                      )}

                      <p
                        className="text-xs text-gray-600 mt-1 truncate"
                        title={image.name}
                      >
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
            className="cursor-pointer hover:bg-white-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={uploadedImages.length === 0 || isUploading}
            className="gap-2 cursor-pointer bg-[#0077B6] hover:bg-[#0077B6] text-white shadow-lg"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4" />
            )}
            {isUploading
              ? "Predicting..."
              : `Predict ${uploadedImages.length} ${uploadedImages.length === 1 ? "Image with AI" : "Images with AI"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
