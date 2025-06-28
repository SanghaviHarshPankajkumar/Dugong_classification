const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0">
            {/* Animated Background Elements */}
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
        </div>
    );
};

export default AnimatedBackground;