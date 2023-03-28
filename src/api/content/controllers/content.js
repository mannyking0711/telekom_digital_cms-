"use strict";

/**
 * content controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { omit } = require("lodash");

module.exports = createCoreController("api::content.content", ({ strapi }) => ({
  async migrateDataFromV3(ctx) {
    strapi
      .service("api::content.content")
      .migrateDataFromV3(ctx.request.body);
    return {status: 'In Progress... , you can check the Log to see the progress'};
  },
  async deleteAllData(ctx) {
    const dataTypes = [
      "article",
      "author",
      "articles-group",
      "award",
      "award-nominee",
      "award-category",
      "award-region",
      "bookmark",
      "user-profile",
      "digi-index-archive",
      "digi-index-sector",
      "event",
      "coverage",
      "event-agenda",
      "newsletter",
      "speaker",
      "megatrend",
      "quarter",
      "map-location",
      "partner",
      "faq",
      "faq-group",
      "impression",
      "media-library",
      "video",
      "podcast",
      "podcast-group",
      "stage",
      "tag",
      "topic-of-the-week",
      "videos-group",
      // Single Types,
      "award-partner",
      "companies-in-fokus",
      "contact",
      "digi-index-archive-page",
      "digi-index-page",
      "event-media-library-page",
      "event-megatrends-page",
      "event-participate-page",
      "event-partner-page",
      "event-pk-page",
      "event-speaker-page",
      "events-page",
      "imprint",
      "index",
      "magazine-page",
      "newsletter-page",
      "partner-page",
      "privacy-policy",
      "search",
      "term",
      "terms-ticket",
      "videos-in-fokus"
    ];

    for (const type of dataTypes) {
      await strapi.db.query(`api::${type}.${type}`).deleteMany({
        where: { $not: { id: null } },
      });
    }

    // Empty Options
    const oldOptions = await strapi.db
      .query("api::migrate-option.migrate-option")
      .findMany();

    let toUpdate = {};
    for (const k in omit(oldOptions[0], [
      "id",
      "createdAt",
      "updatedAt",
      "publishedAt",
    ])) {
      toUpdate[k] = {};
    }

    const newOptions = await strapi.db
      .query("api::migrate-option.migrate-option")
      .update({
        where: { id: oldOptions[0].id },
        data: {
          ...toUpdate,
        },
      });

    return [dataTypes, newOptions];
  },
  async testFunc(ctx) {
    // const res = await strapi
    // .service("api::content.content")
    // .matomo('article', 'week');
    // return {status: "Done", res}
    const res = strapi.controller('api::article.article').findByGroup(ctx, 7)
    return res
  },

  /////////////////////////////////
  // FIND / LIST
  /////////////////////////////////

  async find(ctx) {

    var output = {};

    // get articles from database
    var articles = await strapi.controller('api::article.article').find(ctx);
    output.articles = filterItems(articles);

    // get article groups from database
    output.article_groups = await strapi.controller('api::articles-group.articles-group').find(ctx);

    // get podcasts from database
    var podcasts = await strapi.controller('api::podcast.podcast').find(ctx);
    output.podcasts = filterItems(podcasts);

    // get podcast groups from database
    output.podcast_groups = await strapi.controller('api::podcast-group.podcast-group').find(ctx);

    // get videos from database
    var videos = await strapi.controller('api::video.video').find(ctx);
    output.videos = filterVideos(videos);

    // get video groups from database
    output.video_groups = await strapi.controller('api::videos-group.videos-group').find(ctx);

    // get next event
    output.events = await strapi.controller('api::event.event').find(ctx);

    // get awards from database
    output.awards = await strapi.controller('api::award.award').find(ctx);
    output.awardCategories = await strapi.controller('api::award-category.award-category').find(ctx);
    output.awardRegions = await strapi.controller('api::award-region.award-region').find(ctx);

    // get companiesInFokus
    output.companiesInFokus = await strapi.controller('api::companies-in-fokus.companies-in-fokus').find(ctx);

    // get videosInFokus
    output.videosInFokus = await strapi.controller('api::videos-in-fokus.videos-in-fokus').find(ctx);

    // get awardPartners
    output.awardPartners = await strapi.controller('api::award-partner.award-partner').find(ctx);

    return output;
  },
}));

/////////////////////////////////
// FILTER ITEMS
/////////////////////////////////

function filterItems(elements) {

  var output = {list: [], highlights: []};
  var len = elements.length;

  // filter highlights
  for (var i = 0; i < len; i++) {

    var item = elements.shift();

    // add item to list or highlights
    output.list.push(item);
    if (item.highlight) {
      output.highlights.push(item);
    }

    // // max of 2 highlight items. Apply rest to list
    if (output.highlights.length > 2) {
      output.list = output.list.concat(elements);
      return output;
    }
  }

  return output;

}

function filterVideos(elements) {

  var output = {list: [], highlights: []};
  var len = elements.length;

  // filter highlights
  for (var i = 0; i < len; i++) {

    var item = elements.shift();

    // add item to list or highlights
    output.list.push(item);
    if (item.highlight) {
      output.highlights.push(item);
    }

    // // max of 2 highlight items. Apply rest to list
    if (output.highlights.length > 2) {
      output.list = output.list.concat(elements);
      return output;
    }
  }

  return output;

}
