/**
 * schema.ts — typed JSON-LD builders for SEO.
 *
 * BaseLayout injects the output of `professionalServiceSchema()` into a
 * <script type="application/ld+json"> tag. Keeping this typed and centralized
 * means the structured data stays in sync with `content.ts`.
 */
import { site, services } from './content';

/** Minimal subset of schema.org types we emit. */
interface JsonLd {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

/**
 * ProfessionalService / Organization markup describing the agency, the areas
 * it serves and the projects it offers.
 */
export function professionalServiceSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    image: `${site.url}/og.png`,
    priceRange: '$$',
    areaServed: site.serviceArea.map((name) => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Doylestown',
      addressRegion: 'PA',
      addressCountry: 'US',
    },
    sameAs: Object.values(site.social),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web projects',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.body },
      })),
    },
  };
}

/**
 * CreativeWork markup for a single portfolio project / case study, crediting the
 * agency as creator. Emitted on each /projects/[slug] page.
 */
export function projectSchema(
  project: {
    title: string;
    summary: string;
    industry: string;
    year: string;
    image?: string;
  },
  url: string
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    about: project.industry,
    dateCreated: project.year,
    url,
    ...(project.image ? { image: new URL(project.image, site.url).href } : {}),
    creator: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
    },
  };
}

/**
 * FAQPage markup — lets the FAQ section qualify for rich results in search.
 */
export function faqSchema(faqs: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
