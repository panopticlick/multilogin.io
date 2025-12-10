export const siteConfig = {
  name: 'Multilogin.io',
  description:
    'Free multi-browser profile manager with cloud sync. Manage multiple browser identities with advanced fingerprinting, team collaboration, and seamless session sync.',
  url: 'https://multilogin.io',
  ogImage: 'https://multilogin.io/og.png',
  links: {
    twitter: 'https://twitter.com/multilogin_io',
    github: 'https://github.com/multilogin',
    discord: 'https://discord.gg/multilogin',
  },
  creator: 'Multilogin.io Team',
  contact: {
    privacy: 'Privacy@multilogin.io',
    support: 'support@multilogin.io',
    sales: 'sales@multilogin.io',
  },
  stats: {
    users: '10,000+',
    profiles: '500,000+',
    uptime: '99.9%',
    rating: 4.9,
  },
  keywords: [
    'multilogin',
    'antidetect browser',
    'browser fingerprint',
    'multiple browser profiles',
    'cloud sync',
    'browser profile manager',
    'multi-account management',
    'fingerprint spoofing',
    'team collaboration',
    'proxy management',
    'privacy tools',
    'account security',
    'browser automation',
    'how to manage multiple accounts safely',
  ],
};

export const pricingPlans = [
  {
    name: 'Free Forever',
    description: 'All features unlocked for everyone',
    price: 0,
    priceAnnual: 0,
    features: [
      'Unlimited browser profiles',
      'Unlimited team members',
      'All fingerprint templates',
      'Unlimited API requests',
      'Proxy management',
      'Time machine & audit logs',
      'Cloud sync',
      'Priority support',
    ],
    limitations: [],
    cta: 'Get Started Free',
    popular: true,
  },
];

export const navigation = {
  marketing: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/docs' },
    { name: 'Blog', href: '/blog' },
  ],
  cta: [
    { name: 'Login', href: '/login', variant: 'ghost' as const },
    { name: 'Get Started', href: '/register', variant: 'default' as const },
  ],
  dashboard: [
    { name: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'Users', badge: 'Core' },
    { name: 'Groups', href: '/dashboard/groups', icon: 'FolderKanban' },
    { name: 'Proxies', href: '/dashboard/proxies', icon: 'Globe' },
    { name: 'Team', href: '/dashboard/team', icon: 'Users2' },
    { name: 'Scripts', href: '/dashboard/scripts', icon: 'Zap' },
  ],
  dashboardFooter: [
    { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
  ],
  footer: {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Download', href: '/download' },
      { name: 'Docs', href: '/docs' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy', href: '/legal/privacy' },
      { name: 'Terms', href: '/legal/terms' },
    ],
  },
};

export const features = [
  {
    title: 'Cloud Sync',
    description:
      'Your browser profiles sync automatically across all devices. Pick up where you left off, anywhere.',
    icon: 'Cloud',
  },
  {
    title: 'Fingerprint Templates',
    description:
      'Consistent, realistic fingerprints from pre-built templates. Never get flagged for impossible combinations.',
    icon: 'Fingerprint',
  },
  {
    title: 'Team Collaboration',
    description:
      'Share profiles with your team. Role-based access control and activity logging keep everyone accountable.',
    icon: 'Users',
  },
  {
    title: 'Proxy Management',
    description:
      'Built-in proxy pools with rotation. HTTP, SOCKS4, SOCKS5 support with authentication.',
    icon: 'Globe',
  },
  {
    title: 'Session Persistence',
    description:
      'Cookies, localStorage, and session data preserved. Log in once, stay logged in forever.',
    icon: 'Database',
  },
  {
    title: 'API Access',
    description:
      'Full REST API for automation. Integrate with your existing tools and workflows.',
    icon: 'Code',
  },
];

export const testimonials = [
  {
    quote:
      "Multilogin.io saved us hours every week. Managing 50+ social media accounts is now effortless.",
    author: 'Sarah Chen',
    role: 'Social Media Manager',
    company: 'Growth Agency',
    avatar: '/testimonials/sarah.svg',
  },
  {
    quote:
      "The cloud sync feature is a game changer. I can switch between my home and office seamlessly.",
    author: 'Marcus Johnson',
    role: 'E-commerce Seller',
    company: 'Amazon FBA',
    avatar: '/testimonials/marcus.svg',
  },
  {
    quote:
      "Best free antidetect browser I've found. The fingerprint templates actually work.",
    author: 'Alex Rivera',
    role: 'Affiliate Marketer',
    company: 'Independent',
    avatar: '/testimonials/alex.svg',
  },
];

export const faqs = [
  {
    question: 'What is an antidetect browser?',
    answer:
      'An antidetect browser allows you to create separate browser profiles, each with unique fingerprints. This prevents websites from linking your different accounts or activities together.',
  },
  {
    question: 'Is Multilogin.io free?',
    answer:
      'Yes! Multilogin.io is completely free forever. All features are unlocked with no credit card required, no limits, and no upgrade prompts.',
  },
  {
    question: 'How does cloud sync work?',
    answer:
      'Your cookies, localStorage, and session data are encrypted and synced to our cloud. When you launch a profile on a different device, everything is restored automatically.',
  },
  {
    question: 'Can I use my own proxies?',
    answer:
      'Yes. We support HTTP, HTTPS, SOCKS4, and SOCKS5 proxies with authentication. You can assign proxies to individual profiles or create proxy pools for automatic rotation.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. All data is encrypted at rest and in transit. We use industry-standard AES-256 encryption and never store your passwords in plain text.',
  },
  {
    question: 'Do you offer team features?',
    answer:
      'Yes. Role-based access control, invites, and audit logs are available to every workspace, completely free with no seat limits.',
  },
];
