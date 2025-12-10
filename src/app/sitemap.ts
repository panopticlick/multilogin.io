import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // Marketing pages with priorities and change frequencies
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/download`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Blog posts
  const blogPosts = [
    'browser-fingerprinting',
    'multiple-browser-profiles',
    'choosing-right-proxy',
    'automation-api',
    'team-collaboration',
    'security-best-practices',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Documentation articles - Getting Started
  const gettingStartedDocs = [
    'quick-start',
    'creating-first-profile',
    'understanding-fingerprints',
    'installing-desktop-app',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Documentation articles - Browser Profiles
  const profileDocs = [
    'profile-templates',
    'fingerprint-customization',
    'session-management',
    'profile-groups',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Documentation articles - Proxy Integration
  const proxyDocs = [
    'adding-proxies',
    'proxy-types-explained',
    'rotating-proxies',
    'troubleshooting-connections',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Documentation articles - API Reference
  const apiDocs = [
    'api-authentication',
    'profiles-api',
    'proxies-api',
    'webhooks',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Documentation articles - Team & Collaboration
  const teamDocs = [
    'inviting-team-members',
    'roles-permissions',
    'sharing-profiles',
    'audit-logs',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Documentation articles - Security & Privacy
  const securityDocs = [
    'data-encryption',
    'two-factor-authentication',
    'api-key-security',
    'compliance',
  ].map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...routes,
    ...blogPosts,
    ...gettingStartedDocs,
    ...profileDocs,
    ...proxyDocs,
    ...apiDocs,
    ...teamDocs,
    ...securityDocs,
  ];
}
