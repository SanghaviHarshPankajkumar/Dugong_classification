import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload,
  Download,
  Calendar,
  Eye,
  ThumbsDown,
  Info,
  Image,
  CloudUpload,
  Plus,
  CheckCircle,
  Fish,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Navbar from "@/components/Navbar";

// Image Upload Dialog Component with New Dashboard styling
const ImageUploadDialog = ({ onImageUploaded, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFiles = (files: any) => {
    files.forEach((file: any, index: any) => {
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        // Check file size (25MB limit)
        const maxSizeInBytes = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSizeInBytes) {
          alert(`"${file.name}" exceeds the 25MB size limit.`);
          return; // Skip this file
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages((prev) => [
            ...prev,
            {
              url: e.target.result,
              name: file.name,
              status: "completed",
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };


  const handleFileInput = (e: any) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleConfirm = () => {
    const imageUrls = uploadedImages.map((img) => img.url);
    onImageUploaded?.(imageUrls);
    setIsOpen(false);
    setUploadedImages([]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
              <CloudUpload className="w-4 h-4 text-white" />
            </div>
            Upload Dugong Images
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Upload your dugong monitoring images for AI-powered analysis.
            Supported formats: JPEG, PNG, WebP (max 25MB each)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-teal-50 scale-105"
              : "border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CloudUpload className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Drag & drop your images here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse your files
                </p>
              </div>

              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg">
                <Plus className="w-4 h-4" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                Uploaded Images ({uploadedImages.length})
              </h3>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      >
                        ×
                      </button>

                      <p
                        className="text-xs text-gray-600 mt-1 truncate"
                        title={image.name}
                      >
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={uploadedImages.length === 0}
            className="gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
          >
            <Upload className="w-4 h-4" />
            Upload {uploadedImages.length}{" "}
            {uploadedImages.length === 1 ? "Image" : "Images"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Dashboard Component
const DashboardPage = () => {
  const [currentImage, setCurrentImage] = useState(1);
  const [images, setImages] = useState([]); // Empty initially
  const totalImages = images.length;

  const handleImageUpload = (imageUrls) => {
    setImages(imageUrls);
    setCurrentImage(1);
  };

  // Empty State Component with New Dashboard styling
  const EmptyState = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

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
              <ImageUploadDialog onImageUploaded={handleImageUpload}>
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg px-8 py-4 text-lg font-medium"
                >
                  <CloudUpload className="w-6 h-6 mr-3" />
                  Choose Files
                </Button>
              </ImageUploadDialog>
            </div>

            {/* Right Side: Description */}
            {/* <div className="flex-1 space-y-6 text-center lg:text-left text-white"> */}
            {/* <div>
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Dugong
                  </span>
                  <br />
                  <span className="text-blue-100 text-3xl">Guardian</span>
                </h2>
              </div> */}

            {/* <div className="space-y-4">
                {[
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    text: "Secure image processing with AI",
                  },
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    text: "Works on desktop & mobile devices",
                  },
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    text: "Instant preview & insights",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
                  >
                    <div className="text-green-300">{feature.icon}</div>
                    <span className="text-white font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div> */}
            {/* </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If no images uploaded, show empty state
  if (images.length === 0) {
    return <EmptyState />;
  }

  // Main dashboard with images - Enhanced with New Dashboard styling
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

      <Navbar />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Waves className="w-2 h-2 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dugong Guardian</h1>
              <p className="text-blue-100 font-light">Monitoring Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ImageUploadDialog onImageUploaded={handleImageUpload}>
              <Button className="gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Upload className="w-4 h-4" />
                Upload More
              </Button>
            </ImageUploadDialog>

            <Button className="gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section - Image Display */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-2xl bg-white/20 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                    disabled={currentImage === 1}
                    onClick={() =>
                      setCurrentImage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-medium">
                      Image {currentImage} of {totalImages}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                    disabled={currentImage === totalImages}
                    onClick={() =>
                      setCurrentImage((prev) => Math.min(totalImages, prev + 1))
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm inline-block shadow-lg">
                  <img
                    src={images[currentImage - 1]}
                    alt="Dugong monitoring capture"
                    className="w-auto h-auto max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                      2
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="font-medium text-white">Calf Count</span>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      1
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="font-medium text-white">
                      Classification
                    </span>
                    <Badge className="bg-white/20 border-white/30 text-white font-semibold">
                      Class A
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
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="font-medium text-white">Image Name</span>
                    <Badge
                      className="bg-orange-600 hover:bg-orange-700 text-white max-w-32 truncate"
                      title="full-image-name.jpg"
                    >
                      image.jpg
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Quality Assessment */}
              <Card className=" border-0 shadow-2xl bg-white/20 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    Quality Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full items-end">
                  <Button className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 transform hover:scale-105">
                    <ThumbsDown className="w-4 h-4" />
                    Mark as Poor Quality
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
