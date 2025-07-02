import { Fish, Waves, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUploadDialog from "./ImageUploadDialog";

const DashboardHeader = ({ onImageUpload }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                        <Fish className="w-6 h-6 text-black" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <Waves className="w-2 h-2 text-blue-600" />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-black">Dugong Dashboard</h3>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ImageUploadDialog onImageUploaded={onImageUpload}>
                    <Button className="gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-black hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                        <Upload className="w-4 h-4" />
                        Upload More
                    </Button>
                </ImageUploadDialog>

                <Button className="gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-black hover:bg-white/30 hover:border-white/50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    );
};

export default DashboardHeader;