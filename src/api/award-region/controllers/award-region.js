'use strict';

/**
 * award-region controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require("../../helper");

module.exports = createCoreController('api::award-region.award-region', ({strapi}) => ({
    async find(ctx) {

        let lang = helper.getLang(ctx);

        // config database query
        let columns = ['id', 'name'];
    
        // get data from database
        const result = await strapi.db.query("api::award-region.award-region").findMany({
            select: columns,
            where: {locale: lang},
          });
    
        // modify data after database query
        let resultMap = {};
        result.forEach(region => {
          resultMap[region.id] = region;
        });
    
        return resultMap;
      }
}));