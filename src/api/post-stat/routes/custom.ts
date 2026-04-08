export default {
  routes: [
    {
      method: 'POST',
      path: '/post-stats/:slug/like',
      handler: 'api::post-stat.post-stat.like',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
