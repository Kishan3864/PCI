export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingMinutes: number;
}

// Registry for the blog index and article metadata. Article bodies live in
// app/(marketing)/blog/(articles)/<slug>/page.mdx.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'pci-dss-6-4-3-explained',
    title: 'PCI DSS 6.4.3 explained for WooCommerce store owners',
    description:
      'What requirement 6.4.3 actually asks of a small store, in plain English — and how to build the script inventory it wants without a security team.',
    date: '2026-06-02',
    readingMinutes: 6,
  },
  {
    slug: 'saq-a-eligibility',
    title: 'What the new SAQ A eligibility criteria mean for your checkout',
    description:
      'SAQ A got stricter in PCI DSS v4.0.1. Here is who still qualifies, what changed for iframe and redirect checkouts, and the script controls you now have to show.',
    date: '2026-06-16',
    readingMinutes: 7,
  },
  {
    slug: '11-6-1-tamper-detection-setup',
    title: '11.6.1 tamper detection: a practical setup guide',
    description:
      'A step-by-step way to meet the weekly change-and-tamper detection requirement on your payment page — what to watch, how often, and what evidence to keep.',
    date: '2026-06-30',
    readingMinutes: 8,
  },
  {
    slug: 'what-is-e-skimming-magecart',
    title: 'What is e-skimming (Magecart) and why small stores are targets',
    description:
      'How web skimming attacks actually work, why neither shoppers nor owners notice them, and the script controls PCI DSS v4 now expects every payment page to have.',
    date: '2026-07-15',
    readingMinutes: 7,
  },
  {
    slug: 'build-script-inventory-6-4-3',
    title: 'How to build a payment-page script inventory (step by step)',
    description:
      'A hands-on walkthrough for PCI DSS 6.4.3: find every script on your payment page with devtools, record it properly, write justifications auditors accept, and keep it current.',
    date: '2026-07-15',
    readingMinutes: 8,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
