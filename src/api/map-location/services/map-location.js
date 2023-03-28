'use strict';

/**
 * map-location service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::map-location.map-location');