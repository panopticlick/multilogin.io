'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const blogPosts = [
  {
    slug: 'getting-started-with-browser-profiles',
    title: 'Getting Started with Browser Profiles: A Complete Guide',
    excerpt:
      'Learn how to effectively use browser profiles for multi-account management, privacy, and automation.',
    category: 'Tutorials',
    author: 'John Smith',
    date: 'November 28, 2024',
    readTime: '8 min',
    featured: true,
  },
  {
    slug: 'understanding-browser-fingerprinting',
    title: 'Understanding Browser Fingerprinting in 2024',
    excerpt:
      'A deep dive into how websites track you through browser fingerprinting and how to protect your privacy.',
    category: 'Privacy',
    author: 'Sarah Johnson',
    date: 'November 25, 2024',
    readTime: '12 min',
    featured: true,
  },
  {
    slug: 'proxy-setup-best-practices',
    title: 'Proxy Setup Best Practices for Multi-Account Management',
    excerpt:
      'Essential tips for configuring proxies with your browser profiles to maintain account security.',
    category: 'Guides',
    author: 'Mike Chen',
    date: 'November 20, 2024',
    readTime: '6 min',
    featured: false,
  },
  {
    slug: 'team-collaboration-features',
    title: 'New Team Collaboration Features Released',
    excerpt:
      'Discover our latest features for team management, including shared profiles and activity tracking.',
    category: 'Product Updates',
    author: 'Emily Davis',
    date: 'November 15, 2024',
    readTime: '4 min',
    featured: false,
  },
  {
    slug: 'automation-workflows-guide',
    title: 'Building Automation Workflows with Multilogin.io',
    excerpt:
      'Learn how to automate your browser profiles using our API and scripting capabilities.',
    category: 'Tutorials',
    author: 'John Smith',
    date: 'November 10, 2024',
    readTime: '10 min',
    featured: false,
  },
  {
    slug: 'security-compliance-update',
    title: 'Q4 Security and Compliance Update',
    excerpt:
      'Our commitment to security: new encryption features, SOC 2 compliance, and more.',
    category: 'Security',
    author: 'Sarah Johnson',
    date: 'November 5, 2024',
    readTime: '5 min',
    featured: false,
  },
];

const categories = [
  'All Posts',
  'Tutorials',
  'Privacy',
  'Guides',
  'Product Updates',
  'Security',
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All Posts');

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Filter posts based on search and category
  const filteredPosts = React.useMemo(() => {
    return blogPosts.filter((post) => {
      // Category filter
      if (selectedCategory !== 'All Posts' && post.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [debouncedSearch, selectedCategory]);

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);
  const hasNoResults = filteredPosts.length === 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Posts');
  };

  // JSON-LD Structured Data for Blog Listing
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Multilogin.io Blog',
    description: 'Latest news, tips, and insights about browser fingerprinting, anti-detect browsers, and multi-account management.',
    url: `${siteConfig.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: new Date(post.date).toISOString(),
      author: {
        '@type': 'Person',
        name: post.author,
      },
      url: `${siteConfig.url}/blog/${post.slug}`,
      articleSection: post.category,
      timeRequired: post.readTime,
    })),
  };

  /*
   * Template for individual blog post pages (to be used in /blog/[slug]/page.tsx):
   *
   * const articleJsonLd = {
   *   '@context': 'https://schema.org',
   *   '@type': 'Article',
   *   headline: 'Your Article Title',
   *   description: 'Article description',
   *   image: `${siteConfig.url}/blog/article-image.jpg`,
   *   datePublished: '2024-11-28T00:00:00Z',
   *   dateModified: '2024-11-28T00:00:00Z',
   *   author: {
   *     '@type': 'Person',
   *     name: 'Author Name',
   *     url: `${siteConfig.url}/authors/author-slug`,
   *   },
   *   publisher: {
   *     '@type': 'Organization',
   *     name: siteConfig.name,
   *     logo: {
   *       '@type': 'ImageObject',
   *       url: `${siteConfig.url}/logo.png`,
   *     },
   *   },
   *   mainEntityOfPage: {
   *     '@type': 'WebPage',
   *     '@id': `${siteConfig.url}/blog/article-slug`,
   *   },
   *   articleSection: 'Category Name',
   *   wordCount: 1800,
   *   timeRequired: 'PT8M', // ISO 8601 duration format (PT8M = 8 minutes)
   * };
   */

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={[{ name: 'Blog' }]} />

      <div className="container py-16 lg:py-24">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Blog
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Latest News & Insights
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Stay updated with the latest tips, tutorials, and product updates from
          Multilogin.io.
        </p>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-10 pr-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search blog articles"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="tablist" aria-label="Filter by category">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            role="tab"
            aria-selected={category === selectedCategory}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* No Results */}
      {hasNoResults && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            We could not find any articles matching your search.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Featured Posts */}
      {!hasNoResults && featuredPosts.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold">Featured Articles</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                  <Badge variant="secondary" className="mb-4">
                    {post.category}
                  </Badge>
                  <h3 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Posts</h2>
        <div className="grid gap-6">
          {regularPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <Card className="mt-16 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest articles, tutorials, and product updates delivered to your
            inbox every week.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}
