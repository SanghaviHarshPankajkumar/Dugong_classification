// hero section
const HeroSection = () => {
  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-[60vh] min-h-[400px] md:h-full rounded-3xl shadow-2xl overflow-hidden"
      style={{
        backgroundImage: "url('/logo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blue overlay */}
      <div className="absolute inset-0 bg-[#0077B6] opacity-80"></div>

      {/* Dugong Illustration */}
      <div className="relative z-10 mb-6">
        <div className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden drop-shadow-lg">
          <img
            src="/dugong.png"
            alt="Dugong"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center text-white max-w-lg px-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl leading-tight mb-2">
          Standalone Object Recognition
        </h1>
        <h1 className="text-2xl md:text-3xl lg:text-4xl leading-tight mb-4">
          and Monitoring Software
        </h1>
        <h2 className="text-xl md:text-2xl font-bold ">
          Dugong Detection System
        </h2>
      </div>

      {/* Tiny text at bottom-left (responsive, with spacing and no overlap) */}
      <p className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] text-white font-bold opacity-40 z-20 whitespace-normal break-words max-w-[140px] leading-tight  px-2 py-1 rounded">
        Developed by TGIS
      </p>
    </div>
  );
};

export default HeroSection;
