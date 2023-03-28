"use strict";

/**
 * award-partner controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

module.exports = createCoreController(
  "api::award-partner.award-partner",
  ({ strapi }) => ({
    async find(ctx) {
      // get user locale
      const lang = helper.getLang(ctx);

      // get data from database

      const results = await strapi.db
        .query("api::award-partner.award-partner")
        .findMany({
          select: ["id", "title", "enabled"],
          where: { locale: lang },
          populate: {
            logos: {
                populate: {
                    logo: true,
                }
            },
          },
        });

      let result = results ? results[0] : null;

      if (!result) {
        return ctx.response.notFound();
      }

      if (result.enabled) {
        delete result.id;

        // Format logos
        if (result.logos) {
          result.logos = result.logos.map((item) => {
            item.logo = item.logo.url ? item.logo.url : null;
            delete item.id;
            return item;
          });
        } else {
          result.logos = [];
        }
      } else {
        result = { enabled: false };
      }

      return result;
    },
  })
);
