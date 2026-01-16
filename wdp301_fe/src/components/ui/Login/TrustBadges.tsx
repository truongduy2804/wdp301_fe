import { Leaf, Lock, Mail } from "lucide-react"

export default function TrustBadges() {
  return (
    <div className="space-y-4">
      {[
        { icon: Leaf, title: "Bảo vệ Môi trường", desc: "Giải pháp xanh 100%", color: "emerald" },
        { icon: Lock, title: "Bảo mật Dữ liệu", desc: "Mã hóa đầu cuối", color: "blue" },
        { icon: Mail, title: "Tin cậy & Minh bạch", desc: "Dịch vụ uy tín", color: "purple" },
      ].map((badge, idx) => (
        <div
          key={idx}
          className="group rounded-xl animate-fade-in-up"
          style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
        >
          <div className="animated-border-small">
            <div className="group flex items-start gap-4 p-5 rounded-xl backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] cursor-default">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${
              badge.color === "emerald" ? "from-emerald-500 to-emerald-600" :
              badge.color === "blue" ? "from-blue-500 to-blue-600" :
              "from-purple-500 to-purple-600"
            } shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
              <badge.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-gray-900 mb-1 border-l-3 border-emerald-600 pl-3 group-hover:text-emerald-700 transition-colors duration-300">
              {badge.title}
            </p>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              {badge.desc}
            </p>
          </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
