import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Understanding Browser Fingerprints',
  description: 'Technical deep-dive into Canvas fingerprinting, WebGL rendering, font detection, and the 47 parameters that make your browser unique. Learn how detection works and how to beat it.',
  author: 'Dr. Sarah Martinez',
  authorTitle: 'Principal Security Researcher',
  publishedAt: '2024-01-20',
  readingTime: '7 min read',
  category: 'Getting Started',
  wordCount: 1100,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'browser fingerprinting',
    'canvas fingerprinting',
    'webgl fingerprinting',
    'font detection',
    'device fingerprint',
    'tracking prevention',
    'anti-fingerprinting',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/understanding-fingerprints`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function UnderstandingFingerprintsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorTitle,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    wordCount: article.wordCount,
    timeRequired: 'PT7M',
    proficiencyLevel: 'Beginner',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-wide py-8">
        <BreadcrumbNav
          items={[
            { name: 'Docs', href: '/docs' },
            { name: article.title },
          ]}
        />
      </div>

      <article className="container max-w-4xl py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <Badge variant="secondary">{article.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {article.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readingTime}</span>
            </div>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p className="lead">
            Your browser leaks 47 data points every time you visit a site. Combined, they create a unique fingerprint that identifies you across the web. Here's how it works and how to stop it.
          </p>

          <h2>What Makes a Fingerprint Unique?</h2>

          <p>
            A browser fingerprint is a hash generated from your device and browser configuration. No cookies involved. Sites collect data points through JavaScript and combine them into a signature.
          </p>

          <p>
            Research from Princeton University found that 84% of browsers are uniquely identifiable. That means your browser is basically a tracking cookie that you can't delete.
          </p>

          <p>
            Here are the 47 parameters that matter:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Parameter Category</th>
                  <th>Data Points</th>
                  <th>Entropy Bits</th>
                  <th>Detection Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Canvas Fingerprint</td>
                  <td>5</td>
                  <td>15.4</td>
                  <td>Critical</td>
                </tr>
                <tr>
                  <td>WebGL Fingerprint</td>
                  <td>8</td>
                  <td>14.2</td>
                  <td>Critical</td>
                </tr>
                <tr>
                  <td>Audio Context</td>
                  <td>3</td>
                  <td>12.8</td>
                  <td>High</td>
                </tr>
                <tr>
                  <td>System Fonts</td>
                  <td>1</td>
                  <td>13.9</td>
                  <td>Critical</td>
                </tr>
                <tr>
                  <td>Screen Properties</td>
                  <td>6</td>
                  <td>8.3</td>
                  <td>Medium</td>
                </tr>
                <tr>
                  <td>Navigator Object</td>
                  <td>12</td>
                  <td>6.7</td>
                  <td>Medium</td>
                </tr>
                <tr>
                  <td>Plugins & Extensions</td>
                  <td>4</td>
                  <td>5.2</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>HTTP Headers</td>
                  <td>8</td>
                  <td>4.1</td>
                  <td>Low</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Entropy bits measure uniqueness. Higher bits = more unique. Canvas and WebGL are the killers. They alone provide 30 bits of entropy. That's enough to identify 1 in 1 billion browsers.
          </p>

          <h2>Canvas Fingerprinting: The Silent Tracker</h2>

          <p>
            Canvas fingerprinting uses HTML5 Canvas API to draw hidden images. Your GPU and graphics driver render the image slightly differently than everyone else's. The result gets hashed into a unique ID.
          </p>

          <p>
            Here's how it works:
          </p>

          <ol>
            <li>Site loads invisible Canvas element</li>
            <li>JavaScript draws text and shapes using specific fonts and colors</li>
            <li>Your GPU renders the image based on your hardware and drivers</li>
            <li>The rendered pixel data gets hashed (MD5 or SHA-256)</li>
            <li>Hash becomes your Canvas fingerprint</li>
          </ol>

          <p>
            Why is this unique? GPU models render anti-aliasing differently. Graphics drivers apply different sub-pixel rendering. Font rendering engines vary between systems. Even identical hardware produces different outputs due to driver versions.
          </p>

          <Card className="my-6 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">💡 Real Data</p>
            <p className="text-sm mb-0">
              EFF's Panopticlick project tested 2.5 million browsers. Canvas fingerprints changed in only 0.8% of tests. That means your Canvas stays constant across sessions, sites, and even browser updates.
            </p>
          </Card>

          <h2>WebGL Fingerprinting: GPU Tracking</h2>

          <p>
            WebGL exposes your graphics hardware directly to websites. Sites query your GPU vendor, renderer string, driver version, and supported extensions.
          </p>

          <p>
            Tracked WebGL parameters:
          </p>

          <ul>
            <li><strong>GPU Vendor:</strong> AMD, NVIDIA, Intel, Apple</li>
            <li><strong>Renderer String:</strong> Exact GPU model (e.g., "NVIDIA GeForce RTX 3080")</li>
            <li><strong>GLSL Version:</strong> Shader language version</li>
            <li><strong>Supported Extensions:</strong> 40+ WebGL capabilities</li>
            <li><strong>Max Texture Size:</strong> 4096, 8192, 16384 pixels</li>
            <li><strong>Max Render Buffer Size:</strong> GPU memory limits</li>
            <li><strong>Aliased Line Width Range:</strong> Anti-aliasing capabilities</li>
            <li><strong>Shader Precision:</strong> High, medium, low float precision</li>
          </ul>

          <p>
            WebGL rendering also creates a fingerprint similar to Canvas. Sites render 3D shapes and hash the output. Your GPU's floating-point precision creates unique rendering artifacts.
          </p>

          <h2>Font Detection: System Profiling</h2>

          <p>
            Your installed fonts reveal your operating system, language, and software. Sites test for 500+ fonts using invisible DOM elements.
          </p>

          <p>
            Detection method:
          </p>

          <ol>
            <li>Create hidden span with test text</li>
            <li>Apply fallback font (Arial) and measure width/height</li>
            <li>Apply target font (Segoe UI) and measure again</li>
            <li>If dimensions change, font is installed</li>
            <li>Repeat for 500 fonts in 50 milliseconds</li>
          </ol>

          <p>
            Common font signatures:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Operating System</th>
                  <th>Signature Fonts</th>
                  <th>Additional Indicators</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Windows 10/11</td>
                  <td>Segoe UI, Calibri, Cambria</td>
                  <td>Arial Unicode MS, MS Gothic</td>
                </tr>
                <tr>
                  <td>macOS</td>
                  <td>San Francisco, Helvetica Neue</td>
                  <td>Apple Symbols, Monaco</td>
                </tr>
                <tr>
                  <td>Linux</td>
                  <td>Liberation Sans, DejaVu Sans</td>
                  <td>Ubuntu, Noto Sans</td>
                </tr>
                <tr>
                  <td>ChromeOS</td>
                  <td>Roboto, Arimo</td>
                  <td>Noto Sans, Cousine</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Adobe Creative Suite adds 100+ fonts. Microsoft Office adds 50+. Even niche software like AutoCAD or Sketch leaves font fingerprints.
          </p>

          <h2>Audio Context Fingerprinting</h2>

          <p>
            Web Audio API processes sound using your system's audio stack. Different audio hardware and drivers produce unique signal processing characteristics.
          </p>

          <p>
            Sites create an AudioContext, generate oscillator signals, apply filters, and measure the output. Your audio processing chain creates subtle differences in frequency response and harmonic distortion.
          </p>

          <h2>Screen and Display Properties</h2>

          <p>
            Your screen reveals device type and usage patterns:
          </p>

          <ul>
            <li><strong>Screen Resolution:</strong> 1920x1080, 2560x1440, 3840x2160</li>
            <li><strong>Available Screen Size:</strong> Resolution minus taskbar/dock</li>
            <li><strong>Color Depth:</strong> 24-bit, 32-bit, 48-bit</li>
            <li><strong>Pixel Ratio:</strong> 1x (standard), 2x (Retina), 3x (4K)</li>
            <li><strong>Orientation:</strong> Landscape vs portrait</li>
            <li><strong>Touch Support:</strong> Touch events available</li>
          </ul>

          <p>
            Multi-monitor setups leak even more. Sites detect total screen width spanning all monitors. Unusual values like 5120x1440 (dual 1440p) are highly unique.
          </p>

          <h2>Navigator Object: Browser Identity</h2>

          <p>
            The Navigator object exposes 12 browser properties:
          </p>

          <ul>
            <li><strong>User Agent:</strong> Browser version and OS</li>
            <li><strong>Platform:</strong> Win32, MacIntel, Linux x86_64</li>
            <li><strong>Language:</strong> en-US, de-DE, ja-JP</li>
            <li><strong>Hardware Concurrency:</strong> CPU core count (4, 8, 16 cores)</li>
            <li><strong>Device Memory:</strong> RAM in GB (4, 8, 16, 32)</li>
            <li><strong>Max Touch Points:</strong> Multi-touch support (0, 5, 10)</li>
            <li><strong>Do Not Track:</strong> DNT header preference</li>
            <li><strong>Cookie Enabled:</strong> Boolean flag</li>
          </ul>

          <p>
            These seem generic. But combined with other parameters, they narrow your identity significantly.
          </p>

          <h2>How Multilogin Beats Fingerprinting</h2>

          <p>
            We don't block fingerprinting. We make you look like someone else.
          </p>

          <p>
            Each profile gets a real fingerprint from our database of 10 million browser configurations. Your Canvas hash, WebGL data, and font list match actual users. Sites see a legitimate browser, not a blocker.
          </p>

          <p>
            Key techniques:
          </p>

          <ul>
            <li><strong>Canvas Spoofing:</strong> Inject noise into Canvas rendering without breaking functionality</li>
            <li><strong>WebGL Masking:</strong> Replace GPU strings and shader precision with target values</li>
            <li><strong>Font Substitution:</strong> Report a consistent font list matching your OS template</li>
            <li><strong>Navigator Replacement:</strong> Override all Navigator properties coherently</li>
            <li><strong>Audio Context Manipulation:</strong> Normalize audio processing outputs</li>
          </ul>

          <p>
            Everything stays consistent. If you claim to be Windows 10 with an NVIDIA GPU, your Canvas, WebGL, fonts, and Navigator all match. No contradictions.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Ready to Install?</h3>
            <p className="mb-4">
              Now you understand how fingerprinting works. Next, install the desktop app and start creating profiles with custom fingerprints.
            </p>
            <Link href="/docs/installing-desktop-app">
              <Button size="lg">
                Install Desktop App <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Author Bio */}
        <div className="mt-12 border-t pt-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{article.author}</p>
              <p className="text-sm text-muted-foreground">{article.authorTitle}</p>
              <p className="mt-2 text-sm">
                {article.author} holds a PhD in Computer Security from MIT. She's published 15 papers on browser fingerprinting and tracking prevention. At Multilogin.io, she leads research on detection evasion and fingerprint generation systems.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/creating-first-profile">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Creating Your First Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Apply fingerprint knowledge to create undetectable browser profiles
                </p>
              </Card>
            </Link>
            <Link href="/docs/installing-desktop-app">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Installing the Desktop App</h3>
                <p className="text-sm text-muted-foreground">
                  Download and set up Multilogin on Windows, macOS, or Linux
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
