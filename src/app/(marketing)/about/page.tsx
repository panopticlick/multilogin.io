import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Shield, Heart, ArrowRight, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'About Us - Our Mission & Team',
  description: 'Learn about Multilogin.io, our mission to provide free browser profile management, and the team behind the platform.',
};

const values = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'We believe privacy is a fundamental right. All data is encrypted end-to-end.',
  },
  {
    icon: Heart,
    title: 'Free Forever',
    description: 'We removed all paywalls. Everyone deserves access to professional tools.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Our roadmap is shaped by user feedback. Your voice matters.',
  },
  {
    icon: Zap,
    title: 'Performance Obsessed',
    description: 'Fast, reliable, and always available. We sweat the details.',
  },
];

const stats = [
  { value: '10,000+', label: 'Active Users' },
  { value: '500,000+', label: 'Profiles Created' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[{ name: 'About', href: '/about' }]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">About Us</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Building the Future of Browser Privacy
          </h1>
          <p className="text-lg text-muted-foreground">
            Multilogin.io started with a simple idea: everyone should have access to professional
            browser profile management tools, without paying enterprise prices.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-16">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize browser profile management by providing a free, secure, and
                  feature-rich platform that empowers individuals and businesses to manage
                  multiple online identities safely.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We believe that in an increasingly connected world, the ability to separate your
              online identities is not a luxury—it is a necessity. Whether you are a social media
              manager juggling client accounts, an e-commerce seller managing multiple storefronts,
              or simply someone who values their privacy, you deserve tools that work for you.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="mx-auto max-w-3xl mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Story</h2>
          <div className="prose prose-gray dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Multilogin.io was founded by a team of privacy advocates and software engineers
              who were frustrated with the state of browser profile management tools. Existing
              solutions were either too expensive, too complex, or lacked essential features.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We set out to build something different: a platform that combines enterprise-grade
              security with consumer-friendly simplicity, all at a price everyone can afford—free.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, thousands of users trust Multilogin.io to manage their browser profiles.
              We are committed to keeping the platform free and continuously improving based on
              community feedback.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of users managing their browser profiles with Multilogin.io.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="group">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
