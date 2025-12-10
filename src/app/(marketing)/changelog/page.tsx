import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import { Sparkles, Bug, Zap, Shield, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog - Product Updates',
  description: 'Stay up to date with the latest features, improvements, and bug fixes to Multilogin.io.',
};

const changelog = [
  {
    version: '1.0.0',
    date: 'December 2024',
    title: 'Initial Public Release',
    description: 'Multilogin.io is now available to everyone, completely free.',
    changes: [
      { type: 'feature', text: 'Browser profile management with unique fingerprints' },
      { type: 'feature', text: 'Cloud sync across all devices' },
      { type: 'feature', text: 'Team collaboration with role-based access' },
      { type: 'feature', text: 'Proxy management with rotation support' },
      { type: 'feature', text: 'Time Machine for session snapshots' },
      { type: 'feature', text: 'Automation scripts for repetitive tasks' },
      { type: 'feature', text: 'Health monitoring and alerts' },
      { type: 'security', text: 'AES-256 encryption for all data' },
      { type: 'security', text: 'SOC 2 Type II compliance' },
    ],
  },
  {
    version: '0.9.0',
    date: 'November 2024',
    title: 'Beta Release',
    description: 'Private beta with early access users.',
    changes: [
      { type: 'feature', text: 'Core profile management functionality' },
      { type: 'feature', text: 'Basic fingerprint templates' },
      { type: 'improvement', text: 'Improved sync performance' },
      { type: 'fix', text: 'Fixed proxy connection issues' },
    ],
  },
  {
    version: '0.5.0',
    date: 'October 2024',
    title: 'Alpha Release',
    description: 'Internal testing and core feature development.',
    changes: [
      { type: 'feature', text: 'Initial profile creation flow' },
      { type: 'feature', text: 'Basic proxy support' },
      { type: 'feature', text: 'User authentication' },
    ],
  },
];

const typeIcons = {
  feature: Sparkles,
  improvement: Zap,
  fix: Bug,
  security: Shield,
};

const typeColors = {
  feature: 'bg-primary/10 text-primary',
  improvement: 'bg-blue-500/10 text-blue-500',
  fix: 'bg-orange-500/10 text-orange-500',
  security: 'bg-green-500/10 text-green-500',
};

const typeLabels = {
  feature: 'New',
  improvement: 'Improved',
  fix: 'Fixed',
  security: 'Security',
};

export default function ChangelogPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[{ name: 'Changelog', href: '/changelog' }]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">Changelog</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Product Updates
          </h1>
          <p className="text-lg text-muted-foreground">
            Stay up to date with the latest features, improvements, and fixes.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {changelog.map((release, index) => (
              <Card key={release.version}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="default">v{release.version}</Badge>
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold mb-2">{release.title}</h2>
                      <p className="text-muted-foreground mb-4">{release.description}</p>
                      <ul className="space-y-2">
                        {release.changes.map((change, changeIndex) => {
                          const Icon = typeIcons[change.type as keyof typeof typeIcons] || Sparkles;
                          const colorClass = typeColors[change.type as keyof typeof typeColors] || typeColors.feature;
                          const label = typeLabels[change.type as keyof typeof typeLabels] || 'Update';
                          return (
                            <li key={changeIndex} className="flex items-start gap-2">
                              <Badge variant="secondary" className={`text-xs ${colorClass}`}>
                                {label}
                              </Badge>
                              <span className="text-sm">{change.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <Card className="max-w-3xl mx-auto mt-12 bg-muted/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Follow us on social media or check back here for the latest updates.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <a href="https://twitter.com/multilogin_io" className="hover:text-primary">
                Twitter
              </a>
              <span>|</span>
              <a href="https://discord.gg/multilogin" className="hover:text-primary">
                Discord
              </a>
              <span>|</span>
              <a href="https://github.com/multilogin" className="hover:text-primary">
                GitHub
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
