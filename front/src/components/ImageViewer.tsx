import { ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageUploadDialog from "./imageUploadDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  currentImage: number;
  totalImages: number;
  currentImageData: {
    imageUrl?: string;
  } | null;
  allImagesData?: Array<{
    imageUrl?: string;
  }>;
  onPrevious: () => void;
  onNext: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
}

const ImageViewer = ({
  currentImage,
  totalImages,
  currentImageData,
  allImagesData,
  onPrevious,
  onNext,
  onDelete,
  onUpload,
}: ImageViewerProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getImageName = (imageUrl?: string) => {
    if (!imageUrl) return "N/A";
    const fileName = imageUrl.split("/").pop() || "";
    // Truncate filename if too long
    return fileName.length > 20 ? `${fileName.substring(0, 17)}...` : fileName;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 p-3 sm:p-6">
      {/* Main Image Display Area */}
      <div className="mb-4 sm:mb-6">
        {/* Main Image */}
        <div className="relative mb-3 sm:mb-4">
          {currentImageData && (
            <img
              src={currentImageData.imageUrl || ""}
              alt="Dugong monitoring capture"
                className="w-full h-full object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>

        {/* Navigation + Image Info - Mobile Stack Layout */}
        <div className="space-y-3 sm:space-y-0">
          {/* Mobile: Stack vertically */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {/* Image Count - Top on mobile */}
            <div className="flex justify-center">
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-medium px-3 py-1 text-xs sm:text-sm">
                Image {currentImage} of {totalImages}
              </Badge>
            </div>

            {/* Image Name + Delete - Middle on mobile */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm flex-1 mr-2 truncate min-w-0">
                {getImageName(currentImageData?.imageUrl)}
              </span>
              
              {/* Mobile Delete Button */}
              {onDelete && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer flex-shrink-0 p-1.5 w-7 h-7"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md w-[90vw] max-w-[95vw]">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl md:text-xl">Delete Image</DialogTitle>
                      <DialogDescription className="text-sm sm:text-base">
                        Are you sure you want to delete this image? This action
                        cannot be undone and will remove the image from everywhere.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button 
                        variant="outline" 
                        onClick={() => setDeleteDialogOpen(false)}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onDelete();
                          setDeleteDialogOpen(false);
                        }}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Navigation - Bottom on mobile */}
            <div className="flex justify-center gap-2">
              <button
                onClick={onPrevious}
                disabled={currentImage === 1}
                className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={onNext}
                disabled={currentImage === totalImages}
                className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop: Original horizontal layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            {/* Left: Image Name + Delete */}
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
              <span className="px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm truncate min-w-0 max-w-xs">
                {getImageName(currentImageData?.imageUrl)}
              </span>

              {onDelete && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer flex-shrink-0 p-2 sm:p-2 md:p-2 lg:p-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-10 lg:h-10"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md w-[90vw] max-w-[95vw]">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl md:text-xl">Delete Image</DialogTitle>
                      <DialogDescription className="text-sm sm:text-base">
                        Are you sure you want to delete this image? This action
                        cannot be undone and will remove the image from everywhere.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button 
                        variant="outline" 
                        onClick={() => setDeleteDialogOpen(false)}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onDelete();
                          setDeleteDialogOpen(false);
                        }}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Center: Image Count */}
            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-medium px-3 py-1 flex-shrink-0 mx-2">
              Image {currentImage} of {totalImages}
            </Badge>

            {/* Right: Navigation */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={onPrevious}
                disabled={currentImage === 1}
                className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onNext}
                disabled={currentImage === totalImages}
                className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div className="mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 px-1">
          {Array.from({ length: totalImages }, (_, index) => {
            const imageNumber = index + 1;
            const isCurrent = imageNumber === currentImage;
            const isNext = imageNumber === currentImage + 1;
            const imageData = allImagesData?.[index] || currentImageData;

            return (
              <div
                key={imageNumber}
                className="flex flex-col items-center min-w-0 flex-shrink-0"
              >
                <div
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-xl border-2 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors shadow-sm ${isCurrent
                    ? "border-blue-500 border-b-4 border-b-blue-500"
                    : isNext
                      ? "border-blue-300 border-b-2 border-b-blue-300"
                      : "border-gray-200"
                    }`}
                  onClick={() => {
                    if (imageNumber < currentImage) {
                      for (let i = 0; i < currentImage - imageNumber; i++) {
                        onPrevious();
                      }
                    } else if (imageNumber > currentImage) {
                      for (let i = 0; i < imageNumber - currentImage; i++) {
                        onNext();
                      }
                    }
                  }}
                >
                  {imageData && (
                    <img
                      src={imageData.imageUrl || ""}
                      alt={`Image ${imageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 sm:mt-2 text-center truncate w-20 sm:w-28">
                  Image {imageNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Button */}
      <ImageUploadDialog onImageUploaded={onUpload}>
        <Button className="w-full gap-2 bg-[#0077B6] hover:bg-[#006494] transition-all duration-200 shadow-lg cursor-pointer justify-center text-center text-sm sm:text-base py-2 sm:py-3">
          <Upload className="w-4 h-4" />
          Upload More
        </Button>
      </ImageUploadDialog>
    </div>
  );
};

export default ImageViewer;