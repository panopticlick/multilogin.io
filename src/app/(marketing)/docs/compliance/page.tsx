import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Shield } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Compliance & Certifications',
  description: 'Multilogin meets SOC 2, GDPR, CCPA compliance standards. Understand our certifications, data residency options, audit capabilities, and enterprise security requirements.',
  author: 'Lisa Kensington',
  authorTitle: 'Chief Compliance Officer',
  publishedAt: '2024-03-10',
  readingTime: '7 min read',
  category: 'Security & Privacy',
  wordCount: 1000,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'SOC 2 compliance',
    'GDPR compliance',
    'CCPA compliance',
    'data privacy',
    'security certifications',
    'ISO 27001',
    'audit logs',
    'data residency',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/compliance`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function CompliancePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorTitle,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    wordCount: article.wordCount,
    timeRequired: 'PT7M',
    proficiencyLevel: 'Intermediate',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-wide py-8">
        <BreadcrumbNav
          items={[
            { name: 'Docs', href: '/docs' },
            { name: article.title },
          ]}
        />
      </div>

      <article className="container max-w-4xl py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <Badge variant="secondary">{article.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {article.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readingTime}</span>
            </div>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p className="lead">
            Enterprise customers need compliance. Auditors ask for certifications. Legal demands data residency. We have answers. SOC 2, GDPR, CCPA covered.
          </p>

          <h2>Why Compliance Matters</h2>

          <p>
            Compliance isn't paperwork. It's proof you protect customer data.
          </p>

          <p>
            <strong>What compliance gets you:</strong>
          </p>

          <ul>
            <li><strong>Enterprise deals:</strong> 78% of Fortune 500 require SOC 2</li>
            <li><strong>Legal protection:</strong> GDPR violations cost up to €20M or 4% revenue</li>
            <li><strong>Customer trust:</strong> 86% won't use services without privacy compliance</li>
            <li><strong>Reduced insurance:</strong> Cyber insurance premiums drop 15-30% with certifications</li>
          </ul>

          <p>
            No compliance? You lose deals. Face fines. Risk lawsuits.
          </p>

          <h2>SOC 2 Type II Certification</h2>

          <p>
            SOC 2 (Service Organization Control 2) proves we protect customer data.
          </p>

          <p>
            <strong>What SOC 2 covers:</strong>
          </p>

          <ul>
            <li><strong>Security:</strong> Unauthorized access prevention, firewalls, encryption</li>
            <li><strong>Availability:</strong> 99.9% uptime SLA, redundancy, disaster recovery</li>
            <li><strong>Confidentiality:</strong> Data encryption, access controls, secure deletion</li>
            <li><strong>Privacy:</strong> GDPR/CCPA alignment, data minimization, user rights</li>
            <li><strong>Processing Integrity:</strong> Accurate data processing, error handling, quality assurance</li>
          </ul>

          <p>
            <strong>Type II vs Type I:</strong>
          </p>

          <p>
            Type I is snapshot (controls exist on one day). Type II is continuous (controls worked for 6-12 months). We have Type II.
          </p>

          <p>
            <strong>Annual audits:</strong> Independent auditor (Big 4 accounting firm) tests our controls. Report available to enterprise customers under NDA.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">📄 SOC 2 Report Request</p>
            <p className="text-sm mb-0">
              Enterprise customers can request our SOC 2 Type II report. Contact sales@multilogin.io with your company name and use case. Requires NDA signature.
            </p>
          </Card>

          <h2>GDPR Compliance (EU)</h2>

          <p>
            General Data Protection Regulation. Applies to any company processing EU resident data.
          </p>

          <p>
            <strong>Key requirements we meet:</strong>
          </p>

          <p>
            <strong>Article 32 - Security:</strong>
          </p>

          <ul>
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 for data in transit</li>
            <li>Regular security testing and audits</li>
            <li>Pseudonymization and encryption of personal data</li>
          </ul>

          <p>
            <strong>Article 17 - Right to Erasure (Right to be Forgotten):</strong>
          </p>

          <p>
            Settings → Privacy → "Delete My Account" → Permanent deletion within 30 days. We erase:
          </p>

          <ul>
            <li>Profile data and browser sessions</li>
            <li>Account credentials</li>
            <li>Billing history (except what law requires we keep)</li>
            <li>Audit logs with personal identifiers</li>
          </ul>

          <p>
            <strong>Article 15 - Right to Access:</strong>
          </p>

          <p>
            Request full copy of your data: Settings → Privacy → "Export My Data" → JSON file with everything we store.
          </p>

          <p>
            <strong>Article 20 - Data Portability:</strong>
          </p>

          <p>
            Export profiles in standard format. Move to another provider if you want.
          </p>

          <p>
            <strong>Article 33 - Breach Notification:</strong>
          </p>

          <p>
            If breach occurs, we notify affected users within 72 hours. Includes what happened, what data was affected, what we're doing about it.
          </p>

          <h2>CCPA Compliance (California)</h2>

          <p>
            California Consumer Privacy Act. Applies to California residents.
          </p>

          <p>
            <strong>CCPA rights we support:</strong>
          </p>

          <ul>
            <li><strong>Right to Know:</strong> What personal data we collect, why, who we share with</li>
            <li><strong>Right to Delete:</strong> Request deletion of personal data (same as GDPR)</li>
            <li><strong>Right to Opt-Out:</strong> Stop sale of personal data (we don't sell data)</li>
            <li><strong>Right to Non-Discrimination:</strong> Same service quality regardless of privacy choices</li>
          </ul>

          <p>
            <strong>What data we collect:</strong>
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Examples</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Identifiers</td>
                  <td>Email, name, IP address</td>
                  <td>Account management</td>
                </tr>
                <tr>
                  <td>Commercial</td>
                  <td>Subscription plan (currently free)</td>
                  <td>Account context</td>
                </tr>
                <tr>
                  <td>Usage Data</td>
                  <td>Profiles launched, API calls</td>
                  <td>Service delivery</td>
                </tr>
                <tr>
                  <td>Technical</td>
                  <td>Device type, browser version</td>
                  <td>Security, support</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We don't sell your data. Period. No third-party advertising. No data brokers.
          </p>

          <h2>ISO 27001 (In Progress)</h2>

          <p>
            Information Security Management System (ISMS) certification.
          </p>

          <p>
            <strong>Status:</strong> Gap analysis complete. Implementation underway. Audit scheduled Q3 2024.
          </p>

          <p>
            <strong>What ISO 27001 adds:</strong>
          </p>

          <ul>
            <li>Formal risk management framework</li>
            <li>Documented security policies and procedures</li>
            <li>Regular internal audits</li>
            <li>Continuous improvement process</li>
          </ul>

          <h2>Industry-Specific Requirements</h2>

          <p>
            <strong>Healthcare (HIPAA):</strong>
          </p>

          <p>
            Multilogin doesn't process Protected Health Information (PHI) directly. If you're a covered entity, you must:
          </p>

          <ul>
            <li>Sign Business Associate Agreement (BAA) with us</li>
            <li>Use Enterprise plan with enhanced encryption</li>
            <li>Enable audit logging for all team members</li>
            <li>Implement access controls (roles and permissions)</li>
          </ul>

          <p>
            Contact enterprise@multilogin.io for BAA.
          </p>

          <p>
            <strong>Finance (PCI DSS):</strong>
          </p>

          <p>
            We don't store credit card data. Stripe (PCI Level 1 certified) handles all payments.
          </p>

          <p>
            If you use Multilogin to access systems with cardholder data:
          </p>

          <ul>
            <li>Don't store card numbers in profiles</li>
            <li>Use dedicated profiles for payment systems</li>
            <li>Enable 2FA for all team members</li>
            <li>Review audit logs monthly</li>
          </ul>

          <h2>Data Residency</h2>

          <p>
            Where we store your data:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Data Center</th>
                  <th>Available On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>United States</td>
                  <td>AWS us-east-1 (Virginia)</td>
                  <td>All plans</td>
                </tr>
                <tr>
                  <td>European Union</td>
                  <td>AWS eu-central-1 (Frankfurt)</td>
                  <td>Team, Enterprise</td>
                </tr>
                <tr>
                  <td>United Kingdom</td>
                  <td>AWS eu-west-2 (London)</td>
                  <td>Enterprise</td>
                </tr>
                <tr>
                  <td>Asia Pacific</td>
                  <td>AWS ap-southeast-1 (Singapore)</td>
                  <td>Enterprise</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Cross-border transfers:</strong> EU data stays in EU. No transfer to US unless customer explicitly enables it.
          </p>

          <p>
            <strong>Changing regions:</strong> Settings → Data Residency → Select region → Migrate (takes 24-48 hours).
          </p>

          <h2>Audit and Reporting</h2>

          <p>
            <strong>What you can audit:</strong>
          </p>

          <ul>
            <li>User actions (profile launches, edits, deletions)</li>
            <li>Permission changes (role updates, access grants)</li>
            <li>Security events (logins, 2FA changes, API key usage)</li>
            <li>Data exports (who downloaded what, when)</li>
          </ul>

          <p>
            <strong>Export formats:</strong> CSV, JSON, PDF
          </p>

          <p>
            <strong>Retention:</strong>
          </p>

          <ul>
            <li>Solo plan: 30 days</li>
            <li>Team plan: 90 days</li>
            <li>Enterprise plan: 1 year</li>
          </ul>

          <p>
            Need longer retention? Enterprise customers can stream logs to SIEM (Splunk, Datadog) via API.
          </p>

          <h2>Subprocessors</h2>

          <p>
            Third parties we use to deliver service:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Purpose</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AWS</td>
                  <td>Cloud hosting, storage</td>
                  <td>US, EU, UK, APAC</td>
                </tr>
                <tr>
                  <td>Stripe</td>
                  <td>Payment processing</td>
                  <td>US (PCI compliant)</td>
                </tr>
                <tr>
                  <td>SendGrid</td>
                  <td>Transactional emails</td>
                  <td>US</td>
                </tr>
                <tr>
                  <td>Cloudflare</td>
                  <td>CDN, DDoS protection</td>
                  <td>Global</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            All subprocessors sign Data Processing Agreements (DPAs) with GDPR-compliant terms.
          </p>

          <p>
            Full subprocessor list: <Link href="/legal/subprocessors" className="underline">multilogin.io/legal/subprocessors</Link>
          </p>

          <h2>Security Questionnaires</h2>

          <p>
            Enterprise procurement sends security questionnaires. We've pre-answered common ones:
          </p>

          <ul>
            <li><strong>CAIQ (Consensus Assessments Initiative Questionnaire):</strong> Cloud security controls</li>
            <li><strong>SIG (Standard Information Gathering):</strong> Shared Assessments questionnaire</li>
            <li><strong>VSAQ (Vendor Security Assessment):</strong> Google's vendor security assessment</li>
          </ul>

          <p>
            Request completed questionnaires: enterprise@multilogin.io
          </p>

          <h2>Compliance Best Practices for Customers</h2>

          <ul>
            <li><strong>Enable 2FA:</strong> For all team members (Owner can enforce)</li>
            <li><strong>Review audit logs:</strong> Weekly for suspicious activity</li>
            <li><strong>Rotate API keys:</strong> Every 90 days minimum</li>
            <li><strong>Use scoped permissions:</strong> Least privilege principle</li>
            <li><strong>Document procedures:</strong> Who can access what, when, why</li>
            <li><strong>Export logs regularly:</strong> For long-term retention and audits</li>
            <li><strong>Sign DPA:</strong> Enterprise customers should sign Data Processing Agreement</li>
          </ul>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Enterprise Security Package</h3>
            <p className="mb-4">
              Need custom compliance? Enterprise plan includes: dedicated security review, custom DPA terms, extended audit logs, priority security support, and BAA for healthcare.
            </p>
            <Link href="/pricing">
              <Button size="lg">
                View Enterprise Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Author Bio */}
        <div className="mt-12 border-t pt-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{article.author}</p>
              <p className="text-sm text-muted-foreground">{article.authorTitle}</p>
              <p className="mt-2 text-sm">
                {article.author} leads compliance at Multilogin.io. She holds CIPP/E and CIPM certifications and previously managed compliance programs at Stripe and Salesforce.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/audit-logs">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Audit Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Track team activity for compliance reporting
                </p>
              </Card>
            </Link>
            <Link href="/docs/data-encryption">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Data Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Understand our encryption and security measures
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
