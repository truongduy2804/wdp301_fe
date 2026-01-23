import { useState, useEffect } from "react";
import { MapPin, Heart, Calendar, Sparkles, Quote, Eye } from "lucide-react";
import { bannerImages } from "./data";

const StorySection = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className=" py-8 sm:py-14 px-6 sm:px-30 bg-white" id="story">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div
            className={`transform transition-all duration-1000 ${
              isVisible["story"]
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
            id="story"
            data-animate
          >
            <div className="mb-4">
              <div className="inline-flex items-center bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-5 py-1.5 rounded-full text-sm font-medium mb-3">
                <Heart className="w-4 h-4 mr-2" />
                Về chúng tôi
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                <span className="relative">Câu Chuyện Của</span>
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">
                  {" "}
                  Get Sport
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              {/* Quote */}
              <div className="relative bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border-l-4 border-teal-500">
                <Quote className="h-4 w-4 sm:w-6 sm:h-6 text-teal-500 mb-4" />
                <p className="text-base sm:text-xl text-gray-800 font-medium leading-relaxed italic">
                  "Làm thế nào để việc đặt sân cầu lông trở nên dễ dàng và thuận
                  tiện hơn?"
                </p>
                <div className="text-xs sm:text-sm text-teal-600 font-semibold mt-2">
                  - Ý tưởng khởi nguồn
                </div>
              </div>

              {/* Story */}
              <div className="ml-2 prose prose-lg max-w-none">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  Get Sport ra đời từ một ý tưởng đơn giản nhưng đầy ý nghĩa.
                  Chúng tôi hiểu rằng{" "}
                  <span className="font-semibold text-teal-600">
                    thời gian là quý báu
                  </span>
                  , và đam mê thể thao không nên bị cản trở bởi những rào cản
                  không cần thiết.
                </p>

                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  Từ những ngày đầu khiêm tốn với chỉ vài chục sân cầu lông, Get
                  Sport đã{" "}
                  <span className="font-semibold text-teal-600">
                    không ngừng phát triển và hoàn thiện
                  </span>{" "}
                  để trở thành nền tảng hàng đầu như ngày hôm nay.
                </p>
              </div>
            </div>
          </div>

          {/* Right Banner */}
          <div
            data-animate
            id="story-visual"
            className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible["story-visual"]
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <div className="relative h-100 rounded-3xl overflow-hidden shadow-2xl -mt-15 sm:mt-21">
              <img
                src={bannerImages[currentIndex]}
                alt="Story Banner"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                key={currentIndex}
              />
              <div className="absolute inset-0 bg-black/30"></div>

              <div className="relative z-10 h-full flex flex-col justify-between text-white p-6">
                <div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Đam mê thể thao</h3>
                  <p className="text-cyan-100 text-lg">
                    Kết nối cộng đồng yêu cầu lông
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      2025 - 2028
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Việt Nam
                    </div>
                  </div>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {bannerImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "bg-teal-500 scale-125 shadow-lg"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 mt-10 sm:mt-2">
          {/* Mission */}
          <div
            id="mission"
            data-animate
            className={`transform transition-all duration-1000 ${
              isVisible["mission"]
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Sứ Mệnh</h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">
                  Chúng tôi xây dựng Get Sport không chỉ là nền tảng đặt sân
                  tiện lợi, mà còn là{" "}
                  <span className="font-semibold text-teal-600">
                    cầu nối đam mê thể thao và cộng đồng
                  </span>
                  . Thể thao là sức mạnh thay đổi cuộc sống, gắn kết tình bạn và
                  tạo nên những kỷ niệm đẹp.
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div
            id="vision"
            data-animate
            className={`transform transition-all duration-1000 delay-200 ${
              isVisible["vision"]
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tầm Nhìn</h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">
                  Tầm nhìn của chúng tôi là trở thành{" "}
                  <span className="font-semibold text-teal-600">
                    nền tảng thể thao hàng đầu
                  </span>{" "}
                  tại Việt Nam, nơi mọi người có thể dễ dàng{" "}
                  <span className="font-semibold text-teal-600">
                    tìm sân, kết nối bạn bè
                  </span>{" "}
                  và lan tỏa tinh thần thể thao đến khắp cộng đồng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
