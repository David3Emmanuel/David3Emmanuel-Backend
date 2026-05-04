const getPreviewPathname = (
  uid: string,
  { document }: { locale: string; document: any },
): string | null => {
  const { slug } = document
  switch (uid) {
    case 'api::blog-post.blog-post':
      return slug ? `/blog/${slug}` : '/blog'
    default:
      return null
  }
}

export default ({ env }) => {
  const clientUrl = env('CLIENT_URL')
  const previewSecret = env('PREVIEW_SECRET')

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: clientUrl,
        async handler(
          uid: string,
          {
            documentId,
            locale,
            status,
          }: { documentId: string; locale: string; status: string },
        ) {
          const document = await strapi.documents(uid as any).findOne({ documentId })
          const pathname = getPreviewPathname(uid, { locale, document })
          if (!pathname) return null

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          })
          return `${clientUrl}/preview?${urlSearchParams}`
        },
      },
    },
  }
}
