import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, BookOpen } from 'lucide-react';

const supportChannels = [
  {
    title: 'Email Support',
    description: 'Reach us 24/7 at support@multilogin.io for onboarding, feature, or incident help.',
    icon: Mail,
    action: {
      label: 'Email Support',
      href: 'mailto:support@multilogin.io',
    },
  },
  {
    title: 'Live Chat',
    description: 'Dashboard 内置实时聊天，所有用户都可直接联系工程团队。',
    icon: MessageCircle,
    action: {
      label: 'Open Chat',
      href: '/dashboard',
    },
  },
  {
    title: 'Documentation',
    description: 'Step-by-step guides, architecture deep dives, and troubleshooting for every feature.',
    icon: BookOpen,
    action: {
      label: 'Browse Docs',
      href: '/docs',
    },
  },
];

export default function HelpCenterPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold text-primary">Help Center</p>
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Whether you&apos;re rolling out Time Machine, wiring up the API, or auditing a profile, we&apos;re a message away. Choose a channel below and our response team will follow up within one business day.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {supportChannels.map((channel) => (
          <Card key={channel.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <channel.icon className="h-5 w-5" />
                <CardTitle className="text-lg">{channel.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{channel.description}</p>
              <Button asChild variant="outline" className="mt-auto">
                <Link href={channel.action.href}>{channel.action.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            For availability incidents or security disclosures, ping our dedicated pager at
            <Link href="mailto:security@multilogin.io" className="text-primary font-medium"> security@multilogin.io</Link>
            and include reproduction details. We acknowledge within 30 minutes, 24/7.
          </p>
          <p>
            Need to talk to sales? Schedule a call at
            <Link href="mailto:sales@multilogin.io" className="text-primary font-medium"> sales@multilogin.io</Link>
            for tailored onboarding, proof-of-concept support, and enterprise procurement questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
