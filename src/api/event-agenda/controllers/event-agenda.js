'use strict';

/**
 * event-agenda controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const dateFormat = require('dateformat');
const helper = require('../../helper');

module.exports = createCoreController('api::event-agenda.event-agenda', ({ strapi }) => ({
  /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {

    // validate user input
    const { eventId } = ctx.params;

    // get user locale
    const lang = helper.getLang(ctx);

    // prepare filter to find event by slug
    const filter = { locale: lang };
    filter['slug_' + lang] = eventId;
    // const fullPopulate = helper.getFullPopulateObject("api::event.event", 7);

    // load the event
    const event = await strapi.db.query('api::event.event').findOne({
      where: filter, populate: {
        agenda: {
          "populate": {
            "header_image": true,
            "days": {
              "populate": {
                "subjects": {
                  "populate": {
                    "icon": true,
                    "presenters": {
                      "populate": {
                        "img_list": true,
                        "img_detail": true,
                        "img_header": true
                      }
                    },
                    "sessions": {
                      "populate": {
                        "participants": true,
                        "megatrends": {
                          "populate": {
                            "items": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "stages": { "populate": { "stage": true } },
            "content": {
              "populate": {
                "image": true
              }
            }
          }
        }, logo_dark: true
      }
    });

    if (!event || !event.agenda) {
      return ctx.response.notFound();
    }

    const agenda = event.agenda;
    let result = {}
    result.id = agenda.id;
    result.name = agenda[`name`];

    // header + intro
    result.header_title = agenda[`header_title`];
    result.header_subtitle = agenda[`header_subtitle`];
    result.header_subtitle_tag = agenda[`header_subtitle_tag`];
    result.header_text = agenda[`header_text`];
    result.header_image = agenda.header_image && agenda.header_image.url ? agenda.header_image.url : null;
    result.intro_title = agenda[`intro_title`];
    result.intro_subtitle = agenda[`intro_subtitle`];
    result.intro_text = agenda[`intro_text`];

    // set some event info on the agenda property
    result.logo = (event.logo_dark && event.logo_dark.url) ? event.logo_dark.url : '';
    result.start = dateFormat(event.start, 'dd.mm.yyyy');
    result.text = agenda['text'];
    result.slug_de = event.slug_de;
    result.slug_en = event.slug_en;

    result.days = [];
    // format output for days, subjects and sessions
    if (agenda.days) {
      result.days = agenda.days;
      result.days.map(day => {
        day.day_raw = day.day;
        helper.formatDate(day, 'day');
        day.title = day['title'];
        day.subtitle = day['subtitle'];
        day.subjects.map(subject => {
          subject.icon = (subject.icon && subject.icon.url) ? subject.icon.url : '';
          subject.presenters.map((presenter) => formatSpeaker(presenter, lang));
          subject.title = subject['title'];
          subject.subtitle = subject['subtitle'];
          subject.sessions.map(session => {
            session.from = session.from.split(':');
            session.from = `${session.from[0]}:${session.from[1]}`;
            session.to = session.to.split(':');
            session.to = `${session.to[0]}:${session.to[1]}`;
            session.participants.map((participant) => formatSpeaker(participant, lang));
            session.title = session['title'];
            session.description = session['description'];
            session.description_html = session['description_html'];
            if (session.megatrends && session.megatrends.items) {
              session.megatrends = session.megatrends.items.map(megatrend => {
                return { id: megatrend.id, name: megatrend[`name`] }
              })
            }

          });

        });

      });
    }

    // fetch megatrends from event-megatrends-page
    result.megatrends = null;
    const populateMegaTrend = helper.getFullPopulateObject("api::event-megatrends-page.event-megatrends-page", 4);
    let eventMegatrendsPage = await strapi.db.query('api::event-megatrends-page.event-megatrends-page').findOne(populateMegaTrend);
    if (eventMegatrendsPage.megatrends_anchor_list && eventMegatrendsPage.megatrends_anchor_list.megatrends.length) {
      result.megatrends = eventMegatrendsPage.megatrends_anchor_list.megatrends.map(megatrend => {
        return {
          'id': megatrend.id,
          'name': megatrend['name'],
          'icon': megatrend.icon && megatrend.icon.url ? megatrend.icon.url : null,
        };
      });
    }

    // content
    result.content = [];
    if (agenda['content']) {
      agenda['content'].forEach(content => {
        if (content.__component === 'content.content-teaser-pk') {
          if ((content.active === null) || content.active) {
            result.content.push({
              __component: content.__component.split('.')[1],
              headline: content.headline,
              text: content.text,
            });
          }
        } else if (content.__component === 'content.content-teaser1') {
          if ((content.active === null) || content.active) {
            result.content.push({
              __component: content.__component.split('.')[1],
              title: content.title,
              subtitle: content.subtitle,
              text: (content.text !== '<p><br></p>') ? content.text : null,
              button: content.button,
              url: content.url,
              image: content.image && content.image.url ? content.image.url : null,
            });
          }
        } else if (content.__component === 'content.content-tiles-stages') {
          if ((content.active === null) || content.active) {
            // stages list
            let stages = null;
            if (agenda.stages) {
              stages = agenda.stages.map(item => {
                return {
                  id: item.stage.id,
                  name: item.stage[`name`],
                  description: item.stage[`description`],
                  address: item.stage[`address`],
                  color: item.stage.color,
                }
              })
            }

            result.content.push({
              __component: content.__component.split('.')[1],
              headline: content.headline,
              text: content.text,
              button: content.button,
              stages,
            });
          }
        }
      });
    }

    return result;
  },
}));

/////////////////////////////////
// HELPER
/////////////////////////////////

function formatSpeaker(speaker) {
  speaker.image = (speaker.img_list?.formats.thumbnail || {}).url;

  delete speaker.img_list;
  delete speaker.img_detail;
  delete speaker.subline_de;
  delete speaker.subline_en;
  delete speaker.description_de;
  delete speaker.description_en;
  delete speaker.company_en;
  delete speaker.status;
  delete speaker.created_by;
  delete speaker.updated_by;
  delete speaker.created_at;
  delete speaker.updated_at;

  return speaker;
}