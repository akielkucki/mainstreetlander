/**
 * content.ts — single source of truth for all marketing copy & structured data.
 *
 * Edit pricing, FAQs, projects, portfolio items, nav links and contact details
 * here; the `.astro` sections render from these arrays. A solo dev can change
 * the funnel without touching markup.
 */

/* -------------------------------------------------------------------------- */
/* Site / brand                                                               */
/* -------------------------------------------------------------------------- */

export const site = {
  name: 'MainStreetLander',
  legalName: 'MainStreetLander Co.',
  tagline: 'Get your main-street business online — fast — then grow it.',
  description:
    'MainStreetLander builds polished websites for local main-street businesses in a day, then grows them with SEO, Google Ads and ongoing care. Starter sites from $297.',
  url: 'https://mainstreetlander.com', // TODO: real production domain
  email: 'hello@mainstreetlander.com', // TODO: real inbox
  phone: '+1 (215) 555-0142', // TODO: real phone number
  serviceArea: ['Doylestown', 'Bucks County', 'Pennsylvania'],
  social: {
    instagram: 'https://instagram.com/mainstreetlander', // TODO
    facebook: 'https://facebook.com/mainstreetlander', // TODO
    linkedin: 'https://linkedin.com/company/mainstreetlander', // TODO
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Work', href: '#work' },
  { label: 'FAQ', href: '#faq' },
];

/** Anchor every "Get Started" CTA points at. */
export const CONTACT_ANCHOR = '#get-started';

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

export interface Step {
  title: string;
  body: string;
}

export const steps: Step[] = [
  {
    title: 'We build your site',
    body: 'Send us your business name and a few details. We design and ship a clean, fast website — often within a day.',
  },
  {
    title: 'You review & approve',
    body: 'See it live before you pay a cent of anything recurring. Want tweaks? We handle them. No approval, no commitment.',
  },
  {
    title: 'We host, maintain & grow it',
    body: 'Once you love it, we keep it online, updated and secure — and, when you’re ready, we bring in the customers.',
  },
];

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

export type PlanId = 'startup' | 'growth' | 'custom';

export interface PricingTier {
  id: PlanId;
  name: string;
  /** Display price, e.g. "$297" or "Let’s talk". */
  price: string;
  /** Small text after the price, e.g. "one-time" / "/mo". */
  cadence?: string;
  tagline: string;
  features: string[];
  /** The visually emphasised "most popular" tier. */
  featured?: boolean;
  badge?: string;
  cta: { label: string };
  /** Fine print under the card (e.g. the Site Care Plan note). */
  footnote?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'startup',
    name: 'Brand Startup',
    price: '$297',
    cadence: 'one-time',
    tagline: 'The low-friction way to get online and look the part.',
    features: [
      'Custom logo',
      'Domain setup',
      'Polished landing page',
      'Contact form',
      'Delivered clean — often within a day',
    ],
    cta: { label: 'Start my site' },
    footnote:
      'After you approve the site, a Site Care Plan keeps it hosted, updated and supported for $25/mo.',
  },
  {
    id: 'growth',
    name: 'Brand Growth',
    price: '$197',
    cadence: '/mo',
    tagline: 'The ongoing growth partnership. Setup fee waived.',
    featured: true,
    badge: 'Most popular',
    features: [
      'Everything in Startup',
      'Setup fee waived',
      'Targeted local SEO',
      'Google Ads management',
      'Booking or quote flow',
      'Monthly maintenance',
      'Monthly performance reporting',
    ],
    cta: { label: 'Grow my business' },
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 'Let’s talk',
    tagline: 'A fully custom build, scoped and quoted to your business.',
    features: [
      'Bespoke design & build',
      'Custom integrations',
      'eCommerce / booking systems',
      'Scoped to your goals',
      'Priority support',
    ],
    cta: { label: 'Book a call' },
  },
];

/* -------------------------------------------------------------------------- */
/* Services / what's included                                                 */
/* -------------------------------------------------------------------------- */

export interface Service {
  /** Inline SVG icon id, defined in Services.astro's <symbol> sheet. */
  icon: string;
  title: string;
  body: string;
}

export const services: Service[] = [
  {
    icon: 'search',
    title: 'Local SEO',
    body: 'Show up when neighbors search for what you do. We tune your site and Google Business Profile to rank in your town.',
  },
  {
    icon: 'target',
    title: 'Google Ads',
    body: 'Targeted campaigns that put you at the top for high-intent searches — managed and optimized every month.',
  },
  {
    icon: 'calendar',
    title: 'Booking & quote flows',
    body: 'Turn visitors into appointments. Let customers book a slot or request a quote without a single phone call.',
  },
  {
    icon: 'shield',
    title: 'Maintenance & hosting',
    body: 'Fast, secure hosting plus updates, backups and fixes. Your site stays online and current — you never touch it.',
  },
  {
    icon: 'chart',
    title: 'Monthly reporting',
    body: 'A plain-English report each month: traffic, calls, bookings and what we changed to move the needle.',
  },
  {
    icon: 'sparkle',
    title: 'Design that builds trust',
    body: 'A site that looks as professional as the work you do — so first-time visitors believe you before they call.',
  },
];

/* -------------------------------------------------------------------------- */
/* Work / portfolio                                                           */
/* -------------------------------------------------------------------------- */
/* Projects now live in the `projects` content collection                     */
/* (src/content/projects/*.md, schema in src/content.config.ts). The Work      */
/* section and /projects/[slug] render from there.                            */

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: 'Is the $297 starter really that cheap?',
    a: 'Yes. We keep the entry price low because most clients stay for the Site Care Plan or upgrade to Growth. You get a real, custom site — logo, domain, landing page and contact form — for a one-time $297.',
  },
  {
    q: 'What’s the $25/mo Site Care Plan for?',
    a: 'It keeps your site online and worry-free: hosting, security, software updates, backups and small content tweaks. It only kicks in after you’ve approved your finished site.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. There are no long-term contracts on the Site Care Plan or the Growth plan. Cancel whenever you like — though we’d rather earn your business every month.',
  },
  {
    q: 'Do I own my site?',
    a: 'You own your domain and your content, always. If you ever leave, we’ll hand over your site so nothing you paid for walks out the door with us.',
  },
  {
    q: 'How long does it take?',
    a: 'Most starter sites are designed and live for your review within a day. Bigger Growth and Custom builds take a little longer — we’ll give you a clear timeline up front.',
  },
];
