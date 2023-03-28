'use strict';

/**
 * event-speaker-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require('../../helper');
const uid = 'api::event-speaker-page.event-speaker-page'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        let lang = helper.getLang(ctx);
    
        // config database query
        let columns = [
          'id',
          `header_title`,
          `header_subtitle`,
          `header_subtitle_tag`,
          `header_text`,
          `meta_title`,
          `meta_description`,
          `intro_title`,
          `intro_subtitle`,
          `intro_text`
        ];
        let relations = ['header_image'];
    
        // get data from database
        let result = await strapi.db
          .query(uid).findOne({select: columns,where: {locale: lang}, populate: relations})
    
        if ( !result ) {
          return ctx.response.notFound();
        }
    
        // modify data after database query
        if (result.header_image) {
          result.header_image = result.header_image.url;
        }
    
        result.speakers = [];
    
        const fullPopulate = helper.getFullPopulateObject('api::event.event', 4);
        let event = await strapi.db
          .query('api::event.event').findOne({
            where: {locale: lang, status: 'published'},
            select: ['id', `title`],
            populate: {
                speakers: fullPopulate.populate.speakers
            }
          })
        if (event) {
    
          result.speakers = await Promise.all(event.speakers.map(async (item) => {
            let speaker = item.speaker;
    
            if (speaker['slug_' + lang]) {
              speaker.slug = speaker['slug_' + lang];
            }
    
            if (speaker.img_list.url) {
              speaker.img_list = speaker.img_list.url;
            }
    
            speaker.megatrends = await findMegatrendsForSpeaker(speaker, lang);
    
            // delete unused properties
            Object.keys(speaker).forEach(key => {
              if (!['id', 'name', 'surname', 'company', 'img_list', 'slug', 'megatrends'].includes(key)) {
                delete speaker[key];
              }
            });
    
            return speaker;
          }));
        }
    
        // fetch megatrends from event-megatrends-page
        result.megatrends = null;
        const MegatrendsPagesPopulate = helper.getFullPopulateObject(
            "api::event-megatrends-page.event-megatrends-page",
            4
          );
        let eventMegatrendsPage = await strapi.db.query('api::event-megatrends-page.event-megatrends-page').findOne({where: {locale: lang}, populate: {
            megatrends_anchor_list:
            MegatrendsPagesPopulate.populate.megatrends_anchor_list,
        }});
        if (eventMegatrendsPage.megatrends_anchor_list && eventMegatrendsPage.megatrends_anchor_list.megatrends.length) {
          result.megatrends = eventMegatrendsPage.megatrends_anchor_list.megatrends.map(megatrend => {
            return {
              'id': megatrend.id,
              'name': megatrend['name'],
              'icon': megatrend.icon && megatrend.icon.url ? megatrend.icon.url : null,
            };
          });
        }
    
        return result;
      }
    
}));


/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

async function findMegatrendsForSpeaker(speaker, lang) {
    let megatrends = null;
    const fullPopulate = helper.getFullPopulateObject('api::speaker.speaker', 4);
    let speakerDetail = await strapi.db
      .query('api::speaker.speaker').findOne({
        where: {locale: lang, id: speaker.id},
        select: ['id'],
        populate: {
            speaker_megatrends: fullPopulate.populate.speaker_megatrends
        }
      })
      if (speakerDetail.speaker_megatrends && speakerDetail.speaker_megatrends.megatrends) {
        megatrends = [];
        speakerDetail.speaker_megatrends.megatrends.forEach(item => {
          megatrends.push({
            id: item['id'],
            name: item['name'],
            icon: item.icon && item.icon.url ? item.icon.url : null,
          });
        });
      }
  
    return megatrends;
  }