'use strict';

/**
 * term controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::term.term'
var helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        var lang = helper.getLang(ctx);
    
        // config database query
        var columns = ['id', 'title', 'header'];
    
        // get data from database
        var result = await strapi.db.query(uid).findOne({
            select: columns,
            where: {locale: lang},
            populate: ['content']
        })
        
        return result;
      }
}));