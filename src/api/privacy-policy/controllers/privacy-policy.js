'use strict';

/**
 * privacy-policy controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::privacy-policy.privacy-policy'

var helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        var lang = helper.getLang(ctx);
    
        // config database query
        var columns = ['id', 'title', 'header'];
    
        // get data from database
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        var result = await strapi.db.query(uid).findOne({
            select: columns,
            where: {locale: lang},
            populate: {content: fullPopulate.populate.content}
        })
        
        return result;
      }
}));