import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark border-t border-white/10 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Documents</h4>
            <ul className="space-y-2 text-sm">
              <li><span>Resume Builder</span></li>
              <li><span>Cover Letter</span></li>
              <li><span>LinkedIn Summary</span></li>
              <li><span>Interview Prep</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span>Privacy Policy</span></li>
              <li><span>Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm">
          &copy; {new Date().getFullYear()} Resume Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
