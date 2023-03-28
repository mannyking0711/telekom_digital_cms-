"use strict";

/**
 * videos-group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const uid = "api::videos-group.videos-group";
const dateFormat = require('dateformat');
const helper = require('../../helper');

module.exports = createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    //console.log('videos group find ctx =>', ctx);
    return await getVideosGroups(ctx);
  },

  async findOne(ctx) {
    //console.log('videos group findOne ctx =>', ctx);
    const lang = helper.getLang(ctx);

    let related = ['img_detail'];
    let where = {};
    where[`slug_${lang}`] = ctx.params.id;

    let group = await getVideosGroups(ctx, [], related, where, 'fetch');
    group.videos = await strapi.controller('api::video.video').findByGroup(ctx, group.id);

    return group;
  },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

async function getVideosGroups(
  ctx,
  addFields = [],
  addRelated = [],
  addWhere = {},
  method
) {
  // get user locale
  const lang = helper.getLang(ctx);
  const today = dateFormat(Date.now(), "yyyy-mm-dd");

  //
  let result = undefined;
  let fields = ["id", "published", "slug_de", "slug_en", ...addFields];
  let related = ["id", ...addRelated];
  let where = {
    status: "published",
    locale: lang,
    published: {
      $lte: today + "T23:59:59Z",
    },
    ...addWhere,
  };

  // prepare query
  let baseQuery = {
    select: fields,
    where,
    orderBy: { published: "DESC" },
    populate: related,
  };

  if (method === "fetch") {
    result = await strapi.db.query(uid).findOne(baseQuery);
    result = formatResult(result, lang);
  } else {
    result = await strapi.db.query(uid).findMany(baseQuery);
    result = result.map(function (x) {
      return formatResult(x, lang);
    });
  }

  return result;
}

function formatResult(group, lang) {
  // default output format
  helper.defaultOutputFormat(group);
  // group.slug = group[`slug_${lang}`]

  // videos groups don't have tags
  delete group.tags;

  // TODO sort videos
  if (group.videos) {
  }

  return group;
}
