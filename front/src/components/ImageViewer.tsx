import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  onPrevious: () => void;
  onNext: () => void;
  onDelete?: () => void;
  sessionId?: string;
}

const ImageViewer = ({
  currentImage,
  totalImages,
  currentImageData,
  onPrevious,
  onNext,
  onDelete,
}: ImageViewerProps) => {
  return (
    <Card className="border-0 shadow-2xl backdrop-blur-md bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
            disabled={currentImage === 1}
            onClick={onPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-medium">
              Image {currentImage} of {totalImages}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              disabled={currentImage === totalImages}
              onClick={onNext}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>

            {onDelete && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete Image</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this image? This action
                      cannot be undone and will remove the image from
                      everywhere.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const dialog = document.querySelector(
                          '[data-slot="dialog"]'
                        ) as any;
                        if (dialog) dialog.close();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete();
                        const dialog = document.querySelector(
                          '[data-slot="dialog"]'
                        ) as any;
                        if (dialog) dialog.close();
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm inline-block shadow-lg">
          {currentImageData && (
            <>
              {/* Debug info in development */}
              {process.env.NODE_ENV === "development" &&
                currentImageData.imageUrl && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded z-10 max-w-xs break-all">
                    <div>Image URL: {currentImageData.imageUrl}</div>
                  </div>
                )}

              <img
                src={
                  currentImageData?.imageUrl
                    ? `${currentImageData.imageUrl}`
                    : ""
                }
                alt="Dugong monitoring capture"
                className="w-auto h-auto max-w-full max-h-full object-contain"
                onLoad={() => {
                  if (process.env.NODE_ENV === "development") {
                    // console.log(
                    //   "✅ Image loaded successfully:",
                    //   currentImageData.imageUrl
                    // );
                  }
                }}
                onError={(e) => {
                  if (process.env.NODE_ENV === "development") {
                    console.error(
                      "❌ Image failed to load:",
                      currentImageData.imageUrl,
                      e
                    );
                  }
                }}
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageViewer;
