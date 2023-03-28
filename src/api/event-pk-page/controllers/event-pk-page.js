"use strict";

/**
 * event-pk-page controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");

const uid = "api::event-pk-page.event-pk-page";
module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    // get user locale
    let lang = helper.getLang(ctx);

    const fullPopulate = helper.getFullPopulateObject(uid, 4);

    let eventPkPage = await strapi.db.query(uid).findOne({
      where: { locale: lang },
      populate: {
        header_image: true,
        event_locations: fullPopulate.populate.event_locations,
        content: fullPopulate.populate.content,
      },
    });

    if (!eventPkPage) {
      return ctx.response.notFound();
    }

    let result = {
      header_title: eventPkPage[`header_title`],
      header_image:
        eventPkPage.header_image && eventPkPage.header_image.url
          ? eventPkPage.header_image.url
          : null,
      header_button: eventPkPage[`header_button`],
      link_register: eventPkPage[`link_register`],
      meta_title: eventPkPage[`meta_title`],
      meta_description: eventPkPage[`meta_description`],
      tickets_title: eventPkPage[`tickets_title`],
      tickets_text: eventPkPage[`tickets_text`],
      tickets_button: eventPkPage[`tickets_button`],
      event_locations: null,
      content: [],
    };

    // event_locations
    if (
      eventPkPage.event_locations &&
      eventPkPage.event_locations[`title`]
    ) {
      result.event_locations = {};
      result.event_locations.title =
        eventPkPage.event_locations[`title`];
      if (eventPkPage.event_locations.event_locations_images) {
        result.event_locations.items =
          eventPkPage.event_locations.event_locations_images.map((item) => {
            item.title = item[`title`];
            item.preview =
              item.image.formats && item.image.formats.medium
                ? item.image.formats.medium.url
                : item.image.url;
            item.large =
              item.image.formats && item.image.formats.large
                ? item.image.formats.large.url
                : item.preview;
            delete item.image;
            return item;
          });
      } else {
        result.event_locations.items = null;
      }
    }

    // Build map locations from event partners
    let mapLocations = [];
    const partners = await strapi.service('api::event.event').findCurrentEventPartnersMedium(lang);
    Object.keys(partners).forEach((e) => {
      if (partners[e].length) {
        mapLocations = [...mapLocations, ...partners[e]];
      }
    });
    const locations = await strapi.service('api::event.event').findCurrentEventLocationsMedium(lang);
    mapLocations = [...mapLocations, ...locations];

    // content
    if (eventPkPage["content"]) {
      eventPkPage["content"].forEach((content) => {
        if (
          content.__component === "event-pk.event-pk-intro" &&
          (content.active === null || content.active === true)
        ) {
          result.content.push({
            __component: content.__component.split(".")[1],
            title: content.title,
            subtitle: content.subtitle,
            text: content.text !== "<p><br></p>" ? content.text : null,
            text2: content.text2 !== "<p><br></p>" ? content.text2 : null,
            button: content.button,
            url: result.link_register,
            image:
              content.image && content.image.url ? content.image.url : null,
            countdown_show: content.countdown_show,
            countdown_day: content.countdown_day,
            countdown_days: content.countdown_days,
            countdown_title: content.countdown_title,
            countdown_text: content.countdown_text,
            countdown_button: content.countdown_button,
          });
        } else if (
          content.__component === "event-pk.event-pk-highlights" &&
          (content.active === null || content.active === true)
        ) {
          result.content.push({
            __component: content.__component.split(".")[1],
            title: content.title,
            subtitle: content.subtitle,
            button: content.button,
            color: content.color,
            url: result.link_register,
            items: content.event_pk_highlights_items.map((item) => {
              return {
                title: item.title,
                text: item.text !== "<p><br></p>" ? item.text : null,
                image: item.image && item.image.url ? item.image.url : null,
                icon: item.icon && item.icon.url ? item.icon.url : null,
              };
            }),
            text: content.text !== "<p><br></p>" ? content.text : null,
          });
        } else if (
          content.__component === "event-pk.event-pk-map" &&
          (content.active === null || content.active === true)
        ) {
          result.content.push({
            __component: content.__component.split(".")[1],
            title: content.title,
            subtitle: content.subtitle,
            locations: mapLocations,
          });
        } else if (
          content.__component === "event-pk.event-pk-banner" &&
          (content.active === null || content.active === true)
        ) {
          result.content.push({
            __component: content.__component.split(".")[1],
            title: content.title,
            text: content.text !== "<p><br></p>" ? content.text : null,
            logo: content.logo && content.logo.url ? content.logo.url : null,
          });
        } else if (
          content.__component === "event-pk.event-pk-banner2" &&
          (content.active === null || content.active === true)
        ) {
          result.content.push({
            __component: content.__component.split(".")[1],
            headline_tag: content.headline_tag,
            headline: content.headline,
            text: content.text !== "<p><br></p>" ? content.text : null,
            image:
              content.image && content.image.url ? content.image.url : null,
            url: content.url,
          });
        } else if (content.__component === "event-pk.event-pk-teaser") {
          result.content.push({
            __component: content.__component.split(".")[1],
            active: content.active !== null ? content.active : true,
          });
        }
      });
    }

    return result;
  },
}));
