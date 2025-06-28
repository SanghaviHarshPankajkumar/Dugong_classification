import { useEffect } from "react";
import { Waves, Fish, Eye, Shield, BarChart3, MapPin } from "lucide-react";
const HeroSection = () => {

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

export default HeroSection;