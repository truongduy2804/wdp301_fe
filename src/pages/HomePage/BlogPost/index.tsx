import { useState } from "react";
import { Clock, Star, Search, Calendar } from "lucide-react";
import Pagination from "@components/Pagination";
import { useGetBlogsQuery } from "@redux/api/blog/blogApi";
import type { Blog, ListParams } from "@redux/api/blog/type";
import {  useNavigate } from "react-router-dom";

const POSTS_PER_PAGE = 9;

/* ====== Post Card (compact @100% zoom) ====== */
const PostCard = ({ post }: { post: Blog }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/blogPost/${post.id}`);
  };

  return (
    <article
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden
                 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
    >
      {post.status === 'Featured' && (
        <div className="absolute top-3.5 right-3.5 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          NỔI BẬT
        </div>
      )}

      {/* Cover */}
      <div className="relative">
        <img
          src={post.imageUrl || 'https://via.placeholder.com/400x240'} 
          alt={post.title}
          className="w-full h-56 md:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Author Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold border-2 border-white/30"
              >
                {post.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[13px] leading-none">
                  {post.authorName}
                </div>
                <div className="text-[11px] opacity-85 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 shrink-0 relative top-[0.5px]" />
                  <span className="leading-none relative bottom-[-1px] ml-0.5">
                    {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px]">
              Cầu Lông
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2.5 group-hover:text-teal-600 transition-colors leading-snug text-lg md:text-xl">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-5 leading-relaxed text-[13px] md:text-sm line-clamp-2">
          {post.shortdesc || post.content.substring(0, 100) + '...'}
        </p>

        {/* Stats & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5 text-[13px] md:text-sm text-gray-500">
            <span
              className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={() => setIsLiked(!isLiked)}
            >
              <svg
                className={`w-4 h-4 ${isLiked ? "text-red-500" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              0
            </span>
            <span className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              0
            </span>
          </div>
          <button
            className="group relative text-teal-600 font-medium text-[13px] md:text-sm flex items-center gap-1 transition-all duration-200 hover:brightness-95 hover:translate-x-1"
            onClick={handleReadMore}
          >
            Đọc Thêm »
          </button>
        </div>
      </div>
    </article>
  );
};

/* ====== Blog Post List Page (with Filters and Search) ====== */
const BlogPostList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const params: ListParams = {
    status: 'Published',
    search: search || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, isError } = useGetBlogsQuery(params);

  const blogs = data?.data && 'items' in data.data ? data.data.items : (data?.data as Blog[]) || [];
  const totalPages = data?.data && 'totalPages' in data.data ? data.data.totalPages : Math.ceil((data?.data as Blog[] || []).length / POSTS_PER_PAGE) || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Title Section */}
      <section className="relative py-8 sm:pt-7 sm:pb-10 text-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <h2 className="font-bold text-gray-900 tracking-tight">
            <span className="flex items-center justify-center gap-2 text-2xl md:text-3xl">
              <span aria-hidden className="leading-none">
                🏸
              </span>
              <span>Cộng đồng &amp; Kiến thức</span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 mt-1.5">
              Cầu Lông Việt Nam
            </span>
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-40 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
          <p className="mt-3.5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Chia sẻ kinh nghiệm, tips hữu ích và kết nối với cộng đồng người
            chơi cầu lông trên khắp cả nước. Từ người mới bắt đầu đến pro
            player.
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="px-5 md:px-8 pb-5">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <select
              value={`${sortBy}|${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('|');
                setSortBy(by);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="createdAt|desc">Mới nhất</option>
              <option value="createdAt|asc">Cũ nhất</option>
              <option value="title|asc">Tiêu đề A-Z</option>
              <option value="title|desc">Tiêu đề Z-A</option>
            </select>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-5 md:px-8 pb-10">
        <div className="mx-auto w-full max-w-7xl">
          {isLoading ? (
            <div className="text-center py-14">Đang tải...</div>
          ) : isError ? (
            <div className="text-center py-14 text-red-500">Lỗi khi tải dữ liệu</div>
          ) : blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-14">
              <h3 className="text-xl md:text-2xl font-bold text-gray-600 mb-1.5">
                Không tìm thấy bài viết
              </h3>
              <p className="text-gray-500 text-sm md:text-base">
                Thử tìm kiếm với từ khóa khác hoặc chọn category khác
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};


export default BlogPostList;