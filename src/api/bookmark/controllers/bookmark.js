"use strict";

/**
 * bookmark controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::bookmark.bookmark",
  ({ strapi }) => ({
    async create(ctx) {
      const params = ctx.request.body;
      const access_token = ctx.request.body.user_access_token;

      if (!params || !access_token) {
        return ctx.response.badData("Invalid data");
      }

      const userProfile = await strapi.db
        .query("api::user-profile.user-profile")
        .findOne({ where: { user_id: params.user_profile } });
      const item = await strapi.db
        .query(`api::${params.item_type}.${params.item_type}`)
        .findOne({ where: { id: params.item_id } });

      if (!userProfile || !item) {
        return ctx.response.badData("Invalid data");
      }

      const bookmarkExists = await strapi.db
        .query("api::bookmark.bookmark")
        .count({
          where: {
            item_id: item.id,
            item_type: params.item_type,
            user_profile: userProfile.id,
          },
        });

      if (bookmarkExists) {
        return ctx.response.badData("Bookmark exists");
      }

      // Add bookmark
      params.user_profile = userProfile.id;
      await strapi.db.query("api::bookmark.bookmark").create({data: params});

      // TODO_TEST_MORE

      // Return 204 "no content"
      ctx.response.body = null;
      return ctx.response;
    },

    async delete(ctx) {
      const params = ctx.request.body;
      const access_token = ctx.request.body.user_access_token;

      if (!params || !access_token) {
        return ctx.response.badData("Invalid data");
      }

      const userProfile = await strapi.db
        .query("api::user-profile.user-profile")
        .findOne({ where: { user_id: params.user_profile } });
        const item = await strapi.db
        .query(`api::${params.item_type}.${params.item_type}`)
        .findOne({ where: { id: params.item_id } });

      if (!userProfile || !item) {
        return ctx.response.badData("Invalid data");
      }

      const bookmark = await strapi.query("api::bookmark.bookmark").findOne({
        where: {
            item_id: item.id,
            item_type: params.item_type,
            user_profile: userProfile.id,
          },
      });

      if (!bookmark) {
        return ctx.response.badData("Bookmark not exists");
      }

      // Delete bookmark
      await strapi.db
        .query("api::bookmark.bookmark").delete({where: { id: bookmark.id }});

      // TODO_TEST_MORE

      // Return 204 "no content"
      ctx.response.body = null;
      return ctx.response;
    },
  })
);
