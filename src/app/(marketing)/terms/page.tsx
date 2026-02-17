import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Resume Studio.',
}

export default function TermsOfServicePage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: February 16, 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. Agreement to Terms */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using Resume Studio (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may
              not use the Service. We reserve the right to update these Terms at any time. Continued
              use of the Service after changes are posted constitutes acceptance of the revised
              Terms.
            </p>
          </div>

          {/* 2. Service Description */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">2. Service Description</h2>
            <p>
              Resume Studio is a web-based application that uses artificial intelligence to generate
              tailored career documents, including resumes, cover letters, LinkedIn summaries, cold
              outreach emails, interview preparation guides, and certification guides. The Service
              also provides a career coaching feature powered by AI.
            </p>
          </div>

          {/* 3. Account Registration */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">3. Account Registration</h2>
            <p>
              To use the Service, you must create an account using a valid email address or a
              supported third-party authentication provider (Google or GitHub). You are responsible
              for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account. You must notify us immediately of any unauthorized use.
            </p>
          </div>

          {/* 4. Subscription Plans & Billing */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">4. Subscription Plans &amp; Billing</h2>
            <p className="mb-3">Resume Studio offers the following plans:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Free:</strong> Up to 2 document generations per
                month. Documents can be previewed but are not saved to your account. PDF downloads
                include a watermark.
              </li>
              <li>
                <strong className="text-gray-300">Pro Monthly ($9.99/month):</strong> Unlimited
                generations, documents saved to your account, no watermarks, up to 10 active
                applications.
              </li>
              <li>
                <strong className="text-gray-300">Pro Annual ($79/year):</strong> All Pro Monthly
                features plus premium resume templates, career coaching, and multi-language support.
              </li>
              <li>
                <strong className="text-gray-300">Team ($59/seat/year, minimum 5 seats):</strong>{' '}
                All Pro Annual features with centralized billing and team management.
              </li>
              <li>
                <strong className="text-gray-300">Credit Pack ($2.99, one-time):</strong> 3
                additional document generations. Credits never expire and include all Pro features
                (no watermark, saved to account).
              </li>
            </ul>
            <p className="mt-3">
              Paid subscriptions are billed through Stripe. By subscribing, you authorize us to
              charge your payment method on a recurring basis until you cancel. You can manage your
              subscription through the billing portal at any time.
            </p>
          </div>

          {/* 5. Refund Policy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">5. Refund Policy</h2>
            <p>
              Subscription payments are non-refundable except where required by applicable law. If
              you cancel a subscription, you will retain access to paid features until the end of
              your current billing period. Credit pack purchases are non-refundable once credits have
              been used.
            </p>
          </div>

          {/* 6. AI-Generated Content Disclaimer */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">6. AI-Generated Content Disclaimer</h2>
            <p>
              Documents generated by Resume Studio are created using artificial intelligence and are
              intended as a starting point. You are solely responsible for reviewing, editing, and
              verifying all generated content before use. We do not guarantee the accuracy,
              completeness, or suitability of any AI-generated content. Resume Studio is not
              responsible for any outcomes resulting from the use of generated documents, including
              but not limited to job application results.
            </p>
          </div>

          {/* 7. Intellectual Property */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">7. Intellectual Property</h2>
            <p>
              You retain ownership of the content you provide (resume text, job descriptions) and the
              documents generated from your content. Resume Studio retains all rights to the Service
              itself, including its design, code, templates, AI prompts, and branding. You may not
              copy, modify, distribute, or reverse-engineer any part of the Service.
            </p>
          </div>

          {/* 8. Acceptable Use */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">8. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>
                Use automated tools (bots, scrapers) to access the Service without our written
                permission
              </li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Resell, redistribute, or sublicense the Service or generated content for commercial purposes without authorization</li>
              <li>Circumvent any usage limits, access controls, or security measures</li>
            </ul>
          </div>

          {/* 9. Data & Privacy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">9. Data &amp; Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </a>
              , which describes how we collect, use, and protect your personal information. By using
              the Service, you agree to the practices described in our Privacy Policy.
            </p>
          </div>

          {/* 10. Third-Party Services */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">10. Third-Party Services</h2>
            <p>
              The Service integrates with third-party providers including Supabase (database and
              authentication), Stripe (payments), and Anthropic (AI processing). These services have
              their own terms and privacy policies. We are not responsible for the practices of
              third-party services.
            </p>
          </div>

          {/* 11. Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RESUME STUDIO AND ITS OPERATORS SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING
              OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE
              AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </div>

          {/* 12. Account Termination */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">12. Account Termination</h2>
            <p>
              You may delete your account at any time. We reserve the right to suspend or terminate
              your account if you violate these Terms, engage in fraudulent activity, or abuse the
              Service. Upon termination, your right to use the Service ceases immediately. We may
              retain certain data as required by law.
            </p>
          </div>

          {/* 13. Service Modifications */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">13. Service Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any
              time, with or without notice. We will make reasonable efforts to notify users of
              significant changes. We are not liable for any modification, suspension, or
              discontinuation of the Service.
            </p>
          </div>

          {/* 14. Governing Law */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States. Any disputes arising from these Terms or the Service shall be resolved
              through binding arbitration, except where prohibited by law.
            </p>
          </div>

          {/* 15. Contact */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">15. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us through our{' '}
              <a href="/contact" className="text-brand hover:underline">
                Contact Page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
