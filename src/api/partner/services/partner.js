'use strict';

/**
 * partner service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const uid = 'api::partner.partner';

module.exports = createCoreService(uid, ({strapi}) => ({
  async getEntity(id) {
    return await strapi.db.query(uid).findOne(id);
  }
}));
