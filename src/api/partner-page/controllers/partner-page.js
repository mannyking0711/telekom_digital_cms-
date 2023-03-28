'use strict';

/**
 * partner-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require('../../helper');
const uid = 'api::partner-page.partner-page'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {
        let lang = helper.getLang(ctx);
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        let partnerPage = await strapi.db.query(uid).findOne({
            where: {locale: lang},
            populate: {
                partners_united: fullPopulate.populate.partners_united,
                signup_bullets: true,
                info_bullets: true,
                signup_advantages: true,
            }
        });
    
        // partners_united
        if (partnerPage.partners_united && partnerPage.partners_united.partners) {
          partnerPage.partners_united = partnerPage.partners_united.partners.map(helper.formatPartner);
        } else {
          partnerPage.partners_united = [];
        }
    
        // partners
        const partners = await strapi.service('api::event.event').findCurrentEventPartners();
        partnerPage = {...partnerPage, ...partners};
    
        return partnerPage;
      },
}));