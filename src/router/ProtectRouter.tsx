import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/components/Page/LoginPage'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default AppRouter
