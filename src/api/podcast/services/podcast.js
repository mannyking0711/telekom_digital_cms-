'use strict';

const helper = require("../../helper");
/**
 * podcast service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const uid = 'api::podcast.podcast';

module.exports = createCoreService(uid, ({strapi}) => ({
  async getEntity(id) {
    const result = await strapi.db.query(uid).findOne({
      where: {id: id},
      populate: {
        'podcast_group': {
          select : ['id', 'slug_de', 'slug_en']
        },
      },
    });

    result.group_en = result.podcast_group.slug_en;
    result.group_de = result.podcast_group.slug_de;

    return result;
  }
}));
