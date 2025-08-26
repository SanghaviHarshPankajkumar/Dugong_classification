import { Upload, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import ImageUploadDialog from "./imageUploadDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EmptyState = ({
  onImageUpload,
}: {
  onImageUpload: (response: unknown) => void;
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <div className="relative z-10 pt-6 pb-6 px-[7%]">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Quick insights and results, all in one view.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Left Section - Image Display */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border-0 p-3 sm:p-6">
              {/* Main Image Display Area */}
              <div className="flex flex-col items-center justify-center h-96 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                {/* Crossed out picture icon */}
                <div className="w-24 h-24 flex items-center justify-center mb-4">
                <svg width="114" height="113" viewBox="0 0 114 113" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M106.438 12.0557L101.444 7.0625L7.5625 100.944L12.5557 105.938L19.6182 98.875H92.3125C94.1847 98.8722 95.9795 98.1272 97.3034 96.8034C98.6272 95.4795 99.3722 93.6847 99.375 91.8125V19.1182L106.438 12.0557ZM92.3125 91.8125H26.6807L54.1997 64.2935L62.6006 72.6943C63.925 74.0183 65.721 74.7621 67.5938 74.7621C69.4665 74.7621 71.2625 74.0183 72.5869 72.6943L78.1875 67.0938L92.3125 81.2082V91.8125ZM92.3125 71.2182L83.1807 62.0864C81.8563 60.7624 80.0602 60.0186 78.1875 60.0186C76.3148 60.0186 74.5187 60.7624 73.1943 62.0864L67.5938 67.687L59.2 59.2932L92.3125 26.1807V71.2182ZM21.6875 77.6875V67.0938L39.3438 49.4481L44.1922 54.3L49.1924 49.2998L44.3369 44.4443C43.0125 43.1203 41.2165 42.3765 39.3438 42.3765C37.471 42.3765 35.675 43.1203 34.3506 44.4443L21.6875 57.1074V21.1875H78.1875V14.125H21.6875C19.8144 14.125 18.018 14.8691 16.6936 16.1936C15.3691 17.518 14.625 19.3144 14.625 21.1875V77.6875H21.6875Z" fill="#0077B6"/>
</svg>

                </div>
                
                {/* Upload Text */}
                <p className="text-gray-600 text-lg font-medium mb-6">
                  No image available. Upload to proceed.
                </p>

                {/* Upload Button */}
                <ImageUploadDialog onImageUploaded={onImageUpload}>
                  <Button className="gap-2 bg-[#0077B6] hover:bg-[#006494] transition-all duration-200 shadow-lg cursor-pointer justify-center text-center text-sm sm:text-base py-2 sm:py-3">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                </ImageUploadDialog>
              </div>
            </div>
          </div>

          {/* Right Section - Results Sidebar */}
          <div className="lg:col-span-2">
            <div className="w-full min-h-screen p-2">
              <div className="w-full flex flex-col gap-4">
                {/* Export CSV Button */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto">
                  <Button
                    className="w-full h-12 gap-2 bg-[#0077B6] backdrop-blur-sm border-2 border-white/30 hover:bg-[#0077B6] cursor-pointer rounded-lg"
                    disabled
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>

                {/* Legends Card */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <svg
                        width="24"
                        height="23"
                        viewBox="0 0 24 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0007 6.69375C12.3312 6.69375 12.6085 6.58175 12.8325 6.35775C13.0565 6.13375 13.1681 5.85686 13.1673 5.52708C13.1665 5.1973 13.0545 4.92041 12.8313 4.69641C12.6081 4.47241 12.3312 4.36041 12.0007 4.36041C11.6701 4.36041 11.3932 4.47241 11.17 4.69641C10.9468 4.92041 10.8348 5.1973 10.834 5.52708C10.8332 5.85686 10.9452 6.13413 11.17 6.35891C11.3948 6.58369 11.6717 6.6953 12.0007 6.69375ZM12.0007 16.0271C12.3312 16.0271 12.6085 15.9151 12.8325 15.6911C13.0565 15.4671 13.1681 15.1902 13.1673 14.8604V10.1937C13.1673 9.86319 13.0553 9.5863 12.8313 9.36308C12.6073 9.13986 12.3304 9.02786 12.0007 9.02708C11.6709 9.0263 11.394 9.1383 11.17 9.36308C10.946 9.58786 10.834 9.86475 10.834 10.1937V14.8604C10.834 15.191 10.946 15.4682 11.17 15.6922C11.394 15.9162 11.6709 16.0279 12.0007 16.0271ZM5.00065 19.5271L2.31732 22.2104C1.94788 22.5799 1.52476 22.6627 1.04799 22.4589C0.571208 22.2551 0.333208 21.8904 0.333986 21.3646V3.19375C0.333986 2.55208 0.562653 2.00297 1.01999 1.54641C1.47732 1.08986 2.02643 0.86119 2.66732 0.860413H21.334C21.9757 0.860413 22.5252 1.08908 22.9825 1.54641C23.4398 2.00375 23.6681 2.55286 23.6673 3.19375V17.1937C23.6673 17.8354 23.439 18.3849 22.9825 18.8422C22.5259 19.2996 21.9764 19.5279 21.334 19.5271H5.00065Z"
                          fill="#0077B6"
                        />
                      </svg>
                      Legends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Dugong</span>
                      <div className="w-4 h-4 border-2 border-blue-500 rounded-sm"></div>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Mother Calf</span>
                      <div className="w-4 h-4 border-2 border-red-500 rounded-sm"></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detection Results Card */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <svg
                        width="28"
                        height="29"
                        viewBox="0 0 28 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_74_1657)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.3355 0.6604C15.7419 0.6604 18.8263 2.0278 21.0585 4.23916C23.2908 6.44998 24.6715 9.5042 24.6715 12.8779C24.6715 15.3457 23.932 17.643 22.6612 19.5644L28 25.3278L24.3186 28.6604L19.1698 23.0491C17.2136 24.3416 14.8632 25.0948 12.3355 25.0948C8.92963 25.0948 5.84521 23.7274 3.61294 21.5166C1.38067 19.3052 0 16.251 0 12.8773C0 9.5042 1.38067 6.44943 3.61294 4.23862C5.84521 2.0278 8.92963 0.6604 12.3355 0.6604ZM8.42761 11.6844L11.0393 14.1927L16.0462 8.6132C16.325 8.33371 16.5001 8.10891 16.8431 8.45951L17.6798 9.31441C18.0454 9.67267 18.0271 9.88325 17.682 10.2169L11.6761 16.6661C10.9482 17.3722 11.0746 17.4154 10.3368 16.6907L6.82935 13.2317C6.67527 13.0671 6.69183 12.9003 6.86028 12.7356L7.8759 11.6822C8.07195 11.4776 8.22824 11.4957 8.42761 11.6844ZM20.0854 5.20291C18.1022 3.23877 15.3619 2.02343 12.3355 2.02343C9.30903 2.02343 6.56923 3.23877 4.58604 5.20291C2.60284 7.16704 1.37625 9.87997 1.37625 12.8773C1.37625 15.8747 2.60284 18.5887 4.58604 20.5523C6.56923 22.5169 9.30903 23.7312 12.3355 23.7312C15.3619 23.7312 18.1022 22.5169 20.0854 20.5523C22.0686 18.5887 23.2947 15.8752 23.2947 12.8773C23.2947 9.87997 22.0686 7.16704 20.0854 5.20291Z"
                            fill="#0077B6"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_74_1657">
                            <rect
                              width="28"
                              height="28"
                              fill="white"
                              transform="translate(0 0.6604)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      Detection Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Dugong Count</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Mother Calf Count</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-700">Total Count</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="p-0.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                                aria-label="Information about total count calculation"
                              >
                                <Info className="w-3 h-3 text-gray-500" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-0 border-0 shadow-lg">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-[#0077B6] rounded-xl p-4">
                                <div className="space-y-3">
                                  <h3 className="font-semibold text-slate-800 text-sm">
                                    Calculation Method:
                                  </h3>
                                  <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                                    <div className="text-[#0077B6] font-semibold text-sm mb-1">
                                      (2 × Mother-Calf Pairs) + Dugong Count
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    Each calf is counted as 2 in the total calculation
                                  </p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Behavior</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Meta Data Card */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <svg
                        width="28"
                        height="29"
                        viewBox="0 0 28 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.3332 7.66032C23.3332 5.13099 19.0597 2.99365 13.9998 2.99365C8.94 2.99365 4.6665 5.13099 4.6665 7.66032V9.99365C4.6665 12.523 8.94 14.6603 13.9998 14.6603C19.0597 14.6603 23.3332 12.523 23.3332 9.99365V7.66032ZM13.9998 22.827C8.94 22.827 4.6665 20.6897 4.6665 18.1603V21.6603C4.6665 24.1897 8.94 26.327 13.9998 26.327C19.0597 26.327 23.3332 24.1897 23.3332 21.6603V18.1603C23.3332 20.6897 19.0597 22.827 13.9998 22.827Z"
                          fill="#0077B6"
                        />
                        <path
                          d="M23.3332 12.327C23.3332 14.8564 19.0597 16.9937 13.9998 16.9937C8.94 16.9937 4.6665 14.8564 4.6665 12.327V15.827C4.6665 18.3564 8.94 20.4937 13.9998 20.4937C19.0597 20.4937 23.3332 18.3564 23.3332 15.827V12.327Z"
                          fill="#0077B6"
                        />
                      </svg>
                      Meta Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Captured Date</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Processed Date</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                    <hr className="border-gray-300 border-dashed border-t-2 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Image Name</span>
                      <Badge className="text-gray-900 bg-white">-</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;