import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import './App.css'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-loader"><div className="loader-orbit"/><p>Preparing your workspace…</p></div>
  return user ? <>{children}</> : <Navigate to="/login" replace />
}
function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-loader"><div className="loader-orbit"/><p>Loading…</p></div>
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
