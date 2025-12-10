import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Multilogin.io',
  description:
    'Learn how Multilogin.io collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices.',
};

export default function PrivacyPage() {
  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 1, 2024</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Multilogin.io (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect your privacy
            and are committed to protecting your personal data. This privacy policy explains how we collect,
            use, and safeguard your information when you use our browser profile management service.
          </p>
          <p>
            By using Multilogin.io, you agree to the collection and use of information in accordance with
            this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>
              <strong>Account Information:</strong> When you register, we collect your name, email address,
              and password (stored securely using industry-standard encryption).
            </li>
            <li>
              <strong>Payment Information:</strong> If you subscribe to a paid plan, we collect payment
              details through our secure payment processor (Stripe). We do not store your full credit card
              numbers on our servers.
            </li>
            <li>
              <strong>Profile Data:</strong> Browser profile configurations, fingerprint settings, and
              proxy configurations you create within the service.
            </li>
            <li>
              <strong>Communication:</strong> Information you provide when contacting our support team.
            </li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <ul>
            <li>
              <strong>Usage Data:</strong> Information about how you use our service, including features
              accessed, actions taken, and time spent.
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type, operating system, and device
              identifiers.
            </li>
            <li>
              <strong>Log Data:</strong> Server logs that record requests made to our service.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To provide, maintain, and improve our services</li>
            <li>To process transactions and send related information</li>
            <li>To send technical notices, updates, and security alerts</li>
            <li>To respond to your comments, questions, and support requests</li>
            <li>To monitor and analyze usage patterns and trends</li>
            <li>To detect, investigate, and prevent fraudulent transactions and abuse</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>4. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal
            data against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit using TLS 1.3</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and authentication requirements</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>
            Your data is stored on secure servers provided by Cloudflare, with data centers located in
            regions that comply with applicable data protection regulations.
          </p>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your
            information only in the following circumstances:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> With trusted third-party service providers who assist us
              in operating our service (e.g., payment processing, cloud hosting, analytics).
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, regulation, or legal process.
            </li>
            <li>
              <strong>Protection of Rights:</strong> To protect the rights, property, or safety of
              Multilogin.io, our users, or others.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of
              assets.
            </li>
          </ul>

          <h2>6. Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or incomplete data.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data.
            </li>
            <li>
              <strong>Portability:</strong> Request a copy of your data in a portable format.
            </li>
            <li>
              <strong>Objection:</strong> Object to certain processing of your data.
            </li>
            <li>
              <strong>Withdrawal:</strong> Withdraw consent where processing is based on consent.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@multilogin.io">privacy@multilogin.io</a>.
          </p>

          <h2>7. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and store
            certain information. You can instruct your browser to refuse all cookies or to indicate when
            a cookie is being sent.
          </p>
          <p>Types of cookies we use:</p>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for the operation of our service.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our
              service (we use privacy-focused Plausible Analytics).
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings and preferences.
            </li>
          </ul>

          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and maintained on servers located outside of your
            country of residence. We ensure that such transfers comply with applicable data protection
            laws and implement appropriate safeguards.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 18. We do not knowingly collect
            personal information from children. If we become aware that we have collected personal data
            from a child, we will take steps to delete that information.
          </p>

          <h2>10. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes for which
            it was collected, including to satisfy legal, accounting, or reporting requirements. When
            you delete your account, we will delete your personal data within 30 days, except for data
            we are required to retain for legal purposes.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by
            posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you
            to review this policy periodically for any changes.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us:
          </p>
          <ul>
            <li>
              Email: <a href="mailto:privacy@multilogin.io">privacy@multilogin.io</a>
            </li>
            <li>
              Address: Multilogin.io, 548 Market St, San Francisco, CA 94104, USA
            </li>
          </ul>

          <h2>13. California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have specific rights regarding your personal information
            under the California Consumer Privacy Act (CCPA). These include the right to know what personal
            information is collected, the right to delete personal information, and the right to opt-out
            of the sale of personal information. We do not sell personal information.
          </p>

          <h2>14. European Privacy Rights (GDPR)</h2>
          <p>
            If you are located in the European Economic Area (EEA), you have certain data protection rights
            under the General Data Protection Regulation (GDPR). The legal basis for processing your data
            includes: performance of a contract, legitimate interests, compliance with legal obligations,
            and your consent.
          </p>
        </div>
      </div>
    </div>
  );
}
