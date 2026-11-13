import type { Core } from '@strapi/strapi';

import { seed } from './seed';
import { drain } from './email/outbox';
import { enqueuePostNewsletter, newsletterDisabled } from './email/newsletter';

const POST_UID = 'api::blog-post.blog-post';

const inFlight = new Set<string>();

function queueForPost(strapi: Core.Strapi, postId: number) {
  const key = String(postId);
  if (inFlight.has(key)) return;
  inFlight.add(key);

  enqueuePostNewsletter(strapi, postId)
    .then((result) => {
      if (result.queued > 0) {
        void drain(strapi).catch((error) =>
          strapi.log.error(`[newsletter] drain failed: ${String(error)}`)
        );
      }
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`[newsletter] could not queue post ${postId}: ${message}`);
      void strapi.db
        .query(POST_UID)
        .update({ where: { id: postId }, data: { newsletterEnqueueError: message } })
        .catch(() => undefined);
    })
    .finally(() => inFlight.delete(key));
}

function registerNewsletterLifecycle(strapi: Core.Strapi) {
  const idOf = (event: any): number | undefined =>
    event?.result?.id ?? event?.params?.where?.id ?? event?.params?.data?.id

  strapi.db.lifecycles.subscribe({
    models: [POST_UID],
    afterCreate(event: any) {
      if (newsletterDisabled()) return;
      const id = idOf(event);
      if (id) queueForPost(strapi, id);
    },
    afterUpdate(event: any) {
      if (newsletterDisabled()) return;
      const id = idOf(event);
      if (id) queueForPost(strapi, id);
    },
  });
}

function startDrainLoop(strapi: Core.Strapi) {
  const minutes = Number(process.env.EMAIL_DRAIN_INTERVAL_MINUTES ?? 5);
  if (!Number.isFinite(minutes) || minutes <= 0) return;

  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const result = await drain(strapi);
      if (result.considered > 0) {
        strapi.log.info(
          `[email] drain: ${result.sent} sent, ${result.failed} failed, ${result.deferred} deferred`
        );
      }
    } catch (error) {
      strapi.log.error(`[email] drain failed: ${String(error)}`);
    } finally {
      running = false;
    }
  }, minutes * 60 * 1000);

  timer.unref?.();
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    registerNewsletterLifecycle(strapi);
    startDrainLoop(strapi);

    if (process.env.SEED_ON_BOOT !== 'true') return;

    try {
      await seed({ strapi });
    } catch (error) {
      strapi.log.error('[seed] failed to write resume data');
      strapi.log.error(error);
    }
  },
};
