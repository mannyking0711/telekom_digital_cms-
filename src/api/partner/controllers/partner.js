"use strict";

/**
 * partner controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

var helper = require("../../helper");
const dateFormat = require("dateformat");
const uid = "api::partner.partner";

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    // get user locale
    let lang = helper.getLang(ctx);

    // config database query
    let columns = ["id", "name", "website", "slug_de", "slug_en", "use_detail"];
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    let relations = {
      logo: true,
      partner_megatrends: fullPopulate.populate.partner_megatrends,
      partner_quarter: fullPopulate.populate.partner_quarter,
    };
    let where = { status: "published", locale: lang };

    // get data from database
    let result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      populate: relations,
    });

    // modify data after database query
    return result.map((entity) => {
      // default output format
      helper.defaultOutputFormat(entity);

      // set content type
      entity.type = "partner";

      // [workaround] remove content cols
      delete entity.img_detail;

      // modify img_list property to send url only
      if (entity.logo) {
        entity.logo = entity.logo.url;
      }

      return entity;
    });
  },

  /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {
    // validate user input
    const { id } = ctx.params;

    // get user locale
    const lang = helper.getLang(ctx);

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft =
      ctx.request.query.preview_secret ===
      strapi.config.get("frontend.preview_secret");

      const fullPopulate = helper.getFullPopulateObject(uid, 4);
    // prepare query
    const columns = [
      "id",
      "name",
      `name_alt`,
      "twitter",
      "website",
      "facebook",
      "linkedin",
      "instagram",
      `content`,
      "use_detail",
      "slug_en",
      "slug_de",
      "youtube",
      "xing",
      `meta_title`,
      `meta_description`,
      "brandhouse_name",
      "brandhouse_address",
      "brandhouse_link",
      "brandhouse_longitude",
      "brandhouse_latitude",
      `location_image1_text`,
      `location_image2_text`,
      `location_image3_text`,
      `location_image4_text`,
      `megatrends_headline`,
      `megatrends_text`,
      `megatrends_subheadline`,
      `quarter_headline`,
      `quarter_text`,
      `quarter_subheadline`,
      `company_headline`,
      `company_website`,
    ];
    const populate = {
      "img_detail": true,
      "img_detail2": true,
      "location_image1": true,
      "location_image2": true,
      "location_image3": true,
      "location_image4": true,
      "partner_megatrends": fullPopulate.populate.partner_megatrends,
      "partner_quarter": fullPopulate.populate.partner_quarter
    };

    var where = { [`slug_${lang}`]: id };
    // Im Partnerbereich ist status=draft|preview|published|archive nicht sauber umgesetzt. Bei den Logolisten
    // werden immer alle Datensätze angezeigt. Wenn das gefixt wurde, können die nächsten drei Zeilen aktiviert werden:
    // if (isPreviewDraft === false) {
    //   where.status = 'published';
    // }

    // get data from database
    let result = await strapi.db
      .query(uid).findOne({
        select: columns,
        where,
        populate
      })

    if ( !result ) {
      return ctx.response.notFound();
    }

    // prepare assets
    if (result.img_detail) {
      if (
        result.img_detail.formats &&
        result.img_detail.formats.small &&
        result.img_detail.formats.small.url
      ) {
        // Pixel
        result.image = result.img_detail.formats.small.url;
      } else if (result.img_detail.url) {
        // SVG
        result.image = result.img_detail.url;
      }
      delete result.img_detail;
    }

    // Alt name
    result.name = result.name_alt ? result.name_alt : result.name;

    // fix empty html
    if (result.content === "<p><br></p>") {
      result.content = null;
    }

    if (result.img_detail2 && result.img_detail2.url) {
      result.img_detail2 = result.img_detail2.url;
    }

    if (result.location_image1 && result.location_image1.url) {
      result.location_image1 = result.location_image1.url;
    }

    if (result.location_image2 && result.location_image2.url) {
      result.location_image2 = result.location_image2.url;
    }

    if (result.location_image3 && result.location_image3.url) {
      result.location_image3 = result.location_image3.url;
    }

    if (result.location_image4 && result.location_image4.url) {
      result.location_image4 = result.location_image4.url;
    }

    result.megatrends = createMegatrends(
      result.partner_megatrends ? result.partner_megatrends : null
    );
    delete result.partner_megatrends;

    result.quarter = createQuarter(
      result.partner_quarter ? result.partner_quarter : null
    );
    delete result.partner_quarter;

    // get some data from partner-page
    let partnerPage = await strapi.db.query("api::partner-page.partner-page").findOne({
        where: {locale: lang}
    });

    // get some data from index page
    let indexPage = await strapi.db
      .query("api::index.index").findOne({
        select: ['id'],
        where: {locale: lang},
        populate: {'event_header': {
            populate: {
                'event': {
                    populate: ['logo', 'logo_dark']
                }
            }
        }}
      })
    
    if ( indexPage ) {
        result.tickets = createTicketsFromEvent(
          indexPage.event_header && indexPage.event_header.event
            ? indexPage.event_header.event
            : null
        );

    }

    // fix empty html
    result.megatrends_headline = result.megatrends_headline
      ? result.megatrends_headline
      : partnerPage["megatrends_headline"];
    result.megatrends_text =
      result.megatrends_text && result.megatrends_text !== "<p><br></p>"
        ? result.megatrends_text
        : partnerPage["megatrends_text"];
    result.megatrends_subheadline = result.megatrends_subheadline
      ? result.megatrends_subheadline
      : partnerPage["megatrends_subheadline"];
    result.quarter_headline = result.quarter_headline
      ? result.quarter_headline
      : partnerPage["quarter_headline"];
    result.quarter_text =
      result.quarter_text && result.quarter_text !== "<p><br></p>"
        ? result.quarter_text
        : partnerPage["quarter_text"];
    result.quarter_subheadline = result.quarter_subheadline
      ? result.quarter_subheadline
      : partnerPage["quarter_subheadline"];
    result.company_headline = result.company_headline
      ? result.company_headline
      : partnerPage["company_headline"];
    result.company_website = result.company_website
      ? result.company_website
      : partnerPage["company_website"];

    return result;
  },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

function createMegatrends(partnerMegatrends) {
  let result = null;
  if (
    partnerMegatrends &&
    partnerMegatrends.megatrends &&
    partnerMegatrends.megatrends.length > 0
  ) {
    result = [];
    partnerMegatrends.megatrends.forEach((item) => {
      result.push({
        id: item.id,
        name: item["name"],
        icon: item.icon && item.icon.url ? item.icon.url : null,
      });
    });
    result.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  return result;
}

function createQuarter(partnerQuarter) {
  let result = null;
  if (partnerQuarter && partnerQuarter.quarter) {
    result = {
      id: partnerQuarter.quarter.id,
      name: partnerQuarter.quarter["name"],
      color: partnerQuarter.quarter.color,
    };
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
