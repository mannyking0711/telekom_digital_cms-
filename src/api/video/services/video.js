'use strict';

/**
 * video service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const uid = 'api::video.video';

module.exports = createCoreService(uid, ({strapi}) => ({
  async getEntity(id) {
    const result = await strapi.db.query(uid).findOne({
      where: {id: id},
      populate: {
        'videos_group': {
          select : ['id', 'slug_de', 'slug_en']
        },
      },
    });

    result.group_en = result.videos_group.slug_en;
    result.group_de = result.videos_group.slug_de;

    return result;
  }
}));
