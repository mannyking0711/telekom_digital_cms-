"use strict";

/**
 * digi-index-archive-page controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

module.exports = createCoreController(
  "api::digi-index-archive-page.digi-index-archive-page",
  ({ strapi }) => ({
    async find(ctx) {
      // get user locale
      const lang = helper.getLang(ctx);

      // get data from database
      const results = await strapi.db
        .query("api::digi-index-archive-page.digi-index-archive-page")
        .findMany({
          select: [
            "id",
            `title`,
            `header`,
            `meta_title`,
            `meta_description`,
            `title_archive`,
            `section_title`,
          ],
          populate: ['image'],
          where: {locale: lang}
        });

      // modify data after database query
      if (!results) {
        return ctx.response.notFound();
      }

      let result = results[0];

      // prepare image
      if (result.image && result.image.url) {
        result.image = result.image.url;
      }

      // Remove unused
      delete result.id;

      
      // TODO
      // fetch archive downloads
      result.archive = await strapi.controller('api::digi-index-archive.digi-index-archive').find(ctx);

      // fetch labels
      result.labels = await strapi.controller('api::digi-index-sector.digi-index-sector').find(ctx);

      return result;
    },
  })
);
