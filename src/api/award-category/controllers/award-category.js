"use strict";

/**
 * award-category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

module.exports = createCoreController(
  "api::award-category.award-category",
  ({ strapi }) => ({
    /////////////////////////////////
    // FIND / LIST
    /////////////////////////////////

    async find(ctx) {
      // get user locale
      let lang = helper.getLang(ctx);

      // config database query
      let columns = ["id", "name", "description"];
      let relations = ["icon"];

      // get data from database

      const result = await strapi.db
        .query("api::award-category.award-category")
        .findMany({
          select: columns,
          populate: relations,
          where: {
            locale: lang
          }
        });

      // result as json to modify it
      if (!result) {
        return ctx.response.notFound();
      }

      // modify data after database query
      let resultMap = {};
      result.forEach((category) => {
        category.icon = category.icon && category.icon ? category.icon.url : "";

        resultMap[category.id] = category;
      });

      return resultMap;
    },
  })
);
