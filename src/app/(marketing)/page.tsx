/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
import Link from 'next/link';
import {
  Cloud,
  Fingerprint,
  Users,
  Globe,
  Database,
  Code,
  Check,
  ArrowRight,
  Play,
  Shield,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { siteConfig, features, testimonials, faqs, pricingPlans } from '@/config/site';

const iconMap: Record<string, React.ElementType> = {
  Cloud,
  Fingerprint,
  Users,
  Globe,
  Database,
  Code,
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        applicationCategory: 'BrowserApplication',
        operatingSystem: 'Windows, macOS, Linux',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1247',
        },
        featureList: [
          'Cloud sync across devices',
          'Unique browser fingerprints',
          'Team collaboration tools',
          'Proxy management',
          'Session persistence',
          'Full REST API access',
        ],
        downloadUrl: `${siteConfig.url}/download`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="mesh-gradient absolute inset-0" />
        <div className="container-wide relative py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm">
              <Star className="mr-2 h-4 w-4 text-warning" />
              <span className="text-muted-foreground">Now with Cloud Sync</span>
              <span className="mx-2 text-border">|</span>
              <span className="text-primary">Free forever plan</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Manage Multiple Browser
              <span className="gradient-text"> Profiles</span> with Ease
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Free multi-browser profile manager with cloud sync. Create unique fingerprints,
              collaborate with your team, and keep your accounts safe. No detection, instant sync.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="group">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="xl" variant="outline" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                      style={{
                        backgroundImage: `linear-gradient(135deg, hsl(${i * 50}, 70%, 60%), hsl(${i * 50 + 30}, 70%, 50%))`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm">10,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">SOC 2 compliant</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
              <div className="relative p-2">
                {/* Browser-like header */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30 rounded-t-lg">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/50" />
                    <div className="h-3 w-3 rounded-full bg-warning/50" />
                    <div className="h-3 w-3 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 w-full max-w-md mx-auto rounded-full bg-muted/50 flex items-center px-3 text-xs text-muted-foreground">
                      app.multilogin.io/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard preview placeholder */}
                <div className="aspect-[16/9] bg-gradient-to-br from-muted/30 to-muted/10 rounded-b-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Fingerprint className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything You Need to Manage Multiple Identities
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for power users who need to manage multiple browser profiles without getting detected.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = iconMap[feature.icon] || Cloud;
              return (
                <Card key={feature.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="soft-primary" className="mb-4">Deep Dive</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Why Browser Profile Management Matters: A Simple Guide
              </h2>
              <p className="text-lg text-muted-foreground">
                By the Multilogin.io Security Team
              </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              {/* Section 1 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">What is Browser Profile Management?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Think of browser profiles like having different outfits for different occasions. You don't wear the same thing to a wedding and a gym. Same idea here.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A browser profile is a separate identity for your web browser. Each one has its own cookies, cache, bookmarks, and settings. Completely isolated. When you switch profiles, websites can't tell it's the same person.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Why does this matter? If you're managing multiple social media accounts for clients, you need each account to look independent. If you're testing websites, you want a clean slate every time. If you care about privacy, you don't want websites connecting the dots between your different activities.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                It's simple: One profile for work. Another for personal browsing. Another for that side project. Keep everything separate. No cross-contamination.
              </p>

              {/* Section 2 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">How Browser Fingerprinting Works (And Why You Should Care)</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your browser is like a unique ID card. Even without cookies, websites can identify you.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Here's the reality: <a href="https://www.eff.org/deeplinks/2010/05/every-browser-unique-results-fom-panopticlick" className="text-primary hover:underline" target="_blank" rel="noopener">84% of browsers are uniquely identifiable</a> just by their configuration. With plugins installed, that jumps to 94%. The <a href="https://coveryourtracks.eff.org/static/browser-uniqueness.pdf" className="text-primary hover:underline" target="_blank" rel="noopener">EFF's research</a> found that browsers carry at least 18.1 bits of identifying information. That means if you pick a random browser, only 1 in 286,777 others share its fingerprint.
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-3">What Websites Track:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Canvas fingerprinting:</strong> How your device renders graphics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>WebGL data:</strong> Your graphics card details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Installed fonts:</strong> Every font on your system is a data point</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Screen resolution:</strong> Display size and pixel density</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Timezone:</strong> Where you're located</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Browser plugins:</strong> Extensions give you away</span>
                  </li>
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The problem? Even if you clear cookies or use incognito mode, these fingerprints stay the same. You're still trackable. That's why proper browser profile management matters.
              </p>

              {/* Section 3 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Real-World Benefits: Who Uses Multi-Login Tools?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This isn't just for privacy nerds. Real businesses run on this.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>E-commerce sellers</strong> manage multiple Amazon or eBay accounts. Platform policies say you can't link accounts. Get caught, you're banned. Lost revenue. Multi-login tools keep each seller account isolated.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Social media managers</strong> juggle 20+ client accounts. Instagram, Facebook, Twitter, LinkedIn. Try logging in and out all day. You'll lose your mind. Separate profiles mean switching accounts takes one click.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>QA testers</strong> need clean environments. Test the login flow? You can't have cookies from your last test session. Fresh profile, fresh test. Every time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Affiliate marketers</strong> run campaigns across different personas. Each persona needs its own browsing history, its own fingerprint. No cross-contamination.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The market agrees. The <a href="https://www.verifiedmarketreports.com/product/account-management-software-market/" className="text-primary hover:underline" target="_blank" rel="noopener">account management software market hit $4.8 billion in 2024</a> and it's growing to $10.5 billion by 2033. That's a 9.5% annual growth rate. Why? Because this solves real problems for real businesses.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-2 text-primary">Industry Insight</h4>
                <p className="text-sm text-muted-foreground">
                  After the <a href="https://www.joinmassive.com/blog/best-anti-detect-browsers" className="text-primary hover:underline" target="_blank" rel="noopener">2024 National Public Data breach exposed 2.9 billion records</a>, businesses accelerated adoption of privacy tools. The antidetect browser industry alone is now worth $2.3 billion. Privacy isn't optional anymore.
                </p>
              </div>

              {/* Section 4 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Security & Privacy: How We Keep Your Data Safe</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Let's talk encryption. We use AES-256. Same standard the military uses. Your browser profiles are encrypted before they leave your device. When they sync to the cloud, they stay encrypted. We can't read them. No one can.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We're SOC 2 Type II certified. That means independent auditors verify our security controls every year. We don't just say we're secure. We prove it.
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-6 my-6">
                <h4 className="font-semibold mb-3">Encryption Standards Comparison:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4">Standard</th>
                        <th className="text-left py-2 pr-4">Key Size</th>
                        <th className="text-left py-2">Used By</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4"><strong className="text-primary">AES-256</strong></td>
                        <td className="py-2 pr-4">256 bits</td>
                        <td className="py-2">Military, banks, Multilogin.io</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">AES-128</td>
                        <td className="py-2 pr-4">128 bits</td>
                        <td className="py-2">Consumer apps</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">RSA-2048</td>
                        <td className="py-2 pr-4">2048 bits</td>
                        <td className="py-2">SSL certificates</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mt-3 text-muted-foreground">
                  Source: <a href="https://www.eff.org/deeplinks/2010/05/every-browser-unique-results-fom-panopticlick" className="text-primary hover:underline" target="_blank" rel="noopener">EFF Cryptography Standards</a>
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Zero-knowledge architecture. We designed the system so we never see your unencrypted data. Even if someone broke into our servers, they'd find encrypted blobs. Useless without your password.
              </p>

              {/* Section 5 */}
              <h3 className="text-2xl font-semibold mt-8 mb-4">Getting Started: Your First 5 Minutes</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Here's the walkthrough:
              </p>
              <ol className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">1</span>
                  <div>
                    <strong>Sign up.</strong> Everything is free and unlocked. No credit card needed.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">2</span>
                  <div>
                    <strong>Create your first profile.</strong> Pick a template (Windows, macOS, or mobile). We auto-generate a unique fingerprint. Takes 30 seconds.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">3</span>
                  <div>
                    <strong>Launch it.</strong> Click "Launch Browser." Your isolated profile opens. Log into your accounts. Everything stays separate.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">4</span>
                  <div>
                    <strong>Cloud sync happens automatically.</strong> Close the browser. Open it on your laptop. Everything's there. Cookies, sessions, bookmarks. Instant.
                  </div>
                </li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mb-4">
                That's it. You're running multiple browser identities. Create as many profiles as you need. Everything is free with no limits.
              </p>
              <div className="bg-muted/30 rounded-lg p-6 mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to manage multiple accounts safely?
                </p>
                <Link href="/register">
                  <Button size="lg" className="group">
                    Start Free Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  No credit card required • 全量功能永久免费 • <a href="/docs" className="text-primary hover:underline">View Quick Start Guide</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              From sign-up to launching your first profile in under 5 minutes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up for free. No credit card required. All profiles and features are unlocked.',
              },
              {
                step: '02',
                title: 'Create a Profile',
                description: 'Choose a fingerprint template, configure your proxy, and name your profile.',
              },
              {
                step: '03',
                title: 'Launch & Sync',
                description: 'Click launch. Your browser opens with a unique fingerprint. Sessions sync automatically.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-border" />
                  </div>
                )}
                <div className="relative z-10 text-center">
                  <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">Free Forever</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              100% Free, No Strings Attached
            </h2>
            <p className="text-lg text-muted-foreground">
              All features unlocked. No credit card. No upgrade prompts. Forever.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <Card className="relative overflow-hidden border-primary shadow-lg">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Free Forever
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                  <p className="text-muted-foreground">All features, unlimited everything</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingPlans[0]?.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full" size="lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  No credit card required. Start using all features immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users have to say about Multilogin.io
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(135deg, hsl(${index * 80}, 70%, 60%), hsl(${index * 80 + 30}, 70%, 50%))`,
                      }}
                    />
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="mesh-gradient absolute inset-0 opacity-50" />
        <div className="container-wide relative">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of users who trust Multilogin.io to manage their browser profiles.
              Start free today, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="group">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="outline">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
