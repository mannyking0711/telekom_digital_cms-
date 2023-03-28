'use strict';

/**
 * event-megatrends-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require('../../helper');
const uid = 'api::event-megatrends-page.event-megatrends-page'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user lang
        const lang = helper.getLang(ctx);
    
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        let eventMegatrendsPages = await strapi.db.query(uid).findMany({where: {locale: lang}, populate: fullPopulate.populate});
    
        if (!eventMegatrendsPages) {
          return ctx.response.notFound();
        }
        let eventMegatrendsPage = eventMegatrendsPages[0]
    
        let result = {
          header_title: eventMegatrendsPage[`header_title`],
          header_subtitle: eventMegatrendsPage[`header_subtitle`],
          header_subtitle_tag: eventMegatrendsPage[`header_subtitle_tag`],
          header_text: eventMegatrendsPage[`header_text`],
          header_image: eventMegatrendsPage.header_image && eventMegatrendsPage.header_image.url ? eventMegatrendsPage.header_image.url : null,
          intro_title: eventMegatrendsPage[`intro_title`],
          intro_subtitle: eventMegatrendsPage[`intro_subtitle`],
          intro_text: eventMegatrendsPage[`intro_text`],
          megatrends: null,
        }
    
        // megatrends
        if (eventMegatrendsPage.megatrends_anchor_list && eventMegatrendsPage.megatrends_anchor_list.megatrends.length) {
          result.megatrends = eventMegatrendsPage.megatrends_anchor_list.megatrends.map(megatrend => {
            const data = {
              'id': megatrend.id,
              'name': megatrend['name'],
              'description': megatrend['description'],
              'quote': megatrend['quote'],
              'quote_author': megatrend.quote_author,
              'subtopics': megatrend['subtopics'],
              'background_color': megatrend.background_color,
              'background_class': megatrend.background_color,
            };
    
            for (const imageField of ['icon', 'background_icon', 'image']) {
              if (megatrend[imageField] && megatrend[imageField].url) {
                data[imageField] = megatrend[imageField].url;
              }
            }
    
            return data;
          });
        }
    
        return result;
      }
}));