
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import './Signup.css'

// Signup validation
const signupSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(value => value === true, {
    message: 'Please accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type SignupFormData = z.infer<typeof signupSchema>

function Signup() {

  const navigate = useNavigate()

  const { signUp, signInWithGoogle } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  // Calculate password strength
  const getPasswordStrength = () => {
    let score = 0

    if (passwordValue.length >= 8) score++
    if (/[A-Z]/.test(passwordValue)) score++
    if (/[0-9]/.test(passwordValue)) score++
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++

    return score
  }

  const strength = getPasswordStrength()

  const strengthText = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ]

  const strengthColors = [
    '#ff5555',
    '#ff5555',
    '#ffae42',
    '#5c9cff',
    '#4bd6a0'
  ]

  // Register new user with Supabase
  const onSubmit = async (data: SignupFormData) => {

    const { data: result, error } = await signUp(
      data.fullName,
      data.email,
      data.password
    )

    if (error) {
      toast.error(error.message)
      return
    }

    // If session exists, user is already authenticated
    if (result.session) {
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } else {
      // Email verification is enabled
      toast.success('Account created! Please verify your email.')
    }
  }

  // Google signup
  const handleGoogleSignup = async () => {

    const { error } = await signInWithGoogle()

    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="signup-page">

      <div className="signup-glow signup-glow-one"></div>
      <div className="signup-glow signup-glow-two"></div>

      <motion.div
        className="signup-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        <div className="signup-brand">
          <div className="signup-brand-icon">O</div>
          <span>ORBIT</span>
        </div>

        <div className="signup-heading">
          <h1>Create your account</h1>
          <p>Start organizing your life with Orbit.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Full Name */}
          <div className="signup-field">
            <label>Full Name</label>

            <div className="signup-input">
              <User size={19} />

              <input
                type="text"
                placeholder="Enter your full name"
                {...register('fullName')}
              />
            </div>

            {errors.fullName && (
              <span className="signup-error">
                {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="signup-field">
            <label>Email Address</label>

            <div className="signup-input">
              <Mail size={19} />

              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
            </div>

            {errors.email && (
              <span className="signup-error">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="signup-field">
            <label>Password</label>

            <div className="signup-input">
              <Lock size={19} />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...register('password', {
                  onChange: (event) =>
                    setPasswordValue(event.target.value)
                })}
              />

              <button
                type="button"
                className="signup-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {passwordValue && (
              <div className="password-strength">

                <div className="strength-bars">
                  {[1, 2, 3, 4].map(number => (
                    <span
                      key={number}
                      style={{
                        background:
                          number <= strength
                            ? strengthColors[strength]
                            : '#303950'
                      }}
                    />
                  ))}
                </div>

                <span style={{ color: strengthColors[strength] }}>
                  {strengthText[strength]}
                </span>

              </div>
            )}

            {errors.password && (
              <span className="signup-error">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="signup-field">
            <label>Confirm Password</label>

            <div className="signup-input">
              <Lock size={19} />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
              />

              <button
                type="button"
                className="signup-eye"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="signup-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Terms */}
          <label className="signup-terms">
            <input
              type="checkbox"
              {...register('terms')}
            />

            <span>
              I agree to the Terms & Conditions and Privacy Policy.
            </span>
          </label>

          {errors.terms && (
            <span className="signup-error">
              {errors.terms.message}
            </span>
          )}

          {/* Create Account */}
          <button
            type="submit"
            className="signup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}

            <ArrowRight size={19} />
          </button>

        </form>

        <div className="signup-divider">
          <span>OR SIGN UP WITH</span>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          className="signup-google"
          onClick={handleGoogleSignup}
        >
          <span className="google-letter">G</span>
          Continue with Google
        </button>

        <div className="signup-login-link">
          Already have an account?
          <Link to="/login"> Sign In</Link>
        </div>

        <div className="signup-security">
          <CheckCircle2 size={15} />
          Your productivity starts here
        </div>

      </motion.div>

      <div className="signup-footer">
        © {new Date().getFullYear()} Orbit. All rights reserved.
      </div>

    </div>
  )
}

export default Signup
