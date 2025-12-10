import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Monitor, Apple, Command, Check, ArrowRight, HelpCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Download - Desktop Client for Windows, Mac & Linux',
  description:
    'Download the free Multilogin desktop client. Available for Windows, macOS, and Linux. Easy setup, instant cloud sync.',
};

// Coming soon status - set to true when downloads are available
const DOWNLOADS_AVAILABLE = false;

const platforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: Monitor,
    version: '1.0.0-beta',
    size: '~85 MB',
    requirements: 'Windows 10 or later (64-bit)',
    available: false,
    checksum: 'sha256:...',
  },
  {
    id: 'mac',
    name: 'macOS',
    icon: Apple,
    version: '1.0.0-beta',
    size: '~92 MB',
    requirements: 'macOS 11 (Big Sur) or later',
    available: false,
    checksum: 'sha256:...',
    variants: [
      { name: 'Apple Silicon (M1/M2)', file: 'multilogin-mac-arm64.dmg' },
      { name: 'Intel', file: 'multilogin-mac-x64.dmg' },
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Command,
    version: '1.0.0-beta',
    size: '~78 MB',
    requirements: 'Ubuntu 20.04+, Debian 11+, Fedora 35+',
    available: false,
    checksum: 'sha256:...',
    variants: [
      { name: 'AppImage (Universal)', file: 'multilogin.AppImage' },
      { name: 'Debian/Ubuntu (.deb)', file: 'multilogin.deb' },
      { name: 'Fedora/RHEL (.rpm)', file: 'multilogin.rpm' },
    ],
  },
];

const installSteps = {
  windows: [
    'Download the installer (.exe)',
    'Run the installer and follow the prompts',
    'Launch Multilogin from the Start menu',
    'Sign in with your account',
  ],
  mac: [
    'Download the appropriate version for your Mac',
    'Open the .dmg file',
    'Drag Multilogin to your Applications folder',
    'Open Multilogin and sign in',
  ],
  linux: [
    'Download the appropriate package for your distribution',
    'Install using your package manager or run the AppImage',
    'Launch Multilogin from your applications menu',
    'Sign in with your account',
  ],
};

const faq = [
  {
    question: 'Do I need to create an account first?',
    answer:
      'Yes, you need a Multilogin.io account to use the desktop client. Create a free account at multilogin.io/register.',
  },
  {
    question: 'Is the desktop client required?',
    answer:
      'The desktop client is required to launch browser profiles. The web dashboard is used for profile management and team settings.',
  },
  {
    question: 'How do I update the client?',
    answer:
      'The client checks for updates automatically on launch. You can also manually check for updates from the Settings menu.',
  },
  {
    question: 'Can I use it on multiple computers?',
    answer:
      'Yes! Your profiles sync across all your devices. Just install the client and sign in with the same account.',
  },
];

export default function DownloadPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="mesh-gradient absolute inset-0 opacity-50" />
        <div className="container-wide relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="soft-primary" className="mb-4">Download</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Download Multilogin Client
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Get the desktop client to launch your browser profiles.
              Available for Windows, macOS, and Linux.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      {!DOWNLOADS_AVAILABLE && (
        <section className="section-padding pb-0">
          <div className="container-wide">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Desktop Client Coming Soon</h3>
                  <p className="text-muted-foreground">
                    The desktop client is currently in beta testing. Join our waitlist to be notified when downloads are available.
                  </p>
                </div>
                <Button variant="outline" className="flex-shrink-0" asChild>
                  <Link href="/register">
                    Join Waitlist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Download Cards */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-3">
            {platforms.map((platform) => (
              <Card key={platform.id} className={`relative overflow-hidden ${!platform.available ? 'opacity-75' : ''}`}>
                {!platform.available && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <platform.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        v{platform.version} &middot; {platform.size}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {platform.requirements}
                  </p>

                  {platform.available ? (
                    platform.variants ? (
                      <div className="space-y-2">
                        {platform.variants.map((variant) => (
                          <Button
                            key={variant.file}
                            variant="outline"
                            className="w-full justify-between"
                          >
                            <span>{variant.name}</span>
                            <Download className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download for {platform.name}
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Me
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Looking for source code?{' '}
              <a
                href="https://github.com/anthropics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Installation Guide
            </h2>
            <p className="text-lg text-muted-foreground">
              Get up and running in minutes.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="windows">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="windows">Windows</TabsTrigger>
                <TabsTrigger value="mac">macOS</TabsTrigger>
                <TabsTrigger value="linux">Linux</TabsTrigger>
              </TabsList>

              {(['windows', 'mac', 'linux'] as const).map((platform) => (
                <TabsContent key={platform} value={platform}>
                  <Card>
                    <CardContent className="p-6">
                      <ol className="space-y-4">
                        {installSteps[platform].map((step, index) => (
                          <li key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="pt-1">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Quick Start
            </h2>
            <p className="text-lg text-muted-foreground">
              Launch your first profile in under 2 minutes.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Sign In',
                  description: 'Open the client and sign in with your Multilogin.io account.',
                },
                {
                  step: '2',
                  title: 'Select Profile',
                  description: 'Choose a profile from your synced list or create a new one.',
                },
                {
                  step: '3',
                  title: 'Launch',
                  description: 'Click Launch and your browser opens with the unique fingerprint.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              System Requirements
            </h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-4">Minimum</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        4 GB RAM
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        2 GB free disk space
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Dual-core processor
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Stable internet connection
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Recommended</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        8+ GB RAM
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        SSD with 10+ GB free
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        Quad-core processor
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        50+ Mbps internet
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="soft-primary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4">
              {faq.map((item) => (
                <Card key={item.question}>
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-2">{item.question}</h3>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Need Help?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Check out our documentation or contact support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/docs">
                <Button size="xl" className="group">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
