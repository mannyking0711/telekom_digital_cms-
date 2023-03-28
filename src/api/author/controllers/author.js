"use strict";

/**
 * author controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const dateFormat = require("dateformat");
const helper = require("../../helper");

module.exports = createCoreController("api::author.author", ({ strapi }) => ({
  async findOne(ctx) {
    // validate user input
    const { id } = ctx.params;

    // get user locale
    const lang = helper.getLang(ctx);

    // config database query
    const columns = [
      "id",
      "name",
      "surname",
      "fullname",
      "description",
      "subline",
      "slug",
      "meta_title",
      "meta_description",
    ];
    const where = { status: "published" };
    const relations = ["img"];

    // get data from database
    const result = await strapi.db.query("api::author.author").findOne({
      select: columns,
      where,
      populate: relations,
    });

    if (!result) {
      return ctx.response.notFound();
    }

    result.img =
      result.img && result.img.url
        ? result.img.url
        : "https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com/author_default_f026c96123.jpg";

    return result;
  },
  async findOneBySlug(ctx) {
    const slug = ctx.params.slug;

    // get user locale
    const lang = helper.getLang(ctx);

    // config database query
    const columns = [
      "id",
      "name",
      "surname",
      "fullname",
      "description",
      "subline",
      "slug",
      "meta_title",
      "meta_description",
    ];
    const where = { slug };
    const relations = ["img"];

    // get data from database
    const result = await strapi.db.query("api::author.author").findOne({
      select: columns,
      where,
      populate: relations,
    });

    if (!result) {
      return ctx.response.notFound();
    }

    result.img =
      result.img && result.img.url
        ? result.img.url
        : "https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com/author_default_f026c96123.jpg";

    return result;
  },
}));
