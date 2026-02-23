import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Resume Studio collects, uses, and protects your personal data.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: February 19, 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">1. Introduction</h2>
            <p>
              Resume Studio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is operated by Resume
              Studio, a sole proprietorship based in Frisco, Texas, United States. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              web application and related services (collectively, the &quot;Service&quot;). By using the
              Service, you agree to the practices described in this policy. If you do not agree with
              this policy, please do not use the Service.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following categories of information:</p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Account Information:</strong> Email address,
                full name, and authentication credentials when you register. If you sign in via Google
                or GitHub, we receive your name and email from those providers.
              </li>
              <li>
                <strong className="text-gray-300">Resume &amp; Career Data:</strong> Resume text,
                work experience, job descriptions, certifications, skills, references, and other
                career-related information you provide to generate documents.
              </li>
              <li>
                <strong className="text-gray-300">Contact Information:</strong> Name, email, phone
                number, and location you provide in contact forms or for inclusion in generated documents.
              </li>
              <li>
                <strong className="text-gray-300">Support Messages:</strong> Name, email, subject,
                and message content when you contact us through our support form.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Usage Data:</strong> IP address, browser type and
                version, operating system, pages visited, timestamps, referral URLs, and device
                identifiers.
              </li>
              <li>
                <strong className="text-gray-300">Device Information:</strong> Device fingerprint
                data used solely for security purposes (concurrent session management, fraud prevention).
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">2.3 Payment Information</h3>
            <p className="text-gray-400">
              Payment processing is handled entirely by Stripe, Inc. We do not receive, store, or
              process your full credit card number, CVV, or banking details. We only receive a Stripe
              customer identifier, subscription status, and transaction confirmations.
            </p>
          </div>

          {/* 3. How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>To provide, operate, maintain, and improve the Service</li>
              <li>To generate tailored career documents using AI on your behalf</li>
              <li>To process payments, manage subscriptions, and issue refunds</li>
              <li>To send transactional emails (account verification, password resets, subscription confirmations)</li>
              <li>To respond to support requests and customer inquiries</li>
              <li>To detect, prevent, and address fraud, abuse, security incidents, and technical issues</li>
              <li>To enforce our Terms of Service and protect our legal rights</li>
              <li>To comply with applicable laws, regulations, and legal obligations</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> use your personal information for
              advertising, profiling, or automated decision-making that produces legal effects.
            </p>
          </div>

          {/* 4. AI Processing */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">4. AI Processing &amp; Data Handling</h2>
            <p className="mb-3">
              Resume Studio uses Anthropic&apos;s Claude API to generate career documents. When you
              submit your resume and a job description for generation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Your resume text and job description are transmitted to Anthropic&apos;s servers for processing</li>
              <li>Anthropic does <strong className="text-gray-300">not</strong> use your data to train their AI models (per their data usage policy)</li>
              <li>Generated content is returned to our servers and stored in your account if you have a paid plan</li>
              <li>Free-tier generations are provided for preview only and are not persisted in our database</li>
              <li>We do not share your resume data with any party other than Anthropic for the purpose of document generation</li>
            </ul>
          </div>

          {/* 5. Disclosure of Information */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">5. Disclosure of Information</h2>
            <p className="mb-3">We may disclose your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Service Providers:</strong> We share data with
                third-party service providers who assist in operating the Service (see Section 6).
                These providers are contractually obligated to protect your data.
              </li>
              <li>
                <strong className="text-gray-300">Legal Requirements:</strong> We may disclose your
                information if required by law, subpoena, court order, or government regulation.
              </li>
              <li>
                <strong className="text-gray-300">Protection of Rights:</strong> We may disclose
                information to protect our rights, safety, or property, or that of our users or the public.
              </li>
              <li>
                <strong className="text-gray-300">Business Transfers:</strong> In the event of a
                merger, acquisition, or sale of assets, your data may be transferred as part of the
                transaction. We will notify you of any such change.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not sell</strong> your personal information to
              third parties. We do <strong className="text-white">not share</strong> your personal
              information for cross-context behavioral advertising.
            </p>
          </div>

          {/* 6. Third-Party Services */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">6. Third-Party Services</h2>
            <p className="mb-3">We rely on the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Supabase, Inc.:</strong> Database hosting,
                authentication, and file storage. Your data is stored with row-level security policies
                ensuring access is restricted to your account only.
              </li>
              <li>
                <strong className="text-gray-300">Stripe, Inc.:</strong> Payment processing. Stripe
                collects and processes your payment information in accordance with PCI DSS standards
                and their own privacy policy.
              </li>
              <li>
                <strong className="text-gray-300">Anthropic, PBC:</strong> AI document generation.
                Your resume and job description text are processed by Anthropic&apos;s Claude API
                solely for the purpose of generating your requested documents.
              </li>
              <li>
                <strong className="text-gray-300">Vercel, Inc.:</strong> Web application hosting
                and content delivery.
              </li>
            </ul>
            <p className="mt-3">
              Each third-party service operates under its own privacy policy and terms of service. We
              encourage you to review their policies.
            </p>
          </div>

          {/* 7. Cookies & Tracking */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">7. Cookies &amp; Tracking Technologies</h2>
            <p className="mb-3">
              We use only <strong className="text-white">essential cookies</strong> required for
              the Service to function:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Authentication Session Cookie:</strong> Maintains
                your login session. This is a first-party, httpOnly, secure cookie.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> use advertising cookies, third-party
              tracking pixels, social media tracking scripts, or analytics cookies that track you
              across websites. We do not participate in any ad networks.
            </p>
          </div>

          {/* 8. Data Retention */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">8. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Account Data:</strong> Retained for as long as your
                account is active. If you delete your account, we will remove your personal data within
                30 days.
              </li>
              <li>
                <strong className="text-gray-300">Generated Documents:</strong> Stored for as long as
                your account is active and you maintain a paid plan. Deleted when your account is deleted.
              </li>
              <li>
                <strong className="text-gray-300">Security Logs:</strong> IP addresses, rate limit
                events, and security audit logs are retained for up to 90 days for fraud prevention and
                then automatically purged.
              </li>
              <li>
                <strong className="text-gray-300">Legal Obligations:</strong> We may retain certain
                data beyond the above periods where required by applicable law (e.g., tax records,
                billing records).
              </li>
            </ul>
          </div>

          {/* 9. Data Security */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">9. Data Security</h2>
            <p className="mb-3">
              We implement industry-standard technical and organizational security measures, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Encryption of all data in transit using TLS 1.2+</li>
              <li>Row-level security (RLS) policies on our database ensuring users can only access their own data</li>
              <li>Rate limiting and IP-based abuse prevention</li>
              <li>Input validation and sanitization to prevent injection attacks</li>
              <li>Security event logging and anomaly detection</li>
              <li>Device session management with concurrent session limits</li>
              <li>Bcrypt password hashing (we never store plaintext passwords)</li>
            </ul>
            <p className="mt-3">
              Despite these measures, no method of electronic transmission or storage is 100% secure.
              We cannot guarantee absolute security and encourage you to use strong, unique passwords.
            </p>
          </div>

          {/* 10. Data Breach Notification */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">10. Data Breach Notification</h2>
            <p>
              In the event of a data breach that compromises the security of your personal information,
              we will notify affected users without unreasonable delay and no later than 60 days after
              discovery of the breach, as required by the Texas Identity Theft Enforcement and
              Protection Act (Tex. Bus. &amp; Com. Code &sect; 521.053). Notification will be made via
              email to the address associated with your account, or by conspicuous posting on our
              website if email notification is not feasible. We will also notify the Texas Attorney
              General if required by law.
            </p>
          </div>

          {/* 11. Your Rights Under TDPSA */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">11. Your Rights Under Texas Law (TDPSA)</h2>
            <p className="mb-3">
              If you are a Texas resident, the Texas Data Privacy and Security Act (TDPSA), effective
              July 1, 2024, grants you the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Right to Know:</strong> You may request confirmation of whether we process your personal data and access the specific data we hold about you.</li>
              <li><strong className="text-gray-300">Right to Correct:</strong> You may request correction of inaccurate personal data.</li>
              <li><strong className="text-gray-300">Right to Delete:</strong> You may request deletion of personal data you have provided to us.</li>
              <li><strong className="text-gray-300">Right to Data Portability:</strong> You may request a copy of your personal data in a portable, readily usable format.</li>
              <li><strong className="text-gray-300">Right to Opt Out:</strong> You may opt out of the processing of personal data for targeted advertising, the sale of personal data, or profiling that produces legal effects. <em>Note: We do not engage in any of these activities.</em></li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                support@resume-studio.io
              </a>
              . We will respond to your request within 45 days. If we need additional time, we will
              notify you of the extension (up to an additional 45 days) and the reason. We will not
              discriminate against you for exercising your TDPSA rights. If we deny your request, you
              may appeal by contacting us, and we will respond to the appeal within 60 days.
            </p>
          </div>

          {/* 12. Your Rights Under CCPA */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">12. Your Rights Under CCPA (California Residents)</h2>
            <p className="mb-3">
              If you are a California resident, the California Consumer Privacy Act (CCPA) and
              California Privacy Rights Act (CPRA) grant you the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Right to know what personal information we collect, use, disclose, and sell</li>
              <li>Right to request deletion of your personal information</li>
              <li>Right to opt out of the sale or sharing of your personal information (we do not sell or share your data)</li>
              <li>Right to correct inaccurate personal information</li>
              <li>Right to limit the use of sensitive personal information</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                support@resume-studio.io
              </a>
              .
            </p>
          </div>

          {/* 13. Your Rights Under GDPR */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">13. Your Rights Under GDPR (EEA Residents)</h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA), the General Data Protection
              Regulation (GDPR) grants you the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              Our legal basis for processing your data is: (a) contract performance (providing the
              Service you requested), (b) legitimate interests (security, fraud prevention), and
              (c) your consent where applicable.
            </p>
          </div>

          {/* 14. Do Not Sell or Share */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">14. &quot;Do Not Sell or Share My Personal Information&quot;</h2>
            <p>
              We do not sell your personal information. We do not share your personal information for
              cross-context behavioral advertising. Because we do not engage in these practices, there
              is no need to opt out. However, if you wish to confirm this or have concerns, please
              contact us at{' '}
              <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                support@resume-studio.io
              </a>
              .
            </p>
          </div>

          {/* 15. Children's Privacy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">15. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for individuals under 16 years of age. We do not knowingly
              collect personal information from children under 16. If we become aware that we have
              collected personal data from a child under 16, we will take steps to promptly delete that
              information. If you believe a child has provided us with personal data, please contact us
              immediately.
            </p>
          </div>

          {/* 16. International Data Transfers */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">16. International Data Transfers</h2>
            <p>
              Our Service is operated from the United States. Your data may be transferred to and
              processed in the United States and other countries where our service providers
              (Supabase, Stripe, Anthropic, Vercel) maintain infrastructure. These jurisdictions may
              have different data protection laws than your country of residence. By using the Service,
              you consent to the transfer of your data to these jurisdictions. Where required by law,
              we ensure appropriate safeguards are in place for international transfers.
            </p>
          </div>

          {/* 17. Changes to This Policy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">17. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page and updating the &quot;Last
              updated&quot; date. For significant changes, we will provide additional notice via email
              to the address associated with your account. Your continued use of the Service after any
              changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* 18. Contact Us */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">18. Contact Us</h2>
            <p className="mb-3">
              If you have any questions about this Privacy Policy, wish to exercise your data rights,
              or have a privacy concern, please contact us:
            </p>
            <ul className="list-none space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Email:</strong>{' '}
                <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                  support@resume-studio.io
                </a>
              </li>
              <li><strong className="text-gray-300">Contact Form:</strong>{' '}
                <a href="/contact" className="text-brand hover:underline">
                  resume-studio.io/contact
                </a>
              </li>
              <li><strong className="text-gray-300">Mailing Address:</strong> Resume Studio, Frisco, TX 75034, United States</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
