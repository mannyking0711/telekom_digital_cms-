'use strict';

/**
 * digi-index-sector service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const uid = 'api::digi-index-sector.digi-index-sector';

module.exports = createCoreService(uid, ({strapi}) => ({
  async getEntity(id) {
    return await strapi.db.query(uid).findOne(id);
  }
}));
