"use strict";

/**
 * article controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const dateFormat = require("dateformat");
const helper = require("../../helper");
const uid = "api::article.article"

module.exports = createCoreController(uid, ({ strapi }) => ({
  /////////////////////////////////
  // FIND / LIST
  /////////////////////////////////

  async find(ctx) {
    // config database query
    const lang = helper.getLang(ctx);
    const columns = [
      "id",
      "title",
      "tags",
      "highlight",
      "published",
      "slug_de",
      "slug_en",
      "premium",
    ];
    const relations = {
      img_list: true,
      img_detail: true,
      author: true,
      articles_group: {
        select: ["id", "title", "slug_de", "slug_en"],
      },
    };
    const today = dateFormat(Date.now(), "yyyy-mm-dd");
    const where = {
      status: "published",
      title: {
        $notNull: true,
        $ne: "",
      },
      published: {
        $lte: today + "T23:59:59Z",
      },
      locale: lang,
    };

    // get data from database
    const result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      orderBy: { published: "DESC" },
      populate: relations,
      limit: 450,
    });

    // modify data after database query
    return result.map((entity) => {
      // default output format
      helper.defaultOutputFormat(entity);

      // set content type
      entity.type = "article";

      // modify author to send only full name
      if (entity.author) {
        entity.author = {
          fullname: entity.author.fullname,
        };
      }

      return entity;
    });
  },

  /////////////////////////////////
  // FIND / LIST BY GROUP
  /////////////////////////////////

  async findByGroup(ctx, groupId) {
    // TODO_ASK
    return this.find(ctx, { articles_group: groupId });
  },

  /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {
    // validate user input
    const { id, group } = ctx.params;

    // get user locale
    let lang = "";
    if (ctx.params.lang) {
      lang = ctx.params.lang;
    } else {
      lang = helper.getLang(ctx);
    }

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft =
      ctx.request.query.preview_secret ===
      strapi.config.get("frontend.preview_secret");

    // config database query
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    const columns = [
      "id",
      "title",
      "meta_topline",
      "introtext",
      "tags",
      "highlight",
      "published",
      "slug_de",
      "slug_en",
      "premium",
      "img_detail_header",
      "meta_title",
      "meta_description",
      "structured_data",
    ];
    const today = dateFormat(Date.now(), "yyyy-mm-dd");
    const where = {
      [`slug_${lang}`]: id,
      published: {
        $lte: today + "T23:59:59Z",
      },
    };
    if (isPreviewDraft === false) {
      where.status = "published";
    }
    const relations = {
      img_detail: true,
      img_social: true,
      // author: true,
      articles_group: {
        select: ["id", "title", "slug_de", "slug_en"],
      },
      author: { populate: ['img'] },
      content: fullPopulate.populate.content
    };

    // get data from database
    const result = await strapi.db.query(uid).findOne({
      select: columns,
      where,
      populate: relations,
    });

    // modify data after database query
    if (!result) {
      return ctx.response.notFound();
    }

    // Test group
    if (result.articles_group["slug_" + lang] !== group) {
      return ctx.response.notFound();
    }

    // default output format
    helper.defaultOutputFormat(result);

    // set content type
    result.type = "article";

    // topline like old response
    result.topline = result.meta_topline;
    delete result.meta_topline;

    // Has translation?
    result.translation = !!result.slug_en;

    // modify author
    if (result.author) {
      // Remove unnecessary properties
      delete result.author.createdAt;
      delete result.author.updatedAt;
      delete result.author.status;

      // check for existing image
      result.author.img = result.author.img
        ? result.author.img.url
        : "https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com/author_default_f026c96123.jpg";
    }

    // modify content
    if (result.content) {
      result.content.map((i) => {
        // ArticleImage and ArticleVideo
        if (
          i.__component == "article.article-image" ||
          i.__component == "article.article-video"
        ) {
          helper.defaultOutputFormat(i);
          if (i.image) {
            i.image = { url: i.image.url };
          }
          if (i.video) {
            i.video = { url: i.video.url };
          }
          if (i.poster) {
            i.poster = { url: i.poster.url };
          }
        }

        // ArticleIFrame
        if (i.__component == "article.article-i-frame") {
          // Facebook video
          if (i.type == "facebook_video") {
            var videoId = i.url.match(/[\d]{5,}$/);
            if (videoId && videoId.length > 0) {
              i.url = videoId[0];
            }
          }

          // YouTube Video
          if (i.type == "youtube_video") {
            var videoId = i.url.match(/\?v=([\d\w-]+)$/);
            if (videoId && videoId.length > 0) {
              i.url = videoId[1];
            }
          }
        }

        return i;
      });
    }

    return result;
  },
}));
