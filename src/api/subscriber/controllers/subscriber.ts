import { randomBytes } from 'node:crypto'
import type { Core } from '@strapi/strapi'

import { sendLoggedEmail } from '../../../email/outbox'
import { confirmationEmail, newsletterPostEmail, type NewsletterPost } from '../../../email/templates'

const SUBSCRIBER_UID = 'api::subscriber.subscriber'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const attempts = new Map<string, number[]>()

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://www.davidemmanuel.dev').replace(/\/$/, '')
}

function strapi(): Core.Strapi {
  return (globalThis as unknown as { strapi: Core.Strapi }).strapi
}

function allow(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - 60 * 60 * 1000
  const recent = (attempts.get(ip) ?? []).filter((at) => at > windowStart)
  if (recent.length >= 5) {
    attempts.set(ip, recent)
    return false
  }
  recent.push(now)
  attempts.set(ip, recent)
  return true
}

function newToken() {
  return randomBytes(16).toString('hex')
}

export default {
  /**
   * Always answers the same way, so it cannot be used to discover which
   * addresses are already subscribed.
   */
  async subscribe(ctx: any) {
    const body = (ctx.request.body ?? {}) as {
      email?: string
      source?: string
      website?: string
    }

    if (body.website) {
      return ctx.send({ status: 'pending' })
    }

    const email = String(body.email ?? '').trim().toLowerCase()

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return ctx.badRequest({ error: 'Enter a valid email address.' })
    }

    const ip = String(ctx.request.ip ?? 'unknown')
    if (!allow(ip)) {
      return ctx.tooManyRequests({ error: 'Too many attempts. Try again later.' })
    }

    const subscribers = strapi().db.query(SUBSCRIBER_UID)
    const existing = (await subscribers.findOne({ where: { email } })) as {
      id: number
      documentId: string
      status: string
      unsubscribeToken: string | null
    } | null

    if (existing?.status === 'confirmed') {
      return ctx.send({ status: 'confirmed' })
    }

    const confirmToken = newToken()
    const unsubscribeToken = existing?.unsubscribeToken ?? newToken()
    const source = String(body.source ?? 'unknown').slice(0, 40)

    if (existing) {
      await subscribers.update({
        where: { id: existing.id },
        data: {
          status: 'pending',
          confirmToken,
          unsubscribeToken,
          source,
          confirmedAt: null,
          unsubscribedAt: null,
        },
      })
    } else {
      await subscribers.create({
        data: {
          email,
          status: 'pending',
          confirmToken,
          unsubscribeToken,
          source,
        },
      })
    }

    const confirmUrl = `${siteUrl()}/newsletter/confirm?token=${confirmToken}`
    const message = confirmationEmail({ confirmUrl, siteUrl: siteUrl() })

    try {
      await sendLoggedEmail(strapi(), {
        template: 'newsletter-confirm',
        to: email,
        subject: message.subject,
        bodyText: message.text,
        bodyHtml: message.html,
        priority: 'auth',
        subscriberDocumentId: existing?.documentId,
        listUnsubscribeUrl: `${siteUrl()}/newsletter/unsubscribe?token=${unsubscribeToken}`,
      })
    } catch (error) {
      strapi().log.error(`[newsletter] could not queue confirmation: ${String(error)}`)
    }

    return ctx.send({ status: 'pending' })
  },

  async confirm(ctx: any) {
    const token = String(ctx.query?.token ?? '')
    if (!token) {
      return ctx.badRequest({ error: 'Missing token.' })
    }

    const subscriber = (await strapi().db.query(SUBSCRIBER_UID).findOne({
      where: { confirmToken: token },
    })) as { id: number; status: string } | null

    if (!subscriber) {
      return ctx.notFound({ error: 'This link is not valid.' })
    }

    if (subscriber.status !== 'confirmed') {
      await strapi().db.query(SUBSCRIBER_UID).update({
        where: { id: subscriber.id },
        data: { status: 'confirmed', confirmedAt: new Date(), unsubscribedAt: null },
      })
    }

    return ctx.send({ status: 'confirmed' })
  },

  async unsubscribe(ctx: any) {
    const token = String(ctx.query?.token ?? ctx.request.body?.token ?? '')
    if (!token) {
      return ctx.badRequest({ error: 'Missing token.' })
    }

    const subscriber = (await strapi().db.query(SUBSCRIBER_UID).findOne({
      where: { unsubscribeToken: token },
    })) as { id: number; status: string } | null

    if (!subscriber) {
      return ctx.notFound({ error: 'This link is not valid.' })
    }

    if (subscriber.status !== 'unsubscribed') {
      await strapi().db.query(SUBSCRIBER_UID).update({
        where: { id: subscriber.id },
        data: { status: 'unsubscribed', unsubscribedAt: new Date() },
      })
    }

    return ctx.send({ status: 'unsubscribed' })
  },

  /** Renders exactly what would be mailed, without queueing anything. */
  async preview(ctx: any) {
    const key = String(ctx.query?.key ?? '')
    const adminKey = process.env.EMAIL_ADMIN_KEY
    if (!adminKey || key !== adminKey) {
      return ctx.unauthorized({ error: 'Not allowed.' })
    }

    const slug = String(ctx.query?.slug ?? '')
    const post = (await strapi().db.query('api::blog-post.blog-post').findOne({
      where: { slug },
      populate: ['coverImage', 'categories'],
    })) as (NewsletterPost & { excerpt?: string }) | null

    if (!post) {
      return ctx.notFound({ error: 'Post not found.' })
    }

    const message = newsletterPostEmail(post, {
      siteUrl: siteUrl(),
      unsubscribeUrl: `${siteUrl()}/newsletter/unsubscribe?token=preview`,
    })

    ctx.type = 'text/html; charset=utf-8'
    return ctx.send(`<!doctype html><html><body style="margin:0;padding:24px;background:#eef1f5">
      <div style="max-width:640px;margin:0 auto 16px auto;font:13px/1.5 system-ui">
        <strong>Subject:</strong> ${message.subject}
      </div>
      <iframe style="width:100%;max-width:640px;height:900px;border:1px solid #ccc;background:#fff;display:block;margin:0 auto"
        srcdoc="${message.html.replace(/"/g, '&quot;')}"></iframe>
    </body></html>`)
  },
}


