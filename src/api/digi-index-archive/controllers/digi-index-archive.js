"use strict";

const helper = require("../../helper");
const { omit, groupBy } = require("lodash");
const dateFormat = require("dateformat");

/**
 * digi-index-archive controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::digi-index-archive.digi-index-archive",
  ({ strapi }) => ({
    async find(ctx) {
      let lang = helper.getLang(ctx);

      // config database query
      const columns = ["id", "year", "sort", "title", "description"];
      //   const eventColumns = ["id", `title`];

      // "tags"]
      const relations = {
        download: true,
        // event: {
        //   select: eventColumns,
        //   populate: {
        //     download: true,
        //   },
        // },
      };
      const today = dateFormat(Date.now(), "yyyy-mm-dd");
      const where = {
        // status: "created",
        createdAt: {
          $lte: today + "T23:59:59Z",
        },
        locale: lang,
      };

      // get data from database
      let result = await strapi.db
        .query("api::digi-index-archive.digi-index-archive")
        .findMany({
          select: columns,
          where,
          orderBy: [{year: 'DESC'}, { sort: 'asc' }, { title: 'asc' }],
          populate: relations,
            limit: 100
        });

      // group by event
      result = groupBy(result, "year");

      var newResult = [];
      for (const key in result) {
        newResult.push({
          year: key,
          //   downloads: result[key],
          downloads: result[key].map((item) => omit(item, ["year"])),
          // year: result[key].map((item) => omit(item, ["year"])),
        });
      }
      return newResult;
    },
  })
);
