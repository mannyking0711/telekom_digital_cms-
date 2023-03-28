'use strict';

/**
 * magazine-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = "api::magazine-page.magazine-page";
const helper = require('../../helper');

module.exports = createCoreController(uid, ({ strapi }) => ({

  // Return SEO text for all magazine pages
  async find(ctx) {
    const lang = helper.getLang(ctx);
    const magazinePage = await strapi.db.query(uid).findOne({where: {locale: lang}});

    return {
      articles_title: magazinePage ? magazinePage[`articles_title`] : '',
      articles_text: magazinePage ? magazinePage[`articles_text`] : '',
      podcasts_title: magazinePage ? magazinePage[`podcasts_title`] : '',
      podcasts_text: magazinePage ? magazinePage[`podcasts_text`] : '',
      videos_title: magazinePage ? magazinePage[`videos_title`] : '',
      videos_text: magazinePage ? magazinePage[`videos_text`] : '',
    }
  },

  // Return SEO text and item impressions for page type
  async findByType(ctx) {
    const {type} = ctx.params;
    const lang = helper.getLang(ctx);

    const magazinePage = await strapi.db.query(uid).findOne({where: {locale: lang}});

    let output = {
      title: magazinePage ? magazinePage[`${type}s_title`] : '',
      text: magazinePage ? magazinePage[`${type}s_text`] : '',
    };

    output.impressions = await strapi.controller('api::impression.impression').findByType(ctx);

    return output
  }
}));
