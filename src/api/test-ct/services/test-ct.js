'use strict';

/**
 * test-ct service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::test-ct.test-ct');
