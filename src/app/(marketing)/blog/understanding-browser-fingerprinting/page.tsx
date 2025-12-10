import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browser Fingerprinting Explained: Complete 2024 Guide',
  description:
    'Learn how browser fingerprinting works, why 84% of browsers are uniquely trackable, and how to protect your online privacy. Expert guide with real data.',
};

const article = {
  title: 'Browser Fingerprinting Explained: Complete 2024 Guide',
  excerpt: 'Learn how websites track you through browser fingerprinting and how to protect your privacy.',
  author: 'Sarah Johnson',
  date: 'November 25, 2024',
  datePublished: '2024-11-25T00:00:00Z',
  dateModified: '2024-11-25T00:00:00Z',
  readTime: '9 min',
  category: 'Privacy',
  image: `${siteConfig.url}/blog/browser-fingerprinting.jpg`,
};

export default function BlogPost() {
  // JSON-LD Article schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/understanding-browser-fingerprinting`,
    },
    articleSection: article.category,
    wordCount: 1800,
    timeRequired: 'PT9M',
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        items={[
          { name: 'Blog', href: '/blog' },
          { name: 'Browser Fingerprinting Explained' },
        ]}
      />

      <article className="container py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <span className="text-sm text-muted-foreground">{article.readTime} read</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Every time you visit a website, you leave a unique digital fingerprint. 84% of browsers can be uniquely identified without cookies or IP addresses. This isn&apos;t science fiction. It&apos;s happening right now.
            </p>

            <h2>What is Browser Fingerprinting?</h2>
            <p>
              Browser fingerprinting is a tracking method that collects information about your browser configuration and device settings. Unlike cookies that you can delete, your fingerprint is derived from how your browser behaves.
            </p>
            <p>
              Think of it like this: Your browser is unique. The fonts you have installed. Your screen resolution. How your browser renders graphics. Combined, these data points create a fingerprint that&apos;s probably unique to you.
            </p>
            <p>
              According to research from the Electronic Frontier Foundation&apos;s Panopticlick project, 84% of browsers they tested had a unique fingerprint. That means out of every 100 people visiting a website, 84 can be individually tracked.
            </p>

            <h2>How Does Browser Fingerprinting Work?</h2>
            <p>
              Websites run JavaScript code in your browser that collects dozens of data points. Here&apos;s what they typically collect:
            </p>

            <Card className="p-6 my-6 bg-muted/30">
              <h3 className="font-semibold mb-4 text-lg">Common Fingerprinting Techniques</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4">Technique</th>
                      <th className="text-left py-2 pr-4">What It Tracks</th>
                      <th className="text-left py-2">Uniqueness</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><strong>Canvas Fingerprinting</strong></td>
                      <td className="py-2 pr-4">How your GPU renders graphics</td>
                      <td className="py-2">Very High</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><strong>WebGL</strong></td>
                      <td className="py-2 pr-4">Graphics card info, rendering capabilities</td>
                      <td className="py-2">Very High</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><strong>Font Detection</strong></td>
                      <td className="py-2 pr-4">Installed fonts on your system</td>
                      <td className="py-2">High</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><strong>Audio Context</strong></td>
                      <td className="py-2 pr-4">How your hardware processes audio</td>
                      <td className="py-2">High</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><strong>Screen Resolution</strong></td>
                      <td className="py-2 pr-4">Display dimensions, color depth</td>
                      <td className="py-2">Medium</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4"><strong>Browser Plugins</strong></td>
                      <td className="py-2 pr-4">Installed extensions and plugins</td>
                      <td className="py-2">Medium</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <h3>Canvas Fingerprinting: The Most Powerful Method</h3>
            <p>
              Canvas fingerprinting is sneaky. Websites draw invisible text or shapes on a hidden HTML canvas element. Your GPU and graphics drivers render it slightly differently than everyone else&apos;s. The website reads the pixels back and generates a hash.
            </p>
            <p>
              This hash is stable. It doesn&apos;t change unless you update your graphics drivers or switch hardware. That makes it perfect for long-term tracking.
            </p>
            <p>
              Research from Princeton&apos;s Web Census found canvas fingerprinting on 5.5% of the top 100,000 websites. That number has only grown since 2014.
            </p>

            <h3>WebGL: Even More Unique</h3>
            <p>
              WebGL goes deeper than Canvas. It queries your graphics card directly. Model number. Vendor. Supported extensions. Shader precision. All exposed to JavaScript.
            </p>
            <p>
              A 2020 study showed WebGL fingerprints are more stable and unique than Canvas. Fewer collisions. Better for tracking across sessions.
            </p>

            <h3>Font Fingerprinting</h3>
            <p>
              Your font list is surprisingly unique. Windows users have different default fonts than Mac users. Designers have extra fonts. Chinese users have Chinese fonts.
            </p>
            <p>
              Websites can test for hundreds of fonts in milliseconds. They render invisible text in each font and measure the dimensions. If the width changes, the font is installed.
            </p>
            <p>
              According to Panopticlick data, font fingerprinting contributes 13.9 bits of entropy to your overall fingerprint. That&apos;s enough to distinguish you from 15,000 other people.
            </p>

            <h2>Why Should You Care?</h2>
            <p>
              Privacy is the obvious answer. But there are practical concerns too.
            </p>

            <h3>Price Discrimination</h3>
            <p>
              Retailers can recognize you even if you&apos;re not logged in. They show higher prices to customers they know can pay more. Airline tickets. Hotel rooms. Even car insurance quotes.
            </p>
            <p>
              A 2012 Wall Street Journal investigation found Staples showing different prices based on user location. Not shipping costs—actual product prices. This practice has evolved. Fingerprinting makes it more sophisticated.
            </p>

            <h3>Account Linking</h3>
            <p>
              You create a separate identity for sensitive research. Medical conditions. Political views. Financial planning. You think you&apos;re anonymous.
            </p>
            <p>
              Fingerprinting links those identities. The website knows it&apos;s the same browser. Same person. Your compartmentalized life collapses.
            </p>

            <h3>Security Consequences</h3>
            <p>
              Security researchers use fingerprinting for device authentication. Banks detect fraud this way. But attackers can use the same technique to bypass anti-fraud systems.
            </p>
            <p>
              If someone steals your credentials but doesn&apos;t have your fingerprint, banks flag the login as suspicious. But if attackers clone your fingerprint? They look legitimate.
            </p>

            <h2>Who Uses Browser Fingerprinting?</h2>
            <p>
              Everyone. Literally everyone.
            </p>

            <Card className="p-6 my-6 bg-muted/30">
              <h3 className="font-semibold mb-4 text-lg">Industries Using Fingerprinting</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Ad Networks:</strong> Track you across websites for targeted advertising even when you block cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Banks & Fintech:</strong> Fraud detection and account security—legitimate use case</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>E-commerce:</strong> Price discrimination, bot detection, preventing multi-account abuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Social Media:</strong> Tracking users across devices, preventing ban evasion</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span><strong>Content Platforms:</strong> Enforcing access restrictions, preventing account sharing</span>
                </li>
              </ul>
            </Card>

            <p>
              Google uses fingerprinting. Facebook uses it. Amazon uses it. The technology is embedded in analytics libraries that millions of websites include by default.
            </p>

            <h2>How to Protect Yourself</h2>
            <p>
              Complete protection is impossible if you want a functional browser. But you can reduce your uniqueness significantly.
            </p>

            <h3>Option 1: Tor Browser</h3>
            <p>
              Tor Browser is designed to make everyone look the same. Same window size. Same fonts. Same user agent. Canvas and WebGL APIs are blocked or neutered.
            </p>
            <p>
              Downside: Many websites break. Banking doesn&apos;t work. Some content platforms block Tor exit nodes entirely. It&apos;s not practical for everyday use.
            </p>

            <h3>Option 2: Firefox with Privacy Extensions</h3>
            <p>
              Firefox with uBlock Origin and CanvasBlocker helps. You&apos;re still fingerprintable, but harder to track. JavaScript fingerprinting scripts get blocked. Canvas gets randomized.
            </p>
            <p>
              Problem: You become MORE unique if you&apos;re the only person blocking canvas. Privacy tools create a paradox. The more you protect yourself, the more you stand out.
            </p>

            <h3>Option 3: Antidetect Browsers & Multi-Login Tools</h3>
            <p>
              This is what professionals use. Antidetect browsers let you create multiple browser profiles, each with a consistent but different fingerprint.
            </p>
            <p>
              Profile 1 looks like a Windows 11 machine with Chrome 120, specific GPU, particular fonts. Profile 2 looks like macOS Sonoma with Safari 17, different hardware. Both are realistic. Both are consistent.
            </p>
            <p>
              Unlike privacy tools that block everything, antidetect browsers present plausible fingerprints. Websites see normal browsers. No red flags. No blocking.
            </p>

            <h2>The Technical Details: How Fingerprints Are Generated</h2>
            <p>
              Let&apos;s get technical for a moment. Understanding the mechanics helps you defend yourself.
            </p>

            <h3>Entropy and Uniqueness</h3>
            <p>
              Each data point contributes entropy—randomness that makes you unique. Screen resolution might contribute 4 bits of entropy (16 possible values). Font list contributes 13.9 bits (15,000 possible values).
            </p>
            <p>
              Total entropy determines how unique you are. The EFF&apos;s research found the average browser has 18.1 bits of entropy. That&apos;s enough to uniquely identify 1 in 286,777 browsers.
            </p>
            <p>
              Most browsers have much more entropy than that. 20+ bits is common. That&apos;s 1 in a million uniqueness.
            </p>

            <h3>Fingerprint Stability</h3>
            <p>
              Tracking only works if your fingerprint is stable. If it changes every session, you can&apos;t be tracked across visits.
            </p>
            <p>
              Most fingerprint components are very stable:
            </p>
            <ul>
              <li>Screen resolution: Only changes when you buy a new monitor or adjust settings</li>
              <li>Installed fonts: Only changes when you install software</li>
              <li>Canvas fingerprint: Only changes with GPU driver updates</li>
              <li>WebGL: Very stable unless hardware changes</li>
            </ul>
            <p>
              User agent and plugins change more frequently. But combined with stable components, you&apos;re still trackable.
            </p>

            <h2>The Future of Browser Fingerprinting</h2>
            <p>
              Browsers are fighting back. Safari and Firefox have implemented fingerprinting protections. Chrome is considering similar features.
            </p>
            <p>
              But it&apos;s an arms race. Trackers find new APIs to exploit. WebRTC leaks your local IP. Battery status API reveals battery level and charging state. Even seemingly innocuous features become tracking vectors.
            </p>
            <p>
              The fundamental problem: Modern browsers are powerful application platforms. They expose hardware capabilities to JavaScript. Every capability is a potential fingerprint.
            </p>
            <p>
              Machine learning is making this worse. ML models can extract fingerprints from timing attacks, JavaScript performance variations, and behavioral patterns. Your typing rhythm. Mouse movements. How fast your browser executes code.
            </p>

            <h2>What You Should Do Right Now</h2>
            <p>
              Action items. Practical steps you can take today.
            </p>
            <ol className="space-y-2">
              <li><strong>Test your fingerprint.</strong> Visit Panopticlick or AmIUnique. See how unique you really are.</li>
              <li><strong>Use Firefox or Brave for sensitive browsing.</strong> Better privacy defaults than Chrome.</li>
              <li><strong>Install uBlock Origin.</strong> Blocks most fingerprinting scripts.</li>
              <li><strong>Consider an antidetect browser if you need multiple identities.</strong> Essential for managing multiple accounts professionally.</li>
              <li><strong>Don&apos;t install browser extensions you don&apos;t need.</strong> Each extension makes you more unique.</li>
              <li><strong>Use standard window sizes.</strong> Maximized or default. Unusual dimensions increase uniqueness.</li>
            </ol>

            <h2>The Bottom Line</h2>
            <p>
              Browser fingerprinting is pervasive. It&apos;s sophisticated. It works even when you delete cookies and use private mode.
            </p>
            <p>
              Complete anonymity online is nearly impossible. But you can make tracking harder. You can compartmentalize your identities. You can reduce your fingerprint&apos;s uniqueness.
            </p>
            <p>
              The first step is awareness. Now you know how it works. Now you can defend yourself.
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-semibold mb-4">References & Further Reading</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• EFF Panopticlick: <a href="https://panopticlick.eff.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">panopticlick.eff.org</a></li>
                <li>• Princeton Web Census (2014): <a href="https://webtransparency.cs.princeton.edu/webcensus/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">webtransparency.cs.princeton.edu</a></li>
                <li>• FingerprintJS Research: <a href="https://fingerprintjs.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fingerprintjs.com</a></li>
              </ul>
            </div>
          </div>

          {/* Author Bio */}
          <Card className="p-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{article.author}</h3>
                <p className="text-sm text-muted-foreground mb-3">Privacy & Security Researcher</p>
                <p className="text-sm text-muted-foreground">
                  Sarah is a privacy advocate with 8 years of experience in browser security research. She has contributed to multiple open-source privacy projects and regularly speaks at security conferences.
                </p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-8 mt-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Protect Your Online Privacy Today</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Multilogin.io helps you manage multiple browser identities with consistent, realistic fingerprints. Free plan available.
              </p>
              <Link href="/register">
                <Button size="lg">Get Started Free</Button>
              </Link>
            </div>
          </Card>
        </div>
      </article>
    </>
  );
}
