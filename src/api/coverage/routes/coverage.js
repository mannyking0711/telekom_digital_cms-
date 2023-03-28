'use strict';

/**
 * coverage router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::coverage.coverage');