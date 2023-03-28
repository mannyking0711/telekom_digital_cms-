'use strict';

/**
 * faq-group controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::faq-group.faq-group'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        let lang = ctx.request.headers['accept-language'];
        lang = lang && lang.length > 1 ? lang.substring(0, 2) : 'de';
        
        // get data from database
        let result = await strapi.db
          .query(uid).findMany({
            select: ['id', 'name', 'participate'],
            where: {locale: lang},
            populate: {
                faqs: {
                    select: ['id', 'question', 'answer'],
                    populate: ['faq_group'],
                    where: {status: 'published'}
                }
            }
          })

        
    
        return result.map(item => {
            item.faqs = item.faqs.map(i => {
                i.faq_group = i.faq_group.id
                return i
            })
            return item
        });
      },
}));