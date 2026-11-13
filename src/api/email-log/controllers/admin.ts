import type { Core } from '@strapi/strapi'

import { drain, sendLoggedEmail } from '../../../email/outbox'
import { enqueuePostNewsletter } from '../../../email/newsletter'
import { testEmail } from '../../../email/templates'

function strapi(): Core.Strapi {
  return (globalThis as unknown as { strapi: Core.Strapi }).strapi
}

function authorised(ctx: any): boolean {
  const expected = process.env.EMAIL_ADMIN_KEY
  if (!expected) return false
  return ctx.request.header['x-email-key'] === expected
}

export default {
  async drain(ctx: any) {
    if (!authorised(ctx)) {
      return ctx.unauthorized({ error: 'Not allowed.' })
    }

    const result = await drain(strapi())
    return ctx.send(result)
  },

  async test(ctx: any) {
    if (!authorised(ctx)) {
      return ctx.unauthorized({ error: 'Not allowed.' })
    }

    const to = String(ctx.request.body?.to ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
      return ctx.badRequest({ error: 'A real recipient address is required.' })
    }

    const siteUrl = (process.env.SITE_URL ?? 'https://davidemmanuel.dev').replace(/\/$/, '')
    const message = testEmail({ siteUrl })

    const result = await sendLoggedEmail(strapi(), {
      template: 'test',
      to,
      subject: message.subject,
      bodyText: message.text,
      bodyHtml: message.html,
      priority: 'auth',
    })

    return ctx.send(result)
  },

  /** Re-enqueue a post's newsletter after a failure, outside the publish window. */
  async send(ctx: any) {
    if (!authorised(ctx)) {
      return ctx.unauthorized({ error: 'Not allowed.' })
    }

    const slug = String(ctx.request.body?.slug ?? '').trim()
    if (!slug) {
      return ctx.badRequest({ error: 'A post slug is required.' })
    }

    const post = (await strapi().db.query('api::blog-post.blog-post').findOne({
      where: { slug },
    })) as { id: number } | null

    if (!post) {
      return ctx.notFound({ error: 'Post not found.' })
    }

    const result = await enqueuePostNewsletter(strapi(), post.id, {
      force: true,
      resend: ctx.request.body?.resend === true,
    })

    return ctx.send(result)
  },
}
