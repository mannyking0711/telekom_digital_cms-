'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const helper = require('../../helper');

module.exports = createCoreController('api::contact.contact', ({strapi}) => ({
    async find(ctx) {

        // get user locale
        const lang = helper.getLang(ctx);

        const results = await strapi.db.query('api::contact.contact').findMany({
            select: ['id', 'title', 'header', 'content'],
            where: {locale: lang}
        });

        if (!results) {
            return ctx.response.notFound();
          }
    
        // get data from database
        return results[0];
      }
}));