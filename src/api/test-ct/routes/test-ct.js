'use strict';

/**
 * test-ct router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::test-ct.test-ct');
