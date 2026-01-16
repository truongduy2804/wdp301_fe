import TrustBadges from "./TrustBadges"

export default function BrandSection() {
  return (
      <div className="w-full max-w-md flex flex-col justify-center animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
      <div className="space-y-8">
        {/* Main Description */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight whitespace-nowrap">Quản lý rác thải thông minh</h2>
          <p className="text-lg text-gray-600 whitespace-nowrap">Giải pháp thu gom rác tiên tiến để bảo vệ hành tinh chúng ta</p>
        </div>

        <TrustBadges />
      </div>
    </div>
  )
}
