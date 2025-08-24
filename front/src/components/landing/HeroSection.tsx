//hero section
const HeroSection = () => {
    return (
        <div
            className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden rounded-3xl shadow-2xl"
            style={{
                backgroundImage: "url('/logo.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Blue overlay with 60% opacity */}
            <div className="absolute inset-0 bg-[#0077B6] opacity-80"></div>

            {/* Dugong Illustration */}
            <div className="relative z-10 mb-8">
                <div className="relative">
                    <img
                        src="/dugong.png"
                        alt="Dugong"
                        className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                    />
                    {/* Floating bubbles around dugong */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="absolute top-4 -right-4 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute -top-4 right-2 w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-500"></div>
                </div>
            </div>

            {/* Main Title */}
            <div className="relative z-10 text-center text-white max-w-lg px-8">
                <h1 className="text-xl md:text-2xl lg:text-3xl leading-tight mb-2">
                    Standalone Object Recognition
                </h1>
                <h1 className="text-2xl md:text-3xl lg:text-4xl leading-tight mb-6">
                    and Monitoring Software
                </h1>
                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl font-bold ">
                    Dugong Detection System
                </h2>
            </div>
        </div>
    );
};

export default HeroSection;
