const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char])
}

export interface EmailBlock {
  preheader?: string
  heading: string
  paragraphs?: string[]
  facts?: Array<{ label: string; value: string }>
  cta?: { label: string; url: string }
  secondaryLink?: { label: string; url: string }
  imageUrl?: string
  footerNote?: string
  unsubscribeUrl?: string
  siteUrl?: string
}

/**
 * One shell for every mail. Email clients need tables and inline styles, so
 * nothing here relies on a stylesheet, flexbox or an external image.
 */
export function renderEmail(block: EmailBlock): { html: string; text: string } {
  const paragraphs = (block.paragraphs ?? []).filter(Boolean)

  const facts = (block.facts ?? []).filter((fact) => fact.value)
  const factsHtml = facts.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
        ${facts
          .map(
            (fact) =>
              `<tr>
                <td style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;width:140px;">${esc(fact.label)}</td>
                <td style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#111827;">${esc(fact.value)}</td>
              </tr>`
          )
          .join('')}
      </table>`
    : ''

  const ctaHtml = block.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
        <tr>
          <td align="center" bgcolor="#2563eb" style="border-radius:6px;">
            <a href="${esc(block.cta.url)}" style="display:inline-block;padding:12px 22px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">${esc(block.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : ''

  const secondaryHtml = block.secondaryLink
    ? `<p style="margin:0 0 24px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;">
        <a href="${esc(block.secondaryLink.url)}" style="color:#2563eb;text-decoration:underline;">${esc(block.secondaryLink.label)}</a>
      </p>`
    : ''

  const imageHtml = block.imageUrl
    ? `<tr><td style="padding:0 0 24px 0;">
        <img src="${esc(block.imageUrl)}" alt="" width="552" style="display:block;width:100%;max-width:552px;height:auto;border-radius:6px;" />
      </td></tr>`
    : ''

  const unsubscribe = block.unsubscribeUrl
    ? `<a href="${esc(block.unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>`
    : ''

  const site = block.siteUrl
    ? `<a href="${esc(block.siteUrl)}" style="color:#6b7280;text-decoration:underline;">${esc(
        block.siteUrl.replace(/^https?:\/\//, '')
      )}</a>`
    : ''

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${esc(block.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(block.preheader ?? '')}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:8px;">
            <tr>
              <td style="padding:24px 24px 8px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right:10px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="10" height="10" bgcolor="#2563eb" style="font-size:0;line-height:0;">&nbsp;</td>
                          <td width="3" style="font-size:0;line-height:0;">&nbsp;</td>
                          <td width="10" height="10" bgcolor="#60a5fa" style="font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                    <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:#111827;">David Emmanuel</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${imageHtml}
                  <tr>
                    <td style="padding:0 0 16px 0;">
                      <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:24px;line-height:1.3;color:#111827;">${esc(block.heading)}</h1>
                    </td>
                  </tr>
                  ${paragraphs
                    .map(
                      (paragraph) =>
                        `<tr><td style="padding:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#374151;">${esc(paragraph)}</td></tr>`
                    )
                    .join('')}
                  ${factsHtml ? `<tr><td>${factsHtml}</td></tr>` : ''}
                  ${ctaHtml ? `<tr><td>${ctaHtml}</td></tr>` : ''}
                  ${secondaryHtml ? `<tr><td>${secondaryHtml}</td></tr>` : ''}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
                  ${esc(block.footerNote ?? '')}
                </p>
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
                  ${site}${site && unsubscribe ? ' &nbsp;·&nbsp; ' : ''}${unsubscribe}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    block.heading,
    '',
    ...paragraphs,
    ...(facts.length ? ['', ...facts.map((fact) => `${fact.label}: ${fact.value}`)] : []),
    ...(block.cta ? ['', `${block.cta.label}: ${block.cta.url}`] : []),
    ...(block.secondaryLink ? [`${block.secondaryLink.label}: ${block.secondaryLink.url}`] : []),
    '',
    block.footerNote ?? '',
    ...(block.unsubscribeUrl ? [`Unsubscribe: ${block.unsubscribeUrl}`] : []),
  ]
    .filter((line) => line !== undefined)
    .join('\n')

  return { html, text }
}
