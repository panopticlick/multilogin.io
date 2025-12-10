import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Heart, Zap, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'Careers - Join Our Team',
  description: 'Join the Multilogin.io team. We are building the future of browser privacy. See open positions and apply today.',
};

const benefits = [
  {
    icon: Globe,
    title: 'Remote First',
    description: 'Work from anywhere in the world. We believe in async communication.',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health coverage and wellness stipend.',
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: 'Annual budget for courses, conferences, and books.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'We trust you to manage your time. Results matter, not hours.',
  },
];

const openPositions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and scale our Next.js frontend and Cloudflare Worker backend.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Manage infrastructure, CI/CD pipelines, and ensure 99.9% uptime.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design intuitive interfaces for complex browser management workflows.',
  },
  {
    title: 'Technical Writer',
    department: 'Documentation',
    location: 'Remote',
    type: 'Part-time',
    description: 'Create clear, comprehensive documentation and tutorials.',
  },
];

export default function CareersPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[{ name: 'Careers', href: '/careers' }]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">Careers</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Build the Future of Browser Privacy
          </h1>
          <p className="text-lg text-muted-foreground">
            Join a remote-first team passionate about privacy, security, and building
            tools that empower users worldwide.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Join Us?</h2>
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

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Open Positions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {openPositions.map((position) => (
              <Card key={position.title} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{position.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {position.department}
                        </Badge>
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          {position.location}
                        </Badge>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`mailto:careers@multilogin.io?subject=Application: ${position.title}`}>
                      <Button variant="outline" className="whitespace-nowrap">
                        Apply Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Don't see a fit */}
        <Card className="max-w-3xl mx-auto bg-muted/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Do not see a perfect fit?</h3>
            <p className="text-muted-foreground mb-6">
              We are always looking for talented people. Send us your resume and tell us
              how you can contribute to our mission.
            </p>
            <Link href="mailto:careers@multilogin.io">
              <Button>
                Send Open Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
