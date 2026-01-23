import { useState, useEffect } from "react";
import { mainBenefits } from "./data";
import { motion } from "framer-motion";

const BenefitSection = () => {
  const [isVisible, setIsVisible] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) {
              setIsVisible((prev) => ({
                ...prev,
                [id]: true, // chỉ set true lần đầu
              }));
              observer.unobserve(entry.target); // bỏ observe để nó chỉ chạy 1 lần
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-8 sm:py-14 px-6 sm:px-20 bg-white" id="benefits">
      <div className="container mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Tại Sao Chọn Get Sport?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Những lợi ích vượt trội chỉ có tại Get Sport
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {mainBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                data-animate
                data-id={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible[index] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
             

                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                {/* Title + details */}
                <h3 className="font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">{benefit.details}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitSection;
