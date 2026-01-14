'use client'

import GoogleSignIn from './GoogleSignIn'

// Showcase component for different authentication UI patterns
export default function AuthUIExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Google Authentication UI Examples</h1>
        <p className="text-gray-600">Different styles and variations for Google sign-in buttons</p>
      </div>

      {/* Size Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Size Variations</h2>
        <div className="grid gap-4 max-w-md">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small (sm)</p>
            <GoogleSignIn size="sm" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (md) - Default</p>
            <GoogleSignIn size="md" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large (lg)</p>
            <GoogleSignIn size="lg" />
          </div>
        </div>
      </section>

      {/* Style Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Style Variations</h2>
        <div className="grid gap-4 max-w-md">
          <div>
            <p className="text-sm text-gray-600 mb-2">Default Style</p>
            <GoogleSignIn variant="default" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Compact Style</p>
            <GoogleSignIn variant="compact" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Outline Style</p>
            <GoogleSignIn variant="outline" />
          </div>
        </div>
      </section>

      {/* Login Form Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Login Form Layouts</h2>

        {/* Example 1: Google First */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-center mb-6">Google First Layout</h3>
          <div className="space-y-2">
            <GoogleSignIn />
            <div className="text-right pr-2">
              <button className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors">
                Login with Email
              </button>
            </div>
            {/* Email form would appear here when clicked */}
            <div className="text-center text-sm text-gray-500 mt-2">
              (Click "Login with Email" to see form)
            </div>
          </div>
        </div>

        {/* Example 2: Side by Side */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-center mb-6">Side by Side Layout</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Continue with Google</h4>
              <GoogleSignIn />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Sign in with Email</h4>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Example 3: Toggle Pattern */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-center mb-6">Toggle Pattern Layout</h3>
          <div className="space-y-2">
            <GoogleSignIn />
            <div className="text-right pr-2">
              <button className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors">
                Login with Email
              </button>
            </div>
            {/* Email form would appear here, Google button would be hidden */}
            <div className="border-t border-gray-200 pt-4 space-y-3 opacity-50">
              <p className="text-center text-sm text-gray-500 mb-3">Email form + "Continue with Google" below:</p>
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <button className="w-full bg-blue-500 text-white py-3 rounded-lg" disabled>
                Sign In
              </button>
              <div className="text-right pr-2">
                <button className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors opacity-50">
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Example 4: Minimal */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-center mb-6">Minimal Layout</h3>
          <div className="text-center space-y-4">
            <p className="text-gray-600">Welcome back! Sign in to continue.</p>
            <GoogleSignIn variant="outline" />
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Additional Social Auth Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Multi-Social Auth Layout</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-center mb-6">Multiple Sign-in Options</h3>
          <div className="space-y-3">
            <GoogleSignIn />

            {/* Facebook-style button */}
            <button className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Continue with Facebook</span>
            </button>

            {/* Apple-style button */}
            <button className="w-full flex items-center justify-center gap-3 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="font-medium">Continue with Apple</span>
            </button>


            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
