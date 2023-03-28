"use strict";

/**
 * articles-group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

var dateFormat = require("dateformat");
var helper = require("../../helper");

module.exports = createCoreController(
  "api::articles-group.articles-group",
  ({ strapi }) => ({
    async find(ctx) {
      return await getArticlesGroups(ctx);
    },

    async findOne(ctx) {
      //console.log('articles group findOne ctx =>', ctx);
      const lang = helper.getLang(ctx);

      let fields = [];
      let related = ["img_detail"];
      let where = {};
      where[`slug_${lang}`] = ctx.params.id;

      let group = await getArticlesGroups(ctx, fields, related, where, "fetch");
      if (!group || !group.id) {
        return ctx.response.notFound();
      }
      group.artcicles = await strapi
        .controller("api::article.article")
        .findByGroup(ctx, group.id);

      return group;
    },
  })
);

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

async function getArticlesGroups(
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
  let fields = ["id", "publishedAt", "slug_de", "slug_en", ...addFields];
  let related = [...addRelated];
  let where = {
    status: "published",
    publishedAt: {
      $lte: today + "T23:59:59Z",
    },
    locale: lang,
    ...addWhere,
  };

  // prepare query
  let baseQuery = {
    select: fields,
    where,
    orderBy: { publishedAt: "DESC" },
    populate: related,
  };

  // get data from database
  try {
    if (method === "fetch") {
      result = await strapi.db
        .query("api::articles-group.articles-group")
        .findOne(baseQuery);
      result = formatResult(result, lang);
    } else {
      result = await strapi.db
        .query("api::articles-group.articles-group")
        .findMany(baseQuery);
      result = result.map(function (x) {
        return formatResult(x, lang);
      });
    }
  } catch (e) {
    console.log(e);
    return ctx.response.notFound();
  }

  return result;
}

function formatResult(group, lang) {
  // default output format
  helper.defaultOutputFormat(group);

  // articles groups don't have tags
  delete group.tags;

  group.slug = group[`slug_${lang}`];

  // // TODO sort artcicles
  // if (group.artcicles) {

  // }

  return group;
}
