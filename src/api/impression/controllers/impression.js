"use strict";

/**
 * impression controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const uid = "api::impression.impression";
const helper = require('../../helper');

module.exports = createCoreController(uid, ({ strapi }) => ({
  // fetch newest impressions data manually instead of via the cron
  async refresh(ctx) {
    const { period } = ctx.params;

    await strapi.service("api::content.content").fetchMostReadContent(period);

    return {};
  },

  // return most "read" podcasts for a specific podcast_group
  async findByPodcastGroup(ctx) {
    const { group } = ctx.params;
    const lang = helper.getLang(ctx);

    const allDaily = await getPopularItems("podcast", "day", lang);
    const allWeekly = await getPopularItems("podcast", "week", lang);
    const allMonthly = await getPopularItems("podcast", "month", lang);

    // return only podcasts that are in the correct group
    return {
      day: allDaily.filter((p) => p.podcast_group.id === parseInt(group, 10)),
      week: allWeekly.filter((p) => p.podcast_group.id === parseInt(group, 10)),
      month: allMonthly.filter(
        (p) => p.podcast_group.id === parseInt(group, 10)
      ),
    };
  },

  // return most read content by type (e.g. podcast, article, video, or all)
  async findByType(ctx) {
    const { type } = ctx.params;
    const lang = helper.getLang(ctx);

    const allDaily = await getPopularItems(type, "day", lang);
    const allWeekly = await getPopularItems(type, "week", lang);
    const allMonthly = await getPopularItems(type, "month", lang);

    // return up to four items per period
    return {
      day: allDaily.slice(0, 5),
      week: allWeekly.slice(0, 5),
      month: allMonthly.slice(0, 5),
    };
  },

  async findAll(ctx) {
    const { type } = ctx.params;
    const lang = helper.getLang(ctx);

    return await getPopularItemsWithoutPeriod(type, lang);
  },
}));

// Helper method used to get the most "read" content
// of a specific type during a specifc period.
async function getPopularItems(type, period, lang) {
  // get the ordered impressions data
  const where = { locale: lang, period };
  if (type !== "all") where["item_type"] = type;

  const items = await strapi.db
    .query(uid)
    .findMany({
      where,
      orderBy: { count: "DESC" },
    })

  // get the corresponing models
  const itemsPromises = items.map(async (item) => {
    let uidType = `api::${item["item_type"]}.${item["item_type"]}`;
    let model = await strapi.db
      .query(uidType)
      .findOne({ where: { slug_de: item["item_id"], locale: lang }, populate: true });

    // return early if no model was found
    if (!model) return null;

    // set new properties
    model.type = item["item_type"];
    model.title = model[`title`];
    model.img_list = model.img_list.url || "";
    model.count = item["count"];

    // return early if no title was found
    if (!model.title) return null;

    // special case article group
    if (model.articles_group) {
      model.articles_group = {
        id: model.articles_group.id,
        title: model.articles_group[`title`],
        slug_de: model.articles_group.slug_de,
        slug_en: model.articles_group.slug_en,
      };
    }

    // special case podcast group
    if (model.podcast_group) {
      model.podcast_group = {
        id: model.podcast_group.id,
        title: model.podcast_group[`title`],
        slug_de: model.podcast_group.slug_de,
        slug_en: model.podcast_group.slug_en,
      };
    }

    // special case video group
    if (model.videos_group) {
      model.videos_group = {
        id: model.videos_group.id,
        title: model.videos_group[`title`],
        slug_de: model.videos_group.slug_de,
        slug_en: model.videos_group.slug_en,
      };
    }

    // delete unused properties
    const allowed = [
      "id",
      "slug_de",
      "slug_en",
      "title",
      "img_list",
      "type",
      "articles_group",
      "videos_group",
      "podcast_group",
      "episode_number",
      "duration",
      "count",
    ];
    Object.keys(model).forEach((key) => {
      if (!allowed.includes(key)) delete model[key];
    });

    return model;
  });

  // wait until all data is loaded before returning it
  let itemObjects = await Promise.all(itemsPromises);

  // then filter out all null/undefined values
  return itemObjects.filter((item) => item);
}

// Helper method used to get the most "read" content
// of a specific type
async function getPopularItemsWithoutPeriod(type, lang) {
  // get the ordered impressions data
  const where = { locale: lang };
  if (type !== "all") where["item_type"] = type;

  const items = await strapi.db
    .query(uid)
    .findMany({
      where,
      orderBy: { count: "DESC" },
    })

  // get the corresponing models
  const itemsPromises = items.map(async (item) => {
    let uidType = `api::${item["item_type"]}.${item["item_type"]}`;
    let model = await strapi.db
      .query(uidType)
      .findOne({ where: { [`slug_${lang}`]: item["item_id"], locale: lang }, populate: true });

    if ( !model ) {
        return null
    }

    // set new properties
    model.type = item["item_type"];
    model.img_list = model.img_list.url || "";
    model.count = item["count"];

    // special case podcast group
    if (model.podcast_group) {
      model.podcast_group = {
        id: model.podcast_group.id,
        title: model.podcast_group[`title`],
        slug_de: model.podcast_group.slug_de,
        slug_en: model.podcast_group.slug_en,
      };
    }

    // delete unused properties
    const allowed = [
      "id",
      "slug_de",
      "slug_en",
      "title",
      "img_list",
      "type",
      "podcast_group",
      "episode_number",
      "duration",
      "count",
    ];
    Object.keys(model).forEach((key) => {
      if (!allowed.includes(key)) delete model[key];
    });

    return model;
  })

  // wait until all data is loaded before returning it and filter out null values if any
  const results = await Promise.all(itemsPromises)
  return results.filter(i => i);
}
