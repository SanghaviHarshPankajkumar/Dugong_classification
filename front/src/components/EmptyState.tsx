import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "./AnimatedBackground";
import ImageUploadDialog from "./imageUploadDialog";

const EmptyState = ({
  onImageUpload,
}: {
  onImageUpload: (response: unknown) => void;
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)] relative z-10">
        <CardContent className="w-full max-w-4xl p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          {/* Main Heading */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
            Upload And Detect Dugongs With AI
          </h1>

          {/* Subheading */}
          <p className="text-md text-gray-500 mb-12 max-w-2xl">
            Analyze underwater images, detect marine species, and get instant results
            with our advanced AI detection system
          </p>

          {/* Upload Box */}
          <div className="w-full max-w-2xl border-2 border-dashed border-[#0077B6] bg-[#0077B6]/[0.12] backdrop-blur-sm rounded-2xl p-12 mb-8">
            {/* Icon Circle */}
            <div className="w-24 h-24 bg-[#0077B6] rounded-full flex items-center justify-center mx-auto mb-6">
              <img
                src="/dugong.png"
                alt="Dugong"
                className="w-12 h-10 "
              />
            </div>

            {/* Upload Text */}
            <h2 className="text-2xl font-semibold text-[#0077B6] mb-3">
              Upload Your Images
            </h2>
            <p className="text-gray-600 mb-8">
              Our system will analyze each image, highlight detected dugong, and provide
              counts instantly
            </p>

            {/* Upload Button */}
            <ImageUploadDialog onImageUploaded={onImageUpload}>
              <Button
                size="lg"
                className="bg-[#0077B6] hover:bg-[#0077B6] cursor-pointer text-white px-8 py-4 text-lg font-medium rounded-lg"
              >
                <Upload className="w-6 h-6 mr-3" />
                Upload Image
              </Button>
            </ImageUploadDialog>

            {/* File Info */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-500">• Allow to upload multiple images</p>
              <p className="text-sm text-gray-500">• Support JPG, PNG format</p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default EmptyState;