"use strict";

/**
 * index controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");
const uid = "api::index.index";

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    // get data from database
    const lang = helper.getLang(ctx);
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    let result = await strapi.db.query(uid).findOne({
      select: ["id"],
      populate: {
        'article_hero': {
            select: ['id']
        },
        event_header: fullPopulate.populate.event_header,
        event_content: fullPopulate.populate.event_content,
        content_teaser_cards: fullPopulate.populate.content_teaser_cards,
        content_slider_quotes: fullPopulate.populate.content_slider_quotes,
        event_intro: fullPopulate.populate.event_intro,
        event_locations: fullPopulate.populate.event_locations
      },
      where: { locale: lang },
    });

    if (result) {
      // get user locale

      result.article_hero = result.article_hero?.id

      // partners
      const partners = await strapi
        .service("api::event.event")
        .findCurrentEventPartners();
      result = { ...result, ...partners };

      // create hero object
      result.hero = createHeroFromEventHeader(result.event_header, lang);

      // create tickets object
      result.tickets = createTicketsFromEvent(
        result.event_header && result.event_header.event
          ? result.event_header.event
          : null
      );

      // create countdown object
      result.countdown = createCountdownFromEvent(
        result.event_content && result.event_content.event
          ? result.event_content.event
          : null
      );

      // event_intro
      result.event_intro = createEventIntro(
        result.event_intro ? result.event_intro : null
      );

      // create event_content object
      result.event_content = createEventContentFromEventContent(
          result.event_content, lang
          );

      // Format event_locations
      if (result.event_locations && result.event_locations[`title`]) {
        result.event_locations.title = result.event_locations[`title`];
        if (result.event_locations.event_locations_images) {
          result.event_locations.items =
            result.event_locations.event_locations_images.map((item) => {
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
          result.event_locations.items = [];
        }
        delete result.event_locations.event_locations_images;
      } else {
        result.event_locations = false;
      }

      // content_teaser_cards
      result.content_teaser_cards = createContentTeaserCards(
        result.content_teaser_cards ? result.content_teaser_cards : null
      );

      // content_slider_quotes
      result.content_slider_quotes = createContentSliderQuotes(
        result.content_slider_quotes ? result.content_slider_quotes : null
      );

      // event_top_speaker / event_agenda_highlights
      // Fetch data from event controller
      // @todo: Refactor this to a "cheaper" solution
    //   let ctxEvent = { ...ctx };
    //   return ctx
    let ctxEvent = {...ctx}
    ctxEvent.params = {'0': `events/${result.event_content.slug}`, id: result.event_content.slug}
      const event = await strapi
        .controller("api::event.event")
        .findOne(ctxEvent);

      result.event_top_speaker = event.event_top_speaker;
      result.event_agenda_highlights = event.event_agenda_highlights;

      // Remove unused data
      delete result.event_header;
    }

    return result;
  },
}));

/**
 * Return a hero object from event_header or null.
 */
function createHeroFromEventHeader(event_header, lang) {
  let result = null;
  if (
    event_header &&
    event_header.event &&
    event_header["hero_title"] &&
    event_header["hero_image"]
  ) {
    result = {
      slug: event_header.event["slug_" + lang],
      title: event_header["hero_title"],
      button: event_header["hero_button"],
      tags: event_header["hero_tags"],
      image: event_header["hero_image"].url,
      tickets_active:
        event_header.tickets_active !== null
          ? event_header.tickets_active
          : true,
      presenter_active:
        event_header.presenter_active !== null
          ? event_header.presenter_active
          : true,
    };
    if (result.tags) {
      result.tags = result.tags.split(",").map((i) => i.trim());
    } else {
      result.tags = [];
    }
  }

  return result;
}

/**
 * Return a countdown object from event or null.
 * The counter object has less data than a full event.
 */
function createCountdownFromEvent(event) {
  let result = null;
  if (
    event &&
    event.start &&
    event.logo &&
    event["countdown_day"] &&
    event["countdown_days"] &&
    event["countdown_title"]
  ) {
    result = {
      logo: event.logo ? event.logo.url : null,
      logo_dark: event.logo_dark ? event.logo_dark.url : null,
      start: event.start,
      end: event.end,
      link_register: event["link_register"],
      slug_de: event.slug_de,
      slug_en: event.slug_en,
      day: event["countdown_day"],
      days: event["countdown_days"],
      title: event["countdown_title"],
      text: event["countdown_text"],
      button: event["countdown_button"],
    };
    helper.formatDate(result, "start");
    helper.formatDate(result, "end");
  }

  return result;
}

/**
 * Return a tickets object from event or null.
 * The counter object has less data than a full event.
 */
function createTicketsFromEvent(event) {
  let result = null;
  if (event && event.logo && event["tickets_title"]) {
    result = {
      logo: event.logo ? event.logo.url : null,
      logo_dark: event.logo_dark ? event.logo_dark.url : null,
      title: event["tickets_title"],
      text: event["tickets_text"],
      button: event["tickets_button"],
      link_register: event["link_register"],
      slug_de: event.slug_de,
      slug_en: event.slug_en,
    };
  }
  return result;
}

function createEventIntro(event_intro) {
  let result = null;
  if (
    event_intro &&
    (event_intro.active === null || event_intro.active === true) &&
    event_intro.event &&
    event_intro["title"]
  ) {
    result = {
      title: event_intro["title"],
      subtitle: event_intro["subtitle"],
      text:
        event_intro["text"] && event_intro["text"] !== "<p><br></p>"
          ? event_intro["text"]
          : null,
      button: event_intro["button"],
      url: event_intro.event["link_register"],
      image: event_intro["image"] ? event_intro["image"].url : null,
    };
  }

  return result;
}

/**
 * Return a event_content object from event_content or null.
 */
function createEventContentFromEventContent(event_content, lang) {
  let result = null;
  if (event_content && event_content.event && event_content["title"]) {
    result = {
      slug: event_content.event["slug_" + lang],
      title: event_content["title"],
      subtitle: event_content["subtitle"],
      gallery_title: event_content["gallery_title"],
      gallery_subtitle: event_content["gallery_subtitle"],
      gallery_image_left: event_content["gallery_image_left"]
        ? event_content["gallery_image_left"].url
        : null,
      gallery_image_right: event_content["gallery_image_right"]
        ? event_content["gallery_image_right"].url
        : null,
      gallery_button: event_content["gallery_button"],
      text1: event_content["text1"],
      text2: event_content["text2"],
    };
  }

  return result;
}

function createContentTeaserCards(content_teaser_cards) {
  let result = null;
  if (
    content_teaser_cards &&
    content_teaser_cards["title"] &&
    content_teaser_cards.cards
  ) {
    result = {
      active:
        content_teaser_cards.active !== null
          ? content_teaser_cards.active
          : true,
      title: content_teaser_cards[`title`],
      text: content_teaser_cards[`text`],
      cards: helper.formatCardItems(content_teaser_cards.cards),
    };
  }

  return result;
}

function createContentSliderQuotes(content_slider_quotes) {
  let result = null;
  if (
    content_slider_quotes &&
    (content_slider_quotes.active === null ||
      content_slider_quotes.active === true)
  ) {
    result = {
      title: content_slider_quotes[`title`],
      title_tag: content_slider_quotes[`title_tag`],
      subtitle: content_slider_quotes["subtitle"],
      text: content_slider_quotes[`text`],
      quotes: helper.formatContentQuoteItems(content_slider_quotes[`quotes`]),
    };
  }

  return result;
}
