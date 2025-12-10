import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav';
import { ArrowLeft, Calendar, Clock, User, Check, X, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Web Scraping Guide 2024: How to Extract Data Without Getting Blocked',
  description:
    'Complete guide to ethical web scraping. Learn techniques, tools, and strategies to extract data at scale while respecting websites and avoiding bans.',
};

const article = {
  title: 'Web Scraping Guide: Extract Data at Scale Without Getting Blocked',
  excerpt: 'Master web scraping from basics to advanced techniques. Avoid detection, handle anti-bot systems, and scrape ethically at massive scale.',
  author: 'Alex Rivera',
  date: 'November 10, 2024',
  datePublished: '2024-11-10T00:00:00Z',
  dateModified: '2024-11-10T00:00:00Z',
  readTime: '10 min',
  category: 'Technical Guides',
  image: `${siteConfig.url}/blog/web-scraping.jpg`,
};

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/web-scraping-guide`,
    },
    articleSection: article.category,
    proficiencyLevel: 'Intermediate',
    wordCount: 1900,
    timeRequired: 'PT10M',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BreadcrumbNav
        items={[
          { name: 'Blog', href: '/blog' },
          { name: 'Web Scraping Guide' },
        ]}
      />

      <article className="container py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <span className="text-sm text-muted-foreground">{article.readTime} read</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
            </div>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              You need data. Competitor prices. Market research. Lead generation. SEO monitoring. The data exists on websites. Getting it manually? Impossible at scale. Web scraping solves this. Done right.
            </p>

            <Card className="p-6 mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Legal & Ethical Note</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Scraping is legal for publicly available data in most jurisdictions (hiQ Labs v. LinkedIn, 2019). However, check robots.txt, terms of service, and local laws. Respect rate limits. Don&apos;t scrape personal data without consent. This guide is educational.
                  </p>
                </div>
              </div>
            </Card>

            <h2>What is Web Scraping? The Fundamentals</h2>
            <p>
              Web scraping extracts data from websites programmatically. Instead of manually copying information, automated scripts collect it.
            </p>
            <p>
              How it works: Your script sends HTTP requests to a website. Receives HTML response. Parses HTML to extract specific data points. Stores data in structured format (CSV, JSON, database).
            </p>
            <p>
              Simple example: Scraping product prices from Amazon. Script visits product pages. Extracts price elements. Saves to spreadsheet. Run daily for price tracking.
            </p>

            <h2>Why Websites Block Scrapers</h2>
            <p>
              Websites invest resources in infrastructure. Scrapers consume bandwidth without providing value (no ad views, no purchases). Plus security concerns—distinguishing legitimate scrapers from malicious bots is hard.
            </p>
            <p>
              <strong>Server load.</strong> 1000 scrapers hitting your site simultaneously crashes servers. Costs money. Angers real users.
            </p>
            <p>
              <strong>Competitive disadvantage.</strong> You spent years building product database. Competitor scrapes it in one day. Unfair.
            </p>
            <p>
              <strong>Data protection.</strong> Personal information, pricing strategies, proprietary data. Scraping might violate privacy laws or competitive intelligence agreements.
            </p>

            <h2>Detection Methods: How Websites Catch Scrapers</h2>
            <p>
              Modern anti-scraping systems use multiple detection layers. Bypass them all or get blocked.
            </p>

            <h3>Rate Limiting</h3>
            <p>
              Simple but effective. Normal user visits 10 pages per minute. Scraper visits 1000. Obvious bot behavior.
            </p>
            <p>
              Websites track requests per IP. Exceed threshold, you&apos;re blocked. Temporary ban or permanent, depends on severity.
            </p>

            <h3>User Agent Detection</h3>
            <p>
              HTTP headers reveal your identity. Python's requests library sends "python-requests/2.28.1" user agent. Dead giveaway.
            </p>
            <p>
              Websites block common bot user agents. Python, curl, wget, scrapy—all flagged automatically.
            </p>

            <h3>JavaScript Challenges</h3>
            <p>
              Static scrapers request HTML, parse it, done. But modern sites load content via JavaScript. React, Vue, Angular apps render client-side.
            </p>
            <p>
              Your scraper sees blank page or loading spinner. Actual content never loaded because JavaScript never executed.
            </p>

            <h3>CAPTCHAs and Bot Detection</h3>
            <p>
              reCAPTCHA, hCaptcha, PerimeterX. These services analyze mouse movements, typing patterns, browser fingerprints. Determine if you&apos;re human.
            </p>
            <p>
              Headless browsers get flagged instantly. Missing properties: navigator.webdriver = true, Chrome DevTools protocol detectable, no GPU rendering.
            </p>

            <h3>IP Reputation</h3>
            <p>
              Datacenter IPs (AWS, DigitalOcean, Google Cloud) flagged aggressively. Websites know data centers host bots, not humans.
            </p>
            <p>
              IP blacklists shared across sites. Get blocked on one site, you&apos;re flagged everywhere.
            </p>

            <h3>Behavioral Analysis</h3>
            <p>
              Machine learning models detect unnatural patterns. Perfect scrolling. No mouse movement variability. Instant navigation. Scrapers behave too perfectly.
            </p>
            <p>
              Human behavior is messy. Hesitation. Back buttons. Typos. Random exploration. Bots lack this randomness.
            </p>

            <Card className="p-6 my-6 bg-muted/30">
              <h3 className="font-semibold mb-4 text-lg">Detection Methods Ranked by Effectiveness</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4">Method</th>
                      <th className="text-left py-2 pr-4">Difficulty to Bypass</th>
                      <th className="text-left py-2">Common On</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">Rate Limiting</td>
                      <td className="py-2 pr-4">Easy</td>
                      <td className="py-2">All Sites</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">User Agent Checks</td>
                      <td className="py-2 pr-4">Easy</td>
                      <td className="py-2">Most Sites</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">JavaScript Challenges</td>
                      <td className="py-2 pr-4">Medium</td>
                      <td className="py-2">Modern Sites</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">IP Reputation</td>
                      <td className="py-2 pr-4">Medium-Hard</td>
                      <td className="py-2">E-commerce, Finance</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">CAPTCHA</td>
                      <td className="py-2 pr-4">Hard</td>
                      <td className="py-2">High-Traffic Sites</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Fingerprint + Behavior ML</td>
                      <td className="py-2 pr-4">Very Hard</td>
                      <td className="py-2">Amazon, Google, Social Media</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <h2>Building Your First Scraper</h2>
            <p>
              Start simple. Complexity comes later.
            </p>

            <h3>Tools You&apos;ll Need</h3>
            <p>
              <strong>Python:</strong> Best language for scraping. Libraries: requests (HTTP), BeautifulSoup (HTML parsing), Scrapy (full framework).
            </p>
            <p>
              <strong>JavaScript:</strong> Node.js with Puppeteer or Playwright. Good for JavaScript-heavy sites.
            </p>
            <p>
              <strong>No-Code Tools:</strong> Octoparse, ParseHub, Import.io. Easier but less flexible.
            </p>

            <h3>Basic Scraper Structure</h3>
            <p>
              1. Send request to URL<br />
              2. Get HTML response<br />
              3. Parse HTML (BeautifulSoup, CSS selectors)<br />
              4. Extract target data<br />
              5. Store data (CSV, JSON, database)<br />
              6. Repeat for next page
            </p>

            <h3>Simple Example (Python)</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import requests
from bs4 import BeautifulSoup

# Send request
url = "https://example.com/products"
response = requests.get(url)

# Parse HTML
soup = BeautifulSoup(response.text, 'html.parser')

# Extract data
products = soup.find_all('div', class_='product')
for product in products:
    name = product.find('h3').text
    price = product.find('span', class_='price').text
    print(f"{name}: {price}")`}
            </pre>

            <p>
              This works for simple sites. Real-world scraping needs more sophistication.
            </p>

            <h2>Advanced Techniques: Avoiding Detection</h2>
            <p>
              Professional scrapers use multiple strategies simultaneously.
            </p>

            <h3>Rotating Residential Proxies</h3>
            <p>
              Datacenter IPs get blocked. Residential IPs (real home addresses) look like real users.
            </p>
            <p>
              Rotate IP with each request or every N requests. Distributes load. Prevents per-IP rate limiting.
            </p>
            <p>
              Good providers: Bright Data, Oxylabs, Smartproxy. Cost: $5-15 per GB. Expensive but necessary for serious scraping.
            </p>

            <h3>User Agent Rotation</h3>
            <p>
              Don&apos;t use single user agent. Rotate between realistic browsers.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0'
]
headers = {'User-Agent': random.choice(user_agents)}`}
            </pre>

            <h3>Request Delays and Randomization</h3>
            <p>
              Add delays between requests. Not fixed delays—randomized delays.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import time
import random

# Bad: Fixed delay
time.sleep(1)  # Too predictable

# Good: Random delay
time.sleep(random.uniform(2, 5))  # Between 2-5 seconds`}
            </pre>
            <p>
              Mimic human behavior. Humans don&apos;t click every 1.000 seconds. They vary.
            </p>

            <h3>JavaScript Rendering</h3>
            <p>
              For React/Vue/Angular sites, use headless browsers. Puppeteer (Node.js) or Selenium (Python).
            </p>
            <p>
              Puppeteer can intercept requests, block images/CSS (faster scraping), execute JavaScript, handle dynamic content.
            </p>
            <p>
              Downside: Slower and more resource-intensive than simple HTTP requests. Use only when necessary.
            </p>

            <h3>Browser Fingerprint Spoofing</h3>
            <p>
              Headless browsers leave fingerprint traces. navigator.webdriver = true immediately flags you.
            </p>
            <p>
              Anti-detect browsers solve this. Each scraper instance gets unique, realistic fingerprint. Canvas, WebGL, fonts all properly spoofed.
            </p>
            <p>
              Multilogin.io or similar tools. Create profiles with consistent fingerprints. Websites see real users, not bots.
            </p>

            <h3>Session Management</h3>
            <p>
              Maintain cookies across requests. Some sites require login sessions. Use requests.Session() in Python or maintain cookie jars.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`session = requests.Session()
session.get('https://example.com/login', auth=('user', 'pass'))
# Subsequent requests maintain login state
data = session.get('https://example.com/protected-page')`}
            </pre>

            <h2>Handling CAPTCHAs</h2>
            <p>
              CAPTCHA = Completely Automated Public Turing test to tell Computers and Humans Apart. Designed to stop you.
            </p>

            <h3>CAPTCHA Solving Services</h3>
            <p>
              2Captcha, AntiCaptcha, Death By Captcha. Human workers solve CAPTCHAs for $1-3 per 1000 solutions.
            </p>
            <p>
              How it works:
            </p>
            <ol>
              <li>Your script encounters CAPTCHA</li>
              <li>Sends CAPTCHA image to solving service API</li>
              <li>Human worker solves it (15-30 seconds)</li>
              <li>Service returns solution</li>
              <li>Your script submits solution, continues scraping</li>
            </ol>
            <p>
              Ethical gray area. Effective but slow and costs money.
            </p>

            <h3>Avoiding CAPTCHAs Entirely</h3>
            <p>
              Better strategy: Don&apos;t trigger CAPTCHAs. Realistic fingerprints, residential IPs, human-like behavior.
            </p>
            <p>
              Sites only show CAPTCHAs when suspicious. Look legitimate, no CAPTCHA appears.
            </p>

            <h2>Scaling: From 1000 to 1 Million Pages</h2>
            <p>
              Small-scale scraping is easy. Large-scale requires architecture changes.
            </p>

            <h3>Distributed Scraping</h3>
            <p>
              Single machine limited by CPU, bandwidth, IP. Distribute across multiple machines.
            </p>
            <p>
              Tools: Scrapy Cloud, AWS Lambda functions, Kubernetes clusters. Each instance scrapes subset of data.
            </p>

            <h3>Database Optimization</h3>
            <p>
              Don&apos;t write to CSV for millions of records. Use proper database. PostgreSQL, MongoDB, or time-series database like TimescaleDB.
            </p>
            <p>
              Index properly. Query optimization matters at scale.
            </p>

            <h3>Queue Management</h3>
            <p>
              URLs to scrape go in queue (Redis, RabbitMQ). Workers pull from queue, scrape, push results to database.
            </p>
            <p>
              Failed requests go back in queue with backoff. Retry logic prevents data loss.
            </p>

            <h3>Monitoring and Alerting</h3>
            <p>
              Track success rates, error rates, scraping speed. Alert when success rate drops below 95%. Means detection systems changed.
            </p>
            <p>
              Grafana + Prometheus common stack. Real-time dashboards showing scraper health.
            </p>

            <h2>Legal and Ethical Scraping</h2>
            <p>
              Just because you can scrape doesn&apos;t mean you should.
            </p>

            <h3>Check robots.txt</h3>
            <p>
              robots.txt file tells scrapers what&apos;s allowed. Not legally binding but polite to follow.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/`}
            </pre>
            <p>
              Respect these rules. Scraping /admin/ when disallowed is aggressive.
            </p>

            <h3>Rate Limiting Self-Imposed</h3>
            <p>
              Even if you can send 1000 requests per second, don&apos;t. Limit to 1-5 per second for most sites.
            </p>
            <p>
              Large sites (Amazon, Google) can handle more. Small sites might crash. Be considerate.
            </p>

            <h3>Personal Data</h3>
            <p>
              GDPR in Europe, CCPA in California. Scraping personal information has legal implications.
            </p>
            <p>
              Public data generally fine. Private data (behind login, email addresses, phone numbers) risky. Consult lawyer.
            </p>

            <h3>Terms of Service</h3>
            <p>
              Many sites explicitly prohibit scraping in ToS. Violation could lead to account termination or lawsuit.
            </p>
            <p>
              LinkedIn v. hiQ Labs (2019) ruled scraping public data is legal even if ToS prohibits it. But this is US-specific and not universal.
            </p>

            <Card className="p-6 my-6 bg-muted/30">
              <h3 className="font-semibold mb-4 text-lg">Scraping Best Practices Checklist</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Check robots.txt and respect Disallow directives</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Use residential proxies, not datacenter IPs</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Add random delays between requests (2-5 seconds)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Rotate user agents to match real browsers</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Use realistic browser fingerprints (anti-detect browsers)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Implement retry logic with exponential backoff</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Monitor success rates and adjust when blocked</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Scrape during off-peak hours when possible</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Cache data to avoid redundant requests</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Consider API alternatives before scraping</span>
                </div>
              </div>
            </Card>

            <h2>Common Use Cases</h2>
            <p>
              <strong>Price Monitoring:</strong> Track competitor prices. Adjust your pricing dynamically. E-commerce essential.
            </p>
            <p>
              <strong>Lead Generation:</strong> Extract contact info from public directories. B2B sales teams use extensively.
            </p>
            <p>
              <strong>Market Research:</strong> Analyze product reviews, ratings, sentiment. Inform product development.
            </p>
            <p>
              <strong>SEO Monitoring:</strong> Check search rankings across geolocations. Track SERP features. Competitor analysis.
            </p>
            <p>
              <strong>Real Estate:</strong> Aggregate listings from multiple sites. Property data, price trends, market analysis.
            </p>
            <p>
              <strong>Job Aggregation:</strong> Scrape job boards. Create job search engine. Indeed started this way.
            </p>
            <p>
              <strong>Financial Data:</strong> Stock prices, news sentiment, earnings reports. Algorithmic trading research.
            </p>

            <h2>Troubleshooting Common Issues</h2>
            <p>
              <strong>Empty responses:</strong> Likely JavaScript-rendered content. Use Puppeteer/Selenium instead of requests.
            </p>
            <p>
              <strong>403 Forbidden errors:</strong> Bot detected. Improve fingerprint, use residential proxies, slow down.
            </p>
            <p>
              <strong>Inconsistent results:</strong> Site serves different content based on location. Use geographically appropriate proxies.
            </p>
            <p>
              <strong>Connection timeouts:</strong> Too fast. Servers can&apos;t handle request volume. Add delays.
            </p>
            <p>
              <strong>CAPTCHA walls:</strong> Need better fingerprinting or CAPTCHA solving service.
            </p>

            <h2>The Future of Web Scraping</h2>
            <p>
              Arms race continues. Websites develop better detection. Scrapers develop better evasion.
            </p>
            <p>
              <strong>AI-powered detection:</strong> Machine learning models detecting bot behavior patterns. Requires AI-powered evasion.
            </p>
            <p>
              <strong>Browser automation detection:</strong> Websites detecting Puppeteer, Selenium. Anti-detect browsers becoming mandatory.
            </p>
            <p>
              <strong>Legal landscape shifting:</strong> More court cases. More legislation. Gray areas becoming clearer (sometimes in scrapers&apos; favor, sometimes not).
            </p>
            <p>
              <strong>API-first approach:</strong> Some sites offering official APIs. Paid access better than scraping. More sustainable long-term.
            </p>

            <h2>Final Thoughts</h2>
            <p>
              Web scraping is powerful tool. Democratizes data access. Levels playing field for small companies competing with giants.
            </p>
            <p>
              But with power comes responsibility. Scrape ethically. Respect rate limits. Don&apos;t crash servers. Follow laws.
            </p>
            <p>
              Done right, web scraping drives business intelligence, research, and innovation. Done wrong, it&apos;s hostile and illegal.
            </p>
            <p>
              Start small. Test carefully. Scale gradually. Monitor constantly. That&apos;s professional scraping.
            </p>
          </div>

          <Card className="p-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{article.author}</h3>
                <p className="text-sm text-muted-foreground mb-3">Data Engineer & Web Scraping Specialist</p>
                <p className="text-sm text-muted-foreground">
                  Alex has built scraping infrastructure processing 50M+ pages daily for price intelligence, market research, and SEO monitoring across 15 industries. He specializes in anti-detection techniques and scalable architectures.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 mt-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Professional Web Scraping Infrastructure</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Multilogin.io provides realistic browser fingerprints essential for large-scale scraping. Avoid detection with properly spoofed profiles.
              </p>
              <Link href="/register">
                <Button size="lg">Start Scraping Right</Button>
              </Link>
            </div>
          </Card>
        </div>
      </article>
    </>
  );
}
