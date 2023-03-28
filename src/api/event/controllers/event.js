"use strict";

/**
 * event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");
// const {findCurrentEventPartners} = require("../services/event");
const dateFormat = require("dateformat");
const uid = "api::event.event";

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    // get user locale
    const lang = helper.getLang(ctx);

    // config database query
    const columns = [
      "id",
      "title",
      "description",
      "link_register",
      "start",
      "end",
      "slug_de",
      "slug_en",
      "count_speaker",
      "countdown_day",
      "countdown_days",
      "countdown_title",
      "countdown_text",
      "countdown_button",
      "tickets_title",
      "tickets_text",
      "tickets_button",
    ];
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    const relations = {
      img_list: true,
      logo: true,
      logo_dark: true,
      speakers: { select: ["id"] },
      event_presenter: fullPopulate.populate.event_presenter,
      event_gk_pk_teaser: fullPopulate.populate.event_gk_pk_teaser
    };
    const where = {
      status: "published",
      locale: lang,
      title: {
        $notNull: true,$ne: "",
      }
 ,
    };

    // get data from database
    const result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      populate: relations,
      orderBy: { start: "ASC" },
    });

    // modify data after database query
    if (!result) {
      return ctx.response.notFound();
    }

    return result.map((entity) => {
      // default output format
      helper.defaultOutputFormat(entity);

      // set content type
      entity.type = "event";

      // Has translation?
      // TODO_IMPROVE_THIS
      result.translation = !!result.slug_en;

      // set logos for list directly
      if (entity.logo) {
        entity.logo = entity.logo.url;
      }
      if (entity.logo_dark) {
        entity.logo_dark = entity.logo_dark.url;
      }

      // correct format for start and end date
      helper.formatDate(entity, "start");
      helper.formatDate(entity, "end");

      // countdown data
      if (
        entity["countdown_day"] &&
        entity["countdown_days"] &&
        entity["countdown_title"] &&
        entity["countdown_text"]
      ) {
        entity.countdown = {
          day: entity["countdown_day"],
          days: entity["countdown_days"],
          title: entity["countdown_title"],
          text: entity["countdown_text"],
          button: entity["countdown_button"],
        };
      } else {
        entity.countdown = null;
      }
      delete entity["countdown_day"];
      delete entity["countdown_days"];
      delete entity["countdown_title"];
      delete entity["countdown_text"];
      delete entity["countdown_button"];

      // tickets data
      if (
        entity["tickets_title"] &&
        entity["tickets_text"] &&
        entity["tickets_button"]
      ) {
        entity.tickets = {
          title: entity["tickets_title"],
          text: entity["tickets_text"],
          button: entity["tickets_button"],
        };
      } else {
        entity.tickets = null;
      }
      delete entity["tickets_title"];
      delete entity["tickets_text"];
      delete entity["tickets_button"];

      // GK PK teaser
      entity["gk_pk_teaser"] = createEventGkPkTeaser(
        entity["event_gk_pk_teaser"] ? entity["event_gk_pk_teaser"] : null
      );

      // presenter
      entity["presenter"] = createEventPresenter(
        entity.event_presenter ? entity.event_presenter : null
      );

      // remove unused data
      delete entity.partners_regular;
      delete entity.partners_premium;
      delete entity.partners_coop;
      delete entity.partners_support;
      delete entity.partners_mobility;
      delete entity.partners_digitalization;
      delete entity.partners_media;
      delete entity.partners_startup;
      delete entity.partners_partner;
      delete entity.faq_items;
      delete entity.event_intro;
      delete entity.event_map;
      delete entity.partner_focus;
      delete entity.keyvisual;
      delete entity.event_mainstages;
      delete entity.event_parallax;
      delete entity.event_slider;
      delete entity.event_marketplaces;
      delete entity.event_locations;
      delete entity.event_app;
      delete entity.event_stream;
      delete entity.event_gk_pk_teaser;
      delete entity.speakers;
      delete entity.streams;
      delete entity.event_header;
      delete entity.event_introduction;
      delete entity.event_advertising;
      delete entity.content_teaser_cards;
      delete entity.event_presenter;
      delete entity.event_top_speaker;
      delete entity.event_agenda_highlights;
      delete entity.event_megatrends;
      delete entity.event_megatrends2;
      delete entity.event_teaser_tickets;
      delete entity.event_banner2;
      delete entity.content_note;
      delete entity.content_slider_quotes;
      delete entity.map_locations;

      return entity;
    });
  },
    /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {

    // TODO_TEST_MORE

    // validate user input
    const {id} = ctx.params;

    // get user locale
    const lang = helper.getLang(ctx);

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft = ctx.request.query.preview_secret === strapi.config.get('frontend.preview_secret');

    // config database query
    const columns = [
      'id',
      'title',
      'description',
      'link_register',
      'introtext',
      'start',
      'end',
      'slug_de',
      'slug_en',
      'count_speaker',
      'count_speaker_label',
      'count_countries',
      'count_countries_label',
      'count_stages',
      'count_stages_label',
      'count_hours',
      'count_hours_label',
      'registrationtext',
      'agendatext',
      'faq_title',
      'faq_text',
      'speakers_page_title_a',
      'speakers_page_title_b',
      'speakers_page_text',
      'speakers_page_meta_title',
      'speakers_page_meta_description',
      'countdown_day',
      'countdown_days',
      'countdown_title',
      'countdown_text',
      'countdown_button',
      'tickets_title',
      'tickets_text',
      'tickets_button',
    ];
    var where = {locale: lang};
    where['slug_'+lang] = id;
    if (isPreviewDraft === false) {
      where['status'] = 'published'
    }
    const fullPopulate3 = helper.getFullPopulateObject(uid, 3);
    const fullPopulate4 = helper.getFullPopulateObject(uid, 4);
    const relationsArr3 = ['faq_items', 'event_app', 'event_mainstages', 'event_map', 'event_parallax', 'keyvisual', 'streams',
      'img_list', 'logo', 'logo_dark',
     'event_marketplaces', 'event_gk_pk_teaser',
      'event_presenter', 'event_top_speaker', 'event_agenda_highlights', 'event_megatrends', 'event_megatrends2', 'event_teaser_tickets',
      'event_banner2', 'content_note','speakers', 'event_intro', 'event_header', 'event_introduction', 'map_locations', 'event_slider', 'event_stream'
    ];
    const relationsArr4 = ['event_locations', 'content_slider_quotes', 'content_teaser_cards']

    let relations = {'agenda': {select: ['id']}}
    for ( const rel of relationsArr3 ) {
      relations[rel] = fullPopulate3.populate[rel]
    }
    for ( const rel of relationsArr4 ) {
      relations[rel] = fullPopulate4.populate[rel]
    }

    // get data from database
    let result = await strapi.db.query(uid).findOne({
      select: columns,
      where,
      populate: relations
    })

    // modify data after database query
    if (!result) {
      return ctx.response.notFound();
    }

    // default output format
    helper.defaultOutputFormat(result);

    // Find the agenda for this event and extract the highlights from it.
    // But check result.agenda first as findOne({id: null}) returns the first item
    // https://github.com/strapi/strapi/issues/9077
    result.agenda = result.agenda?.id
    const agenda = result.agenda
      ? await strapi.db.query('api::event-agenda.event-agenda').findOne({where: {id: result.agenda}})
      : null;

    // Format speakers list
    if (result.speakers) {
      result.speakers = formatSpeaker(result.speakers, ctx);
    }

    // correct format for start and end date
    helper.formatDate(result, 'start');
    helper.formatDate(result, 'end');

    // partners
    const partners = await strapi.service(uid).findCurrentEventPartners();
    result = {...result, ...partners};

    // countdown data
    if (result['countdown_day'] && result['countdown_days'] && result['countdown_title'] && result['countdown_text']) {
      result.countdown = {
        day: result['countdown_day'],
        days: result['countdown_days'],
        title: result['countdown_title'],
        text: result['countdown_text'],
        button: result['countdown_button'],
      }
    } else {
      result.countdown = null;
    }
    delete result['countdown_day'];
    delete result['countdown_days'];
    delete result['countdown_title'];
    delete result['countdown_text'];
    delete result['countdown_button'];

    // tickets data
    if (result['tickets_title'] && result['tickets_text'] && result['tickets_button']) {
      result.tickets = {
        title: result['tickets_title'],
        text: result['tickets_text'],
        button: result['tickets_button'],
      }
    } else {
      result.tickets = null;
    }
    // delete result['tickets_title'];
    // delete result['tickets_text'];
    // delete result['tickets_button'];

    // Speakers page
    result.speakers_page = {
      title_a: result.speakers_page_title_a,
      title_b: result.speakers_page_title_b,
      text: result.speakers_page_text,
      meta_title: result.speakers_page_meta_title,
      meta_description: result.speakers_page_meta_description,
    };
    delete result.speakers_page_title_a;
    delete result.speakers_page_title_b;
    delete result.speakers_page_text;
    delete result.speakers_page_meta_title;
    delete result.speakers_page_meta_description;

    // Format event_locations.event_locations_images
    if (result.event_locations && result.event_locations[`title`]) {
      result.event_locations.title = result.event_locations[`title`];
      if (result.event_locations.event_locations_images) {
        result.event_locations.items = result.event_locations.event_locations_images.map(item => {
          item.preview = item.image.formats && item.image.formats.medium ? item.image.formats.medium.url : item.image.url;
          item.large = item.image.formats && item.image.formats.large ? item.image.formats.large.url : item.preview;
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

    // create tickets object
    result.tickets = createTickets(result);

    // create countdown object
    result.countdown = createCountdown(result);

    // event_intro
    result.event_intro = createEventIntro(result.event_intro ? result.event_intro : null, result.link_register);

    // event_header
    result.event_header = createEventHeader(result.event_header ? result.event_header : null);

    // introduction
    result.event_introduction = createEventIntroduction(result.event_introduction ? result.event_introduction : null);

    // marketplaces
    result.event_marketplaces = createEventMarketplaces(result.event_marketplaces ? result.event_marketplaces : null);

    // advertising
    result.event_advertising = createEventAdvertising(result.event_advertising ? result.event_advertising : null);

    // event_gk_pk_teaser
    result.event_gk_pk_teaser = createEventGkPkTeaser(result.event_gk_pk_teaser ? result.event_gk_pk_teaser : null);

    // content_teaser_cards
    result.content_teaser_cards = createContentTeaserCards(result.content_teaser_cards ? result.content_teaser_cards : null);

    // event_presenter
    result.event_presenter = createEventPresenter(result.event_presenter ? result.event_presenter : null);

    // event_top_speaker
    result.event_top_speaker = createEventTopSpeaker(result.event_top_speaker ? result.event_top_speaker : null, result.speakers);

    // event_agenda_highlights
    result.event_agenda_highlights = createEventAgendaHighlights(result.event_agenda_highlights ? result.event_agenda_highlights : null, agenda);

    // event_megatrends
    result.event_megatrends = await createEventMegatrends(result.event_megatrends ? result.event_megatrends : null);

    // event_megatrends2
    result.event_megatrends2 = await createEventMegatrends2(result.event_megatrends2 ? result.event_megatrends2 : null);

    // events_teaser_tickets
    result.event_teaser_tickets = createEventTeaserTickets(result.event_teaser_tickets ? result.event_teaser_tickets : null);

    // event_banner2
    result.event_banner2 = createEventBanner2(result.event_banner2 ? result.event_banner2 : null);

    // content_note
    result.content_note = createContentNote(result.content_note ? result.content_note : null);

    // content_slider_quotes
    result.content_slider_quotes = createContentSliderQuotes(result.content_slider_quotes ? result.content_slider_quotes : null);

    result.map_locations.map_locations = result.map_locations && result.map_locations.items
    delete result.map_locations.items

    return result;
  },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

function formatSpeaker(speakers, ctx) {
  var lang = helper.getLang(ctx);

  return speakers.map((i) => {
    helper.defaultOutputFormat(i.speaker);

    i.speaker.highlight = i.highlight;

    delete i.speaker.description_de;
    delete i.speaker.description_en;
    delete i.speaker.img_detail;
    delete i.speaker.subline_de;
    delete i.speaker.subline_en;
    delete i.speaker.company_en;

    return i.speaker;
  });
}

function formatAgendaHighlights(agenda) {
  var highlights = [];

  if (agenda && agenda.days) {
    agenda.days.forEach((day) => {
      day.subjects.forEach((subject) => {
        subject.sessions.forEach((session) => {
          if (session.highlight) {
            session.day_title = day["title"];
            session.day_subtitle = day["subtitle"];
            session.subject = subject["title"];
            session.speaker = session.participants.map((participant) => {
              return {
                image:
                  participant.img_list && participant.img_list.formats.thumbnail
                    ? participant.img_list.formats.thumbnail.url
                    : "",
                name: participant.fullname,
                company:
                  participant.company,
              };
            });
            session.day_iso = dateFormat(day.day, "yyyy-mm-dd");
            session.day_date = dateFormat(day.day, "dd.mm.yyyy");
            session.from = session.from.split(":");
            session.from = `${session.from[0]}:${session.from[1]}`;
            session.to = session.to.split(":");
            session.to = `${session.to[0]}:${session.to[1]}`;
            session.title = session["title"];
            session.description = session["description"];

            delete session.participants;
            delete session.highlight;
            delete session.title_de;
            delete session.description_de;
            delete session.title_en;
            delete session.description_en;
            delete session.description_html_de;
            delete session.description_html_en;
            delete session.megatrends;

            highlights.push(session);
          }
        });
      });
    });
  }

  // highlights shall be sorted by their highlight_position attribute
  highlights.sort(function (a, b) {
    return (
      parseInt(a.highlight_position, 10) - parseInt(b.highlight_position, 10)
    );
  });

  return highlights;
}

/**
 * Return a countdown object from event or null.
 * The counter object has less data than a full event.
 */
function createCountdown(event) {
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
      day: event["countdown_day"],
      days: event["countdown_days"],
      title: event["countdown_title"],
      text: event["countdown_text"],
      button: event["countdown_button"],
    };
  }

  return result;
}

/**
 * Return a tickets object from event or null.
 * The counter object has less data than a full event.
 */
function createTickets(event) {
  let result = null;
  if (event && event.logo && event["tickets_title"]) {
    result = {
      title: event["tickets_title"],
      text: event["tickets_text"],
      button: event["tickets_button"],
    };
  }
  return result;
}

function createEventIntro(event_intro, link_register) {
  let result = null;
  if (
    event_intro &&
    (event_intro.active === null || event_intro.active === true) &&
    event_intro["title"]
  ) {
    result = {
      title: event_intro["title"],
      subtitle: event_intro["subtitle"],
      text:
        event_intro["text"] &&
        event_intro["text"] !== "<p><br></p>"
          ? event_intro["text"]
          : null,
      button: event_intro["button"],
      url: link_register,
      image: event_intro["image"] ? event_intro["image"].url : null,
    };
  }

  return result;
}

function createEventHeader(event_header) {
  let result = null;
  if (event_header && event_header["title"] && event_header["image"]) {
    result = {
      title: event_header["title"],
      image: event_header["image"] ? event_header["image"].url : null,
      tags: event_header["tags"],
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

function createEventIntroduction(event_introduction) {
  let result = null;
  if (
    event_introduction &&
    event_introduction["headline"] &&
    event_introduction["text"] &&
    event_introduction["image1"]
  ) {
    result = {
      title: event_introduction["headline"],
      text: event_introduction["text"],
      button: event_introduction["btn_label"],
      images: [],
    };
    if (event_introduction["image1"])
      result.images.push(event_introduction["image1"].url);
    if (event_introduction["image2"])
      result.images.push(event_introduction["image2"].url);
    if (event_introduction["image3"])
      result.images.push(event_introduction["image3"].url);
  }

  return result;
}

function createEventMarketplaces(event_marketplaces) {
  let result = null;
  if (
    event_marketplaces &&
    event_marketplaces.active &&
    event_marketplaces.marketplaces
  ) {
    const marketplaces = event_marketplaces.marketplaces.map((item) => {
      item.link = item[`link`];
      item.subtitle = item[`subtitle`];
      item.title = item[`title`];
      item.text = item[`text`];
      item.subtitle = item[`subtitle`];
      item.image = item.image && item.image.url ? item.image.url : null;

      return item;
    });

    result = {
      id: event_marketplaces.id,
      active:
        event_marketplaces.active !== null ? event_marketplaces.active : true,
      headline: event_marketplaces["headline"],
      description: event_marketplaces["description"],
      text: event_marketplaces["text"],
      button: event_marketplaces["button"],
      marketplaces,
    };
  }

  return result;
}

function createEventAdvertising(event_advertising) {
  let result = null;
  if (
    event_advertising &&
    (event_advertising.active === null || event_advertising.active === true) &&
    event_advertising["title"] &&
    event_advertising["image"]
  ) {
    result = {
      title: event_advertising["title"],
      subtitle: event_advertising["subtitle"],
      image: event_advertising["image"] ? event_advertising["image"].url : null,
      logo: event_advertising["logo"] ? event_advertising["logo"].url : null,
      button: event_advertising["button"],
      link: event_advertising["link"],
    };
  }

  return result;
}

function createEventGkPkTeaser(event_gk_pk_teaser) {
  let result = null;
  if (
    event_gk_pk_teaser &&
    (event_gk_pk_teaser.active === null ||
      event_gk_pk_teaser.active === true) &&
    event_gk_pk_teaser["title1"] &&
    event_gk_pk_teaserevent_gk_pk_teaser["image1"] &&
    event_gk_pk_teaser["title2"] &&
    event_gk_pk_teaser["image2"]
  ) {
    result = {
      title1: event_gk_pk_teaser[`title1`],
      subtitle1: event_gk_pk_teaser[`subtitle1`],
      text1: event_gk_pk_teaser[`text1`],
      content1:
        event_gk_pk_teaser[`content1`] !== "<p><br></p>"
          ? event_gk_pk_teaser[`content1`]
          : null,
      button1_1: event_gk_pk_teaser[`button1_1`],
      url1_1: event_gk_pk_teaser[`url1_1`],
      button1_2: event_gk_pk_teaser[`button1_2`],
      url1_2: event_gk_pk_teaser[`url1_2`],
      button1_3: event_gk_pk_teaser[`button1_3`],
      url1_3: event_gk_pk_teaser[`url1_3`],
      title2: event_gk_pk_teaser[`title2`],
      subtitle2: event_gk_pk_teaser[`subtitle2`],
      text2: event_gk_pk_teaser[`text2`],
      content2:
        event_gk_pk_teaser[`content2`] !== "<p><br></p>"
          ? event_gk_pk_teaser[`content2`]
          : null,
      button2_1: event_gk_pk_teaser[`button2_1`],
      url2_1: event_gk_pk_teaser[`url2_1`],
      button2_2: event_gk_pk_teaser[`button2_2`],
      url2_2: event_gk_pk_teaser[`url2_2`],
      button2_3: event_gk_pk_teaser[`button2_3`],
      url2_3: event_gk_pk_teaser[`url2_3`],
      image1:
        event_gk_pk_teaser.image1 && event_gk_pk_teaser.image1.url
          ? event_gk_pk_teaser.image1.url
          : null,
      image2:
        event_gk_pk_teaser.image2 && event_gk_pk_teaser.image2.url
          ? event_gk_pk_teaser.image2.url
          : null,
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

function createEventPresenter(event_presenter) {
  let result = null;
  if (event_presenter && event_presenter["title"]) {
    result = {
      title: event_presenter[`title`],
      text: event_presenter[`text`],
      image:
        event_presenter.image && event_presenter.image.url
          ? event_presenter.image.url
          : null,
    };
  }

  return result;
}

function createEventTopSpeaker(event_top_speaker, speakers) {
  let result = null;
  if (
    event_top_speaker &&
    (event_top_speaker.active === null || event_top_speaker.active === true) &&
    event_top_speaker["title"]
  ) {
    result = {
      title: event_top_speaker[`title`],
      title_tag: event_top_speaker[`title_tag`],
      text: event_top_speaker[`text`],
      button: event_top_speaker[`button`],
      speakers: speakers.filter((speaker) => speaker.highlight),
    };
  }

  return result;
}

function createEventAgendaHighlights(event_agenda_highlights, agenda) {
  let result = null;
  if (
    event_agenda_highlights &&
    (event_agenda_highlights.active === null ||
      event_agenda_highlights.active === true) &&
    event_agenda_highlights["title"]
  ) {
    result = {
      title: event_agenda_highlights[`title`],
      title_tag: event_agenda_highlights[`title_tag`],
      text: event_agenda_highlights[`text`],
      button: event_agenda_highlights[`button`],
      events: formatAgendaHighlights(agenda),
    };
  }

  return result;
}

async function createEventMegatrends(event_megatrends) {
  let result = null;
  if (
    event_megatrends &&
    (event_megatrends.active === null || event_megatrends.active === true) &&
    event_megatrends["title"]
  ) {
    result = {
      title: event_megatrends["title"],
      title_tag: event_megatrends["title_tag"],
      text:
        event_megatrends["text"] &&
        event_megatrends["text"] !== "<p><br></p>"
          ? event_megatrends["text"]
          : null,
      button: event_megatrends["button"],
      image: event_megatrends["image"] ? event_megatrends["image"].url : null,
      megatrends: null,
    };

    // fetch megatrends from event-megatrends-page
    const fullPopulate = helper.getFullPopulateObject('api::event-megatrends-page.event-megatrends-page', 4);
    const eventMegatrendsPages = await strapi.db
      .query("api::event-megatrends-page.event-megatrends-page")
      .findMany(fullPopulate);
      const eventMegatrendsPage = eventMegatrendsPages[0]
    if (
      eventMegatrendsPage &&
      eventMegatrendsPage.megatrends_anchor_list &&
      eventMegatrendsPage.megatrends_anchor_list.megatrends.length
    ) {
      result.megatrends =
        eventMegatrendsPage.megatrends_anchor_list.megatrends.map(
          (megatrend) => {
            return {
              id: megatrend.id,
              name: megatrend["name"],
              icon:
                megatrend.icon && megatrend.icon.url
                  ? megatrend.icon.url
                  : null,
            };
          }
        );
    }
  }

  return result;
}

async function createEventMegatrends2(event_megatrends2) {
  let result = null;
  if (
    event_megatrends2 &&
    (event_megatrends2.active === null || event_megatrends2.active === true) &&
    event_megatrends2["title"]
  ) {
    result = {
      title: event_megatrends2["title"],
      title_tag: event_megatrends2["title_tag"],
      text:
        event_megatrends2["text"] &&
        event_megatrends2["text"] !== "<p><br></p>"
          ? event_megatrends2["text"]
          : null,
      button: event_megatrends2["button"],
      megatrends: null,
    };

    // fetch megatrends from event-megatrends-page
    const fullPopulate = helper.getFullPopulateObject('api::event-megatrends-page.event-megatrends-page', 4);
    const eventMegatrendsPages = await strapi.db
      .query("api::event-megatrends-page.event-megatrends-page")
      .findMany(fullPopulate);
      const eventMegatrendsPage = eventMegatrendsPages[0]
    if (
      eventMegatrendsPage.megatrends_anchor_list &&
      eventMegatrendsPage.megatrends_anchor_list.megatrends.length
    ) {
      result.megatrends =
        eventMegatrendsPage.megatrends_anchor_list.megatrends.map(
          (megatrend) => {
            return {
              id: megatrend.id,
              name: megatrend["name"],
              icon:
                megatrend.icon && megatrend.icon.url
                  ? megatrend.icon.url
                  : null,
              color: megatrend.background_color,
            };
          }
        );
    }
  }

  return result;
}

function createEventTeaserTickets(event_teaser_tickets) {
  let result = null;

  if (
    event_teaser_tickets &&
    (event_teaser_tickets.active === null ||
      event_teaser_tickets.active === true) &&
    event_teaser_tickets["headline"]
  ) {
    result = {
      headline: event_teaser_tickets["headline"],
      headline_tag: event_teaser_tickets["headline_tag"],
      text:
        event_teaser_tickets["text"] &&
        event_teaser_tickets["text"] !== "<p><br></p>"
          ? event_teaser_tickets["text"]
          : null,
      items: null,
    };
    if (event_teaser_tickets.items && event_teaser_tickets.items.length) {
      let items = [];
      for (const item of event_teaser_tickets.items) {
        if (item.active) {
          items.push({
            id: item.id,
            color: item.color,
            image:
              item["image"] && item["image"].url
                ? item["image"].url
                : null,
            title: item["title"],
            text: item["text"],
            button: item["button"],
            url: item["url"],
            image_desktop:
              item["image_desktop"] && item["image_desktop"].url
                ? item["image_desktop"].url
                : null,
            url_desktop: item["url_desktop"],
            image_desktop2:
              item["image_desktop2"] &&
              item["image_desktop2"].url
                ? item["image_desktop2"].url
                : null,
            url_desktop2: item["url_desktop2"],
            image_mobile:
              item["image_mobile"] && item["image_mobile"].url
                ? item["image_mobile"].url
                : null,
            url_mobile: item["url_mobile"],
            image_mobile2:
              item["image_mobile2"] && item["image_mobile2"].url
                ? item["image_mobile2"].url
                : null,
            url_mobile2: item["url_mobile2"],
          });
        }
      }
      result.items = items;
    }
  }

  return result;
}

function createEventBanner2(event_banner2) {
  let result = null;

  if (
    event_banner2 &&
    (event_banner2.active === null || event_banner2.active === true) &&
    event_banner2["image"]
  ) {
    result = {
      headline: event_banner2["headline"],
      headline_tag: event_banner2["headline_tag"],
      text:
        event_banner2["text"] &&
        event_banner2["text"] !== "<p><br></p>"
          ? event_banner2["text"]
          : null,
      image:
        event_banner2["image"] && event_banner2["image"].url
          ? event_banner2["image"].url
          : null,
      url: event_banner2["url"],
    };
  }

  return result;
}

function createContentNote(content_note) {
  let result = null;

  if (
    content_note &&
    (content_note.active === null || content_note.active === true)
  ) {
    result = {
      type: content_note.type,
      title: content_note["title"],
      subtitle: content_note["subtitle"],
      text:
        content_note["text"] &&
        content_note["text"] !== "<p><br></p>"
          ? content_note["text"]
          : null,
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
      quotes: helper.formatContentQuoteItems(
        content_slider_quotes[`quotes`]
      ),
    };
  }

  return result;
}
