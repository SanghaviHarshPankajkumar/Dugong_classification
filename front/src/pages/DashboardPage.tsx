/* eslint-disable @typescript-eslint/no-unused-vars */
import Navbar from "@/components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import EmptyState from "../components/EmptyState";
import DashboardHeader from "../components/DashboardHeader";
import ImageViewer from "../components/ImageViewer";
import ResultsSidebar from "../components/ResultsSidebar";
import { useImageStore } from "../store/image";
import { useAuthStore } from "../store/auth";
import { useUploadStore } from "../store/upload";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigationGuard } from "../hooks/useNavigationGuard.ts";
import ConfirmCloseDialog from "../components/ConfirmCloseDialog.tsx";
import { getApiConfig } from "@/lib/api-config.ts";

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

  const authSessionId = useAuthStore((state) => state.sessionId);
  const uploadSessionId = useUploadStore((state) => state.sessionId);

  const [markedPoorImages, setMarkedPoorImages] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  // const [lastImageCount, setLastImageCount] = useState(0);

  // Use the upload session ID as the primary session ID for the dashboard
  const currentSessionId = uploadSessionId || authSessionId;

  // Get API configuration for constructing image URLs
  const apiConfig = getApiConfig();

  // Navigation guard for better UX when leaving the dashboard
  const { showConfirmDialog, confirmNavigation, cancelNavigation } =
    useNavigationGuard({
      enabled: !!(currentSessionId && totalImages > 0), // Only guard if there are images
      title: "Leave Dashboard?",
      message:
        "You have uploaded images in this session. Are you sure you want to leave? Your session data will be preserved.",
      onBeforeNavigate: async () => {
        // You could add additional checks here, like saving progress
        return true; // Allow navigation
      },
      onConfirmNavigate: () => {
        // Clean up any temporary state if needed
        // console.log("User confirmed navigation away from dashboard");
      },
    });

  // Derived from backend metadata; no explicit type to avoid mismatch warnings

  // Fetch full session metadata and update image store
  const fetchSessionMetadata = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/session-status/${sessionId}`);
      const metadata = response.data?.metadata;
      const images = metadata?.images as Record<string, any> | undefined;
      if (images && typeof images === "object") {
        const results = Object.entries(images).map(([fileName, data], idx) => {
          const imageUrl = `${apiConfig.baseURL}/uploads/${sessionId}/images/${fileName}`;

          // Debug logging for image URLs
          if (process.env.NODE_ENV === "development") {
            // console.log(`🖼️ Constructed image URL for ${fileName}:`, imageUrl);
          }

          return {
            imageId: String(idx),
            // Construct image URL pointing to the backend server
            imageUrl,
            createdAt:
              (data as any)?.uploadedAt || metadata?.last_activity || "",
            dugongCount: (data as any)?.dugongCount ?? 0,
            motherCalfCount: (data as any)?.motherCalfCount ?? 0,
            imageClass: (data as any)?.imageClass ?? "N/A",
          };
        });
        setApiResponse({ results });
        return results.length;
      }
    } catch (error) {
      // console.error("Failed to fetch session metadata", error);
    }
    return 0;
  };

  // On dashboard load, fetch all images for the session
  useEffect(() => {
    if (currentSessionId) {
      fetchSessionMetadata(currentSessionId);
    }
    // eslint-disable-next-line
  }, [currentSessionId]);

  // Polling function after upload
  const pollForImages = async (sessionId: string, initialCount: number) => {
    setIsPolling(true);
    let attempts = 0;
    let latestCount = initialCount;
    while (attempts < 15) {
      // up to 30 seconds (2s interval)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const count = await fetchSessionMetadata(sessionId);
      if (count > latestCount) {
        latestCount = count;
        // Optionally, break if you know the expected count
        // break;
      }
      attempts++;
    }
    setIsPolling(false);
  };

  // After upload, backfill detection results and poll for all images
  const handleImageUpload = async () => {
    if (currentSessionId) {
      try {
        await axios.post(`/api/backfill-detections/${currentSessionId}`);
      } catch (err) {
        // console.error("Failed to backfill detection results", err);
      }
      // Fetch once, then poll for new images
      const initialCount = await fetchSessionMetadata(currentSessionId);
      if ((initialCount || 0) === 0) {
        // If nothing yet, refresh once more after a short delay
        setTimeout(() => fetchSessionMetadata(currentSessionId), 1500);
      }
      pollForImages(currentSessionId, initialCount || 0);
    }
  };

  const handleMarkPoor = (imageId: string) => {
    setMarkedPoorImages((prev) => [...prev, imageId]);
  };

  const currentImageData = getCurrentImageData();

  // If no images uploaded, show empty state
  if (!apiResponse || totalImages === 0) {
    return (
      <>
        <EmptyState onImageUpload={handleImageUpload} />
        <ConfirmCloseDialog
          isOpen={showConfirmDialog}
          onClose={cancelNavigation}
          onConfirm={confirmNavigation}
          title="Leave Dashboard?"
          message="You have uploaded images in this session. Are you sure you want to leave? Your session data will be preserved."
          confirmText="Leave"
          cancelText="Stay"
        />
      </>
    );
  }

  // Main dashboard with images
  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <Navbar />

        <div className="relative z-10 p-6">
          <DashboardHeader onImageUpload={handleImageUpload} />

          {isPolling && (
            <div className="text-center py-4 text-blue-600 font-semibold animate-pulse">
              Processing images... Please wait.
            </div>
          )}

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

      {/* Navigation Guard Confirmation Dialog */}
      <ConfirmCloseDialog
        isOpen={showConfirmDialog}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="Leave Dashboard?"
        message="You have uploaded images in this session. Are you sure you want to leave? Your session data will be preserved."
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
};

export default DashboardPage;
