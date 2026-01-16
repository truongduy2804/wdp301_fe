import BrandSection from '@/components/ui/Login/BrandSection'
import LoginForm from '@/components/ui/Login/LoginForm'
import { Leaf } from "lucide-react"

export default function LoginPage() {
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-green-50 via-green-100 to-green-600 flex items-center justify-center p-8 lg:p-12' style={{ background: 'linear-gradient(to bottom right, #f0fdf4 0%, #f0fdf4 20%, #dcfce7 40%, #bbf7d0 60%, #16a34a 100%)' }}>
      <div className='w-full max-w-8xl rounded-lg p-4 lg:p-6 -mt-6 lg:-mt-4 relative'>
        {/* Logo GreenPoint ở góc trên bên trái */}
        <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
          <div className="relative">
            <Leaf className="w-10 h-10 text-emerald-600 animate-float" />
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-emerald-700">GreenPoint</h1>
            <p className="text-sm font-bold text-gray-600 pl-2">Bảo vệ Môi Trường</p>
          </div>
        </div>
        
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Left Column - BrandSection */}
          <div className='flex items-center justify-center'>
            <BrandSection />
          </div>
          
          {/* Right Column - LoginForm */}
          <div className='flex items-center justify-center'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}