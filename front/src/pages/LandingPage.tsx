import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Waves, Fish, Eye, Shield, BarChart3, MapPin } from "lucide-react";

// Mock form handling (replace with your actual implementation)
const useForm = () => ({
  register: (name: any) => ({ name }),
  handleSubmit: (fn: any) => (e: any) => {
    e.preventDefault();
    fn({ email: "test@example.com", password: "password123" });
  },
  formState: { errors: {} },
});

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    { icon: <Eye className="w-6 h-6" />, text: "Real-time Monitoring" },
    { icon: <Shield className="w-6 h-6" />, text: "Conservation Tracking" },
    { icon: <BarChart3 className="w-6 h-6" />, text: "Data Analytics" },
    { icon: <MapPin className="w-6 h-6" />, text: "Location Mapping" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center md:w-1/2 w-full p-10 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        {/* Logo with Animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
            <Fish className="w-16 h-16 text-white animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <Waves className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Dugong
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-100">
            Monitoring
          </h2>

        </div>
      </div>
    </div >
  );
};

const SignInSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", data);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center md:w-1/2 w-full p-6 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
        // style={{
        //   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        // }}
        ></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div> */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome
            </h2>
            <p className="text-gray-600">Access your monitoring dashboard</p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="researcher@dugong.org"
                  {...register("email")}
                  className={`pl-4 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter your secure password"
                  {...register("password")}
                  className={`pl-4 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${errors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                    }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>


            {/* Submit Button */}
            <Button
              type="button"
              onClick={() => handleSubmit(onSubmit)()}
              disabled={isLoading}
              className="w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Access Dashboard</span>
                  <Waves className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>


        </CardContent>
      </Card>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50">
      <HeroSection />
      <SignInSection />
    </div>
  );
}
