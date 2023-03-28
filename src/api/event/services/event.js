"use strict";

/**
 * event service
 */

const { createCoreService } = require("@strapi/strapi").factories;

const helper = require("../../helper");
const _ = require("lodash");

module.exports = createCoreService("api::event.event", ({ strapi }) => ({
  async findCurrentEvent() {
    return await strapi.db
      .query("api::event.event")
      .findOne({ where: { status: "published" } });
  },

  async findCurrentEventPartners() {
    let result = {
      partner_focus: [],
      partners_media: [],
      partners_digitalization: [],
      partners_mobility: [],
      partners_support: [],
      partners_regular: [],
      partners_premium: [],
      partners_coop: [],
      partners_startup: [],
      partners_partner: [],
    };

    const eventPage = await strapi.db.query("api::event.event").findOne({
      where: { status: "published" },
      populate: {
        partner_focus: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_media: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_digitalization: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_mobility: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_support: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_regular: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_premium: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_coop: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_startup: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
        partners_partner: {
          populate: {
            partners: {
                populate: {logo: true}
            },
          },
        },
      },
    });

    if (eventPage.partner_focus && eventPage.partner_focus.partners) {
      result.partner_focus = eventPage.partner_focus.partners.map(
        helper.formatPartner
      );
      result.partner_focus = _.sortBy(result.partner_focus, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_media && eventPage.partners_media.partners) {
      result.partners_media = eventPage.partners_media.partners.map(
        helper.formatPartner
      );
      result.partners_media = _.sortBy(result.partners_media, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (
      eventPage.partners_digitalization &&
      eventPage.partners_digitalization.partners
    ) {
      result.partners_digitalization =
        eventPage.partners_digitalization.partners.map(helper.formatPartner);
      result.partners_digitalization = _.sortBy(
        result.partners_digitalization,
        [(partner) => partner.name.toLowerCase()]
      );
    }

    if (eventPage.partners_mobility && eventPage.partners_mobility.partners) {
      result.partners_mobility = eventPage.partners_mobility.partners.map(
        helper.formatPartner
      );
      result.partners_mobility = _.sortBy(result.partners_mobility, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_support && eventPage.partners_support.partners) {
      result.partners_support = eventPage.partners_support.partners.map(
        helper.formatPartner
      );
      result.partners_support = _.sortBy(result.partners_support, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_regular && eventPage.partners_regular.partners) {
      result.partners_regular = eventPage.partners_regular.partners.map(
        helper.formatPartner
      );
      result.partners_regular = _.sortBy(result.partners_regular, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_premium && eventPage.partners_premium.partners) {
      result.partners_premium = eventPage.partners_premium.partners.map(
        helper.formatPartner
      );
      result.partners_premium = _.sortBy(result.partners_premium, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_coop && eventPage.partners_coop.partners) {
      result.partners_coop = eventPage.partners_coop.partners.map(
        helper.formatPartner
      );
      result.partners_coop = _.sortBy(result.partners_coop, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_startup && eventPage.partners_startup.partners) {
      result.partners_startup = eventPage.partners_startup.partners.map(
        helper.formatPartner
      );
      result.partners_startup = _.sortBy(result.partners_startup, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    if (eventPage.partners_partner && eventPage.partners_partner.partners) {
      result.partners_partner = eventPage.partners_partner.partners.map(
        helper.formatPartner
      );
      result.partners_partner = _.sortBy(result.partners_partner, [
        (partner) => partner.name.toLowerCase(),
      ]);
    }

    return result;
  },

  async findCurrentEventStreams(lang) {
    let streams = [];

    const fullPopulate = helper.getFullPopulateObject("api::event.event", 4);
    let results = await strapi.db.query('api::event.event').findMany({
      select: ['id', 'start'],
      where: {
        status: 'published',
        title: {
          $notNull: true,
          $ne: "",
        },
        locale: lang,
      },
      orderBy: { start: "ASC" },
      limit: 1,
      populate: {
        streams: fullPopulate.populate.streams
      }
    })

    if (!results || !results[0]?.streams) {
      return null;
    }

    results[0].streams.forEach(stream => {
      if (stream.active) {
        streams.push({
          id: stream.id,
          name: stream[`name`],
          uuid: stream[`uuid`],
          uuid_accessibility: stream[`uuid_accessibility`],
          image: stream[`image`] && stream[`image`].url ? stream[`image`].url : null,
        })
      }
    })

    return streams ? streams : null;
  },
  async findCurrentEventPartnersMedium(lang) {
    let result = {
      partner_focus: [],
      partners_media: [],
      partners_digitalization: [],
      partners_mobility: [],
      partners_support: [],
      partners_regular: [],
      partners_premium: [],
      partners_coop: [],
      partners_startup: [],
      partners_partner: [],
    };

    const fullPopulate = helper.getFullPopulateObject("api::event.event", 4);
    const eventPage = await strapi.db.query('api::event.event').findOne({where: {status: 'published', locale: lang}, populate: fullPopulate.populate});

    if (eventPage.partner_focus && eventPage.partner_focus.partners) {
      result.partner_focus = await Promise.all(eventPage.partner_focus.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partner_focus = _.sortBy(result.partner_focus, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_media && eventPage.partners_media.partners) {
      result.partners_media = await Promise.all(eventPage.partners_media.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_media = _.sortBy(result.partners_media, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_digitalization && eventPage.partners_digitalization.partners) {
      result.partners_digitalization = await Promise.all(eventPage.partners_digitalization.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_digitalization = _.sortBy(result.partners_digitalization, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_mobility && eventPage.partners_mobility.partners) {
      result.partners_mobility = await Promise.all(eventPage.partners_mobility.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_mobility = _.sortBy(result.partners_mobility, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_support && eventPage.partners_support.partners) {
      result.partners_support = await Promise.all(eventPage.partners_support.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_support = _.sortBy(result.partners_support, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_regular && eventPage.partners_regular.partners) {
      result.partners_regular = await Promise.all(eventPage.partners_regular.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_regular = _.sortBy(result.partners_regular, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_premium && eventPage.partners_premium.partners) {
      result.partners_premium = await Promise.all(eventPage.partners_premium.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_premium = _.sortBy(result.partners_premium, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_coop && eventPage.partners_coop.partners) {
      result.partners_coop = await Promise.all(eventPage.partners_coop.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_coop = _.sortBy(result.partners_coop, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_startup && eventPage.partners_startup.partners) {
      result.partners_startup = await Promise.all(eventPage.partners_startup.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_startup = _.sortBy(result.partners_startup, [partner => partner.name.toLowerCase()]);
    }

    if (eventPage.partners_partner && eventPage.partners_partner.partners) {
      result.partners_partner = await Promise.all(eventPage.partners_partner.partners.map(async partner => helper.formatPartnerMedium(partner, lang)));
      result.partners_partner = _.sortBy(result.partners_partner, [partner => partner.name.toLowerCase()]);
    }

    return result;
  },

  async findCurrentEventLocationsMedium(lang) {
    let result = [];

    const fullPopulate = helper.getFullPopulateObject("api::event.event", 4);
    const eventPage = await strapi.db.query('api::event.event').findOne({where: {status: 'published', locale: lang}, populate: {
      map_locations: fullPopulate.populate.map_locations
    }});

    // console.log(eventPage.map_locations);
    if (eventPage.map_locations && eventPage.map_locations.items) {
      result.map_locations = await Promise.all(eventPage.map_locations.items.map(async location => await helper.formatMapLocationMedium(location, lang)));
      // result.map_locations = _.sortBy(result.map_locations, [location => location.name.toLowerCase()]);
    }

    return result;
  },

}));
