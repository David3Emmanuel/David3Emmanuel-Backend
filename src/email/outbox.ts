import type { Core } from '@strapi/strapi'

import { sendViaResend } from './resend'

export const EMAIL_LOG_UID = 'api::email-log.email-log'

const MAX_ATTEMPTS = 4
const BACKOFF_MINUTES = [1, 5, 30, 120]
const STALE_SENDING_MS = 15 * 60 * 1000

export type EmailPriority = 'auth' | 'bulk'

export interface LoggedEmail {
  template: string
  to: string
  subject: string
  bodyText: string
  bodyHtml: string
  priority?: EmailPriority
  subscriberDocumentId?: string
  postSlug?: string
  listUnsubscribeUrl?: string
}

interface EmailLogRow {
  id: number
  deliveryStatus: 'queued' | 'sending' | 'sent' | 'failed'
  attempts: number | null
  priority: EmailPriority
  to: string
  subject: string | null
  bodyText: string | null
  bodyHtml: string | null
  listUnsubscribeUrl: string | null
}

const dailyLimit = () => {
  const configured = Number(process.env.EMAIL_DAILY_LIMIT ?? 100)
  return Number.isFinite(configured) && configured > 0 ? configured : 100
}

/** Midnight in Africa/Lagos (UTC+1, no daylight saving). */
function startOfDayWat(): Date {
  const shifted = new Date(Date.now() + 60 * 60 * 1000)
  const midnightShifted = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  )
  return new Date(midnightShifted - 60 * 60 * 1000)
}

function nextMidnightWat(): Date {
  const start = startOfDayWat()
  return new Date(start.getTime() + 24 * 60 * 60 * 1000)
}

async function sentToday(strapi: Core.Strapi): Promise<number> {
  const rows = (await strapi.db.query(EMAIL_LOG_UID).findMany({
    where: { sentAt: { $gte: startOfDayWat() } },
    select: ['id'],
  })) as unknown[]
  return rows.length
}

function failure(strapi: Core.Strapi, rowId: number, message: string) {
  strapi.log.error(`[email] row ${rowId}: ${message}`)
}

/**
 * Delivers one row. The claim is a conditional update, so two drains racing for
 * the same row cannot both send it.
 */
export async function deliverLogged(
  strapi: Core.Strapi,
  rowId: number
): Promise<{ id: number; deliveryStatus: string; error?: string }> {
  const emailLog = strapi.db.query(EMAIL_LOG_UID)

  const claim = (await emailLog.updateMany({
    where: { id: rowId, deliveryStatus: 'queued' },
    data: { deliveryStatus: 'sending', lastAttemptAt: new Date() },
  })) as { count?: number } | undefined

  if (!claim || !claim.count) {
    return { id: rowId, deliveryStatus: 'skipped' }
  }

  const row = (await emailLog.findOne({ where: { id: rowId } })) as EmailLogRow | null
  if (!row) return { id: rowId, deliveryStatus: 'missing' }

  const attempts = row.attempts ?? 0

  if (row.priority === 'bulk' && (await sentToday(strapi)) >= dailyLimit()) {
    await emailLog.update({
      where: { id: rowId },
      data: { deliveryStatus: 'queued', nextAttemptAt: nextMidnightWat(), lastAttemptAt: null },
    })
    return { id: rowId, deliveryStatus: 'deferred' }
  }

  if (!process.env.RESEND_API_KEY) {
    const message = 'RESEND_API_KEY is not configured'
    await emailLog.update({
      where: { id: rowId },
      data: { deliveryStatus: 'failed', attempts: attempts + 1, error: message },
    })
    failure(strapi, rowId, message)
    return { id: rowId, deliveryStatus: 'failed', error: message }
  }

  try {
    const result = await sendViaResend({
      from: process.env.MAIL_FROM ?? 'David Emmanuel <newsletter@davidemmanuel.dev>',
      to: row.to,
      subject: row.subject ?? '',
      html: row.bodyHtml ?? '',
      text: row.bodyText ?? '',
      replyTo: process.env.MAIL_REPLY_TO,
      headers: row.listUnsubscribeUrl
        ? {
            'List-Unsubscribe': `<${row.listUnsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          }
        : undefined,
      idempotencyKey: `email-log-${rowId}`,
    })

    await emailLog.update({
      where: { id: rowId },
      data: {
        deliveryStatus: 'sent',
        providerId: result.id,
        sentAt: new Date(),
        error: null,
        attempts: attempts + 1,
      },
    })

    return { id: rowId, deliveryStatus: 'sent' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const nextAttempt = attempts + 1

    if (nextAttempt >= MAX_ATTEMPTS) {
      await emailLog.update({
        where: { id: rowId },
        data: { deliveryStatus: 'failed', attempts: nextAttempt, error: message },
      })
      failure(strapi, rowId, message)
      return { id: rowId, deliveryStatus: 'failed', error: message }
    }

    const backoff = BACKOFF_MINUTES[Math.min(nextAttempt - 1, BACKOFF_MINUTES.length - 1)]
    await emailLog.update({
      where: { id: rowId },
      data: {
        deliveryStatus: 'queued',
        attempts: nextAttempt,
        error: message,
        nextAttemptAt: new Date(Date.now() + backoff * 60 * 1000),
      },
    })
    failure(strapi, rowId, `${message} (retry in ${backoff}m)`)
    return { id: rowId, deliveryStatus: 'queued', error: message }
  }
}

export async function enqueueEmail(strapi: Core.Strapi, email: LoggedEmail): Promise<number> {
  const row = (await strapi.db.query(EMAIL_LOG_UID).create({
    data: {
      template: email.template,
      to: email.to,
      subject: email.subject,
      bodyText: email.bodyText,
      bodyHtml: email.bodyHtml,
      priority: email.priority ?? 'bulk',
      deliveryStatus: 'queued',
      attempts: 0,
      nextAttemptAt: new Date(),
      subscriberDocumentId: email.subscriberDocumentId,
      postSlug: email.postSlug,
      listUnsubscribeUrl: email.listUnsubscribeUrl,
    },
  })) as { id: number }

  return row.id
}

export async function sendLoggedEmail(strapi: Core.Strapi, email: LoggedEmail) {
  const rowId = await enqueueEmail(strapi, email)
  return deliverLogged(strapi, rowId)
}

export interface DrainResult {
  considered: number
  sent: number
  failed: number
  deferred: number
  skipped: number
  sentToday: number
  limit: number
  results: Array<{ id: number; deliveryStatus: string; error?: string }>
}

export async function drain(strapi: Core.Strapi, limit = 100): Promise<DrainResult> {
  const emailLog = strapi.db.query(EMAIL_LOG_UID)

  // A crash between the claim and the provider call leaves a row in `sending`.
  const stale = (await emailLog.findMany({
    where: {
      deliveryStatus: 'sending',
      lastAttemptAt: { $lt: new Date(Date.now() - STALE_SENDING_MS) },
    },
    select: ['id'],
  })) as Array<{ id: number }>

  for (const row of stale) {
    await emailLog.update({
      where: { id: row.id },
      data: { deliveryStatus: 'queued', nextAttemptAt: new Date() },
    })
  }

  const due = (await emailLog.findMany({
    where: { deliveryStatus: 'queued', nextAttemptAt: { $lte: new Date() } },
    orderBy: [{ priority: 'asc' }, { nextAttemptAt: 'asc' }],
    limit,
    select: ['id'],
  })) as Array<{ id: number }>

  const results: DrainResult['results'] = []
  let sent = 0
  let failed = 0
  let deferred = 0
  let skipped = 0

  for (const row of due) {
    const result = await deliverLogged(strapi, row.id)
    results.push(result)

    if (result.deliveryStatus === 'sent') sent += 1
    else if (result.deliveryStatus === 'failed') failed += 1
    else if (result.deliveryStatus === 'deferred') {
      deferred += 1
      // Over the daily ceiling: stop rather than defer the rest one by one.
      break
    } else skipped += 1
  }

  return {
    considered: due.length,
    sent,
    failed,
    deferred,
    skipped,
    sentToday: await sentToday(strapi),
    limit: dailyLimit(),
    results,
  }
}
