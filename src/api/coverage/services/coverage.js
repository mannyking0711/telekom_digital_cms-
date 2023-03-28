'use strict';

/**
 * coverage service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::coverage.coverage');