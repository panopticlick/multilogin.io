import type { Metadata } from 'next';
import Link from 'next/link';
import { Code, Key, Lock, Server, Zap, Clock, FileJson, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

export const metadata: Metadata = {
  title: 'API Reference - Developer Documentation',
  description: 'Complete API reference for Multilogin.io. Learn how to integrate browser profile management into your applications.',
};

const endpoints = [
  {
    category: 'Authentication',
    items: [
      { method: 'POST', path: '/api/v1/auth/register', description: 'Create a new user account' },
      { method: 'POST', path: '/api/v1/auth/login', description: 'Authenticate and get JWT token' },
      { method: 'POST', path: '/api/v1/auth/refresh', description: 'Refresh access token' },
      { method: 'POST', path: '/api/v1/auth/forgot-password', description: 'Request password reset' },
    ],
  },
  {
    category: 'Profiles',
    items: [
      { method: 'GET', path: '/api/v1/profiles', description: 'List all browser profiles' },
      { method: 'POST', path: '/api/v1/profiles', description: 'Create a new profile' },
      { method: 'GET', path: '/api/v1/profiles/:id', description: 'Get profile details' },
      { method: 'PATCH', path: '/api/v1/profiles/:id', description: 'Update a profile' },
      { method: 'DELETE', path: '/api/v1/profiles/:id', description: 'Delete a profile' },
      { method: 'POST', path: '/api/v1/profiles/:id/launch', description: 'Launch a browser profile' },
      { method: 'POST', path: '/api/v1/profiles/:id/release', description: 'Release a running profile' },
    ],
  },
  {
    category: 'Proxies',
    items: [
      { method: 'GET', path: '/api/v1/proxies', description: 'List all proxies' },
      { method: 'POST', path: '/api/v1/proxies', description: 'Add a new proxy' },
      { method: 'POST', path: '/api/v1/proxies/test', description: 'Test proxy connection' },
      { method: 'POST', path: '/api/v1/proxies/:id/check', description: 'Check proxy status' },
    ],
  },
  {
    category: 'Teams',
    items: [
      { method: 'GET', path: '/api/v1/teams', description: 'Get team details' },
      { method: 'POST', path: '/api/v1/teams/invite', description: 'Invite a team member' },
      { method: 'GET', path: '/api/v1/teams/members', description: 'List team members' },
      { method: 'PATCH', path: '/api/v1/teams/members/:id', description: 'Update member role' },
    ],
  },
  {
    category: 'Time Machine',
    items: [
      { method: 'GET', path: '/api/v1/time-machine/:profileId/snapshots', description: 'List session snapshots' },
      { method: 'POST', path: '/api/v1/time-machine/:profileId/snapshots', description: 'Create a snapshot' },
      { method: 'POST', path: '/api/v1/time-machine/:profileId/restore/:snapshotId', description: 'Restore a snapshot' },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-600',
  POST: 'bg-blue-500/10 text-blue-600',
  PATCH: 'bg-yellow-500/10 text-yellow-600',
  DELETE: 'bg-red-500/10 text-red-600',
};

export default function APIDocsPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <BreadcrumbNav items={[
          { name: 'Docs', href: '/docs' },
          { name: 'API Reference', href: '/docs/api' },
        ]} />

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="soft-primary" className="mb-4">API Reference</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Build with Multilogin.io
          </h1>
          <p className="text-lg text-muted-foreground">
            Integrate browser profile management into your applications with our REST API.
          </p>
        </div>

        {/* Quick Start */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Use JWT tokens or API keys to authenticate requests.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <p className="text-sm text-muted-foreground font-mono">
                https://api.multilogin.io
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Rate Limits</h3>
              <p className="text-sm text-muted-foreground">
                No hard limits for free users. Be respectful.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication. You can use either JWT tokens or API keys.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm mb-4">
                  <p className="text-muted-foreground mb-2"># Using JWT Bearer token</p>
                  <p>Authorization: Bearer {'<your-jwt-token>'}</p>
                  <p className="text-muted-foreground mt-4 mb-2"># Using API Key</p>
                  <p>X-API-Key: {'<your-api-key>'}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate API keys from your{' '}
                  <Link href="/dashboard/api-keys" className="text-primary hover:underline">
                    Dashboard Settings
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-8">
          {endpoints.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {section.items.map((endpoint) => (
                      <div key={`${endpoint.method}-${endpoint.path}`} className="p-4 flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          className={`w-16 justify-center ${methodColors[endpoint.method]}`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                        <span className="text-sm text-muted-foreground hidden md:block">
                          {endpoint.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Example Request */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Example: Create a Profile</h2>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X POST https://api.multilogin.io/api/v1/profiles \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Profile",
    "templateId": "chrome-windows",
    "proxy": null
  }'`}</pre>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Response</h3>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`{
  "success": true,
  "data": {
    "id": "prf_abc123",
    "name": "My First Profile",
    "templateId": "chrome-windows",
    "createdAt": 1702500000000
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">Ready to Start Building?</h3>
          <p className="text-muted-foreground mb-6">
            Create an account and generate your API key to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/docs/api-authentication">
              <Button size="lg" variant="outline">
                Read Authentication Docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
