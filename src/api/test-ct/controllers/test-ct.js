'use strict';

/**
 * test-ct controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::test-ct.test-ct');
