import { Fish, Waves, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "./AnimatedBackground";
import ImageUploadDialog from "./imageUploadDialog";

const EmptyState = ({
  onImageUpload,
}: {
  onImageUpload: (response: unknown) => void;
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600 relative overflow-hidden">
      <AnimatedBackground />

      <Navbar />

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)] relative z-10">
        <Card className="w-full max-w-5xl border-0 shadow-2xl bg-white/20 backdrop-blur-md">
          <CardContent className="p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-10">
            {/* Left Side: Dropzone-like box */}
            <div className="flex-1 border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <Fish className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Waves className="w-3 h-3 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-xl text-white font-semibold mb-2">
                  Drop your images here
                </p>
                <p className="text-blue-100 text-sm">or</p>
              </div>
              <ImageUploadDialog onImageUploaded={onImageUpload}>
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg px-8 py-4 text-lg font-medium"
                >
                  <CloudUpload className="w-6 h-6 mr-3" />
                  Choose Files
                </Button>
              </ImageUploadDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmptyState;
