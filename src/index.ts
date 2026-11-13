import type { Core } from '@strapi/strapi';

import { seed } from './seed';

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
    if (process.env.SEED_ON_BOOT !== 'true') return;

    try {
      await seed({ strapi });
    } catch (error) {
      strapi.log.error('[seed] failed to write resume data');
      strapi.log.error(error);
    }
  },
};
