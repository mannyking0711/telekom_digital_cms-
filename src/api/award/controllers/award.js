"use strict";

/**
 * award controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const helper = require("../../helper");
const dateFormat = require("dateformat");

const cleanNominee = (nominee) => {
  if (nominee.entry.logo && nominee.entry.logo.url) {
    nominee.entry.logo = nominee.entry.logo.url;
  }
  if (nominee.entry.category && nominee.entry.category.id) {
    nominee.entry.category = nominee.entry.category.id;
  }
  if (nominee.entry.region && nominee.entry.region.id) {
    nominee.entry.region = nominee.entry.region.id;
  }
  delete nominee.entry.createdAt;
  delete nominee.entry.updatedAt;
};

module.exports = createCoreController("api::award.award", ({ strapi }) => ({
  /////////////////////////////////
  // FIND / LIST
  /////////////////////////////////

  async find(ctx) {
    const lang = helper.getLang(ctx);
    
    // config database query
    let columns = ["id", "year", "name"];
    let relations = {
      image: true,
      nominees: {
        populate: {
          entry: {
            populate: {
              logo: true,
              category: { select: ["id"] },
              region: { select: ["id"] },
            },
          },
        },
      },
      winners: {
        populate: {
          entry: {
            populate: {
              logo: true,
              category: { select: ["id"] },
              region: { select: ["id"] },
            },
          },
        },
      },
    };
    const where = {
      locale: lang,
      publishedAt: {
        $notNull: true,
      },
    };

    // get data from database
    const result = await strapi.db.query("api::award.award").findMany({
      select: columns,
      where,
      orderBy: { year: "DESC" },
      populate: relations,
    });

    // modify data after database query
    return result.map((entity) => {
      // remove unnecessary image info
      if (entity.image && entity.image.url) {
        entity.image = entity.image.url;
      }

      // remove info from winners and nominees
      entity.nominees.map(cleanNominee);
      entity.winners.map(cleanNominee);

      // remove unused data
      delete entity.content;
      delete entity.award_header;

      return entity;
    });
  },

  /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {
    // validate user input
    const year = ctx.params.id;

    // get user locale
    let lang = helper.getLang(ctx);

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft =
      ctx.request.query.preview_secret ===
      strapi.config.get("frontend.preview_secret");

    // config database query
    const today = dateFormat(Date.now(), "yyyy-mm-dd");
    let columns = ["id", "year", "theme", "meta_title", "meta_description"];
    const where = {
      year,
      locale: lang,
    };
    if (isPreviewDraft === false) {
      where.publishedAt = {
        $lte: today + "T23:59:59Z",
      };
    }

    const fullPopulate = helper.getFullPopulateObject("api::award.award", 4);

    const relations = {
      award_header: fullPopulate.populate.award_header,
      image: true,
      nominees: {
        populate: {
          entry: {
            populate: {
              logo: true,
              category: { select: ["id"] },
              region: { select: ["id"] },
            },
          },
        },
      },
      winners: {
        populate: {
          entry: {
            populate: {
              logo: true,
              category: { select: ["id"] },
              region: { select: ["id"] },
            },
          },
        },
      },
      content: fullPopulate.populate.content,
    };

    // get data from database
    const result = await strapi.db.query("api::award.award").findOne({
      select: columns,
      where,
      populate: relations,
    });

    // modify data after database query
    if (!result) {
      return ctx.response.notFound();
    }

    // remove unnecessary image info
    if (result.image && result.image.url) {
      result.image = result.image.url;
    }

    // remove info from winners and nominees
    result.nominees.map(cleanNominee);
    result.winners.map(cleanNominee);

    // award_header
    result.award_header = createAwardHeader(
      result.award_header ? result.award_header : null
    );

    // rename component to match vue component names
    result.content.map((component) => {
      component.__component = component.__component.split(".")[1];
      return component;
    });

    return result;
  },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

function createAwardHeader(award_header) {
  let result = null;
  if (
    award_header &&
    award_header["title"] &&
    award_header["image"] &&
    award_header["logo"]
  ) {
    result = {
      title: award_header["title"],
      image: award_header["image"] ? award_header["image"].url : null,
      logo: award_header["logo"] ? award_header["logo"].url : null,
    };
  }

  return result;
}
