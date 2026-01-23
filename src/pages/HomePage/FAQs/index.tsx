import React, { useState, Fragment } from "react";
import {
  ChevronDown,
  Search,
  MessageCircleQuestion,
  Check,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { faqs, categories } from "./data";
import Pagination from "@components/Pagination";

const BadmintonFAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1); // trang hiện tại
  const pageSize = 8; // số item trên mỗi trang

  const toggleExpanded = (id: number): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredFAQs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentFAQs = filteredFAQs.slice(startIndex, startIndex + pageSize);

  const getCategoryName = (category: string): string => {
    const categoryNames: { [key: string]: string } = {
      all: "Tất cả",
      booking: "Đặt sân",
      payment: "Thanh toán",
      court: "Sân bãi",
      account: "Tài khoản",
      security: "Bảo mật",
      service: "Dịch vụ",
      support: "Hỗ trợ",
    };
    return categoryNames[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-bl from-teal-600 via-teal-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-2 text-center">
          <div className="mb-6 relative flex flex-col items-center">
            <h2 className="inline-flex flex-wrap items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-clip-text bg-gradient-to-r from-white to-teal-100 text-center">
              Câu hỏi thường gặp
              <span className="ml-3 mt-0 sm:mt-2 flex-shrink-0 flex items-center justify-center h-10 w-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                <MessageCircleQuestion className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500" />
              </span>
            </h2>

            <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto">
              Tìm câu trả lời cho các thắc mắc về nền tảng đặt sân cầu lông của
              chúng tôi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-4 py-10">
        {/* Search & Filter */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:justify-center items-center">
          {/* Search */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:border-teal-500/50 focus:border-teal-400 focus:ring-1 focus:ring-teal-500 outline-none transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Dropdown Filter */}
          <div className="relative w-full sm:w-1/2 md:w-1/6">
            <Listbox
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <div className="relative">
                <Listbox.Button className="w-full flex items-center justify-between px-5 py-2.5 bg-white rounded-xl shadow-md hover:border-teal-500/50 border border-gray-200 focus:ring-1 focus:ring-teal-400 transition">
                  <span className="flex items-center gap-2">
                    {categories.find((c) => c.name === selectedCategory)?.icon}
                    {getCategoryName(selectedCategory)}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 scale-95 -translate-y-1"
                  enterTo="opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 scale-100 translate-y-0"
                  leaveTo="opacity-0 scale-95 -translate-y-1"
                >
                  <Listbox.Options className="custom-scrollbar absolute mt-2 w-full max-h-60 overflow-auto bg-white shadow-xl rounded-2xl border border-gray-200 z-20">
                    {categories.map((category) => (
                      <Listbox.Option
                        key={category.name}
                        value={category.name}
                        className={({ active }) =>
                          `px-5 py-3 cursor-pointer flex items-center justify-between ${
                            active
                              ? "bg-teal-50 text-teal-700"
                              : "text-gray-700"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <div className="flex items-center gap-2">
                              {category.icon}
                              {getCategoryName(category.name)}
                            </div>
                            {selected && (
                              <Check className="w-5 h-5 text-teal-500" />
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {currentFAQs.map((faq, index) => (
            <div key={faq.id} className="relative">
              {/* Number badge */}
              <div className="absolute -top-2 -left-2 z-20 w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">
                {String(startIndex + index + 1).padStart(2, "0")}
              </div>

              {/* Card */}
              <div
                className={`bg-white rounded-2xl shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${
                  expandedItems.has(faq.id)
                    ? "border-teal-500 ring-2 ring-teal-100"
                    : "border-transparent hover:border-teal-500/50"
                } relative overflow-hidden`}
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className={`relative w-full text-left flex items-start justify-between group transition-all duration-300 ${
                    expandedItems.has(faq.id) ? "px-6 pt-6" : "p-6"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`flex-shrink-0 mt-1 p-2 rounded-xl transition-all duration-300 ${
                        expandedItems.has(faq.id)
                          ? "bg-slate-100 scale-110"
                          : "bg-gray-50 group-hover:bg-teal-50"
                      }`}
                    >
                      {faq.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300 ${
                          expandedItems.has(faq.id)
                            ? "text-teal-700"
                            : "text-gray-800 group-hover:text-teal-600"
                        }`}
                      >
                        {faq.question}
                      </h3>
                      {!expandedItems.has(faq.id) && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {faq.answer.substring(0, 120)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-300 ${
                      expandedItems.has(faq.id)
                        ? "bg-teal-100 rotate-180"
                        : "group-hover:bg-gray-100"
                    }`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-colors duration-300 ${
                        expandedItems.has(faq.id)
                          ? "text-teal-600"
                          : "text-gray-400 group-hover:text-teal-500"
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-auto custom-scrollbar transition-all duration-500 ease-in-out ${
                    expandedItems.has(faq.id)
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 relative">
                    <div className="ml-14 pt-2">
                      <div className="h-px bg-gradient-to-r from-teal-200 via-teal-100 to-transparent mb-4" />
                      <div className="bg-teal-50/30 p-4 rounded-xl border-l-2 border-teal-200">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-sm">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                          <span className="text-teal-600 font-medium">
                            Hữu ích
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            Cập nhật gần đây
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredFAQs.length > pageSize && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredFAQs.length}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

        {/* Không tìm thấy kết quả */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-500">
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadmintonFAQ;
