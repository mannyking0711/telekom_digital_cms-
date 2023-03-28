'use strict';

/**
 * newsletter-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require('../../helper');
const uid = 'api::newsletter-page.newsletter-page'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        const lang = helper.getLang(ctx);
    
        // get data from database
        var result = await strapi.db
          .query(uid).findOne({
            select: ['id', 'title', 'header', 'content', 'title_archive'],
            where: {locale: lang},
            populate: ['image']
          })
    
        // modify data after database query
        if ( !result ) {
          return ctx.response.notFound();
        }
    
        // prepare image
        delete result.id;
        if (result.image && result.image.url) {
          result.image = result.image.url;
        }
    
        // fetch newsletter archive
        result.archive = await await strapi.controller('api::newsletter.newsletter').find(ctx);
    
        return result
      }
}));