import Navbar from "@/components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import EmptyState from "../components/EmptyState";
import DashboardHeader from "../components/DashboardHeader";
import ImageViewer from "../components/ImageViewer";
import ResultsSidebar from "../components/ResultsSidebar";
import { useImageStore } from "../store/image";
import { useState } from "react";

const DashboardPage = () => {
  const {
    currentImage,
    totalImages,
    apiResponse,
    setApiResponse,
    handlePrevious,
    handleNext,
    getCurrentImageData,
  } = useImageStore();

  const [markedPoorImages, setMarkedPoorImages] = useState<string[]>([]);

  const handleImageUpload = (response: any) => {
    setApiResponse(response);
  };

  const handleMarkPoor = (imageId: string) => {
    setMarkedPoorImages((prev) => [...prev, imageId]);
  };

  const currentImageData = getCurrentImageData();

  // If no images uploaded, show empty state
  if (!apiResponse || totalImages === 0) {
    return <EmptyState onImageUpload={handleImageUpload} />;
  }

  // Main dashboard with images
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 p-6">
        <DashboardHeader onImageUpload={handleImageUpload} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section - Image Display */}
          <div className="lg:col-span-3">
            <ImageViewer
              currentImage={currentImage}
              totalImages={totalImages}
              currentImageData={currentImageData}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </div>

          {/* Right Section - Results */}
          <ResultsSidebar
            currentImageData={currentImageData}
            markedPoorImages={markedPoorImages}
            onMarkPoor={handleMarkPoor}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
