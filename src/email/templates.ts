import { renderEmail } from './layout'

export interface NewsletterPost {
  title: string
  slug: string
  excerpt?: string | null
  subtitle?: string | null
  readTime?: number | null
  coverImage?: { url?: string | null } | null
  categories?: Array<{ name?: string | null }>
}

const origin = (siteUrl: string) => siteUrl.replace(/\/$/, '')

function postUrl(siteUrl: string, slug: string, content = 'cta') {
  const params = new URLSearchParams({
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: slug,
    utm_content: content,
  })
  return `${origin(siteUrl)}/blog/${slug}?${params.toString()}`
}

export function newsletterPostEmail(
  post: NewsletterPost,
  options: { siteUrl: string; unsubscribeUrl: string }
) {
  const siteUrl = origin(options.siteUrl)
  const cta = postUrl(siteUrl, post.slug, 'cta')
  const web = postUrl(siteUrl, post.slug, 'read-in-browser')
  const categories = (post.categories ?? [])
    .map((category) => category.name)
    .filter(Boolean)
    .join(', ')

  const preview = post.excerpt || post.subtitle || ''

  const { html, text } = renderEmail({
    preheader: preview,
    heading: post.title,
    paragraphs: [
      preview,
      post.readTime ? `About a ${post.readTime} minute read.` : '',
    ].filter(Boolean),
    facts: [
      ...(categories ? [{ label: 'Filed under', value: categories }] : []),
      ...(post.readTime ? [{ label: 'Read time', value: `${post.readTime} min` }] : []),
    ],
    cta: { label: 'Read the post', url: cta },
    secondaryLink: { label: 'Read it in the browser →', url: web },
    imageUrl: post.coverImage?.url ?? undefined,
    footerNote:
      "You're getting this because you subscribed to new posts on my blog. One email per post, nothing else.",
    unsubscribeUrl: options.unsubscribeUrl,
    siteUrl,
  })

  return { subject: post.title, html, text }
}

export function confirmationEmail(options: { confirmUrl: string; siteUrl: string }) {
  const siteUrl = origin(options.siteUrl)

  const { html, text } = renderEmail({
    preheader: 'One click and you are on the list.',
    heading: 'Confirm your subscription',
    paragraphs: [
      'Someone asked to get new posts from my blog by email. If that was you, confirm below and you will get one email each time I publish.',
      'If it was not you, ignore this message and nothing will be sent.',
    ],
    cta: { label: 'Confirm subscription', url: options.confirmUrl },
    footerNote: 'One email per post. No spam, no forwarding your address anywhere.',
    siteUrl,
  })

  return { subject: 'Confirm your subscription', html, text }
}

export function testEmail(options: { siteUrl: string }) {
  const siteUrl = origin(options.siteUrl)

  const { html, text } = renderEmail({
    preheader: 'Outbox test',
    heading: 'Outbox test',
    paragraphs: [
      'This message went through the same outbox as a newsletter send, so seeing it means the whole path works.',
    ],
    footerNote: 'Sent from the admin test endpoint.',
    siteUrl,
  })

  return { subject: 'Outbox test', html, text }
}
