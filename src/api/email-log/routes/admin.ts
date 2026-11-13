export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/admin/email/drain',
      handler: 'admin.drain',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/admin/email/test',
      handler: 'admin.test',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/admin/email/send',
      handler: 'admin.send',
      config: { auth: false, policies: [] },
    },
  ],
}
