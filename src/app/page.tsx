import Link from 'next/link'
import { Search, DollarSign, FileText, Target, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8" />
              <h1 className="text-2xl font-bold">GrantScout</h1>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 border border-white rounded hover:bg-white hover:text-blue-900 transition">
                Login
              </button>
              <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Right Grants. <span className="text-blue-600">Win More Funding.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered grant discovery and application assistance for healthcare, biotech, and research organizations. 
            Our success fee model means we only win when you win.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/search" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
              Search Live Opportunities <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/search" className="px-8 py-4 border-2 border-gray-300 rounded-lg text-lg font-semibold hover:border-gray-400 transition">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$4.2B+</div>
              <div className="text-gray-600">Available SBIR/STTR Funding</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">67%</div>
              <div className="text-gray-600">Higher Success Rate vs DIY</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">8.5%</div>
              <div className="text-gray-600">Success Fee (Industry Standard: 10-15%)</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How GrantScout Works</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. AI Grant Discovery</h3>
              <p className="text-gray-600">Our AI scans 60+ funding sources daily, matching opportunities to your company profile and research focus.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Application Assistance</h3>
              <p className="text-gray-600">Get help with proposal writing, budget preparation, and compliance requirements for each specific grant.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Success-Based Fees</h3>
              <p className="text-gray-600">Pay only when you win. 8.5% success fee on awarded grants, plus optional $99/month for premium features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Success-Based Pricing</h2>
          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Grant Discovery</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">FREE</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>AI-powered grant matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic application templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Email alerts for new opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>8.5% success fee on awards</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-blue-600 rounded-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Grant Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-1">$99</div>
              <div className="text-gray-600 mb-4">/month + 8.5% success fee</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>1-on-1 application review</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Budget planning assistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Compliance checklist</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Start 14-Day Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Win More Grants?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join healthcare and research organizations already using GrantScout to secure funding.
          </p>
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition">
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-6 w-6" />
            <span className="text-xl font-bold">GrantScout</span>
          </div>
          <p className="text-gray-400">© 2026 GrantScout by Augeo Health. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}