"use strict";

/**
 * topic-of-the-week controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const uid = "api::topic-of-the-week.topic-of-the-week";
const helper = require("../../helper");

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    let lang = helper.getLang(ctx);
    let columns = ["id", "KW"];
    let relations = ["articles", "podcasts", "videos"];

    const where = {
      publishedAt: {
        $notNull: true,
      },
      locale: lang
    };

    let result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      populate: relations,
    });

    return result.map((entity) => {
      return entity;
    });
  },

  findOne: async function (ctx) {
    // get user locale
    var lang = "";
    if (ctx.params.lang) {
      lang = ctx.params.lang;
    } else {
      lang = helper.getLang(ctx);
    }

    const KW = ctx.params.id;

    let columns = [
      "id",
      "KW",
      "topic",
      "topic_desc",
      "button",
      "searchTerm",
    ];

    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    const populate = {
        articles: fullPopulate.populate.articles,
        podcasts: fullPopulate.populate.podcasts,
        videos: fullPopulate.populate.videos,
        content: fullPopulate.populate.content
    }

    let where = { KW, locale: lang, publishedAt: {$notNull: true} };

    let topicOfTheWeek = await strapi.db
      .query(uid).findOne({
        select: columns,
        where,
        populate
      })

    if ( !topicOfTheWeek ) {
      return [];
    }

    transformSingleTypes(topicOfTheWeek, lang);
    deleteUnusedEntries(topicOfTheWeek);

    topicOfTheWeek.desc = topicOfTheWeek.topic_desc
    delete topicOfTheWeek.topic_desc

    return topicOfTheWeek;
  },
}));

/////////////////////////////////
// HELPER
/////////////////////////////////

function deleteUnusedEntries(result) {
  const allowedKeys = ["title", "slug", "img_list", "type"];
  const allowedKeysImg = ["url"];

  result.content.map((element) => {
    Object.keys(element).forEach((key) => {
      if (!allowedKeys.includes(key)) delete element[key];
    });
    Object.keys(element.img_list).forEach((imgKey) => {
      if (!allowedKeysImg.includes(imgKey)) delete element.img_list[imgKey];
    });
  });

}

function transformSingleTypes(result, lang) {
  result.content = [];

  let articleKey = lang === 'de' ? 'artikel' : 'article'
  let slugKey = lang === 'de' ? 'slug_de' : 'slug_en'


  result.articles.forEach((article) => {
    article.slug =
    articleKey + "/" + article.articles_group[slugKey] + "/" + article[slugKey];
    result.content.push(article);
  });

  result.podcasts.forEach((podcast) => {
    podcast.slug =
      "podcast/" + podcast.podcast_group[slugKey] + "/" + podcast[slugKey];
    result.content.push(podcast);
  });

  result.videos.forEach((video) => {
    video.slug = "video/" + video.videos_group[slugKey] + "/" + video[slugKey];
    result.content.push(video);
  });

  // result.articles.forEach((article) => {
  //   article.slug =
  //     "article/" + article.articles_group.slug_en + "/" + article.slug_en;
  //   result.content_en.push(article);
  // });

  Object.keys(result).forEach((key) => {
    if (
      key === "articles" ||
      key === "videos" ||
      key === "podcasts"
    )
      delete result[key];
  });
}
