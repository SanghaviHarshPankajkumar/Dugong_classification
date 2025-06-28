import { Info, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useUploadStore } from "@/store/upload";

interface ResultsSidebarProps {
  currentImageData: any; // Consider defining a more specific type
  markedPoorImages: string[];
  onMarkPoor: (imageId: string) => void;
}

const ResultsSidebar = ({
  currentImageData,
  markedPoorImages,
  onMarkPoor,
}: ResultsSidebarProps) => {
  const sessionId = useUploadStore((state) => state.sessionId);
  const isMarkedPoor =
    currentImageData && markedPoorImages.includes(currentImageData.imageId);

  const handleMarkPoor = async () => {
    if (!currentImageData || !sessionId) {
      console.error("No image data or session ID available.");
      return;
    }

    if (window.confirm("Are you sure?")) {
      const targetClass =
        currentImageData.imageClass === "A" ? "Class B" : "Class A";
      const imageName = currentImageData.imageUrl.split("/").pop();

      try {
        const response = await fetch(
          "http://localhost:8000/api/move-to-false-positive/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              imageName: imageName,
              targetClass: targetClass,
            }),
          }
        );

        if (response.ok) {
          onMarkPoor(currentImageData.imageId);
          console.log("Image marked as poor quality successfully.");
        } else {
          const errorData = await response.json();
          console.error(
            "Failed to mark image as poor quality:",
            errorData.detail
          );
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };
  return (
    <div className="lg:col-span-1 flex flex-col gap-4 h-[640px]">
      <div className="flex-1 flex flex-col gap-4">
        {/* Detection Results */}
        <Card className="flex-1 border-0 shadow-2xl bg-white/20 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Info className="w-5 h-5 text-blue-200" />
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-full">
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="font-medium text-white">Dugong Count</span>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                {currentImageData?.dugongCount || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="font-medium text-white">Cow Calf Count</span>
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                {currentImageData?.calfCount || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="font-medium text-white">Classification</span>
              <Badge className="bg-white/20 border-white/30 text-white font-semibold">
                Class {currentImageData?.imageClass || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Meta Data */}
        <Card className="flex-1 border-0 shadow-2xl bg-white/20 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Info className="w-5 h-5 text-blue-200" />
              Meta Data
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 h-full">
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="font-medium text-white">Date</span>
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                {currentImageData?.createdAt
                  ? new Date(currentImageData.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="font-medium text-white">Image Name</span>
              <Badge
                className="bg-orange-600 hover:bg-orange-700 text-white max-w-32 truncate"
                title={
                  currentImageData?.imageUrl
                    ? currentImageData.imageUrl.split("/").pop()
                    : "image.jpg"
                }
              >
                {currentImageData?.imageUrl
                  ? currentImageData.imageUrl
                    .split("/")
                    .pop()
                    .substring(0, 15) + "..."
                  : "image.jpg"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quality Assessment */}
        <Card className="border-0 shadow-2xl bg-white/20 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">
              Quality Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full items-end">
            <Button
              className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-60"
              onClick={handleMarkPoor}
              disabled={isMarkedPoor}
            >
              <ThumbsDown className="w-4 h-4" />
              {isMarkedPoor ? "Marked as Poor Quality" : "Mark as Poor Quality"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsSidebar;
