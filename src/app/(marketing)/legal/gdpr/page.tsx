import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileText, User, Download, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'GDPR Compliance - Your Data Rights',
  description: 'Learn about your data rights under GDPR and how Multilogin.io protects your privacy.',
};

const rights = [
  {
    icon: User,
    title: 'Right to Access',
    description: 'You can request a copy of all personal data we hold about you at any time.',
  },
  {
    icon: FileText,
    title: 'Right to Rectification',
    description: 'You can request correction of inaccurate or incomplete personal data.',
  },
  {
    icon: Trash2,
    title: 'Right to Erasure',
    description: 'You can request deletion of your personal data (right to be forgotten).',
  },
  {
    icon: Download,
    title: 'Right to Portability',
    description: 'You can request your data in a machine-readable format to transfer elsewhere.',
  },
];

export default function GDPRPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[
          { name: 'Legal', href: '/legal/privacy' },
          { name: 'GDPR', href: '/legal/gdpr' },
        ]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">GDPR Compliance</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Your Data, Your Rights
          </h1>
          <p className="text-lg text-muted-foreground">
            Multilogin.io is fully compliant with the General Data Protection Regulation (GDPR).
            Here is how we protect your privacy and uphold your rights.
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-12 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Our Commitment to GDPR</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The GDPR is a regulation in EU law on data protection and privacy. It gives
                  individuals control over their personal data and simplifies the regulatory
                  environment for international business.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At Multilogin.io, we have implemented comprehensive measures to ensure
                  compliance with GDPR requirements, including data minimization, encryption,
                  and transparent data processing practices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <div className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Your Rights Under GDPR</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {rights.map((right) => (
              <Card key={right.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <right.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{right.title}</h3>
                      <p className="text-sm text-muted-foreground">{right.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data We Collect */}
        <div className="mb-12 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">What Data We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Account Information</h3>
                  <p className="text-sm">Email address, name, and authentication credentials (hashed).</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Browser Profile Data</h3>
                  <p className="text-sm">Fingerprint configurations, session data (encrypted), and profile settings.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Usage Data</h3>
                  <p className="text-sm">Anonymous analytics to improve our service (can be opted out).</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Support Communications</h3>
                  <p className="text-sm">Messages you send to our support team.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Protection */}
        <div className="mb-12 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">How We Protect Your Data</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Encryption:</strong> All data is encrypted at rest (AES-256) and in transit (TLS 1.3).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Data Minimization:</strong> We only collect data necessary for service operation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Access Controls:</strong> Strict access controls limit who can access your data.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Regular Audits:</strong> We conduct regular security audits and penetration testing.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Your Rights */}
        <Card className="max-w-4xl mx-auto bg-muted/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Exercise Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  To exercise any of your GDPR rights, including data access, correction, or deletion,
                  please contact our Privacy team:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`mailto:${siteConfig.contact.privacy}`}>
                    <Button>
                      Contact Privacy Team
                    </Button>
                  </Link>
                  <Link href="/privacy">
                    <Button variant="outline">
                      Read Privacy Policy
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  We will respond to your request within 30 days as required by GDPR.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
