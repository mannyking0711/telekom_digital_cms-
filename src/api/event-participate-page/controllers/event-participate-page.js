'use strict';

/**
 * event-participate-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::event-participate-page.event-participate-page'
const helper = require("../../helper");

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        let lang = helper.getLang(ctx);
    
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        let eventParticipatePages = await strapi.db.query(uid).findMany({where: {locale: lang}, populate: fullPopulate.populate});
    
        if (!eventParticipatePages) {
          return ctx.response.notFound();
        }
        let eventParticipatePage = eventParticipatePages[0]
    
        let result = {
          meta_title: eventParticipatePage[`meta_title`],
          meta_description: eventParticipatePage[`meta_description`],
          content: [],
        }
    
        // content
        if (eventParticipatePage['content']) {
          for (const content of eventParticipatePage['content']) {
            if ((content.__component === 'event-participate.event-participate-faqs') && ((content.active === null) || (content.active === true))) {
              result.content.push({
                __component: content.__component.split('.')[1],
                headline: content.headline,
                headline_tag: content.headline_tag,
                subheadline: content.subheadline,
                text: (content.text !== '<p><br></p>') ? content.text : null,
              });
            } else if ((content.__component === 'event-participate.event-participate-join') && ((content.active === null) || (content.active === true))) {
              result.content.push({
                __component: content.__component.split('.')[1],
                headline: content.headline,
                headline_tag: content.headline_tag,
                subheadline: content.subheadline,
                text: (content.text !== '<p><br></p>') ? content.text : null,
              });
            } else if ((content.__component === 'event-participate.event-participate-streams') && ((content.active === null) || (content.active === true))) {
              result.content.push({
                __component: content.__component.split('.')[1],
                headline: content.headline,
                headline_tag: content.headline_tag,
                subheadline: content.subheadline,
                text: (content.text !== '<p><br></p>') ? content.text : null,
                streams: content.streams_active ? await strapi.service("api::event.event").findCurrentEventStreams(lang) : null,
              });
            }
          }
        }
    
        return result;
      },
}));