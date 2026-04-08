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

    // Find the blog post by slug
    const posts = await strapi.documents('api::blog-post.blog-post').findMany({
      filters: { slug: { $eq: slug } },
      status: 'published',
    });

    if (!posts.length) {
      return ctx.notFound('Blog post not found');
    }

    const blogPost = posts[0];

    // Find existing post-stat linked to this blog post
    const stats = await strapi.documents('api::post-stat.post-stat').findMany({
      filters: { blog_post: { documentId: { $eq: blogPost.documentId } } },
    });

    if (stats.length === 0) {
      const newStat = await strapi.documents('api::post-stat.post-stat').create({
        data: {
          likeCount: 1,
          blog_post: blogPost.documentId,
        },
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
