import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch',
  description: 'Have questions about Multilogin.io? Contact our support team for help with browser profiles, technical issues, or partnership inquiries.',
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help with technical issues or account questions',
    contact: siteConfig.contact.support,
    href: `mailto:${siteConfig.contact.support}`,
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Questions about enterprise features or custom deployments',
    contact: siteConfig.contact.sales,
    href: `mailto:${siteConfig.contact.sales}`,
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We typically respond within 24 hours',
    contact: 'Mon-Fri, 9am-6pm UTC',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[{ name: 'Contact', href: '/contact' }]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">Contact Us</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions, feedback, or need help? We are here for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Ways to Reach Us</h2>
            {contactMethods.map((method) => (
              <Card key={method.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <method.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      {method.href ? (
                        <Link
                          href={method.href}
                          className="text-sm text-primary hover:underline"
                        >
                          {method.contact}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium">{method.contact}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Additional Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Looking for Documentation?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our comprehensive docs for guides, API references, and troubleshooting tips.
                </p>
                <Link href="/docs">
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us more about your question or feedback..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our{' '}
                  <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
