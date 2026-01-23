"use client"

import { Clock, Users, MapPin, ArrowLeft, UserPlus, UserMinus, Star, Trophy } from "lucide-react"
import { useGetPlaymatePostQuery } from "@redux/api/playmatePost/playmatePostApi"
import {
  useGetMyPlaymateJoinsQuery,
  useCreatePlaymateJoinMutation,
  useDeletePlaymateJoinMutation,
  useGetPlaymateJoinsQuery,
} from "@redux/api/playmateJoin/playmateJoinApi"
import type { PlaymateJoin } from "@redux/api/playmateJoin/type"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { selectAuth } from "@/redux/features/auth/authSlice"

const PlaymatePostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const loc = useLocation()
  const { data: postData, isLoading: postLoading, isError: postError } = useGetPlaymatePostQuery(Number(id) || 0)
  const { data: joinsData } = useGetPlaymateJoinsQuery({ postId: Number(id) })
  const { data: myJoinsData } = useGetMyPlaymateJoinsQuery({ postId: Number(id) })
  const [createJoin, { isLoading: joinLoading }] = useCreatePlaymateJoinMutation()
  const [deleteJoin] = useDeletePlaymateJoinMutation()
  const { accessToken } = useSelector(selectAuth)

  useEffect(() => {
    if (!accessToken) {
      const redirectUrl = encodeURIComponent(loc.pathname + loc.search)
      navigate(`/auth?view=login&redirect=${redirectUrl}`)
    }
  }, [accessToken, navigate, loc])

  const post = postData?.data
  const joins =
    joinsData?.data && "items" in joinsData.data ? joinsData.data.items : (joinsData?.data as PlaymateJoin[]) || []
  const myJoin =
    myJoinsData?.data && "items" in myJoinsData.data
      ? myJoinsData.data.items[0]
      : ((myJoinsData?.data as PlaymateJoin[]) || [])[0]

  if (postLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">Đang tải...</div>
      </div>
    )
  if (postError || !post)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-destructive">Bài đăng không tồn tại</div>
      </div>
    )

  const handleJoin = async () => {
    if (post.currentPlayers >= post.neededplayers || post.status !== "Open") return
    await createJoin({ postId: post.id })
  }

  const handleLeave = async () => {
    if (myJoin) await deleteJoin(myJoin.id)
  }

  const showJoinButton = !myJoin && post.currentPlayers < post.neededplayers && post.status == "Open"
  const playerProgress = (post.currentPlayers / post.neededplayers) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Back Button */}
      <section className="px-5 md:px-8 pt-6">
        <button
          onClick={() => navigate("/playPost")}
          className="inline-flex items-center gap-2 text-[#1e9ea1] hover:text-[#1a7f88] font-medium transition-colors hover:gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>
      </section>

      {/* Hero Section with Image */}
      {post.courtImageUrls.length > 0 && (
        <section className="px-5 md:px-8 py-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={post.courtImageUrls[0] || "/placeholder.svg"}
                alt={post.courtName}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
                    post.status === "Open" ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  {post.status}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Title and Description */}
      <section className="px-5 md:px-8 py-6">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">{post.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">{post.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#1e9ea1]/10 rounded-lg">
                  <Clock className="w-5 h-5 text-[#1e9ea1]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Thời gian</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(post.bookingdate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600">
                    {post.slotStarttime} - {post.slotEndtime}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Địa điểm</p>
                  <p className="text-sm font-semibold text-slate-900">{post.courtName}</p>
                  <p className="text-xs text-slate-600">{post.courtLocation}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Người chơi</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {post.currentPlayers}/{post.neededplayers}
                  </p>
                  <p className="text-xs text-slate-600">Còn {post.neededplayers - post.currentPlayers} chỗ</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Trình độ</p>
                  <p className="text-sm font-semibold text-slate-900">{post.skilllevel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Progress */}
      <section className="px-5 md:px-8 py-4">
        <div className="mx-auto w-full max-w-5xl">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Tiến độ tuyển dụng</h3>
              <span className="text-sm font-bold text-[#1e9ea1]">{Math.round(playerProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1e9ea1] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${playerProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Button */}
      <section className="px-5 md:px-8 py-6">
        <div className="mx-auto w-full max-w-5xl">
          {myJoin ? (
            <button
              onClick={handleLeave}
              disabled={joinLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <UserMinus className="w-5 h-5" />
              Rời khỏi nhóm
            </button>
          ) : showJoinButton ? (
            <button
              onClick={handleJoin}
              disabled={joinLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#1e9ea1] to-emerald-500 hover:from-[#1a7f88] hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              Tham gia ngay
            </button>
          ) : (
            <div className="bg-slate-100 rounded-2xl p-6 text-center">
              <p className="text-slate-600 font-medium">Nhóm đã đầy hoặc đã đóng</p>
            </div>
          )}
        </div>
      </section>

      {/* Joined Users List */}
      <section className="px-5 md:px-8 pb-12">
        <div className="mx-auto w-full max-w-5xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Người tham gia ({joins.length})</h3>
          {joins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joins.map((join) => (
                <div
                  key={join.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1e9ea1] to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {join.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{join.userName}</p>
                    <p className="text-sm text-slate-500">Tham gia: {new Date(join.joinedat).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Chưa có người tham gia</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default PlaymatePostDetail
