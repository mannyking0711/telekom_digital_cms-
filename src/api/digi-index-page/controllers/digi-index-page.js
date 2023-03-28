"use strict";

/**
 * digi-index-page controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

module.exports = createCoreController(
  "api::digi-index-page.digi-index-page",
  ({ strapi }) => ({
    async find(ctx) {
      // get user locale
      const lang = helper.getLang(ctx);

      // get data from database
      const results = await strapi.db
        .query("api::digi-index-page.digi-index-page")
        .findMany({
          select: [
            "id",
            `title`,
            `header`,
            `meta_title`,
            `meta_description`,
            `page_title`,
            `page_intro`,
            `usp_title1`,
            `usp_text1`,
            `usp_title2`,
            `usp_text2`,
            `usp_title3`,
            `usp_text3`,
            `usp_title4`,
            `usp_text4`,
            `section_title`,
            `section_text`,
            `self_check_title`,
            `self_check_text`,
            `self_check_link`,
            `self_check_button`,
            `archive_title`,
            `archive_text`,
            `archive_button`,
          ],
          where: { locale: lang },
          populate: ['image', 'self_check_image', 'archive_image']
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
      if (result.self_check_image && result.self_check_image.url) {
        result.self_check_image = result.self_check_image.url;
      }
      if (result.archive_image && result.archive_image.url) {
        result.archive_image = result.archive_image.url;
      }

      // Remove unused
      delete result.id;

      // fetch labels
      result.labels = await strapi.controller('api::digi-index-sector.digi-index-sector').find(ctx);

      return result;
    },
  })
);
