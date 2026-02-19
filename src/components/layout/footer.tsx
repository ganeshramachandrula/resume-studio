import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark border-t border-white/10 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">Resume Studio</span>
            </Link>
            <p className="text-sm">
              Smart career document generation. Land your dream job with one click.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/compare/chatgpt" className="hover:text-white transition-colors">vs ChatGPT</Link></li>
              <li><Link href="/compare/indeed" className="hover:text-white transition-colors">vs Indeed</Link></li>
              <li><Link href="/compare/linkedin" className="hover:text-white transition-colors">vs LinkedIn</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Documents</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">Resume Builder</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Cover Letter</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">LinkedIn Summary</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Interview Prep</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Language links */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>Also available in:</span>
          <Link href="/es" className="hover:text-white transition-colors">Espanol</Link>
          <Link href="/fr" className="hover:text-white transition-colors">Francais</Link>
          <Link href="/de" className="hover:text-white transition-colors">Deutsch</Link>
          <Link href="/pt" className="hover:text-white transition-colors">Portugues</Link>
          <Link href="/hi" className="hover:text-white transition-colors">Hindi</Link>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm">
          &copy; {new Date().getFullYear()} Resume Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
