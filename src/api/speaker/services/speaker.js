'use strict';

/**
 * speaker service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const uid = 'api::speaker.speaker';

module.exports = createCoreService(uid, ({strapi}) => ({
  async getEntity(id) {
    return await strapi.db.query(uid).findOne(id);
  }
}));
