"use strict";

/**
 * coverage controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");
const { omit, groupBy } = require("lodash"); 

module.exports = createCoreController(
  "api::coverage.coverage",
  ({ strapi }) => ({
    async find(ctx) {

        let lang = helper.getLang(ctx);
    
        // config database query
        var columns = ['id', 'title', 'journal', 'link'];
        var eventColumns = ['id', `title`];
        var relations = {
          event: {
            select: eventColumns,
            populate: {
                coverages: true
            }
          }
        };
    
        // get data from database
        let result = await strapi.db.query("api::coverage.coverage").findMany({
            select: columns,
            where: {locale: lang},
            populate: relations,
          });

          
          // group by event
          result = groupBy(result, 'event.id');
    
        // restructure the data
        var newResult = [];
        for (const key in result) {
          newResult.push({
            event: omit(result[key][0]['event'], ['coverages']),
            coverages: result[key].map(coverage => omit(coverage, ['event']))
          });
        }
        return newResult;
      },
  })
);
