import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, User, Settings, AlertTriangle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';

const article = {
  title: 'Fingerprint Customization',
  description: 'Advanced guide to customizing browser fingerprints. Manual Canvas, WebGL, font configuration, navigator spoofing, and timezone manipulation for maximum control.',
  author: 'Elena Volkov',
  authorTitle: 'Senior Detection Engineer',
  publishedAt: '2024-01-28',
  readingTime: '8 min read',
  category: 'Browser Profiles',
  wordCount: 1300,
};

export const metadata: Metadata = {
  title: `${article.title} | ${siteConfig.name}`,
  description: article.description,
  keywords: [
    'fingerprint customization',
    'canvas spoofing',
    'webgl customization',
    'font fingerprint',
    'navigator spoofing',
    'advanced fingerprinting',
    'custom browser fingerprint',
  ],
  authors: [{ name: article.author }],
  openGraph: {
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.publishedAt,
    authors: [article.author],
    url: `${siteConfig.url}/docs/fingerprint-customization`,
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
};

export default function FingerprintCustomizationPage() {
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
    timeRequired: 'PT8M',
    proficiencyLevel: 'Advanced',
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
            Templates work for 95% of users. But if you need ultimate control or are bypassing advanced detection, manual customization gives you precision control over all 47 fingerprint parameters.
          </p>

          <Card className="my-6 p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-2">Advanced Users Only</p>
                <p className="text-sm mb-0">
                  Incorrect customization creates detectable inconsistencies. Only modify parameters if you understand fingerprinting deeply. Bad custom fingerprints perform worse than templates.
                </p>
              </div>
            </div>
          </Card>

          <h2>Accessing Advanced Settings</h2>

          <p>
            In your profile editor, click "Advanced Fingerprint Settings" at the bottom. This unlocks manual control over all parameters.
          </p>

          <p>
            You'll see eight customization sections:
          </p>

          <ol>
            <li>Canvas & WebGL</li>
            <li>Fonts & Text Rendering</li>
            <li>Navigator Object</li>
            <li>Screen & Display</li>
            <li>Audio Context</li>
            <li>WebRTC & Media Devices</li>
            <li>Hardware & Sensors</li>
            <li>Browser Behavior</li>
          </ol>

          <h2>Canvas Fingerprint Customization</h2>

          <p>
            Canvas is your most important fingerprint. Get this wrong and you're flagged immediately.
          </p>

          <p>
            <strong>Noise Level:</strong> Controls pixel variation in Canvas rendering. Options:
          </p>

          <ul>
            <li><strong>Off:</strong> No spoofing. Uses your real GPU signature (not recommended)</li>
            <li><strong>Low (1-2%):</strong> Subtle noise. Sites rarely detect differences</li>
            <li><strong>Medium (3-5%):</strong> Default. Good balance of uniqueness and stability</li>
            <li><strong>High (6-10%):</strong> Aggressive. May break some Canvas-dependent sites</li>
          </ul>

          <p>
            Use Medium for most cases. Use High only if you're getting Canvas-based detection.
          </p>

          <p>
            <strong>Hash Consistency:</strong> Canvas hash should stay constant within a profile but differ between profiles. Our system ensures this automatically, but you can:
          </p>

          <ul>
            <li><strong>Randomize on Each Session:</strong> New Canvas hash every browser restart. Good for scraping. Bad for accounts that track device persistence.</li>
            <li><strong>Fixed Hash:</strong> Same Canvas hash forever. Required for e-commerce and social media.</li>
          </ul>

          <p>
            Pick Fixed Hash unless you're specifically testing Canvas detection systems.
          </p>

          <h2>WebGL Configuration</h2>

          <p>
            WebGL exposes your GPU. Sites use it to fingerprint hardware and validate Canvas consistency.
          </p>

          <p>
            <strong>GPU Vendor Selection:</strong>
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Market Share</th>
                  <th>Best For</th>
                  <th>Detection Risk</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Intel HD Graphics</td>
                  <td>42%</td>
                  <td>Laptops, budget desktops</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>NVIDIA GeForce</td>
                  <td>31%</td>
                  <td>Gaming, high-end workstations</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>AMD Radeon</td>
                  <td>18%</td>
                  <td>Budget gaming, general use</td>
                  <td>Medium</td>
                </tr>
                <tr>
                  <td>Apple Silicon</td>
                  <td>6%</td>
                  <td>M1/M2/M3 Macs only</td>
                  <td>Low (Mac only)</td>
                </tr>
                <tr>
                  <td>Other/Custom</td>
                  <td>3%</td>
                  <td>Advanced users</td>
                  <td>High</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Match your GPU to your claimed OS and device type. Don't claim Intel HD Graphics if you're using a high-end datacenter proxy. That screams bot.
          </p>

          <p>
            <strong>Renderer String:</strong> Specific GPU model. Examples:
          </p>

          <ul>
            <li>"ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)"</li>
            <li>"NVIDIA Corporation - NVIDIA GeForce RTX 3060/PCIe/SSE2"</li>
            <li>"Apple M1"</li>
          </ul>

          <p>
            Use realistic strings from our database dropdown. Don't make up custom strings. Sites validate against known GPU models.
          </p>

          <p>
            <strong>Shader Precision:</strong> High, medium, or low. Desktop GPUs report "high" for everything. Mobile GPUs report "medium" for some shaders. Match your device type.
          </p>

          <h2>Font List Customization</h2>

          <p>
            Your font list must match your OS and software. Mismatches are instant red flags.
          </p>

          <p>
            We provide three modes:
          </p>

          <ol>
            <li><strong>Template-Based:</strong> Uses fonts from your chosen OS template (Windows, Mac, Linux)</li>
            <li><strong>Custom List:</strong> You provide exact font names</li>
            <li><strong>Real System:</strong> Reports your actual installed fonts (least private)</li>
          </ol>

          <p>
            Stick with Template-Based. It includes the right fonts for your OS and common software.
          </p>

          <p>
            If you use Custom List, follow these rules:
          </p>

          <ul>
            <li>Include system defaults: Arial, Times New Roman, Verdana</li>
            <li>Match OS signatures (Segoe UI for Windows, San Francisco for Mac)</li>
            <li>Add office suite fonts if claiming Microsoft Office: Calibri, Cambria, Candara</li>
            <li>Don't mix OS-specific fonts (don't include both Segoe UI and San Francisco)</li>
          </ul>

          <h2>Navigator Object Spoofing</h2>

          <p>
            The Navigator object exposes browser and system info. Every value must be consistent.
          </p>

          <p>
            Key parameters:
          </p>

          <p>
            <strong>User Agent:</strong> Your browser's identity string. Format:
          </p>

          <pre><code>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36</code></pre>

          <p>
            Components must match:
          </p>

          <ul>
            <li>Windows NT 10.0 = Windows 10</li>
            <li>Win64; x64 = 64-bit architecture</li>
            <li>Chrome/120.0.0.0 = Browser version</li>
          </ul>

          <p>
            Don't use outdated User Agents. Chrome 120+ is current as of January 2024. Chrome 90 would flag you as a bot.
          </p>

          <p>
            <strong>Platform:</strong> Must match User Agent:
          </p>

          <ul>
            <li>"Win32" for all Windows (even 64-bit reports Win32)</li>
            <li>"MacIntel" for all Intel and Apple Silicon Macs</li>
            <li>"Linux x86_64" for 64-bit Linux</li>
          </ul>

          <p>
            <strong>Hardware Concurrency:</strong> CPU core count. Common values:
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Common Values</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Budget Laptop</td>
                  <td>2, 4</td>
                  <td>Dual-core with hyperthreading</td>
                </tr>
                <tr>
                  <td>Standard Laptop/Desktop</td>
                  <td>4, 6, 8</td>
                  <td>Most common</td>
                </tr>
                <tr>
                  <td>High-End Desktop</td>
                  <td>12, 16</td>
                  <td>Gaming or workstation</td>
                </tr>
                <tr>
                  <td>Workstation</td>
                  <td>24, 32</td>
                  <td>Professional use only</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Don't claim 64 cores. That's server hardware. You'll get flagged.
          </p>

          <p>
            <strong>Device Memory:</strong> RAM in GB. Common: 4, 8, 16, 32. Match your device type. Budget devices report 4GB. High-end reports 16-32GB.
          </p>

          <h2>Screen Resolution and Display Settings</h2>

          <p>
            Screen parameters must be consistent and common.
          </p>

          <p>
            <strong>Safe Resolutions by Device:</strong>
          </p>

          <div className="my-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Resolution</th>
                  <th>Market Share</th>
                  <th>Device Type</th>
                  <th>Pixel Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1920x1080</td>
                  <td>35%</td>
                  <td>Desktop, laptop</td>
                  <td>1x</td>
                </tr>
                <tr>
                  <td>1366x768</td>
                  <td>22%</td>
                  <td>Budget laptop</td>
                  <td>1x</td>
                </tr>
                <tr>
                  <td>2560x1440</td>
                  <td>12%</td>
                  <td>High-end desktop</td>
                  <td>1x</td>
                </tr>
                <tr>
                  <td>1536x864</td>
                  <td>8%</td>
                  <td>Laptop</td>
                  <td>1x</td>
                </tr>
                <tr>
                  <td>2880x1800</td>
                  <td>4%</td>
                  <td>MacBook Pro</td>
                  <td>2x (Retina)</td>
                </tr>
                <tr>
                  <td>3840x2160</td>
                  <td>3%</td>
                  <td>4K desktop</td>
                  <td>1x or 1.5x</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Available Screen Size:</strong> Resolution minus taskbar/dock height. If screen is 1920x1080 and taskbar is 40px, available height is 1040px.
          </p>

          <p>
            <strong>Color Depth:</strong> Almost always 24 bits. Some high-end displays report 30 or 48. Use 24 unless you know what you're doing.
          </p>

          <h2>Timezone and Geolocation Alignment</h2>

          <p>
            Timezone must match your proxy location. This is critical.
          </p>

          <p>
            Sites compare:
          </p>

          <ol>
            <li>IP geolocation from your proxy</li>
            <li>Browser timezone from Intl.DateTimeFormat</li>
            <li>Timezone offset from getTimezoneOffset()</li>
          </ol>

          <p>
            All three must align. Proxy in Dallas, Texas? Use America/Chicago (UTC-6). Proxy in London? Use Europe/London (UTC+0).
          </p>

          <p>
            Don't forget daylight saving time. America/Chicago is UTC-6 in winter, UTC-5 in summer.
          </p>

          <h2>Audio Context Fingerprinting</h2>

          <p>
            Audio Context generates a signature from your audio processing stack. Most users should use "Noise" mode which adds subtle randomization.
          </p>

          <p>
            Options:
          </p>

          <ul>
            <li><strong>Off:</strong> Real audio signature (not recommended)</li>
            <li><strong>Noise:</strong> Add randomization to audio output</li>
            <li><strong>Block:</strong> Disable Audio Context API entirely (breaks some sites)</li>
          </ul>

          <p>
            Use Noise unless a specific site breaks.
          </p>

          <h2>Validation and Testing</h2>

          <p>
            After customization, test your fingerprint:
          </p>

          <ol>
            <li><strong>pixelscan.net:</strong> Comprehensive fingerprint analysis</li>
            <li><strong>browserleaks.com:</strong> Canvas, WebGL, WebRTC leak tests</li>
            <li><strong>amiunique.org:</strong> Uniqueness score (aim for 1 in 1000+)</li>
          </ol>

          <p>
            Look for consistency errors:
          </p>

          <ul>
            <li>Canvas and WebGL GPU must match</li>
            <li>User Agent OS must match Platform and fonts</li>
            <li>Screen resolution should match common values</li>
            <li>Timezone must match geolocation</li>
          </ul>

          <p>
            If you see warnings about inconsistencies, fix them immediately.
          </p>

          <Card className="my-8 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Master Session Management</h3>
            <p className="mb-4">
              Your custom fingerprint is perfect. Now learn how to manage browser sessions, persist data, and handle cookies across profile restarts.
            </p>
            <Link href="/docs/session-management">
              <Button size="lg">
                Session Management <ArrowRight className="ml-2 h-4 w-4" />
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
                {article.author} reverse-engineers detection systems for Multilogin.io. She's bypassed fingerprinting on 100+ platforms and discovered 23 novel detection methods used by major sites.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/docs/profile-templates">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Profile Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Start with templates before diving into manual customization
                </p>
              </Card>
            </Link>
            <Link href="/docs/understanding-fingerprints">
              <Card className="p-6 hover:border-primary transition-colors h-full">
                <h3 className="font-semibold mb-2">Understanding Fingerprints</h3>
                <p className="text-sm text-muted-foreground">
                  Deep technical background on how fingerprinting actually works
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
