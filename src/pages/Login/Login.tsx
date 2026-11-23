
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean()
})

type LoginFormData = z.infer<typeof loginSchema>

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const {
    signIn,
    signInWithGoogle,
    resetPassword
  } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true
    }
  })

  // Login with Supabase
  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(
      data.email,
      data.password
    )

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Login successful!')
    navigate('/dashboard')
  }

  // Google authentication
  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()

    if (error) {
      toast.error(error.message)
    }
  }

  // Forgot password
  const handleForgotPassword = async () => {
    const email = window.prompt('Enter your registered email address')

    if (!email) return

    const { error } = await resetPassword(email)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password reset email sent!')
    }
  }

  return (
    <div className="login-page">

      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        <div className="login-brand">
          <div className="brand-icon">O</div>
          <span>ORBIT</span>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue your productivity journey.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="login-field">
            <label>Email Address</label>

            <div className="login-input">
              <Mail size={19} />
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
            </div>

            {errors.email && (
              <span className="login-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="login-field">
            <div className="password-label">
              <label>Password</label>

              <button
                type="button"
                className="forgot-button"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <div className="login-input">
              <Lock size={19} />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
              />

              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.password && (
              <span className="login-error">
                {errors.password.message}
              </span>
            )}
          </div>

          <label className="remember-option">
            <input type="checkbox" {...register('remember')} />
            <span>Remember me</span>
          </label>

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={19} />
          </button>

        </form>

        <div className="login-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button
          type="button"
          className="google-login"
          onClick={handleGoogleLogin}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="signup-link">
          Don't have an account?
          <Link to="/signup"> Create account</Link>
        </div>

        <div className="login-security">
          <CheckCircle2 size={15} />
          Secure productivity workspace
        </div>

      </motion.div>

      <div className="login-footer">
        © {new Date().getFullYear()} Orbit. All rights reserved.
      </div>

    </div>
  )
}

export default Login
