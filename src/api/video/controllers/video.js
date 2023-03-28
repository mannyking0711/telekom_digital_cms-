"use strict";

/**
 * video controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const uid = "api::video.video";
const dateFormat = require("dateformat");
const helper = require("../../helper");

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    //console.log('video ctx =>', ctx);

    // get user locale
    const lang = helper.getLang(ctx);

    // config database query
    const columns = [
      "id",
      "title",
      "tags",
      "highlight",
      "published",
      "slug_de",
      "slug_en",
      "premium",
      "premium",
      "duration",
    ];
    //		const relations 	= ['img_list','author'];
    const relations = {
      img_list: true,
      author: true,
      videos_group: {
        select: ["id", `title`, "slug_de", "slug_en"],
      },
    };
    const today = dateFormat(Date.now(), "yyyy-mm-dd");
    const where = {
      status: "published",
      locale: lang,
      title: {
        $notNull: true,
        $ne: "",
      },
      published: {
        $lte: today + "T23:59:59Z",
      },
    };

    // get data from database
    const result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      orderBy: { published: "DESC" },
      limit: 150,
      populate: relations,
    });

    // modify data after database query
    return result.map((entity) => {
      // default output format
      helper.defaultOutputFormat(entity);

      // set content type
      entity.type = "video";

      // remove unneccessary info
      delete entity.appearances;
      delete entity.img_detail;

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
    //console.log('video groupId =>' + groupId);
    return this.find(ctx, { videos_group: groupId });
  },
    /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {
    //console.log('video ctx.params =>', ctx.params);

    // validate user input
    const {id} = ctx.params;

    // get user locale
    var lang = helper.getLang(ctx);

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft = ctx.request.query.preview_secret === strapi.config.get('frontend.preview_secret');

    // config database query
    var columns = [
      'id',
      'title',
      'description',
      'tags',
      'highlight',
      'published',
      'slug_de',
      'slug_en',
      'premium',
      'meta_title',
      'meta_description',
      'structured_data',
      'duration'
    ];
    const today = dateFormat(Date.now(), "yyyy-mm-dd");
    var where = {[`slug_${lang}`]: id, locale: lang,       published: {
        $lte: today + "T23:59:59Z",
      },};
    if (isPreviewDraft === false) {
      where.status = 'published';
    }
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    var relations = {'img_detail': true, 'video': true, 'appearances': fullPopulate.populate.appearances, 'videos_group': true, 'author': true};

    // get data from database
    var result = await strapi.db.query(uid).findOne({
        select: columns,
        where,
        populate: relations
    })

    // modify data after database query
    if ( !result ) {
      return ctx.response.notFound();
    }

    // default output format
    helper.defaultOutputFormat(result);

    // set content type
    result.type = 'video';

    // Has translation?
    result.translation = !!(result.slug_en);
    delete result.slug_en

    // remove uneccessary media info
    result.video = result.video && result.video.url;

    // modify author to send only full name
    if (result.author) {
      result.author = {
        fullname: result.author.fullname
      };
    }

    // modify videos group
    modifyVideosGroup(result, lang);

    // set appearance default image
    for (let i = 0; i < result.appearances.length; i++) {
      if (result.appearances[i].image && result.appearances[i].image.url) {
        result.appearances[i].image = result.appearances[i].image.url;
      } else {
        result.appearances[i].image = 'https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com/author_default_f026c96123.jpg';
      }

    }

    return result;
  },
}));

/////////////////////////////////
// HELPER
/////////////////////////////////

function modifyVideosGroup(item) {
  //console.log('video item =>', item);

  // modify videos group , IMPROVE : change to just pick
  if (item.videos_group) {
    item.videos_group = {
      id: item.videos_group.id,
      title: item.videos_group["title"],
      slug_de: item.videos_group.slug_de,
      slug_en: item.videos_group.slug_en,
    };
  }
}
