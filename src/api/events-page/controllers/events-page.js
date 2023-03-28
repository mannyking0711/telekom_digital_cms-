'use strict';

/**
 * events-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require('../../helper');

const uid = 'api::events-page.events-page'

// helper function
const formatEvent = function (event) {

    // set images to be only the url
    event.logo = (event.logo_dark && event.logo_dark.url) ? event.logo_dark.url : '';
    event.img_list = (event.img_list && event.img_list.url) ? event.img_list.url : '';
    event.img_list_mobile = (event.img_list_mobile && event.img_list_mobile.url) ? event.img_list_mobile.url : '';
  
    // select translated properties
    event.title = event[`title`];
    event.location = event[`location`];
    event.link_register = event[`link_register`];
  
    // countdown data
    if (event[`countdown_day`] && event[`countdown_days`] && event[`countdown_title`] && event[`countdown_text`]) {
      event.countdown = {
        day: event[`countdown_day`],
        days: event[`countdown_days`],
        title: event[`countdown_title`],
        text: event[`countdown_text`],
        button: event[`countdown_button`],
      }
    } else {
      event.countdown = null;
    }
  
    // tickets data
    if (event[`tickets_title`] && event[`tickets_text`] && event[`tickets_button`]) {
      event.tickets = {
        title: event[`tickets_title`],
        text: event[`tickets_text`],
        button: event[`tickets_button`],
      }
    } else {
      event.tickets = null;
    }
  
    // format date
    helper.formatDate(event, 'start');
  
    // delete unused properties
    const allowedProperties = [
      'id',
      'slug_de',
      'slug_en',
      'title',
      'location',
      'link_register',
      'start',
      'start_timestamp',
      'logo',
      'img_list',
      'img_list_mobile',
      'show_counter',
      'countdown',
      'tickets',
    ];
    Object.keys(event).forEach(key => {
      if (!allowedProperties.includes(key)) {
        delete event[key];
      }
    });
  
    return event;
  };

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        const lang = helper.getLang(ctx);
    
        // get data from database
        const fullPopulate = helper.getFullPopulateObject('api::events-page.events-page', 4);
        let result = await strapi.db
          .query('api::events-page.events-page').findOne({
            where: {locale: lang},
            select: [
                'id',
                `intro_headline`,
                `info_headline`,
                'info_fact1_number',
                `info_fact1_text`,
                'info_fact2_number',
                `info_fact2_text`,
                'info_fact3_number',
                `info_fact3_text`,
                'info_fact4_number',
                `info_fact4_text`,
                `info_text`,
                `footer_headline`,
                `footer_text`,
              ],
              populate: {
                'intro_highlight_event': fullPopulate.populate.intro_highlight_event,
                'intro_events': fullPopulate.populate.intro_events,
                'preview_events': fullPopulate.populate.preview_events,
                'footer_events' : fullPopulate.populate.footer_events,
              }
          })
    
        if (result) {
    
          // format events output
          result.intro_highlight_event = formatEvent(result.intro_highlight_event.event);
          result.intro_events = result.intro_events.events.map(e => formatEvent(e));
          result.footer_events = result.footer_events.events.map(e => formatEvent(e));
          result.preview_events.map(data => {
            data.event = formatEvent(data.event);
            data.headline = data[`headline`];
            data.text = data[`text`];
            data.review_url = data[`review_url`];
            data.preview_images = data.preview_images.map(i => i.url);
          });
        }
    
        return result;
      }
}));