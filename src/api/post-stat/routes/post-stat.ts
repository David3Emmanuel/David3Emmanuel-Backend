/**
 * post-stat router
 */

import { factories } from '@strapi/strapi';

const coreRouter = factories.createCoreRouter('api::post-stat.post-stat');

export default {
  routes: [
    ...coreRouter.routes,
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
