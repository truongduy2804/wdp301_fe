import  { useState, useEffect } from "react";
import { Star, Sparkles } from "lucide-react";
import {  appFeatures} from "./data";

const AppFeatureSection = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % appFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      {/* App Features Showcase */}
      <section
        className="py-8 sm:py-14 px-6 sm:px-30 bg-gradient-to-b from-gray-50 to-white"
        id="app-features"
        data-animate
      >
        <div
          className={`container mx-auto transform transition-all duration-1000 ${
            isVisible["app-features"]
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-6 sm:mb-10 relative">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-5 py-1.5 rounded-full text-sm font-medium mb-3 relative z-10">
              <Sparkles className="w-4 h-4 mr-2" />
              Tính năng độc quyền
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight relative z-10">
              <span className="relative">
                Tính Năng
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-700"></div>
              </span>
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                {" "}
                Nổi Bật
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed relative z-10">
              Khám phá những
              <span className="font-semibold text-teal-600">
                {" "}
                tính năng độc đáo{" "}
              </span>
              và
              <span className="font-semibold text-cyan-600">
                {" "}
                công nghệ tiên tiến{" "}
              </span>
              giúp Get Sport trở thành
              <span className="relative">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
                {" "}  lựa chọn hàng đầu
                </span>
                <Star className="w-5 h-5 text-yellow-500 inline-block ml-1 animate-bounce" />
              </span>
            </p>

            {/* Decorative Stars */}
            <div className="absolute top-10 left-1/4 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
            </div>
            <div className="absolute top-6 right-1/4 transform translate-x-1/2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
            </div>
            <div className="absolute bottom-4 left-1/3">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-500"></div>
            </div>
          </div>

         <div className="grid md:[grid-template-columns:1.65fr_1.35fr] gap-12 items-center">
            {/* Left: Features list */}
            <div className="space-y-7">
              {appFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 sm:py-5 sm:px-6 rounded-2xl shadow-md transition-all duration-500 cursor-pointer ${
                      currentFeature === index
                        ? "bg-gradient-to-r " +
                          feature.color +
                          " text-white shadow-2xl scale-[1.03]"
                        : "bg-white hover:shadow-lg border border-gray-100"
                    }`}
                    onClick={() => setCurrentFeature(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-3 rounded-xl ${
                          currentFeature === index
                            ? "bg-white/20"
                            : "bg-gray-100"
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${
                            currentFeature === index
                              ? "text-white"
                              : "text-teal-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-2">
                          {feature.title}
                        </h3>
                        <p
                          className={`${
                            currentFeature === index
                              ? "text-white/90"
                              : "text-gray-600"
                          }`}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Screen Content */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${appFeatures[currentFeature].color} flex flex-col items-center justify-center text-white p-8 transition-all duration-500`}
                  >
                    <div className="text-6xl mb-4 animate-bounce">
                      {appFeatures[currentFeature].image}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center">
                      {appFeatures[currentFeature].title}
                    </h3>
                    <p className="text-center text-sm opacity-90">
                      {appFeatures[currentFeature].description}
                    </p>
                  </div>
                </div>
                {/* Phone Details */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full"></div>
                <div className="absolute top-6 right-6 w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AppFeatureSection;
