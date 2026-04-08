/**
 * post-stat controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post-stat.post-stat', ({ strapi }) => ({
  async like(ctx) {
    const { slug } = ctx.params;

    if (!slug) {
      return ctx.badRequest('slug is required');
    }

    const stats = await strapi.documents('api::post-stat.post-stat').findMany({
      filters: { postSlug: slug },
    });

    if (stats.length === 0) {
      const newStat = await strapi.documents('api::post-stat.post-stat').create({
        data: { postSlug: slug, likeCount: 1 },
      });
      return ctx.send({ likeCount: newStat.likeCount });
    }

    const stat = stats[0];
    const updated = await strapi.documents('api::post-stat.post-stat').update({
      documentId: stat.documentId,
      data: { likeCount: (stat.likeCount ?? 0) + 1 },
    });

    return ctx.send({ likeCount: updated.likeCount });
  },
}));
