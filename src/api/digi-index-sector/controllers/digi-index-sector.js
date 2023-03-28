"use strict";

/**
 * digi-index-sector controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");
const _ = require("lodash");
var dateFormat = require("dateformat");

module.exports = createCoreController(
  "api::digi-index-sector.digi-index-sector",
  ({ strapi }) => ({
    async find(ctx) {
      // get user locale
      const lang = helper.getLang(ctx);

      // config database query
      const columns = ["id", "name", "slug"];
      const relations = {};
      relations["image_button"] = true;
      const today = dateFormat(Date.now(), "yyyy-mm-dd");

      // get data from database
      const result = await strapi.db
        .query("api::digi-index-sector.digi-index-sector")
        .findMany({
          select: columns,
          where: {
            locale: lang,
            publishedAt: {
              $lte: today + "T23:59:59Z",
            },
          },
          orderBy: [{ sort: "ASC" }, { name: "ASC" }],
          populate: relations,
          limit: 100,
        });

      // modify data after database query
      if (!result) {
        return ctx.response.notFound();
      }

      result.forEach((item) => {
        if (item.image_button && item.image_button.url) {
          item.image_button = item.image_button.url;
        }

        delete item.content;
      });

      return result;
    },
    async findOne(ctx) {
      // get slug
      const slug = ctx.params.id;

      // get user locale
      const lang = helper.getLang(ctx);

      // get query parameter preview_secret (preview draft records)
      const isPreviewDraft =
        ctx.request.query.preview_secret ===
        strapi.config.get("frontend.preview_secret");

      // config database query
      const fullPopulate = helper.getFullPopulateObject("api::digi-index-sector.digi-index-sector", 4);
      const today = dateFormat(Date.now(), "yyyy-mm-dd");
      const columns = [
        "id",
        "name",
        "meta_title",
        "header_title",
        "header_header",
        "page_title",
        "page_subtitle",
        "page_intro",
        "page_intro_html",
        "slug",
        "download_title",
        "download_subtitle",
        "download_text",
        "download_button",
        "archive_button",
      ];
      const where = {
        slug,
        locale: lang,
      };
      if (isPreviewDraft === false) {
        where['publishedAt'] = {
            $lte: today + "T23:59:59Z",
          }
      }
      
      const relations = {content: fullPopulate.populate.content};
      relations["image_button"] = true;
      relations["image_header"] = true;
      relations["download_image"] = true;
      relations["download_study"] = true;

      // get data from database
      const result = await strapi.db
        .query("api::digi-index-sector.digi-index-sector")
        .findOne({
            select: columns,
            where,
            populate: relations
        })

      // modify data after database query
      if (!result) {
        return ctx.response.notFound();
      }

      // fix empty html
      if (result.page_intro_html === "<p><br></p>") {
        result.page_intro_html = "";
      }

      // prepare assets
      if (result.image_button && result.image_button.url) {
        result.image_button = result.image_button.url;
      }
      if (result.image_header && result.image_header.url) {
        result.image_header = result.image_header.url;
      }
      if (result.download_image && result.download_image.url) {
        result.download_image = result.download_image.url;
      }
      if (result.download_study && result.download_study.url) {
        result.download_study = result.download_study.url;
      }

      // fetch labels
      result.labels = await this.find(ctx);

      // get some data from digi-index-page
      const page = await strapi.controller('api::digi-index-page.digi-index-page').find(ctx);
      result.archive = {
        title: page.archive_title,
        text: page.archive_text,
        button: page.archive_button,
        image: page.archive_image,
      };

      return result;
    },
  })
);
