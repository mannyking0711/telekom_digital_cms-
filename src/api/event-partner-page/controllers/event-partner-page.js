"use strict";

/**
 * event-partner-page controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const uid = "api::event-partner-page.event-partner-page";
const helper = require("../../helper");

module.exports = createCoreController(uid, ({ strapi }) => ({
  /////////////////////////////////
  // FIND / LIST
  /////////////////////////////////

  async find(ctx) {
    // get user locale
    let lang = helper.getLang(ctx);

    // config database query
    let columns = [
      "id",
      `header_title`,
      `header_subtitle`,
      `header_subtitle_tag`,
      `header_text`,
      `meta_title`,
      `meta_description`,
      `intro_title`,
      `intro_subtitle`,
      `intro_text`,
      `filter_megatrends`,
      `filter_quarter`,
      `tab_title`,
    ];
    let relations = ["header_image"];

    // get data from database
    let results = await strapi.db.query(uid).findMany({
      select: columns,
      where: { locale: lang },
      populate: relations,
    });

    if (!results) {
      return ctx.response.notFound();
    }
    let result = results[0];

    // modify data after database query
    if (result.header_image) {
      result.header_image = result.header_image.url;
    }

    // fetch megatrends from event-megatrends-page
    result.megatrends = null;
    const MegatrendsPagesPopulate = helper.getFullPopulateObject(
      "api::event-megatrends-page.event-megatrends-page",
      4
    );
    let eventMegatrendsPages = await strapi.db
      .query("api::event-megatrends-page.event-megatrends-page")
      .findMany({
        where: { locale: lang },
        populate: {
          megatrends_anchor_list:
            MegatrendsPagesPopulate.populate.megatrends_anchor_list,
        },
      });
    let eventMegatrendsPage = eventMegatrendsPages[0];
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
            };
          }
        );
    }

    // fetch quarters
    // get data from database
    let quarters = await strapi.db.query("api::quarter.quarter").findMany({
      select: ["id", `name`, "color"],
      where: { locale: lang },
    });
    if (!quarters) {
      result.quarters = null;
    } else {
      result.quarters = quarters
    }

    // fetch partners from event partners
    const partners = await strapi.service('api::event.event').findCurrentEventPartnersMedium(lang);
    const locations = await strapi.service('api::event.event').findCurrentEventLocationsMedium(lang);
    result = { ...result, ...partners, ...locations };

    return result;
  },
}));
