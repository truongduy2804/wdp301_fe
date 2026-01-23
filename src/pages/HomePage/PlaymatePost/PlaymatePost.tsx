"use client"

import { useEffect, useState } from "react"
import { Clock, Users, MapPin, Search, Star, Zap } from "lucide-react"
import Pagination from "@components/Pagination"
import { useGetPlaymatePostsQuery } from "@redux/api/playmatePost/playmatePostApi"
import type { PlaymatePost, PlaymatePostFilterParams } from "@redux/api/playmatePost/type"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectAuth } from "@/redux/features/auth/authSlice"

const POSTS_PER_PAGE = 9

/* ====== Playmate Post Card ====== */
const PlaymatePostCard = ({ post }: { post: PlaymatePost }) => {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/playPost/${post.id}`)
  }

  const playerProgress = (post.currentPlayers / post.neededplayers) * 100
  const spotsLeft = post.neededplayers - post.currentPlayers

  return (
    <article className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100">
      {/* Cover Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={post.courtImageUrls[0] || "https://via.placeholder.com/400x240"}
          alt={post.courtName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div className="absolute top-3 right-3 flex gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/90 text-white backdrop-blur-sm">
            <Star className="w-3 h-3" />
            {post.skilllevel}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              post.status === "Open" ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"
            }`}
          >
            <Zap className="w-3 h-3" />
            {post.status}
          </span>
        </div>

        {/* Court Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold truncate">{post.courtName}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#1e9ea1] transition-colors text-lg line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 mb-4 text-sm line-clamp-2 leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-[#1e9ea1] flex-shrink-0" />
            <span className="font-medium">
              {post.slotStarttime} — {post.slotEndtime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="font-medium">
              {post.currentPlayers}/{post.neededplayers}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Tiến độ</span>
            <span className="text-xs font-bold text-[#1e9ea1]">{spotsLeft} chỗ trống</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1e9ea1] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${playerProgress}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-[#1e9ea1] to-emerald-500 hover:from-[#1a7f88] hover:to-emerald-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Xem chi tiết
        </button>
      </div>
    </article>
  )
}

const PlaymatePostList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [skilllevel, setSkilllevel] = useState("")
  const [sortBy, setSortBy] = useState("createdat")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const { accessToken } = useSelector(selectAuth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!accessToken) {
      const redirectUrl = encodeURIComponent(location.pathname + location.search)
      navigate(`/auth?view=login&redirect=${redirectUrl}`)
    }
  }, [accessToken, navigate])

  const params: PlaymatePostFilterParams = {
    search: search || undefined,
    status: status || undefined,
    skilllevel: skilllevel || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize: POSTS_PER_PAGE,
  }

  const { data, isLoading, isError } = useGetPlaymatePostsQuery(params)

  const posts = data?.data && "items" in data.data ? data.data.items : (data?.data as PlaymatePost[]) || []
  const totalPages =
    data?.data && "totalPages" in data.data
      ? data.data.totalPages
      : Math.ceil(((data?.data as PlaymatePost[]) || []).length / POSTS_PER_PAGE) || 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Title Section */}
      <section className="relative py-12 text-center">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e9ea1]/10 text-[#1e9ea1] rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Tìm bạn chơi cầu lông
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-balance">
            Kết nối với các cầu thủ khác
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tìm đối thủ phù hợp, tham gia trận đấu tại các sân gần bạn và phát triển kỹ năng của mình.
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="px-5 md:px-8 pb-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tiêu đề, nội dung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1e9ea1] focus:ring-2 focus:ring-[#1e9ea1]/20 transition-all"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1e9ea1] focus:ring-2 focus:ring-[#1e9ea1]/20 transition-all bg-white font-medium text-slate-700"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Open">Mở</option>
                <option value="Closed">Đóng</option>
              </select>

              <select
                value={skilllevel}
                onChange={(e) => setSkilllevel(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1e9ea1] focus:ring-2 focus:ring-[#1e9ea1]/20 transition-all bg-white font-medium text-slate-700"
              >
                <option value="">Tất cả trình độ</option>
                <option value="Beginner">Mới bắt đầu</option>
                <option value="Intermediate">Trung bình</option>
                <option value="Advanced">Nâng cao</option>
              </select>

              <select
                value={`${sortBy}|${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split("|")
                  setSortBy(by)
                  setSortOrder(order as "asc" | "desc")
                }}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1e9ea1] focus:ring-2 focus:ring-[#1e9ea1]/20 transition-all bg-white font-medium text-slate-700"
              >
                <option value="createdat|desc">Mới nhất</option>
                <option value="createdat|asc">Cũ nhất</option>
                <option value="title|asc">Tiêu đề A-Z</option>
                <option value="title|desc">Tiêu đề Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-5 md:px-8 pb-12">
        <div className="mx-auto w-full max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#1e9ea1] animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Đang tải bài đăng...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-200">
              <p className="text-red-600 font-semibold">Lỗi khi tải dữ liệu</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <PlaymatePostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-16 text-center border border-slate-200">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài đăng</h3>
              <p className="text-slate-600 text-lg">Thử thay đổi bộ lọc hoặc tìm kiếm để tìm nhóm phù hợp</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default PlaymatePostList
