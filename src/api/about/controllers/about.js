'use strict';

/**
 * about controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::about.about', ({strapi}) => ({
    async find(ctx) {

        // get data from database
        // let aboutPage = await strapi.query('about').findOne();
    
        let result = await strapi.service('api::event.event').findCurrentEventPartners();
    
        return result;
      }
}));