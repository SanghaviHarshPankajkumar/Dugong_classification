import { Info, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUploadStore } from "@/store/upload";

interface ResultsSidebarProps {
  currentImageData: any;
  markedPoorImages: string[];
  onMarkPoor: (imageId: string) => void;
}
const extractFormattedDate = (imageName: string) => {
  // Regular expression to match the pattern after first underscore with 8 digits (assumed to be YYYYMMDD)
  const match = imageName.match(/_(\d{8})/);

  if (!match || match.length < 2) return "not found";

  const rawDate = match[1];
  const year = rawDate.substring(0, 4);
  const month = rawDate.substring(4, 6);
  const day = rawDate.substring(6, 8);

  // Basic date validation (not checking leap years, etc., but enough to catch typos)
  const dateObject = new Date(`${year}-${month}-${day}`);
  if (
    dateObject.getFullYear().toString() !== year ||
    (dateObject.getMonth() + 1).toString().padStart(2, '0') !== month ||
    dateObject.getDate().toString().padStart(2, '0') !== day
  ) {
    return "not found";
  }

  return `${day}/${month}/${year}`;
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
        currentImageData?.imageClass
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
              sessionId,
              imageName,
              targetClass,
            }),
          }
        );

        if (response.ok) {
          onMarkPoor(currentImageData.imageId);
          console.log("Image marked as poor quality successfully.");
        } else {
          const errorData = await response.json();
          console.error("Failed:", errorData.detail);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <aside className="lg:col-span-1 flex flex-col gap-4 h-[640px]">
      {/* Detection Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Info className="w-4 h-4 text-muted-foreground" />
            Detection Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Dugong Count</span>
            <Badge variant="secondary">{currentImageData?.dugongCount || 0}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Cow Calf Count</span>
            <Badge variant="secondary">{currentImageData?.calfCount || 0}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Total Count</span>
            <Badge variant="secondary">{(2 * (currentImageData?.calfCount) + currentImageData?.dugongCount) || 0}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Classification</span>
            <Badge variant="outline"> {currentImageData?.imageClass || "N/A"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Meta Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Info className="w-4 h-4 text-muted-foreground" />
            Meta Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Captured Date</span>
            <Badge variant="secondary">
              {extractFormattedDate(currentImageData?.imageUrl.split("/").pop())}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Processed Date</span>
            <Badge variant="secondary">
              {currentImageData?.createdAt
                ? new Date(currentImageData.createdAt).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Image Name</span>
            <Badge
              variant="outline"
              title={
                currentImageData?.imageUrl
                  ? currentImageData.imageUrl.split("/").pop()
                  : "image.jpg"
              }
              className="max-w-[140px] truncate"
            >
              {currentImageData?.imageUrl
                ? currentImageData.imageUrl.split("/").pop()
                : "image.jpg"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quality Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quality Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleMarkPoor}
            disabled={isMarkedPoor}
          >
            <ThumbsDown className="w-4 h-4" />
            {isMarkedPoor ? "Marked as Poor Quality" : "Mark as Poor Quality"}
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ResultsSidebar;
