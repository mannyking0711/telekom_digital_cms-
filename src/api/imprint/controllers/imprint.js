'use strict';

/**
 * imprint controller
 */

const { createCoreController } = require('@strapi/strapi').factories;


const helper = require('../../helper');
const uid = 'api::imprint.imprint'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        let lang = helper.getLang(ctx);
    
        // config database query
        let columns = ['id', 'title', 'header'];
        let relations = ['content'];
    
        // get data from database
        let result = await strapi.db.query(uid).findOne({
            where: {locale: lang},
            select: columns,
            populate: relations
        })
    
        if ( !result ) {
            return ctx.response.notFound();
        }

        return result;
      }
}));