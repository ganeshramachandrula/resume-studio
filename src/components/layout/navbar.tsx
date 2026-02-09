'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Resume Studio</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="accent">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
