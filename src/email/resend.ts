export interface ResendMessage {
  from: string
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  headers?: Record<string, string>
  idempotencyKey?: string
}

export interface ResendResult {
  id: string
}

/**
 * Resend over HTTPS only. SMTP is deliberately unused: outbound port 587 is
 * blocked on some hosts and a failure there is invisible from the app.
 */
export async function sendViaResend(message: ResendMessage): Promise<ResendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: message.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      ...(message.headers ? { headers: message.headers } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  })

  const body = await response.text()

  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${body.slice(0, 500)}`)
  }

  try {
    return JSON.parse(body) as ResendResult
  } catch {
    return { id: '' }
  }
}
