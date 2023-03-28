/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	INCLUDES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

var dateFormat = require("dateformat");
var slugify = require("slugify");
var crypto = require("crypto");
const { isEmpty, merge, isArray } = require("lodash/fp");
const { ValidationError } = require("@strapi/utils").errors;
const {Client} = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: process.env.ES_NODE,
  // cloud: {
  //   id: 'digitalX:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQwMjFmYzU4MGZmOGI0MTRiYjRmYzU3ZjE3NTcyZmE2MiQ4ZDBiZTJjZDE2MTU0MWM1YTdmOTA3OTdkOWRmYTk4Mg=='
  // },
  // auth: {
  //   username: 'elastic',
  //   password: 'miss'
  // }
});

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

//
module.exports = {
  /////////////////////////////////
  // LANG
  /////////////////////////////////
  elasticClient,

  /////////////////////////////////
  // LANG
  /////////////////////////////////

  getLang(ctx) {
    var lang = ctx.request.headers["accept-language"];
    return lang && lang.length > 1 ? lang.substring(0, 2) : "de";
  },

  /////////////////////////////////
  // OUTPUT
  /////////////////////////////////

  defaultOutputFormat(entity) {
    if (!entity) {
      return;
    }

    // add highres image for article
    if (entity.img_detail) {
      if (entity.img_detail.formats.medium) {
        entity.img_highlight = entity.img_detail.formats.medium.url;
      } else if (entity.img_detail.formats.large) {
        entity.img_highlight = entity.img_detail.formats.large.url;
      } else {
        entity.img_highlight = entity.img_detail.url;
      }
    }

    // correct format for puplished data
    if (entity.published) {
      var date = Date.parse(entity.published);
      entity.timestamp = date;
      entity.published = dateFormat(date, "dd.mm.yyyy");
    }

    // convert string of tags to array
    if (entity.tags) {
      entity.tags = entity.tags.split(",").map((i) => i.trim());
    } else {
      entity.tags = [];
    }

    // modify img_list property to send url only
    if (entity.img_list) {
      entity.img_list = entity.img_list.url;
    }

    // modify img_detail property to send url only
    if (entity.img_detail) {
      entity.img_detail = entity.img_detail.url;
    }

    // [WORKAROUND] no private properties
    // delete entity.created_by;
    // delete entity.updated_by;
    // delete entity.created_at;
    // delete entity.updated_at;
  },

  updateLanguage(item, property, lang) {
    item[property] = item[property + "_" + lang];
    delete item[property + "_de"];
    delete item[property + "_en"];
  },

  /**
   * Provides a small sized partner object suitable for logo lists.
   */
  formatPartner(partner) {
    // delete unused properties
    Object.keys(partner).forEach((key) => {
      if (
        !["id", "name", "slug_de", "slug_en", "logo", "use_detail"].includes(
          key
        )
      ) {
        delete partner[key];
      }
    });

    // set logo property to be only the url
    if (partner.logo && partner.logo.url) {
      partner.logo = partner.logo.url;
    }

    return partner;
  },

  /**
   * Provides a medium sized partner object suitable for a map.
   */
  async formatPartnerMedium(partner, lang) {
    let result = {
      id: partner.id,
      name: partner.name,
      slug_de: partner.slug_de,
      slug_en: partner.slug_en,
      logo: null,
      use_detail: partner.use_detail,
      brandhouse_name: partner.brandhouse_name,
      brandhouse_address: partner.brandhouse_address,
      brandhouse_link: partner.brandhouse_link,
      brandhouse_longitude: partner.brandhouse_longitude,
      brandhouse_latitude: partner.brandhouse_latitude,
      brandhouse_image: null,
      megatrends: null,
      quarter: null,
      map_private_customer: null,
      map_type: null,
      map_name: null,
      map_description: null,
    };

    // logo
    if (partner.logo && partner.logo.url) {
      result.logo = partner.logo.url;
    }

    // brandhouse image
    if (partner.img_detail2 && partner.img_detail2.url) {
      result.brandhouse_image = partner.img_detail2.url;
    }

    // megatrends and quarter
    const fullPopulate = this.getFullPopulateObject(
      "api::partner.partner",
      4
    );
    let partnerDetail = await strapi.db.query("api::partner.partner").findOne({
      where: { locale: lang, id: partner.id },
      populate: {
        partner_megatrends: fullPopulate.populate.partner_megatrends,
        partner_quarter: fullPopulate.populate.partner_quarter,
      },
      select: ['id']
    });
    if (partnerDetail) {
      result.megatrends = this.formatPartnerMegatrends(
        partnerDetail.partner_megatrends
          ? partnerDetail.partner_megatrends
          : null,
        lang
      );
      result.quarter = this.formatPartnerQuarter(
        partnerDetail.partner_quarter ? partnerDetail.partner_quarter : null,
        lang
      );
    }

    result.map_private_customer =
      partner.map_private_customer !== null
        ? partner.map_private_customer
        : true;

    // map_type
    // '' => Standard
    // 'X' => Highlight
    // 'A' => Akkreditierung
    // 'T' => Testzentrum
    // 'B' => Buehne
    if (partner.map_type === "Highlight") {
      result.map_type = "X";
    } else if (partner.map_type === "Akkreditierung") {
      result.map_type = "A";
    } else if (partner.map_type === "Testzentrum") {
      result.map_type = "T";
    } else if (partner.map_type === "Buehne") {
      result.map_type = "B";
    } else {
      result.map_type = "";
    }

    result.map_name = partner[`map_name`];
    result.map_description = partner[`map_description`];

    return result;
  },

  /**
   * Provides a medium sized location object suitable for a map.
   * The object will look like a partner.
   * Only difference: slug_de and slug_en are null.
   */
  async formatMapLocationMedium(location, lang) {
    let result = {
      id: location.id,
      name: location.name,
      slug_de: null,
      slug_en: null,
      logo: null,
      use_detail: true,
      brandhouse_name: location.name,
      brandhouse_address: location.address,
      brandhouse_link: location.link,
      brandhouse_longitude: location.longitude,
      brandhouse_latitude: location.latitude,
      brandhouse_image: null,
      megatrends: null,
      quarter: null,
      map_private_customer: null,
      map_type: null,
      map_name: null,
      map_description: null,
    };

    // brandhouse image
    if (location.image && location.image.url) {
      result.brandhouse_image = location.image.url;
    }

    // quarter

    const fullPopulate = this.getFullPopulateObject(
      "api::map-location.map-location",
      4
    );
    let locationDetail = await strapi.db.query("api::map-location.map-location").findOne({
      where: { locale: lang, id: location.id },
      populate: {
        quarter: fullPopulate.populate.quarter,
      },
      select: ['id']
    });

    if (locationDetail) {
      result.quarter = this.formatPartnerQuarter(
        locationDetail.quarter ? locationDetail.quarter : null,
        lang
      );
    }


    result.map_private_customer =
      location.private_customer !== null ? location.private_customer : true;

    // map_type
    // '' => Standard
    // 'X' => Highlight
    // 'A' => Akkreditierung
    // 'T' => Testzentrum
    // 'B' => Buehne
    if (location.type === "Highlight") {
      result.map_type = "X";
    } else if (location.type === "Akkreditierung") {
      result.map_type = "A";
    } else if (location.type === "Testzentrum") {
      result.map_type = "T";
    } else if (location.type === "Buehne") {
      result.map_type = "B";
    } else {
      result.map_type = "";
    }

    result.map_name = location[`name`];
    result.map_description = location[`description`];

    return result;
  },

  formatPartnerMegatrends(partnerMegatrends, lang) {
    let result = null;
    if (
      partnerMegatrends &&
      partnerMegatrends.megatrends &&
      partnerMegatrends.megatrends.length > 0
    ) {
      result = [];
      partnerMegatrends.megatrends.forEach((item) => {
        result.push({
          id: item["id"],
          name: item["name"],
          icon: item.icon && item.icon.url ? item.icon.url : null,
        });
      });
    }

    return result;
  },

  formatPartnerQuarter(partnerQuarter, lang) {
    let result = null;
    if (partnerQuarter && partnerQuarter.quarter) {
      result = {
        id: partnerQuarter.quarter.id,
        name: partnerQuarter.quarter["name"],
        color: partnerQuarter.quarter.color,
      };
    }

    return result;
  },

  formatDate(entity, label) {
    const date = Date.parse(entity[label]);

    entity[label + "_timestamp"] = date;
    entity[label] = dateFormat(date, "dd.mm.yyyy");
  },

  /**
   * Formatter for components_content_card_items
   */
  formatCardItems(items) {
    return items.map((item) => {
      item.title = item[`title`];
      item.text = item[`text`];
      if (item[`image`] && item[`image`].url) {
        item.image = item[`image`].url;
      }
      item.button = item[`button`];
      item.url = item[`url`];

      return item;
    });
  },

  /**
   * Formatter for components_content_slider_quotes_quote
   */
  formatContentQuoteItems(items) {
    return items && items.length
      ? items.map((item) => {
        return {
          name: item.name,
          description: item.description,
          quote: item.quote,
          image: item.image && item.image.url ? item.image.url : null,
        };
      })
      : null;
  },

  /**
   * Formatter for components_content_title_text_items
   */
  formatTitleTextItems(items, ctx) {
    var lang = this.getLang(ctx);

    return items.map((item) => {
      item.title = item[`title_${lang}`];
      item.text = item[`text_${lang}`];

      delete item.title_de;
      delete item.title_en;
      delete item.text_de;
      delete item.text_en;

      return item;
    });
  },

  /////////////////////////////////
  // SLUGIFY
  /////////////////////////////////

  // Generate slugs by removing and replacing special chars.
  // Try to use the user suplied value for the slug generation.
  // If the user hasn't supplied a slug, try to use a specific attribute of the model
  // e.g. the title. otherwise fall back to a random string.
  createSlugs(item, locale, attribute = "title") {
    let raw_slug =
      item["slug_" + locale] ||
      item[attribute] ||
      crypto.randomBytes(12).toString("hex");
    item["slug_" + locale] = slugify(raw_slug, {
      strict: true,
      lower: true,
      locale,
    });
  },

  async getBeforeUpdateLocale(id, api) {
    const entity = await strapi.service(api).findOne(id);

    if (entity === null) {
      return null;
    }

    return entity.locale;
  },

  async validateRelation({ uid, id = null, field, data, message }) {

    if (data && !data.connect) return

    if (data && data.connect.length > 0) return

    if (!id) {
      throw new ValidationError(message);
    }

    const entity = await strapi.db.query(uid).findOne({ where: { id }, populate: [field] });

    const oldRelData = entity[field]

    if (!oldRelData) {
      throw new ValidationError(message);
    }

    let processedArr = isArray(oldRelData) ? oldRelData : [oldRelData]

    if (data && data.disconnect.length > 0) {
      processedArr = processedArr.filter(i => !data.disconnect.map(d => d.id).includes(i.id))
    }

    if (processedArr.length === 0) {
      throw new ValidationError(message);
    }

  },

  getModelPopulationAttributes(model) {
    if (model.uid === "plugin::upload.file") {
      const { related, ...attributes } = model.attributes;
      return attributes;
    }

    return model.attributes;
  },

  getFullPopulateObject(modelUid, maxDepth = 20) {
    if (maxDepth <= 1) {
      return true;
    }
    if (modelUid === "admin::user") {
      return undefined;
    }

    const populate = {};
    const model = strapi.getModel(modelUid);
    for (const [key, value] of Object.entries(
      this.getModelPopulationAttributes(model)
    )) {
      if (value) {
        if (value.type === "component") {
          populate[key] = this.getFullPopulateObject(
            value.component,
            maxDepth - 1
          );
        } else if (value.type === "dynamiczone") {
          const dynamicPopulate = value.components.reduce((prev, cur) => {
            const curPopulate = this.getFullPopulateObject(cur, maxDepth - 1);
            return curPopulate === true ? prev : merge(prev, curPopulate);
          }, {});
          populate[key] = isEmpty(dynamicPopulate) ? true : dynamicPopulate;
        } else if (value.type === "relation") {
          const relationPopulate = this.getFullPopulateObject(
            value.target,
            maxDepth - 1
          );
          if (relationPopulate) {
            populate[key] = relationPopulate;
          }
        } else if (value.type === "media") {
          populate[key] = true;
        }
      }
    }
    return isEmpty(populate) ? true : { populate };
  },
};
