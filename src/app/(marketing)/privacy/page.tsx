import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Resume Studio collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: February 16, 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">1. Introduction</h2>
            <p>
              Resume Studio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our web application and related services
              (collectively, the &quot;Service&quot;). By using the Service, you agree to the
              practices described in this policy.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Account Information:</strong> When you register, we
                collect your email address and authentication credentials. If you sign in via Google
                or GitHub, we receive your name and email from those providers.
              </li>
              <li>
                <strong className="text-gray-300">Resume &amp; Career Data:</strong> You provide your
                resume text, job descriptions, and career-related information to generate documents.
              </li>
              <li>
                <strong className="text-gray-300">Payment Information:</strong> When you subscribe to
                a paid plan, Stripe processes your payment details. We do not store your full credit
                card number.
              </li>
              <li>
                <strong className="text-gray-300">Usage Data:</strong> We automatically collect
                information about how you interact with the Service, including IP address, browser
                type, pages visited, and timestamps.
              </li>
              <li>
                <strong className="text-gray-300">Support Messages:</strong> If you contact us, we
                store your name, email, and message content to respond to your inquiry.
              </li>
            </ul>
          </div>

          {/* 3. How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>To provide, maintain, and improve the Service</li>
              <li>To generate tailored career documents using AI</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (account verification, password resets)</li>
              <li>To respond to support requests</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          {/* 4. AI Processing */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">4. AI Processing</h2>
            <p>
              Resume Studio uses Anthropic&apos;s Claude API to generate career documents. When you
              submit your resume and a job description, this data is sent to Anthropic&apos;s servers
              for processing. Anthropic does not use your data to train their models. Generated
              content is returned to our servers and stored in your account if you have a paid plan.
              Free-tier generations are not persisted after your session ends.
            </p>
          </div>

          {/* 5. Third-Party Services */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We rely on the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Supabase:</strong> Database hosting,
                authentication, and file storage. Your data is stored in Supabase&apos;s
                infrastructure with row-level security policies.
              </li>
              <li>
                <strong className="text-gray-300">Stripe:</strong> Payment processing. Stripe
                collects and processes your payment information in accordance with their own privacy
                policy.
              </li>
              <li>
                <strong className="text-gray-300">Anthropic:</strong> AI document generation. Your
                resume and job description text are processed by Anthropic&apos;s Claude API.
              </li>
            </ul>
            <p className="mt-3">
              Each third-party service has its own privacy policy governing its use of your data.
            </p>
          </div>

          {/* 6. Cookies */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">6. Cookies</h2>
            <p>
              We use essential cookies to maintain your authentication session. We do not use
              advertising or third-party tracking cookies. You can disable cookies in your browser
              settings, but this may prevent you from using certain features of the Service.
            </p>
          </div>

          {/* 7. Data Retention */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">7. Data Retention</h2>
            <p>
              We retain your account data and generated documents for as long as your account is
              active. If you delete your account, we will remove your personal data within 30 days,
              except where retention is required by law. Anonymized usage analytics may be retained
              indefinitely.
            </p>
          </div>

          {/* 8. Data Security */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">8. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              encryption in transit (TLS), row-level security policies on our database, rate
              limiting, input validation, and audit logging. However, no method of electronic
              transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* 9. Your Rights Under GDPR */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">9. Your Rights Under GDPR</h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA), you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at the email address below.
            </p>
          </div>

          {/* 10. Your Rights Under CCPA */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">10. Your Rights Under CCPA</h2>
            <p className="mb-3">
              If you are a California resident, the California Consumer Privacy Act (CCPA) grants
              you the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Know what personal information we collect about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information (we do not sell your data)</li>
              <li>Non-discrimination for exercising your CCPA rights</li>
            </ul>
          </div>

          {/* 11. Children's Privacy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">11. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under 16 years of age. We do not knowingly
              collect personal information from children. If you believe a child has provided us with
              personal data, please contact us and we will promptly delete it.
            </p>
          </div>

          {/* 12. International Data Transfers */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">12. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. Our
              service providers (Supabase, Stripe, Anthropic) operate infrastructure globally. By
              using the Service, you consent to the transfer of your data to these jurisdictions,
              which may have different data protection laws than your country of residence.
            </p>
          </div>

          {/* 13. Changes to This Policy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page and updating the &quot;Last
              updated&quot; date. Your continued use of the Service after any changes constitutes
              acceptance of the updated policy.
            </p>
          </div>

          {/* 14. Contact Us */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">14. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data
              rights, please contact us through our{' '}
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
