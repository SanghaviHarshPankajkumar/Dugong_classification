export const HeroSection = () => {
    return (
        <div className="flex items-center justify-center  md:w-1/2 w-full p-10">
            <div className="text-center">
                <img src="/logo.png" alt="Company Logo" className="w-24 h-24 mx-auto mb-4" />
                <h1 className="text-3xl md:text-5xl font-bold">Dugong monitoring</h1>
                <p className="text-sm md:text-lg mt-2 text-blue-500"></p>
            </div>
        </div>
    );
};