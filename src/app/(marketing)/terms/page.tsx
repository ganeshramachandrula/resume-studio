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
          <p className="text-gray-400">Last updated: February 19, 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. Agreement to Terms */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">1. Agreement to Terms</h2>
            <p className="mb-3">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between
              you (&quot;you&quot; or &quot;User&quot;) and Resume Studio, a sole proprietorship based in
              Frisco, Texas, United States (&quot;Resume Studio,&quot; &quot;we,&quot; &quot;our,&quot;
              or &quot;us&quot;), governing your access to and use of the Resume Studio web application,
              browser extension, and all related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="mb-3">
              By creating an account, accessing, or using the Service, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and our{' '}
              <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>, which is
              incorporated herein by reference. If you do not agree to these Terms, you must not access
              or use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by posting the updated Terms on this page, updating the &quot;Last updated&quot;
              date, and sending an email to the address associated with your account. Your continued use
              of the Service after such changes constitutes acceptance of the revised Terms. If you do
              not agree with the modified Terms, you must discontinue use of the Service.
            </p>
          </div>

          {/* 2. Eligibility */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">2. Eligibility</h2>
            <p>
              You must be at least 16 years of age to use the Service. By using the Service, you represent
              and warrant that you are at least 16 years old, that you have the legal capacity to enter
              into these Terms, and that your use of the Service does not violate any applicable law or
              regulation. If you are using the Service on behalf of an organization, you represent and
              warrant that you have authority to bind that organization to these Terms.
            </p>
          </div>

          {/* 3. Service Description */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">3. Service Description</h2>
            <p>
              Resume Studio is a web-based application that uses artificial intelligence to generate
              tailored career documents, including resumes, cover letters, LinkedIn summaries, cold
              outreach emails, interview preparation guides, certification guides, and country-specific
              resumes. The Service also provides AI-powered career coaching, a job aggregator feed, a
              job application tracker, a credential vault, a cost of living comparator, and a browser
              extension for capturing job descriptions. The AI features are powered by third-party large
              language models.
            </p>
          </div>

          {/* 4. Account Registration & Security */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">4. Account Registration &amp; Security</h2>
            <p className="mb-3">
              To use the Service, you must create an account using a valid email address or a
              supported third-party authentication provider (Google or GitHub). You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain and promptly update your account information to keep it accurate</li>
              <li>Maintain the confidentiality of your login credentials and not share them with any third party</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately at{' '}
                <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                  support@resume-studio.io
                </a>{' '}
                of any unauthorized access to or use of your account
              </li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that contain inaccurate information
              or that we reasonably believe have been compromised.
            </p>
          </div>

          {/* 5. Subscription Plans & Billing */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">5. Subscription Plans &amp; Billing</h2>
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
                applications, and all standard resume templates.
              </li>
              <li>
                <strong className="text-gray-300">Pro Annual ($79/year):</strong> All Pro Monthly
                features plus premium resume templates, AI-powered career coaching, country-specific
                resume generation, and multi-language support.
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
            <p className="mt-3 mb-3">
              All prices are in U.S. dollars and may be subject to applicable taxes. We reserve the
              right to change our pricing with 30 days&apos; advance notice. Price changes will not
              affect active subscription periods.
            </p>
            <p>
              Paid subscriptions are billed through Stripe, Inc. By subscribing, you authorize us to
              charge your payment method on a recurring basis (monthly or annually, depending on your
              plan) until you cancel. Subscriptions automatically renew at the end of each billing
              period unless you cancel before the renewal date. You can manage your subscription,
              update payment methods, and cancel at any time through the billing portal accessible
              from your account settings.
            </p>
          </div>

          {/* 6. Cancellation & Refund Policy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">6. Cancellation &amp; Refund Policy</h2>
            <p className="mb-3">
              You may cancel your subscription at any time through the billing portal. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>You will retain access to paid features until the end of your current billing period</li>
              <li>Your account will revert to the Free plan at the end of the billing period</li>
              <li>No partial refunds will be issued for unused time within a billing period</li>
            </ul>
            <p className="mt-3">
              Subscription payments are non-refundable except where required by applicable law. Credit
              pack purchases are non-refundable once any credits from that pack have been used. If you
              believe you have been billed in error, please contact us at{' '}
              <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">
                support@resume-studio.io
              </a>{' '}
              within 30 days of the charge.
            </p>
          </div>

          {/* 7. AI-Generated Content */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">7. AI-Generated Content</h2>
            <p className="mb-3">
              Documents and content generated by Resume Studio are created using third-party artificial
              intelligence technology and are provided as a starting point to assist you with your
              career document preparation. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>AI-generated content may contain inaccuracies, errors, or omissions</li>
              <li>You are solely responsible for reviewing, editing, verifying, and approving all generated content before use</li>
              <li>You must not submit AI-generated content that you know to be false or misleading to any employer, institution, or third party</li>
              <li>We do not guarantee that generated content will result in any particular outcome, including but not limited to job interviews, employment offers, or career advancement</li>
              <li>AI-generated career coaching advice is informational only and does not constitute professional career counseling, legal advice, or employment guidance</li>
            </ul>
            <p className="mt-3">
              RESUME STUDIO DISCLAIMS ALL LIABILITY FOR ANY CONSEQUENCES ARISING FROM YOUR USE OF
              AI-GENERATED CONTENT, INCLUDING BUT NOT LIMITED TO ADVERSE EMPLOYMENT OUTCOMES,
              MISREPRESENTATIONS, OR RELIANCE ON AI-GENERATED ADVICE.
            </p>
          </div>

          {/* 8. Intellectual Property */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">8. Intellectual Property</h2>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">8.1 Your Content</h3>
            <p className="text-gray-400">
              You retain ownership of the content you provide to the Service (resume text, work
              experience, job descriptions, credentials) and the documents generated from your content.
              By using the Service, you grant us a limited, non-exclusive license to process your content
              solely for the purpose of providing the Service to you.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">8.2 Our Property</h3>
            <p className="text-gray-400">
              Resume Studio retains all rights, title, and interest in and to the Service, including
              its design, source code, algorithms, AI prompts, templates, user interface, branding,
              trademarks, and documentation. You may not copy, modify, distribute, sell, lease,
              reverse-engineer, decompile, or create derivative works from any part of the Service
              without our prior written consent.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">8.3 Feedback</h3>
            <p className="text-gray-400">
              If you provide suggestions, ideas, or feedback about the Service, you grant us an
              unrestricted, irrevocable, perpetual, royalty-free license to use, implement, modify,
              and incorporate such feedback without obligation to you.
            </p>
          </div>

          {/* 9. Acceptable Use */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">9. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Use the Service for any unlawful, fraudulent, or deceptive purpose</li>
              <li>Submit false, misleading, or fraudulent information for document generation</li>
              <li>Attempt to gain unauthorized access to any part of the Service, other users&apos; accounts, or our infrastructure</li>
              <li>Use automated tools, bots, scrapers, or scripts to access the Service without our prior written permission</li>
              <li>Interfere with, disrupt, or place an unreasonable burden on the Service or its infrastructure</li>
              <li>Circumvent any usage limits, rate limits, access controls, or security measures</li>
              <li>Resell, redistribute, sublicense, or commercially exploit the Service or generated content without authorization</li>
              <li>Use the Service to generate content that is defamatory, obscene, harassing, or that violates any third-party rights</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Introduce viruses, malware, or other harmful code into the Service</li>
            </ul>
            <p className="mt-3">
              Violation of these terms may result in immediate suspension or termination of your account
              without notice or refund.
            </p>
          </div>

          {/* 10. Third-Party Services */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">10. Third-Party Services</h2>
            <p className="mb-3">
              The Service integrates with and relies upon third-party providers, including but not
              limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Supabase, Inc.:</strong> Database hosting, authentication, and data storage</li>
              <li><strong className="text-gray-300">Stripe, Inc.:</strong> Payment processing and subscription management</li>
              <li><strong className="text-gray-300">Anthropic, PBC:</strong> AI-powered document generation and career coaching</li>
              <li><strong className="text-gray-300">Vercel, Inc.:</strong> Web application hosting and content delivery</li>
              <li><strong className="text-gray-300">Third-party job APIs:</strong> Job listing data aggregation (Adzuna, JSearch, Findwork, Remotive, RemoteOK, Arbeitnow, TheMuse)</li>
            </ul>
            <p className="mt-3">
              These third-party services operate under their own terms and privacy policies. We are not
              responsible for the availability, accuracy, or practices of third-party services. Your use
              of the Service constitutes acceptance of the applicable third-party terms.
            </p>
          </div>

          {/* 11. Job Listings & External Content */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">11. Job Listings &amp; External Content</h2>
            <p>
              The job feed feature aggregates listings from third-party job board APIs. We do not
              create, verify, or endorse any job listings displayed in the Service. We make no
              representations or warranties regarding the accuracy, legitimacy, or completeness of
              any job listing. You acknowledge that you apply to jobs at your own risk and that Resume
              Studio is not a party to any employment relationship or job application process. The
              job sites directory provides links to third-party websites for informational purposes only.
            </p>
          </div>

          {/* 12. Data & Privacy */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">12. Data &amp; Privacy</h2>
            <p>
              Your use of the Service is governed by our{' '}
              <a href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </a>
              , which describes how we collect, use, disclose, and protect your personal information.
              By using the Service, you consent to the practices described in our Privacy Policy. The
              Privacy Policy is incorporated into and forms part of these Terms.
            </p>
          </div>

          {/* 13. Disclaimer of Warranties */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">13. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
              NON-INFRINGEMENT. WITHOUT LIMITING THE FOREGOING, WE DO NOT WARRANT THAT: (A) THE
              SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL
              COMPONENTS; (B) THE RESULTS OBTAINED FROM THE SERVICE WILL BE ACCURATE, RELIABLE, OR
              MEET YOUR REQUIREMENTS; (C) ANY AI-GENERATED CONTENT WILL BE FREE FROM ERRORS,
              INACCURACIES, OR OMISSIONS; OR (D) ANY DEFECTS IN THE SERVICE WILL BE CORRECTED. YOUR
              USE OF THE SERVICE IS AT YOUR OWN RISK. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION
              OF IMPLIED WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.
            </p>
          </div>

          {/* 14. Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">14. Limitation of Liability</h2>
            <p className="mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL RESUME STUDIO, ITS
              OWNER, OPERATORS, AFFILIATES, AGENTS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
              LIMITED TO DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS OPPORTUNITIES,
              OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Your use of or inability to use the Service</li>
              <li>Any AI-generated content or reliance thereon</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Conduct or content of any third party on the Service</li>
              <li>Any other matter relating to the Service</li>
            </ul>
            <p className="mt-3">
              OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR
              THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT YOU PAID TO US IN THE
              TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B)
              FIFTY U.S. DOLLARS ($50.00). THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL THEORY ON
              WHICH THE CLAIM IS BASED, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT
              LIABILITY, OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </div>

          {/* 15. Indemnification */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">15. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Resume Studio, its owner, operators,
              affiliates, agents, and service providers from and against any and all claims, damages,
              obligations, losses, liabilities, costs, and expenses (including reasonable
              attorneys&apos; fees) arising from: (a) your use of or access to the Service; (b) your
              violation of these Terms; (c) your violation of any third-party right, including any
              intellectual property, privacy, or proprietary right; (d) any content you submit to the
              Service; or (e) your use or misuse of AI-generated content. This indemnification obligation
              shall survive the termination of these Terms and your use of the Service.
            </p>
          </div>

          {/* 16. Dispute Resolution & Arbitration */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">16. Dispute Resolution &amp; Arbitration</h2>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">16.1 Informal Resolution</h3>
            <p className="text-gray-400 mb-3">
              Before filing any formal legal action, you agree to first attempt to resolve any dispute,
              claim, or controversy arising out of or relating to these Terms or the Service
              (&quot;Dispute&quot;) informally by contacting us at{' '}
              <a href="mailto:legal@resume-studio.io" className="text-brand hover:underline">
                legal@resume-studio.io
              </a>
              . We will attempt to resolve the Dispute informally within 60 days. If the Dispute is not
              resolved within 60 days, either party may proceed to binding arbitration as described below.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">16.2 Binding Arbitration</h3>
            <p className="text-gray-400 mb-3">
              If a Dispute cannot be resolved informally, you and Resume Studio agree to resolve the
              Dispute through final and binding individual arbitration administered by the American
              Arbitration Association (&quot;AAA&quot;) under its Consumer Arbitration Rules then in
              effect. The arbitration shall be conducted by a single arbitrator. The arbitration shall
              be held in Collin County, Texas, or at another mutually agreed location. The
              arbitrator&apos;s decision shall be final and binding and may be entered as a judgment in
              any court of competent jurisdiction.
            </p>
            <p className="text-gray-400 mb-3">
              The arbitrator shall have exclusive authority to resolve all Disputes, including
              the scope, enforceability, and arbitrability of this arbitration provision. However,
              either party may seek injunctive or other equitable relief in a court of competent
              jurisdiction to prevent the actual or threatened infringement or misappropriation of
              intellectual property rights.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">16.3 Arbitration Fees</h3>
            <p className="text-gray-400">
              If your claim is for $10,000 or less, we will pay all arbitration filing, administration,
              and arbitrator fees. If your claim exceeds $10,000, the allocation of fees will be governed
              by the AAA Consumer Arbitration Rules. Regardless of the amount in controversy, each party
              shall bear its own attorneys&apos; fees unless the arbitrator determines that a party&apos;s
              claim or defense was frivolous or brought for an improper purpose.
            </p>
          </div>

          {/* 17. Class Action Waiver */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">17. Class Action Waiver</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU AND RESUME STUDIO EACH AGREE THAT
              ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN
              A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU EXPRESSLY WAIVE YOUR RIGHT TO
              PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS ACTION OR REPRESENTATIVE
              PROCEEDING. If this class action waiver is found to be unenforceable, then the entirety of
              the arbitration provision in Section 16 shall be null and void (but the remaining Terms
              shall remain in effect).
            </p>
          </div>

          {/* 18. Account Termination */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">18. Account Termination</h2>
            <p className="mb-3">
              You may delete your account at any time through your account settings or by contacting us.
              We reserve the right to suspend or terminate your account, without prior notice or
              liability, if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>You violate these Terms or our Acceptable Use policies</li>
              <li>You engage in fraudulent, abusive, or illegal activity</li>
              <li>Your account has been inactive for more than 12 consecutive months (Free plan only)</li>
              <li>We are required to do so by law</li>
            </ul>
            <p className="mt-3">
              Upon termination, your right to use the Service ceases immediately. We may delete your
              data in accordance with our{' '}
              <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>. Sections
              of these Terms that by their nature should survive termination shall survive, including
              but not limited to Sections 7 (AI-Generated Content), 8 (Intellectual Property),
              13 (Disclaimer), 14 (Limitation of Liability), 15 (Indemnification), 16 (Dispute
              Resolution), and 17 (Class Action Waiver).
            </p>
          </div>

          {/* 19. Service Modifications */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">19. Service Modifications</h2>
            <p>
              We reserve the right to modify, update, suspend, or discontinue any part of the Service
              at any time, with or without notice. We will make commercially reasonable efforts to
              notify users of significant changes that materially reduce Service functionality. We are
              not liable for any modification, suspension, or discontinuation of the Service. If a paid
              feature you subscribe to is permanently removed, you may be entitled to a pro-rata refund
              for the unused portion of your subscription.
            </p>
          </div>

          {/* 20. Force Majeure */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">20. Force Majeure</h2>
            <p>
              We shall not be liable for any failure or delay in performing our obligations under these
              Terms due to causes beyond our reasonable control, including but not limited to: acts of
              God, natural disasters, pandemics, war, terrorism, civil unrest, government actions,
              internet or telecommunications failures, power outages, cyberattacks, failures of
              third-party service providers (including Supabase, Stripe, Anthropic, and Vercel), or
              any other events beyond our reasonable control.
            </p>
          </div>

          {/* 21. Governing Law */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">21. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms and any Dispute arising out of or related to these Terms or the Service shall
              be governed by and construed in accordance with the laws of the State of Texas, without
              regard to its conflict of law provisions. To the extent that any lawsuit or court proceeding
              is permitted under these Terms (including claims exempt from arbitration), you and Resume
              Studio agree to submit to the exclusive personal jurisdiction of the state and federal
              courts located in Collin County, Texas. You waive any objection to jurisdiction and venue
              in such courts.
            </p>
          </div>

          {/* 22. Severability */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">22. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
              court of competent jurisdiction, such provision shall be modified to the minimum extent
              necessary to make it enforceable, or if modification is not possible, severed from these
              Terms. The remaining provisions shall continue in full force and effect. The invalidity
              or unenforceability of any provision in one jurisdiction shall not affect the validity or
              enforceability of that provision in any other jurisdiction.
            </p>
          </div>

          {/* 23. Entire Agreement */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">23. Entire Agreement</h2>
            <p>
              These Terms, together with the{' '}
              <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>,
              constitute the entire agreement between you and Resume Studio regarding the Service and
              supersede all prior and contemporaneous agreements, representations, warranties, and
              understandings, whether oral or written. No waiver of any provision of these Terms shall
              be deemed a further or continuing waiver of such provision or any other provision, and our
              failure to assert any right or provision under these Terms shall not constitute a waiver
              of such right or provision.
            </p>
          </div>

          {/* 24. Assignment */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">24. Assignment</h2>
            <p>
              You may not assign, transfer, or delegate your rights or obligations under these Terms
              without our prior written consent. We may freely assign our rights and obligations under
              these Terms in connection with a merger, acquisition, sale of assets, or by operation of
              law, with notice to you. Any attempted assignment in violation of this section shall be
              null and void.
            </p>
          </div>

          {/* 25. Contact Information */}
          <div>
            <h2 className="text-2xl font-display text-white mb-3">25. Contact Information</h2>
            <p className="mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Email:</strong>{' '}
                <a href="mailto:legal@resume-studio.io" className="text-brand hover:underline">
                  legal@resume-studio.io
                </a>
              </li>
              <li><strong className="text-gray-300">Support:</strong>{' '}
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
