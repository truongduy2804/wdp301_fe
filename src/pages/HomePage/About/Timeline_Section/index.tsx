import React, { useState, useEffect } from "react";
import { TrendingUp, ChevronRight, CheckCircle } from "lucide-react";
import { timelineData } from "./data";
import { motion, AnimatePresence } from "framer-motion";

const TimelineSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % timelineData.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const currentItem = timelineData[currentIndex];

  return (
    <section className="relative py-8 sm:py-14 px-6 sm:px-35 bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-50"></div>

      <div className="container mx-auto relative">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 ">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-5 py-1.5 rounded-full text-sm font-medium mb-3"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Hành trình phát triển</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
          >
            Câu Chuyện Của
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
              {" "}
              Get Sport
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Từ ý tưởng đơn giản đến nền tảng đặt sân cầu lông hàng đầu Việt Nam
            - hành trình 3 năm kiến tạo tương lai thể thao số
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 pb-4 lg:px-12 lg:pt-0 lg:pb-8">
              {/* Timeline Navigation Dots */}
              <div className="mb-10">
                {/* Progress Track Container */}
                <div className="relative max-w-5xl mx-auto px-4">
                  {/* Background Track */}
                  <div className="absolute top-7 left-0 right-0 h-2 bg-gray-200 rounded-full shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${
                          ((currentIndex + 1) / timelineData.length) * 100
                        }%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>

                  {/* Timeline Nodes - wrap thành nhiều hàng */}
                  <div className="relative flex flex-wrap justify-between items-start gap-y-8 mt-10">
                    {timelineData.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center relative z-10 flex-1 min-w-[120px]"
                      >
                        <button
                          onClick={() => goToSlide(index)}
                          className={`relative group transition-all duration-500 ${
                            index === currentIndex
                              ? "transform scale-110"
                              : "hover:scale-105"
                          }`}
                        >
                          {/* Pulse Ring */}
                          {index === currentIndex && (
                            <div className="absolute inset-0 bg-teal-400 rounded-2xl animate-ping opacity-30"></div>
                          )}

                          {/* Node */}
                          <div
                            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 relative z-10 ${
                              index === currentIndex
                                ? "bg-gradient-to-r from-teal-500 to-cyan-500 ring-4 ring-white shadow-2xl"
                                : index < currentIndex
                                ? "bg-gradient-to-r from-teal-400 to-cyan-500 shadow-xl"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          >
                            {item.icon}
                          </div>

                          {/* Glow Effect */}
                          {index === currentIndex && (
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl blur-md opacity-40 animate-pulse"></div>
                          )}
                        </button>

                        {/* Year + Quarter */}
                        <div className="mt-4 text-center">
                          <div
                            className={`text-sm font-bold transition-all duration-300 ${
                              index === currentIndex
                                ? "text-teal-600 text-base"
                                : index < currentIndex
                                ? "text-teal-500"
                                : "text-gray-500"
                            }`}
                          >
                            {item.year}
                          </div>
                          {item.quarter && (
                            <div
                              className={`text-xs px-3 py-1 rounded-full mt-2 transition-all duration-300 font-medium ${
                                index === currentIndex
                                  ? "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm"
                                  : index < currentIndex
                                  ? "bg-teal-50 text-teal-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {item.quarter}
                            </div>
                          )}
                        </div>

                        {/* Badge Completed */}
                        {index < currentIndex && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Percentage */}
                  <div className="flex justify-between mt-6 text-xs text-gray-400">
                    <span>Bắt đầu</span>
                    <span className="bg-teal-50 text-teal-600 px-2 py-1 rounded-full font-medium">
                      {Math.round(
                        ((currentIndex + 1) / timelineData.length) * 100
                      )}
                      % hoàn thành
                    </span>
                    <span>Hoàn thiện</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id + "-content"}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="order-2 lg:order-1"
                  >
                    <div className="space-y-6">
                      <div>
                        <div className="inline-block bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                          {currentItem.highlight}
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                          {currentItem.title}
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {currentItem.description}
                        </p>
                      </div>

                      {/* Stats */}
                      {currentItem.stats && (
                        <div className="grid grid-cols-2 gap-4">
                          {currentItem.stats.map((stat, statIndex) => (
                            <motion.div
                              key={statIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: statIndex * 0.2,
                                duration: 0.5,
                              }}
                              className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 text-center"
                            >
                              <div className="text-xl font-bold text-teal-600 mb-1">
                                {stat.value}
                              </div>
                              <div className="text-sm text-gray-500">
                                {stat.label}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Achievements */}
                      {currentItem.achievements && (
                        <div className="space-y-3">
                          {currentItem.achievements.map(
                            (achievement, achIndex) => (
                              <motion.div
                                key={achIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: achIndex * 0.2,
                                  duration: 0.5,
                                }}
                                className="flex items-center text-gray-600"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span>{achievement}</span>
                              </motion.div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Visual Element */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id + "-visual"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="order-1 lg:order-2 flex justify-center"
                  >
                    <div className="relative">
                      {/* Main Circle */}
                      <div className="w-72 h-72 bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
                        <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
                            {currentItem.icon}
                          </div>
                        </div>
                      </div>

                      {/* Floating Year */}
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      >
                        {currentItem.year}
                      </motion.div>

                      {/* Quarter */}
                      {currentItem.quarter && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-teal-200"
                        >
                          <span className="text-teal-600 font-semibold text-sm">
                            {currentItem.quarter}
                          </span>
                        </motion.div>
                      )}

                      {/* Animated Rings */}
                      <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-ping opacity-20"></div>
                      <div className="absolute inset-4 border border-cyan-200 rounded-full animate-pulse opacity-30"></div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 
             bg-gradient-to-r from-gray-300 to-slate-300 rounded-full
             shadow-lg border-2 border-white flex items-center justify-center 
             text-white transition-all duration-300 group z-10
             opacity-80 hover:opacity-100 hover:scale-105 
             hover:from-teal-400 hover:to-cyan-500
             hover:shadow-[0_0_10px_rgba(45,212,191,0.6)]"
          >
            <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 ml-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
