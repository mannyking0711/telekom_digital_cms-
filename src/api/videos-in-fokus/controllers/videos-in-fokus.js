'use strict';

/**
 * videos-in-fokus controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::videos-in-fokus.videos-in-fokus'
const helper = require("../../helper");

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        const lang = helper.getLang(ctx);
        const videosInFokus = await strapi.db.query(uid).findOne({where: {locale: lang}, populate: {videos: true, highlight: true}});
    
        let videosInFokusItems = [];
    
        if (videosInFokus) {
          videosInFokus[`videos`].forEach(element => {
            videosInFokusItems.push(element.id)
          });
        }
    
        return {
          title: videosInFokus ? videosInFokus[`title`] : '',
          highlight: videosInFokus ? (videosInFokus[`highlight`] ? videosInFokus[`highlight`].id : null) : null,
          videos: videosInFokusItems,
          button: videosInFokus ? videosInFokus[`button`] : null,
        }
      }
}));