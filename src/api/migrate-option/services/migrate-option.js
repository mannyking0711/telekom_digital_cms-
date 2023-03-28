'use strict';

/**
 * migrate-option service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::migrate-option.migrate-option');
