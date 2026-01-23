import { useState } from "react";
import {
  Users,
  Star,
  Smartphone,
  Shield,
  Download,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  HelpCircle,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import endPoint from "@routes/router";

const CTASection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);


  type FAQ = {
    question: string;
    answer: string;
    category: string;
  };

  const faqs: FAQ[] = [
    {
      question: "Ứng dụng có mất phí không?",
      answer:
        "Hoàn toàn miễn phí tải và sử dụng các tính năng cơ bản. Chỉ tính phí khi đặt sân thực tế.",
      category: "Phí dịch vụ",
    },
    {
      question: "Làm sao để trở thành đối tác?",
      answer:
        "Đăng ký đơn giản qua app, cung cấp thông tin sân và được duyệt trong 24h làm việc.",
      category: "Đối tác",
    },
    {
      question: "Thanh toán có an toàn không?",
      answer:
        "Tuyệt đối an toàn với mã hóa SSL 256-bit và hợp tác với các cổng thanh toán uy tín.",
      category: "Thanh toán",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="cta-section"
      className=" py-8 sm:py-14 px-6 sm:px-35 bg-gradient-to-br from-[#1a999b] to-[#23AEB1] text-white"
    >
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-end">
        {/* Text + Contact support */}
        <motion.div
          className="flex flex-col rounded-2xl bg-transparent"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="space-y-6 text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-bold">
              Sẵn sàng trải nghiệm cách mới chơi cầu lông?
            </h2>
            <p className="text-lg text-teal-100 max-w-md mx-auto md:mx-0">
              Tham gia cùng{" "}
              <span className="font-semibold">50,000+ người chơi</span> để tận
              hưởng đam mê cầu lông một cách tốt nhất.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="flex items-center justify-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transform transition-transform duration-200 hover:scale-105">
                <Smartphone className="w-5 h-5" />
                Tải ứng dụng
              </button>
              <button className="flex items-center justify-center gap-2 border-2 border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-teal-600">
                <Users className="w-5 h-5" />
                Tham gia cộng đồng
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 text-teal-100 text-sm justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>100K+ lượt tải</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.8/5 đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% miễn phí</span>
              </div>
            </div>
          </div>

          {/* Contact support */}
          <div className="self-start w-full mt-8 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 max-w-lg mx-auto md:mx-0 shadow-sm">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
              <span className="font-semibold text-teal-800">
                Cần hỗ trợ thêm?
              </span>
            </div>
            <p className="text-sm text-teal-700 mb-4">
              Đội ngũ chăm sóc khách hàng{" "}
              <span className="font-medium">24/7</span>. Phản hồi trung bình chỉ{" "}
              <span className="text-teal-600">5 phút</span>.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-lg shadow hover:bg-gray-50 text-sm font-medium">
                📞 Hotline: 1900 1234
              </button>

              <a
                href={endPoint.CONTACT}
                className="flex-1 bg-[#21a4a6] text-white py-2 hover:brightness-90 transition-colors text-sm font-medium flex items-center justify-center rounded-lg"
              >
                Liên hệ ngay
              </a>
            </div>
          </div>
        </motion.div>

        {/* FAQ box */}
        <motion.div
          className="flex flex-col bg-white rounded-2xl shadow-lg self-end w-full"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-teal-600 p-2 rounded-lg mr-3">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Câu hỏi thường gặp
                  </h3>
                  <p className="text-sm text-gray-600">
                    Giải đáp nhanh các thắc mắc phổ biến
                  </p>
                </div>
              </div>
              <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
                Top {faqs.length}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="flex flex-col p-6">
            <div className="space-y-2 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
              {faqs.map((faq, index: number) => (
                <div
                  key={index}
                  className="group border border-gray-200 rounded-xl hover:border-teal-300 transition-all duration-200 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium mb-2">
                          {faq.category}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                          {faq.question}
                        </h4>
                      </div>
                      <div className="flex-shrink-0">
                        {openIndex === index ? (
                          <Minus className="w-5 h-5 text-teal-600 transform transition-transform duration-200" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transform transition-all duration-200" />
                        )}
                      </div>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-2">
                      <div className="bg-teal-50 rounded-lg p-3 border-l-4 border-teal-500">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Không tìm thấy câu trả lời?
                      </p>
                      <p className="text-xs text-gray-600">
                        Khám phá thêm 50+ câu hỏi khác
                      </p>
                    </div>
                  </div>
                  <a
                    href={endPoint.FAQS}
                    className="group inline-flex items-center bg-white hover:bg-teal-600 text-teal-600 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <span>Xem tất cả Q&A</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
