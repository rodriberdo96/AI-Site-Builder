import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { signIn, signUp } from '../../lib/auth-client'
import { toast } from 'sonner'
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const { pathname } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine initial mode based on path
  const isSignUpPath = pathname === 'signup' || pathname === 'sign-up'
  const [isSignUp, setIsSignUp] = useState(isSignUpPath)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect destination after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/projects'

  // Update form tab when path URL changes
  useEffect(() => {
    setIsSignUp(isSignUpPath)
  }, [pathname, isSignUpPath])

  const handleTabChange = (signUpMode: boolean) => {
    setIsSignUp(signUpMode)
    navigate(signUpMode ? '/auth/signup' : '/auth/signin', { replace: true, state: location.state })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (isSignUp && !name.trim()) {
      toast.error('Please enter your name.')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }

    if (isSignUp) {
      await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        fetchOptions: {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => {
            toast.success('Welcome! Your account has been created.')
            navigate(from, { replace: true })
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Failed to create account. Please try again.')
          }
        }
      })
    } else {
      await signIn.email({
        email: email.trim(),
        password,
        fetchOptions: {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => {
            toast.success('Successfully logged in!')
            navigate(from, { replace: true })
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Login failed. Please verify your credentials.')
          }
        }
      })
    }
  }

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to homepage
        </Link>

        {/* Auth Card Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {isSignUp ? 'Get started with your 30-day free trial.' : 'Enter your details to access your account.'}
            </p>
          </div>

          {/* Custom Tabs */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/40 mb-8">
            <button
              type="button"
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                !isSignUp 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isSignUp 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-50 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
                  Password
                </label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 active:scale-[0.98] hover:opacity-95 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:active:scale-100 transition-all mt-6 text-sm"
            >
              {loading ? (
                <>
                  Processing <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          {/* Bottom helper */}
          <div className="mt-8 text-center text-xs text-slate-400">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => handleTabChange(false)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => handleTabChange(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}