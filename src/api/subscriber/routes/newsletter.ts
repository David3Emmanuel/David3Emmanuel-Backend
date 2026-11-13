export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/newsletter/subscribe',
      handler: 'subscriber.subscribe',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/newsletter/confirm',
      handler: 'subscriber.confirm',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/newsletter/unsubscribe',
      handler: 'subscriber.unsubscribe',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/newsletter/unsubscribe',
      handler: 'subscriber.unsubscribe',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/newsletter/preview',
      handler: 'subscriber.preview',
      config: { auth: false, policies: [] },
    },
  ],
}
