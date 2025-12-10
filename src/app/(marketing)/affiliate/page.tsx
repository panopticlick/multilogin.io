import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, DollarSign, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'Affiliate Program - Earn by Sharing',
  description: 'Join the Multilogin.io affiliate program. Earn rewards by referring new users to our free browser profile management platform.',
};

const benefits = [
  {
    icon: Gift,
    title: 'Generous Rewards',
    description: 'Earn rewards for every user you refer who signs up and uses the platform.',
  },
  {
    icon: TrendingUp,
    title: 'Lifetime Attribution',
    description: 'Get credit for users you refer, no matter when they sign up.',
  },
  {
    icon: Users,
    title: 'Growing Community',
    description: 'Join thousands of affiliates promoting privacy-first tools.',
  },
  {
    icon: DollarSign,
    title: 'Monthly Payouts',
    description: 'Reliable monthly payments via PayPal or bank transfer.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Sign Up',
    description: 'Create your free affiliate account and get your unique referral link.',
  },
  {
    step: '02',
    title: 'Share',
    description: 'Share your link with your audience via blog, social media, or email.',
  },
  {
    step: '03',
    title: 'Earn',
    description: 'Earn rewards when users sign up through your link and use the platform.',
  },
];

const faqs = [
  {
    question: 'How much can I earn?',
    answer: 'Rewards vary based on user activity. Active affiliates earn recognition, swag, and early access to new features.',
  },
  {
    question: 'When do I get paid?',
    answer: 'Payouts are processed monthly for affiliates who meet the minimum threshold.',
  },
  {
    question: 'Is there a minimum payout?',
    answer: 'The minimum payout threshold is $50. Your balance rolls over if not met.',
  },
  {
    question: 'Can I promote on any platform?',
    answer: 'Yes, you can promote on blogs, YouTube, social media, forums, and more. Just follow our brand guidelines.',
  },
];

export default function AffiliatePage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[{ name: 'Affiliate', href: '/affiliate' }]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">Affiliate Program</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Earn by Spreading the Word
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Help others discover Multilogin.io and get rewarded for your efforts.
            Join our affiliate program today.
          </p>
          <Link href="mailto:affiliate@multilogin.io?subject=Affiliate Program Application">
            <Button size="lg" className="group">
              Apply to Join
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Partner With Us?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-border" />
                  </div>
                )}
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Apply to our affiliate program and start earning today.
            </p>
            <Link href="mailto:affiliate@multilogin.io?subject=Affiliate Program Application">
              <Button size="lg">
                Apply Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
