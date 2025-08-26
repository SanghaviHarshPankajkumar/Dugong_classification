import { ChevronLeft, ChevronRight, Upload,  CheckSquare, Square } from "lucide-react";
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
  selectedImages?: Set<number>;
  onPrevious: () => void;
  onNext: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
  onImageSelect?: (imageIndex: number) => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDeleteAll?: () => void;
  isDeleting?: boolean;
}

const ImageViewer = ({
  currentImage,
  totalImages,
  currentImageData,
  allImagesData,
  selectedImages = new Set(),
  onPrevious,
  onNext,
  // onDelete,
  onUpload,
  onImageSelect,
  onSelectAll,
  onDeleteSelected,
  onDeleteAll,
  isDeleting = false,
}: ImageViewerProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getImageName = (imageUrl?: string) => {
    if (!imageUrl) return "N/A";
    const fileName = imageUrl.split("/").pop() || "";
    // Truncate filename if too long
    return fileName.length > 20 ? `${fileName.substring(0, 17)}...` : fileName;
  };

  const isAllSelected = selectedImages.size === totalImages && totalImages > 0;
  // const hasSelectedImages = selectedImages.size > 0;

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
              <Badge className="bg-blue-100 text-blue-800 border  font-medium px-3 py-1 text-xs sm:text-sm">
                Image {currentImage} of {totalImages}
              </Badge>
            </div>

            {/* Image Name + Delete - Middle on mobile */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border  shadow-sm flex-1 mr-2 truncate min-w-0">
                {getImageName(currentImageData?.imageUrl)}
              </span>
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
              <span className="px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border  shadow-sm truncate min-w-0 max-w-xs">
                {getImageName(currentImageData?.imageUrl)}
              </span>
            </div>

            {/* Center: Image Count */}
            <Badge className="bg-blue-100 text-blue-800 border  font-medium px-3 py-1 flex-shrink-0 mx-2">
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

      {/* Selection Controls */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onSelectAll} className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-2">
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Select All
                </>
              )}
            </button>
            {/* {hasSelectedImages && (
              <span className="text-sm text-gray-600">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
            )} */}
          </div>
          <div className="flex gap-2">
            {onDeleteSelected && (
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <button disabled={isDeleting || selectedImages.size === 0} className="text-sm text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-2 disabled:text-gray-400 disabled:cursor-not-allowed">
                    Delete Selected ({selectedImages.size})
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete {selectedImages.size} selected image{selectedImages.size !== 1 ? 's' : ''}?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      className="text-gray-700 hover:text-gray-600 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (onDeleteSelected) onDeleteSelected();
                        setDeleteDialogOpen(false);
                      }}
                      className="text-blue-500 hover:text-blue-600 cursor-pointer"
                      variant="outline"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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
            const isSelected = selectedImages.has(index);
            const imageData = allImagesData?.[index] || currentImageData;

            return (
              <div
                key={imageNumber}
                className="flex flex-col items-center min-w-0 flex-shrink-0"
              >
                <div className="relative">
                  <div
                    className={`w-16 h-16 sm:w-28 sm:h-28  overflow-hidden cursor-pointer transition-colors shadow-sm ${isCurrent
                      ? ""
                      : isNext
                        ? ""
                        : ""
                      } ${isSelected ? '' : ''}`}
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
                  
                  {/* Selection Checkbox */}
                  {onImageSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect(index);
                      }}
                      className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center transition-all m-1 ${
                        isSelected
                          ? 'text-blue-600'  
                          : 'text-blue-600'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                {/* Image Name Below Thumbnail */}
                <span className="text-xs text-gray-500 mt-1 sm:mt-2 text-center truncate w-16 sm:w-28">
                  {imageData ? getImageName(imageData.imageUrl) : `Image ${imageNumber}`}
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
