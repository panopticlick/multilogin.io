import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Download, Monitor, Apple, Terminal } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Installing the Desktop App',
  description: 'Step-by-step installation guide for Windows, macOS, and Linux. System requirements, troubleshooting common issues, and first-launch setup.',
  author: 'Marcus Thompson',
  authorTitle: 'Platform Engineer',
  publishedAt: '2024-01-22',
  readingTime: '5 min read',
  category: 'Getting Started',
  wordCount: 800,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'multilogin installation',
    'desktop app install',
    'windows installation',
    'macos setup',
    'linux install guide',
    'system requirements',
    'app troubleshooting',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/installing-desktop-app`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function InstallingDesktopAppPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Download Installer',
        text: 'Download the appropriate installer for your operating system from the dashboard.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Run Installer',
        text: 'Run the installer and follow the setup wizard prompts.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Launch and Login',
        text: 'Open the installed application and log in with your credentials.',
      },
    ],
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
            Installing Multilogin takes 5 minutes. Download the installer, run setup, log in. You're browsing with unique fingerprints in 10 minutes total.
          </p>

          <h2>System Requirements</h2>

          <p>
            Check your specs first. Here's what you need:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Minimum</th>
                  <th>Recommended</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Windows</td>
                  <td>Win 10 / 4GB RAM / 2GB disk</td>
                  <td>Win 11 / 8GB RAM / 5GB disk</td>
                  <td>x64 only, no ARM support</td>
                </tr>
                <tr>
                  <td>macOS</td>
                  <td>macOS 11 / 4GB RAM / 2GB disk</td>
                  <td>macOS 13+ / 8GB RAM / 5GB disk</td>
                  <td>Intel & Apple Silicon</td>
                </tr>
                <tr>
                  <td>Linux</td>
                  <td>Ubuntu 20.04 / 4GB RAM / 2GB disk</td>
                  <td>Ubuntu 22.04 / 8GB RAM / 5GB disk</td>
                  <td>Debian-based distros</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Each profile uses 300-500MB of RAM when running. If you plan to run 5 profiles simultaneously, budget 2.5GB RAM. For 10 profiles, get 8GB RAM minimum.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Storage Tip</p>
            <p className="text-sm mb-0">
              Profiles accumulate browsing data over time. A heavily-used profile can grow to 500MB-1GB. Plan for 100-200MB per profile on average. 50 profiles = 5-10GB disk space.
            </p>
          </Card>

          <h2>Installing on Windows</h2>

          <p>
            Log into your Multilogin dashboard. Click "Download App" in the top right. Select "Windows (x64)."
          </p>

          <p>
            The installer is about 180MB. Download takes 1-3 minutes depending on your connection.
          </p>

          <p>
            Once downloaded, double-click MultiloginSetup.exe. Windows SmartScreen might warn you. Click "More info" then "Run anyway." This is normal for new software.
          </p>

          <p>
            The setup wizard appears. Click through:
          </p>

          <ol>
            <li>Accept license agreement</li>
            <li>Choose install location (default is fine: C:\Program Files\Multilogin)</li>
            <li>Create desktop shortcut (recommended)</li>
            <li>Click Install</li>
          </ol>

          <p>
            Installation takes 20-30 seconds. Click Finish when done.
          </p>

          <p>
            Open Multilogin from your desktop shortcut. Enter your email and password. Click "Sign In." You're in.
          </p>

          <h2>Installing on macOS</h2>

          <p>
            Download the macOS installer from your dashboard. Get the right version:
          </p>

          <ul>
            <li><strong>Apple Silicon:</strong> M1, M2, M3 chips (check "About This Mac")</li>
            <li><strong>Intel:</strong> Pre-2020 Macs or Intel-specific models</li>
          </ul>

          <p>
            Open the downloaded .dmg file. Drag Multilogin.app into your Applications folder.
          </p>

          <p>
            Launch Multilogin from Applications. macOS Gatekeeper will block it the first time. This is expected for apps not from the App Store.
          </p>

          <p>
            Fix this:
          </p>

          <ol>
            <li>Open System Settings → Privacy & Security</li>
            <li>Scroll to "Security" section</li>
            <li>You'll see "Multilogin was blocked" with an "Open Anyway" button</li>
            <li>Click "Open Anyway"</li>
            <li>Confirm with your password</li>
          </ol>

          <p>
            Launch Multilogin again. It opens this time. Log in with your credentials.
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium mb-2">⚠️ macOS Permission</p>
            <p className="text-sm mb-0">
              macOS will ask for permissions on first launch: Accessibility access for keyboard automation, Full Disk Access for profile storage. Grant these for full functionality.
            </p>
          </Card>

          <h2>Installing on Linux</h2>

          <p>
            We support Debian-based distributions (Ubuntu, Linux Mint, Pop!_OS, elementary OS).
          </p>

          <p>
            Download the .deb package from your dashboard. For other distros, download the .tar.gz archive.
          </p>

          <p>
            <strong>Ubuntu/Debian Installation:</strong>
          </p>

          <pre><code>sudo dpkg -i multilogin_*.deb{'\n'}sudo apt-get install -f</code></pre>

          <p>
            The second command installs any missing dependencies.
          </p>

          <p>
            <strong>Manual Installation (all distros):</strong>
          </p>

          <pre><code>tar -xzf multilogin_*.tar.gz{'\n'}cd multilogin{'\n'}./install.sh</code></pre>

          <p>
            Launch with:
          </p>

          <pre><code>multilogin</code></pre>

          <p>
            Or find it in your application menu under "Internet" or "Network."
          </p>

          <p>
            Linux requires these dependencies:
          </p>

          <ul>
            <li>libgconf-2-4</li>
            <li>libgtk-3-0</li>
            <li>libnss3</li>
            <li>libxss1</li>
          </ul>

          <p>
            Install missing dependencies:
          </p>

          <pre><code>sudo apt-get install libgconf-2-4 libgtk-3-0 libnss3 libxss1</code></pre>

          <h2>First Launch Setup</h2>

          <p>
            After logging in, you'll see the welcome screen. Two quick setup steps:
          </p>

          <p>
            <strong>1. Set Data Storage Location</strong>
          </p>

          <p>
            Choose where to store profile data. Default locations:
          </p>

          <ul>
            <li><strong>Windows:</strong> C:\Users\YourName\AppData\Roaming\Multilogin</li>
            <li><strong>macOS:</strong> ~/Library/Application Support/Multilogin</li>
            <li><strong>Linux:</strong> ~/.config/multilogin</li>
          </ul>

          <p>
            You can change this to an external drive if you're tight on space. Not recommended for SSD longevity though.
          </p>

          <p>
            <strong>2. Enable Auto-Updates</strong>
          </p>

          <p>
            We ship updates every 2-3 weeks. Browser engines get patched. Fingerprints get refreshed. Detection methods evolve.
          </p>

          <p>
            Enable auto-updates unless you're on enterprise with strict change control. Updates install on restart and take 30 seconds.
          </p>

          <h2>Common Installation Issues</h2>

          <p>
            <strong>Windows: "App can't run on your PC"</strong>
          </p>

          <p>
            You downloaded the x64 version but have a 32-bit Windows. Re-download the x86 installer. Or upgrade to 64-bit Windows (recommended).
          </p>

          <p>
            <strong>macOS: "App is damaged and can't be opened"</strong>
          </p>

          <p>
            Your download was corrupted or blocked by Gatekeeper. Delete the app. Re-download. Run this in Terminal:
          </p>

          <pre><code>xattr -cr /Applications/Multilogin.app</code></pre>

          <p>
            Try launching again.
          </p>

          <p>
            <strong>Linux: Missing library errors</strong>
          </p>

          <p>
            Run this to install all common dependencies:
          </p>

          <pre><code>sudo apt-get install libgconf-2-4 libgtk-3-0 libnss3 libxss1 libappindicator3-1 libsecret-1-0</code></pre>

          <p>
            <strong>All Platforms: Login fails</strong>
          </p>

          <p>
            Check your email/password. Try resetting your password. If that doesn't work, your firewall might be blocking multilogin.io. Whitelist *.multilogin.io in your firewall settings.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">App Installed. What's Next?</h3>
            <p className="mb-4">
              Now that the desktop app is running, create your first browser profile with custom fingerprints and proxy settings.
            </p>
            <Link href="/docs/creating-first-profile">
              <Button size="lg">
                Create Your First Profile <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} maintains Multilogin's cross-platform desktop application. He's built installers for 50+ software products and optimized install flows that converted 10,000+ users.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/quick-start">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Quick Start Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Complete beginner's guide from signup to first secure session
                </p>
              </Card>
            </Link>
            <Link href="/docs/creating-first-profile">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Creating Your First Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Master profile creation with fingerprint templates and proxy setup
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
