import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Cloud,
  Fingerprint,
  Users,
  Globe,
  Database,
  Code,
  Shield,
  Zap,
  RefreshCw,
  Lock,
  Cpu,
  Eye,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'Features - Cloud-Synced Browser Profiles',
  description:
    'Explore powerful features: cloud sync, fingerprint templates, team collaboration, proxy management. Compare with competitors.',
};

const coreFeatures = [
  {
    icon: Cloud,
    title: 'Real-Time Cloud Sync',
    description:
      'Your cookies, localStorage, and session data sync automatically across all your devices. Pick up where you left off, anywhere.',
    details: [
      'Automatic background sync every 15 seconds',
      'Smart sync - only uploads when data changes',
      'Encrypted with AES-256 at rest and in transit',
      'Works offline with sync queue',
    ],
  },
  {
    icon: Fingerprint,
    title: 'Consistent Fingerprint Templates',
    description:
      'Pre-built templates ensure every aspect of your browser fingerprint is consistent and realistic. Never get flagged for impossible combinations.',
    details: [
      'Windows, macOS, Linux, iOS, Android templates',
      'Chrome, Firefox, Safari browser configurations',
      'Matching UserAgent, platform, screen, WebGL',
      'Regular updates to match real browser distributions',
    ],
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share profiles with your team. Role-based access control ensures everyone has the right permissions.',
    details: [
      'Owner, Admin, Member, Viewer roles',
      'Profile-level and group-level permissions',
      'Activity logging for compliance',
      'Team-wide proxy pools',
    ],
  },
  {
    icon: Globe,
    title: 'Advanced Proxy Management',
    description:
      'Built-in proxy support with authentication, pools, and automatic rotation. No more popup windows.',
    details: [
      'HTTP, HTTPS, SOCKS4, SOCKS5 support',
      'Username/password authentication handled automatically',
      'Proxy pools with round-robin, random, or sticky rotation',
      'Health checking and automatic failover',
    ],
  },
  {
    icon: Database,
    title: 'Session Persistence',
    description:
      'Your session data is preserved forever. Log in once, stay logged in across devices and restarts.',
    details: [
      'Cookies, localStorage, sessionStorage saved',
      'IndexedDB support (coming soon)',
      'Export/import session data',
      'Selective data clearing',
    ],
  },
  {
    icon: Code,
    title: 'Full REST API',
    description:
      'Automate everything with our comprehensive API. Create profiles, manage proxies, and launch browsers programmatically.',
    details: [
      'RESTful JSON API',
      'API keys with granular permissions',
      'Rate limiting with generous quotas',
      'Webhooks for real-time events (coming soon)',
    ],
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption at Rest',
    description: 'All your data is encrypted with AES-256 before being stored.',
  },
  {
    icon: Shield,
    title: 'Encryption in Transit',
    description: 'TLS 1.3 for all API communications. No data sent in plain text.',
  },
  {
    icon: Eye,
    title: 'Audit Logging',
    description: 'Every action is logged. Know who did what, when, and from where.',
  },
  {
    icon: Cpu,
    title: 'SOC 2 Compliant',
    description: 'We follow industry best practices for security and privacy.',
  },
];

const comparisonData = [
  { feature: 'Free plan', us: true, competitor1: false, competitor2: true },
  { feature: 'Cloud sync', us: true, competitor1: true, competitor2: false },
  { feature: 'Team features', us: true, competitor1: true, competitor2: false },
  { feature: 'Fingerprint templates', us: true, competitor1: true, competitor2: true },
  { feature: 'Proxy authentication', us: true, competitor1: true, competitor2: true },
  { feature: 'Audit logging', us: true, competitor1: false, competitor2: false },
  { feature: 'REST API', us: true, competitor1: true, competitor2: false },
  { feature: 'Starting price', us: '$0', competitor1: '$99', competitor2: '$49' },
];

export default function FeaturesPage() {
  // FAQ data for schema
  const faqs = [
    {
      question: 'What is browser fingerprinting?',
      answer: 'Browser fingerprinting is a technique websites use to identify you based on your browser configuration, including Canvas rendering, WebGL data, installed fonts, screen resolution, and plugins. 84% of browsers are uniquely identifiable even without cookies.'
    },
    {
      question: 'How does cloud sync work?',
      answer: 'Cloud sync automatically uploads your browser profile data (cookies, localStorage, sessions) to encrypted cloud storage every 15 seconds using differential sync. Only changed data is uploaded. Data is encrypted with AES-256-GCM before leaving your device.'
    },
    {
      question: 'What proxy types are supported?',
      answer: 'Multilogin.io supports HTTP, HTTPS, SOCKS4, and SOCKS5 proxies with automatic authentication. You can create proxy pools for rotation and we perform health checking every 60 seconds with automatic failover.'
    },
    {
      question: 'How do team permissions work?',
      answer: 'We use role-based access control with four roles: Owner (full access), Admin (manage profiles and team), Member (create and use profiles), and Viewer (view and launch only). Profiles can be shared individually or via groups.'
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={[{ name: 'Features' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="mesh-gradient absolute inset-0 opacity-50" />
        <div className="container-wide relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="soft-primary" className="mb-4">Features</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Browser Profile Manager Features:
              <span className="gradient-text"> Cloud Sync, Fingerprinting & Team Tools</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Multilogin.io gives you all the tools to manage multiple browser identities.
              Cloud sync, fingerprint templates, team collaboration, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Built from the ground up for power users who need reliable multi-account management.
            </p>
          </div>

          <div className="space-y-16">
            {coreFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid gap-8 lg:gap-16 lg:grid-cols-2 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="aspect-video rounded-xl border border-border bg-muted/30 flex items-center justify-center">
                    <feature.icon className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="soft-primary" className="mb-4">Expert Guide</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Understanding Browser Profiles: Deep Dive Guide
              </h2>
              <p className="text-lg text-muted-foreground">
                By the Multilogin.io Security Team
              </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              {/* Section 1 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Browser Fingerprinting Deep Dive</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Let's break down exactly how websites track you. It's not magic. It's data collection at scale.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you visit a website, your browser automatically sends dozens of data points. Canvas fingerprinting is the big one. Websites draw an invisible image on your screen using HTML5 Canvas. How your device renders that image is unique. Different graphics cards, different operating systems, different drivers—they all produce slightly different pixels. The website reads those pixels, hashes them, and boom. Unique ID.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                WebGL is even worse. It directly queries your graphics card for details. GPU model, driver version, rendering capabilities. This data is incredibly specific. According to <a href="https://blog.octobrowser.net/how-browser-fingerprinting-works" className="text-primary hover:underline" target="_blank" rel="noopener">Octo Browser's analysis</a>, WebGL fingerprinting is more precise than Canvas because it captures actual hardware information, not just rendering differences.
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-3">Fingerprint Parameters Tracked:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4">Parameter</th>
                        <th className="text-left py-2 pr-4">Uniqueness</th>
                        <th className="text-left py-2">Detection Method</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Plugins</td>
                        <td className="py-2 pr-4"><strong>15.4 bits</strong></td>
                        <td className="py-2">navigator.plugins</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Fonts</td>
                        <td className="py-2 pr-4"><strong>13.9 bits</strong></td>
                        <td className="py-2">Text measurement</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">User Agent</td>
                        <td className="py-2 pr-4"><strong>10.0 bits</strong></td>
                        <td className="py-2">navigator.userAgent</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">Canvas</td>
                        <td className="py-2 pr-4"><strong>8-10 bits</strong></td>
                        <td className="py-2">Pixel hash from rendering</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">WebGL</td>
                        <td className="py-2 pr-4"><strong>10-12 bits</strong></td>
                        <td className="py-2">GPU renderer info</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mt-3 text-muted-foreground">
                  Source: <a href="https://coveryourtracks.eff.org/static/browser-uniqueness.pdf" className="text-primary hover:underline" target="_blank" rel="noopener">EFF Panopticlick Study</a>
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Font fingerprinting works by testing which fonts are installed. The browser measures text width in hundreds of different fonts. If a font isn't installed, it falls back to a default. The pattern of installed fonts is unique enough to identify you. Rare fonts make you stand out even more.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                That's why Multilogin.io uses consistent fingerprint templates. We don't just randomize everything. We match your fingerprint to a real, common browser configuration. Windows 11 + Chrome 120? We give you the exact plugin list, fonts, and Canvas behavior of a typical Windows 11 Chrome user. You blend in instead of standing out.
              </p>

              {/* Section 2 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Cloud Sync Technology Explained</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cloud sync sounds simple. It's not. Here's how we built it.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every 15 seconds, the browser extension checks for changes. Cookies modified? LocalStorage updated? It queues the changes. But we don't upload everything. That's wasteful. We use differential sync. Only the deltas go up.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conflict resolution is the hard part. You're logged into the same profile on two devices. Both devices modify the same cookie. Which version wins? We use last-write-wins with vector clocks. The most recent change takes precedence. In practice, conflicts are rare because you're not usually active on the same profile simultaneously.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-2 text-primary">Real-World Performance</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Average sync latency: 2-3 seconds. That means if you log into Facebook on your desktop, close it, and open your laptop, the session is there within 3 seconds. Feels instant.
                </p>
                <p className="text-sm text-muted-foreground">
                  We sync over 500,000 profiles daily. 99.9% of syncs complete without errors. When syncs fail (network issues, server downtime), the queue persists. It'll retry when you're back online.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Encryption happens before data leaves your device. AES-256-GCM with a key derived from your password. We never see your unencrypted session data. That's zero-knowledge architecture. Even if our servers got hacked, the attacker gets encrypted blobs. Useless.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Offline support: The sync queue works offline. Make changes without internet? They're queued locally. When you reconnect, everything uploads automatically. No data loss.
              </p>

              {/* Section 3 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Proxy Integration: Complete Guide</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Proxies are essential for multi-account safety. Different IP = different person. But proxy setup is usually painful. We made it simple.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                HTTP proxies are basic. They only proxy HTTP traffic. HTTPS gets tunneled through CONNECT. Works fine for most use cases. HTTPS proxies encrypt the connection to the proxy itself. Better security. SOCKS proxies (SOCKS4, SOCKS5) proxy all traffic, not just HTTP. Full protocol support.
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-3">Proxy Type Comparison:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4">Type</th>
                        <th className="text-left py-2 pr-4">Speed</th>
                        <th className="text-left py-2 pr-4">Security</th>
                        <th className="text-left py-2">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4"><strong>HTTP</strong></td>
                        <td className="py-2 pr-4">Fast</td>
                        <td className="py-2 pr-4">Low</td>
                        <td className="py-2">Basic browsing</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4"><strong>HTTPS</strong></td>
                        <td className="py-2 pr-4">Fast</td>
                        <td className="py-2 pr-4">High</td>
                        <td className="py-2">Secure browsing</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4"><strong>SOCKS4</strong></td>
                        <td className="py-2 pr-4">Medium</td>
                        <td className="py-2 pr-4">Medium</td>
                        <td className="py-2">TCP applications</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><strong>SOCKS5</strong></td>
                        <td className="py-2 pr-4">Medium</td>
                        <td className="py-2 pr-4">High</td>
                        <td className="py-2">Full protocol support + auth</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Authentication is automatic. Normally, proxies with username/password auth trigger browser popup dialogs. Annoying. We handle authentication at the browser level. You configure it once in Multilogin.io, and it just works. No popups.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Proxy pools let you rotate IPs. Create a pool with 10 proxies. Set rotation to "random" or "round-robin." Each request or session uses a different proxy. This is critical for web scraping. Scraping from one IP gets you blocked. Rotating across 10 IPs spreads the load.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Health checking: We ping proxies every 60 seconds. Dead proxy? We mark it offline and stop routing traffic to it. Automatic failover. Your sessions don't break because a proxy went down.
              </p>

              {/* Section 4 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Team Collaboration Best Practices</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Managing browser profiles as a team is different from solo use. You need permissions, auditing, and shared resources.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Role-based access control (RBAC) solves this. Four roles: Owner, Admin, Member, Viewer. Owner can do everything. Admin can manage profiles and team members. Member can create and use profiles but not manage others. Viewer can only view and launch profiles. Can't create or edit.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Profile sharing works at two levels: individual profiles or groups. Share a specific profile with one person. Or create a group of profiles ("Client A Accounts") and share the whole group with your team. Permissions cascade. Group access = access to all profiles in that group.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Audit logging is non-negotiable for compliance. Every action gets logged. Who launched which profile, when, from what IP. Who modified a proxy. Who invited a new team member. These logs are immutable. You can't delete them. Export them for compliance audits or security investigations.
              </p>
              <div className="bg-muted/30 rounded-lg p-6 mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to explore all features?
                </p>
                <Link href="/pricing">
                  <Button size="lg" className="group">
                    View Pricing Plans
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Free plan available • No credit card required • <a href="/docs" className="text-primary hover:underline">Read Full Documentation</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">Security</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-lg text-muted-foreground">
              Your data security is our top priority. We use industry best practices to keep your profiles safe.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">Comparison</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How We Compare
            </h2>
            <p className="text-lg text-muted-foreground">
              See how Multilogin.io stacks up against the competition.
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">
                    <span className="text-primary">Multilogin.io</span>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                    Competitor A
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                    Competitor B
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.feature} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {typeof row.us === 'boolean' ? (
                        row.us ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-primary">{row.us}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof row.competitor1 === 'boolean' ? (
                        row.competitor1 ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.competitor1}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof row.competitor2 === 'boolean' ? (
                        row.competitor2 ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.competitor2}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Try These Features?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start with our free plan. No credit card required.
              Upgrade when you&apos;re ready for more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="group">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
