import type { Core } from '@strapi/strapi'

import { enqueueEmail } from './outbox'
import { newsletterPostEmail, type NewsletterPost } from './templates'

const POST_UID = 'api::blog-post.blog-post'
const SUBSCRIBER_UID = 'api::subscriber.subscriber'

export function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://www.davidemmanuel.dev').replace(/\/$/, '')
}

export function newsletterDisabled(): boolean {
  return process.env.NEWSLETTER_DISABLED === 'true'
}

export interface EnqueueResult {
  queued: number
  skipped?:
    | 'not-published'
    | 'already-queued'
    | 'outside-window'
    | 'locale'
    | 'in-flight'
    | 'not-found'
}

/**
 * One outbox row per confirmed subscriber. Called automatically when a post is
 * published, and by the admin endpoint when a send needs to be retried.
 */
export async function enqueuePostNewsletter(
  strapi: Core.Strapi,
  postId: number,
  options: { force?: boolean; resend?: boolean } = {}
): Promise<EnqueueResult> {
  const post = (await strapi.db.query(POST_UID).findOne({
    where: { id: postId },
    populate: ['coverImage', 'categories'],
  })) as
    | (NewsletterPost & {
        id: number;
        documentId: string;
        locale?: string;
        publishedAt?: string | null;
        newsletterQueuedAt?: string | null;
      })
    | null

  if (!post) return { queued: 0, skipped: 'not-found' }

  // A draft and its published sibling are separate rows; always mail from the
  // published one.
  let source = post
  if (!source.publishedAt) {
    const published = (await strapi.db.query(POST_UID).findOne({
      where: { documentId: source.documentId, publishedAt: { $notNull: true } },
      populate: ['coverImage', 'categories'],
    })) as typeof post

    if (!published) return { queued: 0, skipped: 'not-published' }
    source = published
  }

  if (!source.publishedAt) return { queued: 0, skipped: 'not-published' }
  if (source.locale && source.locale !== 'en') return { queued: 0, skipped: 'locale' }
  if (source.newsletterQueuedAt && !options.resend) {
    return { queued: 0, skipped: 'already-queued' }
  }

  const windowMinutes = Number(process.env.NEWSLETTER_WINDOW_MINUTES ?? 15)
  const age = Date.now() - new Date(source.publishedAt).getTime()
  const inWindow =
    Number.isFinite(windowMinutes) && age <= windowMinutes * 60 * 1000

  // The window stops a first deploy from mailing every historical post.
  if (!inWindow && !options.force) {
    return { queued: 0, skipped: 'outside-window' }
  }

  const subscribers = (await strapi.db.query(SUBSCRIBER_UID).findMany({
    where: { status: 'confirmed' },
  })) as Array<{ email: string; documentId: string; unsubscribeToken: string }>

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${siteUrl()}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`
    const message = newsletterPostEmail(source, { siteUrl: siteUrl(), unsubscribeUrl })

    await enqueueEmail(strapi, {
      template: 'newsletter-post',
      to: subscriber.email,
      subject: message.subject,
      bodyText: message.text,
      bodyHtml: message.html,
      priority: 'bulk',
      subscriberDocumentId: subscriber.documentId,
      postSlug: source.slug,
      listUnsubscribeUrl: unsubscribeUrl,
    })
  }

  await strapi.db.query(POST_UID).update({
    where: { id: source.id },
    data: {
      newsletterQueuedAt: new Date(),
      newsletterRecipientCount: subscribers.length,
      newsletterEnqueueError: null,
    },
  })

  strapi.log.info(
    `[newsletter] queued "${source.title}" for ${subscribers.length} subscriber(s)`
  )

  return { queued: subscribers.length }
}

