"use strict";

/**
 * companies-in-fokus controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

module.exports = createCoreController(
  "api::companies-in-fokus.companies-in-fokus",
  ({ strapi }) => ({
    async find(ctx) {

        const lang = helper.getLang(ctx);
        const companiesInFokus = await strapi.db.query('api::companies-in-fokus.companies-in-fokus').findMany({
            populate: ['highlight', 'articles'],
            where: {locale: lang}
        });
    
        let companiesInFokusItems = [];
    
        if (companiesInFokus[0]) {
          companiesInFokus[0][`articles`].forEach(element => {
            companiesInFokusItems.push(element.id)
          });
        }
    
        return {
          title: companiesInFokus[0] ? companiesInFokus[0][`title`] : '',
          highlight: companiesInFokus[0] ? (companiesInFokus[0][`highlight`] ? companiesInFokus[0][`highlight`].id : null) : null,
          articles: companiesInFokusItems
        }
      }
  })
);
