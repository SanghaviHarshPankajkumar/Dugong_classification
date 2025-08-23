/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageData {
  imageId: string;
  imageUrl: string;
  dugongCount: number;
  motherCalfCount: number;
  imageClass?: string;
  createdAt?: string;
  capturedDate?: string;
}

interface ResultsSidebarProps {
  currentImageData: ImageData;
  markedPoorImages: string[];
  onMarkPoor: (imageId: string) => void;
}

const ResultsSidebar = ({
  currentImageData,
}: ResultsSidebarProps) => {
  const getBehaviorLabel = (imageClass?: string): string => {
    if (!imageClass) return "N/A";
    const normalized = imageClass.trim().toLowerCase();
    if (normalized === "resting") return "Resting";
    if (normalized === "feeding") return "Feeding";
    return imageClass;
  };

  return (
    <div className="w-full min-h-screen  p-3 relative overflow-hidden">

      {/* Coral Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-400 rounded-full blur-xl"></div>
      </div>

      <div className="w-full flex flex-col gap-3 relative z-10">
        {/* Detection Results */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-teal-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"></div>
          <CardHeader className="bg-gradient-to-r from-teal-50/80 to-cyan-50/80 relative py-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-teal-800">
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3 px-4">
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200/50 hover:border-teal-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Dugong Count
              </span>
              <Badge className="text-sm bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {currentImageData?.dugongCount || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200/50 hover:border-teal-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Mother Calf Count
              </span>
              <Badge className="text-sm bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {currentImageData?.motherCalfCount || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg border border-cyan-200/50 hover:border-cyan-300 transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-slate-700">
                  Total Count
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-0.5 rounded-full hover:bg-cyan-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-1"
                        aria-label="Information about total count calculation"
                      >
                        Info
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm text-slate-600 p-3">
                      <div className="space-y-2">
                        <p className="font-medium text-slate-800">
                          {" "}
                          Total Count Calculation Formula:
                        </p>
                        <div className="bg-slate-50 p-2 rounded text-xs font-mono">
                          (2 × Mother Calf Count) + Dugong Count
                        </div>
                        <p className="text-xs text-slate-500">
                          Each calf is counted as 2 in the total calculation
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge className="text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {(currentImageData?.motherCalfCount
                  ? 2 * currentImageData.motherCalfCount
                  : 0) + (currentImageData?.dugongCount || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200/50 hover:border-teal-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Behaviour
              </span>
              <Badge className="text-sm bg-gradient-to-r from-orange-400 to-pink-400 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {getBehaviorLabel(currentImageData?.imageClass)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Meta Data */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-teal-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-500"></div>
          <CardHeader className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 relative py-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-800">
              Meta Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3 px-4">
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Captured Date
              </span>
              <Badge className="text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {currentImageData?.capturedDate || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Processed Date
              </span>
              <Badge className="text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white border-none shadow-md hover:shadow-lg transition-shadow">
                {currentImageData?.createdAt
                  ? new Date(currentImageData.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Image Name
              </span>
              <Badge
                className="max-w-[120px] text-xs bg-gradient-to-r from-slate-500 to-teal-600 text-white border-none shadow-md hover:shadow-lg transition-shadow truncate"
                title={
                  currentImageData?.imageUrl
                    ? currentImageData.imageUrl.split("/").pop()
                    : "image.jpg"
                }
              >
                {currentImageData?.imageUrl
                  ? currentImageData.imageUrl.split("/").pop()
                  : "image.jpg"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-2 border-teal-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
          <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 relative py-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-800">
              Legend
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4 space-y-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-slate-700">Dugong</span>
              <span className="text-sm text-blue-600">■</span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-slate-700">Mother Calf</span>
              <span className="text-sm text-red-600">■</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsSidebar;
