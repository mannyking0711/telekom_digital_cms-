'use strict';

/**
 * faq controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::faq.faq', ({strapi}) => ({
    async find(ctx) {

        // get user locale
        let lang = ctx.request.headers['accept-language'];
        lang = lang && lang.length > 1 ? lang.substring(0, 2) : 'de';
    
        // config database query
        let columns = ['id', 'question', 'answer'];
        let relations = ['faq_group'];
        let where = {status: 'published', locale: lang};
    
        // get data from database
        let result = await strapi.db.query('api::faq.faq').findMany({
            select: columns,
            where,
            populate: relations
        })

        if (!result) {
            return ctx.response.notFound();
        }

        // modify data after database query
        return result.map(entity => {
    
          // modify group for label ony in correct language
          if (entity.faq_group) {
            entity.faq_group = entity.faq_group['name'];
          }
    
          return entity;
        });
      },
}));